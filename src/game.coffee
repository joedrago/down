gfx = require 'gfx'
Floor = require 'world/floor'
IntroScene = require 'intro'
resources = require 'resources'

class GameLayer extends gfx.Layer
  constructor: ->
    super()
    @addChild(new Floor())

class GameScene extends gfx.Scene
  constructor: ->
    super()
    layer = new GameLayer()
    @addChild(layer)

class Game
  constructor: ->
    @scenes =
      intro: new IntroScene()
      game: new GameScene()

if not cc.game
  cc.game = new Game()
