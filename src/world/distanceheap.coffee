class DistanceHeap
  constructor: ->
    @heap = []

  size: ->
    return @heap.length

  push: (n) ->
    @heap.push(n)
    if @heap.length > 1
      @bubbleUp(@heap.length - 1)

  pop: ->
    if @heap.length < 2
      return @heap.pop()

    r = @heap[0]
    last = @heap.pop()
    @heap[0] = last
    @sinkDown(0)
    return r

  bubbleUp: (i) ->
    child = i
    while child > 0
      parent = (child - 1) >> 1
      if @heap[parent].distance > @heap[child].distance
        t = @heap[parent]
        @heap[parent] = @heap[child]
        @heap[child] = t
        child = parent
      else
        return
    return

  sinkDown: (root) ->
    end = @heap.length - 1
    while ((root << 1) + 1) <= end
      child = (root << 1) + 1
      swap = root
      if @heap[swap].distance > @heap[child].distance
        swap = child
      if (child + 1) <= end and @heap[swap].distance > @heap[child+1].distance
        swap = child + 1
      if swap != root
        t = @heap[swap]
        @heap[swap] = @heap[root]
        @heap[root] = t
        root = swap
      else
        return
    return

  adjust: (n) ->
    index = @heap.indexOf(n)
    if index == -1
      return

    if index > 0
      parent = (index - 1) >> 1
      if @heap[parent].distance > @heap[index].distance
        # Parent has a longer distance, we must move up
        @bubbleUp(index)
        return

    # Either there is no parent or the parent was already smaller, head down
    @sinkDown(index)

module.exports = DistanceHeap

# --------------------------------------
# test code below this line

# seedRandom = require 'seed-random'
# rng = seedRandom()

# heap = new DistanceHeap()
# SIZE = 25
# for i in [0..SIZE]
#   heap.push({ distance: Math.floor(rng()*50) + 15 })

# heap.heap[14].distance = 3
# heap.adjust(heap.heap[14])
# heap.heap[14].distance = 100000
# heap.adjust(heap.heap[14])

# a = []
# for i in [0..SIZE]
#   a.push(heap.pop().distance)

# console.log "woo #{a}"
