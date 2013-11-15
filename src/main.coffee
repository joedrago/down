config = require 'config'
IntroMode = require 'mode/intro'
GameMode = require 'mode/game'

if not cc.unitSize
  size = cc.Director.getInstance().getWinSize()
  cc.unitSize = config.unitSize
  cc.width = size.width
  cc.height = size.height
  cc.modes =
    intro: new IntroMode()
    game: new GameMode()
