Tilesheet = require "gfx/tilesheet"

images =
  splashscreen: 'res/splashscreen.png'

tilesheets =
  tiles0: new Tilesheet(require('art/tiles/tiles0'))
  player: new Tilesheet(require('art/tiles/player'))
  town: new Tilesheet(require('art/tiles/town'))

cocosPreloadList = ({src: v} for k, v of images)
for tilesheetName, tilesheet of tilesheets
  cocosPreloadList.push({src: tilesheet._resource})

# for e in cocosPreloadList
#   cc.log "preload #{e.src}"

module.exports =
  images: images
  tilesheets: tilesheets
  cocosPreloadList: cocosPreloadList
