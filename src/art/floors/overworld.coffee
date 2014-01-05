class FakeOverworld
  constructor: ->
    cc.log "generating fake overworld"
    @width = 80
    @height = 80

    @grid = []
    for i in [0...@width]
      @grid[i] = []
      for j in [0...@height]
        @grid[i][j] =
          x: i
          y: j

    for i in [0...20]
      @grid[i][0].wall = true
      @grid[i][0].tile = "wall"
      @grid[0][i].wall = true
      @grid[0][i].tile = "wall"
      @grid[i][19].wall = true
      @grid[i][19].tile = "wall"
      @grid[19][i].wall = true
      @grid[19][i].tile = "wall"

    for j in [1...19]
      for i in [1...19]
        @grid[i][j].tile = "floor"

    @grid[5][5].tile = "door"
    @grid[5][5].exit =
      floor: "catacombs"
      entrance: "overworld"

    @grid[2][1].tile = "door"
    @grid[2][1].exit =
      floor: "dungeon0"
      entrance: "overworld"

    @entrances =
      start:
        x: 1
        y: 1
      dungeon0:
        x: 3
        y: 1
      catacombs:
        x: 6
        y: 5

    @items = []
    @npcs = []

module.exports = ->
  return new FakeOverworld()
