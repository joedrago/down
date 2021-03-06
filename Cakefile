# -------------------------------------------------------------------------------
# Game Sources

# Assumed to be in src/XXXXX.coffee, @is also the require() string
modules = [
  'art/tiles/tiles0'
  'art/tiles/player'
  'art/tiles/town'

  'content/floors/town'
  'content/floors/catacombs'

  'base/mode'

  'boot/mainweb'
  'boot/maindroid'

  'brain/brain'
  'brain/player'

  'gfx/tilesheet'
  'gfx/floor'

  'world/distanceheap'
  'world/floorgen'
  'world/pathfinder'

  'mode/intro'
  'mode/game'

  'config'
  'resources'
  'main'
]

# Things listed in here will be auto-executed at the end of the bundle
apps = [
  'boot/boot'
]

# -------------------------------------------------------------------------------
# List of things that might need to be require()'d, but aren't in our sources

externals = [
  'jsb.js'
]

# -------------------------------------------------------------------------------
# Build scripts

async      = require 'async'
browserify = require 'browserify'
fs         = require 'fs'
util       = require 'util'
pngReader  = require 'png-js'
pngWriter  = require('pngjs').PNG
watch      = require 'node-watch'

srcDir = 'src/'
srcDirFromGameDir = '../' + srcDir
gameDir = 'game/'
bundleFile = gameDir + 'down.js'

# TODO: choose a size based on the incoming sprites
tilesheetWidth = 256
tilesheetHeight = 256
# tilePadding = 1

coffeeFileRegex = /\.coffee$/
pngBasenameRegex = /([^\\\/]+)\.png$/
trailingNumberRegex = /(.*[^\d])(\d+)$/
tilesFileRegex = /[\\\/]tiles[\\\/]([^\\\/]+)[\\\/][A-Za-z0-9_]+\.png$/
tilemapFileRegex = /[\\\/]content[\\\/]floors[\\\/]([A-Za-z0-9_]+)\.json$/

generateJSBundle = (cb) ->
  b = browserify {
    basedir: gameDir
    extensions: ['coffee']
  }
  b.transform 'coffeeify'
  for module in modules
    b.require(srcDirFromGameDir + module + '.coffee', { expose: module })
  for ext in externals
    b.external ext
  for app in apps
    b.add srcDirFromGameDir + app + '.coffee'
  bundlePipe = b.bundle({ debug: true })
    .on 'error', (err) ->
      util.log "Error #{err}"
    bundlePipe
      .pipe(require('mold-source-map').transformSourcesRelativeTo(gameDir))
      .pipe(fs.createWriteStream(bundleFile))
      .on 'finish', ->
        util.log "Generated #{bundleFile}"
        cb() if cb?

readpng = (filename, cb) ->
  basename = pngBasenameRegex.exec(filename)[1]
  png = pngReader.load filename
  png.decode (pixels) ->
    return cb(null, { name: basename, filename: filename, png: png, pixels: pixels })

generatePaddedTilesheet = (tilesheetName, outputSuffix, tilePadding, genMetrics, cb) ->
  try
    fs.mkdirSync "game/res/gen", '0777'
  catch e
    # derp
  metricsFilename = "#{srcDir}art/tiles/#{tilesheetName}#{outputSuffix}.coffee"
  pngFilename = "game/res/gen/#{tilesheetName}#{outputSuffix}.png"
  tiles = fs.readdirSync srcDir + 'art/tiles/' + tilesheetName
  tiles.sort()
  filenames = ("#{srcDir}art/tiles/#{tilesheetName}/#{t}" for t in tiles)
  async.map filenames, readpng, (err, results) ->
    png = new pngWriter {
      width: tilesheetWidth
      height: tilesheetHeight
      filterType: -1
    }

    x = tilePadding
    y = tilePadding
    maxY = 0
    for r in results
      if (x + r.png.width) > png.width
        x = tilePadding
        y += maxY + (tilePadding * 2)
        maxY = 0
      if maxY < r.png.height
        maxY = r.png.height

      r.x = x
      r.y = y

      # Pad top and bottom
      srcPixels = r.pixels
      for j in [0...tilePadding]
        for i in [0...r.png.width]
          # top
          srcIndex = 4 * i
          dstIndex = 4 * ((x+i) + ((y+j-tilePadding) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]

          # bottom
          srcIndex = 4 * (i + ((r.png.height-1) * r.png.width))
          dstIndex = 4 * ((x+i) + ((y+j+r.png.height) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]

      # Pad left and right
      srcPixels = r.pixels
      for j in [0...r.png.height]
        for i in [0...tilePadding]
          # left
          srcIndex = 4 * (j * r.png.width)
          dstIndex = 4 * ((x+i-tilePadding) + ((y+j) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]

          # right
          srcIndex = 4 * (r.png.width-1 + (j * r.png.width))
          dstIndex = 4 * ((x+i+r.png.width) + ((y+j) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]

      # Pad corners
      tlIndex = 0
      trIndex = 4 * (r.png.width - 1)
      blIndex = 4 * (r.png.width * (r.png.height-1))
      brIndex = 4 * ((r.png.width * r.png.height)-1)
      for j in [0...tilePadding]
        for i in [0...tilePadding]
          dstIndex = 4 * ((x+i-tilePadding) + ((y+j-tilePadding) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[tlIndex]
          png.data[dstIndex+1] = srcPixels[tlIndex+1]
          png.data[dstIndex+2] = srcPixels[tlIndex+2]
          png.data[dstIndex+3] = srcPixels[tlIndex+3]
          dstIndex = 4 * ((x+i+r.png.width) + ((y+j-tilePadding) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[trIndex]
          png.data[dstIndex+1] = srcPixels[trIndex+1]
          png.data[dstIndex+2] = srcPixels[trIndex+2]
          png.data[dstIndex+3] = srcPixels[trIndex+3]
          dstIndex = 4 * ((x+i-tilePadding) + ((y+j+r.png.height) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[blIndex]
          png.data[dstIndex+1] = srcPixels[blIndex+1]
          png.data[dstIndex+2] = srcPixels[blIndex+2]
          png.data[dstIndex+3] = srcPixels[blIndex+3]
          dstIndex = 4 * ((x+i+r.png.width) + ((y+j+r.png.height) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[brIndex]
          png.data[dstIndex+1] = srcPixels[brIndex+1]
          png.data[dstIndex+2] = srcPixels[brIndex+2]
          png.data[dstIndex+3] = srcPixels[brIndex+3]

      # Copy the actual tile itself
      srcIndex = 0
      srcPixels = r.pixels
      for j in [0...r.png.height]
        for i in [0...r.png.width]
          dstIndex = 4 * ((x+i) + ((y+j) * tilesheetWidth))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]
          srcIndex += 4
      x += r.png.width + (tilePadding * 2)


    if genMetrics
      # generate metrics
      metrics = "module.exports =\n"
      metrics += "  # resource\n"
      metrics += "  _resource: 'res/gen/#{tilesheetName}.png'\n"
      metrics += "\n  # tiles by index\n  _list: [\n"
      for r in results
        metrics += "    cc.rect(#{r.x},#{r.y},#{r.png.width},#{r.png.height})\n"
      metrics += "  ]\n"
      metrics += "\n  # tiles by name\n"
      metricsArrays = {}
      for r in results
        metrics += "  #{r.name}: cc.rect(#{r.x},#{r.y},#{r.png.width},#{r.png.height})\n"
        numberMatch = trailingNumberRegex.exec(r.name)
        if numberMatch
          name = numberMatch[1]
          number = parseInt(numberMatch[2])
          if not metricsArrays[name]?
            metricsArrays[name] = []
          metricsArrays[name].push({ r: r, number: number })

      metrics += "\n  # tiles by array\n"
      for name,metricsArray of metricsArrays
        metricsArray.sort (a, b) ->
          return a.number - b.number
        metrics += "  #{name}: [\n"
        for e in metricsArray
          metrics += "    cc.rect(#{e.r.x},#{e.r.y},#{e.r.png.width},#{e.r.png.height}) # #{e.r.name}\n"
        metrics += "  ]\n"
        metrics += "  random_#{name}: -> this.#{name}[Math.floor(Math.random()*this.#{name}.length)]\n"

      fs.writeFileSync(metricsFilename, metrics)
      util.log "Generated #{metricsFilename}"

    # write tilesheet png
    png.pack().pipe(fs.createWriteStream(pngFilename))
      .on 'finish', ->
        util.log "Generated #{pngFilename} (#{results.length} tiles)"
        cb() if cb # clue in the caller of generateTilesheet that we're done

generateTilesheet = (tilesheetName, cb) ->
  generatePaddedTilesheet tilesheetName, "", 1, true, ->
    generatePaddedTilesheet(tilesheetName, "_unpadded", 0, false, cb)

generateTilemap = (filename, cb) ->
  filename = srcDir + "content/floors/#{filename}"
  results = tilemapFileRegex.exec(filename)
  if results
    name = results[1]

    rawJSON = fs.readFileSync(filename)
    tilemap = JSON.parse(rawJSON)
    collisionLayer = null
    entrancesLayer = null
    exitsLayer = null
    for layer in tilemap.layers
      if layer.name == "entrances"
        entrancesLayer = layer
      if layer.name == "exits"
        exitsLayer = layer
      if layer.name == "collision"
        collisionLayer = layer
    if not collisionLayer?
      util.log "WARNING: could not find collision layer for #{name}!"

    entrances = []
    for entrance in entrancesLayer.objects
      util.log "found entrance #{entrance.name}"
      e =
        name: entrance.name
        x: Math.floor(entrance.x / tilemap.tilewidth)
        y: tilemap.height - Math.floor(entrance.y / tilemap.tileheight)
      entrances.push e

    entranceDeclaration = "    @entrances =\n"
    for e in entrances
      entranceDeclaration += "      #{e.name}:\n"
      entranceDeclaration += "        x: #{e.x}\n"
      entranceDeclaration += "        y: #{e.y}\n"

    exits = []
    for exit in exitsLayer.objects
      util.log "found exit #{exit.name} (to floor: #{exit.properties.floor})"
      e =
        x: Math.floor(exit.x / tilemap.tilewidth)
        y: tilemap.height - Math.floor(exit.y / tilemap.tileheight)
        floor: exit.properties.floor
        entrance: exit.properties.entrance
      exits.push e

    exitDeclaration = "    # configure exits\n"
    for e in exits
      exitDeclaration += "    @grid[#{e.x}][#{e.y}].exit =\n"
      exitDeclaration += "      floor: \"#{e.floor}\"\n"
      exitDeclaration += "      entrance: \"#{e.entrance}\"\n"

    artIndices = JSON.stringify(tilemap.layers[0].data)
    collisionIndices = JSON.stringify(collisionLayer.data)

    bright = ""
    if tilemap.properties.bright
      bright = "@bright = true"

    outputFilename = srcDir + "content/floors/#{name}.coffee"
    fs.writeFileSync outputFilename, """
    artIndices = #{artIndices}
    collisionIndices = #{collisionIndices}

    class GeneratedTilemap
      constructor: ->
        @tiles = "#{name}"
        @width = #{tilemap.width}
        @height = #{tilemap.height}
        #{bright}

    #{entranceDeclaration}

        @grid = []
        for i in [0...@width]
          @grid[i] = []
          for j in [0...@height]
            index = i + ((@height-1 - j) * @width)
            @grid[i][j] =
              x: i
              y: j
              index: artIndices[index] - 1
            coll = collisionIndices[index] - 1
            if coll == 1 # wall
              @grid[i][j].wall = true
            if coll == 2 # door
              @grid[i][j].door = true

    #{exitDeclaration}

        @items = []
        @npcs = []

    module.exports = ->
      return new GeneratedTilemap()

    """
    util.log "Generated tilemap #{name} (#{outputFilename})"
  cb() if cb

buildEverything = (cb) ->
  tilemapNames = fs.readdirSync srcDir + 'content/floors'
  tilemapNames = tilemapNames.filter (name) -> !coffeeFileRegex.test(name)
  async.map tilemapNames, generateTilemap, (err) ->
    tilesheetNames = fs.readdirSync srcDir + 'art/tiles'
    tilesheetNames = tilesheetNames.filter (name) -> !coffeeFileRegex.test(name)
    async.map tilesheetNames, generateTilesheet, (err) ->
      generateJSBundle ->
        util.log "Build complete."
        cb() if cb

task 'build', 'build game', (options) ->
  buildEverything()

option '-p', '--port [PORT]', 'Dev server port'

task 'watch', 'Run dev server and watch for changed source files to automatically rebuild', (options) ->
  buildEverything ->
    util.log "Watching for changes in src"

    options.port ?= 9000
    util.log "Starting dev server on port #{options.port}..."

    nodeStatic = require 'node-static'
    file = new nodeStatic.Server '.'
    require('http').createServer (request, response) ->
      request.addListener 'end', ->
        file.serve(request, response);
      .resume()
    .listen options.port

    watch 'src', (filename) ->
      if coffeeFileRegex.test(filename)
        util.log "Source code #{filename} changed, regenerating bundle..."
        generateJSBundle()
      else
        results = tilesFileRegex.exec(filename)
        if results
          tilesheetName = results[1]
          util.log "Tile source #{filename} changed, regenerating tilesheet '#{tilesheetName}'..."
          generateTilesheet(tilesheetName)
        else
          results = tilemapFileRegex.exec(filename)
          if results
            name = results[1]
            util.log "Tilemap source #{filename} changed, regenerating tilemap '#{name}'..."
            generateTilemap(filename)
