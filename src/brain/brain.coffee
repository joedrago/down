class Brain
  constructor: (@tiles, @animFrame) ->
    @facingRight = true
    @cd = 0
    @interpFrames = []
    @path = []

  move: (gx, gy, frames) ->
    @interpFrames = []
    dx = (@x - gx) * cc.unitSize
    dy = (@y - gy) * cc.unitSize
    @facingRight = (dx < 0)
    i = frames.length
    for f in frames
      animFrame = {
        x: dx * i / frames.length
        y: dy * i / frames.length
        animFrame: f
      }
      @interpFrames.push animFrame
      i--

    cc.modes.game.setTurnFrames(frames.length)

    # Immediately move, only pretend to animate there over the next frames.length frames
    @x = gx
    @y = gy

  walkPath: (@path) ->

  createSprite: ->
    s = @tiles.createSprite @animFrame, 0, 0
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
    # else
    #   animFrame = Math.floor(Math.random() * 2)
    sprite.setTextureRect(animFrame)
    sprite.setPosition(cc.p(x, y))
    sprite.setFlipX(!@facingRight)

  takeStep: ->
    if @interpFrames.length == 0
      if @path.length > 0
        step = @path.splice(0, 1)[0]
        # cc.log "taking step to #{step.x}, #{step.y}"
        @move(step.x, step.y, @tiles.walk)
        return true
    return false

  tick: (elapsedTurns) ->
    if @cd > 0
      @cd -= elapsedTurns if @cd > 0
      @cd = 0 if @cd < 0
    if @cd == 0
      @think()

  think: ->
    cc.log "think not implemented!"

module.exports = Brain
