require 'jsb.js'
require 'main'

nullScene = new cc.Scene()
nullScene.init()
cc.Director.getInstance().runWithScene(nullScene)
cc.modes.intro.activate()
