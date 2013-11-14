
# This is fucking tragic.
PIXEL_FUDGE_FACTOR = 0 # how many pixels to remove from the edge to remove bleed
SCALE_FUDGE_FACTOR = 0 # additional sprite scale to ensure proper tiling

GridTilesheetBatchNode = cc.SpriteBatchNode.extend {
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

class GridTilesheet
  constructor: (@resource, @resourceWidth, @resourceHeight, @tileWidth, @tileHeight, @tilePadding) ->
    @paddedTileWidth = @tileWidth + (@tilePadding * 2)
    @paddedTileHeight = @tileHeight + (@tilePadding * 2)
    @stride = Math.floor(@resourceWidth / (@tileWidth + (@tilePadding * 2)))
    @adjustedScale =
      x: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @tileWidth)
      y: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @tileHeight)

  rect: (v) ->
    y = Math.floor(v / @stride)
    x = v % @stride
    return cc.rect(
      @tilePadding + (x * @paddedTileWidth),
      @tilePadding + (y * @paddedTileHeight),
      @tileWidth - PIXEL_FUDGE_FACTOR,
      @tileHeight - PIXEL_FUDGE_FACTOR)

  createBatchNode: (capacity) ->
    batchNode = new GridTilesheetBatchNode()
    batchNode.tilesheet = this
    batchNode.init(@resource, capacity)
    return batchNode

TilesheetBatchNode = cc.SpriteBatchNode.extend {
  init: (fileImage, capacity) ->
    @_super(fileImage, capacity)

  createSprite: (rect, x, y) ->
    sprite = cc.Sprite.createWithTexture(@getTexture(), rect)
    sprite.setAnchorPoint(cc.p(0, 0))
    sprite.setPosition(x, y)
    # sprite.setScale(@tilesheet.adjustedScale.x, @tilesheet.adjustedScale.y)
    @addChild sprite
    return sprite
}

class Tilesheet
  constructor: (data) ->
    for k,v of data
      this[k] = v

  createBatchNode: (capacity) ->
    batchNode = new TilesheetBatchNode()
    batchNode.tilesheet = this
    batchNode.init(@_resource, capacity)
    return batchNode

module.exports =
  Tilesheet: Tilesheet
  GridTilesheet: GridTilesheet
