# -------------------------------------------------------------------------------
# Game Sources

# Assumed to be in src/XXXXX.coffee, @is also the require() string
modules = [
  'base/mode'

  'boot/mainweb'
  'boot/maindroid'

  'brain/brain'
  'brain/player'

  'gfx/tilesheet'

  'world/floor'
  'world/floorgen'
  'world/pathfinder'

  'mode/intro'
  'mode/game'

  'config'
  'resources'
  'gfx'
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

tilePadding = 0

coffeeFileRegex = /\.coffee$/
tilesFileRegex = /[\\\/]tiles[\\\/]([^\\\/]+)[\\\/]\d+\.png$/

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
  png = pngReader.load filename
  png.decode (pixels) ->
    return cb(null, { filename: filename, png: png, pixels: pixels })

generateTilesheet = (tilesheetName, cb) ->
  outputFilename = "game/res/#{tilesheetName}.png"
  tiles = fs.readdirSync srcDir + 'art/tiles/' + tilesheetName
  tiles.sort()
  filenames = ("#{srcDir}art/tiles/#{tilesheetName}/#{t}" for t in tiles)
  async.map filenames, readpng, (err, results) ->
    png = new pngWriter {
      width: 512
      height: 512
      filterType: -1
    }

    x = tilePadding
    y = tilePadding
    maxY = 0
    for r in results
      if (x + r.png.width) > png.height
        x = tilePadding
        y += maxY + (tilePadding * 2)
        maxY = 0
      if maxY < r.png.height
        maxY = r.png.height
      srcIndex = 0
      srcPixels = r.pixels
      for j in [0...r.png.height]
        for i in [0...r.png.width]
          dstIndex = 4 * ((x+i) + ((y+j) * 512))
          png.data[dstIndex]   = srcPixels[srcIndex]
          png.data[dstIndex+1] = srcPixels[srcIndex+1]
          png.data[dstIndex+2] = srcPixels[srcIndex+2]
          png.data[dstIndex+3] = srcPixels[srcIndex+3]
          srcIndex += 4
      x += r.png.width + (tilePadding * 2)

    png.pack().pipe(fs.createWriteStream(outputFilename))
      .on 'finish', ->
        util.log "Generated #{outputFilename} (#{results.length} tiles)"
        cb() if cb # clue in the caller of generateTilesheet that we're done

buildEverything = (cb) ->
  generateJSBundle ->
    tilesheetNames = fs.readdirSync srcDir + 'art/tiles'
    async.map tilesheetNames, generateTilesheet, (err) ->
      util.log "Build complete."
      cb() if cb

task 'build', 'build game', (options) ->
  buildEverything()

task 'watch', 'Watch prod source files and build changes', ->
  buildEverything ->
    util.log "Watching for changes in src"

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
