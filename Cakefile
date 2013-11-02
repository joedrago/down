browserify = require 'browserify'
fs         = require 'fs'
util       = require 'util'

modules = [
  'resources'
  'map'
  'game'
]
apps = [
  'main'
]

srcDir = 'src/'
srcDirFromGameDir = '../' + srcDir
gameDir = 'game/'
bundleFile = gameDir + 'main.js'

task 'build', 'build game', (options) ->
  b = browserify {
    basedir: gameDir
    extensions: ['coffee']
  }
  b.transform 'coffeeify'
  for module in modules
    b.require(srcDirFromGameDir + module + '.coffee', { expose: module })
  for app in apps
    b.add srcDirFromGameDir + app + '.coffee'
  b.bundle({ debug: true })
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
