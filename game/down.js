require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
if (typeof document !== "undefined" && document !== null) {
  require('boot/mainweb');
} else {
  require('boot/maindroid');
}


},{"boot/maindroid":"9J2gK6","boot/mainweb":"n6LVrX"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('9J2gK6');
},{}],"9J2gK6":[function(require,module,exports){
require('jsb.js');

require('game');

cc.Director.getInstance().runWithScene(cc.game.scenes.intro);


},{"game":"O5ok5u"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('n6LVrX');
},{}],"n6LVrX":[function(require,module,exports){
var cocos2dApp, config, myApp;

config = require('config');

cocos2dApp = cc.Application.extend({
  config: config,
  ctor: function(scene) {
    this._super();
    cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
    cc.initDebugSetting();
    cc.setup(this.config['tag']);
    return cc.AppController.shareAppController().didFinishLaunchingWithOptions();
  },
  applicationDidFinishLaunching: function() {
    var director, resources;
    if (cc.RenderDoesnotSupport()) {
      alert("Browser doesn't support WebGL");
      return false;
    }
    director = cc.Director.getInstance();
    cc.EGLView.getInstance().setDesignResolutionSize(1280, 720, cc.RESOLUTION_POLICY.SHOW_ALL);
    director.setDisplayStats(this.config['showFPS']);
    director.setAnimationInterval(1.0 / this.config['frameRate']);
    resources = require('resources');
    cc.LoaderScene.preload(resources.cocosPreloadList, function() {
      require('game');
      return director.replaceScene(cc.game.scenes.intro);
    }, this);
    return true;
  }
});

myApp = new cocos2dApp();


},{"config":"tWG/YV","game":"O5ok5u","resources":"NN+gjI"}],"tWG/YV":[function(require,module,exports){
module.exports = {
  COCOS2D_DEBUG: 2,
  box2d: false,
  chipmunk: false,
  showFPS: true,
  frameRate: 30,
  loadExtension: false,
  renderMode: 0,
  tag: 'gameCanvas',
  appFiles: ['bundle.js']
};


},{}],"config":[function(require,module,exports){
module.exports=require('tWG/YV');
},{}],"O5ok5u":[function(require,module,exports){
var Floor, Game, GameLayer, GameScene, IntroScene, gfx, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

gfx = require('gfx');

Floor = require('world/floor');

IntroScene = require('intro');

resources = require('resources');

GameLayer = (function(_super) {
  __extends(GameLayer, _super);

  function GameLayer() {
    GameLayer.__super__.constructor.call(this);
    this.addChild(new Floor());
  }

  return GameLayer;

})(gfx.Layer);

GameScene = (function(_super) {
  __extends(GameScene, _super);

  function GameScene() {
    var layer;
    GameScene.__super__.constructor.call(this);
    layer = new GameLayer();
    this.addChild(layer);
  }

  return GameScene;

})(gfx.Scene);

Game = (function() {
  function Game() {
    this.scenes = {
      intro: new IntroScene(),
      game: new GameScene()
    };
  }

  return Game;

})();

if (!cc.game) {
  cc.game = new Game();
}


},{"gfx":"4DqqAy","intro":"PtheR1","resources":"NN+gjI","world/floor":"JoQcWC"}],"game":[function(require,module,exports){
module.exports=require('O5ok5u');
},{}],"gfx":[function(require,module,exports){
module.exports=require('4DqqAy');
},{}],"4DqqAy":[function(require,module,exports){
var Layer, Scene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Layer = (function(_super) {
  __extends(Layer, _super);

  function Layer() {
    this.ctor();
    this.init();
  }

  return Layer;

})(cc.Layer);

Scene = (function(_super) {
  __extends(Scene, _super);

  function Scene() {
    this.ctor();
    this.init();
  }

  return Scene;

})(cc.Scene);

module.exports = {
  Layer: Layer,
  Scene: Scene
};


},{}],"intro":[function(require,module,exports){
module.exports=require('PtheR1');
},{}],"PtheR1":[function(require,module,exports){
var IntroLayer, IntroScene, gfx, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

gfx = require('gfx');

resources = require('resources');

IntroLayer = (function(_super) {
  __extends(IntroLayer, _super);

  function IntroLayer() {
    IntroLayer.__super__.constructor.call(this);
    this.setTouchEnabled(true);
  }

  IntroLayer.prototype.onTouchesBegan = function(touches, event) {
    var x, y;
    if (touches) {
      x = touches[0].getLocation().x;
      y = touches[0].getLocation().y;
      cc.log("touch intro layer at " + x + ", " + y);
      return cc.Director.getInstance().replaceScene(cc.game.scenes.game);
    }
  };

  return IntroLayer;

})(gfx.Layer);

IntroScene = (function(_super) {
  __extends(IntroScene, _super);

  function IntroScene() {
    var layer, size;
    IntroScene.__super__.constructor.call(this);
    layer = new IntroLayer();
    this.addChild(layer);
    size = cc.Director.getInstance().getWinSize();
    this.sprite = cc.Sprite.create(resources.splashscreen);
    this.sprite.setPosition(cc.p(size.width / 2, size.height / 2));
    layer.addChild(this.sprite, 0);
  }

  return IntroScene;

})(gfx.Scene);

module.exports = IntroScene;


},{"gfx":"4DqqAy","resources":"NN+gjI"}],"resources":[function(require,module,exports){
module.exports=require('NN+gjI');
},{}],"NN+gjI":[function(require,module,exports){
var cocosPreloadList, k, resources, v;

resources = {
  'splashscreen': 'res/splashscreen.png'
};

cocosPreloadList = (function() {
  var _results;
  _results = [];
  for (k in resources) {
    v = resources[k];
    _results.push({
      src: v
    });
  }
  return _results;
})();

resources.cocosPreloadList = cocosPreloadList;

module.exports = resources;


},{}],"JoQcWC":[function(require,module,exports){
var Floor, gfx, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

gfx = require('gfx');

resources = require('resources');

Floor = (function(_super) {
  __extends(Floor, _super);

  function Floor() {
    var size;
    Floor.__super__.constructor.call(this);
    size = cc.Director.getInstance().getWinSize();
    this.sprite = cc.Sprite.create(resources.splashscreen, cc.rect(450, 300, 16, 16));
    this.setAnchorPoint(cc.p(0, 0));
    this.sprite.setAnchorPoint(cc.p(0, 0));
    this.addChild(this.sprite, 0);
    this.sprite.setPosition(cc.p(0, 0));
    this.setPosition(cc.p(100, 100));
    this.setScale(10, 10);
    this.setTouchEnabled(true);
  }

  Floor.prototype.onTouchesBegan = function(touches, event) {
    var x, y;
    if (touches) {
      x = touches[0].getLocation().x;
      y = touches[0].getLocation().y;
      return cc.log("touch Floor at " + x + ", " + y);
    }
  };

  return Floor;

})(gfx.Layer);

module.exports = Floor;


},{"gfx":"4DqqAy","resources":"NN+gjI"}],"world/floor":[function(require,module,exports){
module.exports=require('JoQcWC');
},{}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcY29uZmlnLmNvZmZlZSIsIiAuLlxcc3JjXFxnYW1lLmNvZmZlZSIsIiAuLlxcc3JjXFxnZnguY29mZmVlIiwiIC4uXFxzcmNcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBLElBQUcsZ0RBQUg7Q0FDRSxDQUFBLEtBQUEsT0FBQTtFQURGLElBQUE7Q0FHRSxDQUFBLEtBQUEsU0FBQTtFQUhGOzs7Ozs7QUNBQSxDQUFRLE1BQVIsQ0FBQTs7QUFDQSxDQURBLEtBQ0EsQ0FBQTs7QUFFQSxDQUhBLENBR0UsRUFBNEMsQ0FBOUMsQ0FBcUQsRUFBMUMsR0FBWCxDQUFBOzs7Ozs7QUNIQSxJQUFBLHFCQUFBOztBQUFBLENBQUEsRUFBUyxHQUFULENBQVMsQ0FBQTs7QUFFVCxDQUZBLENBRWUsQ0FBRixHQUFBLElBQWIsQ0FBMkI7Q0FBUSxDQUNqQyxJQUFBO0NBRGlDLENBRWpDLENBQU0sQ0FBTixDQUFNLElBQUM7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxDQUNFLENBQWlCLENBQW5CLEVBQTJCLE9BQTNCLEVBQTJCO0NBRDNCLENBRUUsRUFBRixZQUFBO0NBRkEsQ0FHRSxFQUFGLENBQUEsQ0FBaUI7Q0FDZCxDQUFELFNBQUYsRUFBZ0IsS0FBaEIsV0FBQTtDQVArQixFQUUzQjtDQUYyQixDQVNqQyxDQUErQixNQUFBLG9CQUEvQjtDQUNJLE9BQUEsV0FBQTtDQUFBLENBQUssRUFBTCxnQkFBRztDQUVDLElB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QUEsRUFBQTtDQUxBLENBTXNCLEVBQXRCLEVBQU8sS0FBUDtDQU5BLENBT2UsQ0FBRixDQUFiLE9BQUE7Q0FQQSxDQVFBLEVBQUEsSUFBQTtDQVJBLEdBU0EsV0FBQTtDQVZGLEVBQWE7O0NBQWIsQ0FZMEIsQ0FBVixFQUFBLEVBQUEsRUFBQyxLQUFqQjtDQUNFLEdBQUEsSUFBQTtDQUFBLEdBQUEsR0FBQTtDQUNFLEVBQUksR0FBSixDQUFZLElBQVI7Q0FBSixFQUNJLEdBQUosQ0FBWSxJQUFSO0NBQ0QsQ0FBRCxDQUFGLENBQVEsU0FBUixJQUFRO01BSkk7Q0FaaEIsRUFZZ0I7O0NBWmhCOztDQURrQixFQUFHOztBQW1CdkIsQ0F0QkEsRUFzQmlCLEVBdEJqQixDQXNCTSxDQUFOIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpZiBkb2N1bWVudD9cclxuICByZXF1aXJlICdib290L21haW53ZWInXHJcbmVsc2VcclxuICByZXF1aXJlICdib290L21haW5kcm9pZCdcclxuIiwicmVxdWlyZSAnanNiLmpzJ1xyXG5yZXF1aXJlICdnYW1lJ1xyXG5cclxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUoY2MuZ2FtZS5zY2VuZXMuaW50cm8pXHJcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxuXHJcbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogY29uZmlnXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIHJlcXVpcmUgJ2dhbWUnXHJcbiAgICAgICAgZGlyZWN0b3IucmVwbGFjZVNjZW5lKGNjLmdhbWUuc2NlbmVzLmludHJvKVxyXG4gICAgICB0aGlzKVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxubXlBcHAgPSBuZXcgY29jb3MyZEFwcCgpXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjMwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcbiIsImdmeCA9IHJlcXVpcmUgJ2dmeCdcclxuRmxvb3IgPSByZXF1aXJlICd3b3JsZC9mbG9vcidcclxuSW50cm9TY2VuZSA9IHJlcXVpcmUgJ2ludHJvJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcblxyXG5jbGFzcyBHYW1lTGF5ZXIgZXh0ZW5kcyBnZnguTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIEBhZGRDaGlsZChuZXcgRmxvb3IoKSlcclxuXHJcbmNsYXNzIEdhbWVTY2VuZSBleHRlbmRzIGdmeC5TY2VuZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoKVxyXG4gICAgbGF5ZXIgPSBuZXcgR2FtZUxheWVyKClcclxuICAgIEBhZGRDaGlsZChsYXllcilcclxuXHJcbmNsYXNzIEdhbWVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBzY2VuZXMgPVxyXG4gICAgICBpbnRybzogbmV3IEludHJvU2NlbmUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZVNjZW5lKClcclxuXHJcbmlmIG5vdCBjYy5nYW1lXHJcbiAgY2MuZ2FtZSA9IG5ldyBHYW1lKClcclxuIiwiY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5MYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIExheWVyOiBMYXllclxyXG4gIFNjZW5lOiBTY2VuZVxyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEludHJvTGF5ZXIgZXh0ZW5kcyBnZnguTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIHRvdWNoZXNcclxuICAgICAgeCA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS54XHJcbiAgICAgIHkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG4gICAgICBjYy5sb2cgXCJ0b3VjaCBpbnRybyBsYXllciBhdCAje3h9LCAje3l9XCJcclxuICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUoY2MuZ2FtZS5zY2VuZXMuZ2FtZSlcclxuXHJcbmNsYXNzIEludHJvU2NlbmUgZXh0ZW5kcyBnZnguU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIGxheWVyID0gbmV3IEludHJvTGF5ZXIoKVxyXG4gICAgQGFkZENoaWxkKGxheWVyKVxyXG5cclxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHNpemUud2lkdGggLyAyLCBzaXplLmhlaWdodCAvIDIpKVxyXG4gICAgbGF5ZXIuYWRkQ2hpbGQoQHNwcml0ZSwgMClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW50cm9TY2VuZVxyXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdzcGxhc2hzY3JlZW4nOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcblxyXG5jb2Nvc1ByZWxvYWRMaXN0ID0gKHtzcmM6IHZ9IGZvciBrLCB2IG9mIHJlc291cmNlcylcclxucmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QgPSBjb2Nvc1ByZWxvYWRMaXN0XHJcbm1vZHVsZS5leHBvcnRzID0gcmVzb3VyY2VzXHJcbiIsImdmeCA9IHJlcXVpcmUgJ2dmeCdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgRmxvb3IgZXh0ZW5kcyBnZnguTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlbiwgY2MucmVjdCg0NTAsMzAwLDE2LDE2KVxyXG4gICAgQHNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAYWRkQ2hpbGQoQHNwcml0ZSwgMClcclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucCgwLCAwKSlcclxuICAgIEBzZXRQb3NpdGlvbihjYy5wKDEwMCwgMTAwKSlcclxuICAgIEBzZXRTY2FsZSgxMCwgMTApXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiB0b3VjaGVzXHJcbiAgICAgIHggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuICAgICAgY2MubG9nIFwidG91Y2ggRmxvb3IgYXQgI3t4fSwgI3t5fVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yXHJcbiJdfQ==
;