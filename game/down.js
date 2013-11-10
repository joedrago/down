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
    Player.__super__.constructor.call(this, new Tilesheet(resources.player, 12, 14, 18), this.animFrame);
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


},{}],"main":[function(require,module,exports){
module.exports=require('mBOMH+');
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
        x: 40,
        y: 40,
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


},{"brain/player":"TryngT","mode/game":"fSCZ8s","mode/intro":"GT1UVd","resources":"NN+gjI","world/floorgen":"4WaFsS"}],"mode/game":[function(require,module,exports){
module.exports=require('fSCZ8s');
},{}],"fSCZ8s":[function(require,module,exports){
var GameMode, Mode, Pathfinder, Tilesheet, config, floorgen, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

config = require('config');

resources = require('resources');

floorgen = require('world/floorgen');

Pathfinder = require('world/pathfinder');

Tilesheet = require('gfx/tilesheet');

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
          sprite.setPosition(cc.p(i * cc.unitSize, j * cc.unitSize));
          this.gfx.floorLayer.addChild(sprite, -1);
        }
      }
    }
    this.gfx.floorLayer.setScale(config.scale.min);
    this.gfx.floorLayer.setScale(1.0);
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
      sprite.setPosition(cc.p(p.x * cc.unitSize, p.y * cc.unitSize));
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


},{"base/mode":"mhMvP9","config":"tWG/YV","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/floorgen":"4WaFsS","world/pathfinder":"2ZcY+C"}],"GT1UVd":[function(require,module,exports){
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


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"mode/intro":[function(require,module,exports){
module.exports=require('GT1UVd');
},{}],"NN+gjI":[function(require,module,exports){
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1QixpQkFBdkI7O0FBRUEsQ0FGQSxDQUVlLENBQUYsRUFBUSxDQUFSLElBQWI7Q0FBNkIsQ0FDM0IsQ0FBTSxDQUFOLEtBQVE7Q0FDTixFQURNLENBQUQ7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxHQUVBLFdBQUE7Q0FDQyxFQUFpQixDQUFqQixPQUFELEdBQUE7Q0FMeUIsRUFDckI7Q0FEcUIs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O0FBNk9BLENBN09BLEVBNk9pQixHQUFYLENBQU4sR0E3T0EiLCJzb3VyY2VzQ29udGVudCI6W251bGwsIlxuLy8gbm90IGltcGxlbWVudGVkXG4vLyBUaGUgcmVhc29uIGZvciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwidmFyIHdpZHRoID0gMjU2Oy8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcclxudmFyIGNodW5rcyA9IDY7Ly8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxyXG52YXIgc2lnbmlmaWNhbmNlID0gNTI7Ly8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxyXG5cclxudmFyIG92ZXJmbG93LCBzdGFydGRlbm9tOyAvL251bWJlcnNcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgaWYgKCFzZWVkKSB7XHJcbiAgICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgICAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2xkUmFuZG9tO1xyXG4gIH1cclxuICB2YXIga2V5ID0gW107XHJcbiAgdmFyIGFyYzQ7XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHNlZWQgPSBtaXhrZXkoZmxhdHRlbihzZWVkLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE92ZXJyaWRlIE1hdGgucmFuZG9tXHJcblxyXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcclxuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxyXG5cclxuICBmdW5jdGlvbiByYW5kb20oKSB7ICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpOyAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgIHZhciBkID0gc3RhcnRkZW5vbTsgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICB2YXIgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfVxyXG4gIHJhbmRvbS5zZWVkID0gc2VlZDtcclxuICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgIE1hdGhbJ3JhbmRvbSddID0gcmFuZG9tO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBzZWVkIHRoYXQgd2FzIHVzZWRcclxuICByZXR1cm4gcmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCB1LCBtZSA9IHRoaXMsIGtleWxlbiA9IGtleS5sZW5ndGg7XHJcbiAgdmFyIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSBtZS5tID0gMDtcclxuICBtZS5TID0gW107XHJcbiAgbWUuYyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7IG1lLlNbaV0gPSBpKys7IH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgdCA9IG1lLlNbaV07XHJcbiAgICBqID0gbG93Yml0cyhqICsgdCArIGtleVtpICUga2V5bGVuXSk7XHJcbiAgICB1ID0gbWUuU1tqXTtcclxuICAgIG1lLlNbaV0gPSB1O1xyXG4gICAgbWUuU1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgbWUuZyA9IGZ1bmN0aW9uIGdldG5leHQoY291bnQpIHtcclxuICAgIHZhciBzID0gbWUuUztcclxuICAgIHZhciBpID0gbG93Yml0cyhtZS5pICsgMSk7IHZhciB0ID0gc1tpXTtcclxuICAgIHZhciBqID0gbG93Yml0cyhtZS5qICsgdCk7IHZhciB1ID0gc1tqXTtcclxuICAgIHNbaV0gPSB1O1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgICB2YXIgciA9IHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgd2hpbGUgKC0tY291bnQpIHtcclxuICAgICAgaSA9IGxvd2JpdHMoaSArIDEpOyB0ID0gc1tpXTtcclxuICAgICAgaiA9IGxvd2JpdHMoaiArIHQpOyB1ID0gc1tqXTtcclxuICAgICAgc1tpXSA9IHU7XHJcbiAgICAgIHNbal0gPSB0O1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1tsb3diaXRzKHQgKyB1KV07XHJcbiAgICB9XHJcbiAgICBtZS5pID0gaTtcclxuICAgIG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgfTtcclxuICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIG1lLmcod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtPYmplY3Q9fSByZXN1bHQgXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHByb3BcclxuICAqIEBwYXJhbSB7c3RyaW5nPX0gdHlwICovXHJcbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCwgcmVzdWx0LCBwcm9wLCB0eXApIHtcclxuICByZXN1bHQgPSBbXTtcclxuICB0eXAgPSB0eXBlb2Yob2JqKTtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XHJcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChwcm9wLmluZGV4T2YoJ1MnKSA8IDUpIHsgICAgLy8gQXZvaWQgRkYzIGJ1ZyAobG9jYWwvc2Vzc2lvblN0b3JhZ2UpXHJcbiAgICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IG9iaiArICh0eXAgIT0gJ3N0cmluZycgPyAnXFwwJyA6ICcnKSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge251bWJlcj19IHNtZWFyIFxyXG4gICogQHBhcmFtIHtudW1iZXI9fSBqICovXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXksIHNtZWFyLCBqKSB7XHJcbiAgc2VlZCArPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBzZWVkIGlzIGEgc3RyaW5nXHJcbiAgc21lYXIgPSAwO1xyXG4gIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgaisrKSB7XHJcbiAgICBrZXlbbG93Yml0cyhqKV0gPVxyXG4gICAgICBsb3diaXRzKChzbWVhciBePSBrZXlbbG93Yml0cyhqKV0gKiAxOSkgKyBzZWVkLmNoYXJDb2RlQXQoaikpO1xyXG4gIH1cclxuICBzZWVkID0gJyc7XHJcbiAgZm9yIChqIGluIGtleSkgeyBzZWVkICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5W2pdKTsgfVxyXG4gIHJldHVybiBzZWVkO1xyXG59XHJcblxyXG4vL1xyXG4vLyBsb3diaXRzKClcclxuLy8gQSBxdWljayBcIm4gbW9kIHdpZHRoXCIgZm9yIHdpZHRoIGEgcG93ZXIgb2YgMi5cclxuLy9cclxuZnVuY3Rpb24gbG93Yml0cyhuKSB7IHJldHVybiBuICYgKHdpZHRoIC0gMSk7IH1cclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxuc3RhcnRkZW5vbSA9IE1hdGgucG93KHdpZHRoLCBjaHVua3MpO1xyXG5zaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBzaWduaWZpY2FuY2UpO1xyXG5vdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDI7XHJcbiIsIiMgaG93IG1hbnkgcGl4ZWxzIGNhbiB5b3UgZHJhZyBiZWZvcmUgaXQgaXMgYWN0dWFsbHkgY29uc2lkZXJlZCBhIGRyYWdcclxuRU5HQUdFX0RSQUdfRElTVEFOQ0UgPSAzMFxyXG5cclxuSW5wdXRMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICBAc2V0TW91c2VFbmFibGVkKHRydWUpXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMgPSBbXVxyXG5cclxuICBjYWxjRGlzdGFuY2U6ICh4MSwgeTEsIHgyLCB5MikgLT5cclxuICAgIGR4ID0geDIgLSB4MVxyXG4gICAgZHkgPSB5MiAtIHkxXHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcblxyXG4gIHNldERyYWdQb2ludDogLT5cclxuICAgIEBkcmFnWCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICBAZHJhZ1kgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICBjYWxjUGluY2hBbmNob3I6IC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgQHBpbmNoWCA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS54ICsgQHRyYWNrZWRUb3VjaGVzWzFdLngpIC8gMilcclxuICAgICAgQHBpbmNoWSA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS55ICsgQHRyYWNrZWRUb3VjaGVzWzFdLnkpIC8gMilcclxuICAgICAgIyBjYy5sb2cgXCJwaW5jaCBhbmNob3Igc2V0IGF0ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1cIlxyXG5cclxuICBhZGRUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgZm9yIHQgaW4gQHRyYWNrZWRUb3VjaGVzXHJcbiAgICAgIGlmIHQuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm5cclxuICAgIEB0cmFja2VkVG91Y2hlcy5wdXNoIHtcclxuICAgICAgaWQ6IGlkXHJcbiAgICAgIHg6IHhcclxuICAgICAgeTogeVxyXG4gICAgfVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICMgV2UganVzdCBhZGRlZCBhIHNlY29uZCB0b3VjaCBzcG90LiBDYWxjdWxhdGUgdGhlIGFuY2hvciBmb3IgcGluY2hpbmcgbm93XHJcbiAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgI2NjLmxvZyBcImFkZGluZyB0b3VjaCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgcmVtb3ZlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgICBpZiBpbmRleCA8IDJcclxuICAgICAgICAjIFdlIGp1c3QgZm9yZ290IG9uZSBvZiBvdXIgcGluY2ggdG91Y2hlcy4gUGljayBhIG5ldyBhbmNob3Igc3BvdC5cclxuICAgICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICAgI2NjLmxvZyBcImZvcmdldHRpbmcgaWQgI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHVwZGF0ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnggPSB4XHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueSA9IHlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAZHJhZ2dpbmcgPSBmYWxzZVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQGFkZFRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID4gMVxyXG4gICAgICAjIFRoZXkncmUgcGluY2hpbmcsIGRvbid0IGV2ZW4gYm90aGVyIHRvIGVtaXQgYSBjbGlja1xyXG4gICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcblxyXG4gIG9uVG91Y2hlc01vdmVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBwcmV2RGlzdGFuY2UgPSAwXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgcHJldkRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBwcmV2WCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICAgIHByZXZZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAdXBkYXRlVG91Y2godC5nZXRJZCgpLCBwb3MueCwgcG9zLnkpXHJcblxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICMgc2luZ2xlIHRvdWNoLCBjb25zaWRlciBkcmFnZ2luZ1xyXG4gICAgICBkcmFnRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlIEBkcmFnWCwgQGRyYWdZLCBAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuICAgICAgaWYgQGRyYWdnaW5nIG9yIChkcmFnRGlzdGFuY2UgPiBFTkdBR0VfRFJBR19ESVNUQU5DRSlcclxuICAgICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcbiAgICAgICAgaWYgZHJhZ0Rpc3RhbmNlID4gMC41XHJcbiAgICAgICAgICBkeCA9IEB0cmFja2VkVG91Y2hlc1swXS54IC0gQGRyYWdYXHJcbiAgICAgICAgICBkeSA9IEB0cmFja2VkVG91Y2hlc1swXS55IC0gQGRyYWdZXHJcbiAgICAgICAgICAjY2MubG9nIFwic2luZ2xlIGRyYWc6ICN7ZHh9LCAje2R5fVwiXHJcbiAgICAgICAgICBAbW9kZS5vbkRyYWcoZHgsIGR5KVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG5cclxuICAgIGVsc2UgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgICMgYXQgbGVhc3QgdHdvIGZpbmdlcnMgcHJlc2VudCwgY2hlY2sgZm9yIHBpbmNoL3pvb21cclxuICAgICAgY3VyckRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgICAgZGVsdGFEaXN0YW5jZSA9IGN1cnJEaXN0YW5jZSAtIHByZXZEaXN0YW5jZVxyXG4gICAgICBpZiBkZWx0YURpc3RhbmNlICE9IDBcclxuICAgICAgICAjY2MubG9nIFwiZGlzdGFuY2UgZHJhZ2dlZCBhcGFydDogI3tkZWx0YURpc3RhbmNlfSBbYW5jaG9yOiAje0BwaW5jaFh9LCAje0BwaW5jaFl9XVwiXHJcbiAgICAgICAgQG1vZGUub25ab29tKEBwaW5jaFgsIEBwaW5jaFksIGRlbHRhRGlzdGFuY2UpXHJcblxyXG4gIG9uVG91Y2hlc0VuZGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDEgYW5kIG5vdCBAZHJhZ2dpbmdcclxuICAgICAgcG9zID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpXHJcbiAgICAgICNjYy5sb2cgXCJjbGljayBhdCAje3Bvcy54fSwgI3twb3MueX1cIlxyXG4gICAgICBAbW9kZS5vbkNsaWNrKHBvcy54LCBwb3MueSlcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEByZW1vdmVUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG5cclxuICBvblNjcm9sbFdoZWVsOiAoZXYpIC0+XHJcbiAgICBwb3MgPSBldi5nZXRMb2NhdGlvbigpXHJcbiAgICBAbW9kZS5vblpvb20ocG9zLngsIHBvcy55LCBldi5nZXRXaGVlbERlbHRhKCkpXHJcbn1cclxuXHJcbkdmeExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxufVxyXG5cclxuTW9kZVNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuXHJcbiAgICBAaW5wdXQgPSBuZXcgSW5wdXRMYXllcigpXHJcbiAgICBAaW5wdXQuaW5pdChAbW9kZSlcclxuICAgIEBhZGRDaGlsZChAaW5wdXQpXHJcblxyXG4gICAgQGdmeCA9IG5ldyBHZnhMYXllcigpXHJcbiAgICBAZ2Z4LmluaXQoKVxyXG4gICAgQGFkZENoaWxkKEBnZngpXHJcblxyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBtb2RlLm9uQWN0aXZhdGUoKVxyXG59XHJcblxyXG5jbGFzcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT5cclxuICAgIEBzY2VuZSA9IG5ldyBNb2RlU2NlbmUoKVxyXG4gICAgQHNjZW5lLmluaXQodGhpcylcclxuICAgIEBzY2VuZS5yZXRhaW4oKVxyXG5cclxuICBhY3RpdmF0ZTogLT5cclxuICAgIGNjLmxvZyBcImFjdGl2YXRpbmcgbW9kZSAje0BuYW1lfVwiXHJcbiAgICBpZiBjYy5zYXdPbmVTY2VuZT9cclxuICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wb3BTY2VuZSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIGNjLnNhd09uZVNjZW5lID0gdHJ1ZVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wdXNoU2NlbmUoQHNjZW5lKVxyXG5cclxuICBhZGQ6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LmFkZENoaWxkKG9iailcclxuXHJcbiAgcmVtb3ZlOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5yZW1vdmVDaGlsZChvYmopXHJcblxyXG4gICMgdG8gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIE1vZGVzXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVcclxuIiwiaWYgZG9jdW1lbnQ/XHJcbiAgcmVxdWlyZSAnYm9vdC9tYWlud2ViJ1xyXG5lbHNlXHJcbiAgcmVxdWlyZSAnYm9vdC9tYWluZHJvaWQnXHJcbiIsInJlcXVpcmUgJ2pzYi5qcydcclxucmVxdWlyZSAnbWFpbidcclxuXHJcbm51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpXHJcbm51bGxTY2VuZS5pbml0KClcclxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUobnVsbFNjZW5lKVxyXG5jYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuIiwiY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5cclxuY29jb3MyZEFwcCA9IGNjLkFwcGxpY2F0aW9uLmV4dGVuZCB7XHJcbiAgY29uZmlnOiBjb25maWdcclxuICBjdG9yOiAoc2NlbmUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIGNjLkNPQ09TMkRfREVCVUcgPSBAY29uZmlnWydDT0NPUzJEX0RFQlVHJ11cclxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxyXG4gICAgY2Muc2V0dXAoQGNvbmZpZ1sndGFnJ10pXHJcbiAgICBjYy5BcHBDb250cm9sbGVyLnNoYXJlQXBwQ29udHJvbGxlcigpLmRpZEZpbmlzaExhdW5jaGluZ1dpdGhPcHRpb25zKClcclxuXHJcbiAgYXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IC0+XHJcbiAgICAgIGlmIGNjLlJlbmRlckRvZXNub3RTdXBwb3J0KClcclxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXHJcbiAgICAgICAgICBhbGVydCBcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCJcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgIyBpbml0aWFsaXplIGRpcmVjdG9yXHJcbiAgICAgIGRpcmVjdG9yID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKVxyXG5cclxuICAgICAgY2MuRUdMVmlldy5nZXRJbnN0YW5jZSgpLnNldERlc2lnblJlc29sdXRpb25TaXplKDEyODAsIDcyMCwgY2MuUkVTT0xVVElPTl9QT0xJQ1kuU0hPV19BTEwpXHJcblxyXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcclxuICAgICAgZGlyZWN0b3Iuc2V0RGlzcGxheVN0YXRzIEBjb25maWdbJ3Nob3dGUFMnXVxyXG5cclxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xyXG4gICAgICBkaXJlY3Rvci5zZXRBbmltYXRpb25JbnRlcnZhbCAxLjAgLyBAY29uZmlnWydmcmFtZVJhdGUnXVxyXG5cclxuICAgICAgIyBsb2FkIHJlc291cmNlc1xyXG4gICAgICByZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbiAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQocmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QsIC0+XHJcbiAgICAgICAgcmVxdWlyZSAnbWFpbidcclxuICAgICAgICBudWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKTtcclxuICAgICAgICBudWxsU2NlbmUuaW5pdCgpXHJcbiAgICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUobnVsbFNjZW5lKVxyXG4jICAgICAgICBjYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuICAgICAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxyXG4gICAgICB0aGlzKVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxubXlBcHAgPSBuZXcgY29jb3MyZEFwcCgpXHJcbiIsImNsYXNzIEJyYWluXHJcbiAgY29uc3RydWN0b3I6IChAdGlsZXMsIEBhbmltRnJhbWUpIC0+XHJcbiAgICBAZmFjaW5nUmlnaHQgPSB0cnVlXHJcbiAgICBAY2QgPSAwXHJcbiAgICBAaW50ZXJwRnJhbWVzID0gW11cclxuICAgIEBwYXRoID0gW11cclxuXHJcbiAgbW92ZTogKGd4LCBneSwgZnJhbWVzKSAtPlxyXG4gICAgQGludGVycEZyYW1lcyA9IFtdXHJcbiAgICBkeCA9IChAeCAtIGd4KSAqIGNjLnVuaXRTaXplXHJcbiAgICBkeSA9IChAeSAtIGd5KSAqIGNjLnVuaXRTaXplXHJcbiAgICBAZmFjaW5nUmlnaHQgPSAoZHggPCAwKVxyXG4gICAgaSA9IGZyYW1lcy5sZW5ndGhcclxuICAgIGZvciBmIGluIGZyYW1lc1xyXG4gICAgICBhbmltRnJhbWUgPSB7XHJcbiAgICAgICAgeDogZHggKiBpIC8gZnJhbWVzLmxlbmd0aFxyXG4gICAgICAgIHk6IGR5ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICBhbmltRnJhbWU6IGZcclxuICAgICAgfVxyXG4gICAgICBAaW50ZXJwRnJhbWVzLnB1c2ggYW5pbUZyYW1lXHJcbiAgICAgIGktLVxyXG5cclxuICAgIGNjLmdhbWUuc2V0VHVybkZyYW1lcyhmcmFtZXMubGVuZ3RoKVxyXG5cclxuICAgICMgSW1tZWRpYXRlbHkgbW92ZSwgb25seSBwcmV0ZW5kIHRvIGFuaW1hdGUgdGhlcmUgb3ZlciB0aGUgbmV4dCBmcmFtZXMubGVuZ3RoIGZyYW1lc1xyXG4gICAgQHggPSBneFxyXG4gICAgQHkgPSBneVxyXG5cclxuICB3YWxrUGF0aDogKEBwYXRoKSAtPlxyXG5cclxuICBjcmVhdGVTcHJpdGU6IC0+XHJcbiAgICBzID0gY2MuU3ByaXRlLmNyZWF0ZSBAdGlsZXMucmVzb3VyY2VcclxuICAgIEB1cGRhdGVTcHJpdGUocylcclxuICAgIHJldHVybiBzXHJcblxyXG4gIHVwZGF0ZVNwcml0ZTogKHNwcml0ZSkgLT5cclxuICAgIHggPSBAeCAqIGNjLnVuaXRTaXplXHJcbiAgICB5ID0gQHkgKiBjYy51bml0U2l6ZVxyXG4gICAgYW5pbUZyYW1lID0gQGFuaW1GcmFtZVxyXG4gICAgaWYgQGludGVycEZyYW1lcy5sZW5ndGhcclxuICAgICAgZnJhbWUgPSBAaW50ZXJwRnJhbWVzLnNwbGljZSgwLCAxKVswXVxyXG4gICAgICB4ICs9IGZyYW1lLnhcclxuICAgICAgeSArPSBmcmFtZS55XHJcbiAgICAgIGFuaW1GcmFtZSA9IGZyYW1lLmFuaW1GcmFtZVxyXG4gICAgIyBlbHNlXHJcbiAgICAjICAgYW5pbUZyYW1lID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMilcclxuICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdChAdGlsZXMucmVjdChhbmltRnJhbWUpKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXHJcbiAgICB4YW5jaG9yID0gMS4wXHJcbiAgICB4c2NhbGUgPSAtMS4wXHJcbiAgICBpZiBAZmFjaW5nUmlnaHRcclxuICAgICAgeGFuY2hvciA9IDBcclxuICAgICAgeHNjYWxlID0gMS4wXHJcbiAgICBzcHJpdGUuc2V0U2NhbGVYKHhzY2FsZSlcclxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKHhhbmNob3IsIDApKVxyXG5cclxuICB0YWtlU3RlcDogLT5cclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgaWYgQHBhdGgubGVuZ3RoID4gMFxyXG4gICAgICAgIHN0ZXAgPSBAcGF0aC5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgICAjIGNjLmxvZyBcInRha2luZyBzdGVwIHRvICN7c3RlcC54fSwgI3tzdGVwLnl9XCJcclxuICAgICAgICBAbW92ZShzdGVwLngsIHN0ZXAueSwgWzIsMyw0XSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHRpY2s6IChlbGFwc2VkVHVybnMpIC0+XHJcbiAgICBpZiBAY2QgPiAwXHJcbiAgICAgIEBjZCAtPSBlbGFwc2VkVHVybnMgaWYgQGNkID4gMFxyXG4gICAgICBAY2QgPSAwIGlmIEBjZCA8IDBcclxuICAgIGlmIEBjZCA9PSAwXHJcbiAgICAgIEB0aGluaygpXHJcblxyXG4gIHRoaW5rOiAtPlxyXG4gICAgY2MubG9nIFwidGhpbmsgbm90IGltcGxlbWVudGVkIVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJyYWluXHJcbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuQnJhaW4gPSByZXF1aXJlICdicmFpbi9icmFpbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblRpbGVzaGVldCA9IHJlcXVpcmUgJ2dmeC90aWxlc2hlZXQnXHJcblxyXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBCcmFpblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBhbmltRnJhbWUgPSAwXHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgdGhpc1trXSA9IHZcclxuICAgIHN1cGVyIG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnBsYXllciwgMTIsIDE0LCAxOCksIEBhbmltRnJhbWVcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgdGhpbms6IC0+XHJcbiAgICBpZiBAdGFrZVN0ZXAoKVxyXG4gICAgICBAY2QgPSA1MFxyXG5cclxuICBhY3Q6IChneCwgZ3kpIC0+XHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoQHgsIEB5LCBneCwgZ3kpXHJcbiAgICBAd2Fsa1BhdGgocGF0aClcclxuICAgIGNjLmxvZyBcInBhdGggaXMgI3twYXRoLmxlbmd0aH0gbG9uZ1wiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllclxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2NhbGU6XHJcbiAgICBtaW46IDEuNVxyXG4gICAgbWF4OiA4LjBcclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjYwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbmNsYXNzIFNjZW5lIGV4dGVuZHMgY2MuU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBMYXllcjogTGF5ZXJcclxuICBTY2VuZTogU2NlbmVcclxuIiwiXHJcbmNsYXNzIFRpbGVzaGVldFxyXG4gIGNvbnN0cnVjdG9yOiAoQHJlc291cmNlLCBAd2lkdGgsIEBoZWlnaHQsIEBzdHJpZGUpIC0+XHJcblxyXG4gIHJlY3Q6ICh2KSAtPlxyXG4gICAgeSA9IE1hdGguZmxvb3IodiAvIEBzdHJpZGUpXHJcbiAgICB4ID0gdiAlIEBzdHJpZGVcclxuICAgIHJldHVybiBjYy5yZWN0KHggKiBAd2lkdGgsIHkgKiBAaGVpZ2h0LCBAd2lkdGgsIEBoZWlnaHQpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QbGF5ZXIgPSByZXF1aXJlICdicmFpbi9wbGF5ZXInXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAdHVybkZyYW1lcyA9IDBcclxuICAgIEBtb2RlcyA9XHJcbiAgICAgIGludHJvOiBuZXcgSW50cm9Nb2RlKClcclxuICAgICAgZ2FtZTogbmV3IEdhbWVNb2RlKClcclxuXHJcbiAgbmV3Rmxvb3I6IC0+XHJcbiAgICBmbG9vcmdlbi5nZW5lcmF0ZSgpXHJcblxyXG4gIGN1cnJlbnRGbG9vcjogLT5cclxuICAgIHJldHVybiBAc3RhdGUuZmxvb3JzW0BzdGF0ZS5wbGF5ZXIuZmxvb3JdXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBjYy5sb2cgXCJuZXdHYW1lXCJcclxuICAgIEBzdGF0ZSA9IHtcclxuICAgICAgcnVubmluZzogZmFsc2VcclxuICAgICAgcGxheWVyOiBuZXcgUGxheWVyKHtcclxuICAgICAgICB4OiA0MFxyXG4gICAgICAgIHk6IDQwXHJcbiAgICAgICAgZmxvb3I6IDFcclxuICAgICAgfSlcclxuICAgICAgZmxvb3JzOiBbXHJcbiAgICAgICAge31cclxuICAgICAgICBAbmV3Rmxvb3IoKVxyXG4gICAgICBdXHJcbiAgICB9XHJcblxyXG4gIHNldFR1cm5GcmFtZXM6IChjb3VudCkgLT5cclxuICAgIGlmIEB0dXJuRnJhbWVzIDwgY291bnRcclxuICAgICAgQHR1cm5GcmFtZXMgPSBjb3VudFxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy51bml0U2l6ZSA9IDE2XHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblRpbGVzaGVldCA9IHJlcXVpcmUgJ2dmeC90aWxlc2hlZXQnXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDE4XHJcbiAgICAgIGVsc2UgMFxyXG5cclxuICBnZnhDbGVhcjogLT5cclxuICAgIGlmIEBnZng/XHJcbiAgICAgIGlmIEBnZnguZmxvb3JMYXllcj9cclxuICAgICAgICBAcmVtb3ZlIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeCA9XHJcbiAgICAgIHBhdGhTcHJpdGVzOiBbXVxyXG5cclxuICBnZnhSZW5kZXJGbG9vcjogLT5cclxuICAgIEBnZnguZmxvb3JMYXllciA9IG5ldyBjYy5MYXllcigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuXHJcbiAgICB0aWxlcyA9IG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnRpbGVzMCwgMTYsIDE2LCAxNilcclxuICAgIGZsb29yID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKVxyXG4gICAgZm9yIGogaW4gWzAuLi5mbG9vci5oZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uZmxvb3Iud2lkdGhdXHJcbiAgICAgICAgdiA9IGZsb29yLmdldChpLCBqKVxyXG4gICAgICAgIGlmIHYgIT0gMFxyXG4gICAgICAgICAgc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSB0aWxlcy5yZXNvdXJjZVxyXG4gICAgICAgICAgc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICAgICAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QodGlsZXMucmVjdChAdGlsZUZvckdyaWRWYWx1ZSh2KSkpXHJcbiAgICAgICAgICBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChpICogY2MudW5pdFNpemUsIGogKiBjYy51bml0U2l6ZSkpXHJcbiAgICAgICAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgc3ByaXRlLCAtMVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShjb25maWcuc2NhbGUubWluKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKDEuMClcclxuICAgIEBhZGQgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4Q2VudGVyTWFwKClcclxuXHJcbiAgZ2Z4UGxhY2VNYXA6IChtYXBYLCBtYXBZLCBzY3JlZW5YLCBzY3JlZW5ZKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgeCA9IHNjcmVlblggLSAobWFwWCAqIHNjYWxlKVxyXG4gICAgeSA9IHNjcmVlblkgLSAobWFwWSAqIHNjYWxlKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHgsIHkpXHJcblxyXG4gIGdmeENlbnRlck1hcDogLT5cclxuICAgIGNlbnRlciA9IGNjLmdhbWUuY3VycmVudEZsb29yKCkuYmJveC5jZW50ZXIoKVxyXG4gICAgQGdmeFBsYWNlTWFwKGNlbnRlci54ICogY2MudW5pdFNpemUsIGNlbnRlci55ICogY2MudW5pdFNpemUsIGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMilcclxuXHJcbiAgZ2Z4U2NyZWVuVG9NYXBDb29yZHM6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6ICh4IC0gcG9zLngpIC8gc2NhbGVcclxuICAgICAgeTogKHkgLSBwb3MueSkgLyBzY2FsZVxyXG4gICAgfVxyXG5cclxuICBnZnhSZW5kZXJQbGF5ZXI6IC0+XHJcbiAgICBAZ2Z4LnBsYXllciA9IHt9XHJcbiAgICBAZ2Z4LnBsYXllci5zcHJpdGUgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jcmVhdGVTcHJpdGUoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGxheWVyLnNwcml0ZSwgMFxyXG5cclxuICAjIGdmeFVwZGF0ZVBvc2l0aW9uczogLT5cclxuICAjICAgcGxheWVyID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXJcclxuICAjICAgeCA9IHBsYXllci54ICogY2MudW5pdFNpemVcclxuICAjICAgeSA9IHBsYXllci55ICogY2MudW5pdFNpemVcclxuICAjICAgQGdmeC5wbGF5ZXIuc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXHJcbiAgIyAgIGlmIHBsYXllci5wcmV2QW5pbUZyYW1lICE9IHBsYXllci5hbmltRnJhbWVcclxuICAjICAgICBAZ2Z4LnBsYXllci5zcHJpdGUuc2V0VGV4dHVyZVJlY3QoQGdmeC5wbGF5ZXIudGlsZXMucmVjdChwbGF5ZXIuYW5pbUZyYW1lKSlcclxuICAjICAgICBwbGF5ZXIucHJldkFuaW1GcmFtZSA9IHBsYXllci5hbmltRnJhbWVcclxuXHJcbiAgZ2Z4QWRqdXN0TWFwU2NhbGU6IChkZWx0YSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHNjYWxlICs9IGRlbHRhXHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5tYXggaWYgc2NhbGUgPiBjb25maWcuc2NhbGUubWF4XHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5taW4gaWYgc2NhbGUgPCBjb25maWcuc2NhbGUubWluXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoc2NhbGUpXHJcblxyXG4gIGdmeFJlbmRlclBhdGg6IChwYXRoKSAtPlxyXG4gICAgdGlsZXMgPSBuZXcgVGlsZXNoZWV0KHJlc291cmNlcy50aWxlczAsIDE2LCAxNiwgMTYpXHJcbiAgICBmb3IgcyBpbiBAZ2Z4LnBhdGhTcHJpdGVzXHJcbiAgICAgIEBnZnguZmxvb3JMYXllci5yZW1vdmVDaGlsZCBzXHJcbiAgICBAZ2Z4LnBhdGhTcHJpdGVzID0gW11cclxuICAgIGZvciBwIGluIHBhdGhcclxuICAgICAgc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSB0aWxlcy5yZXNvdXJjZVxyXG4gICAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgICAgc3ByaXRlLnNldFRleHR1cmVSZWN0KHRpbGVzLnJlY3QoMTcpKVxyXG4gICAgICBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChwLnggKiBjYy51bml0U2l6ZSwgcC55ICogY2MudW5pdFNpemUpKVxyXG4gICAgICBzcHJpdGUuc2V0T3BhY2l0eSAxMjhcclxuICAgICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIHNwcml0ZVxyXG4gICAgICBAZ2Z4LnBhdGhTcHJpdGVzLnB1c2ggc3ByaXRlXHJcblxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24ocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIEBnZnhBZGp1c3RNYXBTY2FsZShkZWx0YSAvIDIwMClcclxuICAgIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgICBjYy5nYW1lLm5ld0dhbWUoKVxyXG4gICAgQGdmeENsZWFyKClcclxuICAgIEBnZnhSZW5kZXJGbG9vcigpXHJcbiAgICBAZ2Z4UmVuZGVyUGxheWVyKClcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0U2NoZWR1bGVyKCkuc2NoZWR1bGVDYWxsYmFja0ZvclRhcmdldCh0aGlzLCBAdXBkYXRlLCAxIC8gNjAuMCwgY2MuUkVQRUFUX0ZPUkVWRVIsIDAsIGZhbHNlKVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgZ3JpZFggPSBNYXRoLmZsb29yKHBvcy54IC8gY2MudW5pdFNpemUpXHJcbiAgICBncmlkWSA9IE1hdGguZmxvb3IocG9zLnkgLyBjYy51bml0U2l6ZSlcclxuXHJcbiAgICBpZiBub3QgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nXHJcbiAgICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLmFjdChncmlkWCwgZ3JpZFkpXHJcbiAgICAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IHRydWVcclxuICAgICAgY2MubG9nIFwicnVubmluZ1wiXHJcblxyXG4gICAgIyBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgICMgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhjYy5nYW1lLnN0YXRlLnBsYXllci54LCBjYy5nYW1lLnN0YXRlLnBsYXllci55LCBncmlkWCwgZ3JpZFkpXHJcbiAgICAjIEBnZnhSZW5kZXJQYXRoKHBhdGgpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudXBkYXRlU3ByaXRlKEBnZngucGxheWVyLnNwcml0ZSlcclxuXHJcbiAgICBpZiBjYy5nYW1lLnR1cm5GcmFtZXMgPiAwXHJcbiAgICAgIGNjLmdhbWUudHVybkZyYW1lcy0tXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGNjLmdhbWUuc3RhdGUucnVubmluZ1xyXG4gICAgICAgIG1pbmltdW1DRCA9IDEwMDBcclxuICAgICAgICBpZiBtaW5pbXVtQ0QgPiBjYy5nYW1lLnN0YXRlLnBsYXllci5jZFxyXG4gICAgICAgICAgbWluaW11bUNEID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY2RcclxuICAgICAgICAjIFRPRE86IGNoZWNrIGNkIG9mIGFsbCBOUENzIG9uIHRoZSBmbG9vciBhZ2FpbnN0IHRoZSBtaW5pbXVtQ0RcclxuICAgICAgICBjYy5nYW1lLnN0YXRlLnBsYXllci50aWNrKG1pbmltdW1DRClcclxuICAgICAgICBpZiBjYy5nYW1lLnN0YXRlLnBsYXllci5jZCA9PSAwICMgV2UganVzdCByYW4sIHlldCBkaWQgbm90aGluZ1xyXG4gICAgICAgICAgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nID0gZmFsc2VcclxuICAgICAgICAgIGNjLmxvZyBcIm5vdCBydW5uaW5nXCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU1vZGVcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgSW50cm9Nb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJJbnRyb1wiKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMikpXHJcbiAgICBAYWRkIEBzcHJpdGVcclxuXHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgICBjYy5sb2cgXCJpbnRybyBjbGljayAje3h9LCAje3l9XCJcclxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvTW9kZVxyXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdzcGxhc2hzY3JlZW4nOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgJ3RpbGVzMCc6ICdyZXMvdGlsZXMwLnBuZydcclxuICAncGxheWVyJzogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxuY29jb3NQcmVsb2FkTGlzdCA9ICh7c3JjOiB2fSBmb3IgaywgdiBvZiByZXNvdXJjZXMpXHJcbnJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0ID0gY29jb3NQcmVsb2FkTGlzdFxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc291cmNlc1xyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xyXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXHJcblxyXG5TSEFQRVMgPSBbXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uI1xyXG4gICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICAgICAjIyMjXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgIyMjIyMuLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG5dXHJcblxyXG5FTVBUWSA9IDBcclxuV0FMTCA9IDFcclxuRE9PUiA9IDJcclxuRklSU1RfUk9PTV9JRCA9IDVcclxuXHJcbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxyXG4gIHN3aXRjaFxyXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXHJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcclxuICAgIHdoZW4gdiA+PSBGSVJTVF9ST09NX0lEIHRoZW4gcmV0dXJuIHAuY29sb3IgMCwgMCwgNSArIE1hdGgubWluKDI0MCwgMTUgKyAodiAqIDIpKVxyXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcclxuXHJcbmNsYXNzIFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxyXG5cclxuICB3OiAtPiBAciAtIEBsXHJcbiAgaDogLT4gQGIgLSBAdFxyXG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXHJcbiAgYXNwZWN0OiAtPlxyXG4gICAgaWYgQGgoKSA+IDBcclxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIHNxdWFyZW5lc3M6IC0+XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXHJcblxyXG4gIGNlbnRlcjogLT5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcclxuICAgICAgeTogTWF0aC5mbG9vcigoQGIgKyBAdCkgLyAyKVxyXG4gICAgfVxyXG5cclxuICBjbG9uZTogLT5cclxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcclxuXHJcbiAgZXhwYW5kOiAocikgLT5cclxuICAgIGlmIEBhcmVhKClcclxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcclxuICAgICAgQHQgPSByLnQgaWYgQHQgPiByLnRcclxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcclxuICAgIGVsc2VcclxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXHJcbiAgICAgIEBsID0gci5sXHJcbiAgICAgIEB0ID0gci50XHJcbiAgICAgIEByID0gci5yXHJcbiAgICAgIEBiID0gci5iXHJcblxyXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcclxuXHJcbmNsYXNzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID0gRU1QVFlcclxuXHJcbiAgICBAZ2VuZXJhdGVTaGFwZSgpXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAc2V0KGksIDAsIFdBTEwpXHJcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIEBzZXQoMCwgaiwgV0FMTClcclxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxyXG5cclxuICByZWN0OiAoeCwgeSkgLT5cclxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0gPSB2XHJcblxyXG4gIGdldDogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgcmV0dXJuIHYgaWYgdiAhPSBFTVBUWVxyXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXHJcblxyXG4gIHBsYWNlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxyXG5cclxuICBmaXRzOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBtdiA9IG1hcC5nZXQoeCArIGksIHkgKyBqKVxyXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGRvb3JFbGlnaWJsZTogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXHJcbiAgICByb29tc1NlZW4gPSB7fVxyXG4gICAgdmFsdWVzID0gW1xyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogKyAxKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXHJcbiAgICBdXHJcbiAgICBmb3IgdiBpbiB2YWx1ZXNcclxuICAgICAgaWYgdlxyXG4gICAgICAgIGlmIHYgPT0gMVxyXG4gICAgICAgICAgd2FsbE5laWdoYm9ycysrXHJcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcclxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcclxuICAgIHJvb21zID0gT2JqZWN0LmtleXMocm9vbXNTZWVuKS5zb3J0IChhLCBiKSAtPiBhLWJcclxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxyXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXHJcbiAgICBpZiAod2FsbE5laWdoYm9ycyA9PSAyKSBhbmQgKHJvb21Db3VudCA9PSAyKSBhbmQgKEByb29taWQgaW4gcm9vbXMpXHJcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcclxuICAgICAgICByZXR1cm4gcm9vbXNcclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXHJcbiAgICAgICAgaWYgcm9vbXNbMF0gIT0gLTEgYW5kIEByb29taWQgaW4gcm9vbXNcclxuICAgICAgICAgIHJldHVybiBbaSwgal1cclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXHJcbiAgICBiYm94VGVtcC5leHBhbmQgQHJlY3QoeCwgeSlcclxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cclxuXHJcbiAgZmluZEJlc3RTcG90OiAobWFwKSAtPlxyXG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxyXG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcclxuICAgIG1pblggPSAtMVxyXG4gICAgbWluWSA9IC0xXHJcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxyXG4gICAgc2VhcmNoTCA9IG1hcC5iYm94LmwgLSBAd2lkdGhcclxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXHJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcclxuICAgIHNlYXJjaEIgPSBtYXAuYmJveC5iXHJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cclxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXHJcbiAgICAgICAgaWYgQGZpdHMobWFwLCBpLCBqKVxyXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXHJcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IEBkb29yTG9jYXRpb24gbWFwLCBpLCBqXHJcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXHJcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtaW5BcmVhID0gYXJlYVxyXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXHJcbiAgICAgICAgICAgICAgbWluWCA9IGlcclxuICAgICAgICAgICAgICBtaW5ZID0galxyXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXHJcblxyXG5jbGFzcyBTaGFwZVJvb21UZW1wbGF0ZSBleHRlbmRzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cclxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXHJcbiAgICB3ID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcclxuICAgIEB3aWR0aCA9IHdcclxuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXHJcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxyXG4gICAgaSA9IDBcclxuICAgIGogPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxyXG4gICAgICAgIHYgPSBzd2l0Y2ggY1xyXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXHJcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcclxuICAgICAgICAgIGVsc2UgMFxyXG4gICAgICAgIGlmIHZcclxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcclxuICAgICAgICBpKytcclxuICAgICAgaisrXHJcbiAgICAgIGkgPSAwXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJyb29tIGNyZWF0ZWQgI3tAcmVjdH1cIlxyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEBzZWVkKSAtPlxyXG4gICAgQHJhbmRSZXNldCgpXHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPVxyXG4gICAgICAgICAgdHlwZTogRU1QVFlcclxuICAgICAgICAgIHg6IGlcclxuICAgICAgICAgIHk6IGpcclxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxyXG4gICAgQHJvb21zID0gW11cclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XHJcblxyXG4gIGdldDogKGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgcmV0dXJuIEBncmlkW2ldW2pdLnR5cGVcclxuICAgIHJldHVybiAwXHJcblxyXG4gIGFkZFJvb206IChyb29tVGVtcGxhdGUsIHgsIHkpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxyXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcclxuICAgIHIgPSByb29tVGVtcGxhdGUucmVjdCh4LCB5KVxyXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxyXG4gICAgQGJib3guZXhwYW5kKHIpXHJcbiAgICAjIGNvbnNvbGUubG9nIFwibmV3IG1hcCBiYm94ICN7QGJib3h9XCJcclxuXHJcbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxyXG4gICAgciA9IEByYW5kKDEwMClcclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDEwIDwgciA8IDIwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNSArIEByYW5kKDEwKSwgMywgcm9vbWlkICAgICAgICAgICAgICAgICAgIyBob3Jpem9udGFsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xyXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cclxuXHJcbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxyXG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcclxuICAgIGlmIEByb29tcy5sZW5ndGggPT0gMFxyXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXHJcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIGVsc2VcclxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXHJcbiAgICAgIGlmIHggPCAwXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBnZW5lcmF0ZVJvb21zOiAoY291bnQpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxyXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxyXG5cclxuICAgICAgYWRkZWQgPSBmYWxzZVxyXG4gICAgICB3aGlsZSBub3QgYWRkZWRcclxuICAgICAgICBhZGRlZCA9IEBnZW5lcmF0ZVJvb20gcm9vbWlkXHJcblxyXG5nZW5lcmF0ZSA9IC0+XHJcbiAgbWFwID0gbmV3IE1hcCA4MCwgODAsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IChzY29yZUZ1bmN0aW9uKSAtPlxyXG4gICAgQGNvbnRlbnQgPSBbXVxyXG4gICAgQHNjb3JlRnVuY3Rpb24gPSBzY29yZUZ1bmN0aW9uXHJcblxyXG4gIHB1c2g6IChlbGVtZW50KSAtPlxyXG4gICAgIyBBZGQgdGhlIG5ldyBlbGVtZW50IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxyXG4gICAgQGNvbnRlbnQucHVzaChlbGVtZW50KVxyXG5cclxuICAgICMgQWxsb3cgaXQgdG8gc2luayBkb3duLlxyXG4gICAgQHNpbmtEb3duKEBjb250ZW50Lmxlbmd0aCAtIDEpXHJcblxyXG4gIHBvcDogLT5cclxuICAgICMgU3RvcmUgdGhlIGZpcnN0IGVsZW1lbnQgc28gd2UgY2FuIHJldHVybiBpdCBsYXRlci5cclxuICAgIHJlc3VsdCA9IEBjb250ZW50WzBdXHJcbiAgICAjIEdldCB0aGUgZWxlbWVudCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cclxuICAgIGVuZCA9IEBjb250ZW50LnBvcCgpXHJcbiAgICAjIElmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgbGVmdCwgcHV0IHRoZSBlbmQgZWxlbWVudCBhdCB0aGVcclxuICAgICMgc3RhcnQsIGFuZCBsZXQgaXQgYnViYmxlIHVwLlxyXG4gICAgaWYgQGNvbnRlbnQubGVuZ3RoID4gMFxyXG4gICAgICBAY29udGVudFswXSA9IGVuZFxyXG4gICAgICBAYnViYmxlVXAoMClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIHJlbW92ZTogKG5vZGUpIC0+XHJcbiAgICBpID0gQGNvbnRlbnQuaW5kZXhPZihub2RlKVxyXG5cclxuICAgICMgV2hlbiBpdCBpcyBmb3VuZCwgdGhlIHByb2Nlc3Mgc2VlbiBpbiAncG9wJyBpcyByZXBlYXRlZFxyXG4gICAgIyB0byBmaWxsIHVwIHRoZSBob2xlLlxyXG4gICAgZW5kID0gQGNvbnRlbnQucG9wKClcclxuXHJcbiAgICBpZiBpICE9IEBjb250ZW50Lmxlbmd0aCAtIDFcclxuICAgICAgQGNvbnRlbnRbaV0gPSBlbmRcclxuXHJcbiAgICBpZiBAc2NvcmVGdW5jdGlvbihlbmQpIDwgQHNjb3JlRnVuY3Rpb24obm9kZSlcclxuICAgICAgQHNpbmtEb3duKGkpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBidWJibGVVcChpKVxyXG5cclxuICBzaXplOiAtPlxyXG4gICAgcmV0dXJuIEBjb250ZW50Lmxlbmd0aFxyXG5cclxuICByZXNjb3JlRWxlbWVudDogKG5vZGUpIC0+XHJcbiAgICBAc2lua0Rvd24oQGNvbnRlbnQuaW5kZXhPZihub2RlKSlcclxuXHJcbiAgc2lua0Rvd246IChuKSAtPlxyXG4gICAgIyBGZXRjaCB0aGUgZWxlbWVudCB0aGF0IGhhcyB0byBiZSBzdW5rLlxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcblxyXG4gICAgIyBXaGVuIGF0IDAsIGFuIGVsZW1lbnQgY2FuIG5vdCBzaW5rIGFueSBmdXJ0aGVyLlxyXG4gICAgd2hpbGUgKG4gPiAwKVxyXG4gICAgICAjIENvbXB1dGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaW5kZXgsIGFuZCBmZXRjaCBpdC5cclxuICAgICAgcGFyZW50TiA9ICgobiArIDEpID4+IDEpIC0gMVxyXG4gICAgICBwYXJlbnQgPSBAY29udGVudFtwYXJlbnROXVxyXG4gICAgICAjIFN3YXAgdGhlIGVsZW1lbnRzIGlmIHRoZSBwYXJlbnQgaXMgZ3JlYXRlci5cclxuICAgICAgaWYgQHNjb3JlRnVuY3Rpb24oZWxlbWVudCkgPCBAc2NvcmVGdW5jdGlvbihwYXJlbnQpXHJcbiAgICAgICAgQGNvbnRlbnRbcGFyZW50Tl0gPSBlbGVtZW50XHJcbiAgICAgICAgQGNvbnRlbnRbbl0gPSBwYXJlbnRcclxuICAgICAgICAjIFVwZGF0ZSAnbicgdG8gY29udGludWUgYXQgdGhlIG5ldyBwb3NpdGlvbi5cclxuICAgICAgICBuID0gcGFyZW50TlxyXG5cclxuICAgICAgIyBGb3VuZCBhIHBhcmVudCB0aGF0IGlzIGxlc3MsIG5vIG5lZWQgdG8gc2luayBhbnkgZnVydGhlci5cclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gIGJ1YmJsZVVwOiAobikgLT5cclxuICAgICMgTG9vayB1cCB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIGl0cyBzY29yZS5cclxuICAgIGxlbmd0aCA9IEBjb250ZW50Lmxlbmd0aFxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcbiAgICBlbGVtU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihlbGVtZW50KVxyXG5cclxuICAgIHdoaWxlKHRydWUpXHJcbiAgICAgICMgQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXHJcbiAgICAgIGNoaWxkMk4gPSAobiArIDEpIDw8IDFcclxuICAgICAgY2hpbGQxTiA9IGNoaWxkMk4gLSAxXHJcbiAgICAgICMgVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsXHJcbiAgICAgICMgaWYgYW55LlxyXG4gICAgICBzd2FwID0gbnVsbFxyXG4gICAgICAjIElmIHRoZSBmaXJzdCBjaGlsZCBleGlzdHMgKGlzIGluc2lkZSB0aGUgYXJyYXkpLi4uXHJcbiAgICAgIGlmIGNoaWxkMU4gPCBsZW5ndGhcclxuICAgICAgICAjIExvb2sgaXQgdXAgYW5kIGNvbXB1dGUgaXRzIHNjb3JlLlxyXG4gICAgICAgIGNoaWxkMSA9IEBjb250ZW50W2NoaWxkMU5dXHJcbiAgICAgICAgY2hpbGQxU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihjaGlsZDEpXHJcblxyXG4gICAgICAgICMgSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXHJcbiAgICAgICAgaWYgY2hpbGQxU2NvcmUgPCBlbGVtU2NvcmVcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDFOXHJcblxyXG4gICAgICAjIERvIHRoZSBzYW1lIGNoZWNrcyBmb3IgdGhlIG90aGVyIGNoaWxkLlxyXG4gICAgICBpZiBjaGlsZDJOIDwgbGVuZ3RoXHJcbiAgICAgICAgY2hpbGQyID0gQGNvbnRlbnRbY2hpbGQyTl1cclxuICAgICAgICBjaGlsZDJTY29yZSA9IEBzY29yZUZ1bmN0aW9uKGNoaWxkMilcclxuICAgICAgICBpZiBjaGlsZDJTY29yZSA8IChzd2FwID09IG51bGwgPyBlbGVtU2NvcmUgOiBjaGlsZDFTY29yZSlcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOXHJcblxyXG4gICAgICAjIElmIHRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIG1vdmVkLCBzd2FwIGl0LCBhbmQgY29udGludWUuXHJcbiAgICAgIGlmIHN3YXAgIT0gbnVsbFxyXG4gICAgICAgIEBjb250ZW50W25dID0gQGNvbnRlbnRbc3dhcF1cclxuICAgICAgICBAY29udGVudFtzd2FwXSA9IGVsZW1lbnRcclxuICAgICAgICBuID0gc3dhcFxyXG5cclxuICAgICAgIyBPdGhlcndpc2UsIHdlIGFyZSBkb25lLlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbmNsYXNzIEFTdGFyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZiA9IDBcclxuICAgICAgICBub2RlLmcgPSAwXHJcbiAgICAgICAgbm9kZS5oID0gMFxyXG4gICAgICAgIG5vZGUuY29zdCA9IG5vZGUudHlwZVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5jbG9zZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBoZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBCaW5hcnlIZWFwIChub2RlKSAtPlxyXG4gICAgICByZXR1cm4gbm9kZS5mXHJcblxyXG4gIHNlYXJjaDogKHN0YXJ0LCBlbmQpIC0+XHJcbiAgICBncmlkID0gQGZsb29yLmdyaWRcclxuICAgIGhldXJpc3RpYyA9IEBtYW5oYXR0YW5cclxuXHJcbiAgICBvcGVuSGVhcCA9IEBoZWFwKClcclxuICAgIG9wZW5IZWFwLnB1c2goc3RhcnQpXHJcblxyXG4gICAgd2hpbGUgb3BlbkhlYXAuc2l6ZSgpID4gMFxyXG4gICAgICAjIEdyYWIgdGhlIGxvd2VzdCBmKHgpIHRvIHByb2Nlc3MgbmV4dC4gIEhlYXAga2VlcHMgdGhpcyBzb3J0ZWQgZm9yIHVzLlxyXG4gICAgICBjdXJyZW50Tm9kZSA9IG9wZW5IZWFwLnBvcCgpXHJcblxyXG4gICAgICAjIEVuZCBjYXNlIC0tIHJlc3VsdCBoYXMgYmVlbiBmb3VuZCwgcmV0dXJuIHRoZSB0cmFjZWQgcGF0aC5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgY3VyciA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICB3aGlsZSBjdXJyLnBhcmVudFxyXG4gICAgICAgICAgcmV0LnB1c2goY3VycilcclxuICAgICAgICAgIGN1cnIgPSBjdXJyLnBhcmVudFxyXG5cclxuICAgICAgICByZXR1cm4gcmV0LnJldmVyc2UoKVxyXG5cclxuICAgICAgIyBOb3JtYWwgY2FzZSAtLSBtb3ZlIGN1cnJlbnROb2RlIGZyb20gb3BlbiB0byBjbG9zZWQsIHByb2Nlc3MgZWFjaCBvZiBpdHMgbmVpZ2hib3JzLlxyXG4gICAgICBjdXJyZW50Tm9kZS5jbG9zZWQgPSB0cnVlXHJcblxyXG4gICAgICAjIEZpbmQgYWxsIG5laWdoYm9ycyBmb3IgdGhlIGN1cnJlbnQgbm9kZS5cclxuICAgICAgbmVpZ2hib3JzID0gQG5laWdoYm9ycyhncmlkLCBjdXJyZW50Tm9kZSlcclxuXHJcbiAgICAgIGZvciBuZWlnaGJvciBpbiBuZWlnaGJvcnNcclxuICAgICAgICBpZiBuZWlnaGJvci5jbG9zZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIFRoZSBnIHNjb3JlIGlzIHRoZSBzaG9ydGVzdCBkaXN0YW5jZSBmcm9tIHN0YXJ0IHRvIGN1cnJlbnQgbm9kZS5cclxuICAgICAgICAjIFdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlIHBhdGggd2UgaGF2ZSBhcnJpdmVkIGF0IHRoaXMgbmVpZ2hib3IgaXMgdGhlIHNob3J0ZXN0IG9uZSB3ZSBoYXZlIHNlZW4geWV0LlxyXG4gICAgICAgIGdTY29yZSA9IGN1cnJlbnROb2RlLmcgKyBuZWlnaGJvci5jb3N0XHJcbiAgICAgICAgYmVlblZpc2l0ZWQgPSBuZWlnaGJvci52aXNpdGVkXHJcblxyXG4gICAgICAgIGlmIChub3QgYmVlblZpc2l0ZWQpIG9yIChnU2NvcmUgPCBuZWlnaGJvci5nKVxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLiAgVGFrZSBzY29yZSBmb3Igbm9kZSB0byBzZWUgaG93IGdvb2QgaXQgaXMuXHJcbiAgICAgICAgICBuZWlnaGJvci52aXNpdGVkID0gdHJ1ZVxyXG4gICAgICAgICAgbmVpZ2hib3IucGFyZW50ID0gY3VycmVudE5vZGVcclxuICAgICAgICAgIG5laWdoYm9yLmggPSBuZWlnaGJvci5oIG9yIGhldXJpc3RpYyhuZWlnaGJvci54LCBuZWlnaGJvci55LCBlbmQueCwgZW5kLnkpXHJcbiAgICAgICAgICBuZWlnaGJvci5nID0gZ1Njb3JlXHJcbiAgICAgICAgICBuZWlnaGJvci5mID0gbmVpZ2hib3IuZyArIG5laWdoYm9yLmhcclxuXHJcbiAgICAgICAgICBpZiBub3QgYmVlblZpc2l0ZWRcclxuICAgICAgICAgICAgIyBQdXNoaW5nIHRvIGhlYXAgd2lsbCBwdXQgaXQgaW4gcHJvcGVyIHBsYWNlIGJhc2VkIG9uIHRoZSAnZicgdmFsdWUuXHJcbiAgICAgICAgICAgIG9wZW5IZWFwLnB1c2gobmVpZ2hib3IpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICMgQWxyZWFkeSBzZWVuIHRoZSBub2RlLCBidXQgc2luY2UgaXQgaGFzIGJlZW4gcmVzY29yZWQgd2UgbmVlZCB0byByZW9yZGVyIGl0IGluIHRoZSBoZWFwXHJcbiAgICAgICAgICAgIG9wZW5IZWFwLnJlc2NvcmVFbGVtZW50KG5laWdoYm9yKVxyXG5cclxuICAgICMgTm8gcmVzdWx0IHdhcyBmb3VuZCAtIGVtcHR5IGFycmF5IHNpZ25pZmllcyBmYWlsdXJlIHRvIGZpbmQgcGF0aC5cclxuICAgIHJldHVybiBbXVxyXG5cclxuICBtYW5oYXR0YW46ICh4MCwgeTAsIHgxLCB5MSkgLT5cclxuICAgICMgU2VlIGxpc3Qgb2YgaGV1cmlzdGljczogaHR0cDovL3RoZW9yeS5zdGFuZm9yZC5lZHUvfmFtaXRwL0dhbWVQcm9ncmFtbWluZy9IZXVyaXN0aWNzLmh0bWxcclxuICAgIGQxID0gTWF0aC5hYnMgKHgxIC0geDApXHJcbiAgICBkMiA9IE1hdGguYWJzICh5MSAtIHkwKVxyXG4gICAgcmV0dXJuIGQxICsgZDJcclxuXHJcbiAgZGlzdFNxdWFyZWQ6ICh4MCwgeTAsIHgxLCB5MSkgLT5cclxuICAgIGR4ID0geDEgLSB4MFxyXG4gICAgZHkgPSB5MSAtIHkwXHJcbiAgICByZXR1cm4gKGR4ICogZHgpICsgKGR5ICogZHkpXHJcblxyXG4gIG5laWdoYm9yczogKGdyaWQsIG5vZGUpIC0+XHJcbiAgICByZXQgPSBbXVxyXG4gICAgeCA9IG5vZGUueFxyXG4gICAgeSA9IG5vZGUueVxyXG5cclxuICAgICMgU291dGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5LTFdKVxyXG5cclxuICAgICMgU291dGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5LTFdKVxyXG5cclxuICAgICMgTm9ydGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5KzFdKVxyXG5cclxuICAgICMgTm9ydGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5KzFdKVxyXG5cclxuICAgICMgV2VzdFxyXG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ldKVxyXG5cclxuICAgICMgRWFzdFxyXG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ldKVxyXG5cclxuICAgICMgU291dGhcclxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beS0xXVxyXG4gICAgICByZXQucHVzaChncmlkW3hdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beSsxXSlcclxuXHJcbiAgICByZXR1cm4gcmV0XHJcblxyXG5jbGFzcyBQYXRoZmluZGVyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IsIEBmbGFncykgLT5cclxuXHJcbiAgY2FsYzogKHN0YXJ0WCwgc3RhcnRZLCBkZXN0WCwgZGVzdFkpIC0+XHJcbiAgICBhc3RhciA9IG5ldyBBU3RhciBAZmxvb3JcclxuICAgIHJldHVybiBhc3Rhci5zZWFyY2goQGZsb29yLmdyaWRbc3RhcnRYXVtzdGFydFldLCBAZmxvb3IuZ3JpZFtkZXN0WF1bZGVzdFldKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXRoZmluZGVyXHJcbiJdfQ==
;