floorgen = require 'world/floorgen'

class Pathfinder
  constructor: (@startX, @startY, @destX, @destY, @flags) ->
    @grid = cc.game.currentFloor().grid
    @visitgrid = new Buffer(@grid.width * @grid.height)
    @visitgrid.fill(0)

  # cost is just distance squared
  cost: (x1, y1, x2, y2) ->
    dx = x2 - x1
    dy = y2 - y1
    return (dx*dx + dy*dy)

  visited: (x, y, v) ->
    o = x + (y * @grid.width)
    visitgrid[o] = v if v?
    return visitgrid[o]

  add: (x, y) ->
    cost = @cost(x, y, @destX, @destY)
    i = 0
    while i < @queue.length
      if cost < @queue[i][2]
        break
      i++
    @queue.splice(i, 0, [x, y, cost])

  calc: ->
    @queue = []
    @queue.push([@startX, @startY, @cost(@startX, @startY, @destX, @destY)])

    while @queue.length
      n = @queue.splice(0, 1)
      @visited(n[0], n[1], 1)
      for y in [n[1]-1..n[1]+1]
        for x in [n[0]-1..n[0]+1]
          if not @visited(x, y)
            @add x, y

    return [
      [@destX + 1, @destY]
      [@destX + 2, @destY]
      [@destX + 3, @destY]
    ]

module.exports = Pathfinder
