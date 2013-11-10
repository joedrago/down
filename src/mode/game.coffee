Mode = require 'base/mode'
resources = require 'resources'
floorgen = require 'world/floorgen'
Pathfinder = require 'world/pathfinder'
Tilesheet = require 'gfx/tilesheet'

UNIT_SIZE = 16
SCALE_MIN = 1.5
SCALE_MAX = 8.0

class GameMode extends Mode
  constructor: ->
    super("Game")

  tileForGridValue: (v) ->
    switch
      when v == floorgen.WALL then 16
      when v == floorgen.DOOR then 5
      when v >= floorgen.FIRST_ROOM_ID then 18
      else 0

  gfxClear: ->
    if @gfx?
      if @gfx.floorLayer?
        @remove @gfx.floorLayer
    @gfx =
      unitSize: UNIT_SIZE
      pathSprites: []

  gfxRenderFloor: ->
    @gfx.floorLayer = new cc.Layer()
    @gfx.floorLayer.setAnchorPoint(cc.p(0, 0))

    tiles = new Tilesheet(resources.tiles0, 16, 16, 16)
    floor = cc.game.currentFloor()
    for j in [0...floor.height]
      for i in [0...floor.width]
        v = floor.get(i, j)
        if v != 0
          sprite = cc.Sprite.create tiles.resource
          sprite.setAnchorPoint(cc.p(0, 0))
          sprite.setTextureRect(tiles.rect(@tileForGridValue(v)))
          sprite.setPosition(cc.p(i * @gfx.unitSize, j * @gfx.unitSize))
          @gfx.floorLayer.addChild sprite, -1

    @gfx.floorLayer.setScale(SCALE_MIN)
    @add @gfx.floorLayer
    @gfxCenterMap()

  gfxPlaceMap: (mapX, mapY, screenX, screenY) ->
    scale = @gfx.floorLayer.getScale()
    x = screenX - (mapX * scale)
    y = screenY - (mapY * scale)
    @gfx.floorLayer.setPosition(x, y)

  gfxCenterMap: ->
    center = cc.game.currentFloor().bbox.center()
    @gfxPlaceMap(center.x * @gfx.unitSize, center.y * @gfx.unitSize, cc.width / 2, cc.height / 2)

  gfxScreenToMapCoords: (x, y) ->
    pos = @gfx.floorLayer.getPosition()
    scale = @gfx.floorLayer.getScale()
    return {
      x: (x - pos.x) / scale
      y: (y - pos.y) / scale
    }

  gfxRenderPlayer: ->
    @gfx.player = {}
    @gfx.player.tiles = new Tilesheet(resources.player, 12, 14, 18)
    s = cc.Sprite.create @gfx.player.tiles.resource
    s.setAnchorPoint(cc.p(0, 0))
    s.setTextureRect(@gfx.player.tiles.rect(16))
    @gfx.player.sprite = s
    @gfx.floorLayer.addChild s, 0

  gfxUpdatePositions: ->
    x = cc.game.state.player.x * @gfx.unitSize
    y = cc.game.state.player.y * @gfx.unitSize
    @gfx.player.sprite.setPosition(cc.p(x, y))

  update: (dt) ->
    which = Math.floor(Math.random() * 5)
    @gfx.player.sprite.setTextureRect(@gfx.player.tiles.rect(which))

  onActivate: ->
    cc.game.newGame()
    @gfxClear()
    @gfxRenderFloor()
    @gfxRenderPlayer()
    @gfxUpdatePositions()
    cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, @update, 1.0, cc.REPEAT_FOREVER, 0, false)

  gfxAdjustMapScale: (delta) ->
    scale = @gfx.floorLayer.getScale()
    scale += delta
    scale = SCALE_MAX if scale > SCALE_MAX
    scale = SCALE_MIN if scale < SCALE_MIN
    @gfx.floorLayer.setScale(scale)

  gfxRenderPath: (path) ->
    tiles = new Tilesheet(resources.tiles0, 16, 16, 16)
    for s in @gfx.pathSprites
      @gfx.floorLayer.removeChild s
    @gfx.pathSprites = []
    for p in path
      sprite = cc.Sprite.create tiles.resource
      sprite.setAnchorPoint(cc.p(0, 0))
      sprite.setTextureRect(tiles.rect(17))
      sprite.setPosition(cc.p(p.x * @gfx.unitSize, p.y * @gfx.unitSize))
      sprite.setOpacity 128
      @gfx.floorLayer.addChild sprite
      @gfx.pathSprites.push sprite

  onDrag: (dx, dy) ->
    pos = @gfx.floorLayer.getPosition()
    @gfx.floorLayer.setPosition(pos.x + dx, pos.y + dy)

  onZoom: (x, y, delta) ->
    pos = @gfxScreenToMapCoords(x, y)
    @gfxAdjustMapScale(delta / 200)
    @gfxPlaceMap(pos.x, pos.y, x, y)

  onClick: (x, y) ->
    # @gfxAdjustMapScale 0.1
    # @gfxPlaceMap(pos.x, pos.y, x, y)

    pos = @gfxScreenToMapCoords(x, y)
    gridX = Math.floor(pos.x / @gfx.unitSize)
    gridY = Math.floor(pos.y / @gfx.unitSize)

    pathfinder = new Pathfinder(cc.game.state.player.x, cc.game.state.player.y, gridX, gridY, 0)
    path = pathfinder.calc()
    @gfxRenderPath(path)

    # cc.game.state.player.x = gridX
    # cc.game.state.player.y = gridY
    # @gfxUpdatePositions()

module.exports = GameMode
