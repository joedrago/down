
class BatchNode
  constructor: (@tilesheet, capacity) ->
    @node = new cc.SpriteBatchNode()
    @node.init(@tilesheet._resource, capacity)

  addTo: (layer, depth) ->
    layer.addChild @node, depth

  rect: (v) -> @tilesheet.rect(v)

  createSprite: (which, x, y) ->
    sprite = cc.Sprite.createWithTexture(@node.getTexture(), @tilesheet.rect(which))
    @node.addChild sprite
    return @tilesheet.prepareSprite(sprite, x, y)

class Tilesheet
  constructor: (data) ->
    for k,v of data
      this[k] = v

  rect: (v) ->
    return v

  createSprite: (which, x, y) ->
    sprite = cc.Sprite.create @_resource, @rect(which)
    return @prepareSprite(sprite, x, y)

  prepareSprite: (sprite, x, y) ->
    sprite.setAnchorPoint(cc.p(0, 0))
    sprite.setPosition(cc.p(x, y))
    return sprite

  createBatchNode: (capacity) ->
    batchNode = new BatchNode(this, capacity)
    return batchNode

class GridTilesheet extends Tilesheet
  constructor: (@_resource, @resourceWidth, @resourceHeight, @tileWidth, @tileHeight, @tilePadding) ->
    @paddedTileWidth = @tileWidth + (@tilePadding * 2)
    @paddedTileHeight = @tileHeight + (@tilePadding * 2)
    @stride = Math.floor(@resourceWidth / (@tileWidth + (@tilePadding * 2)))

  rect: (v) ->
    y = Math.floor(v / @stride)
    x = v % @stride
    return cc.rect(
      @tilePadding + (x * @paddedTileWidth),
      @tilePadding + (y * @paddedTileHeight),
      @tileWidth,
      @tileHeight)

module.exports =
  Tilesheet: Tilesheet
  GridTilesheet: GridTilesheet
