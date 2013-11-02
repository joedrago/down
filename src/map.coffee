
class Map
  constructor: (layer) ->
    size = cc.Director.getInstance().getWinSize()

    @sprite = cc.Sprite.create("res/HelloWorld.png")
    console.log "map pos: #{size.width}, #{size.height}"
    @sprite.setPosition(cc.p(size.width / 2, size.height / 2))
    layer.addChild(@sprite, 0)

  moveDelta: (dx, dy) ->
    pos = @sprite.getPosition()
    @sprite.setPosition cc.p(pos.x + dx, pos.y + dy)

module.exports =
  Map: Map
