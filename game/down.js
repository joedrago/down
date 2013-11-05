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
var game;

require('jsb.js');

game = require('game');

cc.Director.getInstance().runWithScene(new game.DownScene());


},{"game":"O5ok5u"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('n6LVrX');
},{}],"n6LVrX":[function(require,module,exports){
var cocos2dApp, config, game, myApp;

config = require('config');

cocos2dApp = cc.Application.extend({
  config: config,
  ctor: function(scene) {
    this._super();
    this.startScene = scene;
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
      return director.replaceScene(new this.startScene());
    }, this);
    return true;
  }
});

game = require('game');

myApp = new cocos2dApp(game.DownScene);


},{"config":"tWG/YV","game":"O5ok5u","resources":"NN+gjI"}],"config":[function(require,module,exports){
module.exports=require('tWG/YV');
},{}],"tWG/YV":[function(require,module,exports){
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


},{}],"O5ok5u":[function(require,module,exports){
var DownScene, GameWorld, Map;

Map = require('map').Map;

GameWorld = cc.Layer.extend({
  isMouseDown: false,
  helloImg: null,
  helloLabel: null,
  circle: null,
  init: function() {
    this._super();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.map = new Map(this);
    this.setTouchEnabled(true);
    return true;
  },
  menuCloseCallback: function(sender) {
    return cc.Director.getInstance().end();
  },
  onTouchesBegan: function(touches, event) {
    if (touches) {
      this.isMouseDown = true;
      this.touchStartX = touches[0].getLocation().x;
      return this.touchStartY = touches[0].getLocation().y;
    }
  },
  onTouchesMoved: function(touches, event) {
    if (this.isMouseDown) {
      if (touches) {
        this.map.moveDelta(touches[0].getLocation().x - this.touchStartX, touches[0].getLocation().y - this.touchStartY);
        this.touchStartX = touches[0].getLocation().x;
        return this.touchStartY = touches[0].getLocation().y;
      }
    }
  },
  onTouchesEnded: function(touches, event) {
    return this.isMouseDown = false;
  },
  onTouchesCancelled: function(touches, event) {}
});

DownScene = cc.Scene.extend({
  onEnter: function() {
    var layer;
    this._super();
    layer = new GameWorld();
    layer.init();
    return this.addChild(layer);
  }
});

module.exports = {
  DownScene: DownScene
};


},{"map":"pbpqLI"}],"game":[function(require,module,exports){
module.exports=require('O5ok5u');
},{}],"map":[function(require,module,exports){
module.exports=require('pbpqLI');
},{}],"pbpqLI":[function(require,module,exports){
var Map, resources;

resources = require('resources');

Map = (function() {
  function Map(layer) {
    var size;
    size = cc.Director.getInstance().getWinSize();
    this.sprite = cc.Sprite.create(resources.splashscreen);
    this.sprite.setPosition(cc.p(size.width / 2, size.height / 2));
    layer.addChild(this.sprite, 0);
  }

  Map.prototype.moveDelta = function(dx, dy) {
    var pos;
    pos = this.sprite.getPosition();
    return this.sprite.setPosition(cc.p(pos.x + dx, pos.y + dy));
  };

  return Map;

})();

module.exports = {
  Map: Map
};


},{"resources":"NN+gjI"}],"resources":[function(require,module,exports){
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


},{}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcY29uZmlnLmNvZmZlZSIsIiAuLlxcc3JjXFxnYW1lLmNvZmZlZSIsIiAuLlxcc3JjXFxtYXAuY29mZmVlIiwiIC4uXFxzcmNcXHJlc291cmNlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBLElBQUcsZ0RBQUg7Q0FDRSxDQUFBLEtBQUEsT0FBQTtFQURGLElBQUE7Q0FHRSxDQUFBLEtBQUEsU0FBQTtFQUhGOzs7Ozs7QUNBQSxJQUFBOztBQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLENBRkEsRUFFTyxDQUFQLEVBQU8sQ0FBQTs7QUFDUCxDQUhBLENBR0UsRUFBeUMsSUFBaEMsQ0FBZ0MsRUFBM0MsQ0FBQTs7Ozs7O0FDSEEsSUFBQSwyQkFBQTs7QUFBQSxDQUFBLEVBQVMsR0FBVCxDQUFTLENBQUE7O0FBRVQsQ0FGQSxDQUVlLENBQUYsR0FBQSxJQUFiLENBQTJCO0NBQVEsQ0FDakMsSUFBQTtDQURpQyxDQUVqQyxDQUFNLENBQU4sQ0FBTSxJQUFDO0NBQ0wsR0FBQSxFQUFBO0NBQUEsRUFDYyxDQUFkLENBREEsS0FDQTtDQURBLENBRUUsQ0FBaUIsQ0FBbkIsRUFBMkIsT0FBM0IsRUFBMkI7Q0FGM0IsQ0FHRSxFQUFGLFlBQUE7Q0FIQSxDQUlFLEVBQUYsQ0FBQSxDQUFpQjtDQUNkLENBQUQsU0FBRixFQUFnQixLQUFoQixXQUFBO0NBUitCLEVBRTNCO0NBRjJCLENBVWpDLENBQStCLE1BQUEsb0JBQS9CO0NBQ0ksT0FBQSxXQUFBO0NBQUEsQ0FBSyxFQUFMLGdCQUFHO0NBRUMsSUFBQSxDQUFBLHlCQUFBO0NB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QSxDQUFBLEVBQUEsUUFBQztDQUNaLEdBQUEsSUFBQTtDQUFBLENBQVMsQ0FBRixDQUFQLElBQWtCLEVBQVgsQ0FBQTtDQUFQLENBRVksQ0FBRixDQUFWLEVBQUEsR0FBb0MsR0FBMUI7Q0FGVixDQUlzQixDQUFnQixDQUF0QyxDQUF5QixDQUFsQixLQUFQO0NBSkEsQ0FLd0IsRUFBeEIsQ0FBSyxDQUFMLEVBQUE7Q0FORixFQUFhOztDQUFiLENBUVcsQ0FBQSxNQUFYO0NBQ0UsRUFBQSxLQUFBO0NBQUEsRUFBQSxDQUFBLEVBQWEsS0FBUDtDQUNMLENBQXFCLENBQU0sQ0FBM0IsRUFBTSxLQUFQO0NBVkYsRUFRVzs7Q0FSWDs7Q0FIRjs7QUFlQSxDQWZBLEVBZ0JFLEdBREksQ0FBTjtDQUNFLENBQUEsQ0FBQTtDQWhCRixDQUFBOzs7Ozs7QUNBQSxJQUFBLDZCQUFBOztBQUFBLENBQUEsRUFDRSxNQURGO0NBQ0UsQ0FBQSxZQUFBLFFBQUE7Q0FERixDQUFBOztBQUdBLENBSEEsZUFHQTs7QUFBb0IsQ0FBQTtRQUFBLE1BQUE7c0JBQUE7Q0FBQTtDQUFBLENBQU0sQ0FBTCxHQUFBO0NBQUQ7Q0FBQTs7Q0FIcEI7O0FBSUEsQ0FKQSxFQUk2QixNQUFwQixPQUFUOztBQUNBLENBTEEsRUFLaUIsR0FBWCxDQUFOLEVBTEEiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImlmIGRvY3VtZW50P1xyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbndlYidcclxuZWxzZVxyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xyXG4iLCJyZXF1aXJlICdqc2IuanMnXHJcblxyXG5nYW1lID0gcmVxdWlyZSAnZ2FtZSdcclxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUobmV3IGdhbWUuRG93blNjZW5lKCkpXHJcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxuXHJcbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogY29uZmlnXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc3RhcnRTY2VuZSA9IHNjZW5lXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIGRpcmVjdG9yLnJlcGxhY2VTY2VuZShuZXcgQHN0YXJ0U2NlbmUoKSlcclxuICAgICAgdGhpcylcclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmdhbWUgPSByZXF1aXJlICdnYW1lJ1xyXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKGdhbWUuRG93blNjZW5lKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgQ09DT1MyRF9ERUJVRzoyICMgMCB0byB0dXJuIGRlYnVnIG9mZiwgMSBmb3IgYmFzaWMgZGVidWcsIGFuZCAyIGZvciBmdWxsIGRlYnVnXHJcbiAgYm94MmQ6ZmFsc2VcclxuICBjaGlwbXVuazpmYWxzZVxyXG4gIHNob3dGUFM6dHJ1ZVxyXG4gIGZyYW1lUmF0ZTozMFxyXG4gIGxvYWRFeHRlbnNpb246ZmFsc2VcclxuICByZW5kZXJNb2RlOjBcclxuICB0YWc6J2dhbWVDYW52YXMnXHJcbiAgYXBwRmlsZXM6IFtcclxuICAgICdidW5kbGUuanMnXHJcbiAgXVxyXG4iLCJ7TWFwfSA9IHJlcXVpcmUgJ21hcCdcclxuXHJcbkdhbWVXb3JsZCA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaXNNb3VzZURvd246IGZhbHNlXHJcbiAgaGVsbG9JbWc6IG51bGxcclxuICBoZWxsb0xhYmVsOiBudWxsXHJcbiAgY2lyY2xlOiBudWxsXHJcblxyXG4gIGluaXQ6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEB0b3VjaFN0YXJ0WCA9IDBcclxuICAgIEB0b3VjaFN0YXJ0WSA9IDBcclxuICAgIEBtYXAgPSBuZXcgTWFwKHRoaXMpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBtZW51Q2xvc2VDYWxsYmFjazogKHNlbmRlcikgLT5cclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZW5kKClcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIHRvdWNoZXNcclxuICAgICAgQGlzTW91c2VEb3duID0gdHJ1ZVxyXG4gICAgICBAdG91Y2hTdGFydFggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICBAdG91Y2hTdGFydFkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQGlzTW91c2VEb3duXHJcbiAgICAgIGlmIHRvdWNoZXNcclxuICAgICAgICBAbWFwLm1vdmVEZWx0YSh0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueCAtIEB0b3VjaFN0YXJ0WCwgdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnkgLSBAdG91Y2hTdGFydFkpXHJcbiAgICAgICAgQHRvdWNoU3RhcnRYID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgICBAdG91Y2hTdGFydFkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgQGlzTW91c2VEb3duID0gZmFsc2VcclxuXHJcbiAgb25Ub3VjaGVzQ2FuY2VsbGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nKFwib25Ub3VjaGVzQ2FuY2VsbGVkXCIpXHJcbn1cclxuXHJcbkRvd25TY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgb25FbnRlcjogLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgbGF5ZXIgPSBuZXcgR2FtZVdvcmxkKClcclxuICAgIGxheWVyLmluaXQoKVxyXG4gICAgQGFkZENoaWxkKGxheWVyKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgRG93blNjZW5lOiBEb3duU2NlbmVcclxuIiwicmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChsYXllcikgLT5cclxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG5cclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW5cclxuICAgICMgY29uc29sZS5sb2cgXCJtYXAgcG9zOiAje3NpemUud2lkdGh9LCAje3NpemUuaGVpZ2h0fVwiXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoc2l6ZS53aWR0aCAvIDIsIHNpemUuaGVpZ2h0IC8gMikpXHJcbiAgICBsYXllci5hZGRDaGlsZChAc3ByaXRlLCAwKVxyXG5cclxuICBtb3ZlRGVsdGE6IChkeCwgZHkpIC0+XHJcbiAgICBwb3MgPSBAc3ByaXRlLmdldFBvc2l0aW9uKClcclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24gY2MucChwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIE1hcDogTWFwXHJcbiIsInJlc291cmNlcyA9XHJcbiAgJ3NwbGFzaHNjcmVlbic6ICdyZXMvc3BsYXNoc2NyZWVuLnBuZydcclxuXHJcbmNvY29zUHJlbG9hZExpc3QgPSAoe3NyYzogdn0gZm9yIGssIHYgb2YgcmVzb3VyY2VzKVxyXG5yZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCA9IGNvY29zUHJlbG9hZExpc3RcclxubW9kdWxlLmV4cG9ydHMgPSByZXNvdXJjZXNcclxuIl19
;