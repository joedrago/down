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

},{}],"AM6k+y":[function(require,module,exports){
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


},{}],"base/mode":[function(require,module,exports){
module.exports=require('AM6k+y');
},{}],6:[function(require,module,exports){
if (typeof document !== "undefined" && document !== null) {
  require('boot/mainweb');
} else {
  require('boot/maindroid');
}


},{"boot/maindroid":"AZOlAX","boot/mainweb":"SDfhK2"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('AZOlAX');
},{}],"AZOlAX":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"mI1n3g"}],"SDfhK2":[function(require,module,exports){
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


},{"config":"JGrjkC","main":"mI1n3g","resources":"QhI8mQ"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('SDfhK2');
},{}],"KP5Dsq":[function(require,module,exports){
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
module.exports=require('KP5Dsq');
},{}],"brain/player":[function(require,module,exports){
module.exports=require('4QsuCs');
},{}],"4QsuCs":[function(require,module,exports){
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


},{"brain/brain":"KP5Dsq","gfx/tilesheet":"UnLsem","resources":"QhI8mQ","world/pathfinder":"D6mz5K"}],"config":[function(require,module,exports){
module.exports=require('JGrjkC');
},{}],"JGrjkC":[function(require,module,exports){
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


},{}],"4zBf9r":[function(require,module,exports){
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
module.exports=require('4zBf9r');
},{}],"UnLsem":[function(require,module,exports){
var PIXEL_FUDGE_FACTOR, SCALE_FUDGE_FACTOR, Tilesheet, TilesheetBatchNode;

PIXEL_FUDGE_FACTOR = 0.5;

SCALE_FUDGE_FACTOR = 0.02;

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
  function Tilesheet(resource, width, height, stride) {
    this.resource = resource;
    this.width = width;
    this.height = height;
    this.stride = stride;
    this.adjustedScale = {
      x: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / this.width),
      y: 1 + SCALE_FUDGE_FACTOR + (PIXEL_FUDGE_FACTOR / this.height)
    };
  }

  Tilesheet.prototype.rect = function(v) {
    var x, y;
    y = Math.floor(v / this.stride);
    x = v % this.stride;
    return cc.rect(x * this.width, y * this.height, this.width - PIXEL_FUDGE_FACTOR, this.height - PIXEL_FUDGE_FACTOR);
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


},{}],"gfx/tilesheet":[function(require,module,exports){
module.exports=require('UnLsem');
},{}],"main":[function(require,module,exports){
module.exports=require('mI1n3g');
},{}],"mI1n3g":[function(require,module,exports){
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


},{"brain/player":"4QsuCs","config":"JGrjkC","mode/game":"WdGIGe","mode/intro":"BBKnc8","resources":"QhI8mQ","world/floorgen":"jH3oIX"}],"WdGIGe":[function(require,module,exports){
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
        return 16;
      case v !== floorgen.DOOR:
        return 5;
      case !(v >= floorgen.FIRST_ROOM_ID):
        return 1;
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


},{"base/mode":"AM6k+y","config":"JGrjkC","resources":"QhI8mQ","world/floorgen":"jH3oIX","world/pathfinder":"D6mz5K"}],"mode/game":[function(require,module,exports){
module.exports=require('WdGIGe');
},{}],"BBKnc8":[function(require,module,exports){
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


},{"base/mode":"AM6k+y","resources":"QhI8mQ"}],"mode/intro":[function(require,module,exports){
module.exports=require('BBKnc8');
},{}],"resources":[function(require,module,exports){
module.exports=require('QhI8mQ');
},{}],"QhI8mQ":[function(require,module,exports){
var Tilesheet, images, k, tilesheets, v;

Tilesheet = require("gfx/tilesheet");

images = {
  splashscreen: 'res/splashscreen.png',
  tiles0: 'res/tiles0.png',
  player: 'res/player.png'
};

tilesheets = {
  tiles0: new Tilesheet(images.tiles0, 32, 32, 16),
  player: new Tilesheet(images.player, 24, 28, 18)
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


},{"gfx/tilesheet":"UnLsem"}],"world/floor":[function(require,module,exports){
module.exports=require('ciOLZ1');
},{}],"ciOLZ1":[function(require,module,exports){
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


},{"gfx":"4zBf9r","resources":"QhI8mQ"}],"jH3oIX":[function(require,module,exports){
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
module.exports=require('jH3oIX');
},{}],"D6mz5K":[function(require,module,exports){
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


},{"world/floorgen":"jH3oIX"}],"world/pathfinder":[function(require,module,exports){
module.exports=require('D6mz5K');
},{}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1QixpQkFBdkI7O0FBRUEsQ0FGQSxDQUVlLENBQUYsRUFBUSxDQUFSLElBQWI7Q0FBNkIsQ0FDM0IsQ0FBTSxDQUFOLEtBQVE7Q0FDTixFQURNLENBQUQ7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxHQUVBLFdB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Q0FBTSxDQUFBLEdBQUM7Q0FDTCxPQUFBO0NBQUEsRUFBZSxDQUFmLENBQWUsR0FBZjtDQUNBLENBQW9ELEVBQTVCLENBQUssQ0FBdEIsRUFBUSxHQUFSO0NBSlQsRUFFTTs7Q0FGTjs7Q0FqSUY7O0FBdUlBLENBdklBLEVBdUlpQixHQUFYLENBQU4sR0F2SUEiLCJzb3VyY2VzQ29udGVudCI6W251bGwsIlxuLy8gbm90IGltcGxlbWVudGVkXG4vLyBUaGUgcmVhc29uIGZvciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307J3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHdpZHRoID0gMjU2Oy8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcclxudmFyIGNodW5rcyA9IDY7Ly8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxyXG52YXIgZGlnaXRzID0gNTI7Ly8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxyXG52YXIgcG9vbCA9IFtdOy8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcclxudmFyIEdMT0JBTCA9IHR5cGVvZiBnbG9iYWwgPT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsO1xyXG5cclxuLy9cclxuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxyXG4vL1xyXG52YXIgc3RhcnRkZW5vbSA9IE1hdGgucG93KHdpZHRoLCBjaHVua3MpLFxyXG4gICAgc2lnbmlmaWNhbmNlID0gTWF0aC5wb3coMiwgZGlnaXRzKSxcclxuICAgIG92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMixcclxuICAgIG1hc2sgPSB3aWR0aCAtIDE7XHJcblxyXG5cclxudmFyIG9sZFJhbmRvbSA9IE1hdGgucmFuZG9tO1xyXG5cclxuLy9cclxuLy8gc2VlZHJhbmRvbSgpXHJcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxyXG4vL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlZWQsIG9wdGlvbnMpIHtcclxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmdsb2JhbCA9PT0gdHJ1ZSkge1xyXG4gICAgb3B0aW9ucy5nbG9iYWwgPSBmYWxzZTtcclxuICAgIE1hdGgucmFuZG9tID0gbW9kdWxlLmV4cG9ydHMoc2VlZCwgb3B0aW9ucyk7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IHRydWU7XHJcbiAgICByZXR1cm4gTWF0aC5yYW5kb207XHJcbiAgfVxyXG4gIHZhciB1c2VfZW50cm9weSA9IChvcHRpb25zICYmIG9wdGlvbnMuZW50cm9weSkgfHwgZmFsc2U7XHJcbiAgdmFyIGtleSA9IFtdO1xyXG5cclxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cclxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXHJcbiAgICB1c2VfZW50cm9weSA/IFtzZWVkLCB0b3N0cmluZyhwb29sKV0gOlxyXG4gICAgMCBpbiBhcmd1bWVudHMgPyBzZWVkIDogYXV0b3NlZWQoKSwgMyksIGtleSk7XHJcblxyXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxyXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcclxuXHJcbiAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cclxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XHJcblxyXG4gIC8vIE92ZXJyaWRlIE1hdGgucmFuZG9tXHJcblxyXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcclxuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24oKSB7ICAgICAgICAgLy8gQ2xvc3VyZSB0byByZXR1cm4gYSByYW5kb20gZG91YmxlOlxyXG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XHJcbiAgICAgICAgZCA9IHN0YXJ0ZGVub20sICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxyXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXHJcbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcclxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxyXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXHJcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxyXG4gICAgfVxyXG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcclxuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXHJcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgTWF0aCB1bnRpbFxyXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cclxuICAgIH1cclxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxyXG4gIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5yZXNldEdsb2JhbCA9IGZ1bmN0aW9uICgpIHtcclxuICBNYXRoLnJhbmRvbSA9IG9sZFJhbmRvbTtcclxufTtcclxuXHJcbi8vXHJcbi8vIEFSQzRcclxuLy9cclxuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxyXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cclxuLy9cclxuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcclxuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxyXG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXHJcbi8vXHJcbi8qKiBAY29uc3RydWN0b3IgKi9cclxuZnVuY3Rpb24gQVJDNChrZXkpIHtcclxuICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcclxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcclxuXHJcbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cclxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XHJcblxyXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXHJcbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xyXG4gICAgc1tpXSA9IGkrKztcclxuICB9XHJcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcclxuICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XHJcbiAgICBzW2pdID0gdDtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cclxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAvLyBVc2luZyBpbnN0YW5jZSBtZW1iZXJzIGluc3RlYWQgb2YgY2xvc3VyZSBzdGF0ZSBuZWFybHkgZG91YmxlcyBzcGVlZC5cclxuICAgIHZhciB0LCByID0gMCxcclxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xyXG4gICAgd2hpbGUgKGNvdW50LS0pIHtcclxuICAgICAgdCA9IHNbaSA9IG1hc2sgJiAoaSArIDEpXTtcclxuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XHJcbiAgICB9XHJcbiAgICBtZS5pID0gaTsgbWUuaiA9IGo7XHJcbiAgICByZXR1cm4gcjtcclxuICAgIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLlxyXG4gICAgLy8gU2VlIGh0dHA6Ly93d3cucnNhLmNvbS9yc2FsYWJzL25vZGUuYXNwP2lkPTIwMDlcclxuICB9KSh3aWR0aCk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGZsYXR0ZW4oKVxyXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXHJcbi8vXHJcbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xyXG4gIHZhciByZXN1bHQgPSBbXSwgdHlwID0gKHR5cGVvZiBvYmopWzBdLCBwcm9wO1xyXG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ28nKSB7XHJcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzJyA/IG9iaiA6IG9iaiArICdcXDAnKTtcclxufVxyXG5cclxuLy9cclxuLy8gbWl4a2V5KClcclxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxyXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cclxuLy9cclxuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSkge1xyXG4gIHZhciBzdHJpbmdzZWVkID0gc2VlZCArICcnLCBzbWVhciwgaiA9IDA7XHJcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xyXG4gICAga2V5W21hc2sgJiBqXSA9XHJcbiAgICAgIG1hc2sgJiAoKHNtZWFyIF49IGtleVttYXNrICYgal0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKSk7XHJcbiAgfVxyXG4gIHJldHVybiB0b3N0cmluZyhrZXkpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBhdXRvc2VlZCgpXHJcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBpZiBhdmFpbGFibGUuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge1VpbnQ4QXJyYXk9fSBzZWVkICovXHJcbmZ1bmN0aW9uIGF1dG9zZWVkKHNlZWQpIHtcclxuICB0cnkge1xyXG4gICAgR0xPQkFMLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoc2VlZCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKSk7XHJcbiAgICByZXR1cm4gdG9zdHJpbmcoc2VlZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIEdMT0JBTCwgR0xPQkFMLm5hdmlnYXRvciAmJiBHTE9CQUwubmF2aWdhdG9yLnBsdWdpbnMsXHJcbiAgICAgICAgICAgIEdMT0JBTC5zY3JlZW4sIHRvc3RyaW5nKHBvb2wpXTtcclxuICB9XHJcbn1cclxuXHJcbi8vXHJcbi8vIHRvc3RyaW5nKClcclxuLy8gQ29udmVydHMgYW4gYXJyYXkgb2YgY2hhcmNvZGVzIHRvIGEgc3RyaW5nXHJcbi8vXHJcbmZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcclxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcclxufVxyXG5cclxuLy9cclxuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcclxuLy8gZnJvbSB0aGUgYnVpbHQtaW4gUk5HIGludG8gdGhlIGVudHJvcHkgcG9vbC4gIEJlY2F1c2Ugd2UgZG9cclxuLy8gbm90IHdhbnQgdG8gaW50ZWZlcmUgd2l0aCBkZXRlcm1pbnN0aWMgUFJORyBzdGF0ZSBsYXRlcixcclxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIE1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcclxuLy8gaW5pdGlhbGl6YXRpb24uXHJcbi8vXHJcbm1peGtleShNYXRoLnJhbmRvbSgpLCBwb29sKTtcclxuIiwiIyBob3cgbWFueSBwaXhlbHMgY2FuIHlvdSBkcmFnIGJlZm9yZSBpdCBpcyBhY3R1YWxseSBjb25zaWRlcmVkIGEgZHJhZ1xyXG5FTkdBR0VfRFJBR19ESVNUQU5DRSA9IDMwXHJcblxyXG5JbnB1dExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcclxuICAgIEBzZXRNb3VzZUVuYWJsZWQodHJ1ZSlcclxuICAgIEB0cmFja2VkVG91Y2hlcyA9IFtdXHJcblxyXG4gIGNhbGNEaXN0YW5jZTogKHgxLCB5MSwgeDIsIHkyKSAtPlxyXG4gICAgZHggPSB4MiAtIHgxXHJcbiAgICBkeSA9IHkyIC0geTFcclxuICAgIHJldHVybiBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxuXHJcbiAgc2V0RHJhZ1BvaW50OiAtPlxyXG4gICAgQGRyYWdYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgIEBkcmFnWSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gIGNhbGNQaW5jaEFuY2hvcjogLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBAcGluY2hYID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnggKyBAdHJhY2tlZFRvdWNoZXNbMV0ueCkgLyAyKVxyXG4gICAgICBAcGluY2hZID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnkgKyBAdHJhY2tlZFRvdWNoZXNbMV0ueSkgLyAyKVxyXG4gICAgICAjIGNjLmxvZyBcInBpbmNoIGFuY2hvciBzZXQgYXQgI3tAcGluY2hYfSwgI3tAcGluY2hZfVwiXHJcblxyXG4gIGFkZFRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBmb3IgdCBpbiBAdHJhY2tlZFRvdWNoZXNcclxuICAgICAgaWYgdC5pZCA9PSBpZFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgQHRyYWNrZWRUb3VjaGVzLnB1c2gge1xyXG4gICAgICBpZDogaWRcclxuICAgICAgeDogeFxyXG4gICAgICB5OiB5XHJcbiAgICB9XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDJcclxuICAgICAgIyBXZSBqdXN0IGFkZGVkIGEgc2Vjb25kIHRvdWNoIHNwb3QuIENhbGN1bGF0ZSB0aGUgYW5jaG9yIGZvciBwaW5jaGluZyBub3dcclxuICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAjY2MubG9nIFwiYWRkaW5nIHRvdWNoICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICByZW1vdmVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICAgIGlmIGluZGV4IDwgMlxyXG4gICAgICAgICMgV2UganVzdCBmb3Jnb3Qgb25lIG9mIG91ciBwaW5jaCB0b3VjaGVzLiBQaWNrIGEgbmV3IGFuY2hvciBzcG90LlxyXG4gICAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgICAjY2MubG9nIFwiZm9yZ2V0dGluZyBpZCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgdXBkYXRlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueCA9IHhcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS55ID0geVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEBkcmFnZ2luZyA9IGZhbHNlXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAYWRkVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPiAxXHJcbiAgICAgICMgVGhleSdyZSBwaW5jaGluZywgZG9uJ3QgZXZlbiBib3RoZXIgdG8gZW1pdCBhIGNsaWNrXHJcbiAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuXHJcbiAgb25Ub3VjaGVzTW92ZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIHByZXZEaXN0YW5jZSA9IDBcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBwcmV2RGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIHByZXZYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgICAgcHJldlkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEB1cGRhdGVUb3VjaCh0LmdldElkKCksIHBvcy54LCBwb3MueSlcclxuXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgIyBzaW5nbGUgdG91Y2gsIGNvbnNpZGVyIGRyYWdnaW5nXHJcbiAgICAgIGRyYWdEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UgQGRyYWdYLCBAZHJhZ1ksIEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG4gICAgICBpZiBAZHJhZ2dpbmcgb3IgKGRyYWdEaXN0YW5jZSA+IEVOR0FHRV9EUkFHX0RJU1RBTkNFKVxyXG4gICAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuICAgICAgICBpZiBkcmFnRGlzdGFuY2UgPiAwLjVcclxuICAgICAgICAgIGR4ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnggLSBAZHJhZ1hcclxuICAgICAgICAgIGR5ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnkgLSBAZHJhZ1lcclxuICAgICAgICAgICNjYy5sb2cgXCJzaW5nbGUgZHJhZzogI3tkeH0sICN7ZHl9XCJcclxuICAgICAgICAgIEBtb2RlLm9uRHJhZyhkeCwgZHkpXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcblxyXG4gICAgZWxzZSBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgIyBhdCBsZWFzdCB0d28gZmluZ2VycyBwcmVzZW50LCBjaGVjayBmb3IgcGluY2gvem9vbVxyXG4gICAgICBjdXJyRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgICBkZWx0YURpc3RhbmNlID0gY3VyckRpc3RhbmNlIC0gcHJldkRpc3RhbmNlXHJcbiAgICAgIGlmIGRlbHRhRGlzdGFuY2UgIT0gMFxyXG4gICAgICAgICNjYy5sb2cgXCJkaXN0YW5jZSBkcmFnZ2VkIGFwYXJ0OiAje2RlbHRhRGlzdGFuY2V9IFthbmNob3I6ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1dXCJcclxuICAgICAgICBAbW9kZS5vblpvb20oQHBpbmNoWCwgQHBpbmNoWSwgZGVsdGFEaXN0YW5jZSlcclxuXHJcbiAgb25Ub3VjaGVzRW5kZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMSBhbmQgbm90IEBkcmFnZ2luZ1xyXG4gICAgICBwb3MgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKClcclxuICAgICAgI2NjLmxvZyBcImNsaWNrIGF0ICN7cG9zLnh9LCAje3Bvcy55fVwiXHJcbiAgICAgIEBtb2RlLm9uQ2xpY2socG9zLngsIHBvcy55KVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHJlbW92ZVRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcblxyXG4gIG9uU2Nyb2xsV2hlZWw6IChldikgLT5cclxuICAgIHBvcyA9IGV2LmdldExvY2F0aW9uKClcclxuICAgIEBtb2RlLm9uWm9vbShwb3MueCwgcG9zLnksIGV2LmdldFdoZWVsRGVsdGEoKSlcclxufVxyXG5cclxuR2Z4TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG59XHJcblxyXG5Nb2RlU2NlbmUgPSBjYy5TY2VuZS5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG5cclxuICAgIEBpbnB1dCA9IG5ldyBJbnB1dExheWVyKClcclxuICAgIEBpbnB1dC5pbml0KEBtb2RlKVxyXG4gICAgQGFkZENoaWxkKEBpbnB1dClcclxuXHJcbiAgICBAZ2Z4ID0gbmV3IEdmeExheWVyKClcclxuICAgIEBnZnguaW5pdCgpXHJcbiAgICBAYWRkQ2hpbGQoQGdmeClcclxuXHJcbiAgb25FbnRlcjogLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQG1vZGUub25BY3RpdmF0ZSgpXHJcbn1cclxuXHJcbmNsYXNzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogKEBuYW1lKSAtPlxyXG4gICAgQHNjZW5lID0gbmV3IE1vZGVTY2VuZSgpXHJcbiAgICBAc2NlbmUuaW5pdCh0aGlzKVxyXG4gICAgQHNjZW5lLnJldGFpbigpXHJcblxyXG4gIGFjdGl2YXRlOiAtPlxyXG4gICAgY2MubG9nIFwiYWN0aXZhdGluZyBtb2RlICN7QG5hbWV9XCJcclxuICAgIGlmIGNjLnNhd09uZVNjZW5lP1xyXG4gICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnBvcFNjZW5lKClcclxuICAgIGVsc2VcclxuICAgICAgY2Muc2F3T25lU2NlbmUgPSB0cnVlXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnB1c2hTY2VuZShAc2NlbmUpXHJcblxyXG4gIGFkZDogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZnguYWRkQ2hpbGQob2JqKVxyXG5cclxuICByZW1vdmU6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LnJlbW92ZUNoaWxkKG9iailcclxuXHJcbiAgIyB0byBiZSBvdmVycmlkZGVuIGJ5IGRlcml2ZWQgTW9kZXNcclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gIG9uWm9vbTogKHgsIHksIGRlbHRhKSAtPlxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZVxyXG4iLCJpZiBkb2N1bWVudD9cclxuICByZXF1aXJlICdib290L21haW53ZWInXHJcbmVsc2VcclxuICByZXF1aXJlICdib290L21haW5kcm9pZCdcclxuIiwicmVxdWlyZSAnanNiLmpzJ1xyXG5yZXF1aXJlICdtYWluJ1xyXG5cclxubnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKClcclxubnVsbFNjZW5lLmluaXQoKVxyXG5jYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJ1bldpdGhTY2VuZShudWxsU2NlbmUpXHJcbmNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxyXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcblxyXG5jb2NvczJkQXBwID0gY2MuQXBwbGljYXRpb24uZXh0ZW5kIHtcclxuICBjb25maWc6IGNvbmZpZ1xyXG4gIGN0b3I6IChzY2VuZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgY2MuQ09DT1MyRF9ERUJVRyA9IEBjb25maWdbJ0NPQ09TMkRfREVCVUcnXVxyXG4gICAgY2MuaW5pdERlYnVnU2V0dGluZygpXHJcbiAgICBjYy5zZXR1cChAY29uZmlnWyd0YWcnXSlcclxuICAgIGNjLkFwcENvbnRyb2xsZXIuc2hhcmVBcHBDb250cm9sbGVyKCkuZGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnMoKVxyXG5cclxuICBhcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogLT5cclxuICAgICAgaWYgY2MuUmVuZGVyRG9lc25vdFN1cHBvcnQoKVxyXG4gICAgICAgICAgIyBzaG93IEluZm9ybWF0aW9uIHRvIHVzZXJcclxuICAgICAgICAgIGFsZXJ0IFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIlxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAjIGluaXRpYWxpemUgZGlyZWN0b3JcclxuICAgICAgZGlyZWN0b3IgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpXHJcblxyXG4gICAgICBjYy5FR0xWaWV3LmdldEluc3RhbmNlKCkuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoMTI4MCwgNzIwLCBjYy5SRVNPTFVUSU9OX1BPTElDWS5TSE9XX0FMTClcclxuXHJcbiAgICAgICMgdHVybiBvbiBkaXNwbGF5IEZQU1xyXG4gICAgICBkaXJlY3Rvci5zZXREaXNwbGF5U3RhdHMgQGNvbmZpZ1snc2hvd0ZQUyddXHJcblxyXG4gICAgICAjIHNldCBGUFMuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIDEuMC82MCBpZiB5b3UgZG9uJ3QgY2FsbCB0aGlzXHJcbiAgICAgIGRpcmVjdG9yLnNldEFuaW1hdGlvbkludGVydmFsIDEuMCAvIEBjb25maWdbJ2ZyYW1lUmF0ZSddXHJcblxyXG4gICAgICAjIGxvYWQgcmVzb3VyY2VzXHJcbiAgICAgIHJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuICAgICAgY2MuTG9hZGVyU2NlbmUucHJlbG9hZChyZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCwgLT5cclxuICAgICAgICByZXF1aXJlICdtYWluJ1xyXG4gICAgICAgIG51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpO1xyXG4gICAgICAgIG51bGxTY2VuZS5pbml0KClcclxuICAgICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJlcGxhY2VTY2VuZShudWxsU2NlbmUpXHJcbiMgICAgICAgIGNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxyXG4gICAgICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXHJcbiAgICAgIHRoaXMpXHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKClcclxuIiwiY2xhc3MgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKEB0aWxlcywgQGFuaW1GcmFtZSkgLT5cclxuICAgIEBmYWNpbmdSaWdodCA9IHRydWVcclxuICAgIEBjZCA9IDBcclxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxyXG4gICAgQHBhdGggPSBbXVxyXG5cclxuICBtb3ZlOiAoZ3gsIGd5LCBmcmFtZXMpIC0+XHJcbiAgICBAaW50ZXJwRnJhbWVzID0gW11cclxuICAgIGR4ID0gKEB4IC0gZ3gpICogY2MudW5pdFNpemVcclxuICAgIGR5ID0gKEB5IC0gZ3kpICogY2MudW5pdFNpemVcclxuICAgIEBmYWNpbmdSaWdodCA9IChkeCA8IDApXHJcbiAgICBpID0gZnJhbWVzLmxlbmd0aFxyXG4gICAgZm9yIGYgaW4gZnJhbWVzXHJcbiAgICAgIGFuaW1GcmFtZSA9IHtcclxuICAgICAgICB4OiBkeCAqIGkgLyBmcmFtZXMubGVuZ3RoXHJcbiAgICAgICAgeTogZHkgKiBpIC8gZnJhbWVzLmxlbmd0aFxyXG4gICAgICAgIGFuaW1GcmFtZTogZlxyXG4gICAgICB9XHJcbiAgICAgIEBpbnRlcnBGcmFtZXMucHVzaCBhbmltRnJhbWVcclxuICAgICAgaS0tXHJcblxyXG4gICAgY2MuZ2FtZS5zZXRUdXJuRnJhbWVzKGZyYW1lcy5sZW5ndGgpXHJcblxyXG4gICAgIyBJbW1lZGlhdGVseSBtb3ZlLCBvbmx5IHByZXRlbmQgdG8gYW5pbWF0ZSB0aGVyZSBvdmVyIHRoZSBuZXh0IGZyYW1lcy5sZW5ndGggZnJhbWVzXHJcbiAgICBAeCA9IGd4XHJcbiAgICBAeSA9IGd5XHJcblxyXG4gIHdhbGtQYXRoOiAoQHBhdGgpIC0+XHJcblxyXG4gIGNyZWF0ZVNwcml0ZTogLT5cclxuICAgIHMgPSBjYy5TcHJpdGUuY3JlYXRlIEB0aWxlcy5yZXNvdXJjZVxyXG4gICAgQHVwZGF0ZVNwcml0ZShzKVxyXG4gICAgcmV0dXJuIHNcclxuXHJcbiAgdXBkYXRlU3ByaXRlOiAoc3ByaXRlKSAtPlxyXG4gICAgeCA9IEB4ICogY2MudW5pdFNpemVcclxuICAgIHkgPSBAeSAqIGNjLnVuaXRTaXplXHJcbiAgICBhbmltRnJhbWUgPSBAYW5pbUZyYW1lXHJcbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aFxyXG4gICAgICBmcmFtZSA9IEBpbnRlcnBGcmFtZXMuc3BsaWNlKDAsIDEpWzBdXHJcbiAgICAgIHggKz0gZnJhbWUueFxyXG4gICAgICB5ICs9IGZyYW1lLnlcclxuICAgICAgYW5pbUZyYW1lID0gZnJhbWUuYW5pbUZyYW1lXHJcbiAgICAjIGVsc2VcclxuICAgICMgICBhbmltRnJhbWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKVxyXG4gICAgc3ByaXRlLnNldFRleHR1cmVSZWN0KEB0aWxlcy5yZWN0KGFuaW1GcmFtZSkpXHJcbiAgICBzcHJpdGUuc2V0UG9zaXRpb24oY2MucCh4LCB5KSlcclxuICAgIHhhbmNob3IgPSAxLjBcclxuICAgIHhzY2FsZSA9IC0xLjBcclxuICAgIGlmIEBmYWNpbmdSaWdodFxyXG4gICAgICB4YW5jaG9yID0gMFxyXG4gICAgICB4c2NhbGUgPSAxLjBcclxuICAgIHNwcml0ZS5zZXRTY2FsZVgoeHNjYWxlKVxyXG4gICAgc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoeGFuY2hvciwgMCkpXHJcblxyXG4gIHRha2VTdGVwOiAtPlxyXG4gICAgaWYgQGludGVycEZyYW1lcy5sZW5ndGggPT0gMFxyXG4gICAgICBpZiBAcGF0aC5sZW5ndGggPiAwXHJcbiAgICAgICAgc3RlcCA9IEBwYXRoLnNwbGljZSgwLCAxKVswXVxyXG4gICAgICAgICMgY2MubG9nIFwidGFraW5nIHN0ZXAgdG8gI3tzdGVwLnh9LCAje3N0ZXAueX1cIlxyXG4gICAgICAgIEBtb3ZlKHN0ZXAueCwgc3RlcC55LCBbMiwzLDRdKVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgdGljazogKGVsYXBzZWRUdXJucykgLT5cclxuICAgIGlmIEBjZCA+IDBcclxuICAgICAgQGNkIC09IGVsYXBzZWRUdXJucyBpZiBAY2QgPiAwXHJcbiAgICAgIEBjZCA9IDAgaWYgQGNkIDwgMFxyXG4gICAgaWYgQGNkID09IDBcclxuICAgICAgQHRoaW5rKClcclxuXHJcbiAgdGhpbms6IC0+XHJcbiAgICBjYy5sb2cgXCJ0aGluayBub3QgaW1wbGVtZW50ZWQhXCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnJhaW5cclxuIiwicmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5CcmFpbiA9IHJlcXVpcmUgJ2JyYWluL2JyYWluJ1xyXG5QYXRoZmluZGVyID0gcmVxdWlyZSAnd29ybGQvcGF0aGZpbmRlcidcclxuVGlsZXNoZWV0ID0gcmVxdWlyZSAnZ2Z4L3RpbGVzaGVldCdcclxuXHJcbmNsYXNzIFBsYXllciBleHRlbmRzIEJyYWluXHJcbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxyXG4gICAgQGFuaW1GcmFtZSA9IDBcclxuICAgIGZvciBrLHYgb2YgZGF0YVxyXG4gICAgICB0aGlzW2tdID0gdlxyXG4gICAgc3VwZXIgcmVzb3VyY2VzLnRpbGVzaGVldHMucGxheWVyLCBAYW5pbUZyYW1lXHJcblxyXG4gIHdhbGtQYXRoOiAoQHBhdGgpIC0+XHJcblxyXG4gIHRoaW5rOiAtPlxyXG4gICAgaWYgQHRha2VTdGVwKClcclxuICAgICAgQGNkID0gNTBcclxuXHJcbiAgYWN0OiAoZ3gsIGd5KSAtPlxyXG4gICAgcGF0aGZpbmRlciA9IG5ldyBQYXRoZmluZGVyKGNjLmdhbWUuY3VycmVudEZsb29yKCksIDApXHJcbiAgICBwYXRoID0gcGF0aGZpbmRlci5jYWxjKEB4LCBAeSwgZ3gsIGd5KVxyXG4gICAgQHdhbGtQYXRoKHBhdGgpXHJcbiAgICBjYy5sb2cgXCJwYXRoIGlzICN7cGF0aC5sZW5ndGh9IGxvbmdcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gICMgY3JhcCBub2JvZHkgc2hvdWxkIGV2ZXIgaGF2ZSB0byBjaGFuZ2VcclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjYwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcblxyXG4gICMgVGhlIHNpemUgb2Ygb25lIHVuaXQgd29ydGggb2YgdGlsZS4gUHJldHR5IG11Y2ggY29udHJvbHMgYWxsIHJlbmRlcmluZywgY2xpY2sgaGFuZGxpbmcsIGV0Yy5cclxuICB1bml0U2l6ZTogMzJcclxuXHJcbiAgIyB6b29tIGluL291dCBib3VuZHMuIEEgc2NhbGUgb2YgMS4wIGlzIDE6MSBwaXhlbCB0byBcImRlc2lnbiBkaW1lbnNpb25zXCIgKGN1cnJlbnRseSAxMjgweDcyMCB2aWV3KS5cclxuICAjIFNjYWxlIHNwZWVkIGlzIHRoZSBkZW5vbWluYXRvciBmb3IgYWRqdXN0aW5nIHRoZSBjdXJyZW50IHNjYWxlLiBUaGUgbWF0aDpcclxuICAjIHNjYWxlICs9IHpvb21EZWx0YSAvIHNjYWxlLnNwZWVkXHJcbiAgIyB6b29tRGVsdGEgaXMgdGhlIGRpc3RhbmNlIGluIHBpeGVscyBhZGRlZC9yZW1vdmVkIGJldHdlZW4geW91ciBmaW5nZXJzIG9uIHlvdXIgcGhvbmUgc2NyZWVuLlxyXG4gICMgem9vbURlbHRhIGlzIGFsd2F5cyAxMjAgb3IgLTEyMCBmb3IgbW91c2V3aGVlbHMsIHRoZXJlZm9yZSBzZXR0aW5nIHNjYWxlLnNwZWVkXHJcbiAgIyB0byAxMjAgd291bGQgY2F1c2UgdGhlIHNjYWxlIHRvIGNoYW5nZSBieSAxLjAgZm9yIGV2ZXJ5IFwibm90Y2hcIiBvbiB0aGUgd2hlZWwuXHJcbiAgc2NhbGU6XHJcbiAgICBzcGVlZDogNDAwXHJcbiAgICBtaW46IDAuNzVcclxuICAgIG1heDogMy4wXHJcbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbmNsYXNzIFNjZW5lIGV4dGVuZHMgY2MuU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBMYXllcjogTGF5ZXJcclxuICBTY2VuZTogU2NlbmVcclxuIiwiXHJcbiMgVGhpcyBpcyBmdWNraW5nIHRyYWdpYy5cclxuUElYRUxfRlVER0VfRkFDVE9SID0gMC41ICAjIGhvdyBtYW55IHBpeGVscyB0byByZW1vdmUgZnJvbSB0aGUgZWRnZSB0byByZW1vdmUgYmxlZWRcclxuU0NBTEVfRlVER0VfRkFDVE9SID0gMC4wMiAgIyBhZGRpdGlvbmFsIHNwcml0ZSBzY2FsZSB0byBlbnN1cmUgcHJvcGVyIHRpbGluZ1xyXG5cclxuVGlsZXNoZWV0QmF0Y2hOb2RlID0gY2MuU3ByaXRlQmF0Y2hOb2RlLmV4dGVuZCB7XHJcbiAgaW5pdDogKGZpbGVJbWFnZSwgY2FwYWNpdHkpIC0+XHJcbiAgICBAX3N1cGVyKGZpbGVJbWFnZSwgY2FwYWNpdHkpXHJcblxyXG4gIGNyZWF0ZVNwcml0ZTogKHRpbGVJbmRleCwgeCwgeSkgLT5cclxuICAgIHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGVXaXRoVGV4dHVyZShAZ2V0VGV4dHVyZSgpLCBAdGlsZXNoZWV0LnJlY3QodGlsZUluZGV4KSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKHgsIHkpXHJcbiAgICBzcHJpdGUuc2V0U2NhbGUoQHRpbGVzaGVldC5hZGp1c3RlZFNjYWxlLngsIEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS55KVxyXG4gICAgQGFkZENoaWxkIHNwcml0ZVxyXG4gICAgcmV0dXJuIHNwcml0ZVxyXG59XHJcblxyXG5jbGFzcyBUaWxlc2hlZXRcclxuICBjb25zdHJ1Y3RvcjogKEByZXNvdXJjZSwgQHdpZHRoLCBAaGVpZ2h0LCBAc3RyaWRlKSAtPlxyXG4gICAgQGFkanVzdGVkU2NhbGUgPVxyXG4gICAgICB4OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEB3aWR0aClcclxuICAgICAgeTogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAaGVpZ2h0KVxyXG5cclxuICByZWN0OiAodikgLT5cclxuICAgIHkgPSBNYXRoLmZsb29yKHYgLyBAc3RyaWRlKVxyXG4gICAgeCA9IHYgJSBAc3RyaWRlXHJcbiAgICByZXR1cm4gY2MucmVjdCh4ICogQHdpZHRoLCB5ICogQGhlaWdodCwgQHdpZHRoIC0gUElYRUxfRlVER0VfRkFDVE9SLCBAaGVpZ2h0IC0gUElYRUxfRlVER0VfRkFDVE9SKVxyXG5cclxuICBjcmVhdGVCYXRjaE5vZGU6IChjYXBhY2l0eSkgLT5cclxuICAgIGJhdGNoTm9kZSA9IG5ldyBUaWxlc2hlZXRCYXRjaE5vZGUoKVxyXG4gICAgYmF0Y2hOb2RlLnRpbGVzaGVldCA9IHRoaXNcclxuICAgIGJhdGNoTm9kZS5pbml0KEByZXNvdXJjZSwgY2FwYWNpdHkpXHJcbiAgICByZXR1cm4gYmF0Y2hOb2RlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuSW50cm9Nb2RlID0gcmVxdWlyZSAnbW9kZS9pbnRybydcclxuR2FtZU1vZGUgPSByZXF1aXJlICdtb2RlL2dhbWUnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblBsYXllciA9IHJlcXVpcmUgJ2JyYWluL3BsYXllcidcclxuXHJcbmNsYXNzIEdhbWVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEB0dXJuRnJhbWVzID0gMFxyXG4gICAgQG1vZGVzID1cclxuICAgICAgaW50cm86IG5ldyBJbnRyb01vZGUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZU1vZGUoKVxyXG5cclxuICBuZXdGbG9vcjogLT5cclxuICAgIGZsb29yZ2VuLmdlbmVyYXRlKClcclxuXHJcbiAgY3VycmVudEZsb29yOiAtPlxyXG4gICAgcmV0dXJuIEBzdGF0ZS5mbG9vcnNbQHN0YXRlLnBsYXllci5mbG9vcl1cclxuXHJcbiAgbmV3R2FtZTogLT5cclxuICAgIGNjLmxvZyBcIm5ld0dhbWVcIlxyXG4gICAgQHN0YXRlID0ge1xyXG4gICAgICBydW5uaW5nOiBmYWxzZVxyXG4gICAgICBwbGF5ZXI6IG5ldyBQbGF5ZXIoe1xyXG4gICAgICAgIHg6IDQ0XHJcbiAgICAgICAgeTogNDlcclxuICAgICAgICBmbG9vcjogMVxyXG4gICAgICB9KVxyXG4gICAgICBmbG9vcnM6IFtcclxuICAgICAgICB7fVxyXG4gICAgICAgIEBuZXdGbG9vcigpXHJcbiAgICAgIF1cclxuICAgIH1cclxuXHJcbiAgc2V0VHVybkZyYW1lczogKGNvdW50KSAtPlxyXG4gICAgaWYgQHR1cm5GcmFtZXMgPCBjb3VudFxyXG4gICAgICBAdHVybkZyYW1lcyA9IGNvdW50XHJcblxyXG5pZiBub3QgY2MuZ2FtZVxyXG4gIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gIGNjLnVuaXRTaXplID0gY29uZmlnLnVuaXRTaXplXHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDFcclxuICAgICAgZWxzZSAwXHJcblxyXG4gIGdmeENsZWFyOiAtPlxyXG4gICAgaWYgQGdmeD9cclxuICAgICAgaWYgQGdmeC5mbG9vckxheWVyP1xyXG4gICAgICAgIEByZW1vdmUgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4ID0ge31cclxuXHJcbiAgZ2Z4UmVuZGVyRmxvb3I6IC0+XHJcbiAgICBmbG9vciA9IGNjLmdhbWUuY3VycmVudEZsb29yKClcclxuXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIgPSBuZXcgY2MuTGF5ZXIoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAZ2Z4LmZsb29yQmF0Y2hOb2RlID0gcmVzb3VyY2VzLnRpbGVzaGVldHMudGlsZXMwLmNyZWF0ZUJhdGNoTm9kZSgoZmxvb3Iud2lkdGggKiBmbG9vci5oZWlnaHQpIC8gMilcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LmZsb29yQmF0Y2hOb2RlLCAtMVxyXG4gICAgZm9yIGogaW4gWzAuLi5mbG9vci5oZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uZmxvb3Iud2lkdGhdXHJcbiAgICAgICAgdiA9IGZsb29yLmdldChpLCBqKVxyXG4gICAgICAgIGlmIHYgIT0gMFxyXG4gICAgICAgICAgQGdmeC5mbG9vckJhdGNoTm9kZS5jcmVhdGVTcHJpdGUoQHRpbGVGb3JHcmlkVmFsdWUodiksIGkgKiBjYy51bml0U2l6ZSwgaiAqIGNjLnVuaXRTaXplKVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShjb25maWcuc2NhbGUubWluKVxyXG4gICAgQGFkZCBAZ2Z4LmZsb29yTGF5ZXJcclxuICAgIEBnZnhDZW50ZXJNYXAoKVxyXG5cclxuICBnZnhQbGFjZU1hcDogKG1hcFgsIG1hcFksIHNjcmVlblgsIHNjcmVlblkpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICB4ID0gc2NyZWVuWCAtIChtYXBYICogc2NhbGUpXHJcbiAgICB5ID0gc2NyZWVuWSAtIChtYXBZICogc2NhbGUpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24oeCwgeSlcclxuXHJcbiAgZ2Z4Q2VudGVyTWFwOiAtPlxyXG4gICAgY2VudGVyID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKS5iYm94LmNlbnRlcigpXHJcbiAgICBAZ2Z4UGxhY2VNYXAoY2VudGVyLnggKiBjYy51bml0U2l6ZSwgY2VudGVyLnkgKiBjYy51bml0U2l6ZSwgY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKVxyXG5cclxuICBnZnhTY3JlZW5Ub01hcENvb3JkczogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogKHggLSBwb3MueCkgLyBzY2FsZVxyXG4gICAgICB5OiAoeSAtIHBvcy55KSAvIHNjYWxlXHJcbiAgICB9XHJcblxyXG4gIGdmeFJlbmRlclBsYXllcjogLT5cclxuICAgIEBnZngucGxheWVyID0ge31cclxuICAgIEBnZngucGxheWVyLnNwcml0ZSA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNyZWF0ZVNwcml0ZSgpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5wbGF5ZXIuc3ByaXRlLCAwXHJcblxyXG4gIGdmeEFkanVzdE1hcFNjYWxlOiAoZGVsdGEpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICBzY2FsZSArPSBkZWx0YVxyXG4gICAgc2NhbGUgPSBjb25maWcuc2NhbGUubWF4IGlmIHNjYWxlID4gY29uZmlnLnNjYWxlLm1heFxyXG4gICAgc2NhbGUgPSBjb25maWcuc2NhbGUubWluIGlmIHNjYWxlIDwgY29uZmlnLnNjYWxlLm1pblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKHNjYWxlKVxyXG5cclxuICBnZnhSZW5kZXJQYXRoOiAocGF0aCkgLT5cclxuICAgIGlmIEBnZngucGF0aEJhdGNoTm9kZT9cclxuICAgICAgQGdmeC5mbG9vckxheWVyLnJlbW92ZUNoaWxkIEBnZngucGF0aEJhdGNoTm9kZVxyXG4gICAgcmV0dXJuIGlmIHBhdGgubGVuZ3RoID09IDBcclxuICAgIEBnZngucGF0aEJhdGNoTm9kZSA9IHJlc291cmNlcy50aWxlc2hlZXRzLnRpbGVzMC5jcmVhdGVCYXRjaE5vZGUocGF0aC5sZW5ndGgpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5wYXRoQmF0Y2hOb2RlXHJcbiAgICBmb3IgcCBpbiBwYXRoXHJcbiAgICAgIHNwcml0ZSA9IEBnZngucGF0aEJhdGNoTm9kZS5jcmVhdGVTcHJpdGUoMTcsIHAueCAqIGNjLnVuaXRTaXplLCBwLnkgKiBjYy51bml0U2l6ZSlcclxuICAgICAgc3ByaXRlLnNldE9wYWNpdHkoMTI4KVxyXG5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHBvcy54ICsgZHgsIHBvcy55ICsgZHkpXHJcblxyXG4gIG9uWm9vbTogKHgsIHksIGRlbHRhKSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBAZ2Z4QWRqdXN0TWFwU2NhbGUoZGVsdGEgLyBjb25maWcuc2NhbGUuc3BlZWQpXHJcbiAgICBAZ2Z4UGxhY2VNYXAocG9zLngsIHBvcy55LCB4LCB5KVxyXG5cclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gICAgY2MuZ2FtZS5uZXdHYW1lKClcclxuICAgIEBnZnhDbGVhcigpXHJcbiAgICBAZ2Z4UmVuZGVyRmxvb3IoKVxyXG4gICAgQGdmeFJlbmRlclBsYXllcigpXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFNjaGVkdWxlcigpLnNjaGVkdWxlQ2FsbGJhY2tGb3JUYXJnZXQodGhpcywgQHVwZGF0ZSwgMSAvIDYwLjAsIGNjLlJFUEVBVF9GT1JFVkVSLCAwLCBmYWxzZSlcclxuXHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIGdyaWRYID0gTWF0aC5mbG9vcihwb3MueCAvIGNjLnVuaXRTaXplKVxyXG4gICAgZ3JpZFkgPSBNYXRoLmZsb29yKHBvcy55IC8gY2MudW5pdFNpemUpXHJcblxyXG4gICAgaWYgbm90IGNjLmdhbWUuc3RhdGUucnVubmluZ1xyXG4gICAgICBjYy5nYW1lLnN0YXRlLnBsYXllci5hY3QoZ3JpZFgsIGdyaWRZKVxyXG4gICAgICBjYy5nYW1lLnN0YXRlLnJ1bm5pbmcgPSB0cnVlXHJcbiAgICAgIGNjLmxvZyBcInJ1bm5pbmdcIlxyXG5cclxuICAgICMgcGF0aGZpbmRlciA9IG5ldyBQYXRoZmluZGVyKGNjLmdhbWUuY3VycmVudEZsb29yKCksIDApXHJcbiAgICAjIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCwgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueSwgZ3JpZFgsIGdyaWRZKVxyXG4gICAgIyBAZ2Z4UmVuZGVyUGF0aChwYXRoKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnVwZGF0ZVNwcml0ZShAZ2Z4LnBsYXllci5zcHJpdGUpXHJcblxyXG4gICAgaWYgY2MuZ2FtZS50dXJuRnJhbWVzID4gMFxyXG4gICAgICBjYy5nYW1lLnR1cm5GcmFtZXMtLVxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICAgICBtaW5pbXVtQ0QgPSAxMDAwXHJcbiAgICAgICAgaWYgbWluaW11bUNEID4gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2RcclxuICAgICAgICAgIG1pbmltdW1DRCA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgIyBUT0RPOiBjaGVjayBjZCBvZiBhbGwgTlBDcyBvbiB0aGUgZmxvb3IgYWdhaW5zdCB0aGUgbWluaW11bUNEXHJcbiAgICAgICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudGljayhtaW5pbXVtQ0QpXHJcbiAgICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2QgPT0gMCAjIFdlIGp1c3QgcmFuLCB5ZXQgZGlkIG5vdGhpbmdcclxuICAgICAgICAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IGZhbHNlXHJcbiAgICAgICAgICBjYy5sb2cgXCJub3QgcnVubmluZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVNb2RlXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEludHJvTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiSW50cm9cIilcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5pbWFnZXMuc3BsYXNoc2NyZWVuXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKSlcclxuICAgIEBhZGQgQHNwcml0ZVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxyXG4gICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXHJcbiIsIlRpbGVzaGVldCA9IHJlcXVpcmUgXCJnZngvdGlsZXNoZWV0XCJcclxuXHJcbmltYWdlcyA9XHJcbiAgc3BsYXNoc2NyZWVuOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgdGlsZXMwOiAncmVzL3RpbGVzMC5wbmcnXHJcbiAgcGxheWVyOiAncmVzL3BsYXllci5wbmcnXHJcblxyXG50aWxlc2hlZXRzID1cclxuICB0aWxlczA6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnRpbGVzMCwgMzIsIDMyLCAxNilcclxuICBwbGF5ZXI6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnBsYXllciwgMjQsIDI4LCAxOClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBpbWFnZXM6IGltYWdlc1xyXG4gIHRpbGVzaGVldHM6IHRpbGVzaGVldHNcclxuICBjb2Nvc1ByZWxvYWRMaXN0OiAoe3NyYzogdn0gZm9yIGssIHYgb2YgaW1hZ2VzKVxyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xyXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXHJcblxyXG5TSEFQRVMgPSBbXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uI1xyXG4gICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICAgICAjIyMjXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgIyMjIyMuLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG5dXHJcblxyXG5FTVBUWSA9IDBcclxuV0FMTCA9IDFcclxuRE9PUiA9IDJcclxuRklSU1RfUk9PTV9JRCA9IDVcclxuXHJcbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxyXG4gIHN3aXRjaFxyXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXHJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcclxuICAgIHdoZW4gdiA+PSBGSVJTVF9ST09NX0lEIHRoZW4gcmV0dXJuIHAuY29sb3IgMCwgMCwgNSArIE1hdGgubWluKDI0MCwgMTUgKyAodiAqIDIpKVxyXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcclxuXHJcbmNsYXNzIFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxyXG5cclxuICB3OiAtPiBAciAtIEBsXHJcbiAgaDogLT4gQGIgLSBAdFxyXG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXHJcbiAgYXNwZWN0OiAtPlxyXG4gICAgaWYgQGgoKSA+IDBcclxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIHNxdWFyZW5lc3M6IC0+XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXHJcblxyXG4gIGNlbnRlcjogLT5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcclxuICAgICAgeTogTWF0aC5mbG9vcigoQGIgKyBAdCkgLyAyKVxyXG4gICAgfVxyXG5cclxuICBjbG9uZTogLT5cclxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcclxuXHJcbiAgZXhwYW5kOiAocikgLT5cclxuICAgIGlmIEBhcmVhKClcclxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcclxuICAgICAgQHQgPSByLnQgaWYgQHQgPiByLnRcclxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcclxuICAgIGVsc2VcclxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXHJcbiAgICAgIEBsID0gci5sXHJcbiAgICAgIEB0ID0gci50XHJcbiAgICAgIEByID0gci5yXHJcbiAgICAgIEBiID0gci5iXHJcblxyXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcclxuXHJcbmNsYXNzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID0gRU1QVFlcclxuXHJcbiAgICBAZ2VuZXJhdGVTaGFwZSgpXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAc2V0KGksIDAsIFdBTEwpXHJcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIEBzZXQoMCwgaiwgV0FMTClcclxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxyXG5cclxuICByZWN0OiAoeCwgeSkgLT5cclxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0gPSB2XHJcblxyXG4gIGdldDogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgcmV0dXJuIHYgaWYgdiAhPSBFTVBUWVxyXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXHJcblxyXG4gIHBsYWNlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxyXG5cclxuICBmaXRzOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBtdiA9IG1hcC5nZXQoeCArIGksIHkgKyBqKVxyXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGRvb3JFbGlnaWJsZTogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXHJcbiAgICByb29tc1NlZW4gPSB7fVxyXG4gICAgdmFsdWVzID0gW1xyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogKyAxKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXHJcbiAgICBdXHJcbiAgICBmb3IgdiBpbiB2YWx1ZXNcclxuICAgICAgaWYgdlxyXG4gICAgICAgIGlmIHYgPT0gMVxyXG4gICAgICAgICAgd2FsbE5laWdoYm9ycysrXHJcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcclxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcclxuICAgIHJvb21zID0gT2JqZWN0LmtleXMocm9vbXNTZWVuKS5zb3J0IChhLCBiKSAtPiBhLWJcclxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxyXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXHJcbiAgICBpZiAod2FsbE5laWdoYm9ycyA9PSAyKSBhbmQgKHJvb21Db3VudCA9PSAyKSBhbmQgKEByb29taWQgaW4gcm9vbXMpXHJcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcclxuICAgICAgICByZXR1cm4gcm9vbXNcclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXHJcbiAgICAgICAgaWYgcm9vbXNbMF0gIT0gLTEgYW5kIEByb29taWQgaW4gcm9vbXNcclxuICAgICAgICAgIHJldHVybiBbaSwgal1cclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXHJcbiAgICBiYm94VGVtcC5leHBhbmQgQHJlY3QoeCwgeSlcclxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cclxuXHJcbiAgZmluZEJlc3RTcG90OiAobWFwKSAtPlxyXG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxyXG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcclxuICAgIG1pblggPSAtMVxyXG4gICAgbWluWSA9IC0xXHJcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxyXG4gICAgc2VhcmNoTCA9IG1hcC5iYm94LmwgLSBAd2lkdGhcclxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXHJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcclxuICAgIHNlYXJjaEIgPSBtYXAuYmJveC5iXHJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cclxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXHJcbiAgICAgICAgaWYgQGZpdHMobWFwLCBpLCBqKVxyXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXHJcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IEBkb29yTG9jYXRpb24gbWFwLCBpLCBqXHJcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXHJcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtaW5BcmVhID0gYXJlYVxyXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXHJcbiAgICAgICAgICAgICAgbWluWCA9IGlcclxuICAgICAgICAgICAgICBtaW5ZID0galxyXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXHJcblxyXG5jbGFzcyBTaGFwZVJvb21UZW1wbGF0ZSBleHRlbmRzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cclxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXHJcbiAgICB3ID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcclxuICAgIEB3aWR0aCA9IHdcclxuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXHJcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxyXG4gICAgaSA9IDBcclxuICAgIGogPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxyXG4gICAgICAgIHYgPSBzd2l0Y2ggY1xyXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXHJcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcclxuICAgICAgICAgIGVsc2UgMFxyXG4gICAgICAgIGlmIHZcclxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcclxuICAgICAgICBpKytcclxuICAgICAgaisrXHJcbiAgICAgIGkgPSAwXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJyb29tIGNyZWF0ZWQgI3tAcmVjdH1cIlxyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEBzZWVkKSAtPlxyXG4gICAgQHJhbmRSZXNldCgpXHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPVxyXG4gICAgICAgICAgdHlwZTogRU1QVFlcclxuICAgICAgICAgIHg6IGlcclxuICAgICAgICAgIHk6IGpcclxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxyXG4gICAgQHJvb21zID0gW11cclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XHJcblxyXG4gIGdldDogKGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgcmV0dXJuIEBncmlkW2ldW2pdLnR5cGVcclxuICAgIHJldHVybiAwXHJcblxyXG4gIGFkZFJvb206IChyb29tVGVtcGxhdGUsIHgsIHkpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxyXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcclxuICAgIHIgPSByb29tVGVtcGxhdGUucmVjdCh4LCB5KVxyXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxyXG4gICAgQGJib3guZXhwYW5kKHIpXHJcbiAgICAjIGNvbnNvbGUubG9nIFwibmV3IG1hcCBiYm94ICN7QGJib3h9XCJcclxuXHJcbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxyXG4gICAgciA9IEByYW5kKDEwMClcclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDEwIDwgciA8IDIwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNSArIEByYW5kKDEwKSwgMywgcm9vbWlkICAgICAgICAgICAgICAgICAgIyBob3Jpem9udGFsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xyXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cclxuXHJcbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxyXG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcclxuICAgIGlmIEByb29tcy5sZW5ndGggPT0gMFxyXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXHJcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIGVsc2VcclxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXHJcbiAgICAgIGlmIHggPCAwXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBnZW5lcmF0ZVJvb21zOiAoY291bnQpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxyXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxyXG5cclxuICAgICAgYWRkZWQgPSBmYWxzZVxyXG4gICAgICB3aGlsZSBub3QgYWRkZWRcclxuICAgICAgICBhZGRlZCA9IEBnZW5lcmF0ZVJvb20gcm9vbWlkXHJcblxyXG5nZW5lcmF0ZSA9IC0+XHJcbiAgbWFwID0gbmV3IE1hcCA4MCwgODAsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcblxyXG5jbGFzcyBGYWtlSGVhcFxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGxpc3QgPSBbXVxyXG5cclxuICBzb3J0TGlzdDogLT5cclxuICAgIEBsaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZVxyXG5cclxuICBwdXNoOiAobikgLT5cclxuICAgIEBsaXN0LnB1c2gobilcclxuICAgIEBzb3J0TGlzdCgpXHJcblxyXG4gIHNpemU6IC0+XHJcbiAgICByZXR1cm4gQGxpc3QubGVuZ3RoXHJcblxyXG4gIHBvcDogLT5cclxuICAgIHJldHVybiBAbGlzdC5zaGlmdCgpXHJcblxyXG4gIHJlc2NvcmU6IChuKSAtPlxyXG4gICAgQHNvcnRMaXN0KClcclxuXHJcbmNsYXNzIERpamtzdHJhXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZGlzdGFuY2UgPSA5OTk5OVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5oZWFwZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBjcmVhdGVIZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBGYWtlSGVhcCAobm9kZSkgLT5cclxuICAgICAgcmV0dXJuIG5vZGUuZGlzdGFuY2VcclxuXHJcbiAgc2VhcmNoOiAoc3RhcnQsIGVuZCkgLT5cclxuICAgIGdyaWQgPSBAZmxvb3IuZ3JpZFxyXG4gICAgaGV1cmlzdGljID0gQG1hbmhhdHRhblxyXG5cclxuICAgIHN0YXJ0LmRpc3RhbmNlID0gMFxyXG5cclxuICAgIGhlYXAgPSBAY3JlYXRlSGVhcCgpXHJcbiAgICBoZWFwLnB1c2goc3RhcnQpXHJcbiAgICBzdGFydC5oZWFwZWQgPSB0cnVlXHJcblxyXG4gICAgd2hpbGUgaGVhcC5zaXplKCkgPiAwXHJcbiAgICAgIGN1cnJlbnROb2RlID0gaGVhcC5wb3AoKVxyXG4gICAgICBjdXJyZW50Tm9kZS52aXNpdGVkID0gdHJ1ZVxyXG5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICBjdXJyID0gZW5kXHJcbiAgICAgICAgd2hpbGUgY3Vyci5wYXJlbnRcclxuICAgICAgICAgIHJldC5wdXNoKHt4OmN1cnIueCwgeTpjdXJyLnl9KVxyXG4gICAgICAgICAgY3VyciA9IGN1cnIucGFyZW50XHJcbiAgICAgICAgcmV0dXJuIHJldC5yZXZlcnNlKClcclxuXHJcbiAgICAgICMgRmluZCBhbGwgbmVpZ2hib3JzIGZvciB0aGUgY3VycmVudCBub2RlLlxyXG4gICAgICBuZWlnaGJvcnMgPSBAbmVpZ2hib3JzKGdyaWQsIGN1cnJlbnROb2RlKVxyXG5cclxuICAgICAgZm9yIG5laWdoYm9yIGluIG5laWdoYm9yc1xyXG4gICAgICAgIGlmIG5laWdoYm9yLnZpc2l0ZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIFRoZSBkaXN0YW5jZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgIyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXRoIHdlIGhhdmUgYXJyaXZlZCBhdCB0aGlzIG5laWdoYm9yIGlzIHRoZSBzaG9ydGVzdCBvbmUgd2UgaGF2ZSBzZWVuIHlldC5cclxuICAgICAgICBuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGUgPSBjdXJyZW50Tm9kZS5kaXN0YW5jZSArIDFcclxuICAgICAgICBpc0RpYWdvbmFsID0gKGN1cnJlbnROb2RlLnggIT0gbmVpZ2hib3IueCkgYW5kIChjdXJyZW50Tm9kZS55ICE9IG5laWdoYm9yLnkpXHJcbiAgICAgICAgaWYgaXNEaWFnb25hbFxyXG4gICAgICAgICAgbmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlICs9IDAuMVxyXG5cclxuICAgICAgICBpZiAobmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlIDwgbmVpZ2hib3IuZGlzdGFuY2UpIGFuZCBub3QgbmVpZ2hib3IudmlzaXRlZFxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLlxyXG4gICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBuZWlnaGJvckRpc3RhbmNlVmlhVGhpc05vZGVcclxuICAgICAgICAgIG5laWdoYm9yLnBhcmVudCA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgICBpZiBuZWlnaGJvci5oZWFwZWRcclxuICAgICAgICAgICAgaGVhcC5yZXNjb3JlKG5laWdoYm9yKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoZWFwLnB1c2gobmVpZ2hib3IpXHJcbiAgICAgICAgICAgIG5laWdoYm9yLmhlYXBlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gW11cclxuXHJcbiAgbmVpZ2hib3JzOiAoZ3JpZCwgbm9kZSkgLT5cclxuICAgIHJldCA9IFtdXHJcbiAgICB4ID0gbm9kZS54XHJcbiAgICB5ID0gbm9kZS55XHJcblxyXG4gICAgIyBTb3V0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ktMV0pXHJcblxyXG4gICAgIyBTb3V0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3krMV0pXHJcblxyXG4gICAgIyBOb3J0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3krMV0pXHJcblxyXG4gICAgIyBXZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beV0pXHJcblxyXG4gICAgIyBFYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beV0pXHJcblxyXG4gICAgIyBTb3V0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beS0xXSlcclxuXHJcbiAgICAjIE5vcnRoXHJcbiAgICBpZiBncmlkW3hdIGFuZCBncmlkW3hdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5KzFdKVxyXG5cclxuICAgIHJldHVybiByZXRcclxuXHJcbmNsYXNzIFBhdGhmaW5kZXJcclxuICBjb25zdHJ1Y3RvcjogKEBmbG9vciwgQGZsYWdzKSAtPlxyXG5cclxuICBjYWxjOiAoc3RhcnRYLCBzdGFydFksIGRlc3RYLCBkZXN0WSkgLT5cclxuICAgIGRpamtzdHJhID0gbmV3IERpamtzdHJhIEBmbG9vclxyXG4gICAgcmV0dXJuIGRpamtzdHJhLnNlYXJjaChAZmxvb3IuZ3JpZFtzdGFydFhdW3N0YXJ0WV0sIEBmbG9vci5ncmlkW2Rlc3RYXVtkZXN0WV0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhmaW5kZXJcclxuIl19
;