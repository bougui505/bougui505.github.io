from chimera import openModels, runCommand

# Open the PDB entry and hide all but the first model
#import sys
#mList = openModels.open(sys.argv[1], type="PDB")
#mList = openModels.list()
#if len(mList) > 1:
#	openModels.close(mList[1:])
#m = mList[0]

# Apply interactive preset 1 (ribbons + active site)
#runCommand("preset apply i 1")

# Save current position and setup viewing parameters
runCommand("savepos globeview")
runCommand("cofr view")

# Generate views in spherical coordinates
inclinationStep = 10		# 10 degree increments is acceptable
azimuthStep = 10
#inclinationStep = 90		# 90 degree interval should get us 3 layers
#azimuthStep = 90		# .. with 4 images per layer (for testing)
for inclination in range(0, 181, inclinationStep):	# Need 180
	for azimuth in range(0, 360, azimuthStep):	# Don't need 360
		runCommand("reset globeview")
		runCommand("turn y %d ; wait" % azimuth)
		runCommand("turn x %d ; wait" % (90 - inclination))
		runCommand("copy file img-%03d-%03d.png supersample 1"
						% (inclination, azimuth))

# Done
#runCommand("close session")
#runCommand("stop really")
