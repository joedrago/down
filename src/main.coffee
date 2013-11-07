resources = require 'resources'
IntroMode = require 'mode/intro'
GameMode = require 'mode/game'

class Game
  constructor: ->
    @modes =
      intro: new IntroMode()
      game: new GameMode()

if not cc.game
  size = cc.Director.getInstance().getWinSize()
  cc.width = size.width
  cc.height = size.height
  cc.game = new Game()
