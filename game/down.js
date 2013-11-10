require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],3:[function(require,module,exports){
var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var significance = 52;// there are 52 significant digits in a double

var overflow, startdenom; //numbers


var oldRandom = Math.random;
//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function seedrandom(seed, overRideGlobal) {
  if (!seed) {
    if (overRideGlobal) {
      Math.random = oldRandom;
    }
    return oldRandom;
  }
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer Math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  }
  random.seed = seed;
  if (overRideGlobal) {
    Math['random'] = random;
  }

  // Return the seed that was used
  return random;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = Math.pow(width, chunks);
significance = Math.pow(2, significance);
overflow = significance * 2;

},{}],"base/mode":[function(require,module,exports){
module.exports=require('NfLL4v');
},{}],"NfLL4v":[function(require,module,exports){
var ENGAGE_DRAG_DISTANCE, GfxLayer, InputLayer, Mode, ModeScene;

ENGAGE_DRAG_DISTANCE = 30;

InputLayer = cc.Layer.extend({
  init: function(mode) {
    this.mode = mode;
    this._super();
    this.setTouchEnabled(true);
    this.setMouseEnabled(true);
    return this.trackedTouches = [];
  },
  calcDistance: function(x1, y1, x2, y2) {
    var dx, dy;
    dx = x2 - x1;
    dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  setDragPoint: function() {
    this.dragX = this.trackedTouches[0].x;
    return this.dragY = this.trackedTouches[0].y;
  },
  calcPinchAnchor: function() {
    if (this.trackedTouches.length >= 2) {
      this.pinchX = Math.floor((this.trackedTouches[0].x + this.trackedTouches[1].x) / 2);
      return this.pinchY = Math.floor((this.trackedTouches[0].y + this.trackedTouches[1].y) / 2);
    }
  },
  addTouch: function(id, x, y) {
    var t, _i, _len, _ref;
    _ref = this.trackedTouches;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.id === id) {
        return;
      }
    }
    this.trackedTouches.push({
      id: id,
      x: x,
      y: y
    });
    if (this.trackedTouches.length === 1) {
      this.setDragPoint();
    }
    if (this.trackedTouches.length === 2) {
      return this.calcPinchAnchor();
    }
  },
  removeTouch: function(id, x, y) {
    var i, index, _i, _ref;
    index = -1;
    for (i = _i = 0, _ref = this.trackedTouches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this.trackedTouches[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      this.trackedTouches.splice(index, 1);
      if (this.trackedTouches.length === 1) {
        this.setDragPoint();
      }
      if (index < 2) {
        return this.calcPinchAnchor();
      }
    }
  },
  updateTouch: function(id, x, y) {
    var i, index, _i, _ref;
    index = -1;
    for (i = _i = 0, _ref = this.trackedTouches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (this.trackedTouches[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      this.trackedTouches[index].x = x;
      return this.trackedTouches[index].y = y;
    }
  },
  onTouchesBegan: function(touches, event) {
    var pos, t, _i, _len;
    if (this.trackedTouches.length === 0) {
      this.dragging = false;
    }
    for (_i = 0, _len = touches.length; _i < _len; _i++) {
      t = touches[_i];
      pos = t.getLocation();
      this.addTouch(t.getId(), pos.x, pos.y);
    }
    if (this.trackedTouches.length > 1) {
      return this.dragging = true;
    }
  },
  onTouchesMoved: function(touches, event) {
    var currDistance, deltaDistance, dragDistance, dx, dy, pos, prevDistance, prevX, prevY, t, _i, _len;
    prevDistance = 0;
    if (this.trackedTouches.length >= 2) {
      prevDistance = this.calcDistance(this.trackedTouches[0].x, this.trackedTouches[0].y, this.trackedTouches[1].x, this.trackedTouches[1].y);
    }
    if (this.trackedTouches.length === 1) {
      prevX = this.trackedTouches[0].x;
      prevY = this.trackedTouches[0].y;
    }
    for (_i = 0, _len = touches.length; _i < _len; _i++) {
      t = touches[_i];
      pos = t.getLocation();
      this.updateTouch(t.getId(), pos.x, pos.y);
    }
    if (this.trackedTouches.length === 1) {
      dragDistance = this.calcDistance(this.dragX, this.dragY, this.trackedTouches[0].x, this.trackedTouches[0].y);
      if (this.dragging || (dragDistance > ENGAGE_DRAG_DISTANCE)) {
        this.dragging = true;
        if (dragDistance > 0.5) {
          dx = this.trackedTouches[0].x - this.dragX;
          dy = this.trackedTouches[0].y - this.dragY;
          this.mode.onDrag(dx, dy);
        }
        return this.setDragPoint();
      }
    } else if (this.trackedTouches.length >= 2) {
      currDistance = this.calcDistance(this.trackedTouches[0].x, this.trackedTouches[0].y, this.trackedTouches[1].x, this.trackedTouches[1].y);
      deltaDistance = currDistance - prevDistance;
      if (deltaDistance !== 0) {
        return this.mode.onZoom(this.pinchX, this.pinchY, deltaDistance);
      }
    }
  },
  onTouchesEnded: function(touches, event) {
    var pos, t, _i, _len, _results;
    if (this.trackedTouches.length === 1 && !this.dragging) {
      pos = touches[0].getLocation();
      this.mode.onClick(pos.x, pos.y);
    }
    _results = [];
    for (_i = 0, _len = touches.length; _i < _len; _i++) {
      t = touches[_i];
      pos = t.getLocation();
      _results.push(this.removeTouch(t.getId(), pos.x, pos.y));
    }
    return _results;
  },
  onScrollWheel: function(ev) {
    var pos;
    pos = ev.getLocation();
    return this.mode.onZoom(pos.x, pos.y, ev.getWheelDelta());
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

  Mode.prototype.remove = function(obj) {
    return this.scene.gfx.removeChild(obj);
  };

  Mode.prototype.onActivate = function() {};

  Mode.prototype.onClick = function(x, y) {};

  Mode.prototype.onZoom = function(x, y, delta) {};

  Mode.prototype.onDrag = function(dx, dy) {};

  return Mode;

})();

module.exports = Mode;


},{}],6:[function(require,module,exports){
if (typeof document !== "undefined" && document !== null) {
  require('boot/mainweb');
} else {
  require('boot/maindroid');
}


},{"boot/maindroid":"sQ/hCQ","boot/mainweb":"YlwJjr"}],"sQ/hCQ":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"Pa8Doc"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('sQ/hCQ');
},{}],"YlwJjr":[function(require,module,exports){
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
      return cc.game.modes.game.activate();
    }, this);
    return true;
  }
});

myApp = new cocos2dApp();


},{"config":"Zqxdf5","main":"Pa8Doc","resources":"OmONEZ"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('YlwJjr');
},{}],"Zqxdf5":[function(require,module,exports){
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
module.exports=require('Zqxdf5');
},{}],"gfx":[function(require,module,exports){
module.exports=require('dzB+WH');
},{}],"dzB+WH":[function(require,module,exports){
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


},{}],"odPaXc":[function(require,module,exports){
var Tilesheet;

Tilesheet = (function() {
  function Tilesheet(resource, width, height, stride) {
    this.resource = resource;
    this.width = width;
    this.height = height;
    this.stride = stride;
  }

  Tilesheet.prototype.rect = function(v) {
    var x, y;
    y = Math.floor(v / this.stride);
    x = v % this.stride;
    return cc.rect(x * this.width, y * this.height, this.width, this.height);
  };

  return Tilesheet;

})();

module.exports = Tilesheet;


},{}],"gfx/tilesheet":[function(require,module,exports){
module.exports=require('odPaXc');
},{}],"Pa8Doc":[function(require,module,exports){
var Game, GameMode, IntroMode, floorgen, resources, size;

resources = require('resources');

IntroMode = require('mode/intro');

GameMode = require('mode/game');

floorgen = require('world/floorgen');

Game = (function() {
  function Game() {
    this.modes = {
      intro: new IntroMode(),
      game: new GameMode()
    };
  }

  Game.prototype.newFloor = function() {
    return floorgen.generate();
  };

  Game.prototype.currentFloor = function() {
    return this.state.floors[this.state.player.floor];
  };

  Game.prototype.newGame = function() {
    cc.log("newGame");
    return this.state = {
      player: {
        x: 40,
        y: 40,
        floor: 1
      },
      floors: [{}, this.newFloor()]
    };
  };

  return Game;

})();

if (!cc.game) {
  size = cc.Director.getInstance().getWinSize();
  cc.width = size.width;
  cc.height = size.height;
  cc.game = new Game();
}


},{"mode/game":"r6GOAi","mode/intro":"n4VXTb","resources":"OmONEZ","world/floorgen":"sMJjdY"}],"main":[function(require,module,exports){
module.exports=require('Pa8Doc');
},{}],"mode/game":[function(require,module,exports){
module.exports=require('r6GOAi');
},{}],"r6GOAi":[function(require,module,exports){
var GameMode, Mode, Pathfinder, SCALE_MAX, SCALE_MIN, Tilesheet, UNIT_SIZE, floorgen, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

resources = require('resources');

floorgen = require('world/floorgen');

Pathfinder = require('world/pathfinder');

Tilesheet = require('gfx/tilesheet');

UNIT_SIZE = 16;

SCALE_MIN = 2.0;

SCALE_MAX = 8.0;

GameMode = (function(_super) {
  __extends(GameMode, _super);

  function GameMode() {
    GameMode.__super__.constructor.call(this, "Game");
  }

  GameMode.prototype.tileForGridValue = function(v) {
    switch (false) {
      case v !== floorgen.WALL:
        return 16;
      case v !== floorgen.DOOR:
        return 5;
      case !(v >= floorgen.FIRST_ROOM_ID):
        return 18;
      default:
        return 0;
    }
  };

  GameMode.prototype.gfxClear = function() {
    if (this.gfx != null) {
      if (this.gfx.floorLayer != null) {
        this.remove(this.gfx.floorLayer);
      }
    }
    return this.gfx = {
      unitSize: UNIT_SIZE,
      pathSprites: []
    };
  };

  GameMode.prototype.gfxRenderFloor = function() {
    var floor, i, j, sprite, tiles, v, _i, _j, _ref, _ref1;
    this.gfx.floorLayer = new cc.Layer();
    this.gfx.floorLayer.setAnchorPoint(cc.p(0, 0));
    tiles = new Tilesheet(resources.tiles0, 16, 16, 16);
    floor = cc.game.currentFloor();
    for (j = _i = 0, _ref = floor.height; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = floor.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        v = floor.get(i, j);
        if (v !== 0) {
          sprite = cc.Sprite.create(tiles.resource);
          sprite.setAnchorPoint(cc.p(0, 0));
          sprite.setTextureRect(tiles.rect(this.tileForGridValue(v)));
          sprite.setPosition(cc.p(i * this.gfx.unitSize, j * this.gfx.unitSize));
          this.gfx.floorLayer.addChild(sprite, -1);
        }
      }
    }
    this.gfx.floorLayer.setScale(SCALE_MIN);
    this.add(this.gfx.floorLayer);
    return this.gfxCenterMap();
  };

  GameMode.prototype.gfxPlaceMap = function(mapX, mapY, screenX, screenY) {
    var scale, x, y;
    scale = this.gfx.floorLayer.getScale();
    x = screenX - (mapX * scale);
    y = screenY - (mapY * scale);
    return this.gfx.floorLayer.setPosition(x, y);
  };

  GameMode.prototype.gfxCenterMap = function() {
    var center;
    center = cc.game.currentFloor().bbox.center();
    return this.gfxPlaceMap(center.x * this.gfx.unitSize, center.y * this.gfx.unitSize, cc.width / 2, cc.height / 2);
  };

  GameMode.prototype.gfxScreenToMapCoords = function(x, y) {
    var pos, scale;
    pos = this.gfx.floorLayer.getPosition();
    scale = this.gfx.floorLayer.getScale();
    return {
      x: (x - pos.x) / scale,
      y: (y - pos.y) / scale
    };
  };

  GameMode.prototype.gfxRenderPlayer = function() {
    var s;
    this.gfx.player = {};
    this.gfx.player.tiles = new Tilesheet(resources.player, 12, 14, 18);
    s = cc.Sprite.create(this.gfx.player.tiles.resource);
    s.setAnchorPoint(cc.p(0, 0));
    s.setTextureRect(this.gfx.player.tiles.rect(16));
    this.gfx.player.sprite = s;
    return this.gfx.floorLayer.addChild(s, 0);
  };

  GameMode.prototype.gfxUpdatePositions = function() {
    var x, y;
    x = cc.game.state.player.x * this.gfx.unitSize;
    y = cc.game.state.player.y * this.gfx.unitSize;
    return this.gfx.player.sprite.setPosition(cc.p(x, y));
  };

  GameMode.prototype.update = function(dt) {
    var which;
    which = Math.floor(Math.random() * 5);
    return this.gfx.player.sprite.setTextureRect(this.gfx.player.tiles.rect(which));
  };

  GameMode.prototype.onActivate = function() {
    cc.game.newGame();
    this.gfxClear();
    this.gfxRenderFloor();
    this.gfxRenderPlayer();
    this.gfxUpdatePositions();
    return cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, this.update, 1.0, cc.REPEAT_FOREVER, 0, false);
  };

  GameMode.prototype.gfxAdjustMapScale = function(delta) {
    var scale;
    scale = this.gfx.floorLayer.getScale();
    scale += delta;
    if (scale > SCALE_MAX) {
      scale = SCALE_MAX;
    }
    if (scale < SCALE_MIN) {
      scale = SCALE_MIN;
    }
    return this.gfx.floorLayer.setScale(scale);
  };

  GameMode.prototype.gfxRenderPath = function(path) {
    var p, s, sprite, tiles, _i, _j, _len, _len1, _ref, _results;
    tiles = new Tilesheet(resources.tiles0, 16, 16, 16);
    _ref = this.gfx.pathSprites;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      this.gfx.floorLayer.removeChild(s);
    }
    this.gfx.pathSprites = [];
    _results = [];
    for (_j = 0, _len1 = path.length; _j < _len1; _j++) {
      p = path[_j];
      sprite = cc.Sprite.create(tiles.resource);
      sprite.setAnchorPoint(cc.p(0, 0));
      sprite.setTextureRect(tiles.rect(17));
      sprite.setPosition(cc.p(p.x * this.gfx.unitSize, p.y * this.gfx.unitSize));
      sprite.setOpacity(128);
      this.gfx.floorLayer.addChild(sprite);
      _results.push(this.gfx.pathSprites.push(sprite));
    }
    return _results;
  };

  GameMode.prototype.onDrag = function(dx, dy) {
    var pos;
    pos = this.gfx.floorLayer.getPosition();
    return this.gfx.floorLayer.setPosition(pos.x + dx, pos.y + dy);
  };

  GameMode.prototype.onZoom = function(x, y, delta) {
    var pos;
    pos = this.gfxScreenToMapCoords(x, y);
    this.gfxAdjustMapScale(delta / 200);
    return this.gfxPlaceMap(pos.x, pos.y, x, y);
  };

  GameMode.prototype.onClick = function(x, y) {
    var gridX, gridY, path, pathfinder, pos;
    pos = this.gfxScreenToMapCoords(x, y);
    gridX = Math.floor(pos.x / this.gfx.unitSize);
    gridY = Math.floor(pos.y / this.gfx.unitSize);
    pathfinder = new Pathfinder(cc.game.state.player.x, cc.game.state.player.y, gridX, gridY, 0);
    path = pathfinder.calc();
    return this.gfxRenderPath(path);
  };

  return GameMode;

})(Mode);

module.exports = GameMode;


},{"base/mode":"NfLL4v","gfx/tilesheet":"odPaXc","resources":"OmONEZ","world/floorgen":"sMJjdY","world/pathfinder":"zcjugq"}],"n4VXTb":[function(require,module,exports){
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


},{"base/mode":"NfLL4v","resources":"OmONEZ"}],"mode/intro":[function(require,module,exports){
module.exports=require('n4VXTb');
},{}],"OmONEZ":[function(require,module,exports){
var cocosPreloadList, k, resources, v;

resources = {
  'splashscreen': 'res/splashscreen.png',
  'tiles0': 'res/tiles0.png',
  'player': 'res/player.png'
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
module.exports=require('OmONEZ');
},{}],"4QoJgt":[function(require,module,exports){
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


},{"gfx":"dzB+WH","resources":"OmONEZ"}],"world/floor":[function(require,module,exports){
module.exports=require('4QoJgt');
},{}],"sMJjdY":[function(require,module,exports){
var DOOR, EMPTY, FIRST_ROOM_ID, Map, Rect, Room, RoomTemplate, SHAPES, ShapeRoomTemplate, WALL, fs, generate, seedRandom, valueToColor,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs');

seedRandom = require('seed-random');

SHAPES = ["############\n#..........#\n#..........#\n########...#\n       #...#\n       #...#\n       #...#\n       #####", "############\n#..........#\n#..........#\n#...########\n#...#\n#...#\n#####", "#####\n#...#\n#...########\n#..........#\n#..........#\n############", "    ####\n    #..#\n    #..#\n    #..#\n    #..#\n    #..#\n    #..#\n#####..#\n#......#\n#......#\n#......#\n########"];

EMPTY = 0;

WALL = 1;

DOOR = 2;

FIRST_ROOM_ID = 5;

valueToColor = function(p, v) {
  switch (false) {
    case v !== WALL:
      return p.color(32, 32, 32);
    case v !== DOOR:
      return p.color(128, 128, 128);
    case !(v >= FIRST_ROOM_ID):
      return p.color(0, 0, 5 + Math.min(240, 15 + (v * 2)));
  }
  return p.color(0, 0, 0);
};

Rect = (function() {
  function Rect(l, t, r, b) {
    this.l = l;
    this.t = t;
    this.r = r;
    this.b = b;
  }

  Rect.prototype.w = function() {
    return this.r - this.l;
  };

  Rect.prototype.h = function() {
    return this.b - this.t;
  };

  Rect.prototype.area = function() {
    return this.w() * this.h();
  };

  Rect.prototype.aspect = function() {
    if (this.h() > 0) {
      return this.w() / this.h();
    } else {
      return 0;
    }
  };

  Rect.prototype.squareness = function() {
    return Math.abs(this.w() - this.h());
  };

  Rect.prototype.center = function() {
    return {
      x: Math.floor((this.r + this.l) / 2),
      y: Math.floor((this.b + this.t) / 2)
    };
  };

  Rect.prototype.clone = function() {
    return new Rect(this.l, this.t, this.r, this.b);
  };

  Rect.prototype.expand = function(r) {
    if (this.area()) {
      if (this.l > r.l) {
        this.l = r.l;
      }
      if (this.t > r.t) {
        this.t = r.t;
      }
      if (this.r < r.r) {
        this.r = r.r;
      }
      if (this.b < r.b) {
        return this.b = r.b;
      }
    } else {
      this.l = r.l;
      this.t = r.t;
      this.r = r.r;
      return this.b = r.b;
    }
  };

  Rect.prototype.toString = function() {
    return "{ (" + this.l + ", " + this.t + ") -> (" + this.r + ", " + this.b + ") " + (this.w()) + "x" + (this.h()) + ", area: " + (this.area()) + ", aspect: " + (this.aspect()) + ", squareness: " + (this.squareness()) + " }";
  };

  return Rect;

})();

RoomTemplate = (function() {
  function RoomTemplate(width, height, roomid) {
    var i, j, _i, _j, _ref, _ref1;
    this.width = width;
    this.height = height;
    this.roomid = roomid;
    this.grid = [];
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.grid[i] = [];
      for (j = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this.grid[i][j] = EMPTY;
      }
    }
    this.generateShape();
  }

  RoomTemplate.prototype.generateShape = function() {
    var i, j, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3, _results;
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this.set(i, j, this.roomid);
      }
    }
    for (i = _k = 0, _ref2 = this.width; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
      this.set(i, 0, WALL);
      this.set(i, this.height - 1, WALL);
    }
    _results = [];
    for (j = _l = 0, _ref3 = this.height; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
      this.set(0, j, WALL);
      _results.push(this.set(this.width - 1, j, WALL));
    }
    return _results;
  };

  RoomTemplate.prototype.rect = function(x, y) {
    return new Rect(x, y, x + this.width, y + this.height);
  };

  RoomTemplate.prototype.set = function(i, j, v) {
    return this.grid[i][j] = v;
  };

  RoomTemplate.prototype.get = function(map, x, y, i, j) {
    var v;
    if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
      v = this.grid[i][j];
      if (v !== EMPTY) {
        return v;
      }
    }
    return map.get(x + i, y + j);
  };

  RoomTemplate.prototype.place = function(map, x, y) {
    var i, j, v, _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      _results.push((function() {
        var _j, _ref1, _results1;
        _results1 = [];
        for (j = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          v = this.grid[i][j];
          if (v !== EMPTY) {
            _results1.push(map.set(x + i, y + j, v));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  RoomTemplate.prototype.fits = function(map, x, y) {
    var i, j, mv, sv, _i, _j, _ref, _ref1;
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        mv = map.get(x + i, y + j);
        sv = this.grid[i][j];
        if (mv !== EMPTY && sv !== EMPTY && (mv !== WALL || sv !== WALL)) {
          return false;
        }
      }
    }
    return true;
  };

  RoomTemplate.prototype.doorEligible = function(map, x, y, i, j) {
    var roomCount, rooms, roomsSeen, v, values, wallNeighbors, _i, _len, _ref;
    wallNeighbors = 0;
    roomsSeen = {};
    values = [this.get(map, x, y, i + 1, j), this.get(map, x, y, i - 1, j), this.get(map, x, y, i, j + 1), this.get(map, x, y, i, j - 1)];
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      if (v) {
        if (v === 1) {
          wallNeighbors++;
        } else if (v !== 2) {
          roomsSeen[v] = 1;
        }
      }
    }
    rooms = Object.keys(roomsSeen).sort(function(a, b) {
      return a - b;
    });
    rooms = rooms.map(function(room) {
      return parseInt(room);
    });
    roomCount = rooms.length;
    if ((wallNeighbors === 2) && (roomCount === 2) && (_ref = this.roomid, __indexOf.call(rooms, _ref) >= 0)) {
      if ((values[0] === values[1]) || (values[2] === values[3])) {
        return rooms;
      }
    }
    return [-1, -1];
  };

  RoomTemplate.prototype.doorLocation = function(map, x, y) {
    var i, j, rooms, _i, _j, _ref, _ref1, _ref2;
    for (j = _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        rooms = this.doorEligible(map, x, y, i, j);
        if (rooms[0] !== -1 && (_ref2 = this.roomid, __indexOf.call(rooms, _ref2) >= 0)) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  };

  RoomTemplate.prototype.measure = function(map, x, y) {
    var bboxTemp;
    bboxTemp = map.bbox.clone();
    bboxTemp.expand(this.rect(x, y));
    return [bboxTemp.area(), bboxTemp.squareness()];
  };

  RoomTemplate.prototype.findBestSpot = function(map) {
    var area, doorLocation, i, j, location, minArea, minSquareness, minX, minY, searchB, searchL, searchR, searchT, squareness, _i, _j, _ref;
    minSquareness = Math.max(map.width, map.height);
    minArea = map.width * map.height;
    minX = -1;
    minY = -1;
    doorLocation = [-1, -1];
    searchL = map.bbox.l - this.width;
    searchR = map.bbox.r;
    searchT = map.bbox.t - this.height;
    searchB = map.bbox.b;
    for (i = _i = searchL; searchL <= searchR ? _i < searchR : _i > searchR; i = searchL <= searchR ? ++_i : --_i) {
      for (j = _j = searchT; searchT <= searchB ? _j < searchB : _j > searchB; j = searchT <= searchB ? ++_j : --_j) {
        if (this.fits(map, i, j)) {
          _ref = this.measure(map, i, j), area = _ref[0], squareness = _ref[1];
          if (area <= minArea && squareness <= minSquareness) {
            location = this.doorLocation(map, i, j);
            if (location[0] !== -1) {
              doorLocation = location;
              minArea = area;
              minSquareness = squareness;
              minX = i;
              minY = j;
            }
          }
        }
      }
    }
    return [minX, minY, doorLocation];
  };

  return RoomTemplate;

})();

ShapeRoomTemplate = (function(_super) {
  __extends(ShapeRoomTemplate, _super);

  function ShapeRoomTemplate(shape, roomid) {
    var line, w, _i, _len, _ref;
    this.lines = shape.split("\n");
    w = 0;
    _ref = this.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      w = Math.max(w, line.length);
    }
    this.width = w;
    this.height = this.lines.length;
    ShapeRoomTemplate.__super__.constructor.call(this, this.width, this.height, roomid);
  }

  ShapeRoomTemplate.prototype.generateShape = function() {
    var c, i, j, line, v, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
    for (j = _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        this.set(i, j, EMPTY);
      }
    }
    i = 0;
    j = 0;
    _ref2 = this.lines;
    _results = [];
    for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
      line = _ref2[_k];
      _ref3 = line.split("");
      for (_l = 0, _len1 = _ref3.length; _l < _len1; _l++) {
        c = _ref3[_l];
        v = (function() {
          switch (c) {
            case '.':
              return this.roomid;
            case '#':
              return WALL;
            default:
              return 0;
          }
        }).call(this);
        if (v) {
          this.set(i, j, v);
        }
        i++;
      }
      j++;
      _results.push(i = 0);
    }
    return _results;
  };

  return ShapeRoomTemplate;

})(RoomTemplate);

Room = (function() {
  function Room(rect) {
    this.rect = rect;
  }

  return Room;

})();

Map = (function() {
  function Map(width, height, seed) {
    var i, j, _i, _j, _ref, _ref1;
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.randReset();
    this.grid = [];
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.grid[i] = [];
      for (j = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this.grid[i][j] = {
          type: EMPTY,
          x: i,
          y: j
        };
      }
    }
    this.bbox = new Rect(0, 0, 0, 0);
    this.rooms = [];
  }

  Map.prototype.randReset = function() {
    return this.rng = seedRandom(this.seed);
  };

  Map.prototype.rand = function(v) {
    return Math.floor(this.rng() * v);
  };

  Map.prototype.set = function(i, j, v) {
    return this.grid[i][j].type = v;
  };

  Map.prototype.get = function(i, j) {
    if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
      return this.grid[i][j].type;
    }
    return 0;
  };

  Map.prototype.addRoom = function(roomTemplate, x, y) {
    var r;
    roomTemplate.place(this, x, y);
    r = roomTemplate.rect(x, y);
    this.rooms.push(new Room(r));
    return this.bbox.expand(r);
  };

  Map.prototype.randomRoomTemplate = function(roomid) {
    var r;
    r = this.rand(100);
    switch (false) {
      case !((0 < r && r < 10)):
        return new RoomTemplate(3, 5 + this.rand(10), roomid);
      case !((10 < r && r < 20)):
        return new RoomTemplate(5 + this.rand(10), 3, roomid);
      case !((20 < r && r < 30)):
        return new ShapeRoomTemplate(SHAPES[this.rand(SHAPES.length)], roomid);
    }
    return new RoomTemplate(4 + this.rand(5), 4 + this.rand(5), roomid);
  };

  Map.prototype.generateRoom = function(roomid) {
    var doorLocation, roomTemplate, x, y, _ref;
    roomTemplate = this.randomRoomTemplate(roomid);
    if (this.rooms.length === 0) {
      x = Math.floor((this.width / 2) - (roomTemplate.width / 2));
      y = Math.floor((this.height / 2) - (roomTemplate.height / 2));
      this.addRoom(roomTemplate, x, y);
    } else {
      _ref = roomTemplate.findBestSpot(this), x = _ref[0], y = _ref[1], doorLocation = _ref[2];
      if (x < 0) {
        return false;
      }
      roomTemplate.set(doorLocation[0], doorLocation[1], 2);
      this.addRoom(roomTemplate, x, y);
    }
    return true;
  };

  Map.prototype.generateRooms = function(count) {
    var added, i, roomid, _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      roomid = FIRST_ROOM_ID + i;
      added = false;
      _results.push((function() {
        var _results1;
        _results1 = [];
        while (!added) {
          _results1.push(added = this.generateRoom(roomid));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return Map;

})();

generate = function() {
  var map;
  map = new Map(80, 80, 10);
  map.generateRooms(20);
  return map;
};

module.exports = {
  generate: generate,
  EMPTY: EMPTY,
  WALL: WALL,
  DOOR: DOOR,
  FIRST_ROOM_ID: FIRST_ROOM_ID
};


},{"fs":2,"seed-random":3}],"world/floorgen":[function(require,module,exports){
module.exports=require('sMJjdY');
},{}],"world/pathfinder":[function(require,module,exports){
module.exports=require('zcjugq');
},{}],"zcjugq":[function(require,module,exports){
var AStar, BinaryHeap, Pathfinder, floorgen;

floorgen = require('world/floorgen');

BinaryHeap = (function() {
  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype.push = function(element) {
    this.content.push(element);
    return this.sinkDown(this.content.length - 1);
  };

  BinaryHeap.prototype.pop = function() {
    var end, result;
    result = this.content[0];
    end = this.content.pop();
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  };

  BinaryHeap.prototype.remove = function(node) {
    var end, i;
    i = this.content.indexOf(node);
    end = this.content.pop();
    if (i !== this.content.length - 1) {
      this.content[i] = end;
    }
    if (this.scoreFunction(end) < this.scoreFunction(node)) {
      return this.sinkDown(i);
    } else {
      return this.bubbleUp(i);
    }
  };

  BinaryHeap.prototype.size = function() {
    return this.content.length;
  };

  BinaryHeap.prototype.rescoreElement = function(node) {
    return this.sinkDown(this.content.indexOf(node));
  };

  BinaryHeap.prototype.sinkDown = function(n) {
    var element, parent, parentN, _results;
    element = this.content[n];
    _results = [];
    while (n > 0) {
      parentN = ((n + 1) >> 1) - 1;
      parent = this.content[parentN];
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        _results.push(n = parentN);
      } else {
        break;
      }
    }
    return _results;
  };

  BinaryHeap.prototype.bubbleUp = function(n) {
    var child1, child1N, child1Score, child2, child2N, child2Score, elemScore, element, length, swap, _ref, _results;
    length = this.content.length;
    element = this.content[n];
    elemScore = this.scoreFunction(element);
    _results = [];
    while (true) {
      child2N = (n + 1) << 1;
      child1N = child2N - 1;
      swap = null;
      if (child1N < length) {
        child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }
      if (child2N < length) {
        child2 = this.content[child2N];
        child2Score = this.scoreFunction(child2);
        if (child2Score < ((_ref = swap === null) != null ? _ref : {
          elemScore: child1Score
        })) {
          swap = child2N;
        }
      }
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        _results.push(n = swap);
      } else {
        break;
      }
    }
    return _results;
  };

  return BinaryHeap;

})();

AStar = (function() {
  function AStar(floor) {
    var node, x, y, _i, _j, _ref, _ref1;
    this.floor = floor;
    for (x = _i = 0, _ref = this.floor.width; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      for (y = _j = 0, _ref1 = this.floor.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
        node = this.floor.grid[x][y];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.cost = node.type;
        node.visited = false;
        node.closed = false;
        node.parent = null;
      }
    }
  }

  AStar.prototype.heap = function() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  };

  AStar.prototype.search = function(start, end) {
    var beenVisited, curr, currentNode, gScore, grid, heuristic, neighbor, neighbors, openHeap, ret, _i, _len;
    grid = this.floor.grid;
    heuristic = this.manhattan;
    openHeap = this.heap();
    openHeap.push(start);
    while (openHeap.size() > 0) {
      currentNode = openHeap.pop();
      if (currentNode === end) {
        curr = currentNode;
        ret = [];
        while (curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        return ret.reverse();
      }
      currentNode.closed = true;
      neighbors = this.neighbors(grid, currentNode);
      for (_i = 0, _len = neighbors.length; _i < _len; _i++) {
        neighbor = neighbors[_i];
        if (neighbor.closed || (neighbor.type === floorgen.WALL)) {
          continue;
        }
        gScore = currentNode.g + neighbor.cost;
        beenVisited = neighbor.visited;
        if ((!beenVisited) || (gScore < neighbor.g)) {
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor.x, neighbor.y, end.x, end.y);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          if (!beenVisited) {
            openHeap.push(neighbor);
          } else {
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }
    return [];
  };

  AStar.prototype.manhattan = function(x0, y0, x1, y1) {
    var d1, d2;
    d1 = Math.abs(x1 - x0);
    d2 = Math.abs(y1 - y0);
    return d1 + d2;
  };

  AStar.prototype.distSquared = function(x0, y0, x1, y1) {
    var dx, dy;
    dx = x1 - x0;
    dy = y1 - y0;
    return (dx * dx) + (dy * dy);
  };

  AStar.prototype.neighbors = function(grid, node) {
    var ret, x, y;
    ret = [];
    x = node.x;
    y = node.y;
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y]);
    }
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y]);
    }
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1]);
    }
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1]);
    }
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      ret.push(grid[x - 1][y - 1]);
    }
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      ret.push(grid[x + 1][y - 1]);
    }
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      ret.push(grid[x - 1][y + 1]);
    }
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      ret.push(grid[x + 1][y + 1]);
    }
    return ret;
  };

  return AStar;

})();

Pathfinder = (function() {
  function Pathfinder(startX, startY, destX, destY, flags) {
    this.startX = startX;
    this.startY = startY;
    this.destX = destX;
    this.destY = destY;
    this.flags = flags;
    this.floor = cc.game.currentFloor();
  }

  Pathfinder.prototype.calc = function() {
    var astar;
    astar = new AStar(this.floor);
    return astar.search(this.floor.grid[this.startX][this.startY], this.floor.grid[this.destX][this.destY]);
  };

  return Pathfinder;

})();

module.exports = Pathfinder;


},{"world/floorgen":"sMJjdY"}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvX2VtcHR5LmpzIiwiIC4uL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vZnMuanMiLCIgLi4vbm9kZV9tb2R1bGVzL3NlZWQtcmFuZG9tL2luZGV4LmpzIiwiIC4uL3NyYy9iYXNlL21vZGUuY29mZmVlIiwiIC4uL3NyYy9ib290L2Jvb3QuY29mZmVlIiwiIC4uL3NyYy9ib290L21haW5kcm9pZC5jb2ZmZWUiLCIgLi4vc3JjL2Jvb3QvbWFpbndlYi5jb2ZmZWUiLCIgLi4vc3JjL2NvbmZpZy5jb2ZmZWUiLCIgLi4vc3JjL2dmeC5jb2ZmZWUiLCIgLi4vc3JjL2dmeC90aWxlc2hlZXQuY29mZmVlIiwiIC4uL3NyYy9tYWluLmNvZmZlZSIsIiAuLi9zcmMvbW9kZS9nYW1lLmNvZmZlZSIsIiAuLi9zcmMvbW9kZS9pbnRyby5jb2ZmZWUiLCIgLi4vc3JjL3Jlc291cmNlcy5jb2ZmZWUiLCIgLi4vc3JjL3dvcmxkL2Zsb29yLmNvZmZlZSIsIiAuLi9zcmMvd29ybGQvZmxvb3JnZW4uY29mZmVlIiwiIC4uL3NyYy93b3JsZC9wYXRoZmluZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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ciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwidmFyIHdpZHRoID0gMjU2Oy8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcclxudmFyIGNodW5rcyA9IDY7Ly8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxyXG52YXIgc2lnbmlmaWNhbmNlID0gNTI7Ly8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxyXG5cclxudmFyIG92ZXJmbG93LCBzdGFydGRlbm9tOyAvL251bWJlcnNcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgaWYgKCFzZWVkKSB7XHJcbiAgICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgICAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2xkUmFuZG9tO1xyXG4gIH1cclxuICB2YXIga2V5ID0gW107XHJcbiAgdmFyIGFyYzQ7XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHNlZWQgPSBtaXhrZXkoZmxhdHRlbihzZWVkLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE92ZXJyaWRlIE1hdGgucmFuZG9tXHJcblxyXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcclxuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxyXG5cclxuICBmdW5jdGlvbiByYW5kb20oKSB7ICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpOyAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgIHZhciBkID0gc3RhcnRkZW5vbTsgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICB2YXIgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfVxyXG4gIHJhbmRvbS5zZWVkID0gc2VlZDtcclxuICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgIE1hdGhbJ3JhbmRvbSddID0gcmFuZG9tO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBzZWVkIHRoYXQgd2FzIHVzZWRcclxuICByZXR1cm4gcmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCB1LCBtZSA9IHRoaXMsIGtleWxlbiA9IGtleS5sZW5ndGg7XHJcbiAgdmFyIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSBtZS5tID0gMDtcclxuICBtZS5TID0gW107XHJcbiAgbWUuYyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7IG1lLlNbaV0gPSBpKys7IH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgdCA9IG1lLlNbaV07XHJcbiAgICBqID0gbG93Yml0cyhqICsgdCArIGtleVtpICUga2V5bGVuXSk7XHJcbiAgICB1ID0gbWUuU1tqXTtcclxuICAgIG1lLlNbaV0gPSB1O1xyXG4gICAgbWUuU1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgbWUuZyA9IGZ1bmN0aW9uIGdldG5leHQoY291bnQpIHtcclxuICAgIHZhciBzID0gbWUuUztcclxuICAgIHZhciBpID0gbG93Yml0cyhtZS5pICsgMSk7IHZhciB0ID0gc1tpXTtcclxuICAgIHZhciBqID0gbG93Yml0cyhtZS5qICsgdCk7IHZhciB1ID0gc1tqXTtcclxuICAgIHNbaV0gPSB1O1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgICB2YXIgciA9IHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgd2hpbGUgKC0tY291bnQpIHtcclxuICAgICAgaSA9IGxvd2JpdHMoaSArIDEpOyB0ID0gc1tpXTtcclxuICAgICAgaiA9IGxvd2JpdHMoaiArIHQpOyB1ID0gc1tqXTtcclxuICAgICAgc1tpXSA9IHU7XHJcbiAgICAgIHNbal0gPSB0O1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1tsb3diaXRzKHQgKyB1KV07XHJcbiAgICB9XHJcbiAgICBtZS5pID0gaTtcclxuICAgIG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgfTtcclxuICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIG1lLmcod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtPYmplY3Q9fSByZXN1bHQgXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHByb3BcclxuICAqIEBwYXJhbSB7c3RyaW5nPX0gdHlwICovXHJcbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCwgcmVzdWx0LCBwcm9wLCB0eXApIHtcclxuICByZXN1bHQgPSBbXTtcclxuICB0eXAgPSB0eXBlb2Yob2JqKTtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XHJcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChwcm9wLmluZGV4T2YoJ1MnKSA8IDUpIHsgICAgLy8gQXZvaWQgRkYzIGJ1ZyAobG9jYWwvc2Vzc2lvblN0b3JhZ2UpXHJcbiAgICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IG9iaiArICh0eXAgIT0gJ3N0cmluZycgPyAnXFwwJyA6ICcnKSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge251bWJlcj19IHNtZWFyIFxyXG4gICogQHBhcmFtIHtudW1iZXI9fSBqICovXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXksIHNtZWFyLCBqKSB7XHJcbiAgc2VlZCArPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBzZWVkIGlzIGEgc3RyaW5nXHJcbiAgc21lYXIgPSAwO1xyXG4gIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgaisrKSB7XHJcbiAgICBrZXlbbG93Yml0cyhqKV0gPVxyXG4gICAgICBsb3diaXRzKChzbWVhciBePSBrZXlbbG93Yml0cyhqKV0gKiAxOSkgKyBzZWVkLmNoYXJDb2RlQXQoaikpO1xyXG4gIH1cclxuICBzZWVkID0gJyc7XHJcbiAgZm9yIChqIGluIGtleSkgeyBzZWVkICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5W2pdKTsgfVxyXG4gIHJldHVybiBzZWVkO1xyXG59XHJcblxyXG4vL1xyXG4vLyBsb3diaXRzKClcclxuLy8gQSBxdWljayBcIm4gbW9kIHdpZHRoXCIgZm9yIHdpZHRoIGEgcG93ZXIgb2YgMi5cclxuLy9cclxuZnVuY3Rpb24gbG93Yml0cyhuKSB7IHJldHVybiBuICYgKHdpZHRoIC0gMSk7IH1cclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxuc3RhcnRkZW5vbSA9IE1hdGgucG93KHdpZHRoLCBjaHVua3MpO1xyXG5zaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBzaWduaWZpY2FuY2UpO1xyXG5vdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDI7XHJcbiIsIiMgaG93IG1hbnkgcGl4ZWxzIGNhbiB5b3UgZHJhZyBiZWZvcmUgaXQgaXMgYWN0dWFsbHkgY29uc2lkZXJlZCBhIGRyYWdcclxuRU5HQUdFX0RSQUdfRElTVEFOQ0UgPSAzMFxyXG5cclxuSW5wdXRMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICBAc2V0TW91c2VFbmFibGVkKHRydWUpXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMgPSBbXVxyXG5cclxuICBjYWxjRGlzdGFuY2U6ICh4MSwgeTEsIHgyLCB5MikgLT5cclxuICAgIGR4ID0geDIgLSB4MVxyXG4gICAgZHkgPSB5MiAtIHkxXHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcblxyXG4gIHNldERyYWdQb2ludDogLT5cclxuICAgIEBkcmFnWCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICBAZHJhZ1kgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICBjYWxjUGluY2hBbmNob3I6IC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgQHBpbmNoWCA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS54ICsgQHRyYWNrZWRUb3VjaGVzWzFdLngpIC8gMilcclxuICAgICAgQHBpbmNoWSA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS55ICsgQHRyYWNrZWRUb3VjaGVzWzFdLnkpIC8gMilcclxuICAgICAgIyBjYy5sb2cgXCJwaW5jaCBhbmNob3Igc2V0IGF0ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1cIlxyXG5cclxuICBhZGRUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgZm9yIHQgaW4gQHRyYWNrZWRUb3VjaGVzXHJcbiAgICAgIGlmIHQuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm5cclxuICAgIEB0cmFja2VkVG91Y2hlcy5wdXNoIHtcclxuICAgICAgaWQ6IGlkXHJcbiAgICAgIHg6IHhcclxuICAgICAgeTogeVxyXG4gICAgfVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICMgV2UganVzdCBhZGRlZCBhIHNlY29uZCB0b3VjaCBzcG90LiBDYWxjdWxhdGUgdGhlIGFuY2hvciBmb3IgcGluY2hpbmcgbm93XHJcbiAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgI2NjLmxvZyBcImFkZGluZyB0b3VjaCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgcmVtb3ZlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgICBpZiBpbmRleCA8IDJcclxuICAgICAgICAjIFdlIGp1c3QgZm9yZ290IG9uZSBvZiBvdXIgcGluY2ggdG91Y2hlcy4gUGljayBhIG5ldyBhbmNob3Igc3BvdC5cclxuICAgICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICAgI2NjLmxvZyBcImZvcmdldHRpbmcgaWQgI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHVwZGF0ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnggPSB4XHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueSA9IHlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAZHJhZ2dpbmcgPSBmYWxzZVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQGFkZFRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID4gMVxyXG4gICAgICAjIFRoZXkncmUgcGluY2hpbmcsIGRvbid0IGV2ZW4gYm90aGVyIHRvIGVtaXQgYSBjbGlja1xyXG4gICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcblxyXG4gIG9uVG91Y2hlc01vdmVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBwcmV2RGlzdGFuY2UgPSAwXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgcHJldkRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBwcmV2WCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICAgIHByZXZZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAdXBkYXRlVG91Y2godC5nZXRJZCgpLCBwb3MueCwgcG9zLnkpXHJcblxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICMgc2luZ2xlIHRvdWNoLCBjb25zaWRlciBkcmFnZ2luZ1xyXG4gICAgICBkcmFnRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlIEBkcmFnWCwgQGRyYWdZLCBAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuICAgICAgaWYgQGRyYWdnaW5nIG9yIChkcmFnRGlzdGFuY2UgPiBFTkdBR0VfRFJBR19ESVNUQU5DRSlcclxuICAgICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcbiAgICAgICAgaWYgZHJhZ0Rpc3RhbmNlID4gMC41XHJcbiAgICAgICAgICBkeCA9IEB0cmFja2VkVG91Y2hlc1swXS54IC0gQGRyYWdYXHJcbiAgICAgICAgICBkeSA9IEB0cmFja2VkVG91Y2hlc1swXS55IC0gQGRyYWdZXHJcbiAgICAgICAgICAjY2MubG9nIFwic2luZ2xlIGRyYWc6ICN7ZHh9LCAje2R5fVwiXHJcbiAgICAgICAgICBAbW9kZS5vbkRyYWcoZHgsIGR5KVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG5cclxuICAgIGVsc2UgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgICMgYXQgbGVhc3QgdHdvIGZpbmdlcnMgcHJlc2VudCwgY2hlY2sgZm9yIHBpbmNoL3pvb21cclxuICAgICAgY3VyckRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgICAgZGVsdGFEaXN0YW5jZSA9IGN1cnJEaXN0YW5jZSAtIHByZXZEaXN0YW5jZVxyXG4gICAgICBpZiBkZWx0YURpc3RhbmNlICE9IDBcclxuICAgICAgICAjY2MubG9nIFwiZGlzdGFuY2UgZHJhZ2dlZCBhcGFydDogI3tkZWx0YURpc3RhbmNlfSBbYW5jaG9yOiAje0BwaW5jaFh9LCAje0BwaW5jaFl9XVwiXHJcbiAgICAgICAgQG1vZGUub25ab29tKEBwaW5jaFgsIEBwaW5jaFksIGRlbHRhRGlzdGFuY2UpXHJcblxyXG4gIG9uVG91Y2hlc0VuZGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDEgYW5kIG5vdCBAZHJhZ2dpbmdcclxuICAgICAgcG9zID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpXHJcbiAgICAgICNjYy5sb2cgXCJjbGljayBhdCAje3Bvcy54fSwgI3twb3MueX1cIlxyXG4gICAgICBAbW9kZS5vbkNsaWNrKHBvcy54LCBwb3MueSlcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEByZW1vdmVUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG5cclxuICBvblNjcm9sbFdoZWVsOiAoZXYpIC0+XHJcbiAgICBwb3MgPSBldi5nZXRMb2NhdGlvbigpXHJcbiAgICBAbW9kZS5vblpvb20ocG9zLngsIHBvcy55LCBldi5nZXRXaGVlbERlbHRhKCkpXHJcbn1cclxuXHJcbkdmeExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxufVxyXG5cclxuTW9kZVNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuXHJcbiAgICBAaW5wdXQgPSBuZXcgSW5wdXRMYXllcigpXHJcbiAgICBAaW5wdXQuaW5pdChAbW9kZSlcclxuICAgIEBhZGRDaGlsZChAaW5wdXQpXHJcblxyXG4gICAgQGdmeCA9IG5ldyBHZnhMYXllcigpXHJcbiAgICBAZ2Z4LmluaXQoKVxyXG4gICAgQGFkZENoaWxkKEBnZngpXHJcblxyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBtb2RlLm9uQWN0aXZhdGUoKVxyXG59XHJcblxyXG5jbGFzcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT5cclxuICAgIEBzY2VuZSA9IG5ldyBNb2RlU2NlbmUoKVxyXG4gICAgQHNjZW5lLmluaXQodGhpcylcclxuICAgIEBzY2VuZS5yZXRhaW4oKVxyXG5cclxuICBhY3RpdmF0ZTogLT5cclxuICAgIGNjLmxvZyBcImFjdGl2YXRpbmcgbW9kZSAje0BuYW1lfVwiXHJcbiAgICBpZiBjYy5zYXdPbmVTY2VuZT9cclxuICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wb3BTY2VuZSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIGNjLnNhd09uZVNjZW5lID0gdHJ1ZVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wdXNoU2NlbmUoQHNjZW5lKVxyXG5cclxuICBhZGQ6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LmFkZENoaWxkKG9iailcclxuXHJcbiAgcmVtb3ZlOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5yZW1vdmVDaGlsZChvYmopXHJcblxyXG4gICMgdG8gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIE1vZGVzXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVcclxuIiwiaWYgZG9jdW1lbnQ/XG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbndlYidcbmVsc2VcbiAgcmVxdWlyZSAnYm9vdC9tYWluZHJvaWQnXG4iLCJyZXF1aXJlICdqc2IuanMnXG5yZXF1aXJlICdtYWluJ1xuXG5udWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKVxubnVsbFNjZW5lLmluaXQoKVxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUobnVsbFNjZW5lKVxuY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXG5cbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xuICBjb25maWc6IGNvbmZpZ1xuICBjdG9yOiAoc2NlbmUpIC0+XG4gICAgQF9zdXBlcigpXG4gICAgY2MuQ09DT1MyRF9ERUJVRyA9IEBjb25maWdbJ0NPQ09TMkRfREVCVUcnXVxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxuICAgIGNjLkFwcENvbnRyb2xsZXIuc2hhcmVBcHBDb250cm9sbGVyKCkuZGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnMoKVxuXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxuICAgICAgaWYgY2MuUmVuZGVyRG9lc25vdFN1cHBvcnQoKVxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxuICAgICAgZGlyZWN0b3IgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpXG5cbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxuXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cblxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cblxuICAgICAgIyBsb2FkIHJlc291cmNlc1xuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuICAgICAgY2MuTG9hZGVyU2NlbmUucHJlbG9hZChyZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCwgLT5cbiAgICAgICAgcmVxdWlyZSAnbWFpbidcbiAgICAgICAgbnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKCk7XG4gICAgICAgIG51bGxTY2VuZS5pbml0KClcbiAgICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUobnVsbFNjZW5lKVxuIyAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXG4gICAgICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXG4gICAgICB0aGlzKVxuXG4gICAgICByZXR1cm4gdHJ1ZVxufVxuXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKClcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgQ09DT1MyRF9ERUJVRzoyICMgMCB0byB0dXJuIGRlYnVnIG9mZiwgMSBmb3IgYmFzaWMgZGVidWcsIGFuZCAyIGZvciBmdWxsIGRlYnVnXG4gIGJveDJkOmZhbHNlXG4gIGNoaXBtdW5rOmZhbHNlXG4gIHNob3dGUFM6dHJ1ZVxuICBmcmFtZVJhdGU6MzBcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxuICByZW5kZXJNb2RlOjBcbiAgdGFnOidnYW1lQ2FudmFzJ1xuICBhcHBGaWxlczogW1xuICAgICdidW5kbGUuanMnXG4gIF1cbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGN0b3IoKVxuICAgIEBpbml0KClcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY3RvcigpXG4gICAgQGluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIExheWVyOiBMYXllclxuICBTY2VuZTogU2NlbmVcbiIsIlxuY2xhc3MgVGlsZXNoZWV0XG4gIGNvbnN0cnVjdG9yOiAoQHJlc291cmNlLCBAd2lkdGgsIEBoZWlnaHQsIEBzdHJpZGUpIC0+XG5cbiAgcmVjdDogKHYpIC0+XG4gICAgeSA9IE1hdGguZmxvb3IodiAvIEBzdHJpZGUpXG4gICAgeCA9IHYgJSBAc3RyaWRlXG4gICAgcmV0dXJuIGNjLnJlY3QoeCAqIEB3aWR0aCwgeSAqIEBoZWlnaHQsIEB3aWR0aCwgQGhlaWdodClcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlc2hlZXRcbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuSW50cm9Nb2RlID0gcmVxdWlyZSAnbW9kZS9pbnRybydcclxuR2FtZU1vZGUgPSByZXF1aXJlICdtb2RlL2dhbWUnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAbW9kZXMgPVxyXG4gICAgICBpbnRybzogbmV3IEludHJvTW9kZSgpXHJcbiAgICAgIGdhbWU6IG5ldyBHYW1lTW9kZSgpXHJcblxyXG4gIG5ld0Zsb29yOiAtPlxyXG4gICAgZmxvb3JnZW4uZ2VuZXJhdGUoKVxyXG5cclxuICBjdXJyZW50Rmxvb3I6IC0+XHJcbiAgICByZXR1cm4gQHN0YXRlLmZsb29yc1tAc3RhdGUucGxheWVyLmZsb29yXVxyXG5cclxuICBuZXdHYW1lOiAtPlxyXG4gICAgY2MubG9nIFwibmV3R2FtZVwiXHJcbiAgICBAc3RhdGUgPVxyXG4gICAgICBwbGF5ZXI6XHJcbiAgICAgICAgeDogNDBcclxuICAgICAgICB5OiA0MFxyXG4gICAgICAgIGZsb29yOiAxXHJcbiAgICAgIGZsb29yczogW1xyXG4gICAgICAgIHt9XHJcbiAgICAgICAgQG5ld0Zsb29yKClcclxuICAgICAgXVxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy53aWR0aCA9IHNpemUud2lkdGhcclxuICBjYy5oZWlnaHQgPSBzaXplLmhlaWdodFxyXG4gIGNjLmdhbWUgPSBuZXcgR2FtZSgpXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblRpbGVzaGVldCA9IHJlcXVpcmUgJ2dmeC90aWxlc2hlZXQnXHJcblxyXG5VTklUX1NJWkUgPSAxNlxyXG5TQ0FMRV9NSU4gPSAyLjBcclxuU0NBTEVfTUFYID0gOC4wXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDE4XHJcbiAgICAgIGVsc2UgMFxyXG5cclxuICBnZnhDbGVhcjogLT5cclxuICAgIGlmIEBnZng/XHJcbiAgICAgIGlmIEBnZnguZmxvb3JMYXllcj9cclxuICAgICAgICBAcmVtb3ZlIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeCA9XHJcbiAgICAgIHVuaXRTaXplOiBVTklUX1NJWkVcclxuICAgICAgcGF0aFNwcml0ZXM6IFtdXHJcblxyXG4gIGdmeFJlbmRlckZsb29yOiAtPlxyXG4gICAgQGdmeC5mbG9vckxheWVyID0gbmV3IGNjLkxheWVyKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG5cclxuICAgIHRpbGVzID0gbmV3IFRpbGVzaGVldChyZXNvdXJjZXMudGlsZXMwLCAxNiwgMTYsIDE2KVxyXG4gICAgZmxvb3IgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpXHJcbiAgICBmb3IgaiBpbiBbMC4uLmZsb29yLmhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5mbG9vci53aWR0aF1cclxuICAgICAgICB2ID0gZmxvb3IuZ2V0KGksIGopXHJcbiAgICAgICAgaWYgdiAhPSAwXHJcbiAgICAgICAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHRpbGVzLnJlc291cmNlXHJcbiAgICAgICAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgICAgICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdCh0aWxlcy5yZWN0KEB0aWxlRm9yR3JpZFZhbHVlKHYpKSlcclxuICAgICAgICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKGkgKiBAZ2Z4LnVuaXRTaXplLCBqICogQGdmeC51bml0U2l6ZSkpXHJcbiAgICAgICAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgc3ByaXRlLCAtMVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShTQ0FMRV9NSU4pXHJcbiAgICBAYWRkIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeENlbnRlck1hcCgpXHJcblxyXG4gIGdmeFBsYWNlTWFwOiAobWFwWCwgbWFwWSwgc2NyZWVuWCwgc2NyZWVuWSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHggPSBzY3JlZW5YIC0gKG1hcFggKiBzY2FsZSlcclxuICAgIHkgPSBzY3JlZW5ZIC0gKG1hcFkgKiBzY2FsZSlcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbih4LCB5KVxyXG5cclxuICBnZnhDZW50ZXJNYXA6IC0+XHJcbiAgICBjZW50ZXIgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpLmJib3guY2VudGVyKClcclxuICAgIEBnZnhQbGFjZU1hcChjZW50ZXIueCAqIEBnZngudW5pdFNpemUsIGNlbnRlci55ICogQGdmeC51bml0U2l6ZSwgY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKVxyXG5cclxuICBnZnhTY3JlZW5Ub01hcENvb3JkczogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogKHggLSBwb3MueCkgLyBzY2FsZVxyXG4gICAgICB5OiAoeSAtIHBvcy55KSAvIHNjYWxlXHJcbiAgICB9XHJcblxyXG4gIGdmeFJlbmRlclBsYXllcjogLT5cclxuICAgIEBnZngucGxheWVyID0ge31cclxuICAgIEBnZngucGxheWVyLnRpbGVzID0gbmV3IFRpbGVzaGVldChyZXNvdXJjZXMucGxheWVyLCAxMiwgMTQsIDE4KVxyXG4gICAgcyA9IGNjLlNwcml0ZS5jcmVhdGUgQGdmeC5wbGF5ZXIudGlsZXMucmVzb3VyY2VcclxuICAgIHMuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIHMuc2V0VGV4dHVyZVJlY3QoQGdmeC5wbGF5ZXIudGlsZXMucmVjdCgxNikpXHJcbiAgICBAZ2Z4LnBsYXllci5zcHJpdGUgPSBzXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgcywgMFxyXG5cclxuICBnZnhVcGRhdGVQb3NpdGlvbnM6IC0+XHJcbiAgICB4ID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCAqIEBnZngudW5pdFNpemVcclxuICAgIHkgPSBjYy5nYW1lLnN0YXRlLnBsYXllci55ICogQGdmeC51bml0U2l6ZVxyXG4gICAgQGdmeC5wbGF5ZXIuc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgd2hpY2ggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1KVxyXG4gICAgQGdmeC5wbGF5ZXIuc3ByaXRlLnNldFRleHR1cmVSZWN0KEBnZngucGxheWVyLnRpbGVzLnJlY3Qod2hpY2gpKVxyXG5cclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gICAgY2MuZ2FtZS5uZXdHYW1lKClcclxuICAgIEBnZnhDbGVhcigpXHJcbiAgICBAZ2Z4UmVuZGVyRmxvb3IoKVxyXG4gICAgQGdmeFJlbmRlclBsYXllcigpXHJcbiAgICBAZ2Z4VXBkYXRlUG9zaXRpb25zKClcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0U2NoZWR1bGVyKCkuc2NoZWR1bGVDYWxsYmFja0ZvclRhcmdldCh0aGlzLCBAdXBkYXRlLCAxLjAsIGNjLlJFUEVBVF9GT1JFVkVSLCAwLCBmYWxzZSlcclxuXHJcbiAgZ2Z4QWRqdXN0TWFwU2NhbGU6IChkZWx0YSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHNjYWxlICs9IGRlbHRhXHJcbiAgICBzY2FsZSA9IFNDQUxFX01BWCBpZiBzY2FsZSA+IFNDQUxFX01BWFxyXG4gICAgc2NhbGUgPSBTQ0FMRV9NSU4gaWYgc2NhbGUgPCBTQ0FMRV9NSU5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShzY2FsZSlcclxuXHJcbiAgZ2Z4UmVuZGVyUGF0aDogKHBhdGgpIC0+XHJcbiAgICB0aWxlcyA9IG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnRpbGVzMCwgMTYsIDE2LCAxNilcclxuICAgIGZvciBzIGluIEBnZngucGF0aFNwcml0ZXNcclxuICAgICAgQGdmeC5mbG9vckxheWVyLnJlbW92ZUNoaWxkIHNcclxuICAgIEBnZngucGF0aFNwcml0ZXMgPSBbXVxyXG4gICAgZm9yIHAgaW4gcGF0aFxyXG4gICAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHRpbGVzLnJlc291cmNlXHJcbiAgICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QodGlsZXMucmVjdCgxNykpXHJcbiAgICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHAueCAqIEBnZngudW5pdFNpemUsIHAueSAqIEBnZngudW5pdFNpemUpKVxyXG4gICAgICBzcHJpdGUuc2V0T3BhY2l0eSAxMjhcclxuICAgICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIHNwcml0ZVxyXG4gICAgICBAZ2Z4LnBhdGhTcHJpdGVzLnB1c2ggc3ByaXRlXHJcblxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24ocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIEBnZnhBZGp1c3RNYXBTY2FsZShkZWx0YSAvIDIwMClcclxuICAgIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgIyBAZ2Z4QWRqdXN0TWFwU2NhbGUgMC4xXHJcbiAgICAjIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBAZ2Z4LnVuaXRTaXplKVxyXG4gICAgZ3JpZFkgPSBNYXRoLmZsb29yKHBvcy55IC8gQGdmeC51bml0U2l6ZSlcclxuXHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCwgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueSwgZ3JpZFgsIGdyaWRZLCAwKVxyXG4gICAgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYygpXHJcbiAgICBAZ2Z4UmVuZGVyUGF0aChwYXRoKVxyXG5cclxuICAgICMgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCA9IGdyaWRYXHJcbiAgICAjIGNjLmdhbWUuc3RhdGUucGxheWVyLnkgPSBncmlkWVxyXG4gICAgIyBAZ2Z4VXBkYXRlUG9zaXRpb25zKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU1vZGVcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcblxuY2xhc3MgSW50cm9Nb2RlIGV4dGVuZHMgTW9kZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcihcIkludHJvXCIpXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxuICAgIEBhZGQgQHNwcml0ZVxuXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdzcGxhc2hzY3JlZW4nOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgJ3RpbGVzMCc6ICdyZXMvdGlsZXMwLnBuZydcclxuICAncGxheWVyJzogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxuY29jb3NQcmVsb2FkTGlzdCA9ICh7c3JjOiB2fSBmb3IgaywgdiBvZiByZXNvdXJjZXMpXHJcbnJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0ID0gY29jb3NQcmVsb2FkTGlzdFxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc291cmNlc1xyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXG5cbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKClcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuc3BsYXNoc2NyZWVuLCBjYy5yZWN0KDQ1MCwzMDAsMTYsMTYpXG4gICAgQHNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxuICAgIEBhZGRDaGlsZChAc3ByaXRlLCAwKVxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucCgwLCAwKSlcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXG4gICAgQHNldFNjYWxlKDEwLCAxMClcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXG5cbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cbiAgICBpZiB0b3VjaGVzXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcbiAgICAgIHkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxuICAgICAgY2MubG9nIFwidG91Y2ggRmxvb3IgYXQgI3t4fSwgI3t5fVwiXG5cbm1vZHVsZS5leHBvcnRzID0gRmxvb3JcbiIsImZzID0gcmVxdWlyZSAnZnMnXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXG5cblNIQVBFUyA9IFtcbiAgXCJcIlwiXG4gICMjIyMjIyMjIyMjI1xuICAjLi4uLi4uLi4uLiNcbiAgIy4uLi4uLi4uLi4jXG4gICMjIyMjIyMjLi4uI1xuICAgICAgICAgIy4uLiNcbiAgICAgICAgICMuLi4jXG4gICAgICAgICAjLi4uI1xuICAgICAgICAgIyMjIyNcbiAgXCJcIlwiXG4gIFwiXCJcIlxuICAjIyMjIyMjIyMjIyNcbiAgIy4uLi4uLi4uLi4jXG4gICMuLi4uLi4uLi4uI1xuICAjLi4uIyMjIyMjIyNcbiAgIy4uLiNcbiAgIy4uLiNcbiAgIyMjIyNcbiAgXCJcIlwiXG4gIFwiXCJcIlxuICAjIyMjI1xuICAjLi4uI1xuICAjLi4uIyMjIyMjIyNcbiAgIy4uLi4uLi4uLi4jXG4gICMuLi4uLi4uLi4uI1xuICAjIyMjIyMjIyMjIyNcbiAgXCJcIlwiXG4gIFwiXCJcIlxuICAgICAgIyMjI1xuICAgICAgIy4uI1xuICAgICAgIy4uI1xuICAgICAgIy4uI1xuICAgICAgIy4uI1xuICAgICAgIy4uI1xuICAgICAgIy4uI1xuICAjIyMjIy4uI1xuICAjLi4uLi4uI1xuICAjLi4uLi4uI1xuICAjLi4uLi4uI1xuICAjIyMjIyMjI1xuICBcIlwiXCJcbl1cblxuRU1QVFkgPSAwXG5XQUxMID0gMVxuRE9PUiA9IDJcbkZJUlNUX1JPT01fSUQgPSA1XG5cbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIHYgPT0gV0FMTCB0aGVuIHJldHVybiBwLmNvbG9yIDMyLCAzMiwgMzJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcbiAgICB3aGVuIHYgPj0gRklSU1RfUk9PTV9JRCB0aGVuIHJldHVybiBwLmNvbG9yIDAsIDAsIDUgKyBNYXRoLm1pbigyNDAsIDE1ICsgKHYgKiAyKSlcbiAgcmV0dXJuIHAuY29sb3IgMCwgMCwgMFxuXG5jbGFzcyBSZWN0XG4gIGNvbnN0cnVjdG9yOiAoQGwsIEB0LCBAciwgQGIpIC0+XG5cbiAgdzogLT4gQHIgLSBAbFxuICBoOiAtPiBAYiAtIEB0XG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXG4gIGFzcGVjdDogLT5cbiAgICBpZiBAaCgpID4gMFxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIDBcblxuICBzcXVhcmVuZXNzOiAtPlxuICAgIHJldHVybiBNYXRoLmFicyhAdygpIC0gQGgoKSlcblxuICBjZW50ZXI6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcbiAgICAgIHk6IE1hdGguZmxvb3IoKEBiICsgQHQpIC8gMilcbiAgICB9XG5cbiAgY2xvbmU6IC0+XG4gICAgcmV0dXJuIG5ldyBSZWN0KEBsLCBAdCwgQHIsIEBiKVxuXG4gIGV4cGFuZDogKHIpIC0+XG4gICAgaWYgQGFyZWEoKVxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcbiAgICAgIEB0ID0gci50IGlmIEB0ID4gci50XG4gICAgICBAciA9IHIuciBpZiBAciA8IHIuclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcbiAgICBlbHNlXG4gICAgICAjIHNwZWNpYWwgY2FzZSwgYmJveCBpcyBlbXB0eS4gUmVwbGFjZSBjb250ZW50cyFcbiAgICAgIEBsID0gci5sXG4gICAgICBAdCA9IHIudFxuICAgICAgQHIgPSByLnJcbiAgICAgIEBiID0gci5iXG5cbiAgdG9TdHJpbmc6IC0+IFwieyAoI3tAbH0sICN7QHR9KSAtPiAoI3tAcn0sICN7QGJ9KSAje0B3KCl9eCN7QGgoKX0sIGFyZWE6ICN7QGFyZWEoKX0sIGFzcGVjdDogI3tAYXNwZWN0KCl9LCBzcXVhcmVuZXNzOiAje0BzcXVhcmVuZXNzKCl9IH1cIlxuXG5jbGFzcyBSb29tVGVtcGxhdGVcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEByb29taWQpIC0+XG4gICAgQGdyaWQgPSBbXVxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgQGdyaWRbaV0gPSBbXVxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgICBAZ3JpZFtpXVtqXSA9IEVNUFRZXG5cbiAgICBAZ2VuZXJhdGVTaGFwZSgpXG5cbiAgZ2VuZXJhdGVTaGFwZTogLT5cbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgICAgQHNldChpLCBqLCBAcm9vbWlkKVxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgQHNldChpLCAwLCBXQUxMKVxuICAgICAgQHNldChpLCBAaGVpZ2h0IC0gMSwgV0FMTClcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICBAc2V0KDAsIGosIFdBTEwpXG4gICAgICBAc2V0KEB3aWR0aCAtIDEsIGosIFdBTEwpXG5cbiAgcmVjdDogKHgsIHkpIC0+XG4gICAgcmV0dXJuIG5ldyBSZWN0IHgsIHksIHggKyBAd2lkdGgsIHkgKyBAaGVpZ2h0XG5cbiAgc2V0OiAoaSwgaiwgdikgLT5cbiAgICBAZ3JpZFtpXVtqXSA9IHZcblxuICBnZXQ6IChtYXAsIHgsIHksIGksIGopIC0+XG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XG4gICAgICB2ID0gQGdyaWRbaV1bal1cbiAgICAgIHJldHVybiB2IGlmIHYgIT0gRU1QVFlcbiAgICByZXR1cm4gbWFwLmdldCB4ICsgaSwgeSArIGpcblxuICBwbGFjZTogKG1hcCwgeCwgeSkgLT5cbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgICAgdiA9IEBncmlkW2ldW2pdXG4gICAgICAgIG1hcC5zZXQoeCArIGksIHkgKyBqLCB2KSBpZiB2ICE9IEVNUFRZXG5cbiAgZml0czogKG1hcCwgeCwgeSkgLT5cbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgICAgbXYgPSBtYXAuZ2V0KHggKyBpLCB5ICsgailcbiAgICAgICAgc3YgPSBAZ3JpZFtpXVtqXVxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICBkb29yRWxpZ2libGU6IChtYXAsIHgsIHksIGksIGopIC0+XG4gICAgd2FsbE5laWdoYm9ycyA9IDBcbiAgICByb29tc1NlZW4gPSB7fVxuICAgIHZhbHVlcyA9IFtcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpICsgMSwgailcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpLCBqICsgMSlcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpLCBqIC0gMSlcbiAgICBdXG4gICAgZm9yIHYgaW4gdmFsdWVzXG4gICAgICBpZiB2XG4gICAgICAgIGlmIHYgPT0gMVxuICAgICAgICAgIHdhbGxOZWlnaGJvcnMrK1xuICAgICAgICBlbHNlIGlmIHYgIT0gMlxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcbiAgICByb29tcyA9IE9iamVjdC5rZXlzKHJvb21zU2Vlbikuc29ydCAoYSwgYikgLT4gYS1iXG4gICAgcm9vbXMgPSByb29tcy5tYXAgKHJvb20pIC0+IHBhcnNlSW50KHJvb20pXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXG4gICAgaWYgKHdhbGxOZWlnaGJvcnMgPT0gMikgYW5kIChyb29tQ291bnQgPT0gMikgYW5kIChAcm9vbWlkIGluIHJvb21zKVxuICAgICAgaWYgKHZhbHVlc1swXSA9PSB2YWx1ZXNbMV0pIG9yICh2YWx1ZXNbMl0gPT0gdmFsdWVzWzNdKVxuICAgICAgICByZXR1cm4gcm9vbXNcbiAgICByZXR1cm4gWy0xLCAtMV1cblxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXG4gICAgICAgIGlmIHJvb21zWzBdICE9IC0xIGFuZCBAcm9vbWlkIGluIHJvb21zXG4gICAgICAgICAgcmV0dXJuIFtpLCBqXVxuICAgIHJldHVybiBbLTEsIC0xXVxuXG4gIG1lYXN1cmU6IChtYXAsIHgsIHkpIC0+XG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXG4gICAgYmJveFRlbXAuZXhwYW5kIEByZWN0KHgsIHkpXG4gICAgW2Jib3hUZW1wLmFyZWEoKSwgYmJveFRlbXAuc3F1YXJlbmVzcygpXVxuXG4gIGZpbmRCZXN0U3BvdDogKG1hcCkgLT5cbiAgICBtaW5TcXVhcmVuZXNzID0gTWF0aC5tYXggbWFwLndpZHRoLCBtYXAuaGVpZ2h0XG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcbiAgICBtaW5YID0gLTFcbiAgICBtaW5ZID0gLTFcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxuICAgIHNlYXJjaEwgPSBtYXAuYmJveC5sIC0gQHdpZHRoXG4gICAgc2VhcmNoUiA9IG1hcC5iYm94LnJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcbiAgICBzZWFyY2hCID0gbWFwLmJib3guYlxuICAgIGZvciBpIGluIFtzZWFyY2hMIC4uLiBzZWFyY2hSXVxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXG4gICAgICAgIGlmIEBmaXRzKG1hcCwgaSwgailcbiAgICAgICAgICBbYXJlYSwgc3F1YXJlbmVzc10gPSBAbWVhc3VyZSBtYXAsIGksIGpcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xuICAgICAgICAgICAgbG9jYXRpb24gPSBAZG9vckxvY2F0aW9uIG1hcCwgaSwgalxuICAgICAgICAgICAgaWYgbG9jYXRpb25bMF0gIT0gLTFcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cbiAgICAgICAgICAgICAgbWluQXJlYSA9IGFyZWFcbiAgICAgICAgICAgICAgbWluU3F1YXJlbmVzcyA9IHNxdWFyZW5lc3NcbiAgICAgICAgICAgICAgbWluWCA9IGlcbiAgICAgICAgICAgICAgbWluWSA9IGpcbiAgICByZXR1cm4gW21pblgsIG1pblksIGRvb3JMb2NhdGlvbl1cblxuY2xhc3MgU2hhcGVSb29tVGVtcGxhdGUgZXh0ZW5kcyBSb29tVGVtcGxhdGVcbiAgY29uc3RydWN0b3I6IChzaGFwZSwgcm9vbWlkKSAtPlxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXG4gICAgdyA9IDBcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcbiAgICBAd2lkdGggPSB3XG4gICAgQGhlaWdodCA9IEBsaW5lcy5sZW5ndGhcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxuXG4gIGdlbmVyYXRlU2hhcGU6IC0+XG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICAgIEBzZXQoaSwgaiwgRU1QVFkpXG4gICAgaSA9IDBcbiAgICBqID0gMFxuICAgIGZvciBsaW5lIGluIEBsaW5lc1xuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxuICAgICAgICB2ID0gc3dpdGNoIGNcbiAgICAgICAgICB3aGVuICcuJyB0aGVuIEByb29taWRcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcbiAgICAgICAgICBlbHNlIDBcbiAgICAgICAgaWYgdlxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcbiAgICAgICAgaSsrXG4gICAgICBqKytcbiAgICAgIGkgPSAwXG5cbmNsYXNzIFJvb21cbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cbiAgICAjIGNvbnNvbGUubG9nIFwicm9vbSBjcmVhdGVkICN7QHJlY3R9XCJcblxuY2xhc3MgTWFwXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAc2VlZCkgLT5cbiAgICBAcmFuZFJlc2V0KClcbiAgICBAZ3JpZCA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBAZ3JpZFtpXSA9IFtdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIEBncmlkW2ldW2pdID1cbiAgICAgICAgICB0eXBlOiBFTVBUWVxuICAgICAgICAgIHg6IGlcbiAgICAgICAgICB5OiBqXG4gICAgQGJib3ggPSBuZXcgUmVjdCAwLCAwLCAwLCAwXG4gICAgQHJvb21zID0gW11cblxuICByYW5kUmVzZXQ6IC0+XG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXG5cbiAgcmFuZDogKHYpIC0+XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcblxuICBzZXQ6IChpLCBqLCB2KSAtPlxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XG5cbiAgZ2V0OiAoaSwgaikgLT5cbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcbiAgICAgIHJldHVybiBAZ3JpZFtpXVtqXS50eXBlXG4gICAgcmV0dXJuIDBcblxuICBhZGRSb29tOiAocm9vbVRlbXBsYXRlLCB4LCB5KSAtPlxuICAgICMgY29uc29sZS5sb2cgXCJwbGFjaW5nIHJvb20gYXQgI3t4fSwgI3t5fVwiXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcbiAgICByID0gcm9vbVRlbXBsYXRlLnJlY3QoeCwgeSlcbiAgICBAcm9vbXMucHVzaCBuZXcgUm9vbSByXG4gICAgQGJib3guZXhwYW5kKHIpXG4gICAgIyBjb25zb2xlLmxvZyBcIm5ldyBtYXAgYmJveCAje0BiYm94fVwiXG5cbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxuICAgIHIgPSBAcmFuZCgxMDApXG4gICAgc3dpdGNoXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxuICAgICAgd2hlbiAxMCA8IHIgPCAyMCB0aGVuIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDUgKyBAcmFuZCgxMCksIDMsIHJvb21pZCAgICAgICAgICAgICAgICAgICMgaG9yaXpvbnRhbCBjb3JyaWRvclxuICAgICAgd2hlbiAyMCA8IHIgPCAzMCB0aGVuIHJldHVybiBuZXcgU2hhcGVSb29tVGVtcGxhdGUgU0hBUEVTW0ByYW5kKFNIQVBFUy5sZW5ndGgpXSwgcm9vbWlkICMgcmFuZG9tIHNoYXBlIGZyb20gU0hBUEVTXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cblxuICBnZW5lcmF0ZVJvb206IChyb29taWQpIC0+XG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcbiAgICBpZiBAcm9vbXMubGVuZ3RoID09IDBcbiAgICAgIHggPSBNYXRoLmZsb29yKChAd2lkdGggLyAyKSAtIChyb29tVGVtcGxhdGUud2lkdGggLyAyKSlcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XG4gICAgZWxzZVxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXG4gICAgICBpZiB4IDwgMFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxuICAgIHJldHVybiB0cnVlXG5cbiAgZ2VuZXJhdGVSb29tczogKGNvdW50KSAtPlxuICAgIGZvciBpIGluIFswLi4uY291bnRdXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxuXG4gICAgICBhZGRlZCA9IGZhbHNlXG4gICAgICB3aGlsZSBub3QgYWRkZWRcbiAgICAgICAgYWRkZWQgPSBAZ2VuZXJhdGVSb29tIHJvb21pZFxuXG5nZW5lcmF0ZSA9IC0+XG4gIG1hcCA9IG5ldyBNYXAgODAsIDgwLCAxMFxuICBtYXAuZ2VuZXJhdGVSb29tcygyMClcbiAgcmV0dXJuIG1hcFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxuICBFTVBUWTogRU1QVFlcbiAgV0FMTDogV0FMTFxuICBET09SOkRPT1JcbiAgRklSU1RfUk9PTV9JRDogRklSU1RfUk9PTV9JRFxuIiwiZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcblxuY2xhc3MgQmluYXJ5SGVhcFxuICBjb25zdHJ1Y3RvcjogKHNjb3JlRnVuY3Rpb24pIC0+XG4gICAgQGNvbnRlbnQgPSBbXVxuICAgIEBzY29yZUZ1bmN0aW9uID0gc2NvcmVGdW5jdGlvblxuXG4gIHB1c2g6IChlbGVtZW50KSAtPlxuICAgICMgQWRkIHRoZSBuZXcgZWxlbWVudCB0byB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICBAY29udGVudC5wdXNoKGVsZW1lbnQpXG5cbiAgICAjIEFsbG93IGl0IHRvIHNpbmsgZG93bi5cbiAgICBAc2lua0Rvd24oQGNvbnRlbnQubGVuZ3RoIC0gMSlcblxuICBwb3A6IC0+XG4gICAgIyBTdG9yZSB0aGUgZmlyc3QgZWxlbWVudCBzbyB3ZSBjYW4gcmV0dXJuIGl0IGxhdGVyLlxuICAgIHJlc3VsdCA9IEBjb250ZW50WzBdXG4gICAgIyBHZXQgdGhlIGVsZW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgZW5kID0gQGNvbnRlbnQucG9wKClcbiAgICAjIElmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgbGVmdCwgcHV0IHRoZSBlbmQgZWxlbWVudCBhdCB0aGVcbiAgICAjIHN0YXJ0LCBhbmQgbGV0IGl0IGJ1YmJsZSB1cC5cbiAgICBpZiBAY29udGVudC5sZW5ndGggPiAwXG4gICAgICBAY29udGVudFswXSA9IGVuZFxuICAgICAgQGJ1YmJsZVVwKDApXG5cbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgcmVtb3ZlOiAobm9kZSkgLT5cbiAgICBpID0gQGNvbnRlbnQuaW5kZXhPZihub2RlKVxuXG4gICAgIyBXaGVuIGl0IGlzIGZvdW5kLCB0aGUgcHJvY2VzcyBzZWVuIGluICdwb3AnIGlzIHJlcGVhdGVkXG4gICAgIyB0byBmaWxsIHVwIHRoZSBob2xlLlxuICAgIGVuZCA9IEBjb250ZW50LnBvcCgpXG5cbiAgICBpZiBpICE9IEBjb250ZW50Lmxlbmd0aCAtIDFcbiAgICAgIEBjb250ZW50W2ldID0gZW5kXG5cbiAgICBpZiBAc2NvcmVGdW5jdGlvbihlbmQpIDwgQHNjb3JlRnVuY3Rpb24obm9kZSlcbiAgICAgIEBzaW5rRG93bihpKVxuICAgIGVsc2VcbiAgICAgIEBidWJibGVVcChpKVxuXG4gIHNpemU6IC0+XG4gICAgcmV0dXJuIEBjb250ZW50Lmxlbmd0aFxuXG4gIHJlc2NvcmVFbGVtZW50OiAobm9kZSkgLT5cbiAgICBAc2lua0Rvd24oQGNvbnRlbnQuaW5kZXhPZihub2RlKSlcblxuICBzaW5rRG93bjogKG4pIC0+XG4gICAgIyBGZXRjaCB0aGUgZWxlbWVudCB0aGF0IGhhcyB0byBiZSBzdW5rLlxuICAgIGVsZW1lbnQgPSBAY29udGVudFtuXVxuXG4gICAgIyBXaGVuIGF0IDAsIGFuIGVsZW1lbnQgY2FuIG5vdCBzaW5rIGFueSBmdXJ0aGVyLlxuICAgIHdoaWxlIChuID4gMClcbiAgICAgICMgQ29tcHV0ZSB0aGUgcGFyZW50IGVsZW1lbnQncyBpbmRleCwgYW5kIGZldGNoIGl0LlxuICAgICAgcGFyZW50TiA9ICgobiArIDEpID4+IDEpIC0gMVxuICAgICAgcGFyZW50ID0gQGNvbnRlbnRbcGFyZW50Tl1cbiAgICAgICMgU3dhcCB0aGUgZWxlbWVudHMgaWYgdGhlIHBhcmVudCBpcyBncmVhdGVyLlxuICAgICAgaWYgQHNjb3JlRnVuY3Rpb24oZWxlbWVudCkgPCBAc2NvcmVGdW5jdGlvbihwYXJlbnQpXG4gICAgICAgIEBjb250ZW50W3BhcmVudE5dID0gZWxlbWVudFxuICAgICAgICBAY29udGVudFtuXSA9IHBhcmVudFxuICAgICAgICAjIFVwZGF0ZSAnbicgdG8gY29udGludWUgYXQgdGhlIG5ldyBwb3NpdGlvbi5cbiAgICAgICAgbiA9IHBhcmVudE5cblxuICAgICAgIyBGb3VuZCBhIHBhcmVudCB0aGF0IGlzIGxlc3MsIG5vIG5lZWQgdG8gc2luayBhbnkgZnVydGhlci5cbiAgICAgIGVsc2VcbiAgICAgICAgYnJlYWtcblxuICBidWJibGVVcDogKG4pIC0+XG4gICAgIyBMb29rIHVwIHRoZSB0YXJnZXQgZWxlbWVudCBhbmQgaXRzIHNjb3JlLlxuICAgIGxlbmd0aCA9IEBjb250ZW50Lmxlbmd0aFxuICAgIGVsZW1lbnQgPSBAY29udGVudFtuXVxuICAgIGVsZW1TY29yZSA9IEBzY29yZUZ1bmN0aW9uKGVsZW1lbnQpXG5cbiAgICB3aGlsZSh0cnVlKVxuICAgICAgIyBDb21wdXRlIHRoZSBpbmRpY2VzIG9mIHRoZSBjaGlsZCBlbGVtZW50cy5cbiAgICAgIGNoaWxkMk4gPSAobiArIDEpIDw8IDFcbiAgICAgIGNoaWxkMU4gPSBjaGlsZDJOIC0gMVxuICAgICAgIyBUaGlzIGlzIHVzZWQgdG8gc3RvcmUgdGhlIG5ldyBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCxcbiAgICAgICMgaWYgYW55LlxuICAgICAgc3dhcCA9IG51bGxcbiAgICAgICMgSWYgdGhlIGZpcnN0IGNoaWxkIGV4aXN0cyAoaXMgaW5zaWRlIHRoZSBhcnJheSkuLi5cbiAgICAgIGlmIGNoaWxkMU4gPCBsZW5ndGhcbiAgICAgICAgIyBMb29rIGl0IHVwIGFuZCBjb21wdXRlIGl0cyBzY29yZS5cbiAgICAgICAgY2hpbGQxID0gQGNvbnRlbnRbY2hpbGQxTl1cbiAgICAgICAgY2hpbGQxU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihjaGlsZDEpXG5cbiAgICAgICAgIyBJZiB0aGUgc2NvcmUgaXMgbGVzcyB0aGFuIG91ciBlbGVtZW50J3MsIHdlIG5lZWQgdG8gc3dhcC5cbiAgICAgICAgaWYgY2hpbGQxU2NvcmUgPCBlbGVtU2NvcmVcbiAgICAgICAgICBzd2FwID0gY2hpbGQxTlxuXG4gICAgICAjIERvIHRoZSBzYW1lIGNoZWNrcyBmb3IgdGhlIG90aGVyIGNoaWxkLlxuICAgICAgaWYgY2hpbGQyTiA8IGxlbmd0aFxuICAgICAgICBjaGlsZDIgPSBAY29udGVudFtjaGlsZDJOXVxuICAgICAgICBjaGlsZDJTY29yZSA9IEBzY29yZUZ1bmN0aW9uKGNoaWxkMilcbiAgICAgICAgaWYgY2hpbGQyU2NvcmUgPCAoc3dhcCA9PSBudWxsID8gZWxlbVNjb3JlIDogY2hpbGQxU2NvcmUpXG4gICAgICAgICAgc3dhcCA9IGNoaWxkMk5cblxuICAgICAgIyBJZiB0aGUgZWxlbWVudCBuZWVkcyB0byBiZSBtb3ZlZCwgc3dhcCBpdCwgYW5kIGNvbnRpbnVlLlxuICAgICAgaWYgc3dhcCAhPSBudWxsXG4gICAgICAgIEBjb250ZW50W25dID0gQGNvbnRlbnRbc3dhcF1cbiAgICAgICAgQGNvbnRlbnRbc3dhcF0gPSBlbGVtZW50XG4gICAgICAgIG4gPSBzd2FwXG5cbiAgICAgICMgT3RoZXJ3aXNlLCB3ZSBhcmUgZG9uZS5cbiAgICAgIGVsc2VcbiAgICAgICAgYnJlYWtcblxuY2xhc3MgQVN0YXJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XG4gICAgZm9yIHggaW4gWzAuLi5AZmxvb3Iud2lkdGhdXG4gICAgICBmb3IgeSBpbiBbMC4uLkBmbG9vci5oZWlnaHRdXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxuICAgICAgICBub2RlLmYgPSAwXG4gICAgICAgIG5vZGUuZyA9IDBcbiAgICAgICAgbm9kZS5oID0gMFxuICAgICAgICBub2RlLmNvc3QgPSBub2RlLnR5cGVcbiAgICAgICAgbm9kZS52aXNpdGVkID0gZmFsc2VcbiAgICAgICAgbm9kZS5jbG9zZWQgPSBmYWxzZVxuICAgICAgICBub2RlLnBhcmVudCA9IG51bGxcblxuICBoZWFwOiAtPlxuICAgIHJldHVybiBuZXcgQmluYXJ5SGVhcCAobm9kZSkgLT5cbiAgICAgIHJldHVybiBub2RlLmZcblxuICBzZWFyY2g6IChzdGFydCwgZW5kKSAtPlxuICAgIGdyaWQgPSBAZmxvb3IuZ3JpZFxuICAgIGhldXJpc3RpYyA9IEBtYW5oYXR0YW5cblxuICAgIG9wZW5IZWFwID0gQGhlYXAoKVxuICAgIG9wZW5IZWFwLnB1c2goc3RhcnQpXG5cbiAgICB3aGlsZSBvcGVuSGVhcC5zaXplKCkgPiAwXG4gICAgICAjIEdyYWIgdGhlIGxvd2VzdCBmKHgpIHRvIHByb2Nlc3MgbmV4dC4gIEhlYXAga2VlcHMgdGhpcyBzb3J0ZWQgZm9yIHVzLlxuICAgICAgY3VycmVudE5vZGUgPSBvcGVuSGVhcC5wb3AoKVxuXG4gICAgICAjIEVuZCBjYXNlIC0tIHJlc3VsdCBoYXMgYmVlbiBmb3VuZCwgcmV0dXJuIHRoZSB0cmFjZWQgcGF0aC5cbiAgICAgIGlmIGN1cnJlbnROb2RlID09IGVuZFxuICAgICAgICBjdXJyID0gY3VycmVudE5vZGVcbiAgICAgICAgcmV0ID0gW11cbiAgICAgICAgd2hpbGUgY3Vyci5wYXJlbnRcbiAgICAgICAgICByZXQucHVzaChjdXJyKVxuICAgICAgICAgIGN1cnIgPSBjdXJyLnBhcmVudFxuXG4gICAgICAgIHJldHVybiByZXQucmV2ZXJzZSgpXG5cbiAgICAgICMgTm9ybWFsIGNhc2UgLS0gbW92ZSBjdXJyZW50Tm9kZSBmcm9tIG9wZW4gdG8gY2xvc2VkLCBwcm9jZXNzIGVhY2ggb2YgaXRzIG5laWdoYm9ycy5cbiAgICAgIGN1cnJlbnROb2RlLmNsb3NlZCA9IHRydWVcblxuICAgICAgIyBGaW5kIGFsbCBuZWlnaGJvcnMgZm9yIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgICBuZWlnaGJvcnMgPSBAbmVpZ2hib3JzKGdyaWQsIGN1cnJlbnROb2RlKVxuXG4gICAgICBmb3IgbmVpZ2hib3IgaW4gbmVpZ2hib3JzXG4gICAgICAgIGlmIG5laWdoYm9yLmNsb3NlZCBvciAobmVpZ2hib3IudHlwZSA9PSBmbG9vcmdlbi5XQUxMKVxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICAjIFRoZSBnIHNjb3JlIGlzIHRoZSBzaG9ydGVzdCBkaXN0YW5jZSBmcm9tIHN0YXJ0IHRvIGN1cnJlbnQgbm9kZS5cbiAgICAgICAgIyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXRoIHdlIGhhdmUgYXJyaXZlZCBhdCB0aGlzIG5laWdoYm9yIGlzIHRoZSBzaG9ydGVzdCBvbmUgd2UgaGF2ZSBzZWVuIHlldC5cbiAgICAgICAgZ1Njb3JlID0gY3VycmVudE5vZGUuZyArIG5laWdoYm9yLmNvc3RcbiAgICAgICAgYmVlblZpc2l0ZWQgPSBuZWlnaGJvci52aXNpdGVkXG5cbiAgICAgICAgaWYgKG5vdCBiZWVuVmlzaXRlZCkgb3IgKGdTY29yZSA8IG5laWdoYm9yLmcpXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLiAgVGFrZSBzY29yZSBmb3Igbm9kZSB0byBzZWUgaG93IGdvb2QgaXQgaXMuXG4gICAgICAgICAgbmVpZ2hib3IudmlzaXRlZCA9IHRydWVcbiAgICAgICAgICBuZWlnaGJvci5wYXJlbnQgPSBjdXJyZW50Tm9kZVxuICAgICAgICAgIG5laWdoYm9yLmggPSBuZWlnaGJvci5oIG9yIGhldXJpc3RpYyhuZWlnaGJvci54LCBuZWlnaGJvci55LCBlbmQueCwgZW5kLnkpXG4gICAgICAgICAgbmVpZ2hib3IuZyA9IGdTY29yZVxuICAgICAgICAgIG5laWdoYm9yLmYgPSBuZWlnaGJvci5nICsgbmVpZ2hib3IuaFxuXG4gICAgICAgICAgaWYgbm90IGJlZW5WaXNpdGVkXG4gICAgICAgICAgICAjIFB1c2hpbmcgdG8gaGVhcCB3aWxsIHB1dCBpdCBpbiBwcm9wZXIgcGxhY2UgYmFzZWQgb24gdGhlICdmJyB2YWx1ZS5cbiAgICAgICAgICAgIG9wZW5IZWFwLnB1c2gobmVpZ2hib3IpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBBbHJlYWR5IHNlZW4gdGhlIG5vZGUsIGJ1dCBzaW5jZSBpdCBoYXMgYmVlbiByZXNjb3JlZCB3ZSBuZWVkIHRvIHJlb3JkZXIgaXQgaW4gdGhlIGhlYXBcbiAgICAgICAgICAgIG9wZW5IZWFwLnJlc2NvcmVFbGVtZW50KG5laWdoYm9yKVxuXG4gICAgIyBObyByZXN1bHQgd2FzIGZvdW5kIC0gZW1wdHkgYXJyYXkgc2lnbmlmaWVzIGZhaWx1cmUgdG8gZmluZCBwYXRoLlxuICAgIHJldHVybiBbXVxuXG4gIG1hbmhhdHRhbjogKHgwLCB5MCwgeDEsIHkxKSAtPlxuICAgICMgU2VlIGxpc3Qgb2YgaGV1cmlzdGljczogaHR0cDovL3RoZW9yeS5zdGFuZm9yZC5lZHUvfmFtaXRwL0dhbWVQcm9ncmFtbWluZy9IZXVyaXN0aWNzLmh0bWxcbiAgICBkMSA9IE1hdGguYWJzICh4MSAtIHgwKVxuICAgIGQyID0gTWF0aC5hYnMgKHkxIC0geTApXG4gICAgcmV0dXJuIGQxICsgZDJcblxuICBkaXN0U3F1YXJlZDogKHgwLCB5MCwgeDEsIHkxKSAtPlxuICAgIGR4ID0geDEgLSB4MFxuICAgIGR5ID0geTEgLSB5MFxuICAgIHJldHVybiAoZHggKiBkeCkgKyAoZHkgKiBkeSlcblxuICBuZWlnaGJvcnM6IChncmlkLCBub2RlKSAtPlxuICAgIHJldCA9IFtdXG4gICAgeCA9IG5vZGUueFxuICAgIHkgPSBub2RlLnlcblxuICAgICMgV2VzdFxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ldXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beV0pXG5cbiAgICAjIEVhc3RcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5XVxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ldKVxuXG4gICAgIyBTb3V0aFxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beS0xXVxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5LTFdKVxuXG4gICAgIyBOb3J0aFxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beSsxXVxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5KzFdKVxuXG4gICAgIyBTb3V0aHdlc3RcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5LTFdXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beS0xXSlcblxuICAgICMgU291dGhlYXN0XG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beS0xXVxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ktMV0pXG5cbiAgICAjIE5vcnRod2VzdFxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3krMV1cbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5KzFdKVxuXG4gICAgIyBOb3J0aGVhc3RcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5KzFdXG4gICAgICByZXQucHVzaChncmlkW3grMV1beSsxXSlcblxuICAgIHJldHVybiByZXRcblxuY2xhc3MgUGF0aGZpbmRlclxuICBjb25zdHJ1Y3RvcjogKEBzdGFydFgsIEBzdGFydFksIEBkZXN0WCwgQGRlc3RZLCBAZmxhZ3MpIC0+XG4gICAgQGZsb29yID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKVxuXG4gIGNhbGM6IC0+XG4gICAgYXN0YXIgPSBuZXcgQVN0YXIgQGZsb29yXG4gICAgcmV0dXJuIGFzdGFyLnNlYXJjaChAZmxvb3IuZ3JpZFtAc3RhcnRYXVtAc3RhcnRZXSwgQGZsb29yLmdyaWRbQGRlc3RYXVtAZGVzdFldKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhmaW5kZXJcbiJdfQ==
;