resources =
  'HelloWorld': 'res/HelloWorld.png'

cocosPreloadList = ({src: v} for k, v of resources)
resources.cocosPreloadList = cocosPreloadList
module.exports = resources
