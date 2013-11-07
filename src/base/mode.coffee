InputLayer = cc.Layer.extend {
  init: (@mode) ->
    @_super()
    @setTouchEnabled(true)

  onTouchesBegan: (touches, event) ->
    if touches
      x = touches[0].getLocation().x
      y = touches[0].getLocation().y
      @mode.onClick x, y
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

  activate: ->
    cc.log "activating mode #{@name}"
    cc.Director.getInstance().replaceScene(@scene)

  add: (obj) ->
    @scene.gfx.addChild(obj)

  # to be overridden by derived Modes
  onActivate: ->
  onClick: (x, y) ->

module.exports = Mode
