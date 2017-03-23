from math import pi, sin, cos

Radius = 100.0
Steps = 72
NLongitudes = 10
NLatitudes = 4

def main():
	color("green")
	makeLongitudes()
	color("yellow")
	makeLatitudes()

def makeLongitudes():
	for i in range(NLongitudes):
		first = None
		theta = i * (2 * pi / NLongitudes)
		sint = sin(theta)
		cost = cos(theta)
		for s in range(Steps):
			phi = s * (2 * pi / Steps)
			r = sin(phi) * Radius
			y = cos(phi) * Radius
			x = r * sint
			z = r * cost
			if first is None:
				first = (x, y, z)
				move(x, y, z)
			else:
				draw(x, y, z)
		draw(*first)

def makeLatitudes():
	for i in range(NLatitudes):
		first = None
		phi = (i + 1) * (pi / (NLatitudes + 1))
		y = cos(phi) * Radius
		r = sin(phi) * Radius
		for s in range(Steps):
			theta = s * (2 * pi / Steps)
			x = r * sin(theta)
			z = r * cos(theta)
			if first is None:
				first = (x, y, z)
				move(x, y, z)
			else:
				draw(x, y, z)
		draw(*first)

def color(c):
	print ".color", c
def move(x, y, z):
	print ".m ", x, y, z
def draw(x, y, z):
	print ".d ", x, y, z

main()
