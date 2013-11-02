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
    cc.EGLView.getInstance().setDesignResolutionSize(720, 1280, cc.RESOLUTION_POLICY.SHOW_ALL);
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
var Map;

Map = (function() {
  function Map(layer) {
    var size;
    size = cc.Director.getInstance().getWinSize();
    this.sprite = cc.Sprite.create("res/HelloWorld.png");
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


},{}],"map":[function(require,module,exports){
module.exports=require('pbpqLI');
},{}],"NN+gjI":[function(require,module,exports){
var cocosPreloadList, k, resources, v;

resources = {
  'HelloWorld': 'res/HelloWorld.png'
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXHNyY1xcZ2FtZS5jb2ZmZWUiLCIgLi5cXHNyY1xcbWFpbi5jb2ZmZWUiLCIgLi5cXHNyY1xcbWFwLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFBLHFCQUFBOztBQUFDLENBQUQsRUFBUSxFQUFBLEVBQUE7O0FBRVIsQ0FGQSxDQUVjLENBQUYsRUFBUSxDQUFSLEdBQVo7Q0FBNEIsQ0FDMUIsR0FEMEIsTUFDMUI7Q0FEMEIsQ0FFMUIsRUFGMEIsSUFFMUI7Q0FGMEIsQ0FHMUIsRUFIMEIsTUFHMUI7Q0FIMEIsQ0FJMUIsRUFKMEIsRUFJMUI7Q0FKMEIsQ0FNMUIsQ0FBTSxDQUFOLEtBQU07Q0FDSixHQUFBLEVBQUE7Q0FBQSxFQUNlLENBQWYsT0FBQTtDQURBLEVBRWUsQ0FBZixPQUFBO0NBRkEsRUFHQSxDQUFBO0NBSEEsR0FJQSxXQUFBO0NBQ0EsR0FBQSxPQUFPO0NBWmlCLEVBTXBCO0NBTm9CLENBYzFCLENBQW1CLEdBQUEsR0FBQyxRQUFwQjtDQUNLLENBQUQsQ0FBRixLQUFXLEdBQVg7Q0Fmd0IsRUFjUDtDQWRPLENBaUIxQixDQUFnQixFQUFBLEVBQUEsRUFBQyxLQUFqQjtDQUNFLEdBQUEsR0FBQTtDQUNFLEVBQWUsQ0FBZCxFQUFELEtBQUE7Q0FBQSxFQUNlLENBQWQsRUFBRCxDQUF1QixJQUF2QjtDQUNDLEVBQWMsQ0FBZCxHQUFzQixJQUF2QixFQUFBO01BSlk7Q0FqQlUsRUFpQlY7Q0FqQlUsQ0F1QjFCLENBQWdCLEVBQUEsRUFBQSxFQUFDLEtBQWpCO0NBQ0UsR0FBQSxPQUFBO0NBQ0UsR0FBRyxFQUFILENBQUE7Q0FDRSxDQUEwRCxDQUF0RCxDQUFILEdBQXNCLENBQXZCLENBQUEsRUFBZTtDQUFmLEVBQ2UsQ0FBZCxHQUFzQixDQUF2QixHQUFBO0NBQ0MsRUFBYyxDQUFkLEdBQXNCLElBQXZCLElBQUE7UUFK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QUk2QixNQUFwQixPQUFUOztBQUNBLENBTEEsRUFLaUIsR0FBWCxDQUFOLEVBTEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7TWFwfSA9IHJlcXVpcmUgJ21hcCdcclxuXHJcbkdhbWVXb3JsZCA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaXNNb3VzZURvd246IGZhbHNlXHJcbiAgaGVsbG9JbWc6IG51bGxcclxuICBoZWxsb0xhYmVsOiBudWxsXHJcbiAgY2lyY2xlOiBudWxsXHJcblxyXG4gIGluaXQ6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEB0b3VjaFN0YXJ0WCA9IDBcclxuICAgIEB0b3VjaFN0YXJ0WSA9IDBcclxuICAgIEBtYXAgPSBuZXcgTWFwKHRoaXMpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBtZW51Q2xvc2VDYWxsYmFjazogKHNlbmRlcikgLT5cclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZW5kKClcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIHRvdWNoZXNcclxuICAgICAgQGlzTW91c2VEb3duID0gdHJ1ZVxyXG4gICAgICBAdG91Y2hTdGFydFggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICBAdG91Y2hTdGFydFkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQGlzTW91c2VEb3duXHJcbiAgICAgIGlmIHRvdWNoZXNcclxuICAgICAgICBAbWFwLm1vdmVEZWx0YSh0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueCAtIEB0b3VjaFN0YXJ0WCwgdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnkgLSBAdG91Y2hTdGFydFkpXHJcbiAgICAgICAgQHRvdWNoU3RhcnRYID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgICBAdG91Y2hTdGFydFkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgQGlzTW91c2VEb3duID0gZmFsc2VcclxuXHJcbiAgb25Ub3VjaGVzQ2FuY2VsbGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBjb25zb2xlLmxvZyhcIm9uVG91Y2hlc0NhbmNlbGxlZFwiKVxyXG59XHJcblxyXG5Eb3duU2NlbmUgPSBjYy5TY2VuZS5leHRlbmQge1xyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIGxheWVyID0gbmV3IEdhbWVXb3JsZCgpXHJcbiAgICBsYXllci5pbml0KClcclxuICAgIEBhZGRDaGlsZChsYXllcilcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIERvd25TY2VuZTogRG93blNjZW5lXHJcbiIsImNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogZG9jdW1lbnRbJ2NjQ29uZmlnJ11cclxuICBjdG9yOiAoc2NlbmUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBzdGFydFNjZW5lID0gc2NlbmVcclxuICAgIGNjLkNPQ09TMkRfREVCVUcgPSBAY29uZmlnWydDT0NPUzJEX0RFQlVHJ11cclxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxyXG4gICAgY2Muc2V0dXAoQGNvbmZpZ1sndGFnJ10pXHJcbiAgICBjYy5BcHBDb250cm9sbGVyLnNoYXJlQXBwQ29udHJvbGxlcigpLmRpZEZpbmlzaExhdW5jaGluZ1dpdGhPcHRpb25zKClcclxuXHJcbiAgYXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IC0+XHJcbiAgICAgIGlmIGNjLlJlbmRlckRvZXNub3RTdXBwb3J0KClcclxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXHJcbiAgICAgICAgICBhbGVydCBcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCJcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgIyBpbml0aWFsaXplIGRpcmVjdG9yXHJcbiAgICAgIGRpcmVjdG9yID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKVxyXG5cclxuICAgICAgY2MuRUdMVmlldy5nZXRJbnN0YW5jZSgpLnNldERlc2lnblJlc29sdXRpb25TaXplKDcyMCwgMTI4MCwgY2MuUkVTT0xVVElPTl9QT0xJQ1kuU0hPV19BTEwpXHJcblxyXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcclxuICAgICAgZGlyZWN0b3Iuc2V0RGlzcGxheVN0YXRzIEBjb25maWdbJ3Nob3dGUFMnXVxyXG5cclxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xyXG4gICAgICBkaXJlY3Rvci5zZXRBbmltYXRpb25JbnRlcnZhbCAxLjAgLyBAY29uZmlnWydmcmFtZVJhdGUnXVxyXG5cclxuICAgICAgIyBsb2FkIHJlc291cmNlc1xyXG4gICAgICByZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbiAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQocmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QsIC0+XHJcbiAgICAgICAgZGlyZWN0b3IucmVwbGFjZVNjZW5lKG5ldyBAc3RhcnRTY2VuZSgpKVxyXG4gICAgICB0aGlzKVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxuZ2FtZSA9IHJlcXVpcmUgJ2dhbWUnXHJcbm15QXBwID0gbmV3IGNvY29zMmRBcHAoZ2FtZS5Eb3duU2NlbmUpXHJcbiIsIlxyXG5jbGFzcyBNYXBcclxuICBjb25zdHJ1Y3RvcjogKGxheWVyKSAtPlxyXG4gICAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXHJcblxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUoXCJyZXMvSGVsbG9Xb3JsZC5wbmdcIilcclxuICAgIGNvbnNvbGUubG9nIFwibWFwIHBvczogI3tzaXplLndpZHRofSwgI3tzaXplLmhlaWdodH1cIlxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHNpemUud2lkdGggLyAyLCBzaXplLmhlaWdodCAvIDIpKVxyXG4gICAgbGF5ZXIuYWRkQ2hpbGQoQHNwcml0ZSwgMClcclxuXHJcbiAgbW92ZURlbHRhOiAoZHgsIGR5KSAtPlxyXG4gICAgcG9zID0gQHNwcml0ZS5nZXRQb3NpdGlvbigpXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uIGNjLnAocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBNYXA6IE1hcFxyXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdIZWxsb1dvcmxkJzogJ3Jlcy9IZWxsb1dvcmxkLnBuZydcclxuXHJcbmNvY29zUHJlbG9hZExpc3QgPSAoe3NyYzogdn0gZm9yIGssIHYgb2YgcmVzb3VyY2VzKVxyXG5yZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCA9IGNvY29zUHJlbG9hZExpc3RcclxubW9kdWxlLmV4cG9ydHMgPSByZXNvdXJjZXNcclxuIl19
;