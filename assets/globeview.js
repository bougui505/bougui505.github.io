// Map screen coordinates to [-1,1]
function map(coord, size)
{
	return (coord / size) * 2.0 - 1.0;
}

function unmap(mc, size)
{
	c = Math.round((mc + 1.0) / 2.0 * size);
	return c + "px";
}

//
// IE vs FF Javascript incompatibilities
//
function monitorEvent(el, name, func)
{
	if (el.attachEvent)
		el.attachEvent("on" + name, func);
	else
		el.addEventListener(name, func, false);
}

function unmonitorEvent(el, name, func)
{
	if (el.detachEvent)
		el.detachEvent("on" + name, func);
	else
		el.removeEventListener(name, func, false);
}

//
// Degree-radian conversion
//
function degrees(r)
{
	return r / Math.PI * 180;
}

//
// Image parameters
//
var inclinationStep = 0;
var azimuthStep = 0;
var numImages = 0;

//
// Selector for nearest angle
//
function nearestInclination(d)
{
	return Math.round(d / inclinationStep) * inclinationStep;
}

function nearestAzimuth(d)
{
	var a = Math.round(d / azimuthStep) * azimuthStep;
	if (a < 0)
		a += 360;
	else if (a >= 360)
		a -= 360;
	return a;
}

function combine(e, a)
{
	return e + '-' + a;
}

var image = null;
var globe = null;
var text = null;
var verbose = true;
var debug = false;
var debugText = null;
var modelName = null;
var imageObjs = new Array();
var globeObjs = new Array();

var mouseX = 0;
var mouseY = 0;
var phi = Math.PI / 2;
var theta = 0.0;
var azimuth = 0.0;
var inclination = 90.0;

function debugPrint(s)
{
	if (debugText == null)
		return;
	debugText.firstChild.nodeValue = s;
}

function report(s)
{
	text.firstChild.nodeValue = s;
}

function manipulate(x, y)
{
	var dx = x - mouseX;
	var dy = y - mouseY;

	// Vertical movement changes inclination
	var newPhi = phi - dy * Math.PI / 2;
	if (newPhi < 0)
		phi = 0;
	else if (newPhi > Math.PI)
		phi = Math.PI;
	else
		phi = newPhi;
	// Horizontal movement changes azimuth
	var newTheta = theta + dx * Math.PI / 2;
	if (newTheta > Math.PI * 2)
		theta = newTheta - Math.PI * 2;
	else if (newTheta < 0)
		theta = newTheta + Math.PI * 2;
	else
		theta = newTheta;
	selectView(false);

	// Record new current mouse position
	mouseX = x;
	mouseY = y;
}

function drag(evt)
{
	if (evt.preventDefault)
		evt.preventDefault();
	var x = map(evt.clientX, image.width);
	var y = map(evt.clientY, image.height);
	manipulate(x, y);
	return false;
}

function press(evt)
{
	if (evt.preventDefault)
		evt.preventDefault();
	monitorEvent(image, "mousemove", drag);
	mouseX = map(evt.clientX, image.width);
	mouseY = map(evt.clientY, image.height);
	return false;
}

function release(evt)
{
	if (evt.preventDefault)
		evt.preventDefault();
	unmonitorEvent(image, "mousemove", drag);
	return false;
}

function selectView(force)
{
	// If view has not changed, image should not change
	var newInclination = nearestInclination(degrees(phi));
	var newAzimuth = nearestAzimuth(degrees(theta));
	if (!force && newInclination == inclination && newAzimuth == azimuth)
		return;
	inclination = newInclination;
	azimuth = newAzimuth;

	// Find new image for current view
	key = combine(inclination, azimuth);
	image.src = imageObjs[key].src;
	globe.src = globeObjs[key].src;
	debugPrint("filename: " + imageObjs[key].src + " phi: " + degrees(phi)
			+ " theta: " + degrees(theta))
}

var stillRunning = 0;
var numLoaded = 0;
var startLoad = null;

function ImageLoader(startInclination, endInclination)
{
	this.endInclination = endInclination;
	this.inclination = startInclination;
	this.azimuth = 0;
	this.target = this;
	this.loadNext = loadNext;
}

function loadNext() {
	var self = this.target;
	if (self.inclination < 0) {
		stillRunning -= 1;
		if (stillRunning == 0) {
			selectView(true);
			monitorEvent(image, "mousedown", press);
			monitorEvent(image, "mouseup", release);
			monitorEvent(image, "click", release);
			globe.style.visibility = "visible";
			text.style.visibility = "hidden";
			text.style.display = "none";
			var d = new Date();
			debugPrint("Loading time: "
					+ ((d.getTime() - startLoad) / 1000.0)
					+ " seconds.")
			return;
		}
	}
	numLoaded += 1;
	var percentage = numLoaded / numImages * 100;
	var filename = "img-" + zeropad(self.inclination) + "-"
			+ zeropad(self.azimuth) + ".png";
	var key = combine(self.inclination, self.azimuth);
	self.azimuth += 10;
	if (self.azimuth >= 360) {
		self.azimuth = 0;
		self.inclination += 10;
		if (self.inclination >= self.endInclination)
			self.inclination = -1;
	}
	report("Loading...  " + percentage.toFixed(0)
			+ "% complete.  Please wait.");
	imageObjs[key] = new Image();
	globeObjs[key] = new Image();
	imageObjs[key].onload = loadNext;
	imageObjs[key].target = self;
	imageObjs[key].src = modelName + "/" + filename;
	globeObjs[key].src = "globe/" + filename;
}

function zeropad(n)
{
	var padded = n + "";
	while (padded.length < 3)
		padded = "0" + padded;
	return padded;
}

function init(name, v, es, as)
{
	modelName = name;
	verbose = v;
	inclinationStep = es;
	azimuthStep = as;
	numImages = (180 / es + 1) * (360 / as);
	image = document.getElementById("main");
	globe = document.getElementById("globe");
	text = document.getElementById("text");
	if (verbose) {
		text.style.visibility = "visible";
		text.style.display = "";
	}
	if (debug) {
		debugText = document.getElementById("debug");
		debugText.style.visibility = "visible";
		debugText.style.display = "";
	}
	// Image name below needs to match initial phi/theta values
	image.src = name + "/img-090-000.png";

	stillRunning = 0;
	var loaders = new Array();
	var intermediates = [ 90 ];
	var startAngle = 0;
	for (var i = 0; i < intermediates.length; i += 1) {
		var angle = intermediates[i];
		loaders[stillRunning] = new ImageLoader(startAngle, angle);
		startAngle = angle;
		stillRunning += 1;
	}
	loaders[stillRunning] = new ImageLoader(startAngle, 181);
	stillRunning += 1;

	var d = new Date();
	startLoad = d.getTime();
	for (var i = 0; i < loaders.length; i += 1) {
		loaders[i].loadNext();
	}
}
