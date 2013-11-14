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
      return cc.game.modes.game.activate();
    }, this);
    return true;
  }
});

myApp = new cocos2dApp();


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"KsM6/6":[function(require,module,exports){
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


},{"brain/brain":"KsM6/6","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/pathfinder":"2ZcY+C"}],"brain/player":[function(require,module,exports){
module.exports=require('TryngT');
},{}],"config":[function(require,module,exports){
module.exports=require('tWG/YV');
},{}],"tWG/YV":[function(require,module,exports){
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


},{"base/mode":"mhMvP9","config":"tWG/YV","resources":"NN+gjI","world/floorgen":"4WaFsS","world/pathfinder":"2ZcY+C"}],"mode/intro":[function(require,module,exports){
module.exports=require('GT1UVd');
},{}],"GT1UVd":[function(require,module,exports){
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


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"NN+gjI":[function(require,module,exports){
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


},{"gfx":"4DqqAy","resources":"NN+gjI"}],"4WaFsS":[function(require,module,exports){
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
},{}],"world/pathfinder":[function(require,module,exports){
module.exports=require('2ZcY+C');
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


},{"world/floorgen":"4WaFsS"}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUtBLElBQUEsdURBQUE7O0FBQUEsQ0FBQSxDQUFBLENBQXVCLGlCQUF2Qjs7QUFFQSxDQUZBLENBRWUsQ0FBRixFQUFRLENBQVIsSUFBYjtDQUE2QixDQUMzQixDQUFNLENBQU4sS0FBUTtDQUNOLEVBRE0sQ0FBRDtDQUNMLEdBQUEsRUFBQTtDQUFBLEdBQ0EsV0FBQTtDQURBLEdBRUEs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QWlDQSxFQUF5QixDQUF6QjtDQUNFLEVBQUcsQ0FBSCxFQUFBO01BbENGO0NBb0NBLEVBQUEsUUFBTztDQW5HVCxFQThEVzs7Q0E5RFg7O0NBM0JGOztBQWdJTSxDQWhJTjtDQWlJZSxDQUFBLENBQUEsRUFBQSxlQUFFO0NBQWdCLEVBQWhCLENBQUQsQ0FBaUI7Q0FBQSxFQUFSLENBQUQsQ0FBUztDQUEvQixFQUFhOztDQUFiLENBRWUsQ0FBVCxDQUFOLENBQU0sQ0FBQSxHQUFDO0NBQ0wsT0FBQTtDQUFBLEVBQWUsQ0FBZixDQUFlLEdBQWY7Q0FDQSxDQUFvRCxFQUE1QixDQUFLLENBQXRCLEVBQVEsR0FBUjtDQUpULEVBRU07O0NBRk47O0NBaklGOztBQXVJQSxDQXZJQSxFQXVJaUIsR0FBWCxDQUFOLEdBdklBIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsInZhciBnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oyd1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIGRpZ2l0cyA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxudmFyIHBvb2wgPSBbXTsvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XHJcbnZhciBHTE9CQUwgPSB0eXBlb2YgZ2xvYmFsID09PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbDtcclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxudmFyIHN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcclxuICAgIHNpZ25pZmljYW5jZSA9IE1hdGgucG93KDIsIGRpZ2l0cyksXHJcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXHJcbiAgICBtYXNrID0gd2lkdGggLSAxO1xyXG5cclxuXHJcbnZhciBvbGRSYW5kb20gPSBNYXRoLnJhbmRvbTtcclxuXHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWVkLCBvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5nbG9iYWwgPT09IHRydWUpIHtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gZmFsc2U7XHJcbiAgICBNYXRoLnJhbmRvbSA9IG1vZHVsZS5leHBvcnRzKHNlZWQsIG9wdGlvbnMpO1xyXG4gICAgb3B0aW9ucy5nbG9iYWwgPSB0cnVlO1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tO1xyXG4gIH1cclxuICB2YXIgdXNlX2VudHJvcHkgPSAob3B0aW9ucyAmJiBvcHRpb25zLmVudHJvcHkpIHx8IGZhbHNlO1xyXG4gIHZhciBrZXkgPSBbXTtcclxuXHJcbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXHJcbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxyXG4gICAgdXNlX2VudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcclxuICAgIDAgaW4gYXJndW1lbnRzID8gc2VlZCA6IGF1dG9zZWVkKCksIDMpLCBrZXkpO1xyXG5cclxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cclxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXHJcbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgICAgICAgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcclxuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxyXG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cclxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxyXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XHJcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcclxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxyXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cclxuICAgIH1cclxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXHJcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xyXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIE1hdGggdW50aWxcclxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cclxuICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucmVzZXRHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBUkM0XHJcbi8vXHJcbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2ZcclxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXHJcbi8vXHJcbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXHJcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcclxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxyXG4vL1xyXG4vKiogQGNvbnN0cnVjdG9yICovXHJcbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XHJcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXHJcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XHJcblxyXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXHJcbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxyXG5cclxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxyXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcclxuICAgIHNbaV0gPSBpKys7XHJcbiAgfVxyXG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XHJcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xyXG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXHJcbiAgICB2YXIgdCwgciA9IDAsXHJcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcclxuICAgIHdoaWxlIChjb3VudC0tKSB7XHJcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XHJcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAgIC8vIFNlZSBodHRwOi8vd3d3LnJzYS5jb20vcnNhbGFicy9ub2RlLmFzcD9pZD0yMDA5XHJcbiAgfSkod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcclxuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKVswXSwgcHJvcDtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvJykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAncycgPyBvYmogOiBvYmogKyAnXFwwJyk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcclxuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xyXG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcclxuICAgIGtleVttYXNrICYgal0gPVxyXG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xyXG4gIH1cclxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcclxufVxyXG5cclxuLy9cclxuLy8gYXV0b3NlZWQoKVxyXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gaWYgYXZhaWxhYmxlLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtVaW50OEFycmF5PX0gc2VlZCAqL1xyXG5mdW5jdGlvbiBhdXRvc2VlZChzZWVkKSB7XHJcbiAgdHJ5IHtcclxuICAgIEdMT0JBTC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHNlZWQgPSBuZXcgVWludDhBcnJheSh3aWR0aCkpO1xyXG4gICAgcmV0dXJuIHRvc3RyaW5nKHNlZWQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBbK25ldyBEYXRlLCBHTE9CQUwsIEdMT0JBTC5uYXZpZ2F0b3IgJiYgR0xPQkFMLm5hdmlnYXRvci5wbHVnaW5zLFxyXG4gICAgICAgICAgICBHTE9CQUwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XHJcbiAgfVxyXG59XHJcblxyXG4vL1xyXG4vLyB0b3N0cmluZygpXHJcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xyXG4vL1xyXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXHJcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXHJcbi8vIG5vdCB3YW50IHRvIGludGVmZXJlIHdpdGggZGV0ZXJtaW5zdGljIFBSTkcgc3RhdGUgbGF0ZXIsXHJcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBNYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXHJcbi8vIGluaXRpYWxpemF0aW9uLlxyXG4vL1xyXG5taXhrZXkoTWF0aC5yYW5kb20oKSwgcG9vbCk7XHJcbiIsIiMgaG93IG1hbnkgcGl4ZWxzIGNhbiB5b3UgZHJhZyBiZWZvcmUgaXQgaXMgYWN0dWFsbHkgY29uc2lkZXJlZCBhIGRyYWdcclxuRU5HQUdFX0RSQUdfRElTVEFOQ0UgPSAzMFxyXG5cclxuSW5wdXRMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICBAc2V0TW91c2VFbmFibGVkKHRydWUpXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMgPSBbXVxyXG5cclxuICBjYWxjRGlzdGFuY2U6ICh4MSwgeTEsIHgyLCB5MikgLT5cclxuICAgIGR4ID0geDIgLSB4MVxyXG4gICAgZHkgPSB5MiAtIHkxXHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcblxyXG4gIHNldERyYWdQb2ludDogLT5cclxuICAgIEBkcmFnWCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICBAZHJhZ1kgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICBjYWxjUGluY2hBbmNob3I6IC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgQHBpbmNoWCA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS54ICsgQHRyYWNrZWRUb3VjaGVzWzFdLngpIC8gMilcclxuICAgICAgQHBpbmNoWSA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS55ICsgQHRyYWNrZWRUb3VjaGVzWzFdLnkpIC8gMilcclxuICAgICAgIyBjYy5sb2cgXCJwaW5jaCBhbmNob3Igc2V0IGF0ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1cIlxyXG5cclxuICBhZGRUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgZm9yIHQgaW4gQHRyYWNrZWRUb3VjaGVzXHJcbiAgICAgIGlmIHQuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm5cclxuICAgIEB0cmFja2VkVG91Y2hlcy5wdXNoIHtcclxuICAgICAgaWQ6IGlkXHJcbiAgICAgIHg6IHhcclxuICAgICAgeTogeVxyXG4gICAgfVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICMgV2UganVzdCBhZGRlZCBhIHNlY29uZCB0b3VjaCBzcG90LiBDYWxjdWxhdGUgdGhlIGFuY2hvciBmb3IgcGluY2hpbmcgbm93XHJcbiAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgI2NjLmxvZyBcImFkZGluZyB0b3VjaCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgcmVtb3ZlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgICBpZiBpbmRleCA8IDJcclxuICAgICAgICAjIFdlIGp1c3QgZm9yZ290IG9uZSBvZiBvdXIgcGluY2ggdG91Y2hlcy4gUGljayBhIG5ldyBhbmNob3Igc3BvdC5cclxuICAgICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICAgI2NjLmxvZyBcImZvcmdldHRpbmcgaWQgI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHVwZGF0ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnggPSB4XHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueSA9IHlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAZHJhZ2dpbmcgPSBmYWxzZVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQGFkZFRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID4gMVxyXG4gICAgICAjIFRoZXkncmUgcGluY2hpbmcsIGRvbid0IGV2ZW4gYm90aGVyIHRvIGVtaXQgYSBjbGlja1xyXG4gICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcblxyXG4gIG9uVG91Y2hlc01vdmVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBwcmV2RGlzdGFuY2UgPSAwXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgcHJldkRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBwcmV2WCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICAgIHByZXZZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAdXBkYXRlVG91Y2godC5nZXRJZCgpLCBwb3MueCwgcG9zLnkpXHJcblxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICMgc2luZ2xlIHRvdWNoLCBjb25zaWRlciBkcmFnZ2luZ1xyXG4gICAgICBkcmFnRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlIEBkcmFnWCwgQGRyYWdZLCBAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuICAgICAgaWYgQGRyYWdnaW5nIG9yIChkcmFnRGlzdGFuY2UgPiBFTkdBR0VfRFJBR19ESVNUQU5DRSlcclxuICAgICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcbiAgICAgICAgaWYgZHJhZ0Rpc3RhbmNlID4gMC41XHJcbiAgICAgICAgICBkeCA9IEB0cmFja2VkVG91Y2hlc1swXS54IC0gQGRyYWdYXHJcbiAgICAgICAgICBkeSA9IEB0cmFja2VkVG91Y2hlc1swXS55IC0gQGRyYWdZXHJcbiAgICAgICAgICAjY2MubG9nIFwic2luZ2xlIGRyYWc6ICN7ZHh9LCAje2R5fVwiXHJcbiAgICAgICAgICBAbW9kZS5vbkRyYWcoZHgsIGR5KVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG5cclxuICAgIGVsc2UgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgICMgYXQgbGVhc3QgdHdvIGZpbmdlcnMgcHJlc2VudCwgY2hlY2sgZm9yIHBpbmNoL3pvb21cclxuICAgICAgY3VyckRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgICAgZGVsdGFEaXN0YW5jZSA9IGN1cnJEaXN0YW5jZSAtIHByZXZEaXN0YW5jZVxyXG4gICAgICBpZiBkZWx0YURpc3RhbmNlICE9IDBcclxuICAgICAgICAjY2MubG9nIFwiZGlzdGFuY2UgZHJhZ2dlZCBhcGFydDogI3tkZWx0YURpc3RhbmNlfSBbYW5jaG9yOiAje0BwaW5jaFh9LCAje0BwaW5jaFl9XVwiXHJcbiAgICAgICAgQG1vZGUub25ab29tKEBwaW5jaFgsIEBwaW5jaFksIGRlbHRhRGlzdGFuY2UpXHJcblxyXG4gIG9uVG91Y2hlc0VuZGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDEgYW5kIG5vdCBAZHJhZ2dpbmdcclxuICAgICAgcG9zID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpXHJcbiAgICAgICNjYy5sb2cgXCJjbGljayBhdCAje3Bvcy54fSwgI3twb3MueX1cIlxyXG4gICAgICBAbW9kZS5vbkNsaWNrKHBvcy54LCBwb3MueSlcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEByZW1vdmVUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG5cclxuICBvblNjcm9sbFdoZWVsOiAoZXYpIC0+XHJcbiAgICBwb3MgPSBldi5nZXRMb2NhdGlvbigpXHJcbiAgICBAbW9kZS5vblpvb20ocG9zLngsIHBvcy55LCBldi5nZXRXaGVlbERlbHRhKCkpXHJcbn1cclxuXHJcbkdmeExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxufVxyXG5cclxuTW9kZVNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuXHJcbiAgICBAaW5wdXQgPSBuZXcgSW5wdXRMYXllcigpXHJcbiAgICBAaW5wdXQuaW5pdChAbW9kZSlcclxuICAgIEBhZGRDaGlsZChAaW5wdXQpXHJcblxyXG4gICAgQGdmeCA9IG5ldyBHZnhMYXllcigpXHJcbiAgICBAZ2Z4LmluaXQoKVxyXG4gICAgQGFkZENoaWxkKEBnZngpXHJcblxyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBtb2RlLm9uQWN0aXZhdGUoKVxyXG59XHJcblxyXG5jbGFzcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT5cclxuICAgIEBzY2VuZSA9IG5ldyBNb2RlU2NlbmUoKVxyXG4gICAgQHNjZW5lLmluaXQodGhpcylcclxuICAgIEBzY2VuZS5yZXRhaW4oKVxyXG5cclxuICBhY3RpdmF0ZTogLT5cclxuICAgIGNjLmxvZyBcImFjdGl2YXRpbmcgbW9kZSAje0BuYW1lfVwiXHJcbiAgICBpZiBjYy5zYXdPbmVTY2VuZT9cclxuICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wb3BTY2VuZSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIGNjLnNhd09uZVNjZW5lID0gdHJ1ZVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wdXNoU2NlbmUoQHNjZW5lKVxyXG5cclxuICBhZGQ6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LmFkZENoaWxkKG9iailcclxuXHJcbiAgcmVtb3ZlOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5yZW1vdmVDaGlsZChvYmopXHJcblxyXG4gICMgdG8gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIE1vZGVzXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVcclxuIiwiaWYgZG9jdW1lbnQ/XHJcbiAgcmVxdWlyZSAnYm9vdC9tYWlud2ViJ1xyXG5lbHNlXHJcbiAgcmVxdWlyZSAnYm9vdC9tYWluZHJvaWQnXHJcbiIsInJlcXVpcmUgJ2pzYi5qcydcclxucmVxdWlyZSAnbWFpbidcclxuXHJcbm51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpXHJcbm51bGxTY2VuZS5pbml0KClcclxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUobnVsbFNjZW5lKVxyXG5jYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuIiwiY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5cclxuY29jb3MyZEFwcCA9IGNjLkFwcGxpY2F0aW9uLmV4dGVuZCB7XHJcbiAgY29uZmlnOiBjb25maWdcclxuICBjdG9yOiAoc2NlbmUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIGNjLkNPQ09TMkRfREVCVUcgPSBAY29uZmlnWydDT0NPUzJEX0RFQlVHJ11cclxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxyXG4gICAgY2Muc2V0dXAoQGNvbmZpZ1sndGFnJ10pXHJcbiAgICBjYy5BcHBDb250cm9sbGVyLnNoYXJlQXBwQ29udHJvbGxlcigpLmRpZEZpbmlzaExhdW5jaGluZ1dpdGhPcHRpb25zKClcclxuXHJcbiAgYXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IC0+XHJcbiAgICAgIGlmIGNjLlJlbmRlckRvZXNub3RTdXBwb3J0KClcclxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXHJcbiAgICAgICAgICBhbGVydCBcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCJcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgIyBpbml0aWFsaXplIGRpcmVjdG9yXHJcbiAgICAgIGRpcmVjdG9yID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKVxyXG5cclxuICAgICAgY2MuRUdMVmlldy5nZXRJbnN0YW5jZSgpLnNldERlc2lnblJlc29sdXRpb25TaXplKDEyODAsIDcyMCwgY2MuUkVTT0xVVElPTl9QT0xJQ1kuU0hPV19BTEwpXHJcblxyXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcclxuICAgICAgZGlyZWN0b3Iuc2V0RGlzcGxheVN0YXRzIEBjb25maWdbJ3Nob3dGUFMnXVxyXG5cclxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xyXG4gICAgICBkaXJlY3Rvci5zZXRBbmltYXRpb25JbnRlcnZhbCAxLjAgLyBAY29uZmlnWydmcmFtZVJhdGUnXVxyXG5cclxuICAgICAgIyBsb2FkIHJlc291cmNlc1xyXG4gICAgICByZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbiAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQocmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QsIC0+XHJcbiAgICAgICAgcmVxdWlyZSAnbWFpbidcclxuICAgICAgICBudWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKTtcclxuICAgICAgICBudWxsU2NlbmUuaW5pdCgpXHJcbiAgICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUobnVsbFNjZW5lKVxyXG4jICAgICAgICBjYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuICAgICAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxyXG4gICAgICB0aGlzKVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxubXlBcHAgPSBuZXcgY29jb3MyZEFwcCgpXHJcbiIsImNsYXNzIEJyYWluXHJcbiAgY29uc3RydWN0b3I6IChAdGlsZXMsIEBhbmltRnJhbWUpIC0+XHJcbiAgICBAZmFjaW5nUmlnaHQgPSB0cnVlXHJcbiAgICBAY2QgPSAwXHJcbiAgICBAaW50ZXJwRnJhbWVzID0gW11cclxuICAgIEBwYXRoID0gW11cclxuXHJcbiAgbW92ZTogKGd4LCBneSwgZnJhbWVzKSAtPlxyXG4gICAgQGludGVycEZyYW1lcyA9IFtdXHJcbiAgICBkeCA9IChAeCAtIGd4KSAqIGNjLnVuaXRTaXplXHJcbiAgICBkeSA9IChAeSAtIGd5KSAqIGNjLnVuaXRTaXplXHJcbiAgICBAZmFjaW5nUmlnaHQgPSAoZHggPCAwKVxyXG4gICAgaSA9IGZyYW1lcy5sZW5ndGhcclxuICAgIGZvciBmIGluIGZyYW1lc1xyXG4gICAgICBhbmltRnJhbWUgPSB7XHJcbiAgICAgICAgeDogZHggKiBpIC8gZnJhbWVzLmxlbmd0aFxyXG4gICAgICAgIHk6IGR5ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICBhbmltRnJhbWU6IGZcclxuICAgICAgfVxyXG4gICAgICBAaW50ZXJwRnJhbWVzLnB1c2ggYW5pbUZyYW1lXHJcbiAgICAgIGktLVxyXG5cclxuICAgIGNjLmdhbWUuc2V0VHVybkZyYW1lcyhmcmFtZXMubGVuZ3RoKVxyXG5cclxuICAgICMgSW1tZWRpYXRlbHkgbW92ZSwgb25seSBwcmV0ZW5kIHRvIGFuaW1hdGUgdGhlcmUgb3ZlciB0aGUgbmV4dCBmcmFtZXMubGVuZ3RoIGZyYW1lc1xyXG4gICAgQHggPSBneFxyXG4gICAgQHkgPSBneVxyXG5cclxuICB3YWxrUGF0aDogKEBwYXRoKSAtPlxyXG5cclxuICBjcmVhdGVTcHJpdGU6IC0+XHJcbiAgICBzID0gY2MuU3ByaXRlLmNyZWF0ZSBAdGlsZXMucmVzb3VyY2VcclxuICAgIEB1cGRhdGVTcHJpdGUocylcclxuICAgIHJldHVybiBzXHJcblxyXG4gIHVwZGF0ZVNwcml0ZTogKHNwcml0ZSkgLT5cclxuICAgIHggPSBAeCAqIGNjLnVuaXRTaXplXHJcbiAgICB5ID0gQHkgKiBjYy51bml0U2l6ZVxyXG4gICAgYW5pbUZyYW1lID0gQGFuaW1GcmFtZVxyXG4gICAgaWYgQGludGVycEZyYW1lcy5sZW5ndGhcclxuICAgICAgZnJhbWUgPSBAaW50ZXJwRnJhbWVzLnNwbGljZSgwLCAxKVswXVxyXG4gICAgICB4ICs9IGZyYW1lLnhcclxuICAgICAgeSArPSBmcmFtZS55XHJcbiAgICAgIGFuaW1GcmFtZSA9IGZyYW1lLmFuaW1GcmFtZVxyXG4gICAgIyBlbHNlXHJcbiAgICAjICAgYW5pbUZyYW1lID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMilcclxuICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdChAdGlsZXMucmVjdChhbmltRnJhbWUpKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXHJcbiAgICB4YW5jaG9yID0gMS4wXHJcbiAgICB4c2NhbGUgPSAtMS4wXHJcbiAgICBpZiBAZmFjaW5nUmlnaHRcclxuICAgICAgeGFuY2hvciA9IDBcclxuICAgICAgeHNjYWxlID0gMS4wXHJcbiAgICBzcHJpdGUuc2V0U2NhbGVYKHhzY2FsZSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKHhhbmNob3IsIDApKVxyXG5cclxuICB0YWtlU3RlcDogLT5cclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgaWYgQHBhdGgubGVuZ3RoID4gMFxyXG4gICAgICAgIHN0ZXAgPSBAcGF0aC5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgICAjIGNjLmxvZyBcInRha2luZyBzdGVwIHRvICN7c3RlcC54fSwgI3tzdGVwLnl9XCJcclxuICAgICAgICBAbW92ZShzdGVwLngsIHN0ZXAueSwgWzIsMyw0XSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHRpY2s6IChlbGFwc2VkVHVybnMpIC0+XHJcbiAgICBpZiBAY2QgPiAwXHJcbiAgICAgIEBjZCAtPSBlbGFwc2VkVHVybnMgaWYgQGNkID4gMFxyXG4gICAgICBAY2QgPSAwIGlmIEBjZCA8IDBcclxuICAgIGlmIEBjZCA9PSAwXHJcbiAgICAgIEB0aGluaygpXHJcblxyXG4gIHRoaW5rOiAtPlxyXG4gICAgY2MubG9nIFwidGhpbmsgbm90IGltcGxlbWVudGVkIVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJyYWluXHJcbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuQnJhaW4gPSByZXF1aXJlICdicmFpbi9icmFpbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblRpbGVzaGVldCA9IHJlcXVpcmUgJ2dmeC90aWxlc2hlZXQnXHJcblxyXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBCcmFpblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBhbmltRnJhbWUgPSAwXHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgdGhpc1trXSA9IHZcclxuICAgIHN1cGVyIHJlc291cmNlcy50aWxlc2hlZXRzLnBsYXllciwgQGFuaW1GcmFtZVxyXG5cclxuICB3YWxrUGF0aDogKEBwYXRoKSAtPlxyXG5cclxuICB0aGluazogLT5cclxuICAgIGlmIEB0YWtlU3RlcCgpXHJcbiAgICAgIEBjZCA9IDUwXHJcblxyXG4gIGFjdDogKGd4LCBneSkgLT5cclxuICAgIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxyXG4gICAgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhAeCwgQHksIGd4LCBneSlcclxuICAgIEB3YWxrUGF0aChwYXRoKVxyXG4gICAgY2MubG9nIFwicGF0aCBpcyAje3BhdGgubGVuZ3RofSBsb25nXCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICAjIGNyYXAgbm9ib2R5IHNob3VsZCBldmVyIGhhdmUgdG8gY2hhbmdlXHJcbiAgQ09DT1MyRF9ERUJVRzoyICMgMCB0byB0dXJuIGRlYnVnIG9mZiwgMSBmb3IgYmFzaWMgZGVidWcsIGFuZCAyIGZvciBmdWxsIGRlYnVnXHJcbiAgYm94MmQ6ZmFsc2VcclxuICBjaGlwbXVuazpmYWxzZVxyXG4gIHNob3dGUFM6dHJ1ZVxyXG4gIGZyYW1lUmF0ZTo2MFxyXG4gIGxvYWRFeHRlbnNpb246ZmFsc2VcclxuICByZW5kZXJNb2RlOjBcclxuICB0YWc6J2dhbWVDYW52YXMnXHJcbiAgYXBwRmlsZXM6IFtcclxuICAgICdidW5kbGUuanMnXHJcbiAgXVxyXG5cclxuICAjIFRoZSBzaXplIG9mIG9uZSB1bml0IHdvcnRoIG9mIHRpbGUuIFByZXR0eSBtdWNoIGNvbnRyb2xzIGFsbCByZW5kZXJpbmcsIGNsaWNrIGhhbmRsaW5nLCBldGMuXHJcbiAgdW5pdFNpemU6IDMyXHJcblxyXG4gICMgem9vbSBpbi9vdXQgYm91bmRzLiBBIHNjYWxlIG9mIDEuMCBpcyAxOjEgcGl4ZWwgdG8gXCJkZXNpZ24gZGltZW5zaW9uc1wiIChjdXJyZW50bHkgMTI4MHg3MjAgdmlldykuXHJcbiAgIyBTY2FsZSBzcGVlZCBpcyB0aGUgZGVub21pbmF0b3IgZm9yIGFkanVzdGluZyB0aGUgY3VycmVudCBzY2FsZS4gVGhlIG1hdGg6XHJcbiAgIyBzY2FsZSArPSB6b29tRGVsdGEgLyBzY2FsZS5zcGVlZFxyXG4gICMgem9vbURlbHRhIGlzIHRoZSBkaXN0YW5jZSBpbiBwaXhlbHMgYWRkZWQvcmVtb3ZlZCBiZXR3ZWVuIHlvdXIgZmluZ2VycyBvbiB5b3VyIHBob25lIHNjcmVlbi5cclxuICAjIHpvb21EZWx0YSBpcyBhbHdheXMgMTIwIG9yIC0xMjAgZm9yIG1vdXNld2hlZWxzLCB0aGVyZWZvcmUgc2V0dGluZyBzY2FsZS5zcGVlZFxyXG4gICMgdG8gMTIwIHdvdWxkIGNhdXNlIHRoZSBzY2FsZSB0byBjaGFuZ2UgYnkgMS4wIGZvciBldmVyeSBcIm5vdGNoXCIgb24gdGhlIHdoZWVsLlxyXG4gIHNjYWxlOlxyXG4gICAgc3BlZWQ6IDQwMFxyXG4gICAgbWluOiAwLjc1XHJcbiAgICBtYXg6IDMuMFxyXG4iLCJjbGFzcyBMYXllciBleHRlbmRzIGNjLkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAY3RvcigpXHJcbiAgICBAaW5pdCgpXHJcblxyXG5jbGFzcyBTY2VuZSBleHRlbmRzIGNjLlNjZW5lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAY3RvcigpXHJcbiAgICBAaW5pdCgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgTGF5ZXI6IExheWVyXHJcbiAgU2NlbmU6IFNjZW5lXHJcbiIsIlxyXG4jIFRoaXMgaXMgZnVja2luZyB0cmFnaWMuXHJcblBJWEVMX0ZVREdFX0ZBQ1RPUiA9IDAgIyBob3cgbWFueSBwaXhlbHMgdG8gcmVtb3ZlIGZyb20gdGhlIGVkZ2UgdG8gcmVtb3ZlIGJsZWVkXHJcblNDQUxFX0ZVREdFX0ZBQ1RPUiA9IDAgIyBhZGRpdGlvbmFsIHNwcml0ZSBzY2FsZSB0byBlbnN1cmUgcHJvcGVyIHRpbGluZ1xyXG5cclxuVGlsZXNoZWV0QmF0Y2hOb2RlID0gY2MuU3ByaXRlQmF0Y2hOb2RlLmV4dGVuZCB7XHJcbiAgaW5pdDogKGZpbGVJbWFnZSwgY2FwYWNpdHkpIC0+XHJcbiAgICBAX3N1cGVyKGZpbGVJbWFnZSwgY2FwYWNpdHkpXHJcblxyXG4gIGNyZWF0ZVNwcml0ZTogKHRpbGVJbmRleCwgeCwgeSkgLT5cclxuICAgIHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGVXaXRoVGV4dHVyZShAZ2V0VGV4dHVyZSgpLCBAdGlsZXNoZWV0LnJlY3QodGlsZUluZGV4KSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKHgsIHkpXHJcbiAgICBzcHJpdGUuc2V0U2NhbGUoQHRpbGVzaGVldC5hZGp1c3RlZFNjYWxlLngsIEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS55KVxyXG4gICAgQGFkZENoaWxkIHNwcml0ZVxyXG4gICAgcmV0dXJuIHNwcml0ZVxyXG59XHJcblxyXG5jbGFzcyBUaWxlc2hlZXRcclxuICBjb25zdHJ1Y3RvcjogKEByZXNvdXJjZSwgQHJlc291cmNlV2lkdGgsIEByZXNvdXJjZUhlaWdodCwgQHRpbGVXaWR0aCwgQHRpbGVIZWlnaHQsIEB0aWxlUGFkZGluZykgLT5cclxuICAgIEBwYWRkZWRUaWxlV2lkdGggPSBAdGlsZVdpZHRoICsgKEB0aWxlUGFkZGluZyAqIDIpXHJcbiAgICBAcGFkZGVkVGlsZUhlaWdodCA9IEB0aWxlSGVpZ2h0ICsgKEB0aWxlUGFkZGluZyAqIDIpXHJcbiAgICBAc3RyaWRlID0gTWF0aC5mbG9vcihAcmVzb3VyY2VXaWR0aCAvIChAdGlsZVdpZHRoICsgKEB0aWxlUGFkZGluZyAqIDIpKSlcclxuICAgIEBhZGp1c3RlZFNjYWxlID1cclxuICAgICAgeDogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAdGlsZVdpZHRoKVxyXG4gICAgICB5OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEB0aWxlSGVpZ2h0KVxyXG5cclxuICByZWN0OiAodikgLT5cclxuICAgIHkgPSBNYXRoLmZsb29yKHYgLyBAc3RyaWRlKVxyXG4gICAgeCA9IHYgJSBAc3RyaWRlXHJcbiAgICByZXR1cm4gY2MucmVjdChcclxuICAgICAgQHRpbGVQYWRkaW5nICsgKHggKiBAcGFkZGVkVGlsZVdpZHRoKSxcclxuICAgICAgQHRpbGVQYWRkaW5nICsgKHkgKiBAcGFkZGVkVGlsZUhlaWdodCksXHJcbiAgICAgIEB0aWxlV2lkdGggLSBQSVhFTF9GVURHRV9GQUNUT1IsXHJcbiAgICAgIEB0aWxlSGVpZ2h0IC0gUElYRUxfRlVER0VfRkFDVE9SKVxyXG5cclxuICBjcmVhdGVCYXRjaE5vZGU6IChjYXBhY2l0eSkgLT5cclxuICAgIGJhdGNoTm9kZSA9IG5ldyBUaWxlc2hlZXRCYXRjaE5vZGUoKVxyXG4gICAgYmF0Y2hOb2RlLnRpbGVzaGVldCA9IHRoaXNcclxuICAgIGJhdGNoTm9kZS5pbml0KEByZXNvdXJjZSwgY2FwYWNpdHkpXHJcbiAgICByZXR1cm4gYmF0Y2hOb2RlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuSW50cm9Nb2RlID0gcmVxdWlyZSAnbW9kZS9pbnRybydcclxuR2FtZU1vZGUgPSByZXF1aXJlICdtb2RlL2dhbWUnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblBsYXllciA9IHJlcXVpcmUgJ2JyYWluL3BsYXllcidcclxuXHJcbmNsYXNzIEdhbWVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEB0dXJuRnJhbWVzID0gMFxyXG4gICAgQG1vZGVzID1cclxuICAgICAgaW50cm86IG5ldyBJbnRyb01vZGUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZU1vZGUoKVxyXG5cclxuICBuZXdGbG9vcjogLT5cclxuICAgIGZsb29yZ2VuLmdlbmVyYXRlKClcclxuXHJcbiAgY3VycmVudEZsb29yOiAtPlxyXG4gICAgcmV0dXJuIEBzdGF0ZS5mbG9vcnNbQHN0YXRlLnBsYXllci5mbG9vcl1cclxuXHJcbiAgbmV3R2FtZTogLT5cclxuICAgIGNjLmxvZyBcIm5ld0dhbWVcIlxyXG4gICAgQHN0YXRlID0ge1xyXG4gICAgICBydW5uaW5nOiBmYWxzZVxyXG4gICAgICBwbGF5ZXI6IG5ldyBQbGF5ZXIoe1xyXG4gICAgICAgIHg6IDQ0XHJcbiAgICAgICAgeTogNDlcclxuICAgICAgICBmbG9vcjogMVxyXG4gICAgICB9KVxyXG4gICAgICBmbG9vcnM6IFtcclxuICAgICAgICB7fVxyXG4gICAgICAgIEBuZXdGbG9vcigpXHJcbiAgICAgIF1cclxuICAgIH1cclxuXHJcbiAgc2V0VHVybkZyYW1lczogKGNvdW50KSAtPlxyXG4gICAgaWYgQHR1cm5GcmFtZXMgPCBjb3VudFxyXG4gICAgICBAdHVybkZyYW1lcyA9IGNvdW50XHJcblxyXG5pZiBub3QgY2MuZ2FtZVxyXG4gIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gIGNjLnVuaXRTaXplID0gY29uZmlnLnVuaXRTaXplXHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDFcclxuICAgICAgd2hlbiB2ID09IGZsb29yZ2VuLkRPT1IgdGhlbiAyXHJcbiAgICAgIHdoZW4gdiA+PSBmbG9vcmdlbi5GSVJTVF9ST09NX0lEIHRoZW4gMFxyXG4gICAgICBlbHNlIDBcclxuXHJcbiAgZ2Z4Q2xlYXI6IC0+XHJcbiAgICBpZiBAZ2Z4P1xyXG4gICAgICBpZiBAZ2Z4LmZsb29yTGF5ZXI/XHJcbiAgICAgICAgQHJlbW92ZSBAZ2Z4LmZsb29yTGF5ZXJcclxuICAgIEBnZnggPSB7fVxyXG5cclxuICBnZnhSZW5kZXJGbG9vcjogLT5cclxuICAgIGZsb29yID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllciA9IG5ldyBjYy5MYXllcigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIEBnZnguZmxvb3JCYXRjaE5vZGUgPSByZXNvdXJjZXMudGlsZXNoZWV0cy50aWxlczAuY3JlYXRlQmF0Y2hOb2RlKChmbG9vci53aWR0aCAqIGZsb29yLmhlaWdodCkgLyAyKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZnguZmxvb3JCYXRjaE5vZGUsIC0xXHJcbiAgICBmb3IgaiBpbiBbMC4uLmZsb29yLmhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5mbG9vci53aWR0aF1cclxuICAgICAgICB2ID0gZmxvb3IuZ2V0KGksIGopXHJcbiAgICAgICAgaWYgdiAhPSAwXHJcbiAgICAgICAgICBAZ2Z4LmZsb29yQmF0Y2hOb2RlLmNyZWF0ZVNwcml0ZShAdGlsZUZvckdyaWRWYWx1ZSh2KSwgaSAqIGNjLnVuaXRTaXplLCBqICogY2MudW5pdFNpemUpXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKGNvbmZpZy5zY2FsZS5taW4pXHJcbiAgICBAYWRkIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeENlbnRlck1hcCgpXHJcblxyXG4gIGdmeFBsYWNlTWFwOiAobWFwWCwgbWFwWSwgc2NyZWVuWCwgc2NyZWVuWSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHggPSBzY3JlZW5YIC0gKG1hcFggKiBzY2FsZSlcclxuICAgIHkgPSBzY3JlZW5ZIC0gKG1hcFkgKiBzY2FsZSlcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbih4LCB5KVxyXG5cclxuICBnZnhDZW50ZXJNYXA6IC0+XHJcbiAgICBjZW50ZXIgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpLmJib3guY2VudGVyKClcclxuICAgIEBnZnhQbGFjZU1hcChjZW50ZXIueCAqIGNjLnVuaXRTaXplLCBjZW50ZXIueSAqIGNjLnVuaXRTaXplLCBjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpXHJcblxyXG4gIGdmeFNjcmVlblRvTWFwQ29vcmRzOiAoeCwgeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiAoeCAtIHBvcy54KSAvIHNjYWxlXHJcbiAgICAgIHk6ICh5IC0gcG9zLnkpIC8gc2NhbGVcclxuICAgIH1cclxuXHJcbiAgZ2Z4UmVuZGVyUGxheWVyOiAtPlxyXG4gICAgQGdmeC5wbGF5ZXIgPSB7fVxyXG4gICAgQGdmeC5wbGF5ZXIuc3ByaXRlID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY3JlYXRlU3ByaXRlKClcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LnBsYXllci5zcHJpdGUsIDBcclxuXHJcbiAgZ2Z4QWRqdXN0TWFwU2NhbGU6IChkZWx0YSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHNjYWxlICs9IGRlbHRhXHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5tYXggaWYgc2NhbGUgPiBjb25maWcuc2NhbGUubWF4XHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5taW4gaWYgc2NhbGUgPCBjb25maWcuc2NhbGUubWluXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoc2NhbGUpXHJcblxyXG4gIGdmeFJlbmRlclBhdGg6IChwYXRoKSAtPlxyXG4gICAgaWYgQGdmeC5wYXRoQmF0Y2hOb2RlP1xyXG4gICAgICBAZ2Z4LmZsb29yTGF5ZXIucmVtb3ZlQ2hpbGQgQGdmeC5wYXRoQmF0Y2hOb2RlXHJcbiAgICByZXR1cm4gaWYgcGF0aC5sZW5ndGggPT0gMFxyXG4gICAgQGdmeC5wYXRoQmF0Y2hOb2RlID0gcmVzb3VyY2VzLnRpbGVzaGVldHMudGlsZXMwLmNyZWF0ZUJhdGNoTm9kZShwYXRoLmxlbmd0aClcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LnBhdGhCYXRjaE5vZGVcclxuICAgIGZvciBwIGluIHBhdGhcclxuICAgICAgc3ByaXRlID0gQGdmeC5wYXRoQmF0Y2hOb2RlLmNyZWF0ZVNwcml0ZSgxNywgcC54ICogY2MudW5pdFNpemUsIHAueSAqIGNjLnVuaXRTaXplKVxyXG4gICAgICBzcHJpdGUuc2V0T3BhY2l0eSgxMjgpXHJcblxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24ocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIEBnZnhBZGp1c3RNYXBTY2FsZShkZWx0YSAvIGNvbmZpZy5zY2FsZS5zcGVlZClcclxuICAgIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgICBjYy5nYW1lLm5ld0dhbWUoKVxyXG4gICAgQGdmeENsZWFyKClcclxuICAgIEBnZnhSZW5kZXJGbG9vcigpXHJcbiAgICBAZ2Z4UmVuZGVyUGxheWVyKClcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0U2NoZWR1bGVyKCkuc2NoZWR1bGVDYWxsYmFja0ZvclRhcmdldCh0aGlzLCBAdXBkYXRlLCAxIC8gNjAuMCwgY2MuUkVQRUFUX0ZPUkVWRVIsIDAsIGZhbHNlKVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgZ3JpZFggPSBNYXRoLmZsb29yKHBvcy54IC8gY2MudW5pdFNpemUpXHJcbiAgICBncmlkWSA9IE1hdGguZmxvb3IocG9zLnkgLyBjYy51bml0U2l6ZSlcclxuXHJcbiAgICBpZiBub3QgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nXHJcbiAgICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLmFjdChncmlkWCwgZ3JpZFkpXHJcbiAgICAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IHRydWVcclxuICAgICAgY2MubG9nIFwicnVubmluZ1wiXHJcblxyXG4gICAgIyBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgICMgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhjYy5nYW1lLnN0YXRlLnBsYXllci54LCBjYy5nYW1lLnN0YXRlLnBsYXllci55LCBncmlkWCwgZ3JpZFkpXHJcbiAgICAjIEBnZnhSZW5kZXJQYXRoKHBhdGgpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudXBkYXRlU3ByaXRlKEBnZngucGxheWVyLnNwcml0ZSlcclxuXHJcbiAgICBpZiBjYy5nYW1lLnR1cm5GcmFtZXMgPiAwXHJcbiAgICAgIGNjLmdhbWUudHVybkZyYW1lcy0tXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGNjLmdhbWUuc3RhdGUucnVubmluZ1xyXG4gICAgICAgIG1pbmltdW1DRCA9IDEwMDBcclxuICAgICAgICBpZiBtaW5pbXVtQ0QgPiBjYy5nYW1lLnN0YXRlLnBsYXllci5jZFxyXG4gICAgICAgICAgbWluaW11bUNEID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2RcclxuICAgICAgICAjIFRPRE86IGNoZWNrIGNkIG9mIGFsbCBOUENzIG9uIHRoZSBmbG9vciBhZ2FpbnN0IHRoZSBtaW5pbXVtQ0RcclxuICAgICAgICBjYy5nYW1lLnN0YXRlLnBsYXllci50aWNrKG1pbmltdW1DRClcclxuICAgICAgICBpZiBjYy5nYW1lLnN0YXRlLnBsYXllci5jZCA9PSAwICMgV2UganVzdCByYW4sIHlldCBkaWQgbm90aGluZ1xyXG4gICAgICAgICAgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nID0gZmFsc2VcclxuICAgICAgICAgIGNjLmxvZyBcIm5vdCBydW5uaW5nXCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU1vZGVcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgSW50cm9Nb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJJbnRyb1wiKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLmltYWdlcy5zcGxhc2hzY3JlZW5cclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxyXG4gICAgQGFkZCBAc3ByaXRlXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgY2MubG9nIFwiaW50cm8gY2xpY2sgI3t4fSwgI3t5fVwiXHJcbiAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnRyb01vZGVcclxuIiwiVGlsZXNoZWV0ID0gcmVxdWlyZSBcImdmeC90aWxlc2hlZXRcIlxyXG5cclxuaW1hZ2VzID1cclxuICBzcGxhc2hzY3JlZW46ICdyZXMvc3BsYXNoc2NyZWVuLnBuZydcclxuICB0aWxlczA6ICdyZXMvdGlsZXMwLnBuZydcclxuICBwbGF5ZXI6ICdyZXMvcGxheWVyLnBuZydcclxuXHJcbnRpbGVzaGVldHMgPVxyXG4gIHRpbGVzMDogbmV3IFRpbGVzaGVldChpbWFnZXMudGlsZXMwLCA1MTIsIDUxMiwgMzIsIDMyLCAxKVxyXG4gIHBsYXllcjogbmV3IFRpbGVzaGVldChpbWFnZXMucGxheWVyLCA1MTIsIDI1NiwgMjQsIDI4LCAwKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGltYWdlczogaW1hZ2VzXHJcbiAgdGlsZXNoZWV0czogdGlsZXNoZWV0c1xyXG4gIGNvY29zUHJlbG9hZExpc3Q6ICh7c3JjOiB2fSBmb3IgaywgdiBvZiBpbWFnZXMpXHJcbiIsImdmeCA9IHJlcXVpcmUgJ2dmeCdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgRmxvb3IgZXh0ZW5kcyBnZnguTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlbiwgY2MucmVjdCg0NTAsMzAwLDE2LDE2KVxyXG4gICAgQHNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAYWRkQ2hpbGQoQHNwcml0ZSwgMClcclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucCgwLCAwKSlcclxuICAgIEBzZXRQb3NpdGlvbihjYy5wKDEwMCwgMTAwKSlcclxuICAgIEBzZXRTY2FsZSgxMCwgMTApXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiB0b3VjaGVzXHJcbiAgICAgIHggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuICAgICAgY2MubG9nIFwidG91Y2ggRmxvb3IgYXQgI3t4fSwgI3t5fVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yXHJcbiIsImZzID0gcmVxdWlyZSAnZnMnXHJcbnNlZWRSYW5kb20gPSByZXF1aXJlICdzZWVkLXJhbmRvbSdcclxuXHJcblNIQVBFUyA9IFtcclxuICBcIlwiXCJcclxuICAjIyMjIyMjIyMjIyNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjIyMjIyMjIy4uLiNcclxuICAgICAgICAgIy4uLiNcclxuICAgICAgICAgIy4uLiNcclxuICAgICAgICAgIy4uLiNcclxuICAgICAgICAgIyMjIyNcclxuICBcIlwiXCJcclxuICBcIlwiXCJcclxuICAjIyMjIyMjIyMjIyNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjLi4uIyMjIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jXHJcbiAgIyMjIyNcclxuICBcIlwiXCJcclxuICBcIlwiXCJcclxuICAjIyMjI1xyXG4gICMuLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgICAgICMjIyNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAjIyMjIy4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjLi4uLi4uI1xyXG4gICMjIyMjIyMjXHJcbiAgXCJcIlwiXHJcbl1cclxuXHJcbkVNUFRZID0gMFxyXG5XQUxMID0gMVxyXG5ET09SID0gMlxyXG5GSVJTVF9ST09NX0lEID0gNVxyXG5cclxudmFsdWVUb0NvbG9yID0gKHAsIHYpIC0+XHJcbiAgc3dpdGNoXHJcbiAgICB3aGVuIHYgPT0gV0FMTCB0aGVuIHJldHVybiBwLmNvbG9yIDMyLCAzMiwgMzJcclxuICAgIHdoZW4gdiA9PSBET09SIHRoZW4gcmV0dXJuIHAuY29sb3IgMTI4LCAxMjgsIDEyOFxyXG4gICAgd2hlbiB2ID49IEZJUlNUX1JPT01fSUQgdGhlbiByZXR1cm4gcC5jb2xvciAwLCAwLCA1ICsgTWF0aC5taW4oMjQwLCAxNSArICh2ICogMikpXHJcbiAgcmV0dXJuIHAuY29sb3IgMCwgMCwgMFxyXG5cclxuY2xhc3MgUmVjdFxyXG4gIGNvbnN0cnVjdG9yOiAoQGwsIEB0LCBAciwgQGIpIC0+XHJcblxyXG4gIHc6IC0+IEByIC0gQGxcclxuICBoOiAtPiBAYiAtIEB0XHJcbiAgYXJlYTogLT4gQHcoKSAqIEBoKClcclxuICBhc3BlY3Q6IC0+XHJcbiAgICBpZiBAaCgpID4gMFxyXG4gICAgICByZXR1cm4gQHcoKSAvIEBoKClcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIDBcclxuXHJcbiAgc3F1YXJlbmVzczogLT5cclxuICAgIHJldHVybiBNYXRoLmFicyhAdygpIC0gQGgoKSlcclxuXHJcbiAgY2VudGVyOiAtPlxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogTWF0aC5mbG9vcigoQHIgKyBAbCkgLyAyKVxyXG4gICAgICB5OiBNYXRoLmZsb29yKChAYiArIEB0KSAvIDIpXHJcbiAgICB9XHJcblxyXG4gIGNsb25lOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBSZWN0KEBsLCBAdCwgQHIsIEBiKVxyXG5cclxuICBleHBhbmQ6IChyKSAtPlxyXG4gICAgaWYgQGFyZWEoKVxyXG4gICAgICBAbCA9IHIubCBpZiBAbCA+IHIubFxyXG4gICAgICBAdCA9IHIudCBpZiBAdCA+IHIudFxyXG4gICAgICBAciA9IHIuciBpZiBAciA8IHIuclxyXG4gICAgICBAYiA9IHIuYiBpZiBAYiA8IHIuYlxyXG4gICAgZWxzZVxyXG4gICAgICAjIHNwZWNpYWwgY2FzZSwgYmJveCBpcyBlbXB0eS4gUmVwbGFjZSBjb250ZW50cyFcclxuICAgICAgQGwgPSByLmxcclxuICAgICAgQHQgPSByLnRcclxuICAgICAgQHIgPSByLnJcclxuICAgICAgQGIgPSByLmJcclxuXHJcbiAgdG9TdHJpbmc6IC0+IFwieyAoI3tAbH0sICN7QHR9KSAtPiAoI3tAcn0sICN7QGJ9KSAje0B3KCl9eCN7QGgoKX0sIGFyZWE6ICN7QGFyZWEoKX0sIGFzcGVjdDogI3tAYXNwZWN0KCl9LCBzcXVhcmVuZXNzOiAje0BzcXVhcmVuZXNzKCl9IH1cIlxyXG5cclxuY2xhc3MgUm9vbVRlbXBsYXRlXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEByb29taWQpIC0+XHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPSBFTVBUWVxyXG5cclxuICAgIEBnZW5lcmF0ZVNoYXBlKClcclxuXHJcbiAgZ2VuZXJhdGVTaGFwZTogLT5cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQHNldChpLCBqLCBAcm9vbWlkKVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBzZXQoaSwgMCwgV0FMTClcclxuICAgICAgQHNldChpLCBAaGVpZ2h0IC0gMSwgV0FMTClcclxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgQHNldCgwLCBqLCBXQUxMKVxyXG4gICAgICBAc2V0KEB3aWR0aCAtIDEsIGosIFdBTEwpXHJcblxyXG4gIHJlY3Q6ICh4LCB5KSAtPlxyXG4gICAgcmV0dXJuIG5ldyBSZWN0IHgsIHksIHggKyBAd2lkdGgsIHkgKyBAaGVpZ2h0XHJcblxyXG4gIHNldDogKGksIGosIHYpIC0+XHJcbiAgICBAZ3JpZFtpXVtqXSA9IHZcclxuXHJcbiAgZ2V0OiAobWFwLCB4LCB5LCBpLCBqKSAtPlxyXG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XHJcbiAgICAgIHYgPSBAZ3JpZFtpXVtqXVxyXG4gICAgICByZXR1cm4gdiBpZiB2ICE9IEVNUFRZXHJcbiAgICByZXR1cm4gbWFwLmdldCB4ICsgaSwgeSArIGpcclxuXHJcbiAgcGxhY2U6IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIHYgPSBAZ3JpZFtpXVtqXVxyXG4gICAgICAgIG1hcC5zZXQoeCArIGksIHkgKyBqLCB2KSBpZiB2ICE9IEVNUFRZXHJcblxyXG4gIGZpdHM6IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIG12ID0gbWFwLmdldCh4ICsgaSwgeSArIGopXHJcbiAgICAgICAgc3YgPSBAZ3JpZFtpXVtqXVxyXG4gICAgICAgIGlmIG12ICE9IEVNUFRZIGFuZCBzdiAhPSBFTVBUWSBhbmQgKG12ICE9IFdBTEwgb3Igc3YgIT0gV0FMTClcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgZG9vckVsaWdpYmxlOiAobWFwLCB4LCB5LCBpLCBqKSAtPlxyXG4gICAgd2FsbE5laWdoYm9ycyA9IDBcclxuICAgIHJvb21zU2VlbiA9IHt9XHJcbiAgICB2YWx1ZXMgPSBbXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpICsgMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGkgLSAxLCBqKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiArIDEpXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpLCBqIC0gMSlcclxuICAgIF1cclxuICAgIGZvciB2IGluIHZhbHVlc1xyXG4gICAgICBpZiB2XHJcbiAgICAgICAgaWYgdiA9PSAxXHJcbiAgICAgICAgICB3YWxsTmVpZ2hib3JzKytcclxuICAgICAgICBlbHNlIGlmIHYgIT0gMlxyXG4gICAgICAgICAgcm9vbXNTZWVuW3ZdID0gMVxyXG4gICAgcm9vbXMgPSBPYmplY3Qua2V5cyhyb29tc1NlZW4pLnNvcnQgKGEsIGIpIC0+IGEtYlxyXG4gICAgcm9vbXMgPSByb29tcy5tYXAgKHJvb20pIC0+IHBhcnNlSW50KHJvb20pXHJcbiAgICByb29tQ291bnQgPSByb29tcy5sZW5ndGhcclxuICAgIGlmICh3YWxsTmVpZ2hib3JzID09IDIpIGFuZCAocm9vbUNvdW50ID09IDIpIGFuZCAoQHJvb21pZCBpbiByb29tcylcclxuICAgICAgaWYgKHZhbHVlc1swXSA9PSB2YWx1ZXNbMV0pIG9yICh2YWx1ZXNbMl0gPT0gdmFsdWVzWzNdKVxyXG4gICAgICAgIHJldHVybiByb29tc1xyXG4gICAgcmV0dXJuIFstMSwgLTFdXHJcblxyXG4gIGRvb3JMb2NhdGlvbjogKG1hcCwgeCwgeSkgLT5cclxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgICAgcm9vbXMgPSBAZG9vckVsaWdpYmxlKG1hcCwgeCwgeSwgaSwgailcclxuICAgICAgICBpZiByb29tc1swXSAhPSAtMSBhbmQgQHJvb21pZCBpbiByb29tc1xyXG4gICAgICAgICAgcmV0dXJuIFtpLCBqXVxyXG4gICAgcmV0dXJuIFstMSwgLTFdXHJcblxyXG4gIG1lYXN1cmU6IChtYXAsIHgsIHkpIC0+XHJcbiAgICBiYm94VGVtcCA9IG1hcC5iYm94LmNsb25lKClcclxuICAgIGJib3hUZW1wLmV4cGFuZCBAcmVjdCh4LCB5KVxyXG4gICAgW2Jib3hUZW1wLmFyZWEoKSwgYmJveFRlbXAuc3F1YXJlbmVzcygpXVxyXG5cclxuICBmaW5kQmVzdFNwb3Q6IChtYXApIC0+XHJcbiAgICBtaW5TcXVhcmVuZXNzID0gTWF0aC5tYXggbWFwLndpZHRoLCBtYXAuaGVpZ2h0XHJcbiAgICBtaW5BcmVhID0gbWFwLndpZHRoICogbWFwLmhlaWdodFxyXG4gICAgbWluWCA9IC0xXHJcbiAgICBtaW5ZID0gLTFcclxuICAgIGRvb3JMb2NhdGlvbiA9IFstMSwgLTFdXHJcbiAgICBzZWFyY2hMID0gbWFwLmJib3gubCAtIEB3aWR0aFxyXG4gICAgc2VhcmNoUiA9IG1hcC5iYm94LnJcclxuICAgIHNlYXJjaFQgPSBtYXAuYmJveC50IC0gQGhlaWdodFxyXG4gICAgc2VhcmNoQiA9IG1hcC5iYm94LmJcclxuICAgIGZvciBpIGluIFtzZWFyY2hMIC4uLiBzZWFyY2hSXVxyXG4gICAgICBmb3IgaiBpbiBbc2VhcmNoVCAuLi4gc2VhcmNoQl1cclxuICAgICAgICBpZiBAZml0cyhtYXAsIGksIGopXHJcbiAgICAgICAgICBbYXJlYSwgc3F1YXJlbmVzc10gPSBAbWVhc3VyZSBtYXAsIGksIGpcclxuICAgICAgICAgIGlmIGFyZWEgPD0gbWluQXJlYSBhbmQgc3F1YXJlbmVzcyA8PSBtaW5TcXVhcmVuZXNzXHJcbiAgICAgICAgICAgIGxvY2F0aW9uID0gQGRvb3JMb2NhdGlvbiBtYXAsIGksIGpcclxuICAgICAgICAgICAgaWYgbG9jYXRpb25bMF0gIT0gLTFcclxuICAgICAgICAgICAgICBkb29yTG9jYXRpb24gPSBsb2NhdGlvblxyXG4gICAgICAgICAgICAgIG1pbkFyZWEgPSBhcmVhXHJcbiAgICAgICAgICAgICAgbWluU3F1YXJlbmVzcyA9IHNxdWFyZW5lc3NcclxuICAgICAgICAgICAgICBtaW5YID0gaVxyXG4gICAgICAgICAgICAgIG1pblkgPSBqXHJcbiAgICByZXR1cm4gW21pblgsIG1pblksIGRvb3JMb2NhdGlvbl1cclxuXHJcbmNsYXNzIFNoYXBlUm9vbVRlbXBsYXRlIGV4dGVuZHMgUm9vbVRlbXBsYXRlXHJcbiAgY29uc3RydWN0b3I6IChzaGFwZSwgcm9vbWlkKSAtPlxyXG4gICAgQGxpbmVzID0gc2hhcGUuc3BsaXQoXCJcXG5cIilcclxuICAgIHcgPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgdyA9IE1hdGgubWF4KHcsIGxpbmUubGVuZ3RoKVxyXG4gICAgQHdpZHRoID0gd1xyXG4gICAgQGhlaWdodCA9IEBsaW5lcy5sZW5ndGhcclxuICAgIHN1cGVyIEB3aWR0aCwgQGhlaWdodCwgcm9vbWlkXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIEBzZXQoaSwgaiwgRU1QVFkpXHJcbiAgICBpID0gMFxyXG4gICAgaiA9IDBcclxuICAgIGZvciBsaW5lIGluIEBsaW5lc1xyXG4gICAgICBmb3IgYyBpbiBsaW5lLnNwbGl0KFwiXCIpXHJcbiAgICAgICAgdiA9IHN3aXRjaCBjXHJcbiAgICAgICAgICB3aGVuICcuJyB0aGVuIEByb29taWRcclxuICAgICAgICAgIHdoZW4gJyMnIHRoZW4gV0FMTFxyXG4gICAgICAgICAgZWxzZSAwXHJcbiAgICAgICAgaWYgdlxyXG4gICAgICAgICAgQHNldChpLCBqLCB2KVxyXG4gICAgICAgIGkrK1xyXG4gICAgICBqKytcclxuICAgICAgaSA9IDBcclxuXHJcbmNsYXNzIFJvb21cclxuICBjb25zdHJ1Y3RvcjogKEByZWN0KSAtPlxyXG4gICAgIyBjb25zb2xlLmxvZyBcInJvb20gY3JlYXRlZCAje0ByZWN0fVwiXHJcblxyXG5jbGFzcyBNYXBcclxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHNlZWQpIC0+XHJcbiAgICBAcmFuZFJlc2V0KClcclxuICAgIEBncmlkID0gW11cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAZ3JpZFtpXSA9IFtdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBAZ3JpZFtpXVtqXSA9XHJcbiAgICAgICAgICB0eXBlOiBFTVBUWVxyXG4gICAgICAgICAgeDogaVxyXG4gICAgICAgICAgeTogalxyXG4gICAgQGJib3ggPSBuZXcgUmVjdCAwLCAwLCAwLCAwXHJcbiAgICBAcm9vbXMgPSBbXVxyXG5cclxuICByYW5kUmVzZXQ6IC0+XHJcbiAgICBAcm5nID0gc2VlZFJhbmRvbShAc2VlZClcclxuXHJcbiAgcmFuZDogKHYpIC0+XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihAcm5nKCkgKiB2KVxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0udHlwZSA9IHZcclxuXHJcbiAgZ2V0OiAoaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICByZXR1cm4gQGdyaWRbaV1bal0udHlwZVxyXG4gICAgcmV0dXJuIDBcclxuXHJcbiAgYWRkUm9vbTogKHJvb21UZW1wbGF0ZSwgeCwgeSkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJwbGFjaW5nIHJvb20gYXQgI3t4fSwgI3t5fVwiXHJcbiAgICByb29tVGVtcGxhdGUucGxhY2UgdGhpcywgeCwgeVxyXG4gICAgciA9IHJvb21UZW1wbGF0ZS5yZWN0KHgsIHkpXHJcbiAgICBAcm9vbXMucHVzaCBuZXcgUm9vbSByXHJcbiAgICBAYmJveC5leHBhbmQocilcclxuICAgICMgY29uc29sZS5sb2cgXCJuZXcgbWFwIGJib3ggI3tAYmJveH1cIlxyXG5cclxuICByYW5kb21Sb29tVGVtcGxhdGU6IChyb29taWQpIC0+XHJcbiAgICByID0gQHJhbmQoMTAwKVxyXG4gICAgc3dpdGNoXHJcbiAgICAgIHdoZW4gIDAgPCByIDwgMTAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSAzLCA1ICsgQHJhbmQoMTApLCByb29taWQgICAgICAgICAgICAgICAgICAjIHZlcnRpY2FsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMTAgPCByIDwgMjAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA1ICsgQHJhbmQoMTApLCAzLCByb29taWQgICAgICAgICAgICAgICAgICAjIGhvcml6b250YWwgY29ycmlkb3JcclxuICAgICAgd2hlbiAyMCA8IHIgPCAzMCB0aGVuIHJldHVybiBuZXcgU2hhcGVSb29tVGVtcGxhdGUgU0hBUEVTW0ByYW5kKFNIQVBFUy5sZW5ndGgpXSwgcm9vbWlkICMgcmFuZG9tIHNoYXBlIGZyb20gU0hBUEVTXHJcbiAgICByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA0ICsgQHJhbmQoNSksIDQgKyBAcmFuZCg1KSwgcm9vbWlkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGdlbmVyaWMgcmVjdGFuZ3VsYXIgcm9vbVxyXG5cclxuICBnZW5lcmF0ZVJvb206IChyb29taWQpIC0+XHJcbiAgICByb29tVGVtcGxhdGUgPSBAcmFuZG9tUm9vbVRlbXBsYXRlIHJvb21pZFxyXG4gICAgaWYgQHJvb21zLmxlbmd0aCA9PSAwXHJcbiAgICAgIHggPSBNYXRoLmZsb29yKChAd2lkdGggLyAyKSAtIChyb29tVGVtcGxhdGUud2lkdGggLyAyKSlcclxuICAgICAgeSA9IE1hdGguZmxvb3IoKEBoZWlnaHQgLyAyKSAtIChyb29tVGVtcGxhdGUuaGVpZ2h0IC8gMikpXHJcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxyXG4gICAgZWxzZVxyXG4gICAgICBbeCwgeSwgZG9vckxvY2F0aW9uXSA9IHJvb21UZW1wbGF0ZS5maW5kQmVzdFNwb3QodGhpcylcclxuICAgICAgaWYgeCA8IDBcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgcm9vbVRlbXBsYXRlLnNldCBkb29yTG9jYXRpb25bMF0sIGRvb3JMb2NhdGlvblsxXSwgMlxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGdlbmVyYXRlUm9vbXM6IChjb3VudCkgLT5cclxuICAgIGZvciBpIGluIFswLi4uY291bnRdXHJcbiAgICAgIHJvb21pZCA9IEZJUlNUX1JPT01fSUQgKyBpXHJcblxyXG4gICAgICBhZGRlZCA9IGZhbHNlXHJcbiAgICAgIHdoaWxlIG5vdCBhZGRlZFxyXG4gICAgICAgIGFkZGVkID0gQGdlbmVyYXRlUm9vbSByb29taWRcclxuXHJcbmdlbmVyYXRlID0gLT5cclxuICBtYXAgPSBuZXcgTWFwIDgwLCA4MCwgMTBcclxuICBtYXAuZ2VuZXJhdGVSb29tcygyMClcclxuICByZXR1cm4gbWFwXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgZ2VuZXJhdGU6IGdlbmVyYXRlXHJcbiAgRU1QVFk6IEVNUFRZXHJcbiAgV0FMTDogV0FMTFxyXG4gIERPT1I6RE9PUlxyXG4gIEZJUlNUX1JPT01fSUQ6IEZJUlNUX1JPT01fSURcclxuIiwiZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuXHJcbmNsYXNzIEJpbmFyeUhlYXBcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuXHJcbmNsYXNzIEZha2VIZWFwXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAbGlzdCA9IFtdXHJcblxyXG4gIHNvcnRMaXN0OiAtPlxyXG4gICAgQGxpc3Quc29ydCAoYSwgYikgLT5cclxuICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlXHJcblxyXG4gIHB1c2g6IChuKSAtPlxyXG4gICAgQGxpc3QucHVzaChuKVxyXG4gICAgQHNvcnRMaXN0KClcclxuXHJcbiAgc2l6ZTogLT5cclxuICAgIHJldHVybiBAbGlzdC5sZW5ndGhcclxuXHJcbiAgcG9wOiAtPlxyXG4gICAgcmV0dXJuIEBsaXN0LnNoaWZ0KClcclxuXHJcbiAgcmVzY29yZTogKG4pIC0+XHJcbiAgICBAc29ydExpc3QoKVxyXG5cclxuY2xhc3MgRGlqa3N0cmFcclxuICBjb25zdHJ1Y3RvcjogKEBmbG9vcikgLT5cclxuICAgIGZvciB4IGluIFswLi4uQGZsb29yLndpZHRoXVxyXG4gICAgICBmb3IgeSBpbiBbMC4uLkBmbG9vci5oZWlnaHRdXHJcbiAgICAgICAgbm9kZSA9IEBmbG9vci5ncmlkW3hdW3ldXHJcbiAgICAgICAgbm9kZS5kaXN0YW5jZSA9IDk5OTk5XHJcbiAgICAgICAgbm9kZS52aXNpdGVkID0gZmFsc2VcclxuICAgICAgICBub2RlLmhlYXBlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5wYXJlbnQgPSBudWxsXHJcblxyXG4gIGNyZWF0ZUhlYXA6IC0+XHJcbiAgICByZXR1cm4gbmV3IEZha2VIZWFwIChub2RlKSAtPlxyXG4gICAgICByZXR1cm4gbm9kZS5kaXN0YW5jZVxyXG5cclxuICBzZWFyY2g6IChzdGFydCwgZW5kKSAtPlxyXG4gICAgZ3JpZCA9IEBmbG9vci5ncmlkXHJcbiAgICBoZXVyaXN0aWMgPSBAbWFuaGF0dGFuXHJcblxyXG4gICAgc3RhcnQuZGlzdGFuY2UgPSAwXHJcblxyXG4gICAgaGVhcCA9IEBjcmVhdGVIZWFwKClcclxuICAgIGhlYXAucHVzaChzdGFydClcclxuICAgIHN0YXJ0LmhlYXBlZCA9IHRydWVcclxuXHJcbiAgICB3aGlsZSBoZWFwLnNpemUoKSA+IDBcclxuICAgICAgY3VycmVudE5vZGUgPSBoZWFwLnBvcCgpXHJcbiAgICAgIGN1cnJlbnROb2RlLnZpc2l0ZWQgPSB0cnVlXHJcblxyXG4gICAgICBpZiBjdXJyZW50Tm9kZSA9PSBlbmRcclxuICAgICAgICByZXQgPSBbXVxyXG4gICAgICAgIGN1cnIgPSBlbmRcclxuICAgICAgICB3aGlsZSBjdXJyLnBhcmVudFxyXG4gICAgICAgICAgcmV0LnB1c2goe3g6Y3Vyci54LCB5OmN1cnIueX0pXHJcbiAgICAgICAgICBjdXJyID0gY3Vyci5wYXJlbnRcclxuICAgICAgICByZXR1cm4gcmV0LnJldmVyc2UoKVxyXG5cclxuICAgICAgIyBGaW5kIGFsbCBuZWlnaGJvcnMgZm9yIHRoZSBjdXJyZW50IG5vZGUuXHJcbiAgICAgIG5laWdoYm9ycyA9IEBuZWlnaGJvcnMoZ3JpZCwgY3VycmVudE5vZGUpXHJcblxyXG4gICAgICBmb3IgbmVpZ2hib3IgaW4gbmVpZ2hib3JzXHJcbiAgICAgICAgaWYgbmVpZ2hib3IudmlzaXRlZCBvciAobmVpZ2hib3IudHlwZSA9PSBmbG9vcmdlbi5XQUxMKVxyXG4gICAgICAgICAgIyBOb3QgYSB2YWxpZCBub2RlIHRvIHByb2Nlc3MsIHNraXAgdG8gbmV4dCBuZWlnaGJvci5cclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICMgVGhlIGRpc3RhbmNlIGlzIHRoZSBzaG9ydGVzdCBkaXN0YW5jZSBmcm9tIHN0YXJ0IHRvIGN1cnJlbnQgbm9kZS5cclxuICAgICAgICAjIFdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlIHBhdGggd2UgaGF2ZSBhcnJpdmVkIGF0IHRoaXMgbmVpZ2hib3IgaXMgdGhlIHNob3J0ZXN0IG9uZSB3ZSBoYXZlIHNlZW4geWV0LlxyXG4gICAgICAgIG5laWdoYm9yRGlzdGFuY2VWaWFUaGlzTm9kZSA9IGN1cnJlbnROb2RlLmRpc3RhbmNlICsgMVxyXG4gICAgICAgIGlzRGlhZ29uYWwgPSAoY3VycmVudE5vZGUueCAhPSBuZWlnaGJvci54KSBhbmQgKGN1cnJlbnROb2RlLnkgIT0gbmVpZ2hib3IueSlcclxuICAgICAgICBpZiBpc0RpYWdvbmFsXHJcbiAgICAgICAgICBuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGUgKz0gMC4xXHJcblxyXG4gICAgICAgIGlmIChuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGUgPCBuZWlnaGJvci5kaXN0YW5jZSkgYW5kIG5vdCBuZWlnaGJvci52aXNpdGVkXHJcbiAgICAgICAgICAjIEZvdW5kIGFuIG9wdGltYWwgKHNvIGZhcikgcGF0aCB0byB0aGlzIG5vZGUuXHJcbiAgICAgICAgICBuZWlnaGJvci5kaXN0YW5jZSA9IG5laWdoYm9yRGlzdGFuY2VWaWFUaGlzTm9kZVxyXG4gICAgICAgICAgbmVpZ2hib3IucGFyZW50ID0gY3VycmVudE5vZGVcclxuICAgICAgICAgIGlmIG5laWdoYm9yLmhlYXBlZFxyXG4gICAgICAgICAgICBoZWFwLnJlc2NvcmUobmVpZ2hib3IpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhlYXAucHVzaChuZWlnaGJvcilcclxuICAgICAgICAgICAgbmVpZ2hib3IuaGVhcGVkID0gdHJ1ZVxyXG5cclxuICAgIHJldHVybiBbXVxyXG5cclxuICBuZWlnaGJvcnM6IChncmlkLCBub2RlKSAtPlxyXG4gICAgcmV0ID0gW11cclxuICAgIHggPSBub2RlLnhcclxuICAgIHkgPSBub2RlLnlcclxuXHJcbiAgICAjIFNvdXRod2VzdFxyXG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beS0xXVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beS0xXSlcclxuXHJcbiAgICAjIFNvdXRoZWFzdFxyXG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beS0xXVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beS0xXSlcclxuXHJcbiAgICAjIE5vcnRod2VzdFxyXG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beSsxXVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beSsxXSlcclxuXHJcbiAgICAjIE5vcnRoZWFzdFxyXG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beSsxXVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beSsxXSlcclxuXHJcbiAgICAjIFdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ldXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5XSlcclxuXHJcbiAgICAjIEVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ldXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5XSlcclxuXHJcbiAgICAjIFNvdXRoXHJcbiAgICBpZiBncmlkW3hdIGFuZCBncmlkW3hdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5LTFdKVxyXG5cclxuICAgICMgTm9ydGhcclxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beSsxXVxyXG4gICAgICByZXQucHVzaChncmlkW3hdW3krMV0pXHJcblxyXG4gICAgcmV0dXJuIHJldFxyXG5cclxuY2xhc3MgUGF0aGZpbmRlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGZsb29yLCBAZmxhZ3MpIC0+XHJcblxyXG4gIGNhbGM6IChzdGFydFgsIHN0YXJ0WSwgZGVzdFgsIGRlc3RZKSAtPlxyXG4gICAgZGlqa3N0cmEgPSBuZXcgRGlqa3N0cmEgQGZsb29yXHJcbiAgICByZXR1cm4gZGlqa3N0cmEuc2VhcmNoKEBmbG9vci5ncmlkW3N0YXJ0WF1bc3RhcnRZXSwgQGZsb29yLmdyaWRbZGVzdFhdW2Rlc3RZXSlcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGF0aGZpbmRlclxyXG4iXX0=
;