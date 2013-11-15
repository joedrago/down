floorgen = require 'world/floorgen'
DistanceHeap = require 'world/distanceheap'

class FakeHeap
  constructor: ->
    @list = []

  sortList: ->
    @list.sort (a, b) ->
      return a.distance - b.distance

  push: (n) ->
    @list.push(n)
    @sortList()

  size: ->
    return @list.length

  pop: ->
    return @list.shift()

  adjust: (n) ->
    @sortList()

class Dijkstra
  constructor: (@floor) ->
    for x in [0...@floor.width]
      for y in [0...@floor.height]
        node = @floor.grid[x][y]
        node.distance = 99999
        node.visited = false
        node.heaped = false
        node.parent = null

  createHeap: ->
    return new DistanceHeap()

  search: (start, end) ->
    grid = @floor.grid
    heuristic = @manhattan

    start.distance = 0

    heap = @createHeap()
    heap.push(start)
    start.heaped = true

    while heap.size() > 0
      currentNode = heap.pop()
      currentNode.visited = true

      if currentNode == end
        ret = []
        curr = end
        while curr.parent
          ret.push({x:curr.x, y:curr.y})
          curr = curr.parent
        return ret.reverse()

      # Find all neighbors for the current node.
      neighbors = @neighbors(grid, currentNode)

      for neighbor in neighbors
        if neighbor.visited or (neighbor.type == floorgen.WALL)
          # Not a valid node to process, skip to next neighbor.
          continue

        # The distance is the shortest distance from start to current node.
        # We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        neighborDistanceViaThisNode = currentNode.distance + 1
        isDiagonal = (currentNode.x != neighbor.x) and (currentNode.y != neighbor.y)
        if isDiagonal
          neighborDistanceViaThisNode += 0.1

        if (neighborDistanceViaThisNode < neighbor.distance) and not neighbor.visited
          # Found an optimal (so far) path to this node.
          neighbor.distance = neighborDistanceViaThisNode
          neighbor.parent = currentNode
          if neighbor.heaped
            heap.adjust(neighbor)
          else
            heap.push(neighbor)
            neighbor.heaped = true

    return []

  neighbors: (grid, node) ->
    ret = []
    x = node.x
    y = node.y

    # Southwest
    if grid[x-1] and grid[x-1][y-1]
      ret.push(grid[x-1][y-1])

    # Southeast
    if grid[x+1] and grid[x+1][y-1]
      ret.push(grid[x+1][y-1])

    # Northwest
    if grid[x-1] and grid[x-1][y+1]
      ret.push(grid[x-1][y+1])

    # Northeast
    if grid[x+1] and grid[x+1][y+1]
      ret.push(grid[x+1][y+1])

    # West
    if grid[x-1] and grid[x-1][y]
      ret.push(grid[x-1][y])

    # East
    if grid[x+1] and grid[x+1][y]
      ret.push(grid[x+1][y])

    # South
    if grid[x] and grid[x][y-1]
      ret.push(grid[x][y-1])

    # North
    if grid[x] and grid[x][y+1]
      ret.push(grid[x][y+1])

    return ret

class Pathfinder
  constructor: (@floor, @flags) ->

  calc: (startX, startY, destX, destY) ->
    dijkstra = new Dijkstra @floor
    return dijkstra.search(@floor.grid[startX][startY], @floor.grid[destX][destY])

module.exports = Pathfinder
