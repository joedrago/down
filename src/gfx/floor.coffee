config = require 'config'
floorgen = require 'world/floorgen'
resources = require 'resources'

class Floor
  constructor: (@mode, @floor) ->
    @tiles = resources.tilesheets.tiles0

    @layer = new cc.Layer()
    @layer.setAnchorPoint(cc.p(0, 0))
    @floorBatchNode = @tiles.createBatchNode(@floor.width * @floor.height)
    @floorBatchNode.addTo @layer, config.zOrder.floor
    @fogBatchNode = @tiles.createBatchNode(@floor.width * @floor.height)
    @fogBatchNode.addTo @layer, config.zOrder.fog
    for j in [0...floor.height]
      for i in [0...floor.width]
        tile = floor.grid[i][j].tile
        if tile?
          loc = floor.grid[i][j]
          # loc.discovered = true # TEMP
          # loc.visible = true    # TEMP
          @floorBatchNode.createSprite(@getTile(@tiles, tile), i * cc.unitSize, j * cc.unitSize)
          loc.fogSprite = @fogBatchNode.createSprite(@tiles.black, i * cc.unitSize, j * cc.unitSize)
          @updateLoc(loc)

    @layer.setScale(config.scale.min)
    @mode.add @layer
    # @center()

  release: ->
    @mode.remove @layer

  updateLoc: (loc, isEdge) ->
    opacity = 255
    opacity = 192 if loc.discovered
    if loc.visible
      if isEdge
        opacity = 64
      else
        opacity = 0
    loc.fogSprite.setOpacity(opacity)

  debugPath: (path) ->
    if @pathBatchNode?
      @layer.removeChild @pathBatchNode
    return if path.length == 0
    @pathBatchNode = @tiles.createBatchNode(path.length)
    @floor.layer.addChild @pathBatchNode
    for p in path
      sprite = @pathBatchNode.createSprite(@tiles.door, p.x * cc.unitSize, p.y * cc.unitSize)
      sprite.setOpacity(64)

  getTile: (tiles, tile) ->
    switch
      when tile == "wall"  then tiles.random_wall()
      when tile == "door"  then tiles.door
      when tile == "up"    then tiles.stairsup
      when tile == "down"  then tiles.stairsdown
      when tile >= "floor" then tiles.random_floor()
      else 0

  rectForGridValue: (tiles, v) ->
    switch
      when v == floorgen.WALL then tiles.random_wall()
      when v == floorgen.DOOR then tiles.door
      when v >= floorgen.FIRST_ROOM_ID then tiles.random_floor()
      else 0

  place: (mapX, mapY, screenX, screenY) ->
    scale = @layer.getScale()
    x = screenX - (mapX * scale)
    y = screenY - (mapY * scale)
    @layer.setPosition(x, y)

  # center: ->
  #   center = @floor.bbox.center()
  #   @place(center.x * cc.unitSize, center.y * cc.unitSize, cc.width / 2, cc.height / 2)

  screenToMapCoords: (x, y) ->
    pos = @layer.getPosition()
    scale = @layer.getScale()
    return {
      x: (x - pos.x) / scale
      y: (y - pos.y) / scale
    }

  adjustScale: (delta) ->
    scale = @layer.getScale()
    scale += delta
    scale = config.scale.max if scale > config.scale.max
    scale = config.scale.min if scale < config.scale.min
    @layer.setScale(scale)

  adjustPosition: (dx, dy) ->
    pos = @layer.getPosition()
    @layer.setPosition(pos.x + dx, pos.y + dy)

module.exports = Floor
