Mode = require 'base/mode'
config = require 'config'
resources = require 'resources'
floorgen = require 'world/floorgen'
Pathfinder = require 'world/pathfinder'
Tilesheet = require 'gfx/tilesheet'

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
          sprite.setPosition(cc.p(i * cc.unitSize, j * cc.unitSize))
          @gfx.floorLayer.addChild sprite, -1

    @gfx.floorLayer.setScale(config.scale.min)
    @gfx.floorLayer.setScale(1.0)
    @add @gfx.floorLayer
    @gfxCenterMap()

  gfxPlaceMap: (mapX, mapY, screenX, screenY) ->
    scale = @gfx.floorLayer.getScale()
    x = screenX - (mapX * scale)
    y = screenY - (mapY * scale)
    @gfx.floorLayer.setPosition(x, y)

  gfxCenterMap: ->
    center = cc.game.currentFloor().bbox.center()
    @gfxPlaceMap(center.x * cc.unitSize, center.y * cc.unitSize, cc.width / 2, cc.height / 2)

  gfxScreenToMapCoords: (x, y) ->
    pos = @gfx.floorLayer.getPosition()
    scale = @gfx.floorLayer.getScale()
    return {
      x: (x - pos.x) / scale
      y: (y - pos.y) / scale
    }

  gfxRenderPlayer: ->
    @gfx.player = {}
    @gfx.player.sprite = cc.game.state.player.createSprite()
    @gfx.floorLayer.addChild @gfx.player.sprite, 0

  # gfxUpdatePositions: ->
  #   player = cc.game.state.player
  #   x = player.x * cc.unitSize
  #   y = player.y * cc.unitSize
  #   @gfx.player.sprite.setPosition(cc.p(x, y))
  #   if player.prevAnimFrame != player.animFrame
  #     @gfx.player.sprite.setTextureRect(@gfx.player.tiles.rect(player.animFrame))
  #     player.prevAnimFrame = player.animFrame

  gfxAdjustMapScale: (delta) ->
    scale = @gfx.floorLayer.getScale()
    scale += delta
    scale = config.scale.max if scale > config.scale.max
    scale = config.scale.min if scale < config.scale.min
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
      sprite.setPosition(cc.p(p.x * cc.unitSize, p.y * cc.unitSize))
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

  onActivate: ->
    cc.game.newGame()
    @gfxClear()
    @gfxRenderFloor()
    @gfxRenderPlayer()
    cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, @update, 1 / 60.0, cc.REPEAT_FOREVER, 0, false)

  onClick: (x, y) ->
    pos = @gfxScreenToMapCoords(x, y)
    gridX = Math.floor(pos.x / cc.unitSize)
    gridY = Math.floor(pos.y / cc.unitSize)

    if not cc.game.state.running
      cc.game.state.player.act(gridX, gridY)
      cc.game.state.running = true
      cc.log "running"

    # pathfinder = new Pathfinder(cc.game.currentFloor(), 0)
    # path = pathfinder.calc(cc.game.state.player.x, cc.game.state.player.y, gridX, gridY)
    # @gfxRenderPath(path)

  update: (dt) ->
    cc.game.state.player.updateSprite(@gfx.player.sprite)

    if cc.game.turnFrames > 0
      cc.game.turnFrames--
    else
      if cc.game.state.running
        minimumCD = 1000
        if minimumCD > cc.game.state.player.cd
          minimumCD = cc.game.state.player.cd
        # TODO: check cd of all NPCs on the floor against the minimumCD
        cc.game.state.player.tick(minimumCD)
        if cc.game.state.player.cd == 0 # We just ran, yet did nothing
          cc.game.state.running = false
          cc.log "not running"

module.exports = GameMode
