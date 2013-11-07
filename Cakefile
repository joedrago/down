# -------------------------------------------------------------------------------
# Game Sources

# Assumed to be in src/XXXXX.coffee, this is also the require() string
modules = [
  'base/mode'

  'boot/mainweb'
  'boot/maindroid'

  'world/floor'

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

browserify = require 'browserify'
fs         = require 'fs'
util       = require 'util'

srcDir = 'src/'
srcDirFromGameDir = '../' + srcDir
gameDir = 'game/'
bundleFile = gameDir + 'down.js'

task 'build', 'build game', (options) ->
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
      console.log "Error #{err}"
    bundlePipe
      .pipe(require('mold-source-map').transformSourcesRelativeTo(gameDir))
      .pipe(fs.createWriteStream(bundleFile))
      .on 'finish', ->
        console.log "wrote #{bundleFile}"

task 'watch', 'Watch prod source files and build changes', ->
  invoke 'build'
  util.log "Watching for changes in src"

  for name in modules.concat(apps) then do (name) ->
    file = srcDir + name + '.coffee'
    fs.watchFile file, (curr, prev) ->
      if +curr.mtime isnt +prev.mtime
        util.log "File changed: #{file}, building..."
        invoke 'build'
