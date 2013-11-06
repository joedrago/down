class Layer extends cc.Layer
  constructor: ->
    @ctor()
    @init()

class Scene extends cc.Scene
  constructor: ->
    @ctor()
    @init()

module.exports =
  Layer: Layer
  Scene: Scene
