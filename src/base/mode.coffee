# how many pixels can you drag before it is actually considered a drag
ENGAGE_DRAG_DISTANCE = 30

InputLayer = cc.Layer.extend {
  init: (@mode) ->
    @_super()
    @setTouchEnabled(true)
    @setMouseEnabled(true)
    @trackedTouches = []

  calcDistance: (x1, y1, x2, y2) ->
    dx = x2 - x1
    dy = y2 - y1
    return Math.sqrt(dx*dx + dy*dy)

  setDragPoint: ->
    @dragX = @trackedTouches[0].x
    @dragY = @trackedTouches[0].y

  calcPinchAnchor: ->
    if @trackedTouches.length >= 2
      @pinchX = Math.floor((@trackedTouches[0].x + @trackedTouches[1].x) / 2)
      @pinchY = Math.floor((@trackedTouches[0].y + @trackedTouches[1].y) / 2)
      # cc.log "pinch anchor set at #{@pinchX}, #{@pinchY}"

  addTouch: (id, x, y) ->
    for t in @trackedTouches
      if t.id == id
        return
    @trackedTouches.push {
      id: id
      x: x
      y: y
    }
    if @trackedTouches.length == 1
      @setDragPoint()
    if @trackedTouches.length == 2
      # We just added a second touch spot. Calculate the anchor for pinching now
      @calcPinchAnchor()
    #cc.log "adding touch #{id}, tracking #{@trackedTouches.length} touches"

  removeTouch: (id, x, y) ->
    index = -1
    for i in [0...@trackedTouches.length]
      if @trackedTouches[i].id == id
        index = i
        break
    if index != -1
      @trackedTouches.splice(index, 1)
      if @trackedTouches.length == 1
        @setDragPoint()
      if index < 2
        # We just forgot one of our pinch touches. Pick a new anchor spot.
        @calcPinchAnchor()
      #cc.log "forgetting id #{id}, tracking #{@trackedTouches.length} touches"

  updateTouch: (id, x, y) ->
    index = -1
    for i in [0...@trackedTouches.length]
      if @trackedTouches[i].id == id
        index = i
        break
    if index != -1
      @trackedTouches[index].x = x
      @trackedTouches[index].y = y

  onTouchesBegan: (touches, event) ->
    if @trackedTouches.length == 0
      @dragging = false
    for t in touches
      pos = t.getLocation()
      @addTouch t.getId(), pos.x, pos.y
    if @trackedTouches.length > 1
      # They're pinching, don't even bother to emit a click
      @dragging = true

  onTouchesMoved: (touches, event) ->
    prevDistance = 0
    if @trackedTouches.length >= 2
      prevDistance = @calcDistance(@trackedTouches[0].x, @trackedTouches[0].y, @trackedTouches[1].x, @trackedTouches[1].y)
    if @trackedTouches.length == 1
      prevX = @trackedTouches[0].x
      prevY = @trackedTouches[0].y

    for t in touches
      pos = t.getLocation()
      @updateTouch(t.getId(), pos.x, pos.y)

    if @trackedTouches.length == 1
      # single touch, consider dragging
      dragDistance = @calcDistance @dragX, @dragY, @trackedTouches[0].x, @trackedTouches[0].y
      if @dragging or (dragDistance > ENGAGE_DRAG_DISTANCE)
        @dragging = true
        if dragDistance > 0.5
          dx = @trackedTouches[0].x - @dragX
          dy = @trackedTouches[0].y - @dragY
          #cc.log "single drag: #{dx}, #{dy}"
          @mode.onDrag(dx, dy)
        @setDragPoint()

    else if @trackedTouches.length >= 2
      # at least two fingers present, check for pinch/zoom
      currDistance = @calcDistance(@trackedTouches[0].x, @trackedTouches[0].y, @trackedTouches[1].x, @trackedTouches[1].y)
      deltaDistance = currDistance - prevDistance
      if deltaDistance != 0
        #cc.log "distance dragged apart: #{deltaDistance} [anchor: #{@pinchX}, #{@pinchY}]"
        @mode.onZoom(@pinchX, @pinchY, deltaDistance)

  onTouchesEnded: (touches, event) ->
    if @trackedTouches.length == 1 and not @dragging
      pos = touches[0].getLocation()
      #cc.log "click at #{pos.x}, #{pos.y}"
      @mode.onClick(pos.x, pos.y)
    for t in touches
      pos = t.getLocation()
      @removeTouch t.getId(), pos.x, pos.y

  onScrollWheel: (ev) ->
    pos = ev.getLocation()
    @mode.onZoom(pos.x, pos.y, ev.getWheelDelta())
}

GfxLayer = cc.Layer.extend {
  init: (@mode) ->
    @_super()
}

ModeScene = cc.Scene.extend {
  init: (@mode) ->
    @_super()

    @input = new InputLayer()
    @input.init(@mode)
    @addChild(@input)

    @gfx = new GfxLayer()
    @gfx.init()
    @addChild(@gfx)

  onEnter: ->
    @_super()
    @mode.onActivate()
}

class Mode
  constructor: (@name) ->
    @scene = new ModeScene()
    @scene.init(this)
    @scene.retain()

  activate: ->
    cc.log "activating mode #{@name}"
    if cc.sawOneScene?
      cc.Director.getInstance().popScene()
    else
      cc.sawOneScene = true
    cc.Director.getInstance().pushScene(@scene)

  add: (obj) ->
    @scene.gfx.addChild(obj)

  remove: (obj) ->
    @scene.gfx.removeChild(obj)

  # to be overridden by derived Modes
  onActivate: ->
  onClick: (x, y) ->
  onZoom: (x, y, delta) ->
  onDrag: (dx, dy) ->

module.exports = Mode
