module.exports =
  # crap nobody should ever have to change
  COCOS2D_DEBUG:2 # 0 to turn debug off, 1 for basic debug, and 2 for full debug
  box2d:false
  chipmunk:false
  showFPS:true
  frameRate:60
  loadExtension:false
  renderMode:0
  tag:'gameCanvas'
  appFiles: [
    'bundle.js'
  ]

  # The size of one unit worth of tile. Pretty much controls all rendering, click handling, etc.
  unitSize: 32

  # zoom in/out bounds. A scale of 1.0 is 1:1 pixel to "design dimensions" (currently 1280x720 view).
  # Scale speed is the denominator for adjusting the current scale. The math:
  # scale += zoomDelta / scale.speed
  # zoomDelta is the distance in pixels added/removed between your fingers on your phone screen.
  # zoomDelta is always 120 or -120 for mousewheels, therefore setting scale.speed
  # to 120 would cause the scale to change by 1.0 for every "notch" on the wheel.
  scale:
    speed: 400
    min: 0.75
    max: 3.0

  zOrder:
    floor: -3
    player: -2
    fog: -1
