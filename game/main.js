require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"O5ok5u":[function(require,module,exports){
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
  onTouchesCancelled: function(touches, event) {
    return console.log("onTouchesCancelled");
  }
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
},{}],3:[function(require,module,exports){
var cocos2dApp, game, myApp;

cocos2dApp = cc.Application.extend({
  config: document['ccConfig'],
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


},{"game":"O5ok5u","resources":"NN+gjI"}],"pbpqLI":[function(require,module,exports){
var Map, resources;

resources = require('resources');

Map = (function() {
  function Map(layer) {
    var size;
    size = cc.Director.getInstance().getWinSize();
    this.sprite = cc.Sprite.create(resources.splashscreen);
    console.log("map pos: " + size.width + ", " + size.height);
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


},{"resources":"NN+gjI"}],"map":[function(require,module,exports){
module.exports=require('pbpqLI');
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


},{}],"resources":[function(require,module,exports){
module.exports=require('NN+gjI');
},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXHNyY1xcZ2FtZS5jb2ZmZWUiLCIgLi5cXHNyY1xcbWFpbi5jb2ZmZWUiLCIgLi5cXHNyY1xcbWFwLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFBLHFCQUFBOztBQUFDLENBQUQsRUFBUSxFQUFBLEVBQUE7O0FBRVIsQ0FGQSxDQUVjLENBQUYsRUFBUSxDQUFSLEdBQVo7Q0FBNEIsQ0FDMUIsR0FEMEIsTUFDMUI7Q0FEMEIsQ0FFMUIsRUFGMEIsSUFFMUI7Q0FGMEIsQ0FHMUIsRUFIMEIsTUFHMUI7Q0FIMEIsQ0FJMUIsRUFKMEIsRUFJMUI7Q0FKMEIsQ0FNMUIsQ0FBTSxDQUFOLEtBQU07Q0FDSixHQUFBLEVBQUE7Q0FBQSxFQUNlLENBQWYsT0FBQTtDQURBLEVBRWUsQ0FBZixPQUFBO0NBRkEsRUFHQSxDQUFBO0NBSEEsR0FJQSxXQUFBO0NBQ0EsR0FBQSxPQUFPO0NBWmlCLEVBTXBCO0NBTm9CLENBYzFCLENBQW1CLEdBQUEsR0FBQyxRQUFwQjtDQUNLLENBQUQsQ0FBRixLQUFXLEdBQVg7Q0Fmd0IsRUFjUDtDQWRPLENBaUIxQixDQUFnQixFQUFBLEVBQUEsRUFBQyxLQUFqQjtDQUNFLEdBQUEsR0FBQTtDQUNFLEVBQWUsQ0FBZCxFQUFELEtBQUE7Q0FBQSxFQUNlLENBQWQsRUFBRCxDQUF1QixJQUF2QjtDQUNDLEVBQWMsQ0FBZCxHQUFzQixJQUF2QixFQUFBO01BSlk7Q0FqQlUsRUFpQlY7Q0FqQlUsQ0F1QjFCLENBQWdCLEVBQUEsRUFBQSxFQUFDLEtBQWpCO0NBQ0UsR0FBQSxPQUFBO0NBQ0UsR0FBRyxFQUFILENBQUE7Q0FDRSxDQUEwRCxDQUF0RCxDQUFILEdBQXNCLENBQXZCLENBQUEsRUFBZTtDQUFmLEVBQ2UsQ0FBZCxHQUFzQixDQUF2QixHQUFBO0NBQ0MsRUFBYyxDQUFkLEdBQXNCLElBQXZCLElBQUE7UUFK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LENBQUwsR0FBQTtDQUFEO0NBQUE7O0NBSHBCOztBQUlBLENBSkEsRUFJNkIsTUFBcEIsT0FBVDs7QUFDQSxDQUxBLEVBS2lCLEdBQVgsQ0FBTixFQUxBIiwic291cmNlc0NvbnRlbnQiOlsie01hcH0gPSByZXF1aXJlICdtYXAnXHJcblxyXG5HYW1lV29ybGQgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGlzTW91c2VEb3duOiBmYWxzZVxyXG4gIGhlbGxvSW1nOiBudWxsXHJcbiAgaGVsbG9MYWJlbDogbnVsbFxyXG4gIGNpcmNsZTogbnVsbFxyXG5cclxuICBpbml0OiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAdG91Y2hTdGFydFggPSAwXHJcbiAgICBAdG91Y2hTdGFydFkgPSAwXHJcbiAgICBAbWFwID0gbmV3IE1hcCh0aGlzKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgbWVudUNsb3NlQ2FsbGJhY2s6IChzZW5kZXIpIC0+XHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmVuZCgpXHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiB0b3VjaGVzXHJcbiAgICAgIEBpc01vdXNlRG93biA9IHRydWVcclxuICAgICAgQHRvdWNoU3RhcnRYID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgQHRvdWNoU3RhcnRZID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuXHJcbiAgb25Ub3VjaGVzTW92ZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEBpc01vdXNlRG93blxyXG4gICAgICBpZiB0b3VjaGVzXHJcbiAgICAgICAgQG1hcC5tb3ZlRGVsdGEodG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnggLSBAdG91Y2hTdGFydFgsIHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55IC0gQHRvdWNoU3RhcnRZKVxyXG4gICAgICAgIEB0b3VjaFN0YXJ0WCA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS54XHJcbiAgICAgICAgQHRvdWNoU3RhcnRZID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuXHJcbiAgb25Ub3VjaGVzRW5kZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIEBpc01vdXNlRG93biA9IGZhbHNlXHJcblxyXG4gIG9uVG91Y2hlc0NhbmNlbGxlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgY29uc29sZS5sb2coXCJvblRvdWNoZXNDYW5jZWxsZWRcIilcclxufVxyXG5cclxuRG93blNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBsYXllciA9IG5ldyBHYW1lV29ybGQoKVxyXG4gICAgbGF5ZXIuaW5pdCgpXHJcbiAgICBAYWRkQ2hpbGQobGF5ZXIpXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBEb3duU2NlbmU6IERvd25TY2VuZVxyXG4iLCJjb2NvczJkQXBwID0gY2MuQXBwbGljYXRpb24uZXh0ZW5kIHtcclxuICBjb25maWc6IGRvY3VtZW50WydjY0NvbmZpZyddXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc3RhcnRTY2VuZSA9IHNjZW5lXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIGRpcmVjdG9yLnJlcGxhY2VTY2VuZShuZXcgQHN0YXJ0U2NlbmUoKSlcclxuICAgICAgdGhpcylcclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbmdhbWUgPSByZXF1aXJlICdnYW1lJ1xyXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKGdhbWUuRG93blNjZW5lKVxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcblxyXG5jbGFzcyBNYXBcclxuICBjb25zdHJ1Y3RvcjogKGxheWVyKSAtPlxyXG4gICAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXHJcblxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxyXG4gICAgY29uc29sZS5sb2cgXCJtYXAgcG9zOiAje3NpemUud2lkdGh9LCAje3NpemUuaGVpZ2h0fVwiXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoc2l6ZS53aWR0aCAvIDIsIHNpemUuaGVpZ2h0IC8gMikpXHJcbiAgICBsYXllci5hZGRDaGlsZChAc3ByaXRlLCAwKVxyXG5cclxuICBtb3ZlRGVsdGE6IChkeCwgZHkpIC0+XHJcbiAgICBwb3MgPSBAc3ByaXRlLmdldFBvc2l0aW9uKClcclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24gY2MucChwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIE1hcDogTWFwXHJcbiIsInJlc291cmNlcyA9XHJcbiAgJ3NwbGFzaHNjcmVlbic6ICdyZXMvc3BsYXNoc2NyZWVuLnBuZydcclxuXHJcbmNvY29zUHJlbG9hZExpc3QgPSAoe3NyYzogdn0gZm9yIGssIHYgb2YgcmVzb3VyY2VzKVxyXG5yZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCA9IGNvY29zUHJlbG9hZExpc3RcclxubW9kdWxlLmV4cG9ydHMgPSByZXNvdXJjZXNcclxuIl19
;