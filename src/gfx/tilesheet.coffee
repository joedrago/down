
class BatchNode
  constructor: (@tilesheet, capacity) ->
    @node = new cc.SpriteBatchNode()
    @node.init(@tilesheet._resource, capacity)

  addTo: (layer, depth) ->
    layer.addChild @node, depth

  createSprite: (which, x, y, z) ->
    z ?= 0
    sprite = cc.Sprite.createWithTexture(@node.getTexture(), which)
    @node.addChild sprite, z
    @tilesheet.prepareSprite(sprite, x, y)
    return sprite

class Tilesheet
  constructor: (data) ->
    for k,v of data
      this[k] = v

  createSprite: (which, x, y) ->
    sprite = cc.Sprite.create @_resource, which
    @prepareSprite(sprite, x, y)
    return sprite

  prepareSprite: (sprite, x, y) ->
    sprite.setAnchorPoint(cc.p(0, 0))
    sprite.setPosition(cc.p(x, y))
    return sprite

  createBatchNode: (capacity) ->
    batchNode = new BatchNode(this, capacity)
    return batchNode

module.exports = Tilesheet
