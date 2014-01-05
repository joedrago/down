resources = require 'resources'
Brain = require 'brain/brain'
Pathfinder = require 'world/pathfinder'
Tilesheet = require 'gfx/tilesheet'

class Player extends Brain
  constructor: (data) ->
    for k,v of data
      this[k] = v
    super resources.tilesheets.player, resources.tilesheets.player.idle0

  walkPath: (@path) ->

  think: ->
    cc.modes.game.updateVisibility()
    if @takeStep()
      @cd = 50
    else
      loc = cc.modes.game.currentCell(@x, @y)
      if loc.exit?
        cc.modes.game.switchFloor(loc.exit)

  act: (gx, gy) ->
    pathfinder = new Pathfinder(cc.modes.game.currentFloor(), 0)
    path = pathfinder.calc(@x, @y, gx, gy)
    @walkPath(path)
    cc.log "path is #{path.length} long"

module.exports = Player
