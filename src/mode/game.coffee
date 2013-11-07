Mode = require 'base/mode'
resources = require 'resources'

class GameMode extends Mode
  constructor: ->
    super("Game")
    @sprite = cc.Sprite.create resources.splashscreen
    @sprite.setPosition(cc.p(cc.width / 2, cc.height / 2))
    @add @sprite

  onClick: (x, y) ->
    cc.log "game click #{x}, #{y}"

module.exports = GameMode
