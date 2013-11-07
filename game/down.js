require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],"base/mode":[function(require,module,exports){
module.exports=require('mhMvP9');
},{}],"mhMvP9":[function(require,module,exports){
var GfxLayer, InputLayer, Mode, ModeScene;

InputLayer = cc.Layer.extend({
  init: function(mode) {
    this.mode = mode;
    this._super();
    return this.setTouchEnabled(true);
  },
  onTouchesBegan: function(touches, event) {
    var x, y;
    if (touches) {
      x = touches[0].getLocation().x;
      y = touches[0].getLocation().y;
      return this.mode.onClick(x, y);
    }
  }
});

GfxLayer = cc.Layer.extend({
  init: function(mode) {
    this.mode = mode;
    return this._super();
  }
});

ModeScene = cc.Scene.extend({
  init: function(mode) {
    this.mode = mode;
    this._super();
    this.input = new InputLayer();
    this.input.init(this.mode);
    this.addChild(this.input);
    this.gfx = new GfxLayer();
    this.gfx.init();
    return this.addChild(this.gfx);
  },
  onEnter: function() {
    this._super();
    return this.mode.onActivate();
  }
});

Mode = (function() {
  function Mode(name) {
    this.name = name;
    this.scene = new ModeScene();
    this.scene.init(this);
    this.scene.retain();
  }

  Mode.prototype.activate = function() {
    cc.log("activating mode " + this.name);
    if (cc.sawOneScene != null) {
      cc.Director.getInstance().popScene();
    } else {
      cc.sawOneScene = true;
    }
    return cc.Director.getInstance().pushScene(this.scene);
  };

  Mode.prototype.add = function(obj) {
    return this.scene.gfx.addChild(obj);
  };

  Mode.prototype.onActivate = function() {};

  Mode.prototype.onClick = function(x, y) {};

  return Mode;

})();

module.exports = Mode;


},{}],4:[function(require,module,exports){
if (typeof document !== "undefined" && document !== null) {
  require('boot/mainweb');
} else {
  require('boot/maindroid');
}


},{"boot/maindroid":"9J2gK6","boot/mainweb":"n6LVrX"}],"9J2gK6":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"mBOMH+"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('9J2gK6');
},{}],"boot/mainweb":[function(require,module,exports){
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
      var nullScene;
      require('main');
      nullScene = new cc.Scene();
      nullScene.init();
      cc.Director.getInstance().replaceScene(nullScene);
      return cc.game.modes.intro.activate();
    }, this);
    return true;
  }
});

myApp = new cocos2dApp();


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"tWG/YV":[function(require,module,exports){
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


},{}],"gfx":[function(require,module,exports){
module.exports=require('4DqqAy');
},{}],"mBOMH+":[function(require,module,exports){
var Game, GameMode, IntroMode, resources, size;

resources = require('resources');

IntroMode = require('mode/intro');

GameMode = require('mode/game');

Game = (function() {
  function Game() {
    this.modes = {
      intro: new IntroMode(),
      game: new GameMode()
    };
  }

  return Game;

})();

if (!cc.game) {
  size = cc.Director.getInstance().getWinSize();
  cc.width = size.width;
  cc.height = size.height;
  cc.game = new Game();
}


},{"mode/game":"fSCZ8s","mode/intro":"GT1UVd","resources":"NN+gjI"}],"main":[function(require,module,exports){
module.exports=require('mBOMH+');
},{}],"mode/game":[function(require,module,exports){
module.exports=require('fSCZ8s');
},{}],"fSCZ8s":[function(require,module,exports){
var GameMode, Mode, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

resources = require('resources');

GameMode = (function(_super) {
  __extends(GameMode, _super);

  function GameMode() {
    GameMode.__super__.constructor.call(this, "Game");
    this.sprite = cc.Sprite.create(resources.splashscreen);
    this.sprite.setPosition(cc.p(cc.width / 2, cc.height / 2));
    this.add(this.sprite);
  }

  GameMode.prototype.onClick = function(x, y) {
    return cc.log("game click " + x + ", " + y);
  };

  return GameMode;

})(Mode);

module.exports = GameMode;


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"GT1UVd":[function(require,module,exports){
var IntroMode, Mode, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

resources = require('resources');

IntroMode = (function(_super) {
  __extends(IntroMode, _super);

  function IntroMode() {
    IntroMode.__super__.constructor.call(this, "Intro");
    this.sprite = cc.Sprite.create(resources.splashscreen);
    this.sprite.setPosition(cc.p(cc.width / 2, cc.height / 2));
    this.add(this.sprite);
  }

  IntroMode.prototype.onClick = function(x, y) {
    cc.log("intro click " + x + ", " + y);
    return cc.game.modes.game.activate();
  };

  return IntroMode;

})(Mode);

module.exports = IntroMode;


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"mode/intro":[function(require,module,exports){
module.exports=require('GT1UVd');
},{}],"resources":[function(require,module,exports){
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


},{}],"world/floor":[function(require,module,exports){
module.exports=require('JoQcWC');
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


},{"gfx":"4DqqAy","resources":"NN+gjI"}]},{},[4])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcY29uZmlnLmNvZmZlZSIsIiAuLlxcc3JjXFxnZnguY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FDQUEsSUFBQSxpQ0FBQTs7QUFBQSxDQUFBLENBQWUsQ0FBRixFQUFRLENBQVIsSUFBYjtDQUE2QixDQUMzQixDQUFNLENBQU4sS0FBUTtDQUNOLEVBRE0sQ0FBRDtDQUNMLEdBQUEsRUFBQTtDQUNDLEdBQUEsT0FBRCxJQUFBO0NBSHlCLEVBQ3JCO0NBRHFCLENBSzNCLENBQWdCLEVBQUEsRUFBQSxFQUFDLEtBQWpCO0NBQ0UsR0FBQSxJQUFBO0NBQUEsR0FBQSxHQUFBO0NBQ0UsRUFBSSxHQUFKLENBQVksSUFBUjtDQUFKLEVBQ0ksR0FBSixDQUFZLElBQVI7Q0FDSCxDQUFnQixFQUFoQixHQUFELE1BQUE7TUFKWTtDQUxXLEVBS1g7Q0FMbEIsQ0FBYTs7QUFZYixDQVpBLENBWWEsQ0FBRixFQUFRLENBQVIsRUFBWDtDQUEyQixDQUN6QixDQUFNLENBQU4sS0FBUTtDQUNOLEVBRE0sQ0FBRDtDQUNKLEdBQUEsRUFBRCxLQUFBO0NBRnVCLEVBQ25CO0NBYlIsQ0FZVzs7QUFLWCxDQWpCQSxDQWlCYyxDQUFG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QSxNQUFBO3NCQUFBO0NBQUE7Q0FBQSxDQUFNLENBQUwsR0FBQTtDQUFEO0NBQUE7O0NBSHBCOztBQUlBLENBSkEsRUFJNkIsTUFBcEIsT0FBVDs7QUFDQSxDQUxBLEVBS2lCLEdBQVgsQ0FBTixFQUxBOzs7Ozs7QUNBQSxJQUFBLGlCQUFBO0dBQUE7a1NBQUE7O0FBQUEsQ0FBQSxFQUFBLEVBQU0sRUFBQTs7QUFDTixDQURBLEVBQ1ksSUFBQSxFQUFaLEVBQVk7O0FBRU4sQ0FITjtDQUlFOztDQUFhLENBQUEsQ0FBQSxZQUFBO0NBQ1gsR0FBQSxJQUFBO0NBQUEsR0FBQSxpQ0FBQTtDQUFBLENBQ1MsQ0FBRixDQUFQLElBQWtCLEVBQVgsQ0FBQTtDQURQLENBRVksQ0FBRixDQUFWLEVBQUEsR0FBb0MsR0FBMUI7Q0FGVixDQUdrQixFQUFsQixVQUFBO0NBSEEsQ0FJeUIsRUFBekIsRUFBTyxRQUFQO0NBSkEsQ0FLbUIsRUFBbkIsRUFBQSxFQUFBO0NBTEEsQ0FNc0IsRUFBdEIsRUFBTyxLQUFQO0NBTkEsQ0FPZSxDQUFGLENBQWIsT0FBQTtDQVBBLENBUUEsRUFBQSxJQUFBO0NBUkEsR0FTQSxXQUFBO0NBVkYsRUFBYTs7Q0FBYixDQVkwQixDQUFWLEVBQUEsRUFBQSxFQUFDLEtBQWpCO0NBQ0UsR0FBQSxJQUFBO0NBQUEsR0FBQSxHQUFBO0NBQ0UsRUFBSSxHQUFKLENBQVksSUFBUjtDQUFKLEVBQ0ksR0FBSixDQUFZLElBQVI7Q0FDRCxDQUFELENBQUYsQ0FBUSxTQUFSLElBQVE7TUFKSTtDQVpoQixFQVlnQjs7Q0FaaEI7O0NBRGtCLEVBQUc7O0FBbUJ2QixDQXRCQSxFQXNCaUIsRUF0QmpCLENBc0JNLENBQU4iLCJzb3VyY2VzQ29udGVudCI6W251bGwsIklucHV0TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIEBtb2RlLm9uQ2xpY2sgeCwgeVxyXG59XHJcblxyXG5HZnhMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbn1cclxuXHJcbk1vZGVTY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcblxyXG4gICAgQGlucHV0ID0gbmV3IElucHV0TGF5ZXIoKVxyXG4gICAgQGlucHV0LmluaXQoQG1vZGUpXHJcbiAgICBAYWRkQ2hpbGQoQGlucHV0KVxyXG5cclxuICAgIEBnZnggPSBuZXcgR2Z4TGF5ZXIoKVxyXG4gICAgQGdmeC5pbml0KClcclxuICAgIEBhZGRDaGlsZChAZ2Z4KVxyXG5cclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAbW9kZS5vbkFjdGl2YXRlKClcclxufVxyXG5cclxuY2xhc3MgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XHJcbiAgICBAc2NlbmUgPSBuZXcgTW9kZVNjZW5lKClcclxuICAgIEBzY2VuZS5pbml0KHRoaXMpXHJcbiAgICBAc2NlbmUucmV0YWluKClcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgaWYgY2Muc2F3T25lU2NlbmU/XHJcbiAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucG9wU2NlbmUoKVxyXG4gICAgZWxzZVxyXG4gICAgICBjYy5zYXdPbmVTY2VuZSA9IHRydWVcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucHVzaFNjZW5lKEBzY2VuZSlcclxuXHJcbiAgYWRkOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5hZGRDaGlsZChvYmopXHJcblxyXG4gICMgdG8gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIE1vZGVzXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZVxyXG4iLCJpZiBkb2N1bWVudD9cclxuICByZXF1aXJlICdib290L21haW53ZWInXHJcbmVsc2VcclxuICByZXF1aXJlICdib290L21haW5kcm9pZCdcclxuIiwicmVxdWlyZSAnanNiLmpzJ1xyXG5yZXF1aXJlICdtYWluJ1xyXG5cclxubnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKClcclxubnVsbFNjZW5lLmluaXQoKVxyXG5jYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJ1bldpdGhTY2VuZShudWxsU2NlbmUpXHJcbmNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxyXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcblxyXG5jb2NvczJkQXBwID0gY2MuQXBwbGljYXRpb24uZXh0ZW5kIHtcclxuICBjb25maWc6IGNvbmZpZ1xyXG4gIGN0b3I6IChzY2VuZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgY2MuQ09DT1MyRF9ERUJVRyA9IEBjb25maWdbJ0NPQ09TMkRfREVCVUcnXVxyXG4gICAgY2MuaW5pdERlYnVnU2V0dGluZygpXHJcbiAgICBjYy5zZXR1cChAY29uZmlnWyd0YWcnXSlcclxuICAgIGNjLkFwcENvbnRyb2xsZXIuc2hhcmVBcHBDb250cm9sbGVyKCkuZGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnMoKVxyXG5cclxuICBhcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogLT5cclxuICAgICAgaWYgY2MuUmVuZGVyRG9lc25vdFN1cHBvcnQoKVxyXG4gICAgICAgICAgIyBzaG93IEluZm9ybWF0aW9uIHRvIHVzZXJcclxuICAgICAgICAgIGFsZXJ0IFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIlxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAjIGluaXRpYWxpemUgZGlyZWN0b3JcclxuICAgICAgZGlyZWN0b3IgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpXHJcblxyXG4gICAgICBjYy5FR0xWaWV3LmdldEluc3RhbmNlKCkuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoMTI4MCwgNzIwLCBjYy5SRVNPTFVUSU9OX1BPTElDWS5TSE9XX0FMTClcclxuXHJcbiAgICAgICMgdHVybiBvbiBkaXNwbGF5IEZQU1xyXG4gICAgICBkaXJlY3Rvci5zZXREaXNwbGF5U3RhdHMgQGNvbmZpZ1snc2hvd0ZQUyddXHJcblxyXG4gICAgICAjIHNldCBGUFMuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIDEuMC82MCBpZiB5b3UgZG9uJ3QgY2FsbCB0aGlzXHJcbiAgICAgIGRpcmVjdG9yLnNldEFuaW1hdGlvbkludGVydmFsIDEuMCAvIEBjb25maWdbJ2ZyYW1lUmF0ZSddXHJcblxyXG4gICAgICAjIGxvYWQgcmVzb3VyY2VzXHJcbiAgICAgIHJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuICAgICAgY2MuTG9hZGVyU2NlbmUucHJlbG9hZChyZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCwgLT5cclxuICAgICAgICByZXF1aXJlICdtYWluJ1xyXG4gICAgICAgIG51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpO1xyXG4gICAgICAgIG51bGxTY2VuZS5pbml0KClcclxuICAgICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJlcGxhY2VTY2VuZShudWxsU2NlbmUpXHJcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiAgICAgIHRoaXMpXHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKClcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIENPQ09TMkRfREVCVUc6MiAjIDAgdG8gdHVybiBkZWJ1ZyBvZmYsIDEgZm9yIGJhc2ljIGRlYnVnLCBhbmQgMiBmb3IgZnVsbCBkZWJ1Z1xyXG4gIGJveDJkOmZhbHNlXHJcbiAgY2hpcG11bms6ZmFsc2VcclxuICBzaG93RlBTOnRydWVcclxuICBmcmFtZVJhdGU6MzBcclxuICBsb2FkRXh0ZW5zaW9uOmZhbHNlXHJcbiAgcmVuZGVyTW9kZTowXHJcbiAgdGFnOidnYW1lQ2FudmFzJ1xyXG4gIGFwcEZpbGVzOiBbXHJcbiAgICAnYnVuZGxlLmpzJ1xyXG4gIF1cclxuIiwiY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5MYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIExheWVyOiBMYXllclxyXG4gIFNjZW5lOiBTY2VuZVxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQG1vZGVzID1cclxuICAgICAgaW50cm86IG5ldyBJbnRyb01vZGUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZU1vZGUoKVxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy53aWR0aCA9IHNpemUud2lkdGhcclxuICBjYy5oZWlnaHQgPSBzaXplLmhlaWdodFxyXG4gIGNjLmdhbWUgPSBuZXcgR2FtZSgpXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEdhbWVNb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJHYW1lXCIpXHJcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuc3BsYXNoc2NyZWVuXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKSlcclxuICAgIEBhZGQgQHNwcml0ZVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIGNjLmxvZyBcImdhbWUgY2xpY2sgI3t4fSwgI3t5fVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVNb2RlXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEludHJvTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiSW50cm9cIilcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW5cclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxyXG4gICAgQGFkZCBAc3ByaXRlXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgY2MubG9nIFwiaW50cm8gY2xpY2sgI3t4fSwgI3t5fVwiXHJcbiAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnRyb01vZGVcclxuIiwicmVzb3VyY2VzID1cclxuICAnc3BsYXNoc2NyZWVuJzogJ3Jlcy9zcGxhc2hzY3JlZW4ucG5nJ1xyXG5cclxuY29jb3NQcmVsb2FkTGlzdCA9ICh7c3JjOiB2fSBmb3IgaywgdiBvZiByZXNvdXJjZXMpXHJcbnJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0ID0gY29jb3NQcmVsb2FkTGlzdFxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc291cmNlc1xyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iXX0=
;