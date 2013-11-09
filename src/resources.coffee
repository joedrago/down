resources =
  'splashscreen': 'res/splashscreen.png'
  'tiles0': 'res/tiles0.png'
  'player': 'res/player.png'

cocosPreloadList = ({src: v} for k, v of resources)
resources.cocosPreloadList = cocosPreloadList
module.exports = resources
