GameWorld = cc.Layer.extend {
  isMouseDown: false
  helloImg: null
  helloLabel: null
  circle: null

  init: ->
    @_super()
    @touchStartX = 0
    @touchStartY = 0
    @map = new Map(this)
    @setTouchEnabled(true)
    return true

  menuCloseCallback: (sender) ->
    cc.Director.getInstance().end()

  onTouchesBegan: (touches, event) ->
    if touches
      @isMouseDown = true
      @touchStartX = touches[0].getLocation().x
      @touchStartY = touches[0].getLocation().y

  onTouchesMoved: (touches, event) ->
    if @isMouseDown
      if touches
        @map.moveDelta(touches[0].getLocation().x - @touchStartX, touches[0].getLocation().y - @touchStartY)
        @touchStartX = touches[0].getLocation().x
        @touchStartY = touches[0].getLocation().y

  onTouchesEnded: (touches, event) ->
    @isMouseDown = false

  onTouchesCancelled: (touches, event) ->
    console.log("onTouchesCancelled")
}

DownScene = cc.Scene.extend {
  onEnter: ->
    @_super()
    layer = new GameWorld()
    layer.init()
    @addChild(layer)
}
