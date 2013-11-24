config = require 'config'
IntroMode = require 'mode/intro'
GameMode = require 'mode/game'

if not cc.unitSize
  size = cc.Director.getInstance().getWinSize()
  cc.unitSize = config.unitSize
  cc.uiWidth = Math.floor(size.width * 0.2)
  cc.uiHeight = size.height
  cc.width = size.width - cc.uiWidth
  cc.height = size.height
  cc.uiX = cc.width
  cc.uiY = 0
  cc.modes =
    intro: new IntroMode()
    game: new GameMode()
