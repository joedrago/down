floorgen = require 'world/floorgen'

class BinaryHeap
  constructor: (scoreFunction) ->
    @content = []
    @scoreFunction = scoreFunction

  push: (element) ->
    # Add the new element to the end of the array.
    @content.push(element)

    # Allow it to sink down.
    @sinkDown(@content.length - 1)

  pop: ->
    # Store the first element so we can return it later.
    result = @content[0]
    # Get the element at the end of the array.
    end = @content.pop()
    # If there are any elements left, put the end element at the
    # start, and let it bubble up.
    if @content.length > 0
      @content[0] = end
      @bubbleUp(0)

    return result

  remove: (node) ->
    i = @content.indexOf(node)

    # When it is found, the process seen in 'pop' is repeated
    # to fill up the hole.
    end = @content.pop()

    if i != @content.length - 1
      @content[i] = end

    if @scoreFunction(end) < @scoreFunction(node)
      @sinkDown(i)
    else
      @bubbleUp(i)

  size: ->
    return @content.length

  rescoreElement: (node) ->
    @sinkDown(@content.indexOf(node))

  sinkDown: (n) ->
    # Fetch the element that has to be sunk.
    element = @content[n]

    # When at 0, an element can not sink any further.
    while (n > 0)
      # Compute the parent element's index, and fetch it.
      parentN = ((n + 1) >> 1) - 1
      parent = @content[parentN]
      # Swap the elements if the parent is greater.
      if @scoreFunction(element) < @scoreFunction(parent)
        @content[parentN] = element
        @content[n] = parent
        # Update 'n' to continue at the new position.
        n = parentN

      # Found a parent that is less, no need to sink any further.
      else
        break

  bubbleUp: (n) ->
    # Look up the target element and its score.
    length = @content.length
    element = @content[n]
    elemScore = @scoreFunction(element)

    while(true)
      # Compute the indices of the child elements.
      child2N = (n + 1) << 1
      child1N = child2N - 1
      # This is used to store the new position of the element,
      # if any.
      swap = null
      # If the first child exists (is inside the array)...
      if child1N < length
        # Look it up and compute its score.
        child1 = @content[child1N]
        child1Score = @scoreFunction(child1)

        # If the score is less than our element's, we need to swap.
        if child1Score < elemScore
          swap = child1N

      # Do the same checks for the other child.
      if child2N < length
        child2 = @content[child2N]
        child2Score = @scoreFunction(child2)
        if child2Score < (swap == null ? elemScore : child1Score)
          swap = child2N

      # If the element needs to be moved, swap it, and continue.
      if swap != null
        @content[n] = @content[swap]
        @content[swap] = element
        n = swap

      # Otherwise, we are done.
      else
        break

class AStar
  constructor: (@floor) ->
    for x in [0...@floor.width]
      for y in [0...@floor.height]
        node = @floor.grid[x][y]
        node.distance = 99999
        node.visited = false
        node.heaped = false
        node.parent = null

  createHeap: ->
    return new BinaryHeap (node) ->
      return node.distance

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

      # cc.log "considering #{currentNode.x}, #{currentNode.y}"

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

        # cc.log "checking [#{currentNode.x}, #{currentNode.y}] -> [#{neighbor.x}, #{neighbor.y}]"

        # The distance is the shortest distance from start to current node.
        # We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        alt = currentNode.distance + 1
        isDiagonal = (currentNode.x != neighbor.x) and (currentNode.y != neighbor.y)
        if isDiagonal
          alt += 0.001

        if (alt <= neighbor.distance) and not neighbor.visited
          # Found an optimal (so far) path to this node.
          neighbor.distance = alt
          neighbor.parent = currentNode
          cc.log "neighbor [#{neighbor.x}, #{neighbor.y}] now via #{currentNode.x}, #{currentNode.y}: #{neighbor.distance}"
          if neighbor.heaped
            heap.rescoreElement(neighbor)
          else
            heap.push(neighbor)
            neighbor.heaped = true

    cc.log "while loop ended"

    cc.log "start #{start.x}, #{start.y}"
    cc.log "end #{end.x}, #{end.y}"

    # for x in [0...@floor.width]
    #   for y in [0...@floor.height]
    #     curr = @floor.grid[x][y]
    #     if curr.parent
    #       ret.push({x:curr.x, y:curr.y})
    # return ret

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
    astar = new AStar @floor
    return astar.search(@floor.grid[startX][startY], @floor.grid[destX][destY])

module.exports = Pathfinder
