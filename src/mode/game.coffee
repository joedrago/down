Floor = require 'gfx/floor'
Mode = require 'base/mode'
config = require 'config'
resources = require 'resources'
Pathfinder = require 'world/pathfinder'
floorgen = require 'world/floorgen'
Player = require 'brain/player'

class GameMode extends Mode
  constructor: ->
    super("Game")
    @turnFrames = 0

  newFloor: ->
    floorgen.generate()

  currentFloor: ->
    return @state.floors[@state.player.floor]

  newGame: ->
    cc.log "newGame"
    @state = {
      running: false
      player: new Player({
        sight: 5 * 5 # so we can test distSquared
        x: 44
        y: 49
        floor: 1
      })
      floors: [
        {}
        @newFloor()
      ]
    }
    @visibleLocs = []

  setTurnFrames: (count) ->
    if @turnFrames < count
      @turnFrames = count

  gfxResetFloor: ->
    if @gfx?.floor?
      @gfx.floor.release()
    @gfx = {}

    @gfx.floor = new Floor(this, @currentFloor())
    @gfx.player = {}
    @gfx.player.sprite = @state.player.createSprite()
    @gfx.floor.layer.addChild @gfx.player.sprite, config.zOrder.player

  onDrag: (dx, dy) ->
    @gfx.floor.adjustPosition(dx, dy)

  onZoom: (x, y, delta) ->
    pos = @gfx.floor.screenToMapCoords(x, y)
    @gfx.floor.adjustScale(delta / config.scale.speed)
    @gfx.floor.place(pos.x, pos.y, x, y)

  onActivate: ->
    @newGame()
    @gfxResetFloor()
    @updateVisibility()
    cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, @update, 1 / 60.0, cc.REPEAT_FOREVER, 0, false)

  onClick: (x, y) ->
    pos = @gfx.floor.screenToMapCoords(x, y)
    gridX = Math.floor(pos.x / cc.unitSize)
    gridY = Math.floor(pos.y / cc.unitSize)

    if not @state.running
      @state.player.act(gridX, gridY)
      @state.running = true
      cc.log "running"

    # pathfinder = new Pathfinder(@currentFloor(), 0)
    # path = pathfinder.calc(@state.player.x, @state.player.y, gridX, gridY)
    # @gfx.floor.debugPath(path)

  clearVisibility: ->
    for loc in @visibleLocs
      loc.visible = false
      @gfx.floor.updateLoc(loc)
    @visibleLocs = []

  markVisible: (loc) ->
    loc.visible = true
    loc.discovered = true
    @gfx.floor.updateLoc(loc)
    @visibleLocs.push(loc)

  updateVisibility: ->
    @clearVisibility()
    floor = @currentFloor()
    for j in [-1..1] by 0.10
      for i in [-1..1] by 0.10
        continue if Math.abs(i)<0.10 and Math.abs(j)<0.10
        x = px = @state.player.x
        y = py = @state.player.y
        # center the cast
        px += 0.5
        py += 0.5
        while (v = floor.get(x, y)) > 0
          @markVisible(floor.grid[x][y])
          break if v == floorgen.WALL
          break if v == floorgen.DOOR and (@state.player.x != x or @state.player.y != y)
          px += i
          py += j
          x = Math.floor(px)
          y = Math.floor(py)
          dx = @state.player.x - x
          dy = @state.player.y - y
          break if (dx*dx)+(dy*dy) > @state.player.sight

  update: (dt) ->
    @state.player.updateSprite(@gfx.player.sprite)

    if @turnFrames > 0
      @turnFrames--
    else
      if @state.running
        minimumCD = 1000
        if minimumCD > @state.player.cd
          minimumCD = @state.player.cd
        # TODO: check cd of all NPCs on the floor against the minimumCD
        @state.player.tick(minimumCD)
        if @state.player.cd == 0 # We just ran, yet did nothing
          @state.running = false
          cc.log "not running"

module.exports = GameMode
