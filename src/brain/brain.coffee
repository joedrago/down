class Brain
  constructor: (@tiles, @animFrame) ->
    @cd = 0
    @interpFrames = []
    @path = []

  move: (gx, gy, frames) ->
    @interpFrames = []
    dx = (@x - gx) * cc.unitSize
    dy = (@y - gy) * cc.unitSize
    i = frames.length
    for f in frames
      animFrame = {
        x: dx * i / frames.length
        y: dy * i / frames.length
        animFrame: f
      }
      @interpFrames.push animFrame
      i--

    cc.game.setTurnFrames(frames.length)

    # Immediately move, only pretend to animate there over the next frames.length frames
    @x = gx
    @y = gy

  walkPath: (@path) ->

  createSprite: ->
    s = cc.Sprite.create @tiles.resource
    s.setAnchorPoint(cc.p(0, 0))
    @updateSprite(s)
    return s

  updateSprite: (sprite) ->
    x = @x * cc.unitSize
    y = @y * cc.unitSize
    animFrame = @animFrame
    if @interpFrames.length
      frame = @interpFrames.splice(0, 1)[0]
      x += frame.x
      y += frame.y
      animFrame = frame.animFrame
    sprite.setTextureRect(@tiles.rect(animFrame))
    sprite.setPosition(cc.p(x, y))

  think: (dt, sprite) ->
    if @interpFrames.length == 0
      if @path.length > 0
        step = @path.splice(0, 1)[0]
        # cc.log "taking step to #{step.x}, #{step.y}"
        @move(step.x, step.y, [2,3,4])
    @updateSprite(sprite)

module.exports = Brain
