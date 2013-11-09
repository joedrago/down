
class Tilesheet
  constructor: (@resource, @width, @height, @stride) ->

  rect: (v) ->
    y = Math.floor(v / @stride)
    x = v % @stride
    return cc.rect(x * @width, y * @height, @width, @height)

module.exports = Tilesheet
