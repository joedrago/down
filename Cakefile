{spawn, exec} = require 'child_process'
fs            = require 'fs'

files = [
    'src/resources.coffee'
    'src/game.coffee'
]

option '-w', '--watch', 'watch for changes and rebuild/rerun accordingly'

coffeeName = 'coffee'

# This is really stupid
if process.platform == 'win32'
    coffeeName += '.cmd'

task 'build', 'build game', (options) ->
    coffee = spawn coffeeName, ['-mcb' + (if options.watch then 'w' else ''), '-o', 'game', '-j', 'game.js'].concat files
    coffee.stdout.on 'data', (data) -> console.log data.toString().trim()
    coffee.stderr.on 'data', (data) -> console.log data.toString().trim()
