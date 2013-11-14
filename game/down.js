require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],3:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};'use strict';

var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof global === 'undefined' ? window : global;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function(seed, options) {
  if (options && options.global === true) {
    options.global = false;
    Math.random = module.exports(seed, options);
    options.global = true;
    return Math.random;
  }
  var use_entropy = (options && options.entropy) || false;
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  return function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
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
  };
};

module.exports.resetGlobal = function () {
  Math.random = oldRandom;
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
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);

},{}],"base/mode":[function(require,module,exports){
module.exports=require('mhMvP9');
},{}],"mhMvP9":[function(require,module,exports){
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


},{"boot/maindroid":"9J2gK6","boot/mainweb":"n6LVrX"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('9J2gK6');
},{}],"9J2gK6":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"mBOMH+"}],"n6LVrX":[function(require,module,exports){
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


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('n6LVrX');
},{}],"KsM6/6":[function(require,module,exports){
var Brain;

Brain = (function() {
  function Brain(tiles, animFrame) {
    this.tiles = tiles;
    this.animFrame = animFrame;
    this.facingRight = true;
    this.cd = 0;
    this.interpFrames = [];
    this.path = [];
  }

  Brain.prototype.move = function(gx, gy, frames) {
    var animFrame, dx, dy, f, i, _i, _len;
    this.interpFrames = [];
    dx = (this.x - gx) * cc.unitSize;
    dy = (this.y - gy) * cc.unitSize;
    this.facingRight = dx < 0;
    i = frames.length;
    for (_i = 0, _len = frames.length; _i < _len; _i++) {
      f = frames[_i];
      animFrame = {
        x: dx * i / frames.length,
        y: dy * i / frames.length,
        animFrame: f
      };
      this.interpFrames.push(animFrame);
      i--;
    }
    cc.game.setTurnFrames(frames.length);
    this.x = gx;
    return this.y = gy;
  };

  Brain.prototype.walkPath = function(path) {
    this.path = path;
  };

  Brain.prototype.createSprite = function() {
    var s;
    s = cc.Sprite.create(this.tiles.resource);
    this.updateSprite(s);
    return s;
  };

  Brain.prototype.updateSprite = function(sprite) {
    var animFrame, frame, x, xanchor, xscale, y;
    x = this.x * cc.unitSize;
    y = this.y * cc.unitSize;
    animFrame = this.animFrame;
    if (this.interpFrames.length) {
      frame = this.interpFrames.splice(0, 1)[0];
      x += frame.x;
      y += frame.y;
      animFrame = frame.animFrame;
    }
    sprite.setTextureRect(this.tiles.rect(animFrame));
    sprite.setPosition(cc.p(x, y));
    xanchor = 1.0;
    xscale = -1.0;
    if (this.facingRight) {
      xanchor = 0;
      xscale = 1.0;
    }
    sprite.setScaleX(xscale);
    return sprite.setAnchorPoint(cc.p(xanchor, 0));
  };

  Brain.prototype.takeStep = function() {
    var step;
    if (this.interpFrames.length === 0) {
      if (this.path.length > 0) {
        step = this.path.splice(0, 1)[0];
        this.move(step.x, step.y, [2, 3, 4]);
        return true;
      }
    }
    return false;
  };

  Brain.prototype.tick = function(elapsedTurns) {
    if (this.cd > 0) {
      if (this.cd > 0) {
        this.cd -= elapsedTurns;
      }
      if (this.cd < 0) {
        this.cd = 0;
      }
    }
    if (this.cd === 0) {
      return this.think();
    }
  };

  Brain.prototype.think = function() {
    return cc.log("think not implemented!");
  };

  return Brain;

})();

module.exports = Brain;


},{}],"brain/brain":[function(require,module,exports){
module.exports=require('KsM6/6');
},{}],"brain/player":[function(require,module,exports){
module.exports=require('TryngT');
},{}],"TryngT":[function(require,module,exports){
var Brain, Pathfinder, Player, Tilesheet, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

resources = require('resources');

Brain = require('brain/brain');

Pathfinder = require('world/pathfinder');

Tilesheet = require('gfx/tilesheet');

Player = (function(_super) {
  __extends(Player, _super);

  function Player(data) {
    var k, v;
    this.animFrame = 0;
    for (k in data) {
      v = data[k];
      this[k] = v;
    }
    Player.__super__.constructor.call(this, resources.tilesheets.player, this.animFrame);
  }

  Player.prototype.walkPath = function(path) {
    this.path = path;
  };

  Player.prototype.think = function() {
    if (this.takeStep()) {
      return this.cd = 50;
    }
  };

  Player.prototype.act = function(gx, gy) {
    var path, pathfinder;
    pathfinder = new Pathfinder(cc.game.currentFloor(), 0);
    path = pathfinder.calc(this.x, this.y, gx, gy);
    this.walkPath(path);
    return cc.log("path is " + path.length + " long");
  };

  return Player;

})(Brain);

module.exports = Player;


},{"brain/brain":"KsM6/6","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/pathfinder":"2ZcY+C"}],"tWG/YV":[function(require,module,exports){
module.exports = {
  COCOS2D_DEBUG: 2,
  box2d: false,
  chipmunk: false,
  showFPS: true,
  frameRate: 60,
  loadExtension: false,
  renderMode: 0,
  tag: 'gameCanvas',
  appFiles: ['bundle.js'],
  unitSize: 32,
  scale: {
    speed: 400,
    min: 0.75,
    max: 3.0
  }
};


},{}],"config":[function(require,module,exports){
module.exports=require('tWG/YV');
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


},{}],"gfx/tilesheet":[function(require,module,exports){
module.exports=require('2l7Ub8');
},{}],"2l7Ub8":[function(require,module,exports){
var PIXEL_FUDGE_FACTOR, SCALE_FUDGE_FACTOR, Tilesheet, TilesheetBatchNode;

PIXEL_FUDGE_FACTOR = 0;

SCALE_FUDGE_FACTOR = 0;

TilesheetBatchNode = cc.SpriteBatchNode.extend({
  init: function(fileImage, capacity) {
    return this._super(fileImage, capacity);
  },
  createSprite: function(tileIndex, x, y) {
    var sprite;
    sprite = cc.Sprite.createWithTexture(this.getTexture(), this.tilesheet.rect(tileIndex));
    sprite.setAnchorPoint(cc.p(0, 0));
    sprite.setPosition(x, y);
    sprite.setScale(this.tilesheet.adjustedScale.x, this.tilesheet.adjustedScale.y);
    this.addChild(sprite);
    return sprite;
  }
});

Tilesheet = (function() {
  function Tilesheet(resource, resourceWidth, resourceHeight, tileWidth, tileHeight, tilePadding) {
    this.resource = resource;
    this.resourceWidth = resourceWidth;
    this.resourceHeight = resourceHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tilePadding = tilePadding;
    this.paddedTileWidth = this.tileWidth + (this.tilePadding * 2);
    this.paddedTileHeight = this.tileHeight + (this.tilePadding * 2);
    this.stride = Math.floor(this.resourceWidth / (this.tileWidth + (this.tilePadding * 2)));
    this.adjustedScale = {
      x: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / this.tileWidth),
      y: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / this.tileHeight)
    };
  }

  Tilesheet.prototype.rect = function(v) {
    var x, y;
    y = Math.floor(v / this.stride);
    x = v % this.stride;
    return cc.rect(this.tilePadding + (x * this.paddedTileWidth), this.tilePadding + (y * this.paddedTileHeight), this.tileWidth - PIXEL_FUDGE_FACTOR, this.tileHeight - PIXEL_FUDGE_FACTOR);
  };

  Tilesheet.prototype.createBatchNode = function(capacity) {
    var batchNode;
    batchNode = new TilesheetBatchNode();
    batchNode.tilesheet = this;
    batchNode.init(this.resource, capacity);
    return batchNode;
  };

  return Tilesheet;

})();

module.exports = Tilesheet;


},{}],"mBOMH+":[function(require,module,exports){
var Game, GameMode, IntroMode, Player, config, floorgen, resources, size;

config = require('config');

resources = require('resources');

IntroMode = require('mode/intro');

GameMode = require('mode/game');

floorgen = require('world/floorgen');

Player = require('brain/player');

Game = (function() {
  function Game() {
    this.turnFrames = 0;
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
      running: false,
      player: new Player({
        x: 44,
        y: 49,
        floor: 1
      }),
      floors: [{}, this.newFloor()]
    };
  };

  Game.prototype.setTurnFrames = function(count) {
    if (this.turnFrames < count) {
      return this.turnFrames = count;
    }
  };

  return Game;

})();

if (!cc.game) {
  size = cc.Director.getInstance().getWinSize();
  cc.unitSize = config.unitSize;
  cc.width = size.width;
  cc.height = size.height;
  cc.game = new Game();
}


},{"brain/player":"TryngT","config":"tWG/YV","mode/game":"fSCZ8s","mode/intro":"GT1UVd","resources":"NN+gjI","world/floorgen":"4WaFsS"}],"main":[function(require,module,exports){
module.exports=require('mBOMH+');
},{}],"mode/game":[function(require,module,exports){
module.exports=require('fSCZ8s');
},{}],"fSCZ8s":[function(require,module,exports){
var GameMode, Mode, Pathfinder, config, floorgen, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

config = require('config');

resources = require('resources');

floorgen = require('world/floorgen');

Pathfinder = require('world/pathfinder');

GameMode = (function(_super) {
  __extends(GameMode, _super);

  function GameMode() {
    GameMode.__super__.constructor.call(this, "Game");
  }

  GameMode.prototype.tileForGridValue = function(v) {
    switch (false) {
      case v !== floorgen.WALL:
        return 1;
      case v !== floorgen.DOOR:
        return 2;
      case !(v >= floorgen.FIRST_ROOM_ID):
        return 0;
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
    return this.gfx = {};
  };

  GameMode.prototype.gfxRenderFloor = function() {
    var floor, i, j, v, _i, _j, _ref, _ref1;
    floor = cc.game.currentFloor();
    this.gfx.floorLayer = new cc.Layer();
    this.gfx.floorLayer.setAnchorPoint(cc.p(0, 0));
    this.gfx.floorBatchNode = resources.tilesheets.tiles0.createBatchNode((floor.width * floor.height) / 2);
    this.gfx.floorLayer.addChild(this.gfx.floorBatchNode, -1);
    for (j = _i = 0, _ref = floor.height; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = floor.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        v = floor.get(i, j);
        if (v !== 0) {
          this.gfx.floorBatchNode.createSprite(this.tileForGridValue(v), i * cc.unitSize, j * cc.unitSize);
        }
      }
    }
    this.gfx.floorLayer.setScale(config.scale.min);
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
    return this.gfxPlaceMap(center.x * cc.unitSize, center.y * cc.unitSize, cc.width / 2, cc.height / 2);
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
    this.gfx.player = {};
    this.gfx.player.sprite = cc.game.state.player.createSprite();
    return this.gfx.floorLayer.addChild(this.gfx.player.sprite, 0);
  };

  GameMode.prototype.gfxAdjustMapScale = function(delta) {
    var scale;
    scale = this.gfx.floorLayer.getScale();
    scale += delta;
    if (scale > config.scale.max) {
      scale = config.scale.max;
    }
    if (scale < config.scale.min) {
      scale = config.scale.min;
    }
    return this.gfx.floorLayer.setScale(scale);
  };

  GameMode.prototype.gfxRenderPath = function(path) {
    var p, sprite, _i, _len, _results;
    if (this.gfx.pathBatchNode != null) {
      this.gfx.floorLayer.removeChild(this.gfx.pathBatchNode);
    }
    if (path.length === 0) {
      return;
    }
    this.gfx.pathBatchNode = resources.tilesheets.tiles0.createBatchNode(path.length);
    this.gfx.floorLayer.addChild(this.gfx.pathBatchNode);
    _results = [];
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      p = path[_i];
      sprite = this.gfx.pathBatchNode.createSprite(17, p.x * cc.unitSize, p.y * cc.unitSize);
      _results.push(sprite.setOpacity(128));
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
    this.gfxAdjustMapScale(delta / config.scale.speed);
    return this.gfxPlaceMap(pos.x, pos.y, x, y);
  };

  GameMode.prototype.onActivate = function() {
    cc.game.newGame();
    this.gfxClear();
    this.gfxRenderFloor();
    this.gfxRenderPlayer();
    return cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(this, this.update, 1 / 60.0, cc.REPEAT_FOREVER, 0, false);
  };

  GameMode.prototype.onClick = function(x, y) {
    var gridX, gridY, pos;
    pos = this.gfxScreenToMapCoords(x, y);
    gridX = Math.floor(pos.x / cc.unitSize);
    gridY = Math.floor(pos.y / cc.unitSize);
    if (!cc.game.state.running) {
      cc.game.state.player.act(gridX, gridY);
      cc.game.state.running = true;
      return cc.log("running");
    }
  };

  GameMode.prototype.update = function(dt) {
    var minimumCD;
    cc.game.state.player.updateSprite(this.gfx.player.sprite);
    if (cc.game.turnFrames > 0) {
      return cc.game.turnFrames--;
    } else {
      if (cc.game.state.running) {
        minimumCD = 1000;
        if (minimumCD > cc.game.state.player.cd) {
          minimumCD = cc.game.state.player.cd;
        }
        cc.game.state.player.tick(minimumCD);
        if (cc.game.state.player.cd === 0) {
          cc.game.state.running = false;
          return cc.log("not running");
        }
      }
    }
  };

  return GameMode;

})(Mode);

module.exports = GameMode;


},{"base/mode":"mhMvP9","config":"tWG/YV","resources":"NN+gjI","world/floorgen":"4WaFsS","world/pathfinder":"2ZcY+C"}],"GT1UVd":[function(require,module,exports){
var IntroMode, Mode, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

resources = require('resources');

IntroMode = (function(_super) {
  __extends(IntroMode, _super);

  function IntroMode() {
    IntroMode.__super__.constructor.call(this, "Intro");
    this.sprite = cc.Sprite.create(resources.images.splashscreen);
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
},{}],"NN+gjI":[function(require,module,exports){
var Tilesheet, images, k, tilesheets, v;

Tilesheet = require("gfx/tilesheet");

images = {
  splashscreen: 'res/splashscreen.png',
  tiles0: 'res/tiles0.png',
  player: 'res/player.png'
};

tilesheets = {
  tiles0: new Tilesheet(images.tiles0, 512, 512, 32, 32, 1),
  player: new Tilesheet(images.player, 512, 256, 24, 28, 0)
};

module.exports = {
  images: images,
  tilesheets: tilesheets,
  cocosPreloadList: (function() {
    var _results;
    _results = [];
    for (k in images) {
      v = images[k];
      _results.push({
        src: v
      });
    }
    return _results;
  })()
};


},{"gfx/tilesheet":"2l7Ub8"}],"resources":[function(require,module,exports){
module.exports=require('NN+gjI');
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
},{}],"4WaFsS":[function(require,module,exports){
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
module.exports=require('4WaFsS');
},{}],"2ZcY+C":[function(require,module,exports){
var BinaryHeap, Dijkstra, FakeHeap, Pathfinder, floorgen;

floorgen = require('world/floorgen');

BinaryHeap = (function() {
  function BinaryHeap() {}

  return BinaryHeap;

})();

FakeHeap = (function() {
  function FakeHeap() {
    this.list = [];
  }

  FakeHeap.prototype.sortList = function() {
    return this.list.sort(function(a, b) {
      return a.distance - b.distance;
    });
  };

  FakeHeap.prototype.push = function(n) {
    this.list.push(n);
    return this.sortList();
  };

  FakeHeap.prototype.size = function() {
    return this.list.length;
  };

  FakeHeap.prototype.pop = function() {
    return this.list.shift();
  };

  FakeHeap.prototype.rescore = function(n) {
    return this.sortList();
  };

  return FakeHeap;

})();

Dijkstra = (function() {
  function Dijkstra(floor) {
    var node, x, y, _i, _j, _ref, _ref1;
    this.floor = floor;
    for (x = _i = 0, _ref = this.floor.width; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      for (y = _j = 0, _ref1 = this.floor.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
        node = this.floor.grid[x][y];
        node.distance = 99999;
        node.visited = false;
        node.heaped = false;
        node.parent = null;
      }
    }
  }

  Dijkstra.prototype.createHeap = function() {
    return new FakeHeap(function(node) {
      return node.distance;
    });
  };

  Dijkstra.prototype.search = function(start, end) {
    var curr, currentNode, grid, heap, heuristic, isDiagonal, neighbor, neighborDistanceViaThisNode, neighbors, ret, _i, _len;
    grid = this.floor.grid;
    heuristic = this.manhattan;
    start.distance = 0;
    heap = this.createHeap();
    heap.push(start);
    start.heaped = true;
    while (heap.size() > 0) {
      currentNode = heap.pop();
      currentNode.visited = true;
      if (currentNode === end) {
        ret = [];
        curr = end;
        while (curr.parent) {
          ret.push({
            x: curr.x,
            y: curr.y
          });
          curr = curr.parent;
        }
        return ret.reverse();
      }
      neighbors = this.neighbors(grid, currentNode);
      for (_i = 0, _len = neighbors.length; _i < _len; _i++) {
        neighbor = neighbors[_i];
        if (neighbor.visited || (neighbor.type === floorgen.WALL)) {
          continue;
        }
        neighborDistanceViaThisNode = currentNode.distance + 1;
        isDiagonal = (currentNode.x !== neighbor.x) && (currentNode.y !== neighbor.y);
        if (isDiagonal) {
          neighborDistanceViaThisNode += 0.1;
        }
        if ((neighborDistanceViaThisNode < neighbor.distance) && !neighbor.visited) {
          neighbor.distance = neighborDistanceViaThisNode;
          neighbor.parent = currentNode;
          if (neighbor.heaped) {
            heap.rescore(neighbor);
          } else {
            heap.push(neighbor);
            neighbor.heaped = true;
          }
        }
      }
    }
    return [];
  };

  Dijkstra.prototype.neighbors = function(grid, node) {
    var ret, x, y;
    ret = [];
    x = node.x;
    y = node.y;
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
    return ret;
  };

  return Dijkstra;

})();

Pathfinder = (function() {
  function Pathfinder(floor, flags) {
    this.floor = floor;
    this.flags = flags;
  }

  Pathfinder.prototype.calc = function(startX, startY, destX, destY) {
    var dijkstra;
    dijkstra = new Dijkstra(this.floor);
    return dijkstra.search(this.floor.grid[startX][startY], this.floor.grid[destX][destY]);
  };

  return Pathfinder;

})();

module.exports = Pathfinder;


},{"world/floorgen":"4WaFsS"}],"world/pathfinder":[function(require,module,exports){
module.exports=require('2ZcY+C');
},{}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUtBLElBQUEsdURBQUE7O0FBQUEsQ0FBQSxDQUFBLENBQXVCLGlCQUF2Qjs7QUFFQSxDQUZBLENBRWUsQ0FBRixFQUFRLENBQVIsSUFBYjtDQUE2QixDQUMzQixDQUFNLENBQU4sS0FBUTtDQUNOLEVBRE0sQ0FBRDtDQUNMLEdBQUEsRUFBQTtDQUFBLEdBQ0EsV0FBQTtDQURBLEdBRUEs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Q0EsRUFBeUIsQ0FBekI7Q0FDRSxFQUFHLENBQUgsRUFBQTtNQWxDRjtDQW9DQSxFQUFBLFFBQU87Q0FuR1QsRUE4RFc7O0NBOURYOztDQTNCRjs7QUFnSU0sQ0FoSU47Q0FpSWUsQ0FBQSxDQUFBLEVBQUEsZUFBRTtDQUFnQixFQUFoQixDQUFELENBQWlCO0NBQUEsRUFBUixDQUFELENBQVM7Q0FBL0IsRUFBYTs7Q0FBYixDQUVlLENBQVQsQ0FBTixDQUFNLENBQUEsR0FBQztDQUNMLE9BQUE7Q0FBQSxFQUFlLENBQWYsQ0FBZSxHQUFmO0NBQ0EsQ0FBb0QsRUFBNUIsQ0FBSyxDQUF0QixFQUFRLEdBQVI7Q0FKVCxFQUVNOztDQUZOOztDQWpJRjs7QUF1SUEsQ0F2SUEsRUF1SWlCLEdBQVgsQ0FBTixHQXZJQSIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCJ2YXIgZ2xvYmFsPXR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fTsndXNlIHN0cmljdCc7XHJcblxyXG52YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBkaWdpdHMgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcbnZhciBwb29sID0gW107Ly8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxyXG52YXIgR0xPQkFMID0gdHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnZhciBzdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyksXHJcbiAgICBzaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBkaWdpdHMpLFxyXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxyXG4gICAgbWFzayA9IHdpZHRoIC0gMTtcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcblxyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VlZCwgb3B0aW9ucykge1xyXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZ2xvYmFsID09PSB0cnVlKSB7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IGZhbHNlO1xyXG4gICAgTWF0aC5yYW5kb20gPSBtb2R1bGUuZXhwb3J0cyhzZWVkLCBvcHRpb25zKTtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gdHJ1ZTtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbTtcclxuICB9XHJcbiAgdmFyIHVzZV9lbnRyb3B5ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5lbnRyb3B5KSB8fCBmYWxzZTtcclxuICB2YXIga2V5ID0gW107XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcclxuICAgIHVzZV9lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XHJcbiAgICAwIGluIGFyZ3VtZW50cyA/IHNlZWQgOiBhdXRvc2VlZCgpLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxyXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIHJldHVybiBmdW5jdGlvbigpIHsgICAgICAgICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnJlc2V0R2xvYmFsID0gZnVuY3Rpb24gKCkge1xyXG4gIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxyXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XHJcbiAgICBzW2ldID0gaSsrO1xyXG4gIH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcclxuICAgIHNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxyXG4gICAgdmFyIHQsIHIgPSAwLFxyXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XHJcbiAgICB3aGlsZSAoY291bnQtLSkge1xyXG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIH0pKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XHJcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iailbMF0sIHByb3A7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnbycpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3MnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XHJcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcclxuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XHJcbiAgICBrZXlbbWFzayAmIGpdID1cclxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcclxuICB9XHJcbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGF1dG9zZWVkKClcclxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGlmIGF2YWlsYWJsZS5cclxuLy9cclxuLyoqIEBwYXJhbSB7VWludDhBcnJheT19IHNlZWQgKi9cclxuZnVuY3Rpb24gYXV0b3NlZWQoc2VlZCkge1xyXG4gIHRyeSB7XHJcbiAgICBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhzZWVkID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpKTtcclxuICAgIHJldHVybiB0b3N0cmluZyhzZWVkKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgR0xPQkFMLCBHTE9CQUwubmF2aWdhdG9yICYmIEdMT0JBTC5uYXZpZ2F0b3IucGx1Z2lucyxcclxuICAgICAgICAgICAgR0xPQkFMLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gdG9zdHJpbmcoKVxyXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcclxuLy9cclxuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xyXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xyXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xyXG4vLyBub3Qgd2FudCB0byBpbnRlZmVyZSB3aXRoIGRldGVybWluc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxyXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgTWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxyXG4vLyBpbml0aWFsaXphdGlvbi5cclxuLy9cclxubWl4a2V5KE1hdGgucmFuZG9tKCksIHBvb2wpO1xyXG4iLCIjIGhvdyBtYW55IHBpeGVscyBjYW4geW91IGRyYWcgYmVmb3JlIGl0IGlzIGFjdHVhbGx5IGNvbnNpZGVyZWQgYSBkcmFnXHJcbkVOR0FHRV9EUkFHX0RJU1RBTkNFID0gMzBcclxuXHJcbklucHV0TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG4gICAgQHNldE1vdXNlRW5hYmxlZCh0cnVlKVxyXG4gICAgQHRyYWNrZWRUb3VjaGVzID0gW11cclxuXHJcbiAgY2FsY0Rpc3RhbmNlOiAoeDEsIHkxLCB4MiwgeTIpIC0+XHJcbiAgICBkeCA9IHgyIC0geDFcclxuICAgIGR5ID0geTIgLSB5MVxyXG4gICAgcmV0dXJuIE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG5cclxuICBzZXREcmFnUG9pbnQ6IC0+XHJcbiAgICBAZHJhZ1ggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgQGRyYWdZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgY2FsY1BpbmNoQW5jaG9yOiAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIEBwaW5jaFggPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueCArIEB0cmFja2VkVG91Y2hlc1sxXS54KSAvIDIpXHJcbiAgICAgIEBwaW5jaFkgPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueSArIEB0cmFja2VkVG91Y2hlc1sxXS55KSAvIDIpXHJcbiAgICAgICMgY2MubG9nIFwicGluY2ggYW5jaG9yIHNldCBhdCAje0BwaW5jaFh9LCAje0BwaW5jaFl9XCJcclxuXHJcbiAgYWRkVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGZvciB0IGluIEB0cmFja2VkVG91Y2hlc1xyXG4gICAgICBpZiB0LmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMucHVzaCB7XHJcbiAgICAgIGlkOiBpZFxyXG4gICAgICB4OiB4XHJcbiAgICAgIHk6IHlcclxuICAgIH1cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMlxyXG4gICAgICAjIFdlIGp1c3QgYWRkZWQgYSBzZWNvbmQgdG91Y2ggc3BvdC4gQ2FsY3VsYXRlIHRoZSBhbmNob3IgZm9yIHBpbmNoaW5nIG5vd1xyXG4gICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICNjYy5sb2cgXCJhZGRpbmcgdG91Y2ggI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHJlbW92ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgICAgaWYgaW5kZXggPCAyXHJcbiAgICAgICAgIyBXZSBqdXN0IGZvcmdvdCBvbmUgb2Ygb3VyIHBpbmNoIHRvdWNoZXMuIFBpY2sgYSBuZXcgYW5jaG9yIHNwb3QuXHJcbiAgICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAgICNjYy5sb2cgXCJmb3JnZXR0aW5nIGlkICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICB1cGRhdGVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS54ID0geFxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnkgPSB5XHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQGRyYWdnaW5nID0gZmFsc2VcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEBhZGRUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+IDFcclxuICAgICAgIyBUaGV5J3JlIHBpbmNoaW5nLCBkb24ndCBldmVuIGJvdGhlciB0byBlbWl0IGEgY2xpY2tcclxuICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgcHJldkRpc3RhbmNlID0gMFxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIHByZXZEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgcHJldlggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgICBwcmV2WSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHVwZGF0ZVRvdWNoKHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55KVxyXG5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAjIHNpbmdsZSB0b3VjaCwgY29uc2lkZXIgZHJhZ2dpbmdcclxuICAgICAgZHJhZ0Rpc3RhbmNlID0gQGNhbGNEaXN0YW5jZSBAZHJhZ1gsIEBkcmFnWSwgQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55XHJcbiAgICAgIGlmIEBkcmFnZ2luZyBvciAoZHJhZ0Rpc3RhbmNlID4gRU5HQUdFX0RSQUdfRElTVEFOQ0UpXHJcbiAgICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG4gICAgICAgIGlmIGRyYWdEaXN0YW5jZSA+IDAuNVxyXG4gICAgICAgICAgZHggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueCAtIEBkcmFnWFxyXG4gICAgICAgICAgZHkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueSAtIEBkcmFnWVxyXG4gICAgICAgICAgI2NjLmxvZyBcInNpbmdsZSBkcmFnOiAje2R4fSwgI3tkeX1cIlxyXG4gICAgICAgICAgQG1vZGUub25EcmFnKGR4LCBkeSlcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuXHJcbiAgICBlbHNlIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICAjIGF0IGxlYXN0IHR3byBmaW5nZXJzIHByZXNlbnQsIGNoZWNrIGZvciBwaW5jaC96b29tXHJcbiAgICAgIGN1cnJEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICAgIGRlbHRhRGlzdGFuY2UgPSBjdXJyRGlzdGFuY2UgLSBwcmV2RGlzdGFuY2VcclxuICAgICAgaWYgZGVsdGFEaXN0YW5jZSAhPSAwXHJcbiAgICAgICAgI2NjLmxvZyBcImRpc3RhbmNlIGRyYWdnZWQgYXBhcnQ6ICN7ZGVsdGFEaXN0YW5jZX0gW2FuY2hvcjogI3tAcGluY2hYfSwgI3tAcGluY2hZfV1cIlxyXG4gICAgICAgIEBtb2RlLm9uWm9vbShAcGluY2hYLCBAcGluY2hZLCBkZWx0YURpc3RhbmNlKVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxIGFuZCBub3QgQGRyYWdnaW5nXHJcbiAgICAgIHBvcyA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKVxyXG4gICAgICAjY2MubG9nIFwiY2xpY2sgYXQgI3twb3MueH0sICN7cG9zLnl9XCJcclxuICAgICAgQG1vZGUub25DbGljayhwb3MueCwgcG9zLnkpXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAcmVtb3ZlVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuXHJcbiAgb25TY3JvbGxXaGVlbDogKGV2KSAtPlxyXG4gICAgcG9zID0gZXYuZ2V0TG9jYXRpb24oKVxyXG4gICAgQG1vZGUub25ab29tKHBvcy54LCBwb3MueSwgZXYuZ2V0V2hlZWxEZWx0YSgpKVxyXG59XHJcblxyXG5HZnhMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbn1cclxuXHJcbk1vZGVTY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcblxyXG4gICAgQGlucHV0ID0gbmV3IElucHV0TGF5ZXIoKVxyXG4gICAgQGlucHV0LmluaXQoQG1vZGUpXHJcbiAgICBAYWRkQ2hpbGQoQGlucHV0KVxyXG5cclxuICAgIEBnZnggPSBuZXcgR2Z4TGF5ZXIoKVxyXG4gICAgQGdmeC5pbml0KClcclxuICAgIEBhZGRDaGlsZChAZ2Z4KVxyXG5cclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAbW9kZS5vbkFjdGl2YXRlKClcclxufVxyXG5cclxuY2xhc3MgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XHJcbiAgICBAc2NlbmUgPSBuZXcgTW9kZVNjZW5lKClcclxuICAgIEBzY2VuZS5pbml0KHRoaXMpXHJcbiAgICBAc2NlbmUucmV0YWluKClcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgaWYgY2Muc2F3T25lU2NlbmU/XHJcbiAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucG9wU2NlbmUoKVxyXG4gICAgZWxzZVxyXG4gICAgICBjYy5zYXdPbmVTY2VuZSA9IHRydWVcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucHVzaFNjZW5lKEBzY2VuZSlcclxuXHJcbiAgYWRkOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5hZGRDaGlsZChvYmopXHJcblxyXG4gIHJlbW92ZTogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZngucmVtb3ZlQ2hpbGQob2JqKVxyXG5cclxuICAjIHRvIGJlIG92ZXJyaWRkZW4gYnkgZGVyaXZlZCBNb2Rlc1xyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlXHJcbiIsImlmIGRvY3VtZW50P1xyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbndlYidcclxuZWxzZVxyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xyXG4iLCJyZXF1aXJlICdqc2IuanMnXHJcbnJlcXVpcmUgJ21haW4nXHJcblxyXG5udWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKVxyXG5udWxsU2NlbmUuaW5pdCgpXHJcbmNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucnVuV2l0aFNjZW5lKG51bGxTY2VuZSlcclxuY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxuXHJcbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogY29uZmlnXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIHJlcXVpcmUgJ21haW4nXHJcbiAgICAgICAgbnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKCk7XHJcbiAgICAgICAgbnVsbFNjZW5lLmluaXQoKVxyXG4gICAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucmVwbGFjZVNjZW5lKG51bGxTY2VuZSlcclxuIyAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuICAgICAgdGhpcylcclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbm15QXBwID0gbmV3IGNvY29zMmRBcHAoKVxyXG4iLCJjbGFzcyBCcmFpblxyXG4gIGNvbnN0cnVjdG9yOiAoQHRpbGVzLCBAYW5pbUZyYW1lKSAtPlxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gdHJ1ZVxyXG4gICAgQGNkID0gMFxyXG4gICAgQGludGVycEZyYW1lcyA9IFtdXHJcbiAgICBAcGF0aCA9IFtdXHJcblxyXG4gIG1vdmU6IChneCwgZ3ksIGZyYW1lcykgLT5cclxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxyXG4gICAgZHggPSAoQHggLSBneCkgKiBjYy51bml0U2l6ZVxyXG4gICAgZHkgPSAoQHkgLSBneSkgKiBjYy51bml0U2l6ZVxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gKGR4IDwgMClcclxuICAgIGkgPSBmcmFtZXMubGVuZ3RoXHJcbiAgICBmb3IgZiBpbiBmcmFtZXNcclxuICAgICAgYW5pbUZyYW1lID0ge1xyXG4gICAgICAgIHg6IGR4ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICB5OiBkeSAqIGkgLyBmcmFtZXMubGVuZ3RoXHJcbiAgICAgICAgYW5pbUZyYW1lOiBmXHJcbiAgICAgIH1cclxuICAgICAgQGludGVycEZyYW1lcy5wdXNoIGFuaW1GcmFtZVxyXG4gICAgICBpLS1cclxuXHJcbiAgICBjYy5nYW1lLnNldFR1cm5GcmFtZXMoZnJhbWVzLmxlbmd0aClcclxuXHJcbiAgICAjIEltbWVkaWF0ZWx5IG1vdmUsIG9ubHkgcHJldGVuZCB0byBhbmltYXRlIHRoZXJlIG92ZXIgdGhlIG5leHQgZnJhbWVzLmxlbmd0aCBmcmFtZXNcclxuICAgIEB4ID0gZ3hcclxuICAgIEB5ID0gZ3lcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgY3JlYXRlU3ByaXRlOiAtPlxyXG4gICAgcyA9IGNjLlNwcml0ZS5jcmVhdGUgQHRpbGVzLnJlc291cmNlXHJcbiAgICBAdXBkYXRlU3ByaXRlKHMpXHJcbiAgICByZXR1cm4gc1xyXG5cclxuICB1cGRhdGVTcHJpdGU6IChzcHJpdGUpIC0+XHJcbiAgICB4ID0gQHggKiBjYy51bml0U2l6ZVxyXG4gICAgeSA9IEB5ICogY2MudW5pdFNpemVcclxuICAgIGFuaW1GcmFtZSA9IEBhbmltRnJhbWVcclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoXHJcbiAgICAgIGZyYW1lID0gQGludGVycEZyYW1lcy5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgeCArPSBmcmFtZS54XHJcbiAgICAgIHkgKz0gZnJhbWUueVxyXG4gICAgICBhbmltRnJhbWUgPSBmcmFtZS5hbmltRnJhbWVcclxuICAgICMgZWxzZVxyXG4gICAgIyAgIGFuaW1GcmFtZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXHJcbiAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QoQHRpbGVzLnJlY3QoYW5pbUZyYW1lKSlcclxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKVxyXG4gICAgeGFuY2hvciA9IDEuMFxyXG4gICAgeHNjYWxlID0gLTEuMFxyXG4gICAgaWYgQGZhY2luZ1JpZ2h0XHJcbiAgICAgIHhhbmNob3IgPSAwXHJcbiAgICAgIHhzY2FsZSA9IDEuMFxyXG4gICAgc3ByaXRlLnNldFNjYWxlWCh4c2NhbGUpXHJcbiAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCh4YW5jaG9yLCAwKSlcclxuXHJcbiAgdGFrZVN0ZXA6IC0+XHJcbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIGlmIEBwYXRoLmxlbmd0aCA+IDBcclxuICAgICAgICBzdGVwID0gQHBhdGguc3BsaWNlKDAsIDEpWzBdXHJcbiAgICAgICAgIyBjYy5sb2cgXCJ0YWtpbmcgc3RlcCB0byAje3N0ZXAueH0sICN7c3RlcC55fVwiXHJcbiAgICAgICAgQG1vdmUoc3RlcC54LCBzdGVwLnksIFsyLDMsNF0pXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB0aWNrOiAoZWxhcHNlZFR1cm5zKSAtPlxyXG4gICAgaWYgQGNkID4gMFxyXG4gICAgICBAY2QgLT0gZWxhcHNlZFR1cm5zIGlmIEBjZCA+IDBcclxuICAgICAgQGNkID0gMCBpZiBAY2QgPCAwXHJcbiAgICBpZiBAY2QgPT0gMFxyXG4gICAgICBAdGhpbmsoKVxyXG5cclxuICB0aGluazogLT5cclxuICAgIGNjLmxvZyBcInRoaW5rIG5vdCBpbXBsZW1lbnRlZCFcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmFpblxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkJyYWluID0gcmVxdWlyZSAnYnJhaW4vYnJhaW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5UaWxlc2hlZXQgPSByZXF1aXJlICdnZngvdGlsZXNoZWV0J1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAYW5pbUZyYW1lID0gMFxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIHRoaXNba10gPSB2XHJcbiAgICBzdXBlciByZXNvdXJjZXMudGlsZXNoZWV0cy5wbGF5ZXIsIEBhbmltRnJhbWVcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgdGhpbms6IC0+XHJcbiAgICBpZiBAdGFrZVN0ZXAoKVxyXG4gICAgICBAY2QgPSA1MFxyXG5cclxuICBhY3Q6IChneCwgZ3kpIC0+XHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoQHgsIEB5LCBneCwgZ3kpXHJcbiAgICBAd2Fsa1BhdGgocGF0aClcclxuICAgIGNjLmxvZyBcInBhdGggaXMgI3twYXRoLmxlbmd0aH0gbG9uZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgIyBjcmFwIG5vYm9keSBzaG91bGQgZXZlciBoYXZlIHRvIGNoYW5nZVxyXG4gIENPQ09TMkRfREVCVUc6MiAjIDAgdG8gdHVybiBkZWJ1ZyBvZmYsIDEgZm9yIGJhc2ljIGRlYnVnLCBhbmQgMiBmb3IgZnVsbCBkZWJ1Z1xyXG4gIGJveDJkOmZhbHNlXHJcbiAgY2hpcG11bms6ZmFsc2VcclxuICBzaG93RlBTOnRydWVcclxuICBmcmFtZVJhdGU6NjBcclxuICBsb2FkRXh0ZW5zaW9uOmZhbHNlXHJcbiAgcmVuZGVyTW9kZTowXHJcbiAgdGFnOidnYW1lQ2FudmFzJ1xyXG4gIGFwcEZpbGVzOiBbXHJcbiAgICAnYnVuZGxlLmpzJ1xyXG4gIF1cclxuXHJcbiAgIyBUaGUgc2l6ZSBvZiBvbmUgdW5pdCB3b3J0aCBvZiB0aWxlLiBQcmV0dHkgbXVjaCBjb250cm9scyBhbGwgcmVuZGVyaW5nLCBjbGljayBoYW5kbGluZywgZXRjLlxyXG4gIHVuaXRTaXplOiAzMlxyXG5cclxuICAjIHpvb20gaW4vb3V0IGJvdW5kcy4gQSBzY2FsZSBvZiAxLjAgaXMgMToxIHBpeGVsIHRvIFwiZGVzaWduIGRpbWVuc2lvbnNcIiAoY3VycmVudGx5IDEyODB4NzIwIHZpZXcpLlxyXG4gICMgU2NhbGUgc3BlZWQgaXMgdGhlIGRlbm9taW5hdG9yIGZvciBhZGp1c3RpbmcgdGhlIGN1cnJlbnQgc2NhbGUuIFRoZSBtYXRoOlxyXG4gICMgc2NhbGUgKz0gem9vbURlbHRhIC8gc2NhbGUuc3BlZWRcclxuICAjIHpvb21EZWx0YSBpcyB0aGUgZGlzdGFuY2UgaW4gcGl4ZWxzIGFkZGVkL3JlbW92ZWQgYmV0d2VlbiB5b3VyIGZpbmdlcnMgb24geW91ciBwaG9uZSBzY3JlZW4uXHJcbiAgIyB6b29tRGVsdGEgaXMgYWx3YXlzIDEyMCBvciAtMTIwIGZvciBtb3VzZXdoZWVscywgdGhlcmVmb3JlIHNldHRpbmcgc2NhbGUuc3BlZWRcclxuICAjIHRvIDEyMCB3b3VsZCBjYXVzZSB0aGUgc2NhbGUgdG8gY2hhbmdlIGJ5IDEuMCBmb3IgZXZlcnkgXCJub3RjaFwiIG9uIHRoZSB3aGVlbC5cclxuICBzY2FsZTpcclxuICAgIHNwZWVkOiA0MDBcclxuICAgIG1pbjogMC43NVxyXG4gICAgbWF4OiAzLjBcclxuIiwiY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5MYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIExheWVyOiBMYXllclxyXG4gIFNjZW5lOiBTY2VuZVxyXG4iLCJcclxuIyBUaGlzIGlzIGZ1Y2tpbmcgdHJhZ2ljLlxyXG5QSVhFTF9GVURHRV9GQUNUT1IgPSAwICMgaG93IG1hbnkgcGl4ZWxzIHRvIHJlbW92ZSBmcm9tIHRoZSBlZGdlIHRvIHJlbW92ZSBibGVlZFxyXG5TQ0FMRV9GVURHRV9GQUNUT1IgPSAwICMgYWRkaXRpb25hbCBzcHJpdGUgc2NhbGUgdG8gZW5zdXJlIHByb3BlciB0aWxpbmdcclxuXHJcblRpbGVzaGVldEJhdGNoTm9kZSA9IGNjLlNwcml0ZUJhdGNoTm9kZS5leHRlbmQge1xyXG4gIGluaXQ6IChmaWxlSW1hZ2UsIGNhcGFjaXR5KSAtPlxyXG4gICAgQF9zdXBlcihmaWxlSW1hZ2UsIGNhcGFjaXR5KVxyXG5cclxuICBjcmVhdGVTcHJpdGU6ICh0aWxlSW5kZXgsIHgsIHkpIC0+XHJcbiAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlV2l0aFRleHR1cmUoQGdldFRleHR1cmUoKSwgQHRpbGVzaGVldC5yZWN0KHRpbGVJbmRleCkpXHJcbiAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbih4LCB5KVxyXG4gICAgc3ByaXRlLnNldFNjYWxlKEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS54LCBAdGlsZXNoZWV0LmFkanVzdGVkU2NhbGUueSlcclxuICAgIEBhZGRDaGlsZCBzcHJpdGVcclxuICAgIHJldHVybiBzcHJpdGVcclxufVxyXG5cclxuY2xhc3MgVGlsZXNoZWV0XHJcbiAgY29uc3RydWN0b3I6IChAcmVzb3VyY2UsIEByZXNvdXJjZVdpZHRoLCBAcmVzb3VyY2VIZWlnaHQsIEB0aWxlV2lkdGgsIEB0aWxlSGVpZ2h0LCBAdGlsZVBhZGRpbmcpIC0+XHJcbiAgICBAcGFkZGVkVGlsZVdpZHRoID0gQHRpbGVXaWR0aCArIChAdGlsZVBhZGRpbmcgKiAyKVxyXG4gICAgQHBhZGRlZFRpbGVIZWlnaHQgPSBAdGlsZUhlaWdodCArIChAdGlsZVBhZGRpbmcgKiAyKVxyXG4gICAgQHN0cmlkZSA9IE1hdGguZmxvb3IoQHJlc291cmNlV2lkdGggLyAoQHRpbGVXaWR0aCArIChAdGlsZVBhZGRpbmcgKiAyKSkpXHJcbiAgICBAYWRqdXN0ZWRTY2FsZSA9XHJcbiAgICAgIHg6IDEgKyBTQ0FMRV9GVURHRV9GQUNUT1IgKyAoUElYRUxfRlVER0VfRkFDVE9SIC8gQHRpbGVXaWR0aClcclxuICAgICAgeTogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAdGlsZUhlaWdodClcclxuXHJcbiAgcmVjdDogKHYpIC0+XHJcbiAgICB5ID0gTWF0aC5mbG9vcih2IC8gQHN0cmlkZSlcclxuICAgIHggPSB2ICUgQHN0cmlkZVxyXG4gICAgcmV0dXJuIGNjLnJlY3QoXHJcbiAgICAgIEB0aWxlUGFkZGluZyArICh4ICogQHBhZGRlZFRpbGVXaWR0aCksXHJcbiAgICAgIEB0aWxlUGFkZGluZyArICh5ICogQHBhZGRlZFRpbGVIZWlnaHQpLFxyXG4gICAgICBAdGlsZVdpZHRoIC0gUElYRUxfRlVER0VfRkFDVE9SLFxyXG4gICAgICBAdGlsZUhlaWdodCAtIFBJWEVMX0ZVREdFX0ZBQ1RPUilcclxuXHJcbiAgY3JlYXRlQmF0Y2hOb2RlOiAoY2FwYWNpdHkpIC0+XHJcbiAgICBiYXRjaE5vZGUgPSBuZXcgVGlsZXNoZWV0QmF0Y2hOb2RlKClcclxuICAgIGJhdGNoTm9kZS50aWxlc2hlZXQgPSB0aGlzXHJcbiAgICBiYXRjaE5vZGUuaW5pdChAcmVzb3VyY2UsIGNhcGFjaXR5KVxyXG4gICAgcmV0dXJuIGJhdGNoTm9kZVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaWxlc2hlZXRcclxuIiwiY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QbGF5ZXIgPSByZXF1aXJlICdicmFpbi9wbGF5ZXInXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAdHVybkZyYW1lcyA9IDBcclxuICAgIEBtb2RlcyA9XHJcbiAgICAgIGludHJvOiBuZXcgSW50cm9Nb2RlKClcclxuICAgICAgZ2FtZTogbmV3IEdhbWVNb2RlKClcclxuXHJcbiAgbmV3Rmxvb3I6IC0+XHJcbiAgICBmbG9vcmdlbi5nZW5lcmF0ZSgpXHJcblxyXG4gIGN1cnJlbnRGbG9vcjogLT5cclxuICAgIHJldHVybiBAc3RhdGUuZmxvb3JzW0BzdGF0ZS5wbGF5ZXIuZmxvb3JdXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBjYy5sb2cgXCJuZXdHYW1lXCJcclxuICAgIEBzdGF0ZSA9IHtcclxuICAgICAgcnVubmluZzogZmFsc2VcclxuICAgICAgcGxheWVyOiBuZXcgUGxheWVyKHtcclxuICAgICAgICB4OiA0NFxyXG4gICAgICAgIHk6IDQ5XHJcbiAgICAgICAgZmxvb3I6IDFcclxuICAgICAgfSlcclxuICAgICAgZmxvb3JzOiBbXHJcbiAgICAgICAge31cclxuICAgICAgICBAbmV3Rmxvb3IoKVxyXG4gICAgICBdXHJcbiAgICB9XHJcblxyXG4gIHNldFR1cm5GcmFtZXM6IChjb3VudCkgLT5cclxuICAgIGlmIEB0dXJuRnJhbWVzIDwgY291bnRcclxuICAgICAgQHR1cm5GcmFtZXMgPSBjb3VudFxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy51bml0U2l6ZSA9IGNvbmZpZy51bml0U2l6ZVxyXG4gIGNjLndpZHRoID0gc2l6ZS53aWR0aFxyXG4gIGNjLmhlaWdodCA9IHNpemUuaGVpZ2h0XHJcbiAgY2MuZ2FtZSA9IG5ldyBHYW1lKClcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxuY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5cclxuY2xhc3MgR2FtZU1vZGUgZXh0ZW5kcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcihcIkdhbWVcIilcclxuXHJcbiAgdGlsZUZvckdyaWRWYWx1ZTogKHYpIC0+XHJcbiAgICBzd2l0Y2hcclxuICAgICAgd2hlbiB2ID09IGZsb29yZ2VuLldBTEwgdGhlbiAxXHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gMlxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDBcclxuICAgICAgZWxzZSAwXHJcblxyXG4gIGdmeENsZWFyOiAtPlxyXG4gICAgaWYgQGdmeD9cclxuICAgICAgaWYgQGdmeC5mbG9vckxheWVyP1xyXG4gICAgICAgIEByZW1vdmUgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4ID0ge31cclxuXHJcbiAgZ2Z4UmVuZGVyRmxvb3I6IC0+XHJcbiAgICBmbG9vciA9IGNjLmdhbWUuY3VycmVudEZsb29yKClcclxuXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIgPSBuZXcgY2MuTGF5ZXIoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAZ2Z4LmZsb29yQmF0Y2hOb2RlID0gcmVzb3VyY2VzLnRpbGVzaGVldHMudGlsZXMwLmNyZWF0ZUJhdGNoTm9kZSgoZmxvb3Iud2lkdGggKiBmbG9vci5oZWlnaHQpIC8gMilcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LmZsb29yQmF0Y2hOb2RlLCAtMVxyXG4gICAgZm9yIGogaW4gWzAuLi5mbG9vci5oZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uZmxvb3Iud2lkdGhdXHJcbiAgICAgICAgdiA9IGZsb29yLmdldChpLCBqKVxyXG4gICAgICAgIGlmIHYgIT0gMFxyXG4gICAgICAgICAgQGdmeC5mbG9vckJhdGNoTm9kZS5jcmVhdGVTcHJpdGUoQHRpbGVGb3JHcmlkVmFsdWUodiksIGkgKiBjYy51bml0U2l6ZSwgaiAqIGNjLnVuaXRTaXplKVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShjb25maWcuc2NhbGUubWluKVxyXG4gICAgQGFkZCBAZ2Z4LmZsb29yTGF5ZXJcclxuICAgIEBnZnhDZW50ZXJNYXAoKVxyXG5cclxuICBnZnhQbGFjZU1hcDogKG1hcFgsIG1hcFksIHNjcmVlblgsIHNjcmVlblkpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICB4ID0gc2NyZWVuWCAtIChtYXBYICogc2NhbGUpXHJcbiAgICB5ID0gc2NyZWVuWSAtIChtYXBZICogc2NhbGUpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24oeCwgeSlcclxuXHJcbiAgZ2Z4Q2VudGVyTWFwOiAtPlxyXG4gICAgY2VudGVyID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKS5iYm94LmNlbnRlcigpXHJcbiAgICBAZ2Z4UGxhY2VNYXAoY2VudGVyLnggKiBjYy51bml0U2l6ZSwgY2VudGVyLnkgKiBjYy51bml0U2l6ZSwgY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKVxyXG5cclxuICBnZnhTY3JlZW5Ub01hcENvb3JkczogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogKHggLSBwb3MueCkgLyBzY2FsZVxyXG4gICAgICB5OiAoeSAtIHBvcy55KSAvIHNjYWxlXHJcbiAgICB9XHJcblxyXG4gIGdmeFJlbmRlclBsYXllcjogLT5cclxuICAgIEBnZngucGxheWVyID0ge31cclxuICAgIEBnZngucGxheWVyLnNwcml0ZSA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNyZWF0ZVNwcml0ZSgpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5wbGF5ZXIuc3ByaXRlLCAwXHJcblxyXG4gIGdmeEFkanVzdE1hcFNjYWxlOiAoZGVsdGEpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICBzY2FsZSArPSBkZWx0YVxyXG4gICAgc2NhbGUgPSBjb25maWcuc2NhbGUubWF4IGlmIHNjYWxlID4gY29uZmlnLnNjYWxlLm1heFxyXG4gICAgc2NhbGUgPSBjb25maWcuc2NhbGUubWluIGlmIHNjYWxlIDwgY29uZmlnLnNjYWxlLm1pblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKHNjYWxlKVxyXG5cclxuICBnZnhSZW5kZXJQYXRoOiAocGF0aCkgLT5cclxuICAgIGlmIEBnZngucGF0aEJhdGNoTm9kZT9cclxuICAgICAgQGdmeC5mbG9vckxheWVyLnJlbW92ZUNoaWxkIEBnZngucGF0aEJhdGNoTm9kZVxyXG4gICAgcmV0dXJuIGlmIHBhdGgubGVuZ3RoID09IDBcclxuICAgIEBnZngucGF0aEJhdGNoTm9kZSA9IHJlc291cmNlcy50aWxlc2hlZXRzLnRpbGVzMC5jcmVhdGVCYXRjaE5vZGUocGF0aC5sZW5ndGgpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5wYXRoQmF0Y2hOb2RlXHJcbiAgICBmb3IgcCBpbiBwYXRoXHJcbiAgICAgIHNwcml0ZSA9IEBnZngucGF0aEJhdGNoTm9kZS5jcmVhdGVTcHJpdGUoMTcsIHAueCAqIGNjLnVuaXRTaXplLCBwLnkgKiBjYy51bml0U2l6ZSlcclxuICAgICAgc3ByaXRlLnNldE9wYWNpdHkoMTI4KVxyXG5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHBvcy54ICsgZHgsIHBvcy55ICsgZHkpXHJcblxyXG4gIG9uWm9vbTogKHgsIHksIGRlbHRhKSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBAZ2Z4QWRqdXN0TWFwU2NhbGUoZGVsdGEgLyBjb25maWcuc2NhbGUuc3BlZWQpXHJcbiAgICBAZ2Z4UGxhY2VNYXAocG9zLngsIHBvcy55LCB4LCB5KVxyXG5cclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gICAgY2MuZ2FtZS5uZXdHYW1lKClcclxuICAgIEBnZnhDbGVhcigpXHJcbiAgICBAZ2Z4UmVuZGVyRmxvb3IoKVxyXG4gICAgQGdmeFJlbmRlclBsYXllcigpXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFNjaGVkdWxlcigpLnNjaGVkdWxlQ2FsbGJhY2tGb3JUYXJnZXQodGhpcywgQHVwZGF0ZSwgMSAvIDYwLjAsIGNjLlJFUEVBVF9GT1JFVkVSLCAwLCBmYWxzZSlcclxuXHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIGdyaWRYID0gTWF0aC5mbG9vcihwb3MueCAvIGNjLnVuaXRTaXplKVxyXG4gICAgZ3JpZFkgPSBNYXRoLmZsb29yKHBvcy55IC8gY2MudW5pdFNpemUpXHJcblxyXG4gICAgaWYgbm90IGNjLmdhbWUuc3RhdGUucnVubmluZ1xyXG4gICAgICBjYy5nYW1lLnN0YXRlLnBsYXllci5hY3QoZ3JpZFgsIGdyaWRZKVxyXG4gICAgICBjYy5nYW1lLnN0YXRlLnJ1bm5pbmcgPSB0cnVlXHJcbiAgICAgIGNjLmxvZyBcInJ1bm5pbmdcIlxyXG5cclxuICAgICMgcGF0aGZpbmRlciA9IG5ldyBQYXRoZmluZGVyKGNjLmdhbWUuY3VycmVudEZsb29yKCksIDApXHJcbiAgICAjIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCwgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueSwgZ3JpZFgsIGdyaWRZKVxyXG4gICAgIyBAZ2Z4UmVuZGVyUGF0aChwYXRoKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnVwZGF0ZVNwcml0ZShAZ2Z4LnBsYXllci5zcHJpdGUpXHJcblxyXG4gICAgaWYgY2MuZ2FtZS50dXJuRnJhbWVzID4gMFxyXG4gICAgICBjYy5nYW1lLnR1cm5GcmFtZXMtLVxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICAgICBtaW5pbXVtQ0QgPSAxMDAwXHJcbiAgICAgICAgaWYgbWluaW11bUNEID4gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2RcclxuICAgICAgICAgIG1pbmltdW1DRCA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgIyBUT0RPOiBjaGVjayBjZCBvZiBhbGwgTlBDcyBvbiB0aGUgZmxvb3IgYWdhaW5zdCB0aGUgbWluaW11bUNEXHJcbiAgICAgICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudGljayhtaW5pbXVtQ0QpXHJcbiAgICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2QgPT0gMCAjIFdlIGp1c3QgcmFuLCB5ZXQgZGlkIG5vdGhpbmdcclxuICAgICAgICAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IGZhbHNlXHJcbiAgICAgICAgICBjYy5sb2cgXCJub3QgcnVubmluZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVNb2RlXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEludHJvTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiSW50cm9cIilcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5pbWFnZXMuc3BsYXNoc2NyZWVuXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKSlcclxuICAgIEBhZGQgQHNwcml0ZVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxyXG4gICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXHJcbiIsIlRpbGVzaGVldCA9IHJlcXVpcmUgXCJnZngvdGlsZXNoZWV0XCJcclxuXHJcbmltYWdlcyA9XHJcbiAgc3BsYXNoc2NyZWVuOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgdGlsZXMwOiAncmVzL3RpbGVzMC5wbmcnXHJcbiAgcGxheWVyOiAncmVzL3BsYXllci5wbmcnXHJcblxyXG50aWxlc2hlZXRzID1cclxuICB0aWxlczA6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnRpbGVzMCwgNTEyLCA1MTIsIDMyLCAzMiwgMSlcclxuICBwbGF5ZXI6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnBsYXllciwgNTEyLCAyNTYsIDI0LCAyOCwgMClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBpbWFnZXM6IGltYWdlc1xyXG4gIHRpbGVzaGVldHM6IHRpbGVzaGVldHNcclxuICBjb2Nvc1ByZWxvYWRMaXN0OiAoe3NyYzogdn0gZm9yIGssIHYgb2YgaW1hZ2VzKVxyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xyXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXHJcblxyXG5TSEFQRVMgPSBbXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uI1xyXG4gICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICAgICAjIyMjXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgIyMjIyMuLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG5dXHJcblxyXG5FTVBUWSA9IDBcclxuV0FMTCA9IDFcclxuRE9PUiA9IDJcclxuRklSU1RfUk9PTV9JRCA9IDVcclxuXHJcbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxyXG4gIHN3aXRjaFxyXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXHJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcclxuICAgIHdoZW4gdiA+PSBGSVJTVF9ST09NX0lEIHRoZW4gcmV0dXJuIHAuY29sb3IgMCwgMCwgNSArIE1hdGgubWluKDI0MCwgMTUgKyAodiAqIDIpKVxyXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcclxuXHJcbmNsYXNzIFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxyXG5cclxuICB3OiAtPiBAciAtIEBsXHJcbiAgaDogLT4gQGIgLSBAdFxyXG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXHJcbiAgYXNwZWN0OiAtPlxyXG4gICAgaWYgQGgoKSA+IDBcclxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIHNxdWFyZW5lc3M6IC0+XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXHJcblxyXG4gIGNlbnRlcjogLT5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcclxuICAgICAgeTogTWF0aC5mbG9vcigoQGIgKyBAdCkgLyAyKVxyXG4gICAgfVxyXG5cclxuICBjbG9uZTogLT5cclxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcclxuXHJcbiAgZXhwYW5kOiAocikgLT5cclxuICAgIGlmIEBhcmVhKClcclxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcclxuICAgICAgQHQgPSByLnQgaWYgQHQgPiByLnRcclxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcclxuICAgIGVsc2VcclxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXHJcbiAgICAgIEBsID0gci5sXHJcbiAgICAgIEB0ID0gci50XHJcbiAgICAgIEByID0gci5yXHJcbiAgICAgIEBiID0gci5iXHJcblxyXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcclxuXHJcbmNsYXNzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID0gRU1QVFlcclxuXHJcbiAgICBAZ2VuZXJhdGVTaGFwZSgpXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAc2V0KGksIDAsIFdBTEwpXHJcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIEBzZXQoMCwgaiwgV0FMTClcclxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxyXG5cclxuICByZWN0OiAoeCwgeSkgLT5cclxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0gPSB2XHJcblxyXG4gIGdldDogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgcmV0dXJuIHYgaWYgdiAhPSBFTVBUWVxyXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXHJcblxyXG4gIHBsYWNlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxyXG5cclxuICBmaXRzOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBtdiA9IG1hcC5nZXQoeCArIGksIHkgKyBqKVxyXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGRvb3JFbGlnaWJsZTogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXHJcbiAgICByb29tc1NlZW4gPSB7fVxyXG4gICAgdmFsdWVzID0gW1xyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogKyAxKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXHJcbiAgICBdXHJcbiAgICBmb3IgdiBpbiB2YWx1ZXNcclxuICAgICAgaWYgdlxyXG4gICAgICAgIGlmIHYgPT0gMVxyXG4gICAgICAgICAgd2FsbE5laWdoYm9ycysrXHJcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcclxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcclxuICAgIHJvb21zID0gT2JqZWN0LmtleXMocm9vbXNTZWVuKS5zb3J0IChhLCBiKSAtPiBhLWJcclxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxyXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXHJcbiAgICBpZiAod2FsbE5laWdoYm9ycyA9PSAyKSBhbmQgKHJvb21Db3VudCA9PSAyKSBhbmQgKEByb29taWQgaW4gcm9vbXMpXHJcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcclxuICAgICAgICByZXR1cm4gcm9vbXNcclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXHJcbiAgICAgICAgaWYgcm9vbXNbMF0gIT0gLTEgYW5kIEByb29taWQgaW4gcm9vbXNcclxuICAgICAgICAgIHJldHVybiBbaSwgal1cclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXHJcbiAgICBiYm94VGVtcC5leHBhbmQgQHJlY3QoeCwgeSlcclxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cclxuXHJcbiAgZmluZEJlc3RTcG90OiAobWFwKSAtPlxyXG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxyXG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcclxuICAgIG1pblggPSAtMVxyXG4gICAgbWluWSA9IC0xXHJcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxyXG4gICAgc2VhcmNoTCA9IG1hcC5iYm94LmwgLSBAd2lkdGhcclxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXHJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcclxuICAgIHNlYXJjaEIgPSBtYXAuYmJveC5iXHJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cclxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXHJcbiAgICAgICAgaWYgQGZpdHMobWFwLCBpLCBqKVxyXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXHJcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IEBkb29yTG9jYXRpb24gbWFwLCBpLCBqXHJcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXHJcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtaW5BcmVhID0gYXJlYVxyXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXHJcbiAgICAgICAgICAgICAgbWluWCA9IGlcclxuICAgICAgICAgICAgICBtaW5ZID0galxyXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXHJcblxyXG5jbGFzcyBTaGFwZVJvb21UZW1wbGF0ZSBleHRlbmRzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cclxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXHJcbiAgICB3ID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcclxuICAgIEB3aWR0aCA9IHdcclxuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXHJcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxyXG4gICAgaSA9IDBcclxuICAgIGogPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxyXG4gICAgICAgIHYgPSBzd2l0Y2ggY1xyXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXHJcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcclxuICAgICAgICAgIGVsc2UgMFxyXG4gICAgICAgIGlmIHZcclxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcclxuICAgICAgICBpKytcclxuICAgICAgaisrXHJcbiAgICAgIGkgPSAwXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJyb29tIGNyZWF0ZWQgI3tAcmVjdH1cIlxyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEBzZWVkKSAtPlxyXG4gICAgQHJhbmRSZXNldCgpXHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPVxyXG4gICAgICAgICAgdHlwZTogRU1QVFlcclxuICAgICAgICAgIHg6IGlcclxuICAgICAgICAgIHk6IGpcclxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxyXG4gICAgQHJvb21zID0gW11cclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XHJcblxyXG4gIGdldDogKGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgcmV0dXJuIEBncmlkW2ldW2pdLnR5cGVcclxuICAgIHJldHVybiAwXHJcblxyXG4gIGFkZFJvb206IChyb29tVGVtcGxhdGUsIHgsIHkpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxyXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcclxuICAgIHIgPSByb29tVGVtcGxhdGUucmVjdCh4LCB5KVxyXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxyXG4gICAgQGJib3guZXhwYW5kKHIpXHJcbiAgICAjIGNvbnNvbGUubG9nIFwibmV3IG1hcCBiYm94ICN7QGJib3h9XCJcclxuXHJcbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxyXG4gICAgciA9IEByYW5kKDEwMClcclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDEwIDwgciA8IDIwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNSArIEByYW5kKDEwKSwgMywgcm9vbWlkICAgICAgICAgICAgICAgICAgIyBob3Jpem9udGFsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xyXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cclxuXHJcbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxyXG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcclxuICAgIGlmIEByb29tcy5sZW5ndGggPT0gMFxyXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXHJcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIGVsc2VcclxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXHJcbiAgICAgIGlmIHggPCAwXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBnZW5lcmF0ZVJvb21zOiAoY291bnQpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxyXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxyXG5cclxuICAgICAgYWRkZWQgPSBmYWxzZVxyXG4gICAgICB3aGlsZSBub3QgYWRkZWRcclxuICAgICAgICBhZGRlZCA9IEBnZW5lcmF0ZVJvb20gcm9vbWlkXHJcblxyXG5nZW5lcmF0ZSA9IC0+XHJcbiAgbWFwID0gbmV3IE1hcCA4MCwgODAsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcblxyXG5jbGFzcyBGYWtlSGVhcFxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGxpc3QgPSBbXVxyXG5cclxuICBzb3J0TGlzdDogLT5cclxuICAgIEBsaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZVxyXG5cclxuICBwdXNoOiAobikgLT5cclxuICAgIEBsaXN0LnB1c2gobilcclxuICAgIEBzb3J0TGlzdCgpXHJcblxyXG4gIHNpemU6IC0+XHJcbiAgICByZXR1cm4gQGxpc3QubGVuZ3RoXHJcblxyXG4gIHBvcDogLT5cclxuICAgIHJldHVybiBAbGlzdC5zaGlmdCgpXHJcblxyXG4gIHJlc2NvcmU6IChuKSAtPlxyXG4gICAgQHNvcnRMaXN0KClcclxuXHJcbmNsYXNzIERpamtzdHJhXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZGlzdGFuY2UgPSA5OTk5OVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5oZWFwZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBjcmVhdGVIZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBGYWtlSGVhcCAobm9kZSkgLT5cclxuICAgICAgcmV0dXJuIG5vZGUuZGlzdGFuY2VcclxuXHJcbiAgc2VhcmNoOiAoc3RhcnQsIGVuZCkgLT5cclxuICAgIGdyaWQgPSBAZmxvb3IuZ3JpZFxyXG4gICAgaGV1cmlzdGljID0gQG1hbmhhdHRhblxyXG5cclxuICAgIHN0YXJ0LmRpc3RhbmNlID0gMFxyXG5cclxuICAgIGhlYXAgPSBAY3JlYXRlSGVhcCgpXHJcbiAgICBoZWFwLnB1c2goc3RhcnQpXHJcbiAgICBzdGFydC5oZWFwZWQgPSB0cnVlXHJcblxyXG4gICAgd2hpbGUgaGVhcC5zaXplKCkgPiAwXHJcbiAgICAgIGN1cnJlbnROb2RlID0gaGVhcC5wb3AoKVxyXG4gICAgICBjdXJyZW50Tm9kZS52aXNpdGVkID0gdHJ1ZVxyXG5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICBjdXJyID0gZW5kXHJcbiAgICAgICAgd2hpbGUgY3Vyci5wYXJlbnRcclxuICAgICAgICAgIHJldC5wdXNoKHt4OmN1cnIueCwgeTpjdXJyLnl9KVxyXG4gICAgICAgICAgY3VyciA9IGN1cnIucGFyZW50XHJcbiAgICAgICAgcmV0dXJuIHJldC5yZXZlcnNlKClcclxuXHJcbiAgICAgICMgRmluZCBhbGwgbmVpZ2hib3JzIGZvciB0aGUgY3VycmVudCBub2RlLlxyXG4gICAgICBuZWlnaGJvcnMgPSBAbmVpZ2hib3JzKGdyaWQsIGN1cnJlbnROb2RlKVxyXG5cclxuICAgICAgZm9yIG5laWdoYm9yIGluIG5laWdoYm9yc1xyXG4gICAgICAgIGlmIG5laWdoYm9yLnZpc2l0ZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIFRoZSBkaXN0YW5jZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgIyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXRoIHdlIGhhdmUgYXJyaXZlZCBhdCB0aGlzIG5laWdoYm9yIGlzIHRoZSBzaG9ydGVzdCBvbmUgd2UgaGF2ZSBzZWVuIHlldC5cclxuICAgICAgICBuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGUgPSBjdXJyZW50Tm9kZS5kaXN0YW5jZSArIDFcclxuICAgICAgICBpc0RpYWdvbmFsID0gKGN1cnJlbnROb2RlLnggIT0gbmVpZ2hib3IueCkgYW5kIChjdXJyZW50Tm9kZS55ICE9IG5laWdoYm9yLnkpXHJcbiAgICAgICAgaWYgaXNEaWFnb25hbFxyXG4gICAgICAgICAgbmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlICs9IDAuMVxyXG5cclxuICAgICAgICBpZiAobmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlIDwgbmVpZ2hib3IuZGlzdGFuY2UpIGFuZCBub3QgbmVpZ2hib3IudmlzaXRlZFxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLlxyXG4gICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGVcclxuICAgICAgICAgIG5laWdoYm9yLnBhcmVudCA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgICBpZiBuZWlnaGJvci5oZWFwZWRcclxuICAgICAgICAgICAgaGVhcC5yZXNjb3JlKG5laWdoYm9yKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoZWFwLnB1c2gobmVpZ2hib3IpXHJcbiAgICAgICAgICAgIG5laWdoYm9yLmhlYXBlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gW11cclxuXHJcbiAgbmVpZ2hib3JzOiAoZ3JpZCwgbm9kZSkgLT5cclxuICAgIHJldCA9IFtdXHJcbiAgICB4ID0gbm9kZS54XHJcbiAgICB5ID0gbm9kZS55XHJcblxyXG4gICAgIyBTb3V0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ktMV0pXHJcblxyXG4gICAgIyBTb3V0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3krMV0pXHJcblxyXG4gICAgIyBOb3J0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3krMV0pXHJcblxyXG4gICAgIyBXZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beV0pXHJcblxyXG4gICAgIyBFYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beV0pXHJcblxyXG4gICAgIyBTb3V0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beS0xXSlcclxuXHJcbiAgICAjIE5vcnRoXHJcbiAgICBpZiBncmlkW3hdIGFuZCBncmlkW3hdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5KzFdKVxyXG5cclxuICAgIHJldHVybiByZXRcclxuXHJcbmNsYXNzIFBhdGhmaW5kZXJcclxuICBjb25zdHJ1Y3RvcjogKEBmbG9vciwgQGZsYWdzKSAtPlxyXG5cclxuICBjYWxjOiAoc3RhcnRYLCBzdGFydFksIGRlc3RYLCBkZXN0WSkgLT5cclxuICAgIGRpamtzdHJhID0gbmV3IERpamtzdHJhIEBmbG9vclxyXG4gICAgcmV0dXJuIGRpamtzdHJhLnNlYXJjaChAZmxvb3IuZ3JpZFtzdGFydFhdW3N0YXJ0WV0sIEBmbG9vci5ncmlkW2Rlc3RYXVtkZXN0WV0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhmaW5kZXJcclxuIl19
;