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
    @sightRays = [
      # LRUD
      { x:  1, y:  0 }
      { x:  0, y:  1 }
      { x: -1, y:  0 }
      { x:  0, y: -1 }

      # Diagonals
      { x:  1, y:  1 }
      { x: -1, y:  1 }
      { x:  1, y: -1 }
      { x: -1, y: -1 }
    ]
    @sightScales = [ 0.25, 0.5, 0.75, 1 ]

  newFloor: ->
    floorgen.generate()

  currentFloor: ->
    return @state.floors[@state.floor]

  currentCell: (x, y) ->
    return @state.floors[@state.floor].grid[x][y]

  generateFloors: (savedata, name, depth) ->
    for i in [0...depth]
      if i == 0
        upInfo =
          floor: "overworld"
      else
        upInfo =
          floor: "#{name}#{i-1}"

      if i == (depth - 1)
        downInfo = null
      else
        downInfo =
          floor: "#{name}#{i+1}"

      floorName = "#{name}#{i}"
      savedata.floors[floorName] = floorgen.generate(floorName, upInfo, downInfo)

  newSave: ->
    savedata =
      # if floor is absent, it will be set to "overworld", and player will be teleported
      floors:
        overworld:
          premade: true
        catacombs:
          premade: true
          # if items and npcs are absent, they'll be populated from the premade list
      player:
        # if player x,y are absent, they'll be populated from the map
        sight: 3.5

    @generateFloors(savedata, "dungeon", 3)

    return savedata

  enterFloor: ->
    @gfxReset()
    @updateVisibility()
    @gfx.floor.place(@state.player.x * cc.unitSize, @state.player.y * cc.unitSize, cc.width / 2, cc.height / 2)
    # TODO: do fade in?

  switchFloor: (exit) ->
    cc.log "switchFloor: #{exit.floor}"
    @state.floor = exit.floor
    pos = @currentFloor().entrances[exit.entrance]
    @state.player.x = pos.x
    @state.player.y = pos.y

    @enterFloor()

  load: (savedata) ->
    @state =
      floor: savedata.floor
      floors: {}
      player: new Player(savedata.player)
      running: false

    for floorName, floor of savedata.floors
      if floor.premade
        premadeFloor = require("art/floors/#{floorName}")()
        floor.width = premadeFloor.width
        floor.height = premadeFloor.height
        floor.grid = premadeFloor.grid
        floor.entrances = premadeFloor.entrances
        if not floor.items
          floor.items = premadeFloor.items
        if not floor.npcs
          floor.npcs = premadeFloor.npcs
      @state.floors[floorName] = floor

    if not @state.floor
      @state.floor = "overworld"
      startingPos = @currentFloor().entrances["start"]
      @state.player.x = startingPos.x
      @state.player.y = startingPos.y

    @enterFloor()

  setTurnFrames: (count) ->
    if @turnFrames < count
      @turnFrames = count

  gfxReset: ->
    if @gfx?.floor?
      @gfx.floor.release()
    @gfx = {}

    @gfx.floor = new Floor(this, @currentFloor())
    @gfx.player = {}
    @gfx.player.sprite = @state.player.createSprite()
    @gfx.floor.layer.addChild @gfx.player.sprite, config.zOrder.player

    # @gfx.uiBackground = resources.tilesheets.tiles0.createSprite(resources.tilesheets.tiles0.red)
    # @gfx.uiBackground.setOpacity(16)
    # @gfx.uiBackground.setScale(cc.uiWidth / cc.unitSize, cc.height / cc.unitSize)
    # @gfx.uiBackground.setPosition(cc.uiX, cc.uiY)
    # @add @gfx.uiBackground

  onDrag: (dx, dy) ->
    @gfx.floor.adjustPosition(dx, dy)

  onZoom: (x, y, delta) ->
    pos = @gfx.floor.screenToMapCoords(x, y)
    @gfx.floor.adjustScale(delta / config.scale.speed)
    @gfx.floor.place(pos.x, pos.y, x, y)

  onActivate: ->
    cc.log "hi"
    @load(@newSave())
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

  clearVisibility: ->
    if @visibleLocs?
      for loc in @visibleLocs
        loc.visible = false
        @gfx.floor.updateLoc(loc, false)
    @visibleLocs = []

  markVisible: (loc) ->
    return if loc.visible
    loc.visible = true
    loc.discovered = true
    @gfx.floor.updateLoc(loc, true)
    @visibleLocs.push(loc)

  markBright: (loc) ->
    @gfx.floor.updateLoc(loc, false)

  updateVisibility: ->
    @clearVisibility()
    floor = @currentFloor()
    loopCount = 0
    sightSquared = @state.player.sight * @state.player.sight
    for scaleX in @sightScales
      for scaleY in @sightScales
        for dirX in [-1..1]
          for dirY in [-1..1]
            continue if 0 == dirX == dirY
            i = dirX * scaleX
            j = dirY * scaleY
            x = px = @state.player.x
            y = py = @state.player.y
            # center the cast
            px += 0.5
            py += 0.5
            prevLoc = null
            while floor.grid[x][y].tile?
              g = floor.grid[x][y]
              loopCount++
              @markVisible(g)
              if prevLoc != null
                @markBright(prevLoc)
              prevLoc = g
              if (g.wall) or (g.door and (@state.player.x != x or @state.player.y != y))
                @markBright(g)
                break
              px += i
              py += j
              x = Math.floor(px)
              y = Math.floor(py)
              dx = @state.player.x - x
              dy = @state.player.y - y
              break if (dx*dx)+(dy*dy) > sightSquared

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
