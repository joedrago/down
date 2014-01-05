class FakeCatacombs
  constructor: ->
    cc.log "generating fake catacombs"
    @width = 80
    @height = 80

    @grid = []
    for i in [0...@width]
      @grid[i] = []
      for j in [0...@height]
        @grid[i][j] =
          x: i
          y: j

    for i in [0...10]
      @grid[i][0].wall = true
      @grid[i][0].tile = "wall"
      @grid[0][i].wall = true
      @grid[0][i].tile = "wall"
      @grid[i][9].wall = true
      @grid[i][9].tile = "wall"
      @grid[9][i].wall = true
      @grid[9][i].tile = "wall"

    for j in [1...9]
      for i in [1...9]
        @grid[i][j].tile = "floor"

    @grid[5][5].tile = "door"
    @grid[5][5].exit =
      floor: "town"
      entrance: "catacombs"

    @entrances =
      town:
        x: 6
        y: 5

    @items = []
    @npcs = []

module.exports = ->
  return new FakeCatacombs()
