Mode = require 'base/mode'
resources = require 'resources'

class IntroMode extends Mode
  constructor: ->
    super("Intro")
    @sprite = cc.Sprite.create resources.images.splashscreen
    @sprite.setPosition(cc.p(cc.width / 2, cc.height / 2))
    @add @sprite

  onClick: (x, y) ->
    cc.log "intro click #{x}, #{y}"
    cc.modes.game.activate()

module.exports = IntroMode
