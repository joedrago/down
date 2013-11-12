
# This is fucking tragic.
PIXEL_FUDGE_FACTOR = 0.5  # how many pixels to remove from the edge to remove bleed
SCALE_FUDGE_FACTOR = 0.02  # additional sprite scale to ensure proper tiling

TilesheetBatchNode = cc.SpriteBatchNode.extend {
  init: (fileImage, capacity) ->
    @_super(fileImage, capacity)

  createSprite: (tileIndex, x, y) ->
    sprite = cc.Sprite.createWithTexture(@getTexture(), @tilesheet.rect(tileIndex))
    sprite.setAnchorPoint(cc.p(0, 0))
    sprite.setPosition(x, y)
    sprite.setScale(@tilesheet.adjustedScale.x, @tilesheet.adjustedScale.y)
    @addChild sprite
    return sprite
}

class Tilesheet
  constructor: (@resource, @width, @height, @stride) ->
    @adjustedScale =
      x: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @width)
      y: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @height)

  rect: (v) ->
    y = Math.floor(v / @stride)
    x = v % @stride
    return cc.rect(x * @width, y * @height, @width - PIXEL_FUDGE_FACTOR, @height - PIXEL_FUDGE_FACTOR)

  createBatchNode: (capacity) ->
    batchNode = new TilesheetBatchNode()
    batchNode.tilesheet = this
    batchNode.init(@resource, capacity)
    return batchNode

module.exports = Tilesheet
