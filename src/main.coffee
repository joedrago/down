resources = require 'resources'
IntroMode = require 'mode/intro'
GameMode = require 'mode/game'
floorgen = require 'world/floorgen'
Player = require 'brain/player'

class Game
  constructor: ->
    @turnFrames = 0
    @modes =
      intro: new IntroMode()
      game: new GameMode()

  newFloor: ->
    floorgen.generate()

  currentFloor: ->
    return @state.floors[@state.player.floor]

  newGame: ->
    cc.log "newGame"
    @state = {
      player: new Player({
        x: 40
        y: 40
        floor: 1
      })
      floors: [
        {}
        @newFloor()
      ]
    }

  setTurnFrames: (count) ->
    if @turnFrames < count
      @turnFrames = count

if not cc.game
  size = cc.Director.getInstance().getWinSize()
  cc.unitSize = 16
  cc.width = size.width
  cc.height = size.height
  cc.game = new Game()
