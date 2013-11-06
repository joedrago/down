gfx = require 'gfx'
resources = require 'resources'

class IntroLayer extends gfx.Layer
  constructor: ->
    super()
    @setTouchEnabled(true)

  onTouchesBegan: (touches, event) ->
    if touches
      x = touches[0].getLocation().x
      y = touches[0].getLocation().y
      cc.log "touch intro layer at #{x}, #{y}"
      cc.Director.getInstance().replaceScene(cc.game.scenes.game)

class IntroScene extends gfx.Scene
  constructor: ->
    super()
    layer = new IntroLayer()
    @addChild(layer)

    size = cc.Director.getInstance().getWinSize()
    @sprite = cc.Sprite.create resources.splashscreen
    @sprite.setPosition(cc.p(size.width / 2, size.height / 2))
    layer.addChild(@sprite, 0)

module.exports = IntroScene
