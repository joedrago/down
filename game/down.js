require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],"base/mode":[function(require,module,exports){
module.exports=require('nCRJjV');
},{}],"nCRJjV":[function(require,module,exports){
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
  }

  Mode.prototype.activate = function() {
    cc.log("activating mode " + this.name);
    return cc.Director.getInstance().replaceScene(this.scene);
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


},{"boot/maindroid":"HCq9uM","boot/mainweb":"4GzHxr"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('HCq9uM');
},{}],"HCq9uM":[function(require,module,exports){
require('jsb.js');

require('main');

cc.Director.getInstance().runWithScene(cc.game.scenes.intro);


},{"main":"QhDFR6"}],"4GzHxr":[function(require,module,exports){
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
      require('main');
      return cc.game.modes.intro.activate();
    }, this);
    return true;
  }
});

myApp = new cocos2dApp();


},{"config":"iMuVlD","main":"QhDFR6","resources":"91JGgx"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('4GzHxr');
},{}],"iMuVlD":[function(require,module,exports){
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
module.exports=require('iMuVlD');
},{}],"gfx":[function(require,module,exports){
module.exports=require('4XUS/O');
},{}],"4XUS/O":[function(require,module,exports){
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


},{}],"QhDFR6":[function(require,module,exports){
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


},{"mode/game":"RoNOb3","mode/intro":"A0imZA","resources":"91JGgx"}],"main":[function(require,module,exports){
module.exports=require('QhDFR6');
},{}],"RoNOb3":[function(require,module,exports){
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


},{"base/mode":"nCRJjV","resources":"91JGgx"}],"mode/game":[function(require,module,exports){
module.exports=require('RoNOb3');
},{}],"mode/intro":[function(require,module,exports){
module.exports=require('A0imZA');
},{}],"A0imZA":[function(require,module,exports){
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


},{"base/mode":"nCRJjV","resources":"91JGgx"}],"resources":[function(require,module,exports){
module.exports=require('91JGgx');
},{}],"91JGgx":[function(require,module,exports){
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
module.exports=require('xJVDSW');
},{}],"xJVDSW":[function(require,module,exports){
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


},{"gfx":"4XUS/O","resources":"91JGgx"}]},{},[4])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcY29uZmlnLmNvZmZlZSIsIiAuLlxcc3JjXFxnZnguY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FDQUEsSUFBQSxxQ0FBQTs7QUFBQSxVQUFBLEdBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQWdCO0FBQUEsRUFDM0IsSUFBQSxFQUFNLFNBQUUsSUFBRixHQUFBO0FBQ0osSUFESyxJQUFDLENBQUEsT0FBQSxJQUNOLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBO1dBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBakIsRUFGSTtFQUFBLENBRHFCO0FBQUEsRUFLM0IsY0FBQSxFQUFnQixTQUFDLE9BQUQsRUFBVSxLQUFWLEdBQUE7QUFDZCxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUcsT0FBSDtBQUNFLE1BQUEsQ0FBQSxHQUFJLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFYLENBQUEsQ0FBd0IsQ0FBQyxDQUE3QixDQUFBO0FBQUEsTUFDQSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVgsQ0FBQSxDQUF3QixDQUFDLENBRDdCLENB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LENBQUEsQ0FBd0IsQ0FBQyxDQUE3QixDQUFBO0FBQUEsTUFDQSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVgsQ0FBQSxDQUF3QixDQUFDLENBRDdCLENBQUE7YUFFQSxFQUFFLENBQUMsR0FBSCxDQUFRLGlCQUFBLEdBQWdCLENBQWhCLEdBQW1CLElBQW5CLEdBQXNCLENBQTlCLEVBSEY7S0FEYztFQUFBLENBWmhCLENBQUE7O2VBQUE7O0dBRGtCLEdBQUcsQ0FBQyxNQUh4QixDQUFBOztBQUFBLE1Bc0JNLENBQUMsT0FBUCxHQUFpQixLQXRCakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiSW5wdXRMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiB0b3VjaGVzXHJcbiAgICAgIHggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuICAgICAgQG1vZGUub25DbGljayB4LCB5XHJcbn1cclxuXHJcbkdmeExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxufVxyXG5cclxuTW9kZVNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuXHJcbiAgICBAaW5wdXQgPSBuZXcgSW5wdXRMYXllcigpXHJcbiAgICBAaW5wdXQuaW5pdChAbW9kZSlcclxuICAgIEBhZGRDaGlsZChAaW5wdXQpXHJcblxyXG4gICAgQGdmeCA9IG5ldyBHZnhMYXllcigpXHJcbiAgICBAZ2Z4LmluaXQoKVxyXG4gICAgQGFkZENoaWxkKEBnZngpXHJcblxyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBtb2RlLm9uQWN0aXZhdGUoKVxyXG59XHJcblxyXG5jbGFzcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT5cclxuICAgIEBzY2VuZSA9IG5ldyBNb2RlU2NlbmUoKVxyXG4gICAgQHNjZW5lLmluaXQodGhpcylcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUoQHNjZW5lKVxyXG5cclxuICBhZGQ6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LmFkZENoaWxkKG9iailcclxuXHJcbiAgIyB0byBiZSBvdmVycmlkZGVuIGJ5IGRlcml2ZWQgTW9kZXNcclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlXHJcbiIsImlmIGRvY3VtZW50P1xuICByZXF1aXJlICdib290L21haW53ZWInXG5lbHNlXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xuIiwicmVxdWlyZSAnanNiLmpzJ1xucmVxdWlyZSAnbWFpbidcblxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUoY2MuZ2FtZS5zY2VuZXMuaW50cm8pXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXG5cbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xuICBjb25maWc6IGNvbmZpZ1xuICBjdG9yOiAoc2NlbmUpIC0+XG4gICAgQF9zdXBlcigpXG4gICAgY2MuQ09DT1MyRF9ERUJVRyA9IEBjb25maWdbJ0NPQ09TMkRfREVCVUcnXVxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxuICAgIGNjLkFwcENvbnRyb2xsZXIuc2hhcmVBcHBDb250cm9sbGVyKCkuZGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnMoKVxuXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxuICAgICAgaWYgY2MuUmVuZGVyRG9lc25vdFN1cHBvcnQoKVxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxuICAgICAgZGlyZWN0b3IgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpXG5cbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxuXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cblxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cblxuICAgICAgIyBsb2FkIHJlc291cmNlc1xuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuICAgICAgY2MuTG9hZGVyU2NlbmUucHJlbG9hZChyZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCwgLT5cbiAgICAgICAgcmVxdWlyZSAnbWFpbidcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXG4gICAgICB0aGlzKVxuXG4gICAgICByZXR1cm4gdHJ1ZVxufVxuXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKClcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgQ09DT1MyRF9ERUJVRzoyICMgMCB0byB0dXJuIGRlYnVnIG9mZiwgMSBmb3IgYmFzaWMgZGVidWcsIGFuZCAyIGZvciBmdWxsIGRlYnVnXG4gIGJveDJkOmZhbHNlXG4gIGNoaXBtdW5rOmZhbHNlXG4gIHNob3dGUFM6dHJ1ZVxuICBmcmFtZVJhdGU6MzBcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxuICByZW5kZXJNb2RlOjBcbiAgdGFnOidnYW1lQ2FudmFzJ1xuICBhcHBGaWxlczogW1xuICAgICdidW5kbGUuanMnXG4gIF1cbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGN0b3IoKVxuICAgIEBpbml0KClcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY3RvcigpXG4gICAgQGluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIExheWVyOiBMYXllclxuICBTY2VuZTogU2NlbmVcbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuSW50cm9Nb2RlID0gcmVxdWlyZSAnbW9kZS9pbnRybydcclxuR2FtZU1vZGUgPSByZXF1aXJlICdtb2RlL2dhbWUnXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAbW9kZXMgPVxyXG4gICAgICBpbnRybzogbmV3IEludHJvTW9kZSgpXHJcbiAgICAgIGdhbWU6IG5ldyBHYW1lTW9kZSgpXHJcblxyXG5pZiBub3QgY2MuZ2FtZVxyXG4gIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gIGNjLndpZHRoID0gc2l6ZS53aWR0aFxyXG4gIGNjLmhlaWdodCA9IHNpemUuaGVpZ2h0XHJcbiAgY2MuZ2FtZSA9IG5ldyBHYW1lKClcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgR2FtZU1vZGUgZXh0ZW5kcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcihcIkdhbWVcIilcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW5cclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxyXG4gICAgQGFkZCBAc3ByaXRlXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgY2MubG9nIFwiZ2FtZSBjbGljayAje3h9LCAje3l9XCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU1vZGVcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcblxuY2xhc3MgSW50cm9Nb2RlIGV4dGVuZHMgTW9kZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcihcIkludHJvXCIpXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxuICAgIEBhZGQgQHNwcml0ZVxuXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdzcGxhc2hzY3JlZW4nOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcblxyXG5jb2Nvc1ByZWxvYWRMaXN0ID0gKHtzcmM6IHZ9IGZvciBrLCB2IG9mIHJlc291cmNlcylcclxucmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QgPSBjb2Nvc1ByZWxvYWRMaXN0XHJcbm1vZHVsZS5leHBvcnRzID0gcmVzb3VyY2VzXHJcbiIsImdmeCA9IHJlcXVpcmUgJ2dmeCdcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcblxuY2xhc3MgRmxvb3IgZXh0ZW5kcyBnZnguTGF5ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXIoKVxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcbiAgICBAc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcbiAgICBAc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKDAsIDApKVxuICAgIEBzZXRQb3NpdGlvbihjYy5wKDEwMCwgMTAwKSlcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcblxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxuICAgIGlmIHRvdWNoZXNcbiAgICAgIHggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XG4gICAgICBjYy5sb2cgXCJ0b3VjaCBGbG9vciBhdCAje3h9LCAje3l9XCJcblxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxuIl19
;