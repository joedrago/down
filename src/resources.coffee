{Tilesheet, GridTilesheet} = require "gfx/tilesheet"

images =
  splashscreen: 'res/splashscreen.png'

tilesheets =
  tiles0: new Tilesheet(require('art/tiles/tiles0'))
  player: new GridTilesheet('res/player.png', 512, 256, 24, 28, 0)

cocosPreloadList = ({src: v} for k, v of images)
for tilesheetName, tilesheet of tilesheets
  cocosPreloadList.push({src: tilesheet._resource})

# for e in cocosPreloadList
#   cc.log "preload #{e.src}"

module.exports =
  images: images
  tilesheets: tilesheets
  cocosPreloadList: cocosPreloadList
