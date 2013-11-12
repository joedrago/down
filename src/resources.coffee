Tilesheet = require "gfx/tilesheet"

images =
  splashscreen: 'res/splashscreen.png'
  tiles0: 'res/tiles0.png'
  player: 'res/player.png'

tilesheets =
  tiles0: new Tilesheet(images.tiles0, 16, 16, 16)
  player: new Tilesheet(images.player, 12, 14, 18)

module.exports =
  images: images
  tilesheets: tilesheets
  cocosPreloadList: ({src: v} for k, v of images)
