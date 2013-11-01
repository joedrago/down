{spawn, exec} = require 'child_process'
fs            = require 'fs'
util          = require 'util'


files = [
    'src/resources.coffee'
    'src/game.coffee'
]

cmdExt = ''
pathSeparator = ':'
dirSeparator = '/'

# This is really stupid
if process.platform == 'win32'
  cmdExt = '.cmd'
  pathSeparator = ';'
  dirSeparator = '\\'

# This also sucks
process.env["PATH"] = process.env["PATH"] + pathSeparator + __dirname + dirSeparator + 'node_modules' + dirSeparator + '.bin'

task 'build', 'build game', (options) ->
  appContents = new Array remaining = files.length
  for file, index in files then do (file, index) ->
    fs.readFile file, 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFileSync 'game/game.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err

  coffee = spawn 'coffee' + cmdExt, ['-mcb', 'game.coffee'], { cwd: 'game' }
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()
  coffee.stderr.on 'data', (data) -> console.log data.toString().trim()

task 'watch', 'Watch prod source files and build changes', ->
  invoke 'build'
  util.log "Watching for changes in src"

  for file in files then do (file) ->
    fs.watchFile file, (curr, prev) ->
      if +curr.mtime isnt +prev.mtime
        util.log "File changed: #{file}, building..."
        invoke 'build'
