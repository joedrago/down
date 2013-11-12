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


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"brain/brain":[function(require,module,exports){
module.exports=require('KsM6/6');
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
  scale: {
    min: 1.5,
    max: 8.0
  },
  COCOS2D_DEBUG: 2,
  box2d: false,
  chipmunk: false,
  showFPS: true,
  frameRate: 60,
  loadExtension: false,
  renderMode: 0,
  tag: 'gameCanvas',
  appFiles: ['bundle.js']
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


},{}],"mBOMH+":[function(require,module,exports){
var Game, GameMode, IntroMode, Player, floorgen, resources, size;

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
  cc.unitSize = 16;
  cc.width = size.width;
  cc.height = size.height;
  cc.game = new Game();
}


},{"brain/player":"TryngT","mode/game":"fSCZ8s","mode/intro":"GT1UVd","resources":"NN+gjI","world/floorgen":"4WaFsS"}],"main":[function(require,module,exports){
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
    this.gfxAdjustMapScale(delta / 200);
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
    var gridX, gridY, path, pathfinder, pos;
    pos = this.gfxScreenToMapCoords(x, y);
    gridX = Math.floor(pos.x / cc.unitSize);
    gridY = Math.floor(pos.y / cc.unitSize);
    pathfinder = new Pathfinder(cc.game.currentFloor(), 0);
    path = pathfinder.calc(cc.game.state.player.x, cc.game.state.player.y, gridX, gridY);
    return this.gfxRenderPath(path);
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


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"resources":[function(require,module,exports){
module.exports=require('NN+gjI');
},{}],"NN+gjI":[function(require,module,exports){
var Tilesheet, images, k, tilesheets, v;

Tilesheet = require("gfx/tilesheet");

images = {
  splashscreen: 'res/splashscreen.png',
  tiles0: 'res/tiles0.png',
  player: 'res/player.png'
};

tilesheets = {
  tiles0: new Tilesheet(images.tiles0, 16, 16, 16),
  player: new Tilesheet(images.player, 12, 14, 18)
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


},{"gfx/tilesheet":"2l7Ub8"}],"world/floor":[function(require,module,exports){
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
},{}],"2ZcY+C":[function(require,module,exports){
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
        node.distance = 99999;
        node.visited = false;
        node.heaped = false;
        node.parent = null;
      }
    }
  }

  AStar.prototype.createHeap = function() {
    return new BinaryHeap(function(node) {
      return node.distance;
    });
  };

  AStar.prototype.search = function(start, end) {
    var alt, curr, currentNode, grid, heap, heuristic, isDiagonal, neighbor, neighbors, ret, _i, _len;
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
        alt = currentNode.distance + 1;
        isDiagonal = (currentNode.x !== neighbor.x) && (currentNode.y !== neighbor.y);
        if (isDiagonal) {
          alt += 0.001;
        }
        if ((alt <= neighbor.distance) && !neighbor.visited) {
          neighbor.distance = alt;
          neighbor.parent = currentNode;
          cc.log("neighbor [" + neighbor.x + ", " + neighbor.y + "] now via " + currentNode.x + ", " + currentNode.y + ": " + neighbor.distance);
          if (neighbor.heaped) {
            heap.rescoreElement(neighbor);
          } else {
            heap.push(neighbor);
            neighbor.heaped = true;
          }
        }
      }
    }
    cc.log("while loop ended");
    cc.log("start " + start.x + ", " + start.y);
    cc.log("end " + end.x + ", " + end.y);
    return [];
  };

  AStar.prototype.neighbors = function(grid, node) {
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

  return AStar;

})();

Pathfinder = (function() {
  function Pathfinder(floor, flags) {
    this.floor = floor;
    this.flags = flags;
  }

  Pathfinder.prototype.calc = function(startX, startY, destX, destY) {
    var astar;
    astar = new AStar(this.floor);
    return astar.search(this.floor.grid[startX][startY], this.floor.grid[destX][destY]);
  };

  return Pathfinder;

})();

module.exports = Pathfinder;


},{"world/floorgen":"4WaFsS"}],"world/pathfinder":[function(require,module,exports){
module.exports=require('2ZcY+C');
},{}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1QixpQkFBdkI7O0FBRUEsQ0FGQSxDQUVlLENBQUYsRUFBUSxDQUFSLElBQWI7Q0FBNkIsQ0FDM0IsQ0FBTSxDQUFOLEtBQVE7Q0FDTixFQURNLENBQUQ7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxHQUVBLFdBQUE7Q0FDQyxFQUFpQixDQUFqQixPQUFELEdBQUE7Q0FMeUIsRUFDckI7Q0FEcUIs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RUFBVSxDQUFWO0NBQ0UsRUFBRyxDQUFILEVBQUE7TUF0QkY7Q0F5QkEsRUFBVSxDQUFWO0NBQ0UsRUFBRyxDQUFILEVBQUE7TUExQkY7Q0E2QkEsRUFBeUIsQ0FBekI7Q0FDRSxFQUFHLENBQUgsRUFBQTtNQTlCRjtDQWlDQSxFQUF5QixDQUF6QjtDQUNFLEVBQUcsQ0FBSCxFQUFBO01BbENGO0NBb0NBLEVBQUEsUUFBTztDQXBIVCxFQStFVzs7Q0EvRVg7O0NBN0dGOztBQW1PTSxDQW5PTjtDQW9PZSxDQUFBLENBQUEsRUFBQSxlQUFFO0NBQWdCLEVBQWhCLENBQUQsQ0FBaUI7Q0FBQSxFQUFSLENBQUQsQ0FBUztDQUEvQixFQUFhOztDQUFiLENBRWUsQ0FBVCxDQUFOLENBQU0sQ0FBQSxHQUFDO0NBQ0wsSUFBQSxHQUFBO0NBQUEsRUFBWSxDQUFaLENBQUE7Q0FDQSxDQUFpRCxFQUE1QixDQUFULENBQUwsS0FBQTtDQUpULEVBRU07O0NBRk47O0NBcE9GOztBQTBPQSxDQTFPQSxFQTBPaUIsR0FBWCxDQUFOLEdBMU9BIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsInZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIHNpZ25pZmljYW5jZSA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxuXHJcbnZhciBvdmVyZmxvdywgc3RhcnRkZW5vbTsgLy9udW1iZXJzXHJcblxyXG5cclxudmFyIG9sZFJhbmRvbSA9IE1hdGgucmFuZG9tO1xyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvdmVyUmlkZUdsb2JhbCkge1xyXG4gIGlmICghc2VlZCkge1xyXG4gICAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICAgIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9sZFJhbmRvbTtcclxuICB9XHJcbiAgdmFyIGtleSA9IFtdO1xyXG4gIHZhciBhcmM0O1xyXG5cclxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cclxuICBzZWVkID0gbWl4a2V5KGZsYXR0ZW4oc2VlZCwgMyksIGtleSk7XHJcblxyXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxyXG4gIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgZnVuY3Rpb24gcmFuZG9tKCkgeyAgLy8gQ2xvc3VyZSB0byByZXR1cm4gYSByYW5kb20gZG91YmxlOlxyXG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKTsgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XHJcbiAgICB2YXIgZCA9IHN0YXJ0ZGVub207ICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxyXG4gICAgdmFyIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXHJcbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcclxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxyXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXHJcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxyXG4gICAgfVxyXG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcclxuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXHJcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgTWF0aCB1bnRpbFxyXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cclxuICAgIH1cclxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxyXG4gIH1cclxuICByYW5kb20uc2VlZCA9IHNlZWQ7XHJcbiAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICBNYXRoWydyYW5kb20nXSA9IHJhbmRvbTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybiB0aGUgc2VlZCB0aGF0IHdhcyB1c2VkXHJcbiAgcmV0dXJuIHJhbmRvbTtcclxufTtcclxuXHJcbi8vXHJcbi8vIEFSQzRcclxuLy9cclxuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxyXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cclxuLy9cclxuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcclxuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxyXG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXHJcbi8vXHJcbi8qKiBAY29uc3RydWN0b3IgKi9cclxuZnVuY3Rpb24gQVJDNChrZXkpIHtcclxuICB2YXIgdCwgdSwgbWUgPSB0aGlzLCBrZXlsZW4gPSBrZXkubGVuZ3RoO1xyXG4gIHZhciBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gbWUubSA9IDA7XHJcbiAgbWUuUyA9IFtdO1xyXG4gIG1lLmMgPSBbXTtcclxuXHJcbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cclxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XHJcblxyXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXHJcbiAgd2hpbGUgKGkgPCB3aWR0aCkgeyBtZS5TW2ldID0gaSsrOyB9XHJcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcclxuICAgIHQgPSBtZS5TW2ldO1xyXG4gICAgaiA9IGxvd2JpdHMoaiArIHQgKyBrZXlbaSAlIGtleWxlbl0pO1xyXG4gICAgdSA9IG1lLlNbal07XHJcbiAgICBtZS5TW2ldID0gdTtcclxuICAgIG1lLlNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIG1lLmcgPSBmdW5jdGlvbiBnZXRuZXh0KGNvdW50KSB7XHJcbiAgICB2YXIgcyA9IG1lLlM7XHJcbiAgICB2YXIgaSA9IGxvd2JpdHMobWUuaSArIDEpOyB2YXIgdCA9IHNbaV07XHJcbiAgICB2YXIgaiA9IGxvd2JpdHMobWUuaiArIHQpOyB2YXIgdSA9IHNbal07XHJcbiAgICBzW2ldID0gdTtcclxuICAgIHNbal0gPSB0O1xyXG4gICAgdmFyIHIgPSBzW2xvd2JpdHModCArIHUpXTtcclxuICAgIHdoaWxlICgtLWNvdW50KSB7XHJcbiAgICAgIGkgPSBsb3diaXRzKGkgKyAxKTsgdCA9IHNbaV07XHJcbiAgICAgIGogPSBsb3diaXRzKGogKyB0KTsgdSA9IHNbal07XHJcbiAgICAgIHNbaV0gPSB1O1xyXG4gICAgICBzW2pdID0gdDtcclxuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7XHJcbiAgICBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gIH07XHJcbiAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgLy8gU2VlIGh0dHA6Ly93d3cucnNhLmNvbS9yc2FsYWJzL25vZGUuYXNwP2lkPTIwMDlcclxuICBtZS5nKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuLyoqIEBwYXJhbSB7T2JqZWN0PX0gcmVzdWx0IFxyXG4gICogQHBhcmFtIHtzdHJpbmc9fSBwcm9wXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHR5cCAqL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgsIHJlc3VsdCwgcHJvcCwgdHlwKSB7XHJcbiAgcmVzdWx0ID0gW107XHJcbiAgdHlwID0gdHlwZW9mKG9iaik7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICBpZiAocHJvcC5pbmRleE9mKCdTJykgPCA1KSB7ICAgIC8vIEF2b2lkIEZGMyBidWcgKGxvY2FsL3Nlc3Npb25TdG9yYWdlKVxyXG4gICAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiBvYmogKyAodHlwICE9ICdzdHJpbmcnID8gJ1xcMCcgOiAnJykpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG4vKiogQHBhcmFtIHtudW1iZXI9fSBzbWVhciBcclxuICAqIEBwYXJhbSB7bnVtYmVyPX0gaiAqL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5LCBzbWVhciwgaikge1xyXG4gIHNlZWQgKz0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgc2VlZCBpcyBhIHN0cmluZ1xyXG4gIHNtZWFyID0gMDtcclxuICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7IGorKykge1xyXG4gICAga2V5W2xvd2JpdHMoaildID1cclxuICAgICAgbG93Yml0cygoc21lYXIgXj0ga2V5W2xvd2JpdHMoaildICogMTkpICsgc2VlZC5jaGFyQ29kZUF0KGopKTtcclxuICB9XHJcbiAgc2VlZCA9ICcnO1xyXG4gIGZvciAoaiBpbiBrZXkpIHsgc2VlZCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleVtqXSk7IH1cclxuICByZXR1cm4gc2VlZDtcclxufVxyXG5cclxuLy9cclxuLy8gbG93Yml0cygpXHJcbi8vIEEgcXVpY2sgXCJuIG1vZCB3aWR0aFwiIGZvciB3aWR0aCBhIHBvd2VyIG9mIDIuXHJcbi8vXHJcbmZ1bmN0aW9uIGxvd2JpdHMobikgeyByZXR1cm4gbiAmICh3aWR0aCAtIDEpOyB9XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKTtcclxuc2lnbmlmaWNhbmNlID0gTWF0aC5wb3coMiwgc2lnbmlmaWNhbmNlKTtcclxub3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyO1xyXG4iLCIjIGhvdyBtYW55IHBpeGVscyBjYW4geW91IGRyYWcgYmVmb3JlIGl0IGlzIGFjdHVhbGx5IGNvbnNpZGVyZWQgYSBkcmFnXHJcbkVOR0FHRV9EUkFHX0RJU1RBTkNFID0gMzBcclxuXHJcbklucHV0TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG4gICAgQHNldE1vdXNlRW5hYmxlZCh0cnVlKVxyXG4gICAgQHRyYWNrZWRUb3VjaGVzID0gW11cclxuXHJcbiAgY2FsY0Rpc3RhbmNlOiAoeDEsIHkxLCB4MiwgeTIpIC0+XHJcbiAgICBkeCA9IHgyIC0geDFcclxuICAgIGR5ID0geTIgLSB5MVxyXG4gICAgcmV0dXJuIE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG5cclxuICBzZXREcmFnUG9pbnQ6IC0+XHJcbiAgICBAZHJhZ1ggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgQGRyYWdZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgY2FsY1BpbmNoQW5jaG9yOiAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIEBwaW5jaFggPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueCArIEB0cmFja2VkVG91Y2hlc1sxXS54KSAvIDIpXHJcbiAgICAgIEBwaW5jaFkgPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueSArIEB0cmFja2VkVG91Y2hlc1sxXS55KSAvIDIpXHJcbiAgICAgICMgY2MubG9nIFwicGluY2ggYW5jaG9yIHNldCBhdCAje0BwaW5jaFh9LCAje0BwaW5jaFl9XCJcclxuXHJcbiAgYWRkVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGZvciB0IGluIEB0cmFja2VkVG91Y2hlc1xyXG4gICAgICBpZiB0LmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMucHVzaCB7XHJcbiAgICAgIGlkOiBpZFxyXG4gICAgICB4OiB4XHJcbiAgICAgIHk6IHlcclxuICAgIH1cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMlxyXG4gICAgICAjIFdlIGp1c3QgYWRkZWQgYSBzZWNvbmQgdG91Y2ggc3BvdC4gQ2FsY3VsYXRlIHRoZSBhbmNob3IgZm9yIHBpbmNoaW5nIG5vd1xyXG4gICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICNjYy5sb2cgXCJhZGRpbmcgdG91Y2ggI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHJlbW92ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgICAgaWYgaW5kZXggPCAyXHJcbiAgICAgICAgIyBXZSBqdXN0IGZvcmdvdCBvbmUgb2Ygb3VyIHBpbmNoIHRvdWNoZXMuIFBpY2sgYSBuZXcgYW5jaG9yIHNwb3QuXHJcbiAgICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAgICNjYy5sb2cgXCJmb3JnZXR0aW5nIGlkICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICB1cGRhdGVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS54ID0geFxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnkgPSB5XHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQGRyYWdnaW5nID0gZmFsc2VcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEBhZGRUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+IDFcclxuICAgICAgIyBUaGV5J3JlIHBpbmNoaW5nLCBkb24ndCBldmVuIGJvdGhlciB0byBlbWl0IGEgY2xpY2tcclxuICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgcHJldkRpc3RhbmNlID0gMFxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIHByZXZEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgcHJldlggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgICBwcmV2WSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHVwZGF0ZVRvdWNoKHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55KVxyXG5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAjIHNpbmdsZSB0b3VjaCwgY29uc2lkZXIgZHJhZ2dpbmdcclxuICAgICAgZHJhZ0Rpc3RhbmNlID0gQGNhbGNEaXN0YW5jZSBAZHJhZ1gsIEBkcmFnWSwgQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55XHJcbiAgICAgIGlmIEBkcmFnZ2luZyBvciAoZHJhZ0Rpc3RhbmNlID4gRU5HQUdFX0RSQUdfRElTVEFOQ0UpXHJcbiAgICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG4gICAgICAgIGlmIGRyYWdEaXN0YW5jZSA+IDAuNVxyXG4gICAgICAgICAgZHggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueCAtIEBkcmFnWFxyXG4gICAgICAgICAgZHkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueSAtIEBkcmFnWVxyXG4gICAgICAgICAgI2NjLmxvZyBcInNpbmdsZSBkcmFnOiAje2R4fSwgI3tkeX1cIlxyXG4gICAgICAgICAgQG1vZGUub25EcmFnKGR4LCBkeSlcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuXHJcbiAgICBlbHNlIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICAjIGF0IGxlYXN0IHR3byBmaW5nZXJzIHByZXNlbnQsIGNoZWNrIGZvciBwaW5jaC96b29tXHJcbiAgICAgIGN1cnJEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICAgIGRlbHRhRGlzdGFuY2UgPSBjdXJyRGlzdGFuY2UgLSBwcmV2RGlzdGFuY2VcclxuICAgICAgaWYgZGVsdGFEaXN0YW5jZSAhPSAwXHJcbiAgICAgICAgI2NjLmxvZyBcImRpc3RhbmNlIGRyYWdnZWQgYXBhcnQ6ICN7ZGVsdGFEaXN0YW5jZX0gW2FuY2hvcjogI3tAcGluY2hYfSwgI3tAcGluY2hZfV1cIlxyXG4gICAgICAgIEBtb2RlLm9uWm9vbShAcGluY2hYLCBAcGluY2hZLCBkZWx0YURpc3RhbmNlKVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxIGFuZCBub3QgQGRyYWdnaW5nXHJcbiAgICAgIHBvcyA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKVxyXG4gICAgICAjY2MubG9nIFwiY2xpY2sgYXQgI3twb3MueH0sICN7cG9zLnl9XCJcclxuICAgICAgQG1vZGUub25DbGljayhwb3MueCwgcG9zLnkpXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAcmVtb3ZlVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuXHJcbiAgb25TY3JvbGxXaGVlbDogKGV2KSAtPlxyXG4gICAgcG9zID0gZXYuZ2V0TG9jYXRpb24oKVxyXG4gICAgQG1vZGUub25ab29tKHBvcy54LCBwb3MueSwgZXYuZ2V0V2hlZWxEZWx0YSgpKVxyXG59XHJcblxyXG5HZnhMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbn1cclxuXHJcbk1vZGVTY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcblxyXG4gICAgQGlucHV0ID0gbmV3IElucHV0TGF5ZXIoKVxyXG4gICAgQGlucHV0LmluaXQoQG1vZGUpXHJcbiAgICBAYWRkQ2hpbGQoQGlucHV0KVxyXG5cclxuICAgIEBnZnggPSBuZXcgR2Z4TGF5ZXIoKVxyXG4gICAgQGdmeC5pbml0KClcclxuICAgIEBhZGRDaGlsZChAZ2Z4KVxyXG5cclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAbW9kZS5vbkFjdGl2YXRlKClcclxufVxyXG5cclxuY2xhc3MgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XHJcbiAgICBAc2NlbmUgPSBuZXcgTW9kZVNjZW5lKClcclxuICAgIEBzY2VuZS5pbml0KHRoaXMpXHJcbiAgICBAc2NlbmUucmV0YWluKClcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgaWYgY2Muc2F3T25lU2NlbmU/XHJcbiAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucG9wU2NlbmUoKVxyXG4gICAgZWxzZVxyXG4gICAgICBjYy5zYXdPbmVTY2VuZSA9IHRydWVcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucHVzaFNjZW5lKEBzY2VuZSlcclxuXHJcbiAgYWRkOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5hZGRDaGlsZChvYmopXHJcblxyXG4gIHJlbW92ZTogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZngucmVtb3ZlQ2hpbGQob2JqKVxyXG5cclxuICAjIHRvIGJlIG92ZXJyaWRkZW4gYnkgZGVyaXZlZCBNb2Rlc1xyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlXHJcbiIsImlmIGRvY3VtZW50P1xyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbndlYidcclxuZWxzZVxyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xyXG4iLCJyZXF1aXJlICdqc2IuanMnXHJcbnJlcXVpcmUgJ21haW4nXHJcblxyXG5udWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKVxyXG5udWxsU2NlbmUuaW5pdCgpXHJcbmNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucnVuV2l0aFNjZW5lKG51bGxTY2VuZSlcclxuY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxuXHJcbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogY29uZmlnXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIHJlcXVpcmUgJ21haW4nXHJcbiAgICAgICAgbnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKCk7XHJcbiAgICAgICAgbnVsbFNjZW5lLmluaXQoKVxyXG4gICAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucmVwbGFjZVNjZW5lKG51bGxTY2VuZSlcclxuIyAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuICAgICAgdGhpcylcclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbm15QXBwID0gbmV3IGNvY29zMmRBcHAoKVxyXG4iLCJjbGFzcyBCcmFpblxyXG4gIGNvbnN0cnVjdG9yOiAoQHRpbGVzLCBAYW5pbUZyYW1lKSAtPlxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gdHJ1ZVxyXG4gICAgQGNkID0gMFxyXG4gICAgQGludGVycEZyYW1lcyA9IFtdXHJcbiAgICBAcGF0aCA9IFtdXHJcblxyXG4gIG1vdmU6IChneCwgZ3ksIGZyYW1lcykgLT5cclxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxyXG4gICAgZHggPSAoQHggLSBneCkgKiBjYy51bml0U2l6ZVxyXG4gICAgZHkgPSAoQHkgLSBneSkgKiBjYy51bml0U2l6ZVxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gKGR4IDwgMClcclxuICAgIGkgPSBmcmFtZXMubGVuZ3RoXHJcbiAgICBmb3IgZiBpbiBmcmFtZXNcclxuICAgICAgYW5pbUZyYW1lID0ge1xyXG4gICAgICAgIHg6IGR4ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICB5OiBkeSAqIGkgLyBmcmFtZXMubGVuZ3RoXHJcbiAgICAgICAgYW5pbUZyYW1lOiBmXHJcbiAgICAgIH1cclxuICAgICAgQGludGVycEZyYW1lcy5wdXNoIGFuaW1GcmFtZVxyXG4gICAgICBpLS1cclxuXHJcbiAgICBjYy5nYW1lLnNldFR1cm5GcmFtZXMoZnJhbWVzLmxlbmd0aClcclxuXHJcbiAgICAjIEltbWVkaWF0ZWx5IG1vdmUsIG9ubHkgcHJldGVuZCB0byBhbmltYXRlIHRoZXJlIG92ZXIgdGhlIG5leHQgZnJhbWVzLmxlbmd0aCBmcmFtZXNcclxuICAgIEB4ID0gZ3hcclxuICAgIEB5ID0gZ3lcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgY3JlYXRlU3ByaXRlOiAtPlxyXG4gICAgcyA9IGNjLlNwcml0ZS5jcmVhdGUgQHRpbGVzLnJlc291cmNlXHJcbiAgICBAdXBkYXRlU3ByaXRlKHMpXHJcbiAgICByZXR1cm4gc1xyXG5cclxuICB1cGRhdGVTcHJpdGU6IChzcHJpdGUpIC0+XHJcbiAgICB4ID0gQHggKiBjYy51bml0U2l6ZVxyXG4gICAgeSA9IEB5ICogY2MudW5pdFNpemVcclxuICAgIGFuaW1GcmFtZSA9IEBhbmltRnJhbWVcclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoXHJcbiAgICAgIGZyYW1lID0gQGludGVycEZyYW1lcy5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgeCArPSBmcmFtZS54XHJcbiAgICAgIHkgKz0gZnJhbWUueVxyXG4gICAgICBhbmltRnJhbWUgPSBmcmFtZS5hbmltRnJhbWVcclxuICAgICMgZWxzZVxyXG4gICAgIyAgIGFuaW1GcmFtZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXHJcbiAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QoQHRpbGVzLnJlY3QoYW5pbUZyYW1lKSlcclxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKVxyXG4gICAgeGFuY2hvciA9IDEuMFxyXG4gICAgeHNjYWxlID0gLTEuMFxyXG4gICAgaWYgQGZhY2luZ1JpZ2h0XHJcbiAgICAgIHhhbmNob3IgPSAwXHJcbiAgICAgIHhzY2FsZSA9IDEuMFxyXG4gICAgc3ByaXRlLnNldFNjYWxlWCh4c2NhbGUpXHJcbiAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCh4YW5jaG9yLCAwKSlcclxuXHJcbiAgdGFrZVN0ZXA6IC0+XHJcbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIGlmIEBwYXRoLmxlbmd0aCA+IDBcclxuICAgICAgICBzdGVwID0gQHBhdGguc3BsaWNlKDAsIDEpWzBdXHJcbiAgICAgICAgIyBjYy5sb2cgXCJ0YWtpbmcgc3RlcCB0byAje3N0ZXAueH0sICN7c3RlcC55fVwiXHJcbiAgICAgICAgQG1vdmUoc3RlcC54LCBzdGVwLnksIFsyLDMsNF0pXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB0aWNrOiAoZWxhcHNlZFR1cm5zKSAtPlxyXG4gICAgaWYgQGNkID4gMFxyXG4gICAgICBAY2QgLT0gZWxhcHNlZFR1cm5zIGlmIEBjZCA+IDBcclxuICAgICAgQGNkID0gMCBpZiBAY2QgPCAwXHJcbiAgICBpZiBAY2QgPT0gMFxyXG4gICAgICBAdGhpbmsoKVxyXG5cclxuICB0aGluazogLT5cclxuICAgIGNjLmxvZyBcInRoaW5rIG5vdCBpbXBsZW1lbnRlZCFcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmFpblxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkJyYWluID0gcmVxdWlyZSAnYnJhaW4vYnJhaW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5UaWxlc2hlZXQgPSByZXF1aXJlICdnZngvdGlsZXNoZWV0J1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAYW5pbUZyYW1lID0gMFxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIHRoaXNba10gPSB2XHJcbiAgICBzdXBlciByZXNvdXJjZXMudGlsZXNoZWV0cy5wbGF5ZXIsIEBhbmltRnJhbWVcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgdGhpbms6IC0+XHJcbiAgICBpZiBAdGFrZVN0ZXAoKVxyXG4gICAgICBAY2QgPSA1MFxyXG5cclxuICBhY3Q6IChneCwgZ3kpIC0+XHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoQHgsIEB5LCBneCwgZ3kpXHJcbiAgICBAd2Fsa1BhdGgocGF0aClcclxuICAgIGNjLmxvZyBcInBhdGggaXMgI3twYXRoLmxlbmd0aH0gbG9uZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2NhbGU6XHJcbiAgICBtaW46IDEuNVxyXG4gICAgbWF4OiA4LjBcclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjYwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbmNsYXNzIFNjZW5lIGV4dGVuZHMgY2MuU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBMYXllcjogTGF5ZXJcclxuICBTY2VuZTogU2NlbmVcclxuIiwiXHJcbiMgVGhpcyBpcyBmdWNraW5nIHRyYWdpYy5cclxuUElYRUxfRlVER0VfRkFDVE9SID0gMC41ICAjIGhvdyBtYW55IHBpeGVscyB0byByZW1vdmUgZnJvbSB0aGUgZWRnZSB0byByZW1vdmUgYmxlZWRcclxuU0NBTEVfRlVER0VfRkFDVE9SID0gMC4wMiAgIyBhZGRpdGlvbmFsIHNwcml0ZSBzY2FsZSB0byBlbnN1cmUgcHJvcGVyIHRpbGluZ1xyXG5cclxuVGlsZXNoZWV0QmF0Y2hOb2RlID0gY2MuU3ByaXRlQmF0Y2hOb2RlLmV4dGVuZCB7XHJcbiAgaW5pdDogKGZpbGVJbWFnZSwgY2FwYWNpdHkpIC0+XHJcbiAgICBAX3N1cGVyKGZpbGVJbWFnZSwgY2FwYWNpdHkpXHJcblxyXG4gIGNyZWF0ZVNwcml0ZTogKHRpbGVJbmRleCwgeCwgeSkgLT5cclxuICAgIHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGVXaXRoVGV4dHVyZShAZ2V0VGV4dHVyZSgpLCBAdGlsZXNoZWV0LnJlY3QodGlsZUluZGV4KSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKHgsIHkpXHJcbiAgICBzcHJpdGUuc2V0U2NhbGUoQHRpbGVzaGVldC5hZGp1c3RlZFNjYWxlLngsIEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS55KVxyXG4gICAgQGFkZENoaWxkIHNwcml0ZVxyXG4gICAgcmV0dXJuIHNwcml0ZVxyXG59XHJcblxyXG5jbGFzcyBUaWxlc2hlZXRcclxuICBjb25zdHJ1Y3RvcjogKEByZXNvdXJjZSwgQHdpZHRoLCBAaGVpZ2h0LCBAc3RyaWRlKSAtPlxyXG4gICAgQGFkanVzdGVkU2NhbGUgPVxyXG4gICAgICB4OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEB3aWR0aClcclxuICAgICAgeTogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAaGVpZ2h0KVxyXG5cclxuICByZWN0OiAodikgLT5cclxuICAgIHkgPSBNYXRoLmZsb29yKHYgLyBAc3RyaWRlKVxyXG4gICAgeCA9IHYgJSBAc3RyaWRlXHJcbiAgICByZXR1cm4gY2MucmVjdCh4ICogQHdpZHRoLCB5ICogQGhlaWdodCwgQHdpZHRoIC0gUElYRUxfRlVER0VfRkFDVE9SLCBAaGVpZ2h0IC0gUElYRUxfRlVER0VfRkFDVE9SKVxyXG5cclxuICBjcmVhdGVCYXRjaE5vZGU6IChjYXBhY2l0eSkgLT5cclxuICAgIGJhdGNoTm9kZSA9IG5ldyBUaWxlc2hlZXRCYXRjaE5vZGUoKVxyXG4gICAgYmF0Y2hOb2RlLnRpbGVzaGVldCA9IHRoaXNcclxuICAgIGJhdGNoTm9kZS5pbml0KEByZXNvdXJjZSwgY2FwYWNpdHkpXHJcbiAgICByZXR1cm4gYmF0Y2hOb2RlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QbGF5ZXIgPSByZXF1aXJlICdicmFpbi9wbGF5ZXInXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAdHVybkZyYW1lcyA9IDBcclxuICAgIEBtb2RlcyA9XHJcbiAgICAgIGludHJvOiBuZXcgSW50cm9Nb2RlKClcclxuICAgICAgZ2FtZTogbmV3IEdhbWVNb2RlKClcclxuXHJcbiAgbmV3Rmxvb3I6IC0+XHJcbiAgICBmbG9vcmdlbi5nZW5lcmF0ZSgpXHJcblxyXG4gIGN1cnJlbnRGbG9vcjogLT5cclxuICAgIHJldHVybiBAc3RhdGUuZmxvb3JzW0BzdGF0ZS5wbGF5ZXIuZmxvb3JdXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBjYy5sb2cgXCJuZXdHYW1lXCJcclxuICAgIEBzdGF0ZSA9IHtcclxuICAgICAgcnVubmluZzogZmFsc2VcclxuICAgICAgcGxheWVyOiBuZXcgUGxheWVyKHtcclxuICAgICAgICB4OiA0NFxyXG4gICAgICAgIHk6IDQ5XHJcbiAgICAgICAgZmxvb3I6IDFcclxuICAgICAgfSlcclxuICAgICAgZmxvb3JzOiBbXHJcbiAgICAgICAge31cclxuICAgICAgICBAbmV3Rmxvb3IoKVxyXG4gICAgICBdXHJcbiAgICB9XHJcblxyXG4gIHNldFR1cm5GcmFtZXM6IChjb3VudCkgLT5cclxuICAgIGlmIEB0dXJuRnJhbWVzIDwgY291bnRcclxuICAgICAgQHR1cm5GcmFtZXMgPSBjb3VudFxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy51bml0U2l6ZSA9IDE2XHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDE4XHJcbiAgICAgIGVsc2UgMFxyXG5cclxuICBnZnhDbGVhcjogLT5cclxuICAgIGlmIEBnZng/XHJcbiAgICAgIGlmIEBnZnguZmxvb3JMYXllcj9cclxuICAgICAgICBAcmVtb3ZlIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeCA9IHt9XHJcblxyXG4gIGdmeFJlbmRlckZsb29yOiAtPlxyXG4gICAgZmxvb3IgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyID0gbmV3IGNjLkxheWVyKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGdmeC5mbG9vckJhdGNoTm9kZSA9IHJlc291cmNlcy50aWxlc2hlZXRzLnRpbGVzMC5jcmVhdGVCYXRjaE5vZGUoKGZsb29yLndpZHRoICogZmxvb3IuaGVpZ2h0KSAvIDIpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5mbG9vckJhdGNoTm9kZSwgLTFcclxuICAgIGZvciBqIGluIFswLi4uZmxvb3IuaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLmZsb29yLndpZHRoXVxyXG4gICAgICAgIHYgPSBmbG9vci5nZXQoaSwgailcclxuICAgICAgICBpZiB2ICE9IDBcclxuICAgICAgICAgIEBnZnguZmxvb3JCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKEB0aWxlRm9yR3JpZFZhbHVlKHYpLCBpICogY2MudW5pdFNpemUsIGogKiBjYy51bml0U2l6ZSlcclxuXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoY29uZmlnLnNjYWxlLm1pbilcclxuICAgIEBhZGQgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4Q2VudGVyTWFwKClcclxuXHJcbiAgZ2Z4UGxhY2VNYXA6IChtYXBYLCBtYXBZLCBzY3JlZW5YLCBzY3JlZW5ZKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgeCA9IHNjcmVlblggLSAobWFwWCAqIHNjYWxlKVxyXG4gICAgeSA9IHNjcmVlblkgLSAobWFwWSAqIHNjYWxlKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHgsIHkpXHJcblxyXG4gIGdmeENlbnRlck1hcDogLT5cclxuICAgIGNlbnRlciA9IGNjLmdhbWUuY3VycmVudEZsb29yKCkuYmJveC5jZW50ZXIoKVxyXG4gICAgQGdmeFBsYWNlTWFwKGNlbnRlci54ICogY2MudW5pdFNpemUsIGNlbnRlci55ICogY2MudW5pdFNpemUsIGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMilcclxuXHJcbiAgZ2Z4U2NyZWVuVG9NYXBDb29yZHM6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6ICh4IC0gcG9zLngpIC8gc2NhbGVcclxuICAgICAgeTogKHkgLSBwb3MueSkgLyBzY2FsZVxyXG4gICAgfVxyXG5cclxuICBnZnhSZW5kZXJQbGF5ZXI6IC0+XHJcbiAgICBAZ2Z4LnBsYXllciA9IHt9XHJcbiAgICBAZ2Z4LnBsYXllci5zcHJpdGUgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jcmVhdGVTcHJpdGUoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGxheWVyLnNwcml0ZSwgMFxyXG5cclxuICBnZnhBZGp1c3RNYXBTY2FsZTogKGRlbHRhKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgc2NhbGUgKz0gZGVsdGFcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1heCBpZiBzY2FsZSA+IGNvbmZpZy5zY2FsZS5tYXhcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1pbiBpZiBzY2FsZSA8IGNvbmZpZy5zY2FsZS5taW5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShzY2FsZSlcclxuXHJcbiAgZ2Z4UmVuZGVyUGF0aDogKHBhdGgpIC0+XHJcbiAgICBpZiBAZ2Z4LnBhdGhCYXRjaE5vZGU/XHJcbiAgICAgIEBnZnguZmxvb3JMYXllci5yZW1vdmVDaGlsZCBAZ2Z4LnBhdGhCYXRjaE5vZGVcclxuICAgIHJldHVybiBpZiBwYXRoLmxlbmd0aCA9PSAwXHJcbiAgICBAZ2Z4LnBhdGhCYXRjaE5vZGUgPSByZXNvdXJjZXMudGlsZXNoZWV0cy50aWxlczAuY3JlYXRlQmF0Y2hOb2RlKHBhdGgubGVuZ3RoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGF0aEJhdGNoTm9kZVxyXG4gICAgZm9yIHAgaW4gcGF0aFxyXG4gICAgICBzcHJpdGUgPSBAZ2Z4LnBhdGhCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKDE3LCBwLnggKiBjYy51bml0U2l6ZSwgcC55ICogY2MudW5pdFNpemUpXHJcbiAgICAgIHNwcml0ZS5zZXRPcGFjaXR5KDEyOClcclxuXHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbihwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgQGdmeEFkanVzdE1hcFNjYWxlKGRlbHRhIC8gMjAwKVxyXG4gICAgQGdmeFBsYWNlTWFwKHBvcy54LCBwb3MueSwgeCwgeSlcclxuXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICAgIGNjLmdhbWUubmV3R2FtZSgpXHJcbiAgICBAZ2Z4Q2xlYXIoKVxyXG4gICAgQGdmeFJlbmRlckZsb29yKClcclxuICAgIEBnZnhSZW5kZXJQbGF5ZXIoKVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRTY2hlZHVsZXIoKS5zY2hlZHVsZUNhbGxiYWNrRm9yVGFyZ2V0KHRoaXMsIEB1cGRhdGUsIDEgLyA2MC4wLCBjYy5SRVBFQVRfRk9SRVZFUiwgMCwgZmFsc2UpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBjYy51bml0U2l6ZSlcclxuICAgIGdyaWRZID0gTWF0aC5mbG9vcihwb3MueSAvIGNjLnVuaXRTaXplKVxyXG5cclxuICAgICMgaWYgbm90IGNjLmdhbWUuc3RhdGUucnVubmluZ1xyXG4gICAgIyAgIGNjLmdhbWUuc3RhdGUucGxheWVyLmFjdChncmlkWCwgZ3JpZFkpXHJcbiAgICAjICAgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nID0gdHJ1ZVxyXG4gICAgIyAgIGNjLmxvZyBcInJ1bm5pbmdcIlxyXG5cclxuICAgIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxyXG4gICAgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhjYy5nYW1lLnN0YXRlLnBsYXllci54LCBjYy5nYW1lLnN0YXRlLnBsYXllci55LCBncmlkWCwgZ3JpZFkpXHJcbiAgICBAZ2Z4UmVuZGVyUGF0aChwYXRoKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnVwZGF0ZVNwcml0ZShAZ2Z4LnBsYXllci5zcHJpdGUpXHJcblxyXG4gICAgaWYgY2MuZ2FtZS50dXJuRnJhbWVzID4gMFxyXG4gICAgICBjYy5nYW1lLnR1cm5GcmFtZXMtLVxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICAgICBtaW5pbXVtQ0QgPSAxMDAwXHJcbiAgICAgICAgaWYgbWluaW11bUNEID4gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2RcclxuICAgICAgICAgIG1pbmltdW1DRCA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgIyBUT0RPOiBjaGVjayBjZCBvZiBhbGwgTlBDcyBvbiB0aGUgZmxvb3IgYWdhaW5zdCB0aGUgbWluaW11bUNEXHJcbiAgICAgICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudGljayhtaW5pbXVtQ0QpXHJcbiAgICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2QgPT0gMCAjIFdlIGp1c3QgcmFuLCB5ZXQgZGlkIG5vdGhpbmdcclxuICAgICAgICAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IGZhbHNlXHJcbiAgICAgICAgICBjYy5sb2cgXCJub3QgcnVubmluZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVNb2RlXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEludHJvTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiSW50cm9cIilcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5pbWFnZXMuc3BsYXNoc2NyZWVuXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKSlcclxuICAgIEBhZGQgQHNwcml0ZVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxyXG4gICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXHJcbiIsIlRpbGVzaGVldCA9IHJlcXVpcmUgXCJnZngvdGlsZXNoZWV0XCJcclxuXHJcbmltYWdlcyA9XHJcbiAgc3BsYXNoc2NyZWVuOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgdGlsZXMwOiAncmVzL3RpbGVzMC5wbmcnXHJcbiAgcGxheWVyOiAncmVzL3BsYXllci5wbmcnXHJcblxyXG50aWxlc2hlZXRzID1cclxuICB0aWxlczA6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnRpbGVzMCwgMTYsIDE2LCAxNilcclxuICBwbGF5ZXI6IG5ldyBUaWxlc2hlZXQoaW1hZ2VzLnBsYXllciwgMTIsIDE0LCAxOClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBpbWFnZXM6IGltYWdlc1xyXG4gIHRpbGVzaGVldHM6IHRpbGVzaGVldHNcclxuICBjb2Nvc1ByZWxvYWRMaXN0OiAoe3NyYzogdn0gZm9yIGssIHYgb2YgaW1hZ2VzKVxyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xyXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXHJcblxyXG5TSEFQRVMgPSBbXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uI1xyXG4gICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICAgICAjIyMjXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgIyMjIyMuLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG5dXHJcblxyXG5FTVBUWSA9IDBcclxuV0FMTCA9IDFcclxuRE9PUiA9IDJcclxuRklSU1RfUk9PTV9JRCA9IDVcclxuXHJcbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxyXG4gIHN3aXRjaFxyXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXHJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcclxuICAgIHdoZW4gdiA+PSBGSVJTVF9ST09NX0lEIHRoZW4gcmV0dXJuIHAuY29sb3IgMCwgMCwgNSArIE1hdGgubWluKDI0MCwgMTUgKyAodiAqIDIpKVxyXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcclxuXHJcbmNsYXNzIFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxyXG5cclxuICB3OiAtPiBAciAtIEBsXHJcbiAgaDogLT4gQGIgLSBAdFxyXG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXHJcbiAgYXNwZWN0OiAtPlxyXG4gICAgaWYgQGgoKSA+IDBcclxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIHNxdWFyZW5lc3M6IC0+XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXHJcblxyXG4gIGNlbnRlcjogLT5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcclxuICAgICAgeTogTWF0aC5mbG9vcigoQGIgKyBAdCkgLyAyKVxyXG4gICAgfVxyXG5cclxuICBjbG9uZTogLT5cclxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcclxuXHJcbiAgZXhwYW5kOiAocikgLT5cclxuICAgIGlmIEBhcmVhKClcclxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcclxuICAgICAgQHQgPSByLnQgaWYgQHQgPiByLnRcclxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcclxuICAgIGVsc2VcclxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXHJcbiAgICAgIEBsID0gci5sXHJcbiAgICAgIEB0ID0gci50XHJcbiAgICAgIEByID0gci5yXHJcbiAgICAgIEBiID0gci5iXHJcblxyXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcclxuXHJcbmNsYXNzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID0gRU1QVFlcclxuXHJcbiAgICBAZ2VuZXJhdGVTaGFwZSgpXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAc2V0KGksIDAsIFdBTEwpXHJcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIEBzZXQoMCwgaiwgV0FMTClcclxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxyXG5cclxuICByZWN0OiAoeCwgeSkgLT5cclxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0gPSB2XHJcblxyXG4gIGdldDogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgcmV0dXJuIHYgaWYgdiAhPSBFTVBUWVxyXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXHJcblxyXG4gIHBsYWNlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxyXG5cclxuICBmaXRzOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBtdiA9IG1hcC5nZXQoeCArIGksIHkgKyBqKVxyXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGRvb3JFbGlnaWJsZTogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXHJcbiAgICByb29tc1NlZW4gPSB7fVxyXG4gICAgdmFsdWVzID0gW1xyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogKyAxKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXHJcbiAgICBdXHJcbiAgICBmb3IgdiBpbiB2YWx1ZXNcclxuICAgICAgaWYgdlxyXG4gICAgICAgIGlmIHYgPT0gMVxyXG4gICAgICAgICAgd2FsbE5laWdoYm9ycysrXHJcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcclxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcclxuICAgIHJvb21zID0gT2JqZWN0LmtleXMocm9vbXNTZWVuKS5zb3J0IChhLCBiKSAtPiBhLWJcclxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxyXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXHJcbiAgICBpZiAod2FsbE5laWdoYm9ycyA9PSAyKSBhbmQgKHJvb21Db3VudCA9PSAyKSBhbmQgKEByb29taWQgaW4gcm9vbXMpXHJcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcclxuICAgICAgICByZXR1cm4gcm9vbXNcclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXHJcbiAgICAgICAgaWYgcm9vbXNbMF0gIT0gLTEgYW5kIEByb29taWQgaW4gcm9vbXNcclxuICAgICAgICAgIHJldHVybiBbaSwgal1cclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXHJcbiAgICBiYm94VGVtcC5leHBhbmQgQHJlY3QoeCwgeSlcclxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cclxuXHJcbiAgZmluZEJlc3RTcG90OiAobWFwKSAtPlxyXG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxyXG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcclxuICAgIG1pblggPSAtMVxyXG4gICAgbWluWSA9IC0xXHJcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxyXG4gICAgc2VhcmNoTCA9IG1hcC5iYm94LmwgLSBAd2lkdGhcclxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXHJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcclxuICAgIHNlYXJjaEIgPSBtYXAuYmJveC5iXHJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cclxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXHJcbiAgICAgICAgaWYgQGZpdHMobWFwLCBpLCBqKVxyXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXHJcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IEBkb29yTG9jYXRpb24gbWFwLCBpLCBqXHJcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXHJcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtaW5BcmVhID0gYXJlYVxyXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXHJcbiAgICAgICAgICAgICAgbWluWCA9IGlcclxuICAgICAgICAgICAgICBtaW5ZID0galxyXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXHJcblxyXG5jbGFzcyBTaGFwZVJvb21UZW1wbGF0ZSBleHRlbmRzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cclxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXHJcbiAgICB3ID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcclxuICAgIEB3aWR0aCA9IHdcclxuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXHJcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxyXG4gICAgaSA9IDBcclxuICAgIGogPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxyXG4gICAgICAgIHYgPSBzd2l0Y2ggY1xyXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXHJcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcclxuICAgICAgICAgIGVsc2UgMFxyXG4gICAgICAgIGlmIHZcclxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcclxuICAgICAgICBpKytcclxuICAgICAgaisrXHJcbiAgICAgIGkgPSAwXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJyb29tIGNyZWF0ZWQgI3tAcmVjdH1cIlxyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEBzZWVkKSAtPlxyXG4gICAgQHJhbmRSZXNldCgpXHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPVxyXG4gICAgICAgICAgdHlwZTogRU1QVFlcclxuICAgICAgICAgIHg6IGlcclxuICAgICAgICAgIHk6IGpcclxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxyXG4gICAgQHJvb21zID0gW11cclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XHJcblxyXG4gIGdldDogKGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgcmV0dXJuIEBncmlkW2ldW2pdLnR5cGVcclxuICAgIHJldHVybiAwXHJcblxyXG4gIGFkZFJvb206IChyb29tVGVtcGxhdGUsIHgsIHkpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxyXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcclxuICAgIHIgPSByb29tVGVtcGxhdGUucmVjdCh4LCB5KVxyXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxyXG4gICAgQGJib3guZXhwYW5kKHIpXHJcbiAgICAjIGNvbnNvbGUubG9nIFwibmV3IG1hcCBiYm94ICN7QGJib3h9XCJcclxuXHJcbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxyXG4gICAgciA9IEByYW5kKDEwMClcclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDEwIDwgciA8IDIwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNSArIEByYW5kKDEwKSwgMywgcm9vbWlkICAgICAgICAgICAgICAgICAgIyBob3Jpem9udGFsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xyXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cclxuXHJcbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxyXG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcclxuICAgIGlmIEByb29tcy5sZW5ndGggPT0gMFxyXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXHJcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIGVsc2VcclxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXHJcbiAgICAgIGlmIHggPCAwXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBnZW5lcmF0ZVJvb21zOiAoY291bnQpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxyXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxyXG5cclxuICAgICAgYWRkZWQgPSBmYWxzZVxyXG4gICAgICB3aGlsZSBub3QgYWRkZWRcclxuICAgICAgICBhZGRlZCA9IEBnZW5lcmF0ZVJvb20gcm9vbWlkXHJcblxyXG5nZW5lcmF0ZSA9IC0+XHJcbiAgbWFwID0gbmV3IE1hcCA4MCwgODAsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IChzY29yZUZ1bmN0aW9uKSAtPlxyXG4gICAgQGNvbnRlbnQgPSBbXVxyXG4gICAgQHNjb3JlRnVuY3Rpb24gPSBzY29yZUZ1bmN0aW9uXHJcblxyXG4gIHB1c2g6IChlbGVtZW50KSAtPlxyXG4gICAgIyBBZGQgdGhlIG5ldyBlbGVtZW50IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxyXG4gICAgQGNvbnRlbnQucHVzaChlbGVtZW50KVxyXG5cclxuICAgICMgQWxsb3cgaXQgdG8gc2luayBkb3duLlxyXG4gICAgQHNpbmtEb3duKEBjb250ZW50Lmxlbmd0aCAtIDEpXHJcblxyXG4gIHBvcDogLT5cclxuICAgICMgU3RvcmUgdGhlIGZpcnN0IGVsZW1lbnQgc28gd2UgY2FuIHJldHVybiBpdCBsYXRlci5cclxuICAgIHJlc3VsdCA9IEBjb250ZW50WzBdXHJcbiAgICAjIEdldCB0aGUgZWxlbWVudCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cclxuICAgIGVuZCA9IEBjb250ZW50LnBvcCgpXHJcbiAgICAjIElmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgbGVmdCwgcHV0IHRoZSBlbmQgZWxlbWVudCBhdCB0aGVcclxuICAgICMgc3RhcnQsIGFuZCBsZXQgaXQgYnViYmxlIHVwLlxyXG4gICAgaWYgQGNvbnRlbnQubGVuZ3RoID4gMFxyXG4gICAgICBAY29udGVudFswXSA9IGVuZFxyXG4gICAgICBAYnViYmxlVXAoMClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIHJlbW92ZTogKG5vZGUpIC0+XHJcbiAgICBpID0gQGNvbnRlbnQuaW5kZXhPZihub2RlKVxyXG5cclxuICAgICMgV2hlbiBpdCBpcyBmb3VuZCwgdGhlIHByb2Nlc3Mgc2VlbiBpbiAncG9wJyBpcyByZXBlYXRlZFxyXG4gICAgIyB0byBmaWxsIHVwIHRoZSBob2xlLlxyXG4gICAgZW5kID0gQGNvbnRlbnQucG9wKClcclxuXHJcbiAgICBpZiBpICE9IEBjb250ZW50Lmxlbmd0aCAtIDFcclxuICAgICAgQGNvbnRlbnRbaV0gPSBlbmRcclxuXHJcbiAgICBpZiBAc2NvcmVGdW5jdGlvbihlbmQpIDwgQHNjb3JlRnVuY3Rpb24obm9kZSlcclxuICAgICAgQHNpbmtEb3duKGkpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBidWJibGVVcChpKVxyXG5cclxuICBzaXplOiAtPlxyXG4gICAgcmV0dXJuIEBjb250ZW50Lmxlbmd0aFxyXG5cclxuICByZXNjb3JlRWxlbWVudDogKG5vZGUpIC0+XHJcbiAgICBAc2lua0Rvd24oQGNvbnRlbnQuaW5kZXhPZihub2RlKSlcclxuXHJcbiAgc2lua0Rvd246IChuKSAtPlxyXG4gICAgIyBGZXRjaCB0aGUgZWxlbWVudCB0aGF0IGhhcyB0byBiZSBzdW5rLlxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcblxyXG4gICAgIyBXaGVuIGF0IDAsIGFuIGVsZW1lbnQgY2FuIG5vdCBzaW5rIGFueSBmdXJ0aGVyLlxyXG4gICAgd2hpbGUgKG4gPiAwKVxyXG4gICAgICAjIENvbXB1dGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaW5kZXgsIGFuZCBmZXRjaCBpdC5cclxuICAgICAgcGFyZW50TiA9ICgobiArIDEpID4+IDEpIC0gMVxyXG4gICAgICBwYXJlbnQgPSBAY29udGVudFtwYXJlbnROXVxyXG4gICAgICAjIFN3YXAgdGhlIGVsZW1lbnRzIGlmIHRoZSBwYXJlbnQgaXMgZ3JlYXRlci5cclxuICAgICAgaWYgQHNjb3JlRnVuY3Rpb24oZWxlbWVudCkgPCBAc2NvcmVGdW5jdGlvbihwYXJlbnQpXHJcbiAgICAgICAgQGNvbnRlbnRbcGFyZW50Tl0gPSBlbGVtZW50XHJcbiAgICAgICAgQGNvbnRlbnRbbl0gPSBwYXJlbnRcclxuICAgICAgICAjIFVwZGF0ZSAnbicgdG8gY29udGludWUgYXQgdGhlIG5ldyBwb3NpdGlvbi5cclxuICAgICAgICBuID0gcGFyZW50TlxyXG5cclxuICAgICAgIyBGb3VuZCBhIHBhcmVudCB0aGF0IGlzIGxlc3MsIG5vIG5lZWQgdG8gc2luayBhbnkgZnVydGhlci5cclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gIGJ1YmJsZVVwOiAobikgLT5cclxuICAgICMgTG9vayB1cCB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIGl0cyBzY29yZS5cclxuICAgIGxlbmd0aCA9IEBjb250ZW50Lmxlbmd0aFxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcbiAgICBlbGVtU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihlbGVtZW50KVxyXG5cclxuICAgIHdoaWxlKHRydWUpXHJcbiAgICAgICMgQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXHJcbiAgICAgIGNoaWxkMk4gPSAobiArIDEpIDw8IDFcclxuICAgICAgY2hpbGQxTiA9IGNoaWxkMk4gLSAxXHJcbiAgICAgICMgVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsXHJcbiAgICAgICMgaWYgYW55LlxyXG4gICAgICBzd2FwID0gbnVsbFxyXG4gICAgICAjIElmIHRoZSBmaXJzdCBjaGlsZCBleGlzdHMgKGlzIGluc2lkZSB0aGUgYXJyYXkpLi4uXHJcbiAgICAgIGlmIGNoaWxkMU4gPCBsZW5ndGhcclxuICAgICAgICAjIExvb2sgaXQgdXAgYW5kIGNvbXB1dGUgaXRzIHNjb3JlLlxyXG4gICAgICAgIGNoaWxkMSA9IEBjb250ZW50W2NoaWxkMU5dXHJcbiAgICAgICAgY2hpbGQxU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihjaGlsZDEpXHJcblxyXG4gICAgICAgICMgSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXHJcbiAgICAgICAgaWYgY2hpbGQxU2NvcmUgPCBlbGVtU2NvcmVcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDFOXHJcblxyXG4gICAgICAjIERvIHRoZSBzYW1lIGNoZWNrcyBmb3IgdGhlIG90aGVyIGNoaWxkLlxyXG4gICAgICBpZiBjaGlsZDJOIDwgbGVuZ3RoXHJcbiAgICAgICAgY2hpbGQyID0gQGNvbnRlbnRbY2hpbGQyTl1cclxuICAgICAgICBjaGlsZDJTY29yZSA9IEBzY29yZUZ1bmN0aW9uKGNoaWxkMilcclxuICAgICAgICBpZiBjaGlsZDJTY29yZSA8IChzd2FwID09IG51bGwgPyBlbGVtU2NvcmUgOiBjaGlsZDFTY29yZSlcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOXHJcblxyXG4gICAgICAjIElmIHRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIG1vdmVkLCBzd2FwIGl0LCBhbmQgY29udGludWUuXHJcbiAgICAgIGlmIHN3YXAgIT0gbnVsbFxyXG4gICAgICAgIEBjb250ZW50W25dID0gQGNvbnRlbnRbc3dhcF1cclxuICAgICAgICBAY29udGVudFtzd2FwXSA9IGVsZW1lbnRcclxuICAgICAgICBuID0gc3dhcFxyXG5cclxuICAgICAgIyBPdGhlcndpc2UsIHdlIGFyZSBkb25lLlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbmNsYXNzIEFTdGFyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZGlzdGFuY2UgPSA5OTk5OVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5oZWFwZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBjcmVhdGVIZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBCaW5hcnlIZWFwIChub2RlKSAtPlxyXG4gICAgICByZXR1cm4gbm9kZS5kaXN0YW5jZVxyXG5cclxuICBzZWFyY2g6IChzdGFydCwgZW5kKSAtPlxyXG4gICAgZ3JpZCA9IEBmbG9vci5ncmlkXHJcbiAgICBoZXVyaXN0aWMgPSBAbWFuaGF0dGFuXHJcblxyXG4gICAgc3RhcnQuZGlzdGFuY2UgPSAwXHJcblxyXG4gICAgaGVhcCA9IEBjcmVhdGVIZWFwKClcclxuICAgIGhlYXAucHVzaChzdGFydClcclxuICAgIHN0YXJ0LmhlYXBlZCA9IHRydWVcclxuXHJcbiAgICB3aGlsZSBoZWFwLnNpemUoKSA+IDBcclxuICAgICAgY3VycmVudE5vZGUgPSBoZWFwLnBvcCgpXHJcbiAgICAgIGN1cnJlbnROb2RlLnZpc2l0ZWQgPSB0cnVlXHJcblxyXG4gICAgICAjIGNjLmxvZyBcImNvbnNpZGVyaW5nICN7Y3VycmVudE5vZGUueH0sICN7Y3VycmVudE5vZGUueX1cIlxyXG5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICBjdXJyID0gZW5kXHJcbiAgICAgICAgd2hpbGUgY3Vyci5wYXJlbnRcclxuICAgICAgICAgIHJldC5wdXNoKHt4OmN1cnIueCwgeTpjdXJyLnl9KVxyXG4gICAgICAgICAgY3VyciA9IGN1cnIucGFyZW50XHJcbiAgICAgICAgcmV0dXJuIHJldC5yZXZlcnNlKClcclxuXHJcbiAgICAgICMgRmluZCBhbGwgbmVpZ2hib3JzIGZvciB0aGUgY3VycmVudCBub2RlLlxyXG4gICAgICBuZWlnaGJvcnMgPSBAbmVpZ2hib3JzKGdyaWQsIGN1cnJlbnROb2RlKVxyXG5cclxuICAgICAgZm9yIG5laWdoYm9yIGluIG5laWdoYm9yc1xyXG4gICAgICAgIGlmIG5laWdoYm9yLnZpc2l0ZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIGNjLmxvZyBcImNoZWNraW5nIFsje2N1cnJlbnROb2RlLnh9LCAje2N1cnJlbnROb2RlLnl9XSAtPiBbI3tuZWlnaGJvci54fSwgI3tuZWlnaGJvci55fV1cIlxyXG5cclxuICAgICAgICAjIFRoZSBkaXN0YW5jZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgIyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXRoIHdlIGhhdmUgYXJyaXZlZCBhdCB0aGlzIG5laWdoYm9yIGlzIHRoZSBzaG9ydGVzdCBvbmUgd2UgaGF2ZSBzZWVuIHlldC5cclxuICAgICAgICBhbHQgPSBjdXJyZW50Tm9kZS5kaXN0YW5jZSArIDFcclxuICAgICAgICBpc0RpYWdvbmFsID0gKGN1cnJlbnROb2RlLnggIT0gbmVpZ2hib3IueCkgYW5kIChjdXJyZW50Tm9kZS55ICE9IG5laWdoYm9yLnkpXHJcbiAgICAgICAgaWYgaXNEaWFnb25hbFxyXG4gICAgICAgICAgYWx0ICs9IDAuMDAxXHJcblxyXG4gICAgICAgIGlmIChhbHQgPD0gbmVpZ2hib3IuZGlzdGFuY2UpIGFuZCBub3QgbmVpZ2hib3IudmlzaXRlZFxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLlxyXG4gICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBhbHRcclxuICAgICAgICAgIG5laWdoYm9yLnBhcmVudCA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgICBjYy5sb2cgXCJuZWlnaGJvciBbI3tuZWlnaGJvci54fSwgI3tuZWlnaGJvci55fV0gbm93IHZpYSAje2N1cnJlbnROb2RlLnh9LCAje2N1cnJlbnROb2RlLnl9OiAje25laWdoYm9yLmRpc3RhbmNlfVwiXHJcbiAgICAgICAgICBpZiBuZWlnaGJvci5oZWFwZWRcclxuICAgICAgICAgICAgaGVhcC5yZXNjb3JlRWxlbWVudChuZWlnaGJvcilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgaGVhcC5wdXNoKG5laWdoYm9yKVxyXG4gICAgICAgICAgICBuZWlnaGJvci5oZWFwZWQgPSB0cnVlXHJcblxyXG4gICAgY2MubG9nIFwid2hpbGUgbG9vcCBlbmRlZFwiXHJcblxyXG4gICAgY2MubG9nIFwic3RhcnQgI3tzdGFydC54fSwgI3tzdGFydC55fVwiXHJcbiAgICBjYy5sb2cgXCJlbmQgI3tlbmQueH0sICN7ZW5kLnl9XCJcclxuXHJcbiAgICAjIGZvciB4IGluIFswLi4uQGZsb29yLndpZHRoXVxyXG4gICAgIyAgIGZvciB5IGluIFswLi4uQGZsb29yLmhlaWdodF1cclxuICAgICMgICAgIGN1cnIgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgIyAgICAgaWYgY3Vyci5wYXJlbnRcclxuICAgICMgICAgICAgcmV0LnB1c2goe3g6Y3Vyci54LCB5OmN1cnIueX0pXHJcbiAgICAjIHJldHVybiByZXRcclxuXHJcbiAgICByZXR1cm4gW11cclxuXHJcbiAgbmVpZ2hib3JzOiAoZ3JpZCwgbm9kZSkgLT5cclxuICAgIHJldCA9IFtdXHJcbiAgICB4ID0gbm9kZS54XHJcbiAgICB5ID0gbm9kZS55XHJcblxyXG4gICAgIyBTb3V0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ktMV0pXHJcblxyXG4gICAgIyBTb3V0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3krMV0pXHJcblxyXG4gICAgIyBOb3J0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3krMV0pXHJcblxyXG4gICAgIyBXZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beV0pXHJcblxyXG4gICAgIyBFYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beV0pXHJcblxyXG4gICAgIyBTb3V0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beS0xXSlcclxuXHJcbiAgICAjIE5vcnRoXHJcbiAgICBpZiBncmlkW3hdIGFuZCBncmlkW3hdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5KzFdKVxyXG5cclxuICAgIHJldHVybiByZXRcclxuXHJcbmNsYXNzIFBhdGhmaW5kZXJcclxuICBjb25zdHJ1Y3RvcjogKEBmbG9vciwgQGZsYWdzKSAtPlxyXG5cclxuICBjYWxjOiAoc3RhcnRYLCBzdGFydFksIGRlc3RYLCBkZXN0WSkgLT5cclxuICAgIGFzdGFyID0gbmV3IEFTdGFyIEBmbG9vclxyXG4gICAgcmV0dXJuIGFzdGFyLnNlYXJjaChAZmxvb3IuZ3JpZFtzdGFydFhdW3N0YXJ0WV0sIEBmbG9vci5ncmlkW2Rlc3RYXVtkZXN0WV0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhmaW5kZXJcclxuIl19
;