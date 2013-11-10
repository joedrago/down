resources = require 'resources'
IntroMode = require 'mode/intro'
GameMode = require 'mode/game'
floorgen = require 'world/floorgen'

class Game
  constructor: ->
    @modes =
      intro: new IntroMode()
      game: new GameMode()

  newFloor: ->
    floorgen.generate()

  currentFloor: ->
    return @state.floors[@state.player.floor]

  newGame: ->
    cc.log "newGame"
    @state =
      player:
        x: 40
        y: 40
        floor: 1
      floors: [
        {}
        @newFloor()
      ]

if not cc.game
  size = cc.Director.getInstance().getWinSize()
  cc.width = size.width
  cc.height = size.height
  cc.game = new Game()
