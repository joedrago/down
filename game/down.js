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


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('n6LVrX');
},{}],"brain/brain":[function(require,module,exports){
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


},{"brain/brain":"KsM6/6","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/pathfinder":"2ZcY+C"}],"config":[function(require,module,exports){
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


},{}],"gfx/tilesheet":[function(require,module,exports){
module.exports=require('2l7Ub8');
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


},{"base/mode":"mhMvP9","config":"tWG/YV","resources":"NN+gjI","world/floorgen":"4WaFsS","world/pathfinder":"2ZcY+C"}],"mode/game":[function(require,module,exports){
module.exports=require('fSCZ8s');
},{}],"mode/intro":[function(require,module,exports){
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1QixpQkFBdkI7O0FBRUEsQ0FGQSxDQUVlLENBQUYsRUFBUSxDQUFSLElBQWI7Q0FBNkIsQ0FDM0IsQ0FBTSxDQUFOLEtBQVE7Q0FDTixFQURNLENBQUQ7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxHQUVBLFdBQUE7Q0FDQyxFQUFpQixDQUFqQixPQUFELEdBQUE7Q0FMeUIsRUFDckI7Q0FEcUIs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WCxDQUFOLEdBdklBIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsInZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIHNpZ25pZmljYW5jZSA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxuXHJcbnZhciBvdmVyZmxvdywgc3RhcnRkZW5vbTsgLy9udW1iZXJzXHJcblxyXG5cclxudmFyIG9sZFJhbmRvbSA9IE1hdGgucmFuZG9tO1xyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvdmVyUmlkZUdsb2JhbCkge1xyXG4gIGlmICghc2VlZCkge1xyXG4gICAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICAgIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9sZFJhbmRvbTtcclxuICB9XHJcbiAgdmFyIGtleSA9IFtdO1xyXG4gIHZhciBhcmM0O1xyXG5cclxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cclxuICBzZWVkID0gbWl4a2V5KGZsYXR0ZW4oc2VlZCwgMyksIGtleSk7XHJcblxyXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxyXG4gIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgZnVuY3Rpb24gcmFuZG9tKCkgeyAgLy8gQ2xvc3VyZSB0byByZXR1cm4gYSByYW5kb20gZG91YmxlOlxyXG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKTsgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XHJcbiAgICB2YXIgZCA9IHN0YXJ0ZGVub207ICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxyXG4gICAgdmFyIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXHJcbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcclxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxyXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXHJcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxyXG4gICAgfVxyXG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcclxuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXHJcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgTWF0aCB1bnRpbFxyXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cclxuICAgIH1cclxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxyXG4gIH1cclxuICByYW5kb20uc2VlZCA9IHNlZWQ7XHJcbiAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICBNYXRoWydyYW5kb20nXSA9IHJhbmRvbTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybiB0aGUgc2VlZCB0aGF0IHdhcyB1c2VkXHJcbiAgcmV0dXJuIHJhbmRvbTtcclxufTtcclxuXHJcbi8vXHJcbi8vIEFSQzRcclxuLy9cclxuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxyXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cclxuLy9cclxuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcclxuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxyXG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXHJcbi8vXHJcbi8qKiBAY29uc3RydWN0b3IgKi9cclxuZnVuY3Rpb24gQVJDNChrZXkpIHtcclxuICB2YXIgdCwgdSwgbWUgPSB0aGlzLCBrZXlsZW4gPSBrZXkubGVuZ3RoO1xyXG4gIHZhciBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gbWUubSA9IDA7XHJcbiAgbWUuUyA9IFtdO1xyXG4gIG1lLmMgPSBbXTtcclxuXHJcbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cclxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XHJcblxyXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXHJcbiAgd2hpbGUgKGkgPCB3aWR0aCkgeyBtZS5TW2ldID0gaSsrOyB9XHJcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcclxuICAgIHQgPSBtZS5TW2ldO1xyXG4gICAgaiA9IGxvd2JpdHMoaiArIHQgKyBrZXlbaSAlIGtleWxlbl0pO1xyXG4gICAgdSA9IG1lLlNbal07XHJcbiAgICBtZS5TW2ldID0gdTtcclxuICAgIG1lLlNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIG1lLmcgPSBmdW5jdGlvbiBnZXRuZXh0KGNvdW50KSB7XHJcbiAgICB2YXIgcyA9IG1lLlM7XHJcbiAgICB2YXIgaSA9IGxvd2JpdHMobWUuaSArIDEpOyB2YXIgdCA9IHNbaV07XHJcbiAgICB2YXIgaiA9IGxvd2JpdHMobWUuaiArIHQpOyB2YXIgdSA9IHNbal07XHJcbiAgICBzW2ldID0gdTtcclxuICAgIHNbal0gPSB0O1xyXG4gICAgdmFyIHIgPSBzW2xvd2JpdHModCArIHUpXTtcclxuICAgIHdoaWxlICgtLWNvdW50KSB7XHJcbiAgICAgIGkgPSBsb3diaXRzKGkgKyAxKTsgdCA9IHNbaV07XHJcbiAgICAgIGogPSBsb3diaXRzKGogKyB0KTsgdSA9IHNbal07XHJcbiAgICAgIHNbaV0gPSB1O1xyXG4gICAgICBzW2pdID0gdDtcclxuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7XHJcbiAgICBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gIH07XHJcbiAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgLy8gU2VlIGh0dHA6Ly93d3cucnNhLmNvbS9yc2FsYWJzL25vZGUuYXNwP2lkPTIwMDlcclxuICBtZS5nKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuLyoqIEBwYXJhbSB7T2JqZWN0PX0gcmVzdWx0IFxyXG4gICogQHBhcmFtIHtzdHJpbmc9fSBwcm9wXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHR5cCAqL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgsIHJlc3VsdCwgcHJvcCwgdHlwKSB7XHJcbiAgcmVzdWx0ID0gW107XHJcbiAgdHlwID0gdHlwZW9mKG9iaik7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICBpZiAocHJvcC5pbmRleE9mKCdTJykgPCA1KSB7ICAgIC8vIEF2b2lkIEZGMyBidWcgKGxvY2FsL3Nlc3Npb25TdG9yYWdlKVxyXG4gICAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiBvYmogKyAodHlwICE9ICdzdHJpbmcnID8gJ1xcMCcgOiAnJykpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG4vKiogQHBhcmFtIHtudW1iZXI9fSBzbWVhciBcclxuICAqIEBwYXJhbSB7bnVtYmVyPX0gaiAqL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5LCBzbWVhciwgaikge1xyXG4gIHNlZWQgKz0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgc2VlZCBpcyBhIHN0cmluZ1xyXG4gIHNtZWFyID0gMDtcclxuICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7IGorKykge1xyXG4gICAga2V5W2xvd2JpdHMoaildID1cclxuICAgICAgbG93Yml0cygoc21lYXIgXj0ga2V5W2xvd2JpdHMoaildICogMTkpICsgc2VlZC5jaGFyQ29kZUF0KGopKTtcclxuICB9XHJcbiAgc2VlZCA9ICcnO1xyXG4gIGZvciAoaiBpbiBrZXkpIHsgc2VlZCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleVtqXSk7IH1cclxuICByZXR1cm4gc2VlZDtcclxufVxyXG5cclxuLy9cclxuLy8gbG93Yml0cygpXHJcbi8vIEEgcXVpY2sgXCJuIG1vZCB3aWR0aFwiIGZvciB3aWR0aCBhIHBvd2VyIG9mIDIuXHJcbi8vXHJcbmZ1bmN0aW9uIGxvd2JpdHMobikgeyByZXR1cm4gbiAmICh3aWR0aCAtIDEpOyB9XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKTtcclxuc2lnbmlmaWNhbmNlID0gTWF0aC5wb3coMiwgc2lnbmlmaWNhbmNlKTtcclxub3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyO1xyXG4iLCIjIGhvdyBtYW55IHBpeGVscyBjYW4geW91IGRyYWcgYmVmb3JlIGl0IGlzIGFjdHVhbGx5IGNvbnNpZGVyZWQgYSBkcmFnXHJcbkVOR0FHRV9EUkFHX0RJU1RBTkNFID0gMzBcclxuXHJcbklucHV0TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG4gICAgQHNldE1vdXNlRW5hYmxlZCh0cnVlKVxyXG4gICAgQHRyYWNrZWRUb3VjaGVzID0gW11cclxuXHJcbiAgY2FsY0Rpc3RhbmNlOiAoeDEsIHkxLCB4MiwgeTIpIC0+XHJcbiAgICBkeCA9IHgyIC0geDFcclxuICAgIGR5ID0geTIgLSB5MVxyXG4gICAgcmV0dXJuIE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG5cclxuICBzZXREcmFnUG9pbnQ6IC0+XHJcbiAgICBAZHJhZ1ggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgQGRyYWdZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgY2FsY1BpbmNoQW5jaG9yOiAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIEBwaW5jaFggPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueCArIEB0cmFja2VkVG91Y2hlc1sxXS54KSAvIDIpXHJcbiAgICAgIEBwaW5jaFkgPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueSArIEB0cmFja2VkVG91Y2hlc1sxXS55KSAvIDIpXHJcbiAgICAgICMgY2MubG9nIFwicGluY2ggYW5jaG9yIHNldCBhdCAje0BwaW5jaFh9LCAje0BwaW5jaFl9XCJcclxuXHJcbiAgYWRkVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGZvciB0IGluIEB0cmFja2VkVG91Y2hlc1xyXG4gICAgICBpZiB0LmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMucHVzaCB7XHJcbiAgICAgIGlkOiBpZFxyXG4gICAgICB4OiB4XHJcbiAgICAgIHk6IHlcclxuICAgIH1cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMlxyXG4gICAgICAjIFdlIGp1c3QgYWRkZWQgYSBzZWNvbmQgdG91Y2ggc3BvdC4gQ2FsY3VsYXRlIHRoZSBhbmNob3IgZm9yIHBpbmNoaW5nIG5vd1xyXG4gICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICNjYy5sb2cgXCJhZGRpbmcgdG91Y2ggI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHJlbW92ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgICAgaWYgaW5kZXggPCAyXHJcbiAgICAgICAgIyBXZSBqdXN0IGZvcmdvdCBvbmUgb2Ygb3VyIHBpbmNoIHRvdWNoZXMuIFBpY2sgYSBuZXcgYW5jaG9yIHNwb3QuXHJcbiAgICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAgICNjYy5sb2cgXCJmb3JnZXR0aW5nIGlkICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICB1cGRhdGVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS54ID0geFxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnkgPSB5XHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQGRyYWdnaW5nID0gZmFsc2VcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEBhZGRUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+IDFcclxuICAgICAgIyBUaGV5J3JlIHBpbmNoaW5nLCBkb24ndCBldmVuIGJvdGhlciB0byBlbWl0IGEgY2xpY2tcclxuICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgcHJldkRpc3RhbmNlID0gMFxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIHByZXZEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgcHJldlggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgICBwcmV2WSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHVwZGF0ZVRvdWNoKHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55KVxyXG5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAjIHNpbmdsZSB0b3VjaCwgY29uc2lkZXIgZHJhZ2dpbmdcclxuICAgICAgZHJhZ0Rpc3RhbmNlID0gQGNhbGNEaXN0YW5jZSBAZHJhZ1gsIEBkcmFnWSwgQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55XHJcbiAgICAgIGlmIEBkcmFnZ2luZyBvciAoZHJhZ0Rpc3RhbmNlID4gRU5HQUdFX0RSQUdfRElTVEFOQ0UpXHJcbiAgICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG4gICAgICAgIGlmIGRyYWdEaXN0YW5jZSA+IDAuNVxyXG4gICAgICAgICAgZHggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueCAtIEBkcmFnWFxyXG4gICAgICAgICAgZHkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueSAtIEBkcmFnWVxyXG4gICAgICAgICAgI2NjLmxvZyBcInNpbmdsZSBkcmFnOiAje2R4fSwgI3tkeX1cIlxyXG4gICAgICAgICAgQG1vZGUub25EcmFnKGR4LCBkeSlcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuXHJcbiAgICBlbHNlIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICAjIGF0IGxlYXN0IHR3byBmaW5nZXJzIHByZXNlbnQsIGNoZWNrIGZvciBwaW5jaC96b29tXHJcbiAgICAgIGN1cnJEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICAgIGRlbHRhRGlzdGFuY2UgPSBjdXJyRGlzdGFuY2UgLSBwcmV2RGlzdGFuY2VcclxuICAgICAgaWYgZGVsdGFEaXN0YW5jZSAhPSAwXHJcbiAgICAgICAgI2NjLmxvZyBcImRpc3RhbmNlIGRyYWdnZWQgYXBhcnQ6ICN7ZGVsdGFEaXN0YW5jZX0gW2FuY2hvcjogI3tAcGluY2hYfSwgI3tAcGluY2hZfV1cIlxyXG4gICAgICAgIEBtb2RlLm9uWm9vbShAcGluY2hYLCBAcGluY2hZLCBkZWx0YURpc3RhbmNlKVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxIGFuZCBub3QgQGRyYWdnaW5nXHJcbiAgICAgIHBvcyA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKVxyXG4gICAgICAjY2MubG9nIFwiY2xpY2sgYXQgI3twb3MueH0sICN7cG9zLnl9XCJcclxuICAgICAgQG1vZGUub25DbGljayhwb3MueCwgcG9zLnkpXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAcmVtb3ZlVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuXHJcbiAgb25TY3JvbGxXaGVlbDogKGV2KSAtPlxyXG4gICAgcG9zID0gZXYuZ2V0TG9jYXRpb24oKVxyXG4gICAgQG1vZGUub25ab29tKHBvcy54LCBwb3MueSwgZXYuZ2V0V2hlZWxEZWx0YSgpKVxyXG59XHJcblxyXG5HZnhMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbn1cclxuXHJcbk1vZGVTY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcblxyXG4gICAgQGlucHV0ID0gbmV3IElucHV0TGF5ZXIoKVxyXG4gICAgQGlucHV0LmluaXQoQG1vZGUpXHJcbiAgICBAYWRkQ2hpbGQoQGlucHV0KVxyXG5cclxuICAgIEBnZnggPSBuZXcgR2Z4TGF5ZXIoKVxyXG4gICAgQGdmeC5pbml0KClcclxuICAgIEBhZGRDaGlsZChAZ2Z4KVxyXG5cclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAbW9kZS5vbkFjdGl2YXRlKClcclxufVxyXG5cclxuY2xhc3MgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XHJcbiAgICBAc2NlbmUgPSBuZXcgTW9kZVNjZW5lKClcclxuICAgIEBzY2VuZS5pbml0KHRoaXMpXHJcbiAgICBAc2NlbmUucmV0YWluKClcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgaWYgY2Muc2F3T25lU2NlbmU/XHJcbiAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucG9wU2NlbmUoKVxyXG4gICAgZWxzZVxyXG4gICAgICBjYy5zYXdPbmVTY2VuZSA9IHRydWVcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucHVzaFNjZW5lKEBzY2VuZSlcclxuXHJcbiAgYWRkOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5hZGRDaGlsZChvYmopXHJcblxyXG4gIHJlbW92ZTogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZngucmVtb3ZlQ2hpbGQob2JqKVxyXG5cclxuICAjIHRvIGJlIG92ZXJyaWRkZW4gYnkgZGVyaXZlZCBNb2Rlc1xyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlXHJcbiIsImlmIGRvY3VtZW50P1xyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbndlYidcclxuZWxzZVxyXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xyXG4iLCJyZXF1aXJlICdqc2IuanMnXHJcbnJlcXVpcmUgJ21haW4nXHJcblxyXG5udWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKVxyXG5udWxsU2NlbmUuaW5pdCgpXHJcbmNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucnVuV2l0aFNjZW5lKG51bGxTY2VuZSlcclxuY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxuXHJcbmNvY29zMmRBcHAgPSBjYy5BcHBsaWNhdGlvbi5leHRlbmQge1xyXG4gIGNvbmZpZzogY29uZmlnXHJcbiAgY3RvcjogKHNjZW5lKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXHJcbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcclxuICAgIGNjLnNldHVwKEBjb25maWdbJ3RhZyddKVxyXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXHJcblxyXG4gIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiAtPlxyXG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXHJcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxyXG4gICAgICAgICAgYWxlcnQgXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBXZWJHTFwiXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgICMgaW5pdGlhbGl6ZSBkaXJlY3RvclxyXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcclxuXHJcbiAgICAgIGNjLkVHTFZpZXcuZ2V0SW5zdGFuY2UoKS5zZXREZXNpZ25SZXNvbHV0aW9uU2l6ZSgxMjgwLCA3MjAsIGNjLlJFU09MVVRJT05fUE9MSUNZLlNIT1dfQUxMKVxyXG5cclxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXHJcbiAgICAgIGRpcmVjdG9yLnNldERpc3BsYXlTdGF0cyBAY29uZmlnWydzaG93RlBTJ11cclxuXHJcbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcclxuICAgICAgZGlyZWN0b3Iuc2V0QW5pbWF0aW9uSW50ZXJ2YWwgMS4wIC8gQGNvbmZpZ1snZnJhbWVSYXRlJ11cclxuXHJcbiAgICAgICMgbG9hZCByZXNvdXJjZXNcclxuICAgICAgcmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxyXG4gICAgICAgIHJlcXVpcmUgJ21haW4nXHJcbiAgICAgICAgbnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKCk7XHJcbiAgICAgICAgbnVsbFNjZW5lLmluaXQoKVxyXG4gICAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucmVwbGFjZVNjZW5lKG51bGxTY2VuZSlcclxuIyAgICAgICAgY2MuZ2FtZS5tb2Rlcy5pbnRyby5hY3RpdmF0ZSgpXHJcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuICAgICAgdGhpcylcclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbm15QXBwID0gbmV3IGNvY29zMmRBcHAoKVxyXG4iLCJjbGFzcyBCcmFpblxyXG4gIGNvbnN0cnVjdG9yOiAoQHRpbGVzLCBAYW5pbUZyYW1lKSAtPlxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gdHJ1ZVxyXG4gICAgQGNkID0gMFxyXG4gICAgQGludGVycEZyYW1lcyA9IFtdXHJcbiAgICBAcGF0aCA9IFtdXHJcblxyXG4gIG1vdmU6IChneCwgZ3ksIGZyYW1lcykgLT5cclxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxyXG4gICAgZHggPSAoQHggLSBneCkgKiBjYy51bml0U2l6ZVxyXG4gICAgZHkgPSAoQHkgLSBneSkgKiBjYy51bml0U2l6ZVxyXG4gICAgQGZhY2luZ1JpZ2h0ID0gKGR4IDwgMClcclxuICAgIGkgPSBmcmFtZXMubGVuZ3RoXHJcbiAgICBmb3IgZiBpbiBmcmFtZXNcclxuICAgICAgYW5pbUZyYW1lID0ge1xyXG4gICAgICAgIHg6IGR4ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICB5OiBkeSAqIGkgLyBmcmFtZXMubGVuZ3RoXHJcbiAgICAgICAgYW5pbUZyYW1lOiBmXHJcbiAgICAgIH1cclxuICAgICAgQGludGVycEZyYW1lcy5wdXNoIGFuaW1GcmFtZVxyXG4gICAgICBpLS1cclxuXHJcbiAgICBjYy5nYW1lLnNldFR1cm5GcmFtZXMoZnJhbWVzLmxlbmd0aClcclxuXHJcbiAgICAjIEltbWVkaWF0ZWx5IG1vdmUsIG9ubHkgcHJldGVuZCB0byBhbmltYXRlIHRoZXJlIG92ZXIgdGhlIG5leHQgZnJhbWVzLmxlbmd0aCBmcmFtZXNcclxuICAgIEB4ID0gZ3hcclxuICAgIEB5ID0gZ3lcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgY3JlYXRlU3ByaXRlOiAtPlxyXG4gICAgcyA9IGNjLlNwcml0ZS5jcmVhdGUgQHRpbGVzLnJlc291cmNlXHJcbiAgICBAdXBkYXRlU3ByaXRlKHMpXHJcbiAgICByZXR1cm4gc1xyXG5cclxuICB1cGRhdGVTcHJpdGU6IChzcHJpdGUpIC0+XHJcbiAgICB4ID0gQHggKiBjYy51bml0U2l6ZVxyXG4gICAgeSA9IEB5ICogY2MudW5pdFNpemVcclxuICAgIGFuaW1GcmFtZSA9IEBhbmltRnJhbWVcclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoXHJcbiAgICAgIGZyYW1lID0gQGludGVycEZyYW1lcy5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgeCArPSBmcmFtZS54XHJcbiAgICAgIHkgKz0gZnJhbWUueVxyXG4gICAgICBhbmltRnJhbWUgPSBmcmFtZS5hbmltRnJhbWVcclxuICAgICMgZWxzZVxyXG4gICAgIyAgIGFuaW1GcmFtZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXHJcbiAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QoQHRpbGVzLnJlY3QoYW5pbUZyYW1lKSlcclxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKVxyXG4gICAgeGFuY2hvciA9IDEuMFxyXG4gICAgeHNjYWxlID0gLTEuMFxyXG4gICAgaWYgQGZhY2luZ1JpZ2h0XHJcbiAgICAgIHhhbmNob3IgPSAwXHJcbiAgICAgIHhzY2FsZSA9IDEuMFxyXG4gICAgc3ByaXRlLnNldFNjYWxlWCh4c2NhbGUpXHJcbiAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCh4YW5jaG9yLCAwKSlcclxuXHJcbiAgdGFrZVN0ZXA6IC0+XHJcbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIGlmIEBwYXRoLmxlbmd0aCA+IDBcclxuICAgICAgICBzdGVwID0gQHBhdGguc3BsaWNlKDAsIDEpWzBdXHJcbiAgICAgICAgIyBjYy5sb2cgXCJ0YWtpbmcgc3RlcCB0byAje3N0ZXAueH0sICN7c3RlcC55fVwiXHJcbiAgICAgICAgQG1vdmUoc3RlcC54LCBzdGVwLnksIFsyLDMsNF0pXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB0aWNrOiAoZWxhcHNlZFR1cm5zKSAtPlxyXG4gICAgaWYgQGNkID4gMFxyXG4gICAgICBAY2QgLT0gZWxhcHNlZFR1cm5zIGlmIEBjZCA+IDBcclxuICAgICAgQGNkID0gMCBpZiBAY2QgPCAwXHJcbiAgICBpZiBAY2QgPT0gMFxyXG4gICAgICBAdGhpbmsoKVxyXG5cclxuICB0aGluazogLT5cclxuICAgIGNjLmxvZyBcInRoaW5rIG5vdCBpbXBsZW1lbnRlZCFcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmFpblxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkJyYWluID0gcmVxdWlyZSAnYnJhaW4vYnJhaW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5UaWxlc2hlZXQgPSByZXF1aXJlICdnZngvdGlsZXNoZWV0J1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAYW5pbUZyYW1lID0gMFxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIHRoaXNba10gPSB2XHJcbiAgICBzdXBlciByZXNvdXJjZXMudGlsZXNoZWV0cy5wbGF5ZXIsIEBhbmltRnJhbWVcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgdGhpbms6IC0+XHJcbiAgICBpZiBAdGFrZVN0ZXAoKVxyXG4gICAgICBAY2QgPSA1MFxyXG5cclxuICBhY3Q6IChneCwgZ3kpIC0+XHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoQHgsIEB5LCBneCwgZ3kpXHJcbiAgICBAd2Fsa1BhdGgocGF0aClcclxuICAgIGNjLmxvZyBcInBhdGggaXMgI3twYXRoLmxlbmd0aH0gbG9uZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2NhbGU6XHJcbiAgICBtaW46IDEuNVxyXG4gICAgbWF4OiA4LjBcclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjYwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbmNsYXNzIFNjZW5lIGV4dGVuZHMgY2MuU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBMYXllcjogTGF5ZXJcclxuICBTY2VuZTogU2NlbmVcclxuIiwiXHJcbiMgVGhpcyBpcyBmdWNraW5nIHRyYWdpYy5cclxuUElYRUxfRlVER0VfRkFDVE9SID0gMC41ICAjIGhvdyBtYW55IHBpeGVscyB0byByZW1vdmUgZnJvbSB0aGUgZWRnZSB0byByZW1vdmUgYmxlZWRcclxuU0NBTEVfRlVER0VfRkFDVE9SID0gMC4wMiAgIyBhZGRpdGlvbmFsIHNwcml0ZSBzY2FsZSB0byBlbnN1cmUgcHJvcGVyIHRpbGluZ1xyXG5cclxuVGlsZXNoZWV0QmF0Y2hOb2RlID0gY2MuU3ByaXRlQmF0Y2hOb2RlLmV4dGVuZCB7XHJcbiAgaW5pdDogKGZpbGVJbWFnZSwgY2FwYWNpdHkpIC0+XHJcbiAgICBAX3N1cGVyKGZpbGVJbWFnZSwgY2FwYWNpdHkpXHJcblxyXG4gIGNyZWF0ZVNwcml0ZTogKHRpbGVJbmRleCwgeCwgeSkgLT5cclxuICAgIHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGVXaXRoVGV4dHVyZShAZ2V0VGV4dHVyZSgpLCBAdGlsZXNoZWV0LnJlY3QodGlsZUluZGV4KSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKHgsIHkpXHJcbiAgICBzcHJpdGUuc2V0U2NhbGUoQHRpbGVzaGVldC5hZGp1c3RlZFNjYWxlLngsIEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS55KVxyXG4gICAgQGFkZENoaWxkIHNwcml0ZVxyXG4gICAgcmV0dXJuIHNwcml0ZVxyXG59XHJcblxyXG5jbGFzcyBUaWxlc2hlZXRcclxuICBjb25zdHJ1Y3RvcjogKEByZXNvdXJjZSwgQHdpZHRoLCBAaGVpZ2h0LCBAc3RyaWRlKSAtPlxyXG4gICAgQGFkanVzdGVkU2NhbGUgPVxyXG4gICAgICB4OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEB3aWR0aClcclxuICAgICAgeTogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAaGVpZ2h0KVxyXG5cclxuICByZWN0OiAodikgLT5cclxuICAgIHkgPSBNYXRoLmZsb29yKHYgLyBAc3RyaWRlKVxyXG4gICAgeCA9IHYgJSBAc3RyaWRlXHJcbiAgICByZXR1cm4gY2MucmVjdCh4ICogQHdpZHRoLCB5ICogQGhlaWdodCwgQHdpZHRoIC0gUElYRUxfRlVER0VfRkFDVE9SLCBAaGVpZ2h0IC0gUElYRUxfRlVER0VfRkFDVE9SKVxyXG5cclxuICBjcmVhdGVCYXRjaE5vZGU6IChjYXBhY2l0eSkgLT5cclxuICAgIGJhdGNoTm9kZSA9IG5ldyBUaWxlc2hlZXRCYXRjaE5vZGUoKVxyXG4gICAgYmF0Y2hOb2RlLnRpbGVzaGVldCA9IHRoaXNcclxuICAgIGJhdGNoTm9kZS5pbml0KEByZXNvdXJjZSwgY2FwYWNpdHkpXHJcbiAgICByZXR1cm4gYmF0Y2hOb2RlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QbGF5ZXIgPSByZXF1aXJlICdicmFpbi9wbGF5ZXInXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAdHVybkZyYW1lcyA9IDBcclxuICAgIEBtb2RlcyA9XHJcbiAgICAgIGludHJvOiBuZXcgSW50cm9Nb2RlKClcclxuICAgICAgZ2FtZTogbmV3IEdhbWVNb2RlKClcclxuXHJcbiAgbmV3Rmxvb3I6IC0+XHJcbiAgICBmbG9vcmdlbi5nZW5lcmF0ZSgpXHJcblxyXG4gIGN1cnJlbnRGbG9vcjogLT5cclxuICAgIHJldHVybiBAc3RhdGUuZmxvb3JzW0BzdGF0ZS5wbGF5ZXIuZmxvb3JdXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBjYy5sb2cgXCJuZXdHYW1lXCJcclxuICAgIEBzdGF0ZSA9IHtcclxuICAgICAgcnVubmluZzogZmFsc2VcclxuICAgICAgcGxheWVyOiBuZXcgUGxheWVyKHtcclxuICAgICAgICB4OiA0NFxyXG4gICAgICAgIHk6IDQ5XHJcbiAgICAgICAgZmxvb3I6IDFcclxuICAgICAgfSlcclxuICAgICAgZmxvb3JzOiBbXHJcbiAgICAgICAge31cclxuICAgICAgICBAbmV3Rmxvb3IoKVxyXG4gICAgICBdXHJcbiAgICB9XHJcblxyXG4gIHNldFR1cm5GcmFtZXM6IChjb3VudCkgLT5cclxuICAgIGlmIEB0dXJuRnJhbWVzIDwgY291bnRcclxuICAgICAgQHR1cm5GcmFtZXMgPSBjb3VudFxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy51bml0U2l6ZSA9IDE2XHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDE4XHJcbiAgICAgIGVsc2UgMFxyXG5cclxuICBnZnhDbGVhcjogLT5cclxuICAgIGlmIEBnZng/XHJcbiAgICAgIGlmIEBnZnguZmxvb3JMYXllcj9cclxuICAgICAgICBAcmVtb3ZlIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeCA9IHt9XHJcblxyXG4gIGdmeFJlbmRlckZsb29yOiAtPlxyXG4gICAgZmxvb3IgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyID0gbmV3IGNjLkxheWVyKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGdmeC5mbG9vckJhdGNoTm9kZSA9IHJlc291cmNlcy50aWxlc2hlZXRzLnRpbGVzMC5jcmVhdGVCYXRjaE5vZGUoKGZsb29yLndpZHRoICogZmxvb3IuaGVpZ2h0KSAvIDIpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5mbG9vckJhdGNoTm9kZSwgLTFcclxuICAgIGZvciBqIGluIFswLi4uZmxvb3IuaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLmZsb29yLndpZHRoXVxyXG4gICAgICAgIHYgPSBmbG9vci5nZXQoaSwgailcclxuICAgICAgICBpZiB2ICE9IDBcclxuICAgICAgICAgIEBnZnguZmxvb3JCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKEB0aWxlRm9yR3JpZFZhbHVlKHYpLCBpICogY2MudW5pdFNpemUsIGogKiBjYy51bml0U2l6ZSlcclxuXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoY29uZmlnLnNjYWxlLm1pbilcclxuICAgIEBhZGQgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4Q2VudGVyTWFwKClcclxuXHJcbiAgZ2Z4UGxhY2VNYXA6IChtYXBYLCBtYXBZLCBzY3JlZW5YLCBzY3JlZW5ZKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgeCA9IHNjcmVlblggLSAobWFwWCAqIHNjYWxlKVxyXG4gICAgeSA9IHNjcmVlblkgLSAobWFwWSAqIHNjYWxlKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHgsIHkpXHJcblxyXG4gIGdmeENlbnRlck1hcDogLT5cclxuICAgIGNlbnRlciA9IGNjLmdhbWUuY3VycmVudEZsb29yKCkuYmJveC5jZW50ZXIoKVxyXG4gICAgQGdmeFBsYWNlTWFwKGNlbnRlci54ICogY2MudW5pdFNpemUsIGNlbnRlci55ICogY2MudW5pdFNpemUsIGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMilcclxuXHJcbiAgZ2Z4U2NyZWVuVG9NYXBDb29yZHM6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6ICh4IC0gcG9zLngpIC8gc2NhbGVcclxuICAgICAgeTogKHkgLSBwb3MueSkgLyBzY2FsZVxyXG4gICAgfVxyXG5cclxuICBnZnhSZW5kZXJQbGF5ZXI6IC0+XHJcbiAgICBAZ2Z4LnBsYXllciA9IHt9XHJcbiAgICBAZ2Z4LnBsYXllci5zcHJpdGUgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jcmVhdGVTcHJpdGUoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGxheWVyLnNwcml0ZSwgMFxyXG5cclxuICBnZnhBZGp1c3RNYXBTY2FsZTogKGRlbHRhKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgc2NhbGUgKz0gZGVsdGFcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1heCBpZiBzY2FsZSA+IGNvbmZpZy5zY2FsZS5tYXhcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1pbiBpZiBzY2FsZSA8IGNvbmZpZy5zY2FsZS5taW5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShzY2FsZSlcclxuXHJcbiAgZ2Z4UmVuZGVyUGF0aDogKHBhdGgpIC0+XHJcbiAgICBpZiBAZ2Z4LnBhdGhCYXRjaE5vZGU/XHJcbiAgICAgIEBnZnguZmxvb3JMYXllci5yZW1vdmVDaGlsZCBAZ2Z4LnBhdGhCYXRjaE5vZGVcclxuICAgIHJldHVybiBpZiBwYXRoLmxlbmd0aCA9PSAwXHJcbiAgICBAZ2Z4LnBhdGhCYXRjaE5vZGUgPSByZXNvdXJjZXMudGlsZXNoZWV0cy50aWxlczAuY3JlYXRlQmF0Y2hOb2RlKHBhdGgubGVuZ3RoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGF0aEJhdGNoTm9kZVxyXG4gICAgZm9yIHAgaW4gcGF0aFxyXG4gICAgICBzcHJpdGUgPSBAZ2Z4LnBhdGhCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKDE3LCBwLnggKiBjYy51bml0U2l6ZSwgcC55ICogY2MudW5pdFNpemUpXHJcbiAgICAgIHNwcml0ZS5zZXRPcGFjaXR5KDEyOClcclxuXHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbihwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgQGdmeEFkanVzdE1hcFNjYWxlKGRlbHRhIC8gMjAwKVxyXG4gICAgQGdmeFBsYWNlTWFwKHBvcy54LCBwb3MueSwgeCwgeSlcclxuXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICAgIGNjLmdhbWUubmV3R2FtZSgpXHJcbiAgICBAZ2Z4Q2xlYXIoKVxyXG4gICAgQGdmeFJlbmRlckZsb29yKClcclxuICAgIEBnZnhSZW5kZXJQbGF5ZXIoKVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRTY2hlZHVsZXIoKS5zY2hlZHVsZUNhbGxiYWNrRm9yVGFyZ2V0KHRoaXMsIEB1cGRhdGUsIDEgLyA2MC4wLCBjYy5SRVBFQVRfRk9SRVZFUiwgMCwgZmFsc2UpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBjYy51bml0U2l6ZSlcclxuICAgIGdyaWRZID0gTWF0aC5mbG9vcihwb3MueSAvIGNjLnVuaXRTaXplKVxyXG5cclxuICAgIGlmIG5vdCBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuYWN0KGdyaWRYLCBncmlkWSlcclxuICAgICAgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nID0gdHJ1ZVxyXG4gICAgICBjYy5sb2cgXCJydW5uaW5nXCJcclxuXHJcbiAgICAjIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxyXG4gICAgIyBwYXRoID0gcGF0aGZpbmRlci5jYWxjKGNjLmdhbWUuc3RhdGUucGxheWVyLngsIGNjLmdhbWUuc3RhdGUucGxheWVyLnksIGdyaWRYLCBncmlkWSlcclxuICAgICMgQGdmeFJlbmRlclBhdGgocGF0aClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBjYy5nYW1lLnN0YXRlLnBsYXllci51cGRhdGVTcHJpdGUoQGdmeC5wbGF5ZXIuc3ByaXRlKVxyXG5cclxuICAgIGlmIGNjLmdhbWUudHVybkZyYW1lcyA+IDBcclxuICAgICAgY2MuZ2FtZS50dXJuRnJhbWVzLS1cclxuICAgIGVsc2VcclxuICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nXHJcbiAgICAgICAgbWluaW11bUNEID0gMTAwMFxyXG4gICAgICAgIGlmIG1pbmltdW1DRCA+IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgICBtaW5pbXVtQ0QgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jZFxyXG4gICAgICAgICMgVE9ETzogY2hlY2sgY2Qgb2YgYWxsIE5QQ3Mgb24gdGhlIGZsb29yIGFnYWluc3QgdGhlIG1pbmltdW1DRFxyXG4gICAgICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnRpY2sobWluaW11bUNEKVxyXG4gICAgICAgIGlmIGNjLmdhbWUuc3RhdGUucGxheWVyLmNkID09IDAgIyBXZSBqdXN0IHJhbiwgeWV0IGRpZCBub3RoaW5nXHJcbiAgICAgICAgICBjYy5nYW1lLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZVxyXG4gICAgICAgICAgY2MubG9nIFwibm90IHJ1bm5pbmdcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTW9kZVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcblxyXG5jbGFzcyBJbnRyb01vZGUgZXh0ZW5kcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcihcIkludHJvXCIpXHJcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuaW1hZ2VzLnNwbGFzaHNjcmVlblxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMikpXHJcbiAgICBAYWRkIEBzcHJpdGVcclxuXHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgICBjYy5sb2cgXCJpbnRybyBjbGljayAje3h9LCAje3l9XCJcclxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvTW9kZVxyXG4iLCJUaWxlc2hlZXQgPSByZXF1aXJlIFwiZ2Z4L3RpbGVzaGVldFwiXHJcblxyXG5pbWFnZXMgPVxyXG4gIHNwbGFzaHNjcmVlbjogJ3Jlcy9zcGxhc2hzY3JlZW4ucG5nJ1xyXG4gIHRpbGVzMDogJ3Jlcy90aWxlczAucG5nJ1xyXG4gIHBsYXllcjogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxudGlsZXNoZWV0cyA9XHJcbiAgdGlsZXMwOiBuZXcgVGlsZXNoZWV0KGltYWdlcy50aWxlczAsIDE2LCAxNiwgMTYpXHJcbiAgcGxheWVyOiBuZXcgVGlsZXNoZWV0KGltYWdlcy5wbGF5ZXIsIDEyLCAxNCwgMTgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgaW1hZ2VzOiBpbWFnZXNcclxuICB0aWxlc2hlZXRzOiB0aWxlc2hlZXRzXHJcbiAgY29jb3NQcmVsb2FkTGlzdDogKHtzcmM6IHZ9IGZvciBrLCB2IG9mIGltYWdlcylcclxuIiwiZ2Z4ID0gcmVxdWlyZSAnZ2Z4J1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcblxyXG5jbGFzcyBGbG9vciBleHRlbmRzIGdmeC5MYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoKVxyXG4gICAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXHJcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuc3BsYXNoc2NyZWVuLCBjYy5yZWN0KDQ1MCwzMDAsMTYsMTYpXHJcbiAgICBAc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIEBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIEBhZGRDaGlsZChAc3ByaXRlLCAwKVxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKDAsIDApKVxyXG4gICAgQHNldFBvc2l0aW9uKGNjLnAoMTAwLCAxMDApKVxyXG4gICAgQHNldFNjYWxlKDEwLCAxMClcclxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIHRvdWNoZXNcclxuICAgICAgeCA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS54XHJcbiAgICAgIHkgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueVxyXG4gICAgICBjYy5sb2cgXCJ0b3VjaCBGbG9vciBhdCAje3h9LCAje3l9XCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmxvb3JcclxuIiwiZnMgPSByZXF1aXJlICdmcydcclxuc2VlZFJhbmRvbSA9IHJlcXVpcmUgJ3NlZWQtcmFuZG9tJ1xyXG5cclxuU0hBUEVTID0gW1xyXG4gIFwiXCJcIlxyXG4gICMjIyMjIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICMjIyMjIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4jXHJcbiAgIy4uLiNcclxuICAjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uIyMjIyMjIyNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjIyMjIyMjIyMjIyNcclxuICBcIlwiXCJcclxuICBcIlwiXCJcclxuICAgICAgIyMjI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICMjIyMjLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIyMjIyMjIyNcclxuICBcIlwiXCJcclxuXVxyXG5cclxuRU1QVFkgPSAwXHJcbldBTEwgPSAxXHJcbkRPT1IgPSAyXHJcbkZJUlNUX1JPT01fSUQgPSA1XHJcblxyXG52YWx1ZVRvQ29sb3IgPSAocCwgdikgLT5cclxuICBzd2l0Y2hcclxuICAgIHdoZW4gdiA9PSBXQUxMIHRoZW4gcmV0dXJuIHAuY29sb3IgMzIsIDMyLCAzMlxyXG4gICAgd2hlbiB2ID09IERPT1IgdGhlbiByZXR1cm4gcC5jb2xvciAxMjgsIDEyOCwgMTI4XHJcbiAgICB3aGVuIHYgPj0gRklSU1RfUk9PTV9JRCB0aGVuIHJldHVybiBwLmNvbG9yIDAsIDAsIDUgKyBNYXRoLm1pbigyNDAsIDE1ICsgKHYgKiAyKSlcclxuICByZXR1cm4gcC5jb2xvciAwLCAwLCAwXHJcblxyXG5jbGFzcyBSZWN0XHJcbiAgY29uc3RydWN0b3I6IChAbCwgQHQsIEByLCBAYikgLT5cclxuXHJcbiAgdzogLT4gQHIgLSBAbFxyXG4gIGg6IC0+IEBiIC0gQHRcclxuICBhcmVhOiAtPiBAdygpICogQGgoKVxyXG4gIGFzcGVjdDogLT5cclxuICAgIGlmIEBoKCkgPiAwXHJcbiAgICAgIHJldHVybiBAdygpIC8gQGgoKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gMFxyXG5cclxuICBzcXVhcmVuZXNzOiAtPlxyXG4gICAgcmV0dXJuIE1hdGguYWJzKEB3KCkgLSBAaCgpKVxyXG5cclxuICBjZW50ZXI6IC0+XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBNYXRoLmZsb29yKChAciArIEBsKSAvIDIpXHJcbiAgICAgIHk6IE1hdGguZmxvb3IoKEBiICsgQHQpIC8gMilcclxuICAgIH1cclxuXHJcbiAgY2xvbmU6IC0+XHJcbiAgICByZXR1cm4gbmV3IFJlY3QoQGwsIEB0LCBAciwgQGIpXHJcblxyXG4gIGV4cGFuZDogKHIpIC0+XHJcbiAgICBpZiBAYXJlYSgpXHJcbiAgICAgIEBsID0gci5sIGlmIEBsID4gci5sXHJcbiAgICAgIEB0ID0gci50IGlmIEB0ID4gci50XHJcbiAgICAgIEByID0gci5yIGlmIEByIDwgci5yXHJcbiAgICAgIEBiID0gci5iIGlmIEBiIDwgci5iXHJcbiAgICBlbHNlXHJcbiAgICAgICMgc3BlY2lhbCBjYXNlLCBiYm94IGlzIGVtcHR5LiBSZXBsYWNlIGNvbnRlbnRzIVxyXG4gICAgICBAbCA9IHIubFxyXG4gICAgICBAdCA9IHIudFxyXG4gICAgICBAciA9IHIuclxyXG4gICAgICBAYiA9IHIuYlxyXG5cclxuICB0b1N0cmluZzogLT4gXCJ7ICgje0BsfSwgI3tAdH0pIC0+ICgje0ByfSwgI3tAYn0pICN7QHcoKX14I3tAaCgpfSwgYXJlYTogI3tAYXJlYSgpfSwgYXNwZWN0OiAje0Bhc3BlY3QoKX0sIHNxdWFyZW5lc3M6ICN7QHNxdWFyZW5lc3MoKX0gfVwiXHJcblxyXG5jbGFzcyBSb29tVGVtcGxhdGVcclxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHJvb21pZCkgLT5cclxuICAgIEBncmlkID0gW11cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAZ3JpZFtpXSA9IFtdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBAZ3JpZFtpXVtqXSA9IEVNUFRZXHJcblxyXG4gICAgQGdlbmVyYXRlU2hhcGUoKVxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBAc2V0KGksIGosIEByb29taWQpXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQHNldChpLCAwLCBXQUxMKVxyXG4gICAgICBAc2V0KGksIEBoZWlnaHQgLSAxLCBXQUxMKVxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBAc2V0KDAsIGosIFdBTEwpXHJcbiAgICAgIEBzZXQoQHdpZHRoIC0gMSwgaiwgV0FMTClcclxuXHJcbiAgcmVjdDogKHgsIHkpIC0+XHJcbiAgICByZXR1cm4gbmV3IFJlY3QgeCwgeSwgeCArIEB3aWR0aCwgeSArIEBoZWlnaHRcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdID0gdlxyXG5cclxuICBnZXQ6IChtYXAsIHgsIHksIGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgdiA9IEBncmlkW2ldW2pdXHJcbiAgICAgIHJldHVybiB2IGlmIHYgIT0gRU1QVFlcclxuICAgIHJldHVybiBtYXAuZ2V0IHggKyBpLCB5ICsgalxyXG5cclxuICBwbGFjZTogKG1hcCwgeCwgeSkgLT5cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgdiA9IEBncmlkW2ldW2pdXHJcbiAgICAgICAgbWFwLnNldCh4ICsgaSwgeSArIGosIHYpIGlmIHYgIT0gRU1QVFlcclxuXHJcbiAgZml0czogKG1hcCwgeCwgeSkgLT5cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgbXYgPSBtYXAuZ2V0KHggKyBpLCB5ICsgailcclxuICAgICAgICBzdiA9IEBncmlkW2ldW2pdXHJcbiAgICAgICAgaWYgbXYgIT0gRU1QVFkgYW5kIHN2ICE9IEVNUFRZIGFuZCAobXYgIT0gV0FMTCBvciBzdiAhPSBXQUxMKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBkb29yRWxpZ2libGU6IChtYXAsIHgsIHksIGksIGopIC0+XHJcbiAgICB3YWxsTmVpZ2hib3JzID0gMFxyXG4gICAgcm9vbXNTZWVuID0ge31cclxuICAgIHZhbHVlcyA9IFtcclxuICAgICAgQGdldChtYXAsIHgsIHksIGkgKyAxLCBqKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSAtIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpLCBqICsgMSlcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogLSAxKVxyXG4gICAgXVxyXG4gICAgZm9yIHYgaW4gdmFsdWVzXHJcbiAgICAgIGlmIHZcclxuICAgICAgICBpZiB2ID09IDFcclxuICAgICAgICAgIHdhbGxOZWlnaGJvcnMrK1xyXG4gICAgICAgIGVsc2UgaWYgdiAhPSAyXHJcbiAgICAgICAgICByb29tc1NlZW5bdl0gPSAxXHJcbiAgICByb29tcyA9IE9iamVjdC5rZXlzKHJvb21zU2Vlbikuc29ydCAoYSwgYikgLT4gYS1iXHJcbiAgICByb29tcyA9IHJvb21zLm1hcCAocm9vbSkgLT4gcGFyc2VJbnQocm9vbSlcclxuICAgIHJvb21Db3VudCA9IHJvb21zLmxlbmd0aFxyXG4gICAgaWYgKHdhbGxOZWlnaGJvcnMgPT0gMikgYW5kIChyb29tQ291bnQgPT0gMikgYW5kIChAcm9vbWlkIGluIHJvb21zKVxyXG4gICAgICBpZiAodmFsdWVzWzBdID09IHZhbHVlc1sxXSkgb3IgKHZhbHVlc1syXSA9PSB2YWx1ZXNbM10pXHJcbiAgICAgICAgcmV0dXJuIHJvb21zXHJcbiAgICByZXR1cm4gWy0xLCAtMV1cclxuXHJcbiAgZG9vckxvY2F0aW9uOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICByb29tcyA9IEBkb29yRWxpZ2libGUobWFwLCB4LCB5LCBpLCBqKVxyXG4gICAgICAgIGlmIHJvb21zWzBdICE9IC0xIGFuZCBAcm9vbWlkIGluIHJvb21zXHJcbiAgICAgICAgICByZXR1cm4gW2ksIGpdXHJcbiAgICByZXR1cm4gWy0xLCAtMV1cclxuXHJcbiAgbWVhc3VyZTogKG1hcCwgeCwgeSkgLT5cclxuICAgIGJib3hUZW1wID0gbWFwLmJib3guY2xvbmUoKVxyXG4gICAgYmJveFRlbXAuZXhwYW5kIEByZWN0KHgsIHkpXHJcbiAgICBbYmJveFRlbXAuYXJlYSgpLCBiYm94VGVtcC5zcXVhcmVuZXNzKCldXHJcblxyXG4gIGZpbmRCZXN0U3BvdDogKG1hcCkgLT5cclxuICAgIG1pblNxdWFyZW5lc3MgPSBNYXRoLm1heCBtYXAud2lkdGgsIG1hcC5oZWlnaHRcclxuICAgIG1pbkFyZWEgPSBtYXAud2lkdGggKiBtYXAuaGVpZ2h0XHJcbiAgICBtaW5YID0gLTFcclxuICAgIG1pblkgPSAtMVxyXG4gICAgZG9vckxvY2F0aW9uID0gWy0xLCAtMV1cclxuICAgIHNlYXJjaEwgPSBtYXAuYmJveC5sIC0gQHdpZHRoXHJcbiAgICBzZWFyY2hSID0gbWFwLmJib3guclxyXG4gICAgc2VhcmNoVCA9IG1hcC5iYm94LnQgLSBAaGVpZ2h0XHJcbiAgICBzZWFyY2hCID0gbWFwLmJib3guYlxyXG4gICAgZm9yIGkgaW4gW3NlYXJjaEwgLi4uIHNlYXJjaFJdXHJcbiAgICAgIGZvciBqIGluIFtzZWFyY2hUIC4uLiBzZWFyY2hCXVxyXG4gICAgICAgIGlmIEBmaXRzKG1hcCwgaSwgailcclxuICAgICAgICAgIFthcmVhLCBzcXVhcmVuZXNzXSA9IEBtZWFzdXJlIG1hcCwgaSwgalxyXG4gICAgICAgICAgaWYgYXJlYSA8PSBtaW5BcmVhIGFuZCBzcXVhcmVuZXNzIDw9IG1pblNxdWFyZW5lc3NcclxuICAgICAgICAgICAgbG9jYXRpb24gPSBAZG9vckxvY2F0aW9uIG1hcCwgaSwgalxyXG4gICAgICAgICAgICBpZiBsb2NhdGlvblswXSAhPSAtMVxyXG4gICAgICAgICAgICAgIGRvb3JMb2NhdGlvbiA9IGxvY2F0aW9uXHJcbiAgICAgICAgICAgICAgbWluQXJlYSA9IGFyZWFcclxuICAgICAgICAgICAgICBtaW5TcXVhcmVuZXNzID0gc3F1YXJlbmVzc1xyXG4gICAgICAgICAgICAgIG1pblggPSBpXHJcbiAgICAgICAgICAgICAgbWluWSA9IGpcclxuICAgIHJldHVybiBbbWluWCwgbWluWSwgZG9vckxvY2F0aW9uXVxyXG5cclxuY2xhc3MgU2hhcGVSb29tVGVtcGxhdGUgZXh0ZW5kcyBSb29tVGVtcGxhdGVcclxuICBjb25zdHJ1Y3RvcjogKHNoYXBlLCByb29taWQpIC0+XHJcbiAgICBAbGluZXMgPSBzaGFwZS5zcGxpdChcIlxcblwiKVxyXG4gICAgdyA9IDBcclxuICAgIGZvciBsaW5lIGluIEBsaW5lc1xyXG4gICAgICB3ID0gTWF0aC5tYXgodywgbGluZS5sZW5ndGgpXHJcbiAgICBAd2lkdGggPSB3XHJcbiAgICBAaGVpZ2h0ID0gQGxpbmVzLmxlbmd0aFxyXG4gICAgc3VwZXIgQHdpZHRoLCBAaGVpZ2h0LCByb29taWRcclxuXHJcbiAgZ2VuZXJhdGVTaGFwZTogLT5cclxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgICAgQHNldChpLCBqLCBFTVBUWSlcclxuICAgIGkgPSAwXHJcbiAgICBqID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIGZvciBjIGluIGxpbmUuc3BsaXQoXCJcIilcclxuICAgICAgICB2ID0gc3dpdGNoIGNcclxuICAgICAgICAgIHdoZW4gJy4nIHRoZW4gQHJvb21pZFxyXG4gICAgICAgICAgd2hlbiAnIycgdGhlbiBXQUxMXHJcbiAgICAgICAgICBlbHNlIDBcclxuICAgICAgICBpZiB2XHJcbiAgICAgICAgICBAc2V0KGksIGosIHYpXHJcbiAgICAgICAgaSsrXHJcbiAgICAgIGorK1xyXG4gICAgICBpID0gMFxyXG5cclxuY2xhc3MgUm9vbVxyXG4gIGNvbnN0cnVjdG9yOiAoQHJlY3QpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicm9vbSBjcmVhdGVkICN7QHJlY3R9XCJcclxuXHJcbmNsYXNzIE1hcFxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAc2VlZCkgLT5cclxuICAgIEByYW5kUmVzZXQoKVxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID1cclxuICAgICAgICAgIHR5cGU6IEVNUFRZXHJcbiAgICAgICAgICB4OiBpXHJcbiAgICAgICAgICB5OiBqXHJcbiAgICBAYmJveCA9IG5ldyBSZWN0IDAsIDAsIDAsIDBcclxuICAgIEByb29tcyA9IFtdXHJcblxyXG4gIHJhbmRSZXNldDogLT5cclxuICAgIEBybmcgPSBzZWVkUmFuZG9tKEBzZWVkKVxyXG5cclxuICByYW5kOiAodikgLT5cclxuICAgIHJldHVybiBNYXRoLmZsb29yKEBybmcoKSAqIHYpXHJcblxyXG4gIHNldDogKGksIGosIHYpIC0+XHJcbiAgICBAZ3JpZFtpXVtqXS50eXBlID0gdlxyXG5cclxuICBnZXQ6IChpLCBqKSAtPlxyXG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XHJcbiAgICAgIHJldHVybiBAZ3JpZFtpXVtqXS50eXBlXHJcbiAgICByZXR1cm4gMFxyXG5cclxuICBhZGRSb29tOiAocm9vbVRlbXBsYXRlLCB4LCB5KSAtPlxyXG4gICAgIyBjb25zb2xlLmxvZyBcInBsYWNpbmcgcm9vbSBhdCAje3h9LCAje3l9XCJcclxuICAgIHJvb21UZW1wbGF0ZS5wbGFjZSB0aGlzLCB4LCB5XHJcbiAgICByID0gcm9vbVRlbXBsYXRlLnJlY3QoeCwgeSlcclxuICAgIEByb29tcy5wdXNoIG5ldyBSb29tIHJcclxuICAgIEBiYm94LmV4cGFuZChyKVxyXG4gICAgIyBjb25zb2xlLmxvZyBcIm5ldyBtYXAgYmJveCAje0BiYm94fVwiXHJcblxyXG4gIHJhbmRvbVJvb21UZW1wbGF0ZTogKHJvb21pZCkgLT5cclxuICAgIHIgPSBAcmFuZCgxMDApXHJcbiAgICBzd2l0Y2hcclxuICAgICAgd2hlbiAgMCA8IHIgPCAxMCB0aGVuIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDMsIDUgKyBAcmFuZCgxMCksIHJvb21pZCAgICAgICAgICAgICAgICAgICMgdmVydGljYWwgY29ycmlkb3JcclxuICAgICAgd2hlbiAxMCA8IHIgPCAyMCB0aGVuIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDUgKyBAcmFuZCgxMCksIDMsIHJvb21pZCAgICAgICAgICAgICAgICAgICMgaG9yaXpvbnRhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDIwIDwgciA8IDMwIHRoZW4gcmV0dXJuIG5ldyBTaGFwZVJvb21UZW1wbGF0ZSBTSEFQRVNbQHJhbmQoU0hBUEVTLmxlbmd0aCldLCByb29taWQgIyByYW5kb20gc2hhcGUgZnJvbSBTSEFQRVNcclxuICAgIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDQgKyBAcmFuZCg1KSwgNCArIEByYW5kKDUpLCByb29taWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgZ2VuZXJpYyByZWN0YW5ndWxhciByb29tXHJcblxyXG4gIGdlbmVyYXRlUm9vbTogKHJvb21pZCkgLT5cclxuICAgIHJvb21UZW1wbGF0ZSA9IEByYW5kb21Sb29tVGVtcGxhdGUgcm9vbWlkXHJcbiAgICBpZiBAcm9vbXMubGVuZ3RoID09IDBcclxuICAgICAgeCA9IE1hdGguZmxvb3IoKEB3aWR0aCAvIDIpIC0gKHJvb21UZW1wbGF0ZS53aWR0aCAvIDIpKVxyXG4gICAgICB5ID0gTWF0aC5mbG9vcigoQGhlaWdodCAvIDIpIC0gKHJvb21UZW1wbGF0ZS5oZWlnaHQgLyAyKSlcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICBlbHNlXHJcbiAgICAgIFt4LCB5LCBkb29yTG9jYXRpb25dID0gcm9vbVRlbXBsYXRlLmZpbmRCZXN0U3BvdCh0aGlzKVxyXG4gICAgICBpZiB4IDwgMFxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICByb29tVGVtcGxhdGUuc2V0IGRvb3JMb2NhdGlvblswXSwgZG9vckxvY2F0aW9uWzFdLCAyXHJcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgZ2VuZXJhdGVSb29tczogKGNvdW50KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5jb3VudF1cclxuICAgICAgcm9vbWlkID0gRklSU1RfUk9PTV9JRCArIGlcclxuXHJcbiAgICAgIGFkZGVkID0gZmFsc2VcclxuICAgICAgd2hpbGUgbm90IGFkZGVkXHJcbiAgICAgICAgYWRkZWQgPSBAZ2VuZXJhdGVSb29tIHJvb21pZFxyXG5cclxuZ2VuZXJhdGUgPSAtPlxyXG4gIG1hcCA9IG5ldyBNYXAgODAsIDgwLCAxMFxyXG4gIG1hcC5nZW5lcmF0ZVJvb21zKDIwKVxyXG4gIHJldHVybiBtYXBcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBnZW5lcmF0ZTogZ2VuZXJhdGVcclxuICBFTVBUWTogRU1QVFlcclxuICBXQUxMOiBXQUxMXHJcbiAgRE9PUjpET09SXHJcbiAgRklSU1RfUk9PTV9JRDogRklSU1RfUk9PTV9JRFxyXG4iLCJmbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5cclxuY2xhc3MgQmluYXJ5SGVhcFxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG5cclxuY2xhc3MgRmFrZUhlYXBcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBsaXN0ID0gW11cclxuXHJcbiAgc29ydExpc3Q6IC0+XHJcbiAgICBAbGlzdC5zb3J0IChhLCBiKSAtPlxyXG4gICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2VcclxuXHJcbiAgcHVzaDogKG4pIC0+XHJcbiAgICBAbGlzdC5wdXNoKG4pXHJcbiAgICBAc29ydExpc3QoKVxyXG5cclxuICBzaXplOiAtPlxyXG4gICAgcmV0dXJuIEBsaXN0Lmxlbmd0aFxyXG5cclxuICBwb3A6IC0+XHJcbiAgICByZXR1cm4gQGxpc3Quc2hpZnQoKVxyXG5cclxuICByZXNjb3JlOiAobikgLT5cclxuICAgIEBzb3J0TGlzdCgpXHJcblxyXG5jbGFzcyBEaWprc3RyYVxyXG4gIGNvbnN0cnVjdG9yOiAoQGZsb29yKSAtPlxyXG4gICAgZm9yIHggaW4gWzAuLi5AZmxvb3Iud2lkdGhdXHJcbiAgICAgIGZvciB5IGluIFswLi4uQGZsb29yLmhlaWdodF1cclxuICAgICAgICBub2RlID0gQGZsb29yLmdyaWRbeF1beV1cclxuICAgICAgICBub2RlLmRpc3RhbmNlID0gOTk5OTlcclxuICAgICAgICBub2RlLnZpc2l0ZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUuaGVhcGVkID0gZmFsc2VcclxuICAgICAgICBub2RlLnBhcmVudCA9IG51bGxcclxuXHJcbiAgY3JlYXRlSGVhcDogLT5cclxuICAgIHJldHVybiBuZXcgRmFrZUhlYXAgKG5vZGUpIC0+XHJcbiAgICAgIHJldHVybiBub2RlLmRpc3RhbmNlXHJcblxyXG4gIHNlYXJjaDogKHN0YXJ0LCBlbmQpIC0+XHJcbiAgICBncmlkID0gQGZsb29yLmdyaWRcclxuICAgIGhldXJpc3RpYyA9IEBtYW5oYXR0YW5cclxuXHJcbiAgICBzdGFydC5kaXN0YW5jZSA9IDBcclxuXHJcbiAgICBoZWFwID0gQGNyZWF0ZUhlYXAoKVxyXG4gICAgaGVhcC5wdXNoKHN0YXJ0KVxyXG4gICAgc3RhcnQuaGVhcGVkID0gdHJ1ZVxyXG5cclxuICAgIHdoaWxlIGhlYXAuc2l6ZSgpID4gMFxyXG4gICAgICBjdXJyZW50Tm9kZSA9IGhlYXAucG9wKClcclxuICAgICAgY3VycmVudE5vZGUudmlzaXRlZCA9IHRydWVcclxuXHJcbiAgICAgIGlmIGN1cnJlbnROb2RlID09IGVuZFxyXG4gICAgICAgIHJldCA9IFtdXHJcbiAgICAgICAgY3VyciA9IGVuZFxyXG4gICAgICAgIHdoaWxlIGN1cnIucGFyZW50XHJcbiAgICAgICAgICByZXQucHVzaCh7eDpjdXJyLngsIHk6Y3Vyci55fSlcclxuICAgICAgICAgIGN1cnIgPSBjdXJyLnBhcmVudFxyXG4gICAgICAgIHJldHVybiByZXQucmV2ZXJzZSgpXHJcblxyXG4gICAgICAjIEZpbmQgYWxsIG5laWdoYm9ycyBmb3IgdGhlIGN1cnJlbnQgbm9kZS5cclxuICAgICAgbmVpZ2hib3JzID0gQG5laWdoYm9ycyhncmlkLCBjdXJyZW50Tm9kZSlcclxuXHJcbiAgICAgIGZvciBuZWlnaGJvciBpbiBuZWlnaGJvcnNcclxuICAgICAgICBpZiBuZWlnaGJvci52aXNpdGVkIG9yIChuZWlnaGJvci50eXBlID09IGZsb29yZ2VuLldBTEwpXHJcbiAgICAgICAgICAjIE5vdCBhIHZhbGlkIG5vZGUgdG8gcHJvY2Vzcywgc2tpcCB0byBuZXh0IG5laWdoYm9yLlxyXG4gICAgICAgICAgY29udGludWVcclxuXHJcbiAgICAgICAgIyBUaGUgZGlzdGFuY2UgaXMgdGhlIHNob3J0ZXN0IGRpc3RhbmNlIGZyb20gc3RhcnQgdG8gY3VycmVudCBub2RlLlxyXG4gICAgICAgICMgV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgcGF0aCB3ZSBoYXZlIGFycml2ZWQgYXQgdGhpcyBuZWlnaGJvciBpcyB0aGUgc2hvcnRlc3Qgb25lIHdlIGhhdmUgc2VlbiB5ZXQuXHJcbiAgICAgICAgbmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlID0gY3VycmVudE5vZGUuZGlzdGFuY2UgKyAxXHJcbiAgICAgICAgaXNEaWFnb25hbCA9IChjdXJyZW50Tm9kZS54ICE9IG5laWdoYm9yLngpIGFuZCAoY3VycmVudE5vZGUueSAhPSBuZWlnaGJvci55KVxyXG4gICAgICAgIGlmIGlzRGlhZ29uYWxcclxuICAgICAgICAgIG5laWdoYm9yRGlzdGFuY2VWaWFUaGlzTm9kZSArPSAwLjFcclxuXHJcbiAgICAgICAgaWYgKG5laWdoYm9yRGlzdGFuY2VWaWFUaGlzTm9kZSA8IG5laWdoYm9yLmRpc3RhbmNlKSBhbmQgbm90IG5laWdoYm9yLnZpc2l0ZWRcclxuICAgICAgICAgICMgRm91bmQgYW4gb3B0aW1hbCAoc28gZmFyKSBwYXRoIHRvIHRoaXMgbm9kZS5cclxuICAgICAgICAgIG5laWdoYm9yLmRpc3RhbmNlID0gbmVpZ2hib3JEaXN0YW5jZVZpYVRoaXNOb2RlXHJcbiAgICAgICAgICBuZWlnaGJvci5wYXJlbnQgPSBjdXJyZW50Tm9kZVxyXG4gICAgICAgICAgaWYgbmVpZ2hib3IuaGVhcGVkXHJcbiAgICAgICAgICAgIGhlYXAucmVzY29yZShuZWlnaGJvcilcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgaGVhcC5wdXNoKG5laWdoYm9yKVxyXG4gICAgICAgICAgICBuZWlnaGJvci5oZWFwZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIFtdXHJcblxyXG4gIG5laWdoYm9yczogKGdyaWQsIG5vZGUpIC0+XHJcbiAgICByZXQgPSBbXVxyXG4gICAgeCA9IG5vZGUueFxyXG4gICAgeSA9IG5vZGUueVxyXG5cclxuICAgICMgU291dGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5LTFdKVxyXG5cclxuICAgICMgU291dGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5LTFdKVxyXG5cclxuICAgICMgTm9ydGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5KzFdKVxyXG5cclxuICAgICMgTm9ydGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5KzFdKVxyXG5cclxuICAgICMgV2VzdFxyXG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ldKVxyXG5cclxuICAgICMgRWFzdFxyXG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ldKVxyXG5cclxuICAgICMgU291dGhcclxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beS0xXVxyXG4gICAgICByZXQucHVzaChncmlkW3hdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beSsxXSlcclxuXHJcbiAgICByZXR1cm4gcmV0XHJcblxyXG5jbGFzcyBQYXRoZmluZGVyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IsIEBmbGFncykgLT5cclxuXHJcbiAgY2FsYzogKHN0YXJ0WCwgc3RhcnRZLCBkZXN0WCwgZGVzdFkpIC0+XHJcbiAgICBkaWprc3RyYSA9IG5ldyBEaWprc3RyYSBAZmxvb3JcclxuICAgIHJldHVybiBkaWprc3RyYS5zZWFyY2goQGZsb29yLmdyaWRbc3RhcnRYXVtzdGFydFldLCBAZmxvb3IuZ3JpZFtkZXN0WF1bZGVzdFldKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXRoZmluZGVyXHJcbiJdfQ==
;