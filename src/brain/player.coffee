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
    if @takeStep()
      @cd = 50

  act: (gx, gy) ->
    pathfinder = new Pathfinder(cc.game.currentFloor(), 0)
    path = pathfinder.calc(@x, @y, gx, gy)
    @walkPath(path)
    cc.log "path is #{path.length} long"

module.exports = Player
