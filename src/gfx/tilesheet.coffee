
class BatchNode
  constructor: (@tilesheet, capacity) ->
    @node = new cc.SpriteBatchNode()
    @node.init(@tilesheet._resource, capacity)

  addTo: (layer, depth) ->
    layer.addChild @node, depth

  createSprite: (which, x, y) ->
    sprite = cc.Sprite.createWithTexture(@node.getTexture(), which)
    @node.addChild sprite
    return @tilesheet.prepareSprite(sprite, x, y)

class Tilesheet
  constructor: (data) ->
    for k,v of data
      this[k] = v

  createSprite: (which, x, y) ->
    sprite = cc.Sprite.create @_resource, which
    return @prepareSprite(sprite, x, y)

  prepareSprite: (sprite, x, y) ->
    sprite.setAnchorPoint(cc.p(0, 0))
    sprite.setPosition(cc.p(x, y))
    return sprite

  createBatchNode: (capacity) ->
    batchNode = new BatchNode(this, capacity)
    return batchNode

module.exports = Tilesheet
