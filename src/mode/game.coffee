Mode = require 'base/mode'
resources = require 'resources'
floorgen = require 'world/floorgen'
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
    @gfx = {}

  gfxRenderFloor: ->
    @gfx.floorLayer = new cc.Layer()
    @gfx.floorLayer.setAnchorPoint(cc.p(0, 0))

    tiles = new Tilesheet(resources.tiles0, 16, 16, 16)
    grid = cc.game.currentFloor().grid
    firstWall = true
    for j in [0...grid.height]
      for i in [0...grid.width]
        v = grid.get(i, j)
        if v != 0
          if firstWall
            cc.log "first wall at #{i}, #{j}"
            firstWall = false
          sprite = cc.Sprite.create tiles.resource
          sprite.setAnchorPoint(cc.p(0, 0))
          sprite.setTextureRect(tiles.rect(@tileForGridValue(v)))
          sprite.setPosition(cc.p(i * 16, j * 16))
          @gfx.floorLayer.addChild sprite, -1

    center = grid.bbox.center()
    @gfx.floorLayer.setPosition((cc.width / 2)+(-center.x * 16), (cc.height / 2)+(-center.y * 16))

    @add @gfx.floorLayer

  gfxRenderPlayer: ->
    @gfx.player = {}
    @gfx.player.tiles = new Tilesheet(resources.player, 12, 14, 18)
    s = cc.Sprite.create @gfx.player.tiles.resource
    s.setAnchorPoint(cc.p(0, 0))
    s.setTextureRect(@gfx.player.tiles.rect(16))
    @gfx.player.sprite = s
    @gfx.floorLayer.addChild s, 0

  gfxUpdatePositions: ->
    x = cc.game.state.player.x * 16
    y = cc.game.state.player.y * 16
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

  onClick: (x, y) ->
    floorPos = @gfx.floorLayer.getPosition()
    gridX = Math.floor((x - floorPos.x) / 16)
    gridY = Math.floor((y - floorPos.y) / 16)
    cc.log "grid click #{gridX}, #{gridY}"
    cc.game.state.player.x = gridX
    cc.game.state.player.y = gridY
    @gfxUpdatePositions()

module.exports = GameMode
