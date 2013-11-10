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
    this.cd = 0;
    this.interpFrames = [];
    this.path = [];
  }

  Brain.prototype.move = function(gx, gy, frames) {
    var animFrame, dx, dy, f, i, _i, _len;
    this.interpFrames = [];
    dx = (this.x - gx) * cc.unitSize;
    dy = (this.y - gy) * cc.unitSize;
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
    s.setAnchorPoint(cc.p(0, 0));
    this.updateSprite(s);
    return s;
  };

  Brain.prototype.updateSprite = function(sprite) {
    var animFrame, frame, x, y;
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
    return sprite.setPosition(cc.p(x, y));
  };

  Brain.prototype.think = function(dt, sprite) {
    var step;
    if (this.interpFrames.length === 0) {
      if (this.path.length > 0) {
        step = this.path.splice(0, 1)[0];
        this.move(step.x, step.y, [2, 3, 4]);
      }
    }
    return this.updateSprite(sprite);
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

  Player.prototype.think = function(dt, sprite) {
    return Player.__super__.think.call(this, dt, sprite);
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
  frameRate: 30,
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
    return cc.game.state.player.act(gridX, gridY);
  };

  GameMode.prototype.update = function(dt) {
    return cc.game.state.player.think(dt, this.gfx.player.sprite);
  };

  return GameMode;

})(Mode);

module.exports = GameMode;


},{"base/mode":"mhMvP9","config":"tWG/YV","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/floorgen":"4WaFsS","world/pathfinder":"2ZcY+C"}],"mode/intro":[function(require,module,exports){
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


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"NN+gjI":[function(require,module,exports){
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
},{}],"world/pathfinder":[function(require,module,exports){
module.exports=require('2ZcY+C');
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


},{"world/floorgen":"4WaFsS"}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1QixpQkFBdkI7O0FBRUEsQ0FGQSxDQUVlLENBQUYsRUFBUSxDQUFSLElBQWI7Q0FBNkIsQ0FDM0IsQ0FBTSxDQUFOLEtBQVE7Q0FDTixFQURNLENBQUQ7Q0FDTCxHQUFBLEVBQUE7Q0FBQSxHQUNBLFdBQUE7Q0FEQSxHQUVBLFdBQUE7Q0FDQyxFQUFpQixDQUFqQixPQUFELEdBQUE7Q0FMeUIsRUFDckI7Q0FEcUIs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bCwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCJ2YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBzaWduaWZpY2FuY2UgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcblxyXG52YXIgb3ZlcmZsb3csIHN0YXJ0ZGVub207IC8vbnVtYmVyc1xyXG5cclxuXHJcbnZhciBvbGRSYW5kb20gPSBNYXRoLnJhbmRvbTtcclxuLy9cclxuLy8gc2VlZHJhbmRvbSgpXHJcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxyXG4vL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNlZWRyYW5kb20oc2VlZCwgb3ZlclJpZGVHbG9iYWwpIHtcclxuICBpZiAoIXNlZWQpIHtcclxuICAgIGlmIChvdmVyUmlkZUdsb2JhbCkge1xyXG4gICAgICBNYXRoLnJhbmRvbSA9IG9sZFJhbmRvbTtcclxuICAgIH1cclxuICAgIHJldHVybiBvbGRSYW5kb207XHJcbiAgfVxyXG4gIHZhciBrZXkgPSBbXTtcclxuICB2YXIgYXJjNDtcclxuXHJcbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXHJcbiAgc2VlZCA9IG1peGtleShmbGF0dGVuKHNlZWQsIDMpLCBrZXkpO1xyXG5cclxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cclxuICBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIGZ1bmN0aW9uIHJhbmRvbSgpIHsgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcclxuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyk7ICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxyXG4gICAgdmFyIGQgPSBzdGFydGRlbm9tOyAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cclxuICAgIHZhciB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxyXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XHJcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcclxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxyXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cclxuICAgIH1cclxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXHJcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xyXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIE1hdGggdW50aWxcclxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cclxuICB9XHJcbiAgcmFuZG9tLnNlZWQgPSBzZWVkO1xyXG4gIGlmIChvdmVyUmlkZUdsb2JhbCkge1xyXG4gICAgTWF0aFsncmFuZG9tJ10gPSByYW5kb207XHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm4gdGhlIHNlZWQgdGhhdCB3YXMgdXNlZFxyXG4gIHJldHVybiByYW5kb207XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBUkM0XHJcbi8vXHJcbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2ZcclxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXHJcbi8vXHJcbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXHJcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcclxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxyXG4vL1xyXG4vKiogQGNvbnN0cnVjdG9yICovXHJcbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XHJcbiAgdmFyIHQsIHUsIG1lID0gdGhpcywga2V5bGVuID0ga2V5Lmxlbmd0aDtcclxuICB2YXIgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IG1lLm0gPSAwO1xyXG4gIG1lLlMgPSBbXTtcclxuICBtZS5jID0gW107XHJcblxyXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXHJcbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxyXG5cclxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxyXG4gIHdoaWxlIChpIDwgd2lkdGgpIHsgbWUuU1tpXSA9IGkrKzsgfVxyXG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XHJcbiAgICB0ID0gbWUuU1tpXTtcclxuICAgIGogPSBsb3diaXRzKGogKyB0ICsga2V5W2kgJSBrZXlsZW5dKTtcclxuICAgIHUgPSBtZS5TW2pdO1xyXG4gICAgbWUuU1tpXSA9IHU7XHJcbiAgICBtZS5TW2pdID0gdDtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cclxuICBtZS5nID0gZnVuY3Rpb24gZ2V0bmV4dChjb3VudCkge1xyXG4gICAgdmFyIHMgPSBtZS5TO1xyXG4gICAgdmFyIGkgPSBsb3diaXRzKG1lLmkgKyAxKTsgdmFyIHQgPSBzW2ldO1xyXG4gICAgdmFyIGogPSBsb3diaXRzKG1lLmogKyB0KTsgdmFyIHUgPSBzW2pdO1xyXG4gICAgc1tpXSA9IHU7XHJcbiAgICBzW2pdID0gdDtcclxuICAgIHZhciByID0gc1tsb3diaXRzKHQgKyB1KV07XHJcbiAgICB3aGlsZSAoLS1jb3VudCkge1xyXG4gICAgICBpID0gbG93Yml0cyhpICsgMSk7IHQgPSBzW2ldO1xyXG4gICAgICBqID0gbG93Yml0cyhqICsgdCk7IHUgPSBzW2pdO1xyXG4gICAgICBzW2ldID0gdTtcclxuICAgICAgc1tqXSA9IHQ7XHJcbiAgICAgIHIgPSByICogd2lkdGggKyBzW2xvd2JpdHModCArIHUpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpO1xyXG4gICAgbWUuaiA9IGo7XHJcbiAgICByZXR1cm4gcjtcclxuICB9O1xyXG4gIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLlxyXG4gIC8vIFNlZSBodHRwOi8vd3d3LnJzYS5jb20vcnNhbGFicy9ub2RlLmFzcD9pZD0yMDA5XHJcbiAgbWUuZyh3aWR0aCk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGZsYXR0ZW4oKVxyXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge09iamVjdD19IHJlc3VsdCBcclxuICAqIEBwYXJhbSB7c3RyaW5nPX0gcHJvcFxyXG4gICogQHBhcmFtIHtzdHJpbmc9fSB0eXAgKi9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoLCByZXN1bHQsIHByb3AsIHR5cCkge1xyXG4gIHJlc3VsdCA9IFtdO1xyXG4gIHR5cCA9IHR5cGVvZihvYmopO1xyXG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgaWYgKHByb3AuaW5kZXhPZignUycpIDwgNSkgeyAgICAvLyBBdm9pZCBGRjMgYnVnIChsb2NhbC9zZXNzaW9uU3RvcmFnZSlcclxuICAgICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogb2JqICsgKHR5cCAhPSAnc3RyaW5nJyA/ICdcXDAnIDogJycpKTtcclxufVxyXG5cclxuLy9cclxuLy8gbWl4a2V5KClcclxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxyXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cclxuLy9cclxuLyoqIEBwYXJhbSB7bnVtYmVyPX0gc21lYXIgXHJcbiAgKiBAcGFyYW0ge251bWJlcj19IGogKi9cclxuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSwgc21lYXIsIGopIHtcclxuICBzZWVkICs9ICcnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgdGhlIHNlZWQgaXMgYSBzdHJpbmdcclxuICBzbWVhciA9IDA7XHJcbiAgZm9yIChqID0gMDsgaiA8IHNlZWQubGVuZ3RoOyBqKyspIHtcclxuICAgIGtleVtsb3diaXRzKGopXSA9XHJcbiAgICAgIGxvd2JpdHMoKHNtZWFyIF49IGtleVtsb3diaXRzKGopXSAqIDE5KSArIHNlZWQuY2hhckNvZGVBdChqKSk7XHJcbiAgfVxyXG4gIHNlZWQgPSAnJztcclxuICBmb3IgKGogaW4ga2V5KSB7IHNlZWQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlbal0pOyB9XHJcbiAgcmV0dXJuIHNlZWQ7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGxvd2JpdHMoKVxyXG4vLyBBIHF1aWNrIFwibiBtb2Qgd2lkdGhcIiBmb3Igd2lkdGggYSBwb3dlciBvZiAyLlxyXG4vL1xyXG5mdW5jdGlvbiBsb3diaXRzKG4pIHsgcmV0dXJuIG4gJiAod2lkdGggLSAxKTsgfVxyXG5cclxuLy9cclxuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxyXG4vL1xyXG5zdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyk7XHJcbnNpZ25pZmljYW5jZSA9IE1hdGgucG93KDIsIHNpZ25pZmljYW5jZSk7XHJcbm92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMjtcclxuIiwiIyBob3cgbWFueSBwaXhlbHMgY2FuIHlvdSBkcmFnIGJlZm9yZSBpdCBpcyBhY3R1YWxseSBjb25zaWRlcmVkIGEgZHJhZ1xyXG5FTkdBR0VfRFJBR19ESVNUQU5DRSA9IDMwXHJcblxyXG5JbnB1dExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcclxuICAgIEBzZXRNb3VzZUVuYWJsZWQodHJ1ZSlcclxuICAgIEB0cmFja2VkVG91Y2hlcyA9IFtdXHJcblxyXG4gIGNhbGNEaXN0YW5jZTogKHgxLCB5MSwgeDIsIHkyKSAtPlxyXG4gICAgZHggPSB4MiAtIHgxXHJcbiAgICBkeSA9IHkyIC0geTFcclxuICAgIHJldHVybiBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxuXHJcbiAgc2V0RHJhZ1BvaW50OiAtPlxyXG4gICAgQGRyYWdYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgIEBkcmFnWSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gIGNhbGNQaW5jaEFuY2hvcjogLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBAcGluY2hYID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnggKyBAdHJhY2tlZFRvdWNoZXNbMV0ueCkgLyAyKVxyXG4gICAgICBAcGluY2hZID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnkgKyBAdHJhY2tlZFRvdWNoZXNbMV0ueSkgLyAyKVxyXG4gICAgICAjIGNjLmxvZyBcInBpbmNoIGFuY2hvciBzZXQgYXQgI3tAcGluY2hYfSwgI3tAcGluY2hZfVwiXHJcblxyXG4gIGFkZFRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBmb3IgdCBpbiBAdHJhY2tlZFRvdWNoZXNcclxuICAgICAgaWYgdC5pZCA9PSBpZFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgQHRyYWNrZWRUb3VjaGVzLnB1c2gge1xyXG4gICAgICBpZDogaWRcclxuICAgICAgeDogeFxyXG4gICAgICB5OiB5XHJcbiAgICB9XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDJcclxuICAgICAgIyBXZSBqdXN0IGFkZGVkIGEgc2Vjb25kIHRvdWNoIHNwb3QuIENhbGN1bGF0ZSB0aGUgYW5jaG9yIGZvciBwaW5jaGluZyBub3dcclxuICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAjY2MubG9nIFwiYWRkaW5nIHRvdWNoICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICByZW1vdmVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICAgIGlmIGluZGV4IDwgMlxyXG4gICAgICAgICMgV2UganVzdCBmb3Jnb3Qgb25lIG9mIG91ciBwaW5jaCB0b3VjaGVzLiBQaWNrIGEgbmV3IGFuY2hvciBzcG90LlxyXG4gICAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgICAjY2MubG9nIFwiZm9yZ2V0dGluZyBpZCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgdXBkYXRlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueCA9IHhcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS55ID0geVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEBkcmFnZ2luZyA9IGZhbHNlXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAYWRkVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPiAxXHJcbiAgICAgICMgVGhleSdyZSBwaW5jaGluZywgZG9uJ3QgZXZlbiBib3RoZXIgdG8gZW1pdCBhIGNsaWNrXHJcbiAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuXHJcbiAgb25Ub3VjaGVzTW92ZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIHByZXZEaXN0YW5jZSA9IDBcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBwcmV2RGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIHByZXZYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgICAgcHJldlkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEB1cGRhdGVUb3VjaCh0LmdldElkKCksIHBvcy54LCBwb3MueSlcclxuXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgIyBzaW5nbGUgdG91Y2gsIGNvbnNpZGVyIGRyYWdnaW5nXHJcbiAgICAgIGRyYWdEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UgQGRyYWdYLCBAZHJhZ1ksIEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG4gICAgICBpZiBAZHJhZ2dpbmcgb3IgKGRyYWdEaXN0YW5jZSA+IEVOR0FHRV9EUkFHX0RJU1RBTkNFKVxyXG4gICAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuICAgICAgICBpZiBkcmFnRGlzdGFuY2UgPiAwLjVcclxuICAgICAgICAgIGR4ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnggLSBAZHJhZ1hcclxuICAgICAgICAgIGR5ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnkgLSBAZHJhZ1lcclxuICAgICAgICAgICNjYy5sb2cgXCJzaW5nbGUgZHJhZzogI3tkeH0sICN7ZHl9XCJcclxuICAgICAgICAgIEBtb2RlLm9uRHJhZyhkeCwgZHkpXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcblxyXG4gICAgZWxzZSBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgIyBhdCBsZWFzdCB0d28gZmluZ2VycyBwcmVzZW50LCBjaGVjayBmb3IgcGluY2gvem9vbVxyXG4gICAgICBjdXJyRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgICBkZWx0YURpc3RhbmNlID0gY3VyckRpc3RhbmNlIC0gcHJldkRpc3RhbmNlXHJcbiAgICAgIGlmIGRlbHRhRGlzdGFuY2UgIT0gMFxyXG4gICAgICAgICNjYy5sb2cgXCJkaXN0YW5jZSBkcmFnZ2VkIGFwYXJ0OiAje2RlbHRhRGlzdGFuY2V9IFthbmNob3I6ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1dXCJcclxuICAgICAgICBAbW9kZS5vblpvb20oQHBpbmNoWCwgQHBpbmNoWSwgZGVsdGFEaXN0YW5jZSlcclxuXHJcbiAgb25Ub3VjaGVzRW5kZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMSBhbmQgbm90IEBkcmFnZ2luZ1xyXG4gICAgICBwb3MgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKClcclxuICAgICAgI2NjLmxvZyBcImNsaWNrIGF0ICN7cG9zLnh9LCAje3Bvcy55fVwiXHJcbiAgICAgIEBtb2RlLm9uQ2xpY2socG9zLngsIHBvcy55KVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHJlbW92ZVRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcblxyXG4gIG9uU2Nyb2xsV2hlZWw6IChldikgLT5cclxuICAgIHBvcyA9IGV2LmdldExvY2F0aW9uKClcclxuICAgIEBtb2RlLm9uWm9vbShwb3MueCwgcG9zLnksIGV2LmdldFdoZWVsRGVsdGEoKSlcclxufVxyXG5cclxuR2Z4TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG59XHJcblxyXG5Nb2RlU2NlbmUgPSBjYy5TY2VuZS5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG5cclxuICAgIEBpbnB1dCA9IG5ldyBJbnB1dExheWVyKClcclxuICAgIEBpbnB1dC5pbml0KEBtb2RlKVxyXG4gICAgQGFkZENoaWxkKEBpbnB1dClcclxuXHJcbiAgICBAZ2Z4ID0gbmV3IEdmeExheWVyKClcclxuICAgIEBnZnguaW5pdCgpXHJcbiAgICBAYWRkQ2hpbGQoQGdmeClcclxuXHJcbiAgb25FbnRlcjogLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQG1vZGUub25BY3RpdmF0ZSgpXHJcbn1cclxuXHJcbmNsYXNzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogKEBuYW1lKSAtPlxyXG4gICAgQHNjZW5lID0gbmV3IE1vZGVTY2VuZSgpXHJcbiAgICBAc2NlbmUuaW5pdCh0aGlzKVxyXG4gICAgQHNjZW5lLnJldGFpbigpXHJcblxyXG4gIGFjdGl2YXRlOiAtPlxyXG4gICAgY2MubG9nIFwiYWN0aXZhdGluZyBtb2RlICN7QG5hbWV9XCJcclxuICAgIGlmIGNjLnNhd09uZVNjZW5lP1xyXG4gICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnBvcFNjZW5lKClcclxuICAgIGVsc2VcclxuICAgICAgY2Muc2F3T25lU2NlbmUgPSB0cnVlXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnB1c2hTY2VuZShAc2NlbmUpXHJcblxyXG4gIGFkZDogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZnguYWRkQ2hpbGQob2JqKVxyXG5cclxuICByZW1vdmU6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LnJlbW92ZUNoaWxkKG9iailcclxuXHJcbiAgIyB0byBiZSBvdmVycmlkZGVuIGJ5IGRlcml2ZWQgTW9kZXNcclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gIG9uWm9vbTogKHgsIHksIGRlbHRhKSAtPlxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZVxyXG4iLCJpZiBkb2N1bWVudD9cclxuICByZXF1aXJlICdib290L21haW53ZWInXHJcbmVsc2VcclxuICByZXF1aXJlICdib290L21haW5kcm9pZCdcclxuIiwicmVxdWlyZSAnanNiLmpzJ1xyXG5yZXF1aXJlICdtYWluJ1xyXG5cclxubnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKClcclxubnVsbFNjZW5lLmluaXQoKVxyXG5jYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJ1bldpdGhTY2VuZShudWxsU2NlbmUpXHJcbmNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxyXG4iLCJjb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcblxyXG5jb2NvczJkQXBwID0gY2MuQXBwbGljYXRpb24uZXh0ZW5kIHtcclxuICBjb25maWc6IGNvbmZpZ1xyXG4gIGN0b3I6IChzY2VuZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgY2MuQ09DT1MyRF9ERUJVRyA9IEBjb25maWdbJ0NPQ09TMkRfREVCVUcnXVxyXG4gICAgY2MuaW5pdERlYnVnU2V0dGluZygpXHJcbiAgICBjYy5zZXR1cChAY29uZmlnWyd0YWcnXSlcclxuICAgIGNjLkFwcENvbnRyb2xsZXIuc2hhcmVBcHBDb250cm9sbGVyKCkuZGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnMoKVxyXG5cclxuICBhcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogLT5cclxuICAgICAgaWYgY2MuUmVuZGVyRG9lc25vdFN1cHBvcnQoKVxyXG4gICAgICAgICAgIyBzaG93IEluZm9ybWF0aW9uIHRvIHVzZXJcclxuICAgICAgICAgIGFsZXJ0IFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIlxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICAjIGluaXRpYWxpemUgZGlyZWN0b3JcclxuICAgICAgZGlyZWN0b3IgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpXHJcblxyXG4gICAgICBjYy5FR0xWaWV3LmdldEluc3RhbmNlKCkuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoMTI4MCwgNzIwLCBjYy5SRVNPTFVUSU9OX1BPTElDWS5TSE9XX0FMTClcclxuXHJcbiAgICAgICMgdHVybiBvbiBkaXNwbGF5IEZQU1xyXG4gICAgICBkaXJlY3Rvci5zZXREaXNwbGF5U3RhdHMgQGNvbmZpZ1snc2hvd0ZQUyddXHJcblxyXG4gICAgICAjIHNldCBGUFMuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIDEuMC82MCBpZiB5b3UgZG9uJ3QgY2FsbCB0aGlzXHJcbiAgICAgIGRpcmVjdG9yLnNldEFuaW1hdGlvbkludGVydmFsIDEuMCAvIEBjb25maWdbJ2ZyYW1lUmF0ZSddXHJcblxyXG4gICAgICAjIGxvYWQgcmVzb3VyY2VzXHJcbiAgICAgIHJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuICAgICAgY2MuTG9hZGVyU2NlbmUucHJlbG9hZChyZXNvdXJjZXMuY29jb3NQcmVsb2FkTGlzdCwgLT5cclxuICAgICAgICByZXF1aXJlICdtYWluJ1xyXG4gICAgICAgIG51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpO1xyXG4gICAgICAgIG51bGxTY2VuZS5pbml0KClcclxuICAgICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJlcGxhY2VTY2VuZShudWxsU2NlbmUpXHJcbiMgICAgICAgIGNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxyXG4gICAgICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXHJcbiAgICAgIHRoaXMpXHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5teUFwcCA9IG5ldyBjb2NvczJkQXBwKClcclxuIiwiY2xhc3MgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKEB0aWxlcywgQGFuaW1GcmFtZSkgLT5cclxuICAgIEBjZCA9IDBcclxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxyXG4gICAgQHBhdGggPSBbXVxyXG5cclxuICBtb3ZlOiAoZ3gsIGd5LCBmcmFtZXMpIC0+XHJcbiAgICBAaW50ZXJwRnJhbWVzID0gW11cclxuICAgIGR4ID0gKEB4IC0gZ3gpICogY2MudW5pdFNpemVcclxuICAgIGR5ID0gKEB5IC0gZ3kpICogY2MudW5pdFNpemVcclxuICAgIGkgPSBmcmFtZXMubGVuZ3RoXHJcbiAgICBmb3IgZiBpbiBmcmFtZXNcclxuICAgICAgYW5pbUZyYW1lID0ge1xyXG4gICAgICAgIHg6IGR4ICogaSAvIGZyYW1lcy5sZW5ndGhcclxuICAgICAgICB5OiBkeSAqIGkgLyBmcmFtZXMubGVuZ3RoXHJcbiAgICAgICAgYW5pbUZyYW1lOiBmXHJcbiAgICAgIH1cclxuICAgICAgQGludGVycEZyYW1lcy5wdXNoIGFuaW1GcmFtZVxyXG4gICAgICBpLS1cclxuXHJcbiAgICBjYy5nYW1lLnNldFR1cm5GcmFtZXMoZnJhbWVzLmxlbmd0aClcclxuXHJcbiAgICAjIEltbWVkaWF0ZWx5IG1vdmUsIG9ubHkgcHJldGVuZCB0byBhbmltYXRlIHRoZXJlIG92ZXIgdGhlIG5leHQgZnJhbWVzLmxlbmd0aCBmcmFtZXNcclxuICAgIEB4ID0gZ3hcclxuICAgIEB5ID0gZ3lcclxuXHJcbiAgd2Fsa1BhdGg6IChAcGF0aCkgLT5cclxuXHJcbiAgY3JlYXRlU3ByaXRlOiAtPlxyXG4gICAgcyA9IGNjLlNwcml0ZS5jcmVhdGUgQHRpbGVzLnJlc291cmNlXHJcbiAgICBzLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAdXBkYXRlU3ByaXRlKHMpXHJcbiAgICByZXR1cm4gc1xyXG5cclxuICB1cGRhdGVTcHJpdGU6IChzcHJpdGUpIC0+XHJcbiAgICB4ID0gQHggKiBjYy51bml0U2l6ZVxyXG4gICAgeSA9IEB5ICogY2MudW5pdFNpemVcclxuICAgIGFuaW1GcmFtZSA9IEBhbmltRnJhbWVcclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoXHJcbiAgICAgIGZyYW1lID0gQGludGVycEZyYW1lcy5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgeCArPSBmcmFtZS54XHJcbiAgICAgIHkgKz0gZnJhbWUueVxyXG4gICAgICBhbmltRnJhbWUgPSBmcmFtZS5hbmltRnJhbWVcclxuICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdChAdGlsZXMucmVjdChhbmltRnJhbWUpKVxyXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXHJcblxyXG4gIHRoaW5rOiAoZHQsIHNwcml0ZSkgLT5cclxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoID09IDBcclxuICAgICAgaWYgQHBhdGgubGVuZ3RoID4gMFxyXG4gICAgICAgIHN0ZXAgPSBAcGF0aC5zcGxpY2UoMCwgMSlbMF1cclxuICAgICAgICAjIGNjLmxvZyBcInRha2luZyBzdGVwIHRvICN7c3RlcC54fSwgI3tzdGVwLnl9XCJcclxuICAgICAgICBAbW92ZShzdGVwLngsIHN0ZXAueSwgWzIsMyw0XSlcclxuICAgIEB1cGRhdGVTcHJpdGUoc3ByaXRlKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCcmFpblxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkJyYWluID0gcmVxdWlyZSAnYnJhaW4vYnJhaW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5UaWxlc2hlZXQgPSByZXF1aXJlICdnZngvdGlsZXNoZWV0J1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQnJhaW5cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAYW5pbUZyYW1lID0gMFxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIHRoaXNba10gPSB2XHJcbiAgICBzdXBlciBuZXcgVGlsZXNoZWV0KHJlc291cmNlcy5wbGF5ZXIsIDEyLCAxNCwgMTgpLCBAYW5pbUZyYW1lXHJcblxyXG4gIHdhbGtQYXRoOiAoQHBhdGgpIC0+XHJcblxyXG4gIHRoaW5rOiAoZHQsIHNwcml0ZSkgLT5cclxuICAgIHN1cGVyKGR0LCBzcHJpdGUpXHJcblxyXG4gIGFjdDogKGd4LCBneSkgLT5cclxuICAgIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxyXG4gICAgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhAeCwgQHksIGd4LCBneSlcclxuICAgIEB3YWxrUGF0aChwYXRoKVxyXG4gICAgY2MubG9nIFwicGF0aCBpcyAje3BhdGgubGVuZ3RofSBsb25nXCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBzY2FsZTpcclxuICAgIG1pbjogMS41XHJcbiAgICBtYXg6IDguMFxyXG4gIENPQ09TMkRfREVCVUc6MiAjIDAgdG8gdHVybiBkZWJ1ZyBvZmYsIDEgZm9yIGJhc2ljIGRlYnVnLCBhbmQgMiBmb3IgZnVsbCBkZWJ1Z1xyXG4gIGJveDJkOmZhbHNlXHJcbiAgY2hpcG11bms6ZmFsc2VcclxuICBzaG93RlBTOnRydWVcclxuICBmcmFtZVJhdGU6MzBcclxuICBsb2FkRXh0ZW5zaW9uOmZhbHNlXHJcbiAgcmVuZGVyTW9kZTowXHJcbiAgdGFnOidnYW1lQ2FudmFzJ1xyXG4gIGFwcEZpbGVzOiBbXHJcbiAgICAnYnVuZGxlLmpzJ1xyXG4gIF1cclxuIiwiY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5MYXllclxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN0b3IoKVxyXG4gICAgQGluaXQoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIExheWVyOiBMYXllclxyXG4gIFNjZW5lOiBTY2VuZVxyXG4iLCJcclxuY2xhc3MgVGlsZXNoZWV0XHJcbiAgY29uc3RydWN0b3I6IChAcmVzb3VyY2UsIEB3aWR0aCwgQGhlaWdodCwgQHN0cmlkZSkgLT5cclxuXHJcbiAgcmVjdDogKHYpIC0+XHJcbiAgICB5ID0gTWF0aC5mbG9vcih2IC8gQHN0cmlkZSlcclxuICAgIHggPSB2ICUgQHN0cmlkZVxyXG4gICAgcmV0dXJuIGNjLnJlY3QoeCAqIEB3aWR0aCwgeSAqIEBoZWlnaHQsIEB3aWR0aCwgQGhlaWdodClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGlsZXNoZWV0XHJcbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuSW50cm9Nb2RlID0gcmVxdWlyZSAnbW9kZS9pbnRybydcclxuR2FtZU1vZGUgPSByZXF1aXJlICdtb2RlL2dhbWUnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblBsYXllciA9IHJlcXVpcmUgJ2JyYWluL3BsYXllcidcclxuXHJcbmNsYXNzIEdhbWVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEB0dXJuRnJhbWVzID0gMFxyXG4gICAgQG1vZGVzID1cclxuICAgICAgaW50cm86IG5ldyBJbnRyb01vZGUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZU1vZGUoKVxyXG5cclxuICBuZXdGbG9vcjogLT5cclxuICAgIGZsb29yZ2VuLmdlbmVyYXRlKClcclxuXHJcbiAgY3VycmVudEZsb29yOiAtPlxyXG4gICAgcmV0dXJuIEBzdGF0ZS5mbG9vcnNbQHN0YXRlLnBsYXllci5mbG9vcl1cclxuXHJcbiAgbmV3R2FtZTogLT5cclxuICAgIGNjLmxvZyBcIm5ld0dhbWVcIlxyXG4gICAgQHN0YXRlID0ge1xyXG4gICAgICBwbGF5ZXI6IG5ldyBQbGF5ZXIoe1xyXG4gICAgICAgIHg6IDQwXHJcbiAgICAgICAgeTogNDBcclxuICAgICAgICBmbG9vcjogMVxyXG4gICAgICB9KVxyXG4gICAgICBmbG9vcnM6IFtcclxuICAgICAgICB7fVxyXG4gICAgICAgIEBuZXdGbG9vcigpXHJcbiAgICAgIF1cclxuICAgIH1cclxuXHJcbiAgc2V0VHVybkZyYW1lczogKGNvdW50KSAtPlxyXG4gICAgaWYgQHR1cm5GcmFtZXMgPCBjb3VudFxyXG4gICAgICBAdHVybkZyYW1lcyA9IGNvdW50XHJcblxyXG5pZiBub3QgY2MuZ2FtZVxyXG4gIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gIGNjLnVuaXRTaXplID0gMTZcclxuICBjYy53aWR0aCA9IHNpemUud2lkdGhcclxuICBjYy5oZWlnaHQgPSBzaXplLmhlaWdodFxyXG4gIGNjLmdhbWUgPSBuZXcgR2FtZSgpXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbmNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QYXRoZmluZGVyID0gcmVxdWlyZSAnd29ybGQvcGF0aGZpbmRlcidcclxuVGlsZXNoZWV0ID0gcmVxdWlyZSAnZ2Z4L3RpbGVzaGVldCdcclxuXHJcbmNsYXNzIEdhbWVNb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJHYW1lXCIpXHJcblxyXG4gIHRpbGVGb3JHcmlkVmFsdWU6ICh2KSAtPlxyXG4gICAgc3dpdGNoXHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5XQUxMIHRoZW4gMTZcclxuICAgICAgd2hlbiB2ID09IGZsb29yZ2VuLkRPT1IgdGhlbiA1XHJcbiAgICAgIHdoZW4gdiA+PSBmbG9vcmdlbi5GSVJTVF9ST09NX0lEIHRoZW4gMThcclxuICAgICAgZWxzZSAwXHJcblxyXG4gIGdmeENsZWFyOiAtPlxyXG4gICAgaWYgQGdmeD9cclxuICAgICAgaWYgQGdmeC5mbG9vckxheWVyP1xyXG4gICAgICAgIEByZW1vdmUgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4ID1cclxuICAgICAgcGF0aFNwcml0ZXM6IFtdXHJcblxyXG4gIGdmeFJlbmRlckZsb29yOiAtPlxyXG4gICAgQGdmeC5mbG9vckxheWVyID0gbmV3IGNjLkxheWVyKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG5cclxuICAgIHRpbGVzID0gbmV3IFRpbGVzaGVldChyZXNvdXJjZXMudGlsZXMwLCAxNiwgMTYsIDE2KVxyXG4gICAgZmxvb3IgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpXHJcbiAgICBmb3IgaiBpbiBbMC4uLmZsb29yLmhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5mbG9vci53aWR0aF1cclxuICAgICAgICB2ID0gZmxvb3IuZ2V0KGksIGopXHJcbiAgICAgICAgaWYgdiAhPSAwXHJcbiAgICAgICAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHRpbGVzLnJlc291cmNlXHJcbiAgICAgICAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgICAgICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdCh0aWxlcy5yZWN0KEB0aWxlRm9yR3JpZFZhbHVlKHYpKSlcclxuICAgICAgICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKGkgKiBjYy51bml0U2l6ZSwgaiAqIGNjLnVuaXRTaXplKSlcclxuICAgICAgICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBzcHJpdGUsIC0xXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKGNvbmZpZy5zY2FsZS5taW4pXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoMS4wKVxyXG4gICAgQGFkZCBAZ2Z4LmZsb29yTGF5ZXJcclxuICAgIEBnZnhDZW50ZXJNYXAoKVxyXG5cclxuICBnZnhQbGFjZU1hcDogKG1hcFgsIG1hcFksIHNjcmVlblgsIHNjcmVlblkpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICB4ID0gc2NyZWVuWCAtIChtYXBYICogc2NhbGUpXHJcbiAgICB5ID0gc2NyZWVuWSAtIChtYXBZICogc2NhbGUpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24oeCwgeSlcclxuXHJcbiAgZ2Z4Q2VudGVyTWFwOiAtPlxyXG4gICAgY2VudGVyID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKS5iYm94LmNlbnRlcigpXHJcbiAgICBAZ2Z4UGxhY2VNYXAoY2VudGVyLnggKiBjYy51bml0U2l6ZSwgY2VudGVyLnkgKiBjYy51bml0U2l6ZSwgY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKVxyXG5cclxuICBnZnhTY3JlZW5Ub01hcENvb3JkczogKHgsIHkpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0UG9zaXRpb24oKVxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgeDogKHggLSBwb3MueCkgLyBzY2FsZVxyXG4gICAgICB5OiAoeSAtIHBvcy55KSAvIHNjYWxlXHJcbiAgICB9XHJcblxyXG4gIGdmeFJlbmRlclBsYXllcjogLT5cclxuICAgIEBnZngucGxheWVyID0ge31cclxuICAgIEBnZngucGxheWVyLnNwcml0ZSA9IGNjLmdhbWUuc3RhdGUucGxheWVyLmNyZWF0ZVNwcml0ZSgpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5wbGF5ZXIuc3ByaXRlLCAwXHJcblxyXG4gICMgZ2Z4VXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICMgICBwbGF5ZXIgPSBjYy5nYW1lLnN0YXRlLnBsYXllclxyXG4gICMgICB4ID0gcGxheWVyLnggKiBjYy51bml0U2l6ZVxyXG4gICMgICB5ID0gcGxheWVyLnkgKiBjYy51bml0U2l6ZVxyXG4gICMgICBAZ2Z4LnBsYXllci5zcHJpdGUuc2V0UG9zaXRpb24oY2MucCh4LCB5KSlcclxuICAjICAgaWYgcGxheWVyLnByZXZBbmltRnJhbWUgIT0gcGxheWVyLmFuaW1GcmFtZVxyXG4gICMgICAgIEBnZngucGxheWVyLnNwcml0ZS5zZXRUZXh0dXJlUmVjdChAZ2Z4LnBsYXllci50aWxlcy5yZWN0KHBsYXllci5hbmltRnJhbWUpKVxyXG4gICMgICAgIHBsYXllci5wcmV2QW5pbUZyYW1lID0gcGxheWVyLmFuaW1GcmFtZVxyXG5cclxuICBnZnhBZGp1c3RNYXBTY2FsZTogKGRlbHRhKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgc2NhbGUgKz0gZGVsdGFcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1heCBpZiBzY2FsZSA+IGNvbmZpZy5zY2FsZS5tYXhcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1pbiBpZiBzY2FsZSA8IGNvbmZpZy5zY2FsZS5taW5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShzY2FsZSlcclxuXHJcbiAgZ2Z4UmVuZGVyUGF0aDogKHBhdGgpIC0+XHJcbiAgICB0aWxlcyA9IG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnRpbGVzMCwgMTYsIDE2LCAxNilcclxuICAgIGZvciBzIGluIEBnZngucGF0aFNwcml0ZXNcclxuICAgICAgQGdmeC5mbG9vckxheWVyLnJlbW92ZUNoaWxkIHNcclxuICAgIEBnZngucGF0aFNwcml0ZXMgPSBbXVxyXG4gICAgZm9yIHAgaW4gcGF0aFxyXG4gICAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHRpbGVzLnJlc291cmNlXHJcbiAgICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgICBzcHJpdGUuc2V0VGV4dHVyZVJlY3QodGlsZXMucmVjdCgxNykpXHJcbiAgICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHAueCAqIGNjLnVuaXRTaXplLCBwLnkgKiBjYy51bml0U2l6ZSkpXHJcbiAgICAgIHNwcml0ZS5zZXRPcGFjaXR5IDEyOFxyXG4gICAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgc3ByaXRlXHJcbiAgICAgIEBnZngucGF0aFNwcml0ZXMucHVzaCBzcHJpdGVcclxuXHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbihwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgQGdmeEFkanVzdE1hcFNjYWxlKGRlbHRhIC8gMjAwKVxyXG4gICAgQGdmeFBsYWNlTWFwKHBvcy54LCBwb3MueSwgeCwgeSlcclxuXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICAgIGNjLmdhbWUubmV3R2FtZSgpXHJcbiAgICBAZ2Z4Q2xlYXIoKVxyXG4gICAgQGdmeFJlbmRlckZsb29yKClcclxuICAgIEBnZnhSZW5kZXJQbGF5ZXIoKVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRTY2hlZHVsZXIoKS5zY2hlZHVsZUNhbGxiYWNrRm9yVGFyZ2V0KHRoaXMsIEB1cGRhdGUsIDEgLyA2MC4wLCBjYy5SRVBFQVRfRk9SRVZFUiwgMCwgZmFsc2UpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBjYy51bml0U2l6ZSlcclxuICAgIGdyaWRZID0gTWF0aC5mbG9vcihwb3MueSAvIGNjLnVuaXRTaXplKVxyXG5cclxuICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLmFjdChncmlkWCwgZ3JpZFkpXHJcblxyXG4gICAgIyBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgICMgcGF0aCA9IHBhdGhmaW5kZXIuY2FsYyhjYy5nYW1lLnN0YXRlLnBsYXllci54LCBjYy5nYW1lLnN0YXRlLnBsYXllci55LCBncmlkWCwgZ3JpZFkpXHJcbiAgICAjIEBnZnhSZW5kZXJQYXRoKHBhdGgpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIudGhpbmsoZHQsIEBnZngucGxheWVyLnNwcml0ZSlcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU1vZGVcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgSW50cm9Nb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJJbnRyb1wiKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlblxyXG4gICAgQHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMikpXHJcbiAgICBAYWRkIEBzcHJpdGVcclxuXHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgICBjYy5sb2cgXCJpbnRybyBjbGljayAje3h9LCAje3l9XCJcclxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvTW9kZVxyXG4iLCJyZXNvdXJjZXMgPVxyXG4gICdzcGxhc2hzY3JlZW4nOiAncmVzL3NwbGFzaHNjcmVlbi5wbmcnXHJcbiAgJ3RpbGVzMCc6ICdyZXMvdGlsZXMwLnBuZydcclxuICAncGxheWVyJzogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxuY29jb3NQcmVsb2FkTGlzdCA9ICh7c3JjOiB2fSBmb3IgaywgdiBvZiByZXNvdXJjZXMpXHJcbnJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0ID0gY29jb3NQcmVsb2FkTGlzdFxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlc291cmNlc1xyXG4iLCJnZnggPSByZXF1aXJlICdnZngnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuXHJcbmNsYXNzIEZsb29yIGV4dGVuZHMgZ2Z4LkxheWVyXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcigpXHJcbiAgICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICAgIEBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlIHJlc291cmNlcy5zcGxhc2hzY3JlZW4sIGNjLnJlY3QoNDUwLDMwMCwxNiwxNilcclxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGFkZENoaWxkKEBzcHJpdGUsIDApXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXHJcbiAgICBAc2V0UG9zaXRpb24oY2MucCgxMDAsIDEwMCkpXHJcbiAgICBAc2V0U2NhbGUoMTAsIDEwKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgdG91Y2hlc1xyXG4gICAgICB4ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnhcclxuICAgICAgeSA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS55XHJcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbG9vclxyXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xyXG5zZWVkUmFuZG9tID0gcmVxdWlyZSAnc2VlZC1yYW5kb20nXHJcblxyXG5TSEFQRVMgPSBbXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIyMjIyMjIyMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMuLi4jXHJcbiAgICAgICAgICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyMjIyMjIyMjXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLi4uLi4uLi4jXHJcbiAgIy4uLiMjIyMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uI1xyXG4gICMjIyMjXHJcbiAgXCJcIlwiXHJcbiAgXCJcIlwiXHJcbiAgIyMjIyNcclxuICAjLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICAgICAjIyMjXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgIyMjIyMuLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjIyMjIyMjI1xyXG4gIFwiXCJcIlxyXG5dXHJcblxyXG5FTVBUWSA9IDBcclxuV0FMTCA9IDFcclxuRE9PUiA9IDJcclxuRklSU1RfUk9PTV9JRCA9IDVcclxuXHJcbnZhbHVlVG9Db2xvciA9IChwLCB2KSAtPlxyXG4gIHN3aXRjaFxyXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXHJcbiAgICB3aGVuIHYgPT0gRE9PUiB0aGVuIHJldHVybiBwLmNvbG9yIDEyOCwgMTI4LCAxMjhcclxuICAgIHdoZW4gdiA+PSBGSVJTVF9ST09NX0lEIHRoZW4gcmV0dXJuIHAuY29sb3IgMCwgMCwgNSArIE1hdGgubWluKDI0MCwgMTUgKyAodiAqIDIpKVxyXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcclxuXHJcbmNsYXNzIFJlY3RcclxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxyXG5cclxuICB3OiAtPiBAciAtIEBsXHJcbiAgaDogLT4gQGIgLSBAdFxyXG4gIGFyZWE6IC0+IEB3KCkgKiBAaCgpXHJcbiAgYXNwZWN0OiAtPlxyXG4gICAgaWYgQGgoKSA+IDBcclxuICAgICAgcmV0dXJuIEB3KCkgLyBAaCgpXHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAwXHJcblxyXG4gIHNxdWFyZW5lc3M6IC0+XHJcbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXHJcblxyXG4gIGNlbnRlcjogLT5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IE1hdGguZmxvb3IoKEByICsgQGwpIC8gMilcclxuICAgICAgeTogTWF0aC5mbG9vcigoQGIgKyBAdCkgLyAyKVxyXG4gICAgfVxyXG5cclxuICBjbG9uZTogLT5cclxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcclxuXHJcbiAgZXhwYW5kOiAocikgLT5cclxuICAgIGlmIEBhcmVhKClcclxuICAgICAgQGwgPSByLmwgaWYgQGwgPiByLmxcclxuICAgICAgQHQgPSByLnQgaWYgQHQgPiByLnRcclxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcclxuICAgICAgQGIgPSByLmIgaWYgQGIgPCByLmJcclxuICAgIGVsc2VcclxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXHJcbiAgICAgIEBsID0gci5sXHJcbiAgICAgIEB0ID0gci50XHJcbiAgICAgIEByID0gci5yXHJcbiAgICAgIEBiID0gci5iXHJcblxyXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcclxuXHJcbmNsYXNzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxyXG4gICAgQGdyaWQgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIEBncmlkW2ldID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBncmlkW2ldW2pdID0gRU1QVFlcclxuXHJcbiAgICBAZ2VuZXJhdGVTaGFwZSgpXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBAc2V0KGksIDAsIFdBTEwpXHJcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIEBzZXQoMCwgaiwgV0FMTClcclxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxyXG5cclxuICByZWN0OiAoeCwgeSkgLT5cclxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxyXG5cclxuICBzZXQ6IChpLCBqLCB2KSAtPlxyXG4gICAgQGdyaWRbaV1bal0gPSB2XHJcblxyXG4gIGdldDogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxyXG4gICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgcmV0dXJuIHYgaWYgdiAhPSBFTVBUWVxyXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXHJcblxyXG4gIHBsYWNlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICB2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxyXG5cclxuICBmaXRzOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBtdiA9IG1hcC5nZXQoeCArIGksIHkgKyBqKVxyXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cclxuICAgICAgICBpZiBtdiAhPSBFTVBUWSBhbmQgc3YgIT0gRU1QVFkgYW5kIChtdiAhPSBXQUxMIG9yIHN2ICE9IFdBTEwpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGRvb3JFbGlnaWJsZTogKG1hcCwgeCwgeSwgaSwgaikgLT5cclxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXHJcbiAgICByb29tc1NlZW4gPSB7fVxyXG4gICAgdmFsdWVzID0gW1xyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpIC0gMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGksIGogKyAxKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXHJcbiAgICBdXHJcbiAgICBmb3IgdiBpbiB2YWx1ZXNcclxuICAgICAgaWYgdlxyXG4gICAgICAgIGlmIHYgPT0gMVxyXG4gICAgICAgICAgd2FsbE5laWdoYm9ycysrXHJcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcclxuICAgICAgICAgIHJvb21zU2Vlblt2XSA9IDFcclxuICAgIHJvb21zID0gT2JqZWN0LmtleXMocm9vbXNTZWVuKS5zb3J0IChhLCBiKSAtPiBhLWJcclxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxyXG4gICAgcm9vbUNvdW50ID0gcm9vbXMubGVuZ3RoXHJcbiAgICBpZiAod2FsbE5laWdoYm9ycyA9PSAyKSBhbmQgKHJvb21Db3VudCA9PSAyKSBhbmQgKEByb29taWQgaW4gcm9vbXMpXHJcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcclxuICAgICAgICByZXR1cm4gcm9vbXNcclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBkb29yTG9jYXRpb246IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIHJvb21zID0gQGRvb3JFbGlnaWJsZShtYXAsIHgsIHksIGksIGopXHJcbiAgICAgICAgaWYgcm9vbXNbMF0gIT0gLTEgYW5kIEByb29taWQgaW4gcm9vbXNcclxuICAgICAgICAgIHJldHVybiBbaSwgal1cclxuICAgIHJldHVybiBbLTEsIC0xXVxyXG5cclxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxyXG4gICAgYmJveFRlbXAgPSBtYXAuYmJveC5jbG9uZSgpXHJcbiAgICBiYm94VGVtcC5leHBhbmQgQHJlY3QoeCwgeSlcclxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cclxuXHJcbiAgZmluZEJlc3RTcG90OiAobWFwKSAtPlxyXG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxyXG4gICAgbWluQXJlYSA9IG1hcC53aWR0aCAqIG1hcC5oZWlnaHRcclxuICAgIG1pblggPSAtMVxyXG4gICAgbWluWSA9IC0xXHJcbiAgICBkb29yTG9jYXRpb24gPSBbLTEsIC0xXVxyXG4gICAgc2VhcmNoTCA9IG1hcC5iYm94LmwgLSBAd2lkdGhcclxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXHJcbiAgICBzZWFyY2hUID0gbWFwLmJib3gudCAtIEBoZWlnaHRcclxuICAgIHNlYXJjaEIgPSBtYXAuYmJveC5iXHJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cclxuICAgICAgZm9yIGogaW4gW3NlYXJjaFQgLi4uIHNlYXJjaEJdXHJcbiAgICAgICAgaWYgQGZpdHMobWFwLCBpLCBqKVxyXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXHJcbiAgICAgICAgICBpZiBhcmVhIDw9IG1pbkFyZWEgYW5kIHNxdWFyZW5lc3MgPD0gbWluU3F1YXJlbmVzc1xyXG4gICAgICAgICAgICBsb2NhdGlvbiA9IEBkb29yTG9jYXRpb24gbWFwLCBpLCBqXHJcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXHJcbiAgICAgICAgICAgICAgZG9vckxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtaW5BcmVhID0gYXJlYVxyXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXHJcbiAgICAgICAgICAgICAgbWluWCA9IGlcclxuICAgICAgICAgICAgICBtaW5ZID0galxyXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXHJcblxyXG5jbGFzcyBTaGFwZVJvb21UZW1wbGF0ZSBleHRlbmRzIFJvb21UZW1wbGF0ZVxyXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cclxuICAgIEBsaW5lcyA9IHNoYXBlLnNwbGl0KFwiXFxuXCIpXHJcbiAgICB3ID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXHJcbiAgICAgIHcgPSBNYXRoLm1heCh3LCBsaW5lLmxlbmd0aClcclxuICAgIEB3aWR0aCA9IHdcclxuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXHJcbiAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHQsIHJvb21pZFxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxyXG4gICAgaSA9IDBcclxuICAgIGogPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgZm9yIGMgaW4gbGluZS5zcGxpdChcIlwiKVxyXG4gICAgICAgIHYgPSBzd2l0Y2ggY1xyXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXHJcbiAgICAgICAgICB3aGVuICcjJyB0aGVuIFdBTExcclxuICAgICAgICAgIGVsc2UgMFxyXG4gICAgICAgIGlmIHZcclxuICAgICAgICAgIEBzZXQoaSwgaiwgdilcclxuICAgICAgICBpKytcclxuICAgICAgaisrXHJcbiAgICAgIGkgPSAwXHJcblxyXG5jbGFzcyBSb29tXHJcbiAgY29uc3RydWN0b3I6IChAcmVjdCkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJyb29tIGNyZWF0ZWQgI3tAcmVjdH1cIlxyXG5cclxuY2xhc3MgTWFwXHJcbiAgY29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQsIEBzZWVkKSAtPlxyXG4gICAgQHJhbmRSZXNldCgpXHJcbiAgICBAZ3JpZCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQGdyaWRbaV0gPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQGdyaWRbaV1bal0gPVxyXG4gICAgICAgICAgdHlwZTogRU1QVFlcclxuICAgICAgICAgIHg6IGlcclxuICAgICAgICAgIHk6IGpcclxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxyXG4gICAgQHJvb21zID0gW11cclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2ldW2pdLnR5cGUgPSB2XHJcblxyXG4gIGdldDogKGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgcmV0dXJuIEBncmlkW2ldW2pdLnR5cGVcclxuICAgIHJldHVybiAwXHJcblxyXG4gIGFkZFJvb206IChyb29tVGVtcGxhdGUsIHgsIHkpIC0+XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxyXG4gICAgcm9vbVRlbXBsYXRlLnBsYWNlIHRoaXMsIHgsIHlcclxuICAgIHIgPSByb29tVGVtcGxhdGUucmVjdCh4LCB5KVxyXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxyXG4gICAgQGJib3guZXhwYW5kKHIpXHJcbiAgICAjIGNvbnNvbGUubG9nIFwibmV3IG1hcCBiYm94ICN7QGJib3h9XCJcclxuXHJcbiAgcmFuZG9tUm9vbVRlbXBsYXRlOiAocm9vbWlkKSAtPlxyXG4gICAgciA9IEByYW5kKDEwMClcclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuICAwIDwgciA8IDEwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgMywgNSArIEByYW5kKDEwKSwgcm9vbWlkICAgICAgICAgICAgICAgICAgIyB2ZXJ0aWNhbCBjb3JyaWRvclxyXG4gICAgICB3aGVuIDEwIDwgciA8IDIwIHRoZW4gcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNSArIEByYW5kKDEwKSwgMywgcm9vbWlkICAgICAgICAgICAgICAgICAgIyBob3Jpem9udGFsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xyXG4gICAgcmV0dXJuIG5ldyBSb29tVGVtcGxhdGUgNCArIEByYW5kKDUpLCA0ICsgQHJhbmQoNSksIHJvb21pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBnZW5lcmljIHJlY3Rhbmd1bGFyIHJvb21cclxuXHJcbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxyXG4gICAgcm9vbVRlbXBsYXRlID0gQHJhbmRvbVJvb21UZW1wbGF0ZSByb29taWRcclxuICAgIGlmIEByb29tcy5sZW5ndGggPT0gMFxyXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXHJcbiAgICAgIHkgPSBNYXRoLmZsb29yKChAaGVpZ2h0IC8gMikgLSAocm9vbVRlbXBsYXRlLmhlaWdodCAvIDIpKVxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIGVsc2VcclxuICAgICAgW3gsIHksIGRvb3JMb2NhdGlvbl0gPSByb29tVGVtcGxhdGUuZmluZEJlc3RTcG90KHRoaXMpXHJcbiAgICAgIGlmIHggPCAwXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHJvb21UZW1wbGF0ZS5zZXQgZG9vckxvY2F0aW9uWzBdLCBkb29yTG9jYXRpb25bMV0sIDJcclxuICAgICAgQGFkZFJvb20gcm9vbVRlbXBsYXRlLCB4LCB5XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBnZW5lcmF0ZVJvb21zOiAoY291bnQpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxyXG4gICAgICByb29taWQgPSBGSVJTVF9ST09NX0lEICsgaVxyXG5cclxuICAgICAgYWRkZWQgPSBmYWxzZVxyXG4gICAgICB3aGlsZSBub3QgYWRkZWRcclxuICAgICAgICBhZGRlZCA9IEBnZW5lcmF0ZVJvb20gcm9vbWlkXHJcblxyXG5nZW5lcmF0ZSA9IC0+XHJcbiAgbWFwID0gbmV3IE1hcCA4MCwgODAsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IChzY29yZUZ1bmN0aW9uKSAtPlxyXG4gICAgQGNvbnRlbnQgPSBbXVxyXG4gICAgQHNjb3JlRnVuY3Rpb24gPSBzY29yZUZ1bmN0aW9uXHJcblxyXG4gIHB1c2g6IChlbGVtZW50KSAtPlxyXG4gICAgIyBBZGQgdGhlIG5ldyBlbGVtZW50IHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxyXG4gICAgQGNvbnRlbnQucHVzaChlbGVtZW50KVxyXG5cclxuICAgICMgQWxsb3cgaXQgdG8gc2luayBkb3duLlxyXG4gICAgQHNpbmtEb3duKEBjb250ZW50Lmxlbmd0aCAtIDEpXHJcblxyXG4gIHBvcDogLT5cclxuICAgICMgU3RvcmUgdGhlIGZpcnN0IGVsZW1lbnQgc28gd2UgY2FuIHJldHVybiBpdCBsYXRlci5cclxuICAgIHJlc3VsdCA9IEBjb250ZW50WzBdXHJcbiAgICAjIEdldCB0aGUgZWxlbWVudCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cclxuICAgIGVuZCA9IEBjb250ZW50LnBvcCgpXHJcbiAgICAjIElmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgbGVmdCwgcHV0IHRoZSBlbmQgZWxlbWVudCBhdCB0aGVcclxuICAgICMgc3RhcnQsIGFuZCBsZXQgaXQgYnViYmxlIHVwLlxyXG4gICAgaWYgQGNvbnRlbnQubGVuZ3RoID4gMFxyXG4gICAgICBAY29udGVudFswXSA9IGVuZFxyXG4gICAgICBAYnViYmxlVXAoMClcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcblxyXG4gIHJlbW92ZTogKG5vZGUpIC0+XHJcbiAgICBpID0gQGNvbnRlbnQuaW5kZXhPZihub2RlKVxyXG5cclxuICAgICMgV2hlbiBpdCBpcyBmb3VuZCwgdGhlIHByb2Nlc3Mgc2VlbiBpbiAncG9wJyBpcyByZXBlYXRlZFxyXG4gICAgIyB0byBmaWxsIHVwIHRoZSBob2xlLlxyXG4gICAgZW5kID0gQGNvbnRlbnQucG9wKClcclxuXHJcbiAgICBpZiBpICE9IEBjb250ZW50Lmxlbmd0aCAtIDFcclxuICAgICAgQGNvbnRlbnRbaV0gPSBlbmRcclxuXHJcbiAgICBpZiBAc2NvcmVGdW5jdGlvbihlbmQpIDwgQHNjb3JlRnVuY3Rpb24obm9kZSlcclxuICAgICAgQHNpbmtEb3duKGkpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBidWJibGVVcChpKVxyXG5cclxuICBzaXplOiAtPlxyXG4gICAgcmV0dXJuIEBjb250ZW50Lmxlbmd0aFxyXG5cclxuICByZXNjb3JlRWxlbWVudDogKG5vZGUpIC0+XHJcbiAgICBAc2lua0Rvd24oQGNvbnRlbnQuaW5kZXhPZihub2RlKSlcclxuXHJcbiAgc2lua0Rvd246IChuKSAtPlxyXG4gICAgIyBGZXRjaCB0aGUgZWxlbWVudCB0aGF0IGhhcyB0byBiZSBzdW5rLlxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcblxyXG4gICAgIyBXaGVuIGF0IDAsIGFuIGVsZW1lbnQgY2FuIG5vdCBzaW5rIGFueSBmdXJ0aGVyLlxyXG4gICAgd2hpbGUgKG4gPiAwKVxyXG4gICAgICAjIENvbXB1dGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaW5kZXgsIGFuZCBmZXRjaCBpdC5cclxuICAgICAgcGFyZW50TiA9ICgobiArIDEpID4+IDEpIC0gMVxyXG4gICAgICBwYXJlbnQgPSBAY29udGVudFtwYXJlbnROXVxyXG4gICAgICAjIFN3YXAgdGhlIGVsZW1lbnRzIGlmIHRoZSBwYXJlbnQgaXMgZ3JlYXRlci5cclxuICAgICAgaWYgQHNjb3JlRnVuY3Rpb24oZWxlbWVudCkgPCBAc2NvcmVGdW5jdGlvbihwYXJlbnQpXHJcbiAgICAgICAgQGNvbnRlbnRbcGFyZW50Tl0gPSBlbGVtZW50XHJcbiAgICAgICAgQGNvbnRlbnRbbl0gPSBwYXJlbnRcclxuICAgICAgICAjIFVwZGF0ZSAnbicgdG8gY29udGludWUgYXQgdGhlIG5ldyBwb3NpdGlvbi5cclxuICAgICAgICBuID0gcGFyZW50TlxyXG5cclxuICAgICAgIyBGb3VuZCBhIHBhcmVudCB0aGF0IGlzIGxlc3MsIG5vIG5lZWQgdG8gc2luayBhbnkgZnVydGhlci5cclxuICAgICAgZWxzZVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gIGJ1YmJsZVVwOiAobikgLT5cclxuICAgICMgTG9vayB1cCB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIGl0cyBzY29yZS5cclxuICAgIGxlbmd0aCA9IEBjb250ZW50Lmxlbmd0aFxyXG4gICAgZWxlbWVudCA9IEBjb250ZW50W25dXHJcbiAgICBlbGVtU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihlbGVtZW50KVxyXG5cclxuICAgIHdoaWxlKHRydWUpXHJcbiAgICAgICMgQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXHJcbiAgICAgIGNoaWxkMk4gPSAobiArIDEpIDw8IDFcclxuICAgICAgY2hpbGQxTiA9IGNoaWxkMk4gLSAxXHJcbiAgICAgICMgVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsXHJcbiAgICAgICMgaWYgYW55LlxyXG4gICAgICBzd2FwID0gbnVsbFxyXG4gICAgICAjIElmIHRoZSBmaXJzdCBjaGlsZCBleGlzdHMgKGlzIGluc2lkZSB0aGUgYXJyYXkpLi4uXHJcbiAgICAgIGlmIGNoaWxkMU4gPCBsZW5ndGhcclxuICAgICAgICAjIExvb2sgaXQgdXAgYW5kIGNvbXB1dGUgaXRzIHNjb3JlLlxyXG4gICAgICAgIGNoaWxkMSA9IEBjb250ZW50W2NoaWxkMU5dXHJcbiAgICAgICAgY2hpbGQxU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihjaGlsZDEpXHJcblxyXG4gICAgICAgICMgSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXHJcbiAgICAgICAgaWYgY2hpbGQxU2NvcmUgPCBlbGVtU2NvcmVcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDFOXHJcblxyXG4gICAgICAjIERvIHRoZSBzYW1lIGNoZWNrcyBmb3IgdGhlIG90aGVyIGNoaWxkLlxyXG4gICAgICBpZiBjaGlsZDJOIDwgbGVuZ3RoXHJcbiAgICAgICAgY2hpbGQyID0gQGNvbnRlbnRbY2hpbGQyTl1cclxuICAgICAgICBjaGlsZDJTY29yZSA9IEBzY29yZUZ1bmN0aW9uKGNoaWxkMilcclxuICAgICAgICBpZiBjaGlsZDJTY29yZSA8IChzd2FwID09IG51bGwgPyBlbGVtU2NvcmUgOiBjaGlsZDFTY29yZSlcclxuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOXHJcblxyXG4gICAgICAjIElmIHRoZSBlbGVtZW50IG5lZWRzIHRvIGJlIG1vdmVkLCBzd2FwIGl0LCBhbmQgY29udGludWUuXHJcbiAgICAgIGlmIHN3YXAgIT0gbnVsbFxyXG4gICAgICAgIEBjb250ZW50W25dID0gQGNvbnRlbnRbc3dhcF1cclxuICAgICAgICBAY29udGVudFtzd2FwXSA9IGVsZW1lbnRcclxuICAgICAgICBuID0gc3dhcFxyXG5cclxuICAgICAgIyBPdGhlcndpc2UsIHdlIGFyZSBkb25lLlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbmNsYXNzIEFTdGFyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZiA9IDBcclxuICAgICAgICBub2RlLmcgPSAwXHJcbiAgICAgICAgbm9kZS5oID0gMFxyXG4gICAgICAgIG5vZGUuY29zdCA9IG5vZGUudHlwZVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5jbG9zZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBoZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBCaW5hcnlIZWFwIChub2RlKSAtPlxyXG4gICAgICByZXR1cm4gbm9kZS5mXHJcblxyXG4gIHNlYXJjaDogKHN0YXJ0LCBlbmQpIC0+XHJcbiAgICBncmlkID0gQGZsb29yLmdyaWRcclxuICAgIGhldXJpc3RpYyA9IEBtYW5oYXR0YW5cclxuXHJcbiAgICBvcGVuSGVhcCA9IEBoZWFwKClcclxuICAgIG9wZW5IZWFwLnB1c2goc3RhcnQpXHJcblxyXG4gICAgd2hpbGUgb3BlbkhlYXAuc2l6ZSgpID4gMFxyXG4gICAgICAjIEdyYWIgdGhlIGxvd2VzdCBmKHgpIHRvIHByb2Nlc3MgbmV4dC4gIEhlYXAga2VlcHMgdGhpcyBzb3J0ZWQgZm9yIHVzLlxyXG4gICAgICBjdXJyZW50Tm9kZSA9IG9wZW5IZWFwLnBvcCgpXHJcblxyXG4gICAgICAjIEVuZCBjYXNlIC0tIHJlc3VsdCBoYXMgYmVlbiBmb3VuZCwgcmV0dXJuIHRoZSB0cmFjZWQgcGF0aC5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgY3VyciA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICB3aGlsZSBjdXJyLnBhcmVudFxyXG4gICAgICAgICAgcmV0LnB1c2goY3VycilcclxuICAgICAgICAgIGN1cnIgPSBjdXJyLnBhcmVudFxyXG5cclxuICAgICAgICByZXR1cm4gcmV0LnJldmVyc2UoKVxyXG5cclxuICAgICAgIyBOb3JtYWwgY2FzZSAtLSBtb3ZlIGN1cnJlbnROb2RlIGZyb20gb3BlbiB0byBjbG9zZWQsIHByb2Nlc3MgZWFjaCBvZiBpdHMgbmVpZ2hib3JzLlxyXG4gICAgICBjdXJyZW50Tm9kZS5jbG9zZWQgPSB0cnVlXHJcblxyXG4gICAgICAjIEZpbmQgYWxsIG5laWdoYm9ycyBmb3IgdGhlIGN1cnJlbnQgbm9kZS5cclxuICAgICAgbmVpZ2hib3JzID0gQG5laWdoYm9ycyhncmlkLCBjdXJyZW50Tm9kZSlcclxuXHJcbiAgICAgIGZvciBuZWlnaGJvciBpbiBuZWlnaGJvcnNcclxuICAgICAgICBpZiBuZWlnaGJvci5jbG9zZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIFRoZSBnIHNjb3JlIGlzIHRoZSBzaG9ydGVzdCBkaXN0YW5jZSBmcm9tIHN0YXJ0IHRvIGN1cnJlbnQgbm9kZS5cclxuICAgICAgICAjIFdlIG5lZWQgdG8gY2hlY2sgaWYgdGhlIHBhdGggd2UgaGF2ZSBhcnJpdmVkIGF0IHRoaXMgbmVpZ2hib3IgaXMgdGhlIHNob3J0ZXN0IG9uZSB3ZSBoYXZlIHNlZW4geWV0LlxyXG4gICAgICAgIGdTY29yZSA9IGN1cnJlbnROb2RlLmcgKyBuZWlnaGJvci5jb3N0XHJcbiAgICAgICAgYmVlblZpc2l0ZWQgPSBuZWlnaGJvci52aXNpdGVkXHJcblxyXG4gICAgICAgIGlmIChub3QgYmVlblZpc2l0ZWQpIG9yIChnU2NvcmUgPCBuZWlnaGJvci5nKVxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLiAgVGFrZSBzY29yZSBmb3Igbm9kZSB0byBzZWUgaG93IGdvb2QgaXQgaXMuXHJcbiAgICAgICAgICBuZWlnaGJvci52aXNpdGVkID0gdHJ1ZVxyXG4gICAgICAgICAgbmVpZ2hib3IucGFyZW50ID0gY3VycmVudE5vZGVcclxuICAgICAgICAgIG5laWdoYm9yLmggPSBuZWlnaGJvci5oIG9yIGhldXJpc3RpYyhuZWlnaGJvci54LCBuZWlnaGJvci55LCBlbmQueCwgZW5kLnkpXHJcbiAgICAgICAgICBuZWlnaGJvci5nID0gZ1Njb3JlXHJcbiAgICAgICAgICBuZWlnaGJvci5mID0gbmVpZ2hib3IuZyArIG5laWdoYm9yLmhcclxuXHJcbiAgICAgICAgICBpZiBub3QgYmVlblZpc2l0ZWRcclxuICAgICAgICAgICAgIyBQdXNoaW5nIHRvIGhlYXAgd2lsbCBwdXQgaXQgaW4gcHJvcGVyIHBsYWNlIGJhc2VkIG9uIHRoZSAnZicgdmFsdWUuXHJcbiAgICAgICAgICAgIG9wZW5IZWFwLnB1c2gobmVpZ2hib3IpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICMgQWxyZWFkeSBzZWVuIHRoZSBub2RlLCBidXQgc2luY2UgaXQgaGFzIGJlZW4gcmVzY29yZWQgd2UgbmVlZCB0byByZW9yZGVyIGl0IGluIHRoZSBoZWFwXHJcbiAgICAgICAgICAgIG9wZW5IZWFwLnJlc2NvcmVFbGVtZW50KG5laWdoYm9yKVxyXG5cclxuICAgICMgTm8gcmVzdWx0IHdhcyBmb3VuZCAtIGVtcHR5IGFycmF5IHNpZ25pZmllcyBmYWlsdXJlIHRvIGZpbmQgcGF0aC5cclxuICAgIHJldHVybiBbXVxyXG5cclxuICBtYW5oYXR0YW46ICh4MCwgeTAsIHgxLCB5MSkgLT5cclxuICAgICMgU2VlIGxpc3Qgb2YgaGV1cmlzdGljczogaHR0cDovL3RoZW9yeS5zdGFuZm9yZC5lZHUvfmFtaXRwL0dhbWVQcm9ncmFtbWluZy9IZXVyaXN0aWNzLmh0bWxcclxuICAgIGQxID0gTWF0aC5hYnMgKHgxIC0geDApXHJcbiAgICBkMiA9IE1hdGguYWJzICh5MSAtIHkwKVxyXG4gICAgcmV0dXJuIGQxICsgZDJcclxuXHJcbiAgZGlzdFNxdWFyZWQ6ICh4MCwgeTAsIHgxLCB5MSkgLT5cclxuICAgIGR4ID0geDEgLSB4MFxyXG4gICAgZHkgPSB5MSAtIHkwXHJcbiAgICByZXR1cm4gKGR4ICogZHgpICsgKGR5ICogZHkpXHJcblxyXG4gIG5laWdoYm9yczogKGdyaWQsIG5vZGUpIC0+XHJcbiAgICByZXQgPSBbXVxyXG4gICAgeCA9IG5vZGUueFxyXG4gICAgeSA9IG5vZGUueVxyXG5cclxuICAgICMgU291dGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5LTFdKVxyXG5cclxuICAgICMgU291dGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5LTFdKVxyXG5cclxuICAgICMgTm9ydGh3ZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5KzFdKVxyXG5cclxuICAgICMgTm9ydGhlYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5KzFdKVxyXG5cclxuICAgICMgV2VzdFxyXG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ldKVxyXG5cclxuICAgICMgRWFzdFxyXG4gICAgaWYgZ3JpZFt4KzFdIGFuZCBncmlkW3grMV1beV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ldKVxyXG5cclxuICAgICMgU291dGhcclxuICAgIGlmIGdyaWRbeF0gYW5kIGdyaWRbeF1beS0xXVxyXG4gICAgICByZXQucHVzaChncmlkW3hdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5KzFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beSsxXSlcclxuXHJcbiAgICByZXR1cm4gcmV0XHJcblxyXG5jbGFzcyBQYXRoZmluZGVyXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IsIEBmbGFncykgLT5cclxuXHJcbiAgY2FsYzogKHN0YXJ0WCwgc3RhcnRZLCBkZXN0WCwgZGVzdFkpIC0+XHJcbiAgICBhc3RhciA9IG5ldyBBU3RhciBAZmxvb3JcclxuICAgIHJldHVybiBhc3Rhci5zZWFyY2goQGZsb29yLmdyaWRbc3RhcnRYXVtzdGFydFldLCBAZmxvb3IuZ3JpZFtkZXN0WF1bZGVzdFldKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXRoZmluZGVyXHJcbiJdfQ==
;