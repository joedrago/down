gfx = require 'gfx'
resources = require 'resources'

class Floor extends gfx.Layer
  constructor: ->
    super()
    size = cc.Director.getInstance().getWinSize()
    @sprite = cc.Sprite.create resources.splashscreen, cc.rect(450,300,16,16)
    @setAnchorPoint(cc.p(0, 0))
    @sprite.setAnchorPoint(cc.p(0, 0))
    @addChild(@sprite, 0)
    @sprite.setPosition(cc.p(0, 0))
    @setPosition(cc.p(100, 100))
    @setScale(10, 10)
    @setTouchEnabled(true)

  onTouchesBegan: (touches, event) ->
    if touches
      x = touches[0].getLocation().x
      y = touches[0].getLocation().y
      cc.log "touch Floor at #{x}, #{y}"

module.exports = Floor
