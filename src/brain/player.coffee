resources = require 'resources'
Brain = require 'brain/brain'
Pathfinder = require 'world/pathfinder'
Tilesheet = require 'gfx/tilesheet'

class Player extends Brain
  constructor: (data) ->
    @animFrame = 0
    for k,v of data
      this[k] = v
    super new Tilesheet(resources.player, 12, 14, 18), @animFrame

  walkPath: (@path) ->

  think: (dt, sprite) ->
    super(dt, sprite)

  act: (gx, gy) ->
    pathfinder = new Pathfinder(cc.game.currentFloor(), 0)
    path = pathfinder.calc(@x, @y, gx, gy)
    @walkPath(path)
    cc.log "path is #{path.length} long"

module.exports = Player
