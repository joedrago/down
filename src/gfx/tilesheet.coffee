
# This is fucking tragic.
PIXEL_FUDGE_FACTOR = 0.5  # how many pixels to remove from the edge to remove bleed
SCALE_FUDGE_FACTOR = 0.02  # additional sprite scale to ensure proper tiling

class Tilesheet
  constructor: (@resource, @width, @height, @stride) ->

  rect: (v) ->
    y = Math.floor(v / @stride)
    x = v % @stride
    return cc.rect(x * @width, y * @height, @width - PIXEL_FUDGE_FACTOR, @height - PIXEL_FUDGE_FACTOR)

  adjustedScale: ->
    {
      x: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @width)
      y: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / @height)
    }

module.exports = Tilesheet
