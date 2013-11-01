console.log "wat"

CircleSprite = cc.Sprite.extend {
  _degree: 0

  ctor: ->
    @_super()

  draw: ->
    cc.drawingUtil.setDrawColor4B(255,255,255,255)

    if (@_degree < 0)
      @_degree = 360
    cc.drawingUtil.drawCircle cc.PointZero(), 30, cc.DEGREES_TO_RADIANS(@_degree), 60, true

  myUpdate: (dt) ->
    @_degree -= 6
}

Helloworld = cc.Layer.extend {
  isMouseDown: false
  helloImg: null
  helloLabel: null
  circle: null
  sprite: null

  init: ->
    selfPointer = this

    # 1. super init first
    @_super()

    # 2. add a menu item with "X" image, which is clicked to quit the program
    #    you may modify it.
    # ask director the window size
    size = cc.Director.getInstance().getWinSize()

    # # add a "close" icon to exit the progress. it's an autorelease object
    # closeItem = cc.MenuItemImage.create(
    #   "res/CloseNormal.png",
    #   "res/CloseSelected.png",
    #   ->
    #     history.go(-1)
    #   this)

    # closeItem.setAnchorPoint(cc.p(0.5, 0.5))

    # menu = cc.Menu.create(closeItem)
    # menu.setPosition(cc.PointZero())
    # @addChild(menu, 1)
    # closeItem.setPosition(cc.p(size.width - 20, 20))

    # 3. add your codes below...
    # add a label shows "Hello World"
    # create and initialize a label
    @helloLabel = cc.LabelTTF.create("Hello World", "Arial", 38)
    # position the label on the center of the screen
    @helloLabel.setPosition(cc.p(size.width / 2, 0))
    # add the label as a child to this layer
    @addChild(@helloLabel, 5)

    lazyLayer = cc.Layer.create()
    @addChild(lazyLayer)

    # add "HelloWorld" splash screen"
    @sprite = cc.Sprite.create("res/HelloWorld.png")
    @sprite.setPosition(cc.p(size.width / 2, size.height / 2))
    @sprite.setScale(0.5)
    @sprite.setRotation(180)

    lazyLayer.addChild(@sprite, 0)

    rotateToA = cc.RotateTo.create(2, 0)
    scaleToA = cc.ScaleTo.create(2, 1, 1)

    @sprite.runAction(cc.Sequence.create(rotateToA, scaleToA))

    @circle = new CircleSprite()
    @circle.setPosition(cc.p(40, size.height - 60))
    @addChild(@circle, 2)
    @circle.schedule(@circle.myUpdate, 1 / 60)

    @helloLabel.runAction(cc.Spawn.create(cc.MoveBy.create(2.5, cc.p(0, size.height - 40)),cc.TintTo.create(2.5,255,125,0)))

    @setTouchEnabled(true)
    return true

  # a selector callback
  menuCloseCallback: (sender) ->
    cc.Director.getInstance().end()

  onTouchesBegan: (touches, event) ->
    @isMouseDown = true

  onTouchesMoved: (touches, event) ->
    # if @isMouseDown
    #   if touches
        #@circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y))

  onTouchesEnded: (touches, event) ->
      @isMouseDown = false

  onTouchesCancelled: (touches, event) ->
      console.log("onTouchesCancelled")
}

HelloWorldScene = cc.Scene.extend {
  onEnter: ->
    @_super()
    layer = new Helloworld()
    layer.init()
    @addChild(layer)
}
