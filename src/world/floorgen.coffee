fs = require 'fs'
seedRandom = require 'seed-random'

SHAPES = [
  """
  ############
  #..........#
  #..........#
  ########...#
         #...#
         #...#
         #...#
         #####
  """
  """
  ############
  #..........#
  #..........#
  #...########
  #...#
  #...#
  #####
  """
  """
  #####
  #...#
  #...########
  #..........#
  #..........#
  ############
  """
  """
      ####
      #..#
      #..#
      #..#
      #..#
      #..#
      #..#
  #####..#
  #......#
  #......#
  #......#
  ########
  """
]

EMPTY = 0
WALL = 1
DOOR = 2
FIRST_ROOM_ID = 5

valueToColor = (p, v) ->
  switch
    when v == WALL then return p.color 32, 32, 32
    when v == DOOR then return p.color 128, 128, 128
    when v >= FIRST_ROOM_ID then return p.color 0, 0, 5 + Math.min(240, 15 + (v * 2))
  return p.color 0, 0, 0

class Rect
  constructor: (@l, @t, @r, @b) ->

  w: -> @r - @l
  h: -> @b - @t
  area: -> @w() * @h()
  aspect: ->
    if @h() > 0
      return @w() / @h()
    else
      return 0

  squareness: ->
    return Math.abs(@w() - @h())

  center: ->
    return {
      x: Math.floor((@r + @l) / 2)
      y: Math.floor((@b + @t) / 2)
    }

  clone: ->
    return new Rect(@l, @t, @r, @b)

  expand: (r) ->
    if @area()
      @l = r.l if @l > r.l
      @t = r.t if @t > r.t
      @r = r.r if @r < r.r
      @b = r.b if @b < r.b
    else
      # special case, bbox is empty. Replace contents!
      @l = r.l
      @t = r.t
      @r = r.r
      @b = r.b

  toString: -> "{ (#{@l}, #{@t}) -> (#{@r}, #{@b}) #{@w()}x#{@h()}, area: #{@area()}, aspect: #{@aspect()}, squareness: #{@squareness()} }"

class RoomTemplate
  constructor: (@width, @height, @roomid) ->
    @grid = []
    for i in [0...@width]
      @grid[i] = []
      for j in [0...@height]
        @grid[i][j] = EMPTY

    @generateShape()

  generateShape: ->
    for i in [0...@width]
      for j in [0...@height]
        @set(i, j, @roomid)
    for i in [0...@width]
      @set(i, 0, WALL)
      @set(i, @height - 1, WALL)
    for j in [0...@height]
      @set(0, j, WALL)
      @set(@width - 1, j, WALL)

  rect: (x, y) ->
    return new Rect x, y, x + @width, y + @height

  set: (i, j, v) ->
    @grid[i][j] = v

  get: (map, x, y, i, j) ->
    if i >= 0 and i < @width and j >= 0 and j < @height
      v = @grid[i][j]
      return v if v != EMPTY
    return map.get x + i, y + j

  place: (map, x, y) ->
    for i in [0...@width]
      for j in [0...@height]
        v = @grid[i][j]
        map.set(x + i, y + j, v) if v != EMPTY

  fits: (map, x, y) ->
    for i in [0...@width]
      for j in [0...@height]
        mv = map.get(x + i, y + j)
        sv = @grid[i][j]
        if mv != EMPTY and sv != EMPTY and (mv != WALL or sv != WALL)
          return false
    return true

  doorEligible: (map, x, y, i, j) ->
    wallNeighbors = 0
    roomsSeen = {}
    values = [
      @get(map, x, y, i + 1, j)
      @get(map, x, y, i - 1, j)
      @get(map, x, y, i, j + 1)
      @get(map, x, y, i, j - 1)
    ]
    for v in values
      if v
        if v == 1
          wallNeighbors++
        else if v != 2
          roomsSeen[v] = 1
    rooms = Object.keys(roomsSeen).sort (a, b) -> a-b
    rooms = rooms.map (room) -> parseInt(room)
    roomCount = rooms.length
    if (wallNeighbors == 2) and (roomCount == 2) and (@roomid in rooms)
      if (values[0] == values[1]) or (values[2] == values[3])
        return rooms
    return [-1, -1]

  doorLocation: (map, x, y) ->
    for j in [0...@height]
      for i in [0...@width]
        rooms = @doorEligible(map, x, y, i, j)
        if rooms[0] != -1 and @roomid in rooms
          return [i, j]
    return [-1, -1]

  measure: (map, x, y) ->
    bboxTemp = map.bbox.clone()
    bboxTemp.expand @rect(x, y)
    [bboxTemp.area(), bboxTemp.squareness()]

  findBestSpot: (map) ->
    minSquareness = Math.max map.width, map.height
    minArea = map.width * map.height
    minX = -1
    minY = -1
    doorLocation = [-1, -1]
    searchL = map.bbox.l - @width
    searchR = map.bbox.r
    searchT = map.bbox.t - @height
    searchB = map.bbox.b
    for i in [searchL ... searchR]
      for j in [searchT ... searchB]
        if @fits(map, i, j)
          [area, squareness] = @measure map, i, j
          if area <= minArea and squareness <= minSquareness
            location = @doorLocation map, i, j
            if location[0] != -1
              doorLocation = location
              minArea = area
              minSquareness = squareness
              minX = i
              minY = j
    return [minX, minY, doorLocation]

class ShapeRoomTemplate extends RoomTemplate
  constructor: (shape, roomid) ->
    @lines = shape.split("\n")
    w = 0
    for line in @lines
      w = Math.max(w, line.length)
    @width = w
    @height = @lines.length
    super @width, @height, roomid

  generateShape: ->
    for j in [0...@height]
      for i in [0...@width]
        @set(i, j, EMPTY)
    i = 0
    j = 0
    for line in @lines
      for c in line.split("")
        v = switch c
          when '.' then @roomid
          when '#' then WALL
          else 0
        if v
          @set(i, j, v)
        i++
      j++
      i = 0

class Room
  constructor: (@rect) ->
    # console.log "room created #{@rect}"

class Map
  constructor: (@width, @height, @seed) ->
    @randReset()
    @grid = []
    for i in [0...@width]
      @grid[i] = []
      for j in [0...@height]
        @grid[i][j] =
          type: EMPTY
          x: i
          y: j
          visible: false
          discovered: false
    @bbox = new Rect 0, 0, 0, 0
    @rooms = []

  randReset: ->
    @rng = seedRandom(@seed)

  rand: (v) ->
    return Math.floor(@rng() * v)

  set: (i, j, v) ->
    @grid[i][j].type = v

  get: (i, j) ->
    if i >= 0 and i < @width and j >= 0 and j < @height
      return @grid[i][j].type
    return 0

  addRoom: (roomTemplate, x, y) ->
    # console.log "placing room at #{x}, #{y}"
    roomTemplate.place this, x, y
    r = roomTemplate.rect(x, y)
    @rooms.push new Room r
    @bbox.expand(r)
    # console.log "new map bbox #{@bbox}"

  randomRoomTemplate: (roomid) ->
    r = @rand(100)
    switch
      when  0 < r < 10 then return new RoomTemplate 3, 5 + @rand(10), roomid                  # vertical corridor
      when 10 < r < 20 then return new RoomTemplate 5 + @rand(10), 3, roomid                  # horizontal corridor
      when 20 < r < 30 then return new ShapeRoomTemplate SHAPES[@rand(SHAPES.length)], roomid # random shape from SHAPES
    return new RoomTemplate 4 + @rand(5), 4 + @rand(5), roomid                                # generic rectangular room

  generateRoom: (roomid) ->
    roomTemplate = @randomRoomTemplate roomid
    if @rooms.length == 0
      x = Math.floor((@width / 2) - (roomTemplate.width / 2))
      y = Math.floor((@height / 2) - (roomTemplate.height / 2))
      @addRoom roomTemplate, x, y
    else
      [x, y, doorLocation] = roomTemplate.findBestSpot(this)
      if x < 0
        return false
      roomTemplate.set doorLocation[0], doorLocation[1], 2
      @addRoom roomTemplate, x, y
    return true

  generateRooms: (count) ->
    for i in [0...count]
      roomid = FIRST_ROOM_ID + i

      added = false
      while not added
        added = @generateRoom roomid

generate = ->
  map = new Map 80, 80, 10
  map.generateRooms(20)
  return map

module.exports =
  generate: generate
  EMPTY: EMPTY
  WALL: WALL
  DOOR:DOOR
  FIRST_ROOM_ID: FIRST_ROOM_ID
