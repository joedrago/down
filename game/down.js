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
module.exports=require('nCRJjV');
},{}],"nCRJjV":[function(require,module,exports){
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


},{"boot/maindroid":"HCq9uM","boot/mainweb":"4GzHxr"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('HCq9uM');
},{}],"HCq9uM":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"QhDFR6"}],"boot/mainweb":[function(require,module,exports){
module.exports=require('4GzHxr');
},{}],"4GzHxr":[function(require,module,exports){
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


},{"config":"iMuVlD","main":"QhDFR6","resources":"91JGgx"}],"brain/brain":[function(require,module,exports){
module.exports=require('dM/HqE');
},{}],"dM/HqE":[function(require,module,exports){
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


},{}],"4JKPVE":[function(require,module,exports){
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


},{"brain/brain":"dM/HqE","gfx/tilesheet":"8TUzEH","resources":"91JGgx","world/pathfinder":"vBUqGF"}],"brain/player":[function(require,module,exports){
module.exports=require('4JKPVE');
},{}],"config":[function(require,module,exports){
module.exports=require('iMuVlD');
},{}],"iMuVlD":[function(require,module,exports){
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
module.exports=require('4XUS/O');
},{}],"4XUS/O":[function(require,module,exports){
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
module.exports=require('8TUzEH');
},{}],"8TUzEH":[function(require,module,exports){
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


},{}],"main":[function(require,module,exports){
module.exports=require('QhDFR6');
},{}],"QhDFR6":[function(require,module,exports){
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


},{"brain/player":"4JKPVE","mode/game":"RoNOb3","mode/intro":"A0imZA","resources":"91JGgx","world/floorgen":"Bo8xW5"}],"mode/game":[function(require,module,exports){
module.exports=require('RoNOb3');
},{}],"RoNOb3":[function(require,module,exports){
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


},{"base/mode":"nCRJjV","config":"iMuVlD","resources":"91JGgx","world/floorgen":"Bo8xW5","world/pathfinder":"vBUqGF"}],"A0imZA":[function(require,module,exports){
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


},{"base/mode":"nCRJjV","resources":"91JGgx"}],"mode/intro":[function(require,module,exports){
module.exports=require('A0imZA');
},{}],"resources":[function(require,module,exports){
module.exports=require('91JGgx');
},{}],"91JGgx":[function(require,module,exports){
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


},{"gfx/tilesheet":"8TUzEH"}],"xJVDSW":[function(require,module,exports){
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


},{"gfx":"4XUS/O","resources":"91JGgx"}],"world/floor":[function(require,module,exports){
module.exports=require('xJVDSW');
},{}],"Bo8xW5":[function(require,module,exports){
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
module.exports=require('Bo8xW5');
},{}],"world/pathfinder":[function(require,module,exports){
module.exports=require('vBUqGF');
},{}],"vBUqGF":[function(require,module,exports){
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
          alt += 0.1;
        }
        if ((alt < neighbor.distance) && !neighbor.visited) {
          neighbor.distance = alt;
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


},{"world/floorgen":"Bo8xW5"}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLDJEQUFBOztBQUFBLG9CQUFBLEdBQXVCLEVBQXZCLENBQUE7O0FBQUEsVUFFQSxHQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFnQjtBQUFBLEVBQzNCLElBQUEsRUFBTSxTQUFFLElBQUYsR0FBQTtBQUNKLElBREssSUFBQyxDQUFBLE9BQUEsSUFDTixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0Es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QUFBLE1BQUEsQ0FBUSxDQUFBLE1BQUEsQ0FBcEMsRUFBNkMsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFLLENBQUEsS0FBQSxDQUFPLENBQUEsS0FBQSxDQUFoRSxDQUFQLENBRkk7RUFBQSxDQUZOLENBQUE7O29CQUFBOztJQWpJRixDQUFBOztBQUFBLE1BdUlNLENBQUMsT0FBUCxHQUFpQixVQXZJakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCJ2YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBzaWduaWZpY2FuY2UgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcblxyXG52YXIgb3ZlcmZsb3csIHN0YXJ0ZGVub207IC8vbnVtYmVyc1xyXG5cclxuXHJcbnZhciBvbGRSYW5kb20gPSBNYXRoLnJhbmRvbTtcclxuLy9cclxuLy8gc2VlZHJhbmRvbSgpXHJcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxyXG4vL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNlZWRyYW5kb20oc2VlZCwgb3ZlclJpZGVHbG9iYWwpIHtcclxuICBpZiAoIXNlZWQpIHtcclxuICAgIGlmIChvdmVyUmlkZUdsb2JhbCkge1xyXG4gICAgICBNYXRoLnJhbmRvbSA9IG9sZFJhbmRvbTtcclxuICAgIH1cclxuICAgIHJldHVybiBvbGRSYW5kb207XHJcbiAgfVxyXG4gIHZhciBrZXkgPSBbXTtcclxuICB2YXIgYXJjNDtcclxuXHJcbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXHJcbiAgc2VlZCA9IG1peGtleShmbGF0dGVuKHNlZWQsIDMpLCBrZXkpO1xyXG5cclxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cclxuICBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIGZ1bmN0aW9uIHJhbmRvbSgpIHsgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcclxuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyk7ICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxyXG4gICAgdmFyIGQgPSBzdGFydGRlbm9tOyAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cclxuICAgIHZhciB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxyXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XHJcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcclxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxyXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cclxuICAgIH1cclxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXHJcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xyXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIE1hdGggdW50aWxcclxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cclxuICB9XHJcbiAgcmFuZG9tLnNlZWQgPSBzZWVkO1xyXG4gIGlmIChvdmVyUmlkZUdsb2JhbCkge1xyXG4gICAgTWF0aFsncmFuZG9tJ10gPSByYW5kb207XHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm4gdGhlIHNlZWQgdGhhdCB3YXMgdXNlZFxyXG4gIHJldHVybiByYW5kb207XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBUkM0XHJcbi8vXHJcbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2ZcclxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXHJcbi8vXHJcbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXHJcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcclxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxyXG4vL1xyXG4vKiogQGNvbnN0cnVjdG9yICovXHJcbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XHJcbiAgdmFyIHQsIHUsIG1lID0gdGhpcywga2V5bGVuID0ga2V5Lmxlbmd0aDtcclxuICB2YXIgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IG1lLm0gPSAwO1xyXG4gIG1lLlMgPSBbXTtcclxuICBtZS5jID0gW107XHJcblxyXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXHJcbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxyXG5cclxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxyXG4gIHdoaWxlIChpIDwgd2lkdGgpIHsgbWUuU1tpXSA9IGkrKzsgfVxyXG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XHJcbiAgICB0ID0gbWUuU1tpXTtcclxuICAgIGogPSBsb3diaXRzKGogKyB0ICsga2V5W2kgJSBrZXlsZW5dKTtcclxuICAgIHUgPSBtZS5TW2pdO1xyXG4gICAgbWUuU1tpXSA9IHU7XHJcbiAgICBtZS5TW2pdID0gdDtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cclxuICBtZS5nID0gZnVuY3Rpb24gZ2V0bmV4dChjb3VudCkge1xyXG4gICAgdmFyIHMgPSBtZS5TO1xyXG4gICAgdmFyIGkgPSBsb3diaXRzKG1lLmkgKyAxKTsgdmFyIHQgPSBzW2ldO1xyXG4gICAgdmFyIGogPSBsb3diaXRzKG1lLmogKyB0KTsgdmFyIHUgPSBzW2pdO1xyXG4gICAgc1tpXSA9IHU7XHJcbiAgICBzW2pdID0gdDtcclxuICAgIHZhciByID0gc1tsb3diaXRzKHQgKyB1KV07XHJcbiAgICB3aGlsZSAoLS1jb3VudCkge1xyXG4gICAgICBpID0gbG93Yml0cyhpICsgMSk7IHQgPSBzW2ldO1xyXG4gICAgICBqID0gbG93Yml0cyhqICsgdCk7IHUgPSBzW2pdO1xyXG4gICAgICBzW2ldID0gdTtcclxuICAgICAgc1tqXSA9IHQ7XHJcbiAgICAgIHIgPSByICogd2lkdGggKyBzW2xvd2JpdHModCArIHUpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpO1xyXG4gICAgbWUuaiA9IGo7XHJcbiAgICByZXR1cm4gcjtcclxuICB9O1xyXG4gIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLlxyXG4gIC8vIFNlZSBodHRwOi8vd3d3LnJzYS5jb20vcnNhbGFicy9ub2RlLmFzcD9pZD0yMDA5XHJcbiAgbWUuZyh3aWR0aCk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGZsYXR0ZW4oKVxyXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge09iamVjdD19IHJlc3VsdCBcclxuICAqIEBwYXJhbSB7c3RyaW5nPX0gcHJvcFxyXG4gICogQHBhcmFtIHtzdHJpbmc9fSB0eXAgKi9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoLCByZXN1bHQsIHByb3AsIHR5cCkge1xyXG4gIHJlc3VsdCA9IFtdO1xyXG4gIHR5cCA9IHR5cGVvZihvYmopO1xyXG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgaWYgKHByb3AuaW5kZXhPZignUycpIDwgNSkgeyAgICAvLyBBdm9pZCBGRjMgYnVnIChsb2NhbC9zZXNzaW9uU3RvcmFnZSlcclxuICAgICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogb2JqICsgKHR5cCAhPSAnc3RyaW5nJyA/ICdcXDAnIDogJycpKTtcclxufVxyXG5cclxuLy9cclxuLy8gbWl4a2V5KClcclxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxyXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cclxuLy9cclxuLyoqIEBwYXJhbSB7bnVtYmVyPX0gc21lYXIgXHJcbiAgKiBAcGFyYW0ge251bWJlcj19IGogKi9cclxuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSwgc21lYXIsIGopIHtcclxuICBzZWVkICs9ICcnOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgdGhlIHNlZWQgaXMgYSBzdHJpbmdcclxuICBzbWVhciA9IDA7XHJcbiAgZm9yIChqID0gMDsgaiA8IHNlZWQubGVuZ3RoOyBqKyspIHtcclxuICAgIGtleVtsb3diaXRzKGopXSA9XHJcbiAgICAgIGxvd2JpdHMoKHNtZWFyIF49IGtleVtsb3diaXRzKGopXSAqIDE5KSArIHNlZWQuY2hhckNvZGVBdChqKSk7XHJcbiAgfVxyXG4gIHNlZWQgPSAnJztcclxuICBmb3IgKGogaW4ga2V5KSB7IHNlZWQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShrZXlbal0pOyB9XHJcbiAgcmV0dXJuIHNlZWQ7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGxvd2JpdHMoKVxyXG4vLyBBIHF1aWNrIFwibiBtb2Qgd2lkdGhcIiBmb3Igd2lkdGggYSBwb3dlciBvZiAyLlxyXG4vL1xyXG5mdW5jdGlvbiBsb3diaXRzKG4pIHsgcmV0dXJuIG4gJiAod2lkdGggLSAxKTsgfVxyXG5cclxuLy9cclxuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxyXG4vL1xyXG5zdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyk7XHJcbnNpZ25pZmljYW5jZSA9IE1hdGgucG93KDIsIHNpZ25pZmljYW5jZSk7XHJcbm92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMjtcclxuIiwiIyBob3cgbWFueSBwaXhlbHMgY2FuIHlvdSBkcmFnIGJlZm9yZSBpdCBpcyBhY3R1YWxseSBjb25zaWRlcmVkIGEgZHJhZ1xyXG5FTkdBR0VfRFJBR19ESVNUQU5DRSA9IDMwXHJcblxyXG5JbnB1dExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBzZXRUb3VjaEVuYWJsZWQodHJ1ZSlcclxuICAgIEBzZXRNb3VzZUVuYWJsZWQodHJ1ZSlcclxuICAgIEB0cmFja2VkVG91Y2hlcyA9IFtdXHJcblxyXG4gIGNhbGNEaXN0YW5jZTogKHgxLCB5MSwgeDIsIHkyKSAtPlxyXG4gICAgZHggPSB4MiAtIHgxXHJcbiAgICBkeSA9IHkyIC0geTFcclxuICAgIHJldHVybiBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSlcclxuXHJcbiAgc2V0RHJhZ1BvaW50OiAtPlxyXG4gICAgQGRyYWdYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgIEBkcmFnWSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gIGNhbGNQaW5jaEFuY2hvcjogLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBAcGluY2hYID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnggKyBAdHJhY2tlZFRvdWNoZXNbMV0ueCkgLyAyKVxyXG4gICAgICBAcGluY2hZID0gTWF0aC5mbG9vcigoQHRyYWNrZWRUb3VjaGVzWzBdLnkgKyBAdHJhY2tlZFRvdWNoZXNbMV0ueSkgLyAyKVxyXG4gICAgICAjIGNjLmxvZyBcInBpbmNoIGFuY2hvciBzZXQgYXQgI3tAcGluY2hYfSwgI3tAcGluY2hZfVwiXHJcblxyXG4gIGFkZFRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBmb3IgdCBpbiBAdHJhY2tlZFRvdWNoZXNcclxuICAgICAgaWYgdC5pZCA9PSBpZFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgQHRyYWNrZWRUb3VjaGVzLnB1c2gge1xyXG4gICAgICBpZDogaWRcclxuICAgICAgeDogeFxyXG4gICAgICB5OiB5XHJcbiAgICB9XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDJcclxuICAgICAgIyBXZSBqdXN0IGFkZGVkIGEgc2Vjb25kIHRvdWNoIHNwb3QuIENhbGN1bGF0ZSB0aGUgYW5jaG9yIGZvciBwaW5jaGluZyBub3dcclxuICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAjY2MubG9nIFwiYWRkaW5nIHRvdWNoICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICByZW1vdmVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcbiAgICAgIGlmIGluZGV4IDwgMlxyXG4gICAgICAgICMgV2UganVzdCBmb3Jnb3Qgb25lIG9mIG91ciBwaW5jaCB0b3VjaGVzLiBQaWNrIGEgbmV3IGFuY2hvciBzcG90LlxyXG4gICAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgICAjY2MubG9nIFwiZm9yZ2V0dGluZyBpZCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgdXBkYXRlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueCA9IHhcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS55ID0geVxyXG5cclxuICBvblRvdWNoZXNCZWdhbjogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEBkcmFnZ2luZyA9IGZhbHNlXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAYWRkVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPiAxXHJcbiAgICAgICMgVGhleSdyZSBwaW5jaGluZywgZG9uJ3QgZXZlbiBib3RoZXIgdG8gZW1pdCBhIGNsaWNrXHJcbiAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuXHJcbiAgb25Ub3VjaGVzTW92ZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIHByZXZEaXN0YW5jZSA9IDBcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICBwcmV2RGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIHByZXZYID0gQHRyYWNrZWRUb3VjaGVzWzBdLnhcclxuICAgICAgcHJldlkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEB1cGRhdGVUb3VjaCh0LmdldElkKCksIHBvcy54LCBwb3MueSlcclxuXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgIyBzaW5nbGUgdG91Y2gsIGNvbnNpZGVyIGRyYWdnaW5nXHJcbiAgICAgIGRyYWdEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UgQGRyYWdYLCBAZHJhZ1ksIEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG4gICAgICBpZiBAZHJhZ2dpbmcgb3IgKGRyYWdEaXN0YW5jZSA+IEVOR0FHRV9EUkFHX0RJU1RBTkNFKVxyXG4gICAgICAgIEBkcmFnZ2luZyA9IHRydWVcclxuICAgICAgICBpZiBkcmFnRGlzdGFuY2UgPiAwLjVcclxuICAgICAgICAgIGR4ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnggLSBAZHJhZ1hcclxuICAgICAgICAgIGR5ID0gQHRyYWNrZWRUb3VjaGVzWzBdLnkgLSBAZHJhZ1lcclxuICAgICAgICAgICNjYy5sb2cgXCJzaW5nbGUgZHJhZzogI3tkeH0sICN7ZHl9XCJcclxuICAgICAgICAgIEBtb2RlLm9uRHJhZyhkeCwgZHkpXHJcbiAgICAgICAgQHNldERyYWdQb2ludCgpXHJcblxyXG4gICAgZWxzZSBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgIyBhdCBsZWFzdCB0d28gZmluZ2VycyBwcmVzZW50LCBjaGVjayBmb3IgcGluY2gvem9vbVxyXG4gICAgICBjdXJyRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlKEB0cmFja2VkVG91Y2hlc1swXS54LCBAdHJhY2tlZFRvdWNoZXNbMF0ueSwgQHRyYWNrZWRUb3VjaGVzWzFdLngsIEB0cmFja2VkVG91Y2hlc1sxXS55KVxyXG4gICAgICBkZWx0YURpc3RhbmNlID0gY3VyckRpc3RhbmNlIC0gcHJldkRpc3RhbmNlXHJcbiAgICAgIGlmIGRlbHRhRGlzdGFuY2UgIT0gMFxyXG4gICAgICAgICNjYy5sb2cgXCJkaXN0YW5jZSBkcmFnZ2VkIGFwYXJ0OiAje2RlbHRhRGlzdGFuY2V9IFthbmNob3I6ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1dXCJcclxuICAgICAgICBAbW9kZS5vblpvb20oQHBpbmNoWCwgQHBpbmNoWSwgZGVsdGFEaXN0YW5jZSlcclxuXHJcbiAgb25Ub3VjaGVzRW5kZWQ6ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMSBhbmQgbm90IEBkcmFnZ2luZ1xyXG4gICAgICBwb3MgPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKClcclxuICAgICAgI2NjLmxvZyBcImNsaWNrIGF0ICN7cG9zLnh9LCAje3Bvcy55fVwiXHJcbiAgICAgIEBtb2RlLm9uQ2xpY2socG9zLngsIHBvcy55KVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHJlbW92ZVRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcblxyXG4gIG9uU2Nyb2xsV2hlZWw6IChldikgLT5cclxuICAgIHBvcyA9IGV2LmdldExvY2F0aW9uKClcclxuICAgIEBtb2RlLm9uWm9vbShwb3MueCwgcG9zLnksIGV2LmdldFdoZWVsRGVsdGEoKSlcclxufVxyXG5cclxuR2Z4TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG59XHJcblxyXG5Nb2RlU2NlbmUgPSBjYy5TY2VuZS5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG5cclxuICAgIEBpbnB1dCA9IG5ldyBJbnB1dExheWVyKClcclxuICAgIEBpbnB1dC5pbml0KEBtb2RlKVxyXG4gICAgQGFkZENoaWxkKEBpbnB1dClcclxuXHJcbiAgICBAZ2Z4ID0gbmV3IEdmeExheWVyKClcclxuICAgIEBnZnguaW5pdCgpXHJcbiAgICBAYWRkQ2hpbGQoQGdmeClcclxuXHJcbiAgb25FbnRlcjogLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQG1vZGUub25BY3RpdmF0ZSgpXHJcbn1cclxuXHJcbmNsYXNzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogKEBuYW1lKSAtPlxyXG4gICAgQHNjZW5lID0gbmV3IE1vZGVTY2VuZSgpXHJcbiAgICBAc2NlbmUuaW5pdCh0aGlzKVxyXG4gICAgQHNjZW5lLnJldGFpbigpXHJcblxyXG4gIGFjdGl2YXRlOiAtPlxyXG4gICAgY2MubG9nIFwiYWN0aXZhdGluZyBtb2RlICN7QG5hbWV9XCJcclxuICAgIGlmIGNjLnNhd09uZVNjZW5lP1xyXG4gICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnBvcFNjZW5lKClcclxuICAgIGVsc2VcclxuICAgICAgY2Muc2F3T25lU2NlbmUgPSB0cnVlXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnB1c2hTY2VuZShAc2NlbmUpXHJcblxyXG4gIGFkZDogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZnguYWRkQ2hpbGQob2JqKVxyXG5cclxuICByZW1vdmU6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LnJlbW92ZUNoaWxkKG9iailcclxuXHJcbiAgIyB0byBiZSBvdmVycmlkZGVuIGJ5IGRlcml2ZWQgTW9kZXNcclxuICBvbkFjdGl2YXRlOiAtPlxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gIG9uWm9vbTogKHgsIHksIGRlbHRhKSAtPlxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZVxyXG4iLCJpZiBkb2N1bWVudD9cbiAgcmVxdWlyZSAnYm9vdC9tYWlud2ViJ1xuZWxzZVxuICByZXF1aXJlICdib290L21haW5kcm9pZCdcbiIsInJlcXVpcmUgJ2pzYi5qcydcbnJlcXVpcmUgJ21haW4nXG5cbm51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpXG5udWxsU2NlbmUuaW5pdCgpXG5jYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJ1bldpdGhTY2VuZShudWxsU2NlbmUpXG5jYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcbiIsImNvbmZpZyA9IHJlcXVpcmUgJ2NvbmZpZydcblxuY29jb3MyZEFwcCA9IGNjLkFwcGxpY2F0aW9uLmV4dGVuZCB7XG4gIGNvbmZpZzogY29uZmlnXG4gIGN0b3I6IChzY2VuZSkgLT5cbiAgICBAX3N1cGVyKClcbiAgICBjYy5DT0NPUzJEX0RFQlVHID0gQGNvbmZpZ1snQ09DT1MyRF9ERUJVRyddXG4gICAgY2MuaW5pdERlYnVnU2V0dGluZygpXG4gICAgY2Muc2V0dXAoQGNvbmZpZ1sndGFnJ10pXG4gICAgY2MuQXBwQ29udHJvbGxlci5zaGFyZUFwcENvbnRyb2xsZXIoKS5kaWRGaW5pc2hMYXVuY2hpbmdXaXRoT3B0aW9ucygpXG5cbiAgYXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IC0+XG4gICAgICBpZiBjYy5SZW5kZXJEb2Vzbm90U3VwcG9ydCgpXG4gICAgICAgICAgIyBzaG93IEluZm9ybWF0aW9uIHRvIHVzZXJcbiAgICAgICAgICBhbGVydCBcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgIyBpbml0aWFsaXplIGRpcmVjdG9yXG4gICAgICBkaXJlY3RvciA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKClcblxuICAgICAgY2MuRUdMVmlldy5nZXRJbnN0YW5jZSgpLnNldERlc2lnblJlc29sdXRpb25TaXplKDEyODAsIDcyMCwgY2MuUkVTT0xVVElPTl9QT0xJQ1kuU0hPV19BTEwpXG5cbiAgICAgICMgdHVybiBvbiBkaXNwbGF5IEZQU1xuICAgICAgZGlyZWN0b3Iuc2V0RGlzcGxheVN0YXRzIEBjb25maWdbJ3Nob3dGUFMnXVxuXG4gICAgICAjIHNldCBGUFMuIHRoZSBkZWZhdWx0IHZhbHVlIGlzIDEuMC82MCBpZiB5b3UgZG9uJ3QgY2FsbCB0aGlzXG4gICAgICBkaXJlY3Rvci5zZXRBbmltYXRpb25JbnRlcnZhbCAxLjAgLyBAY29uZmlnWydmcmFtZVJhdGUnXVxuXG4gICAgICAjIGxvYWQgcmVzb3VyY2VzXG4gICAgICByZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXG4gICAgICBjYy5Mb2FkZXJTY2VuZS5wcmVsb2FkKHJlc291cmNlcy5jb2Nvc1ByZWxvYWRMaXN0LCAtPlxuICAgICAgICByZXF1aXJlICdtYWluJ1xuICAgICAgICBudWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKTtcbiAgICAgICAgbnVsbFNjZW5lLmluaXQoKVxuICAgICAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLnJlcGxhY2VTY2VuZShudWxsU2NlbmUpXG4jICAgICAgICBjYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcbiAgICAgICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcbiAgICAgIHRoaXMpXG5cbiAgICAgIHJldHVybiB0cnVlXG59XG5cbm15QXBwID0gbmV3IGNvY29zMmRBcHAoKVxuIiwiY2xhc3MgQnJhaW5cbiAgY29uc3RydWN0b3I6IChAdGlsZXMsIEBhbmltRnJhbWUpIC0+XG4gICAgQGZhY2luZ1JpZ2h0ID0gdHJ1ZVxuICAgIEBjZCA9IDBcbiAgICBAaW50ZXJwRnJhbWVzID0gW11cbiAgICBAcGF0aCA9IFtdXG5cbiAgbW92ZTogKGd4LCBneSwgZnJhbWVzKSAtPlxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxuICAgIGR4ID0gKEB4IC0gZ3gpICogY2MudW5pdFNpemVcbiAgICBkeSA9IChAeSAtIGd5KSAqIGNjLnVuaXRTaXplXG4gICAgQGZhY2luZ1JpZ2h0ID0gKGR4IDwgMClcbiAgICBpID0gZnJhbWVzLmxlbmd0aFxuICAgIGZvciBmIGluIGZyYW1lc1xuICAgICAgYW5pbUZyYW1lID0ge1xuICAgICAgICB4OiBkeCAqIGkgLyBmcmFtZXMubGVuZ3RoXG4gICAgICAgIHk6IGR5ICogaSAvIGZyYW1lcy5sZW5ndGhcbiAgICAgICAgYW5pbUZyYW1lOiBmXG4gICAgICB9XG4gICAgICBAaW50ZXJwRnJhbWVzLnB1c2ggYW5pbUZyYW1lXG4gICAgICBpLS1cblxuICAgIGNjLmdhbWUuc2V0VHVybkZyYW1lcyhmcmFtZXMubGVuZ3RoKVxuXG4gICAgIyBJbW1lZGlhdGVseSBtb3ZlLCBvbmx5IHByZXRlbmQgdG8gYW5pbWF0ZSB0aGVyZSBvdmVyIHRoZSBuZXh0IGZyYW1lcy5sZW5ndGggZnJhbWVzXG4gICAgQHggPSBneFxuICAgIEB5ID0gZ3lcblxuICB3YWxrUGF0aDogKEBwYXRoKSAtPlxuXG4gIGNyZWF0ZVNwcml0ZTogLT5cbiAgICBzID0gY2MuU3ByaXRlLmNyZWF0ZSBAdGlsZXMucmVzb3VyY2VcbiAgICBAdXBkYXRlU3ByaXRlKHMpXG4gICAgcmV0dXJuIHNcblxuICB1cGRhdGVTcHJpdGU6IChzcHJpdGUpIC0+XG4gICAgeCA9IEB4ICogY2MudW5pdFNpemVcbiAgICB5ID0gQHkgKiBjYy51bml0U2l6ZVxuICAgIGFuaW1GcmFtZSA9IEBhbmltRnJhbWVcbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aFxuICAgICAgZnJhbWUgPSBAaW50ZXJwRnJhbWVzLnNwbGljZSgwLCAxKVswXVxuICAgICAgeCArPSBmcmFtZS54XG4gICAgICB5ICs9IGZyYW1lLnlcbiAgICAgIGFuaW1GcmFtZSA9IGZyYW1lLmFuaW1GcmFtZVxuICAgICMgZWxzZVxuICAgICMgICBhbmltRnJhbWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKVxuICAgIHNwcml0ZS5zZXRUZXh0dXJlUmVjdChAdGlsZXMucmVjdChhbmltRnJhbWUpKVxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKVxuICAgIHhhbmNob3IgPSAxLjBcbiAgICB4c2NhbGUgPSAtMS4wXG4gICAgaWYgQGZhY2luZ1JpZ2h0XG4gICAgICB4YW5jaG9yID0gMFxuICAgICAgeHNjYWxlID0gMS4wXG4gICAgc3ByaXRlLnNldFNjYWxlWCh4c2NhbGUpXG4gICAgc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoeGFuY2hvciwgMCkpXG5cbiAgdGFrZVN0ZXA6IC0+XG4gICAgaWYgQGludGVycEZyYW1lcy5sZW5ndGggPT0gMFxuICAgICAgaWYgQHBhdGgubGVuZ3RoID4gMFxuICAgICAgICBzdGVwID0gQHBhdGguc3BsaWNlKDAsIDEpWzBdXG4gICAgICAgICMgY2MubG9nIFwidGFraW5nIHN0ZXAgdG8gI3tzdGVwLnh9LCAje3N0ZXAueX1cIlxuICAgICAgICBAbW92ZShzdGVwLngsIHN0ZXAueSwgWzIsMyw0XSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICB0aWNrOiAoZWxhcHNlZFR1cm5zKSAtPlxuICAgIGlmIEBjZCA+IDBcbiAgICAgIEBjZCAtPSBlbGFwc2VkVHVybnMgaWYgQGNkID4gMFxuICAgICAgQGNkID0gMCBpZiBAY2QgPCAwXG4gICAgaWYgQGNkID09IDBcbiAgICAgIEB0aGluaygpXG5cbiAgdGhpbms6IC0+XG4gICAgY2MubG9nIFwidGhpbmsgbm90IGltcGxlbWVudGVkIVwiXG5cbm1vZHVsZS5leHBvcnRzID0gQnJhaW5cbiIsInJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcbkJyYWluID0gcmVxdWlyZSAnYnJhaW4vYnJhaW4nXG5QYXRoZmluZGVyID0gcmVxdWlyZSAnd29ybGQvcGF0aGZpbmRlcidcblRpbGVzaGVldCA9IHJlcXVpcmUgJ2dmeC90aWxlc2hlZXQnXG5cbmNsYXNzIFBsYXllciBleHRlbmRzIEJyYWluXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICBAYW5pbUZyYW1lID0gMFxuICAgIGZvciBrLHYgb2YgZGF0YVxuICAgICAgdGhpc1trXSA9IHZcbiAgICBzdXBlciByZXNvdXJjZXMudGlsZXNoZWV0cy5wbGF5ZXIsIEBhbmltRnJhbWVcblxuICB3YWxrUGF0aDogKEBwYXRoKSAtPlxuXG4gIHRoaW5rOiAtPlxuICAgIGlmIEB0YWtlU3RlcCgpXG4gICAgICBAY2QgPSA1MFxuXG4gIGFjdDogKGd4LCBneSkgLT5cbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcbiAgICBwYXRoID0gcGF0aGZpbmRlci5jYWxjKEB4LCBAeSwgZ3gsIGd5KVxuICAgIEB3YWxrUGF0aChwYXRoKVxuICAgIGNjLmxvZyBcInBhdGggaXMgI3twYXRoLmxlbmd0aH0gbG9uZ1wiXG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIHNjYWxlOlxuICAgIG1pbjogMS41XG4gICAgbWF4OiA4LjBcbiAgQ09DT1MyRF9ERUJVRzoyICMgMCB0byB0dXJuIGRlYnVnIG9mZiwgMSBmb3IgYmFzaWMgZGVidWcsIGFuZCAyIGZvciBmdWxsIGRlYnVnXG4gIGJveDJkOmZhbHNlXG4gIGNoaXBtdW5rOmZhbHNlXG4gIHNob3dGUFM6dHJ1ZVxuICBmcmFtZVJhdGU6NjBcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxuICByZW5kZXJNb2RlOjBcbiAgdGFnOidnYW1lQ2FudmFzJ1xuICBhcHBGaWxlczogW1xuICAgICdidW5kbGUuanMnXG4gIF1cbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGN0b3IoKVxuICAgIEBpbml0KClcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBjYy5TY2VuZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY3RvcigpXG4gICAgQGluaXQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIExheWVyOiBMYXllclxuICBTY2VuZTogU2NlbmVcbiIsIlxuIyBUaGlzIGlzIGZ1Y2tpbmcgdHJhZ2ljLlxuUElYRUxfRlVER0VfRkFDVE9SID0gMC41ICAjIGhvdyBtYW55IHBpeGVscyB0byByZW1vdmUgZnJvbSB0aGUgZWRnZSB0byByZW1vdmUgYmxlZWRcblNDQUxFX0ZVREdFX0ZBQ1RPUiA9IDAuMDIgICMgYWRkaXRpb25hbCBzcHJpdGUgc2NhbGUgdG8gZW5zdXJlIHByb3BlciB0aWxpbmdcblxuVGlsZXNoZWV0QmF0Y2hOb2RlID0gY2MuU3ByaXRlQmF0Y2hOb2RlLmV4dGVuZCB7XG4gIGluaXQ6IChmaWxlSW1hZ2UsIGNhcGFjaXR5KSAtPlxuICAgIEBfc3VwZXIoZmlsZUltYWdlLCBjYXBhY2l0eSlcblxuICBjcmVhdGVTcHJpdGU6ICh0aWxlSW5kZXgsIHgsIHkpIC0+XG4gICAgc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZVdpdGhUZXh0dXJlKEBnZXRUZXh0dXJlKCksIEB0aWxlc2hlZXQucmVjdCh0aWxlSW5kZXgpKVxuICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxuICAgIHNwcml0ZS5zZXRQb3NpdGlvbih4LCB5KVxuICAgIHNwcml0ZS5zZXRTY2FsZShAdGlsZXNoZWV0LmFkanVzdGVkU2NhbGUueCwgQHRpbGVzaGVldC5hZGp1c3RlZFNjYWxlLnkpXG4gICAgQGFkZENoaWxkIHNwcml0ZVxuICAgIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgVGlsZXNoZWV0XG4gIGNvbnN0cnVjdG9yOiAoQHJlc291cmNlLCBAd2lkdGgsIEBoZWlnaHQsIEBzdHJpZGUpIC0+XG4gICAgQGFkanVzdGVkU2NhbGUgPVxuICAgICAgeDogMSArIFNDQUxFX0ZVREdFX0ZBQ1RPUiArIChQSVhFTF9GVURHRV9GQUNUT1IgLyBAd2lkdGgpXG4gICAgICB5OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEBoZWlnaHQpXG5cbiAgcmVjdDogKHYpIC0+XG4gICAgeSA9IE1hdGguZmxvb3IodiAvIEBzdHJpZGUpXG4gICAgeCA9IHYgJSBAc3RyaWRlXG4gICAgcmV0dXJuIGNjLnJlY3QoeCAqIEB3aWR0aCwgeSAqIEBoZWlnaHQsIEB3aWR0aCAtIFBJWEVMX0ZVREdFX0ZBQ1RPUiwgQGhlaWdodCAtIFBJWEVMX0ZVREdFX0ZBQ1RPUilcblxuICBjcmVhdGVCYXRjaE5vZGU6IChjYXBhY2l0eSkgLT5cbiAgICBiYXRjaE5vZGUgPSBuZXcgVGlsZXNoZWV0QmF0Y2hOb2RlKClcbiAgICBiYXRjaE5vZGUudGlsZXNoZWV0ID0gdGhpc1xuICAgIGJhdGNoTm9kZS5pbml0KEByZXNvdXJjZSwgY2FwYWNpdHkpXG4gICAgcmV0dXJuIGJhdGNoTm9kZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxuIiwicmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5JbnRyb01vZGUgPSByZXF1aXJlICdtb2RlL2ludHJvJ1xyXG5HYW1lTW9kZSA9IHJlcXVpcmUgJ21vZGUvZ2FtZSdcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGxheWVyID0gcmVxdWlyZSAnYnJhaW4vcGxheWVyJ1xyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQHR1cm5GcmFtZXMgPSAwXHJcbiAgICBAbW9kZXMgPVxyXG4gICAgICBpbnRybzogbmV3IEludHJvTW9kZSgpXHJcbiAgICAgIGdhbWU6IG5ldyBHYW1lTW9kZSgpXHJcblxyXG4gIG5ld0Zsb29yOiAtPlxyXG4gICAgZmxvb3JnZW4uZ2VuZXJhdGUoKVxyXG5cclxuICBjdXJyZW50Rmxvb3I6IC0+XHJcbiAgICByZXR1cm4gQHN0YXRlLmZsb29yc1tAc3RhdGUucGxheWVyLmZsb29yXVxyXG5cclxuICBuZXdHYW1lOiAtPlxyXG4gICAgY2MubG9nIFwibmV3R2FtZVwiXHJcbiAgICBAc3RhdGUgPSB7XHJcbiAgICAgIHJ1bm5pbmc6IGZhbHNlXHJcbiAgICAgIHBsYXllcjogbmV3IFBsYXllcih7XHJcbiAgICAgICAgeDogNDRcclxuICAgICAgICB5OiA0OVxyXG4gICAgICAgIGZsb29yOiAxXHJcbiAgICAgIH0pXHJcbiAgICAgIGZsb29yczogW1xyXG4gICAgICAgIHt9XHJcbiAgICAgICAgQG5ld0Zsb29yKClcclxuICAgICAgXVxyXG4gICAgfVxyXG5cclxuICBzZXRUdXJuRnJhbWVzOiAoY291bnQpIC0+XHJcbiAgICBpZiBAdHVybkZyYW1lcyA8IGNvdW50XHJcbiAgICAgIEB0dXJuRnJhbWVzID0gY291bnRcclxuXHJcbmlmIG5vdCBjYy5nYW1lXHJcbiAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXHJcbiAgY2MudW5pdFNpemUgPSAxNlxyXG4gIGNjLndpZHRoID0gc2l6ZS53aWR0aFxyXG4gIGNjLmhlaWdodCA9IHNpemUuaGVpZ2h0XHJcbiAgY2MuZ2FtZSA9IG5ldyBHYW1lKClcclxuIiwiTW9kZSA9IHJlcXVpcmUgJ2Jhc2UvbW9kZSdcclxuY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbmZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xyXG5cclxuY2xhc3MgR2FtZU1vZGUgZXh0ZW5kcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcihcIkdhbWVcIilcclxuXHJcbiAgdGlsZUZvckdyaWRWYWx1ZTogKHYpIC0+XHJcbiAgICBzd2l0Y2hcclxuICAgICAgd2hlbiB2ID09IGZsb29yZ2VuLldBTEwgdGhlbiAxNlxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uRE9PUiB0aGVuIDVcclxuICAgICAgd2hlbiB2ID49IGZsb29yZ2VuLkZJUlNUX1JPT01fSUQgdGhlbiAxOFxyXG4gICAgICBlbHNlIDBcclxuXHJcbiAgZ2Z4Q2xlYXI6IC0+XHJcbiAgICBpZiBAZ2Z4P1xyXG4gICAgICBpZiBAZ2Z4LmZsb29yTGF5ZXI/XHJcbiAgICAgICAgQHJlbW92ZSBAZ2Z4LmZsb29yTGF5ZXJcclxuICAgIEBnZnggPSB7fVxyXG5cclxuICBnZnhSZW5kZXJGbG9vcjogLT5cclxuICAgIGZsb29yID0gY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKVxyXG5cclxuICAgIEBnZnguZmxvb3JMYXllciA9IG5ldyBjYy5MYXllcigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuICAgIEBnZnguZmxvb3JCYXRjaE5vZGUgPSByZXNvdXJjZXMudGlsZXNoZWV0cy50aWxlczAuY3JlYXRlQmF0Y2hOb2RlKChmbG9vci53aWR0aCAqIGZsb29yLmhlaWdodCkgLyAyKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZnguZmxvb3JCYXRjaE5vZGUsIC0xXHJcbiAgICBmb3IgaiBpbiBbMC4uLmZsb29yLmhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5mbG9vci53aWR0aF1cclxuICAgICAgICB2ID0gZmxvb3IuZ2V0KGksIGopXHJcbiAgICAgICAgaWYgdiAhPSAwXHJcbiAgICAgICAgICBAZ2Z4LmZsb29yQmF0Y2hOb2RlLmNyZWF0ZVNwcml0ZShAdGlsZUZvckdyaWRWYWx1ZSh2KSwgaSAqIGNjLnVuaXRTaXplLCBqICogY2MudW5pdFNpemUpXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKGNvbmZpZy5zY2FsZS5taW4pXHJcbiAgICBAYWRkIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeENlbnRlck1hcCgpXHJcblxyXG4gIGdmeFBsYWNlTWFwOiAobWFwWCwgbWFwWSwgc2NyZWVuWCwgc2NyZWVuWSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHggPSBzY3JlZW5YIC0gKG1hcFggKiBzY2FsZSlcclxuICAgIHkgPSBzY3JlZW5ZIC0gKG1hcFkgKiBzY2FsZSlcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbih4LCB5KVxyXG5cclxuICBnZnhDZW50ZXJNYXA6IC0+XHJcbiAgICBjZW50ZXIgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpLmJib3guY2VudGVyKClcclxuICAgIEBnZnhQbGFjZU1hcChjZW50ZXIueCAqIGNjLnVuaXRTaXplLCBjZW50ZXIueSAqIGNjLnVuaXRTaXplLCBjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpXHJcblxyXG4gIGdmeFNjcmVlblRvTWFwQ29vcmRzOiAoeCwgeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiAoeCAtIHBvcy54KSAvIHNjYWxlXHJcbiAgICAgIHk6ICh5IC0gcG9zLnkpIC8gc2NhbGVcclxuICAgIH1cclxuXHJcbiAgZ2Z4UmVuZGVyUGxheWVyOiAtPlxyXG4gICAgQGdmeC5wbGF5ZXIgPSB7fVxyXG4gICAgQGdmeC5wbGF5ZXIuc3ByaXRlID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuY3JlYXRlU3ByaXRlKClcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LnBsYXllci5zcHJpdGUsIDBcclxuXHJcbiAgZ2Z4QWRqdXN0TWFwU2NhbGU6IChkZWx0YSkgLT5cclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHNjYWxlICs9IGRlbHRhXHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5tYXggaWYgc2NhbGUgPiBjb25maWcuc2NhbGUubWF4XHJcbiAgICBzY2FsZSA9IGNvbmZpZy5zY2FsZS5taW4gaWYgc2NhbGUgPCBjb25maWcuc2NhbGUubWluXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoc2NhbGUpXHJcblxyXG4gIGdmeFJlbmRlclBhdGg6IChwYXRoKSAtPlxyXG4gICAgaWYgQGdmeC5wYXRoQmF0Y2hOb2RlP1xyXG4gICAgICBAZ2Z4LmZsb29yTGF5ZXIucmVtb3ZlQ2hpbGQgQGdmeC5wYXRoQmF0Y2hOb2RlXHJcbiAgICByZXR1cm4gaWYgcGF0aC5sZW5ndGggPT0gMFxyXG4gICAgQGdmeC5wYXRoQmF0Y2hOb2RlID0gcmVzb3VyY2VzLnRpbGVzaGVldHMudGlsZXMwLmNyZWF0ZUJhdGNoTm9kZShwYXRoLmxlbmd0aClcclxuICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBAZ2Z4LnBhdGhCYXRjaE5vZGVcclxuICAgIGZvciBwIGluIHBhdGhcclxuICAgICAgc3ByaXRlID0gQGdmeC5wYXRoQmF0Y2hOb2RlLmNyZWF0ZVNwcml0ZSgxNywgcC54ICogY2MudW5pdFNpemUsIHAueSAqIGNjLnVuaXRTaXplKVxyXG4gICAgICBzcHJpdGUuc2V0T3BhY2l0eSgxMjgpXHJcblxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24ocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIEBnZnhBZGp1c3RNYXBTY2FsZShkZWx0YSAvIDIwMClcclxuICAgIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgICBjYy5nYW1lLm5ld0dhbWUoKVxyXG4gICAgQGdmeENsZWFyKClcclxuICAgIEBnZnhSZW5kZXJGbG9vcigpXHJcbiAgICBAZ2Z4UmVuZGVyUGxheWVyKClcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0U2NoZWR1bGVyKCkuc2NoZWR1bGVDYWxsYmFja0ZvclRhcmdldCh0aGlzLCBAdXBkYXRlLCAxIC8gNjAuMCwgY2MuUkVQRUFUX0ZPUkVWRVIsIDAsIGZhbHNlKVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgZ3JpZFggPSBNYXRoLmZsb29yKHBvcy54IC8gY2MudW5pdFNpemUpXHJcbiAgICBncmlkWSA9IE1hdGguZmxvb3IocG9zLnkgLyBjYy51bml0U2l6ZSlcclxuXHJcbiAgICAjIGlmIG5vdCBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICMgICBjYy5nYW1lLnN0YXRlLnBsYXllci5hY3QoZ3JpZFgsIGdyaWRZKVxyXG4gICAgIyAgIGNjLmdhbWUuc3RhdGUucnVubmluZyA9IHRydWVcclxuICAgICMgICBjYy5sb2cgXCJydW5uaW5nXCJcclxuXHJcbiAgICBwYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIoY2MuZ2FtZS5jdXJyZW50Rmxvb3IoKSwgMClcclxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCwgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueSwgZ3JpZFgsIGdyaWRZKVxyXG4gICAgQGdmeFJlbmRlclBhdGgocGF0aClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBjYy5nYW1lLnN0YXRlLnBsYXllci51cGRhdGVTcHJpdGUoQGdmeC5wbGF5ZXIuc3ByaXRlKVxyXG5cclxuICAgIGlmIGNjLmdhbWUudHVybkZyYW1lcyA+IDBcclxuICAgICAgY2MuZ2FtZS50dXJuRnJhbWVzLS1cclxuICAgIGVsc2VcclxuICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nXHJcbiAgICAgICAgbWluaW11bUNEID0gMTAwMFxyXG4gICAgICAgIGlmIG1pbmltdW1DRCA+IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgICBtaW5pbXVtQ0QgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jZFxyXG4gICAgICAgICMgVE9ETzogY2hlY2sgY2Qgb2YgYWxsIE5QQ3Mgb24gdGhlIGZsb29yIGFnYWluc3QgdGhlIG1pbmltdW1DRFxyXG4gICAgICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnRpY2sobWluaW11bUNEKVxyXG4gICAgICAgIGlmIGNjLmdhbWUuc3RhdGUucGxheWVyLmNkID09IDAgIyBXZSBqdXN0IHJhbiwgeWV0IGRpZCBub3RoaW5nXHJcbiAgICAgICAgICBjYy5nYW1lLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZVxyXG4gICAgICAgICAgY2MubG9nIFwibm90IHJ1bm5pbmdcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTW9kZVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuXG5jbGFzcyBJbnRyb01vZGUgZXh0ZW5kcyBNb2RlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKFwiSW50cm9cIilcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuaW1hZ2VzLnNwbGFzaHNjcmVlblxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxuICAgIEBhZGQgQHNwcml0ZVxuXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXG4iLCJUaWxlc2hlZXQgPSByZXF1aXJlIFwiZ2Z4L3RpbGVzaGVldFwiXHJcblxyXG5pbWFnZXMgPVxyXG4gIHNwbGFzaHNjcmVlbjogJ3Jlcy9zcGxhc2hzY3JlZW4ucG5nJ1xyXG4gIHRpbGVzMDogJ3Jlcy90aWxlczAucG5nJ1xyXG4gIHBsYXllcjogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxudGlsZXNoZWV0cyA9XHJcbiAgdGlsZXMwOiBuZXcgVGlsZXNoZWV0KGltYWdlcy50aWxlczAsIDE2LCAxNiwgMTYpXHJcbiAgcGxheWVyOiBuZXcgVGlsZXNoZWV0KGltYWdlcy5wbGF5ZXIsIDEyLCAxNCwgMTgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgaW1hZ2VzOiBpbWFnZXNcclxuICB0aWxlc2hlZXRzOiB0aWxlc2hlZXRzXHJcbiAgY29jb3NQcmVsb2FkTGlzdDogKHtzcmM6IHZ9IGZvciBrLCB2IG9mIGltYWdlcylcclxuIiwiZ2Z4ID0gcmVxdWlyZSAnZ2Z4J1xucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuXG5jbGFzcyBGbG9vciBleHRlbmRzIGdmeC5MYXllclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigpXG4gICAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlbiwgY2MucmVjdCg0NTAsMzAwLDE2LDE2KVxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxuICAgIEBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcbiAgICBAYWRkQ2hpbGQoQHNwcml0ZSwgMClcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXG4gICAgQHNldFBvc2l0aW9uKGNjLnAoMTAwLCAxMDApKVxuICAgIEBzZXRTY2FsZSgxMCwgMTApXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxuXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XG4gICAgaWYgdG91Y2hlc1xuICAgICAgeCA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS54XG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xuc2VlZFJhbmRvbSA9IHJlcXVpcmUgJ3NlZWQtcmFuZG9tJ1xuXG5TSEFQRVMgPSBbXG4gIFwiXCJcIlxuICAjIyMjIyMjIyMjIyNcbiAgIy4uLi4uLi4uLi4jXG4gICMuLi4uLi4uLi4uI1xuICAjIyMjIyMjIy4uLiNcbiAgICAgICAgICMuLi4jXG4gICAgICAgICAjLi4uI1xuICAgICAgICAgIy4uLiNcbiAgICAgICAgICMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgIyMjIyMjIyMjIyMjXG4gICMuLi4uLi4uLi4uI1xuICAjLi4uLi4uLi4uLiNcbiAgIy4uLiMjIyMjIyMjXG4gICMuLi4jXG4gICMuLi4jXG4gICMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgIyMjIyNcbiAgIy4uLiNcbiAgIy4uLiMjIyMjIyMjXG4gICMuLi4uLi4uLi4uI1xuICAjLi4uLi4uLi4uLiNcbiAgIyMjIyMjIyMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgICAgICMjIyNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgIyMjIyMuLiNcbiAgIy4uLi4uLiNcbiAgIy4uLi4uLiNcbiAgIy4uLi4uLiNcbiAgIyMjIyMjIyNcbiAgXCJcIlwiXG5dXG5cbkVNUFRZID0gMFxuV0FMTCA9IDFcbkRPT1IgPSAyXG5GSVJTVF9ST09NX0lEID0gNVxuXG52YWx1ZVRvQ29sb3IgPSAocCwgdikgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXG4gICAgd2hlbiB2ID09IERPT1IgdGhlbiByZXR1cm4gcC5jb2xvciAxMjgsIDEyOCwgMTI4XG4gICAgd2hlbiB2ID49IEZJUlNUX1JPT01fSUQgdGhlbiByZXR1cm4gcC5jb2xvciAwLCAwLCA1ICsgTWF0aC5taW4oMjQwLCAxNSArICh2ICogMikpXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcblxuY2xhc3MgUmVjdFxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxuXG4gIHc6IC0+IEByIC0gQGxcbiAgaDogLT4gQGIgLSBAdFxuICBhcmVhOiAtPiBAdygpICogQGgoKVxuICBhc3BlY3Q6IC0+XG4gICAgaWYgQGgoKSA+IDBcbiAgICAgIHJldHVybiBAdygpIC8gQGgoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiAwXG5cbiAgc3F1YXJlbmVzczogLT5cbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXG5cbiAgY2VudGVyOiAtPlxuICAgIHJldHVybiB7XG4gICAgICB4OiBNYXRoLmZsb29yKChAciArIEBsKSAvIDIpXG4gICAgICB5OiBNYXRoLmZsb29yKChAYiArIEB0KSAvIDIpXG4gICAgfVxuXG4gIGNsb25lOiAtPlxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcblxuICBleHBhbmQ6IChyKSAtPlxuICAgIGlmIEBhcmVhKClcbiAgICAgIEBsID0gci5sIGlmIEBsID4gci5sXG4gICAgICBAdCA9IHIudCBpZiBAdCA+IHIudFxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcbiAgICAgIEBiID0gci5iIGlmIEBiIDwgci5iXG4gICAgZWxzZVxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXG4gICAgICBAbCA9IHIubFxuICAgICAgQHQgPSByLnRcbiAgICAgIEByID0gci5yXG4gICAgICBAYiA9IHIuYlxuXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcblxuY2xhc3MgUm9vbVRlbXBsYXRlXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxuICAgIEBncmlkID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIEBncmlkW2ldID0gW11cbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgICAgQGdyaWRbaV1bal0gPSBFTVBUWVxuXG4gICAgQGdlbmVyYXRlU2hhcGUoKVxuXG4gIGdlbmVyYXRlU2hhcGU6IC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIEBzZXQoaSwgMCwgV0FMTClcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgQHNldCgwLCBqLCBXQUxMKVxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxuXG4gIHJlY3Q6ICh4LCB5KSAtPlxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxuXG4gIHNldDogKGksIGosIHYpIC0+XG4gICAgQGdyaWRbaV1bal0gPSB2XG5cbiAgZ2V0OiAobWFwLCB4LCB5LCBpLCBqKSAtPlxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxuICAgICAgdiA9IEBncmlkW2ldW2pdXG4gICAgICByZXR1cm4gdiBpZiB2ICE9IEVNUFRZXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXG5cbiAgcGxhY2U6IChtYXAsIHgsIHkpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIHYgPSBAZ3JpZFtpXVtqXVxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxuXG4gIGZpdHM6IChtYXAsIHgsIHkpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIG12ID0gbWFwLmdldCh4ICsgaSwgeSArIGopXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cbiAgICAgICAgaWYgbXYgIT0gRU1QVFkgYW5kIHN2ICE9IEVNUFRZIGFuZCAobXYgIT0gV0FMTCBvciBzdiAhPSBXQUxMKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgZG9vckVsaWdpYmxlOiAobWFwLCB4LCB5LCBpLCBqKSAtPlxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXG4gICAgcm9vbXNTZWVuID0ge31cbiAgICB2YWx1ZXMgPSBbXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSAtIDEsIGopXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiArIDEpXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXG4gICAgXVxuICAgIGZvciB2IGluIHZhbHVlc1xuICAgICAgaWYgdlxuICAgICAgICBpZiB2ID09IDFcbiAgICAgICAgICB3YWxsTmVpZ2hib3JzKytcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcbiAgICAgICAgICByb29tc1NlZW5bdl0gPSAxXG4gICAgcm9vbXMgPSBPYmplY3Qua2V5cyhyb29tc1NlZW4pLnNvcnQgKGEsIGIpIC0+IGEtYlxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxuICAgIHJvb21Db3VudCA9IHJvb21zLmxlbmd0aFxuICAgIGlmICh3YWxsTmVpZ2hib3JzID09IDIpIGFuZCAocm9vbUNvdW50ID09IDIpIGFuZCAoQHJvb21pZCBpbiByb29tcylcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcbiAgICAgICAgcmV0dXJuIHJvb21zXG4gICAgcmV0dXJuIFstMSwgLTFdXG5cbiAgZG9vckxvY2F0aW9uOiAobWFwLCB4LCB5KSAtPlxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgICByb29tcyA9IEBkb29yRWxpZ2libGUobWFwLCB4LCB5LCBpLCBqKVxuICAgICAgICBpZiByb29tc1swXSAhPSAtMSBhbmQgQHJvb21pZCBpbiByb29tc1xuICAgICAgICAgIHJldHVybiBbaSwgal1cbiAgICByZXR1cm4gWy0xLCAtMV1cblxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxuICAgIGJib3hUZW1wID0gbWFwLmJib3guY2xvbmUoKVxuICAgIGJib3hUZW1wLmV4cGFuZCBAcmVjdCh4LCB5KVxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cblxuICBmaW5kQmVzdFNwb3Q6IChtYXApIC0+XG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxuICAgIG1pbkFyZWEgPSBtYXAud2lkdGggKiBtYXAuaGVpZ2h0XG4gICAgbWluWCA9IC0xXG4gICAgbWluWSA9IC0xXG4gICAgZG9vckxvY2F0aW9uID0gWy0xLCAtMV1cbiAgICBzZWFyY2hMID0gbWFwLmJib3gubCAtIEB3aWR0aFxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXG4gICAgc2VhcmNoVCA9IG1hcC5iYm94LnQgLSBAaGVpZ2h0XG4gICAgc2VhcmNoQiA9IG1hcC5iYm94LmJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cbiAgICAgIGZvciBqIGluIFtzZWFyY2hUIC4uLiBzZWFyY2hCXVxuICAgICAgICBpZiBAZml0cyhtYXAsIGksIGopXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXG4gICAgICAgICAgaWYgYXJlYSA8PSBtaW5BcmVhIGFuZCBzcXVhcmVuZXNzIDw9IG1pblNxdWFyZW5lc3NcbiAgICAgICAgICAgIGxvY2F0aW9uID0gQGRvb3JMb2NhdGlvbiBtYXAsIGksIGpcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXG4gICAgICAgICAgICAgIGRvb3JMb2NhdGlvbiA9IGxvY2F0aW9uXG4gICAgICAgICAgICAgIG1pbkFyZWEgPSBhcmVhXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXG4gICAgICAgICAgICAgIG1pblggPSBpXG4gICAgICAgICAgICAgIG1pblkgPSBqXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXG5cbmNsYXNzIFNoYXBlUm9vbVRlbXBsYXRlIGV4dGVuZHMgUm9vbVRlbXBsYXRlXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cbiAgICBAbGluZXMgPSBzaGFwZS5zcGxpdChcIlxcblwiKVxuICAgIHcgPSAwXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXG4gICAgICB3ID0gTWF0aC5tYXgodywgbGluZS5sZW5ndGgpXG4gICAgQHdpZHRoID0gd1xuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXG4gICAgc3VwZXIgQHdpZHRoLCBAaGVpZ2h0LCByb29taWRcblxuICBnZW5lcmF0ZVNoYXBlOiAtPlxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxuICAgIGkgPSAwXG4gICAgaiA9IDBcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcbiAgICAgIGZvciBjIGluIGxpbmUuc3BsaXQoXCJcIilcbiAgICAgICAgdiA9IHN3aXRjaCBjXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXG4gICAgICAgICAgd2hlbiAnIycgdGhlbiBXQUxMXG4gICAgICAgICAgZWxzZSAwXG4gICAgICAgIGlmIHZcbiAgICAgICAgICBAc2V0KGksIGosIHYpXG4gICAgICAgIGkrK1xuICAgICAgaisrXG4gICAgICBpID0gMFxuXG5jbGFzcyBSb29tXG4gIGNvbnN0cnVjdG9yOiAoQHJlY3QpIC0+XG4gICAgIyBjb25zb2xlLmxvZyBcInJvb20gY3JlYXRlZCAje0ByZWN0fVwiXG5cbmNsYXNzIE1hcFxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHNlZWQpIC0+XG4gICAgQHJhbmRSZXNldCgpXG4gICAgQGdyaWQgPSBbXVxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgQGdyaWRbaV0gPSBbXVxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgICBAZ3JpZFtpXVtqXSA9XG4gICAgICAgICAgdHlwZTogRU1QVFlcbiAgICAgICAgICB4OiBpXG4gICAgICAgICAgeTogalxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxuICAgIEByb29tcyA9IFtdXG5cbiAgcmFuZFJlc2V0OiAtPlxuICAgIEBybmcgPSBzZWVkUmFuZG9tKEBzZWVkKVxuXG4gIHJhbmQ6ICh2KSAtPlxuICAgIHJldHVybiBNYXRoLmZsb29yKEBybmcoKSAqIHYpXG5cbiAgc2V0OiAoaSwgaiwgdikgLT5cbiAgICBAZ3JpZFtpXVtqXS50eXBlID0gdlxuXG4gIGdldDogKGksIGopIC0+XG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XG4gICAgICByZXR1cm4gQGdyaWRbaV1bal0udHlwZVxuICAgIHJldHVybiAwXG5cbiAgYWRkUm9vbTogKHJvb21UZW1wbGF0ZSwgeCwgeSkgLT5cbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxuICAgIHJvb21UZW1wbGF0ZS5wbGFjZSB0aGlzLCB4LCB5XG4gICAgciA9IHJvb21UZW1wbGF0ZS5yZWN0KHgsIHkpXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxuICAgIEBiYm94LmV4cGFuZChyKVxuICAgICMgY29uc29sZS5sb2cgXCJuZXcgbWFwIGJib3ggI3tAYmJveH1cIlxuXG4gIHJhbmRvbVJvb21UZW1wbGF0ZTogKHJvb21pZCkgLT5cbiAgICByID0gQHJhbmQoMTAwKVxuICAgIHN3aXRjaFxuICAgICAgd2hlbiAgMCA8IHIgPCAxMCB0aGVuIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDMsIDUgKyBAcmFuZCgxMCksIHJvb21pZCAgICAgICAgICAgICAgICAgICMgdmVydGljYWwgY29ycmlkb3JcbiAgICAgIHdoZW4gMTAgPCByIDwgMjAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA1ICsgQHJhbmQoMTApLCAzLCByb29taWQgICAgICAgICAgICAgICAgICAjIGhvcml6b250YWwgY29ycmlkb3JcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xuICAgIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDQgKyBAcmFuZCg1KSwgNCArIEByYW5kKDUpLCByb29taWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgZ2VuZXJpYyByZWN0YW5ndWxhciByb29tXG5cbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxuICAgIHJvb21UZW1wbGF0ZSA9IEByYW5kb21Sb29tVGVtcGxhdGUgcm9vbWlkXG4gICAgaWYgQHJvb21zLmxlbmd0aCA9PSAwXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXG4gICAgICB5ID0gTWF0aC5mbG9vcigoQGhlaWdodCAvIDIpIC0gKHJvb21UZW1wbGF0ZS5oZWlnaHQgLyAyKSlcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxuICAgIGVsc2VcbiAgICAgIFt4LCB5LCBkb29yTG9jYXRpb25dID0gcm9vbVRlbXBsYXRlLmZpbmRCZXN0U3BvdCh0aGlzKVxuICAgICAgaWYgeCA8IDBcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByb29tVGVtcGxhdGUuc2V0IGRvb3JMb2NhdGlvblswXSwgZG9vckxvY2F0aW9uWzFdLCAyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGdlbmVyYXRlUm9vbXM6IChjb3VudCkgLT5cbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxuICAgICAgcm9vbWlkID0gRklSU1RfUk9PTV9JRCArIGlcblxuICAgICAgYWRkZWQgPSBmYWxzZVxuICAgICAgd2hpbGUgbm90IGFkZGVkXG4gICAgICAgIGFkZGVkID0gQGdlbmVyYXRlUm9vbSByb29taWRcblxuZ2VuZXJhdGUgPSAtPlxuICBtYXAgPSBuZXcgTWFwIDgwLCA4MCwgMTBcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXG4gIHJldHVybiBtYXBcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW5lcmF0ZTogZ2VuZXJhdGVcbiAgRU1QVFk6IEVNUFRZXG4gIFdBTEw6IFdBTExcbiAgRE9PUjpET09SXG4gIEZJUlNUX1JPT01fSUQ6IEZJUlNUX1JPT01fSURcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXHJcblxyXG5jbGFzcyBCaW5hcnlIZWFwXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcblxyXG5jbGFzcyBGYWtlSGVhcFxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGxpc3QgPSBbXVxyXG5cclxuICBzb3J0TGlzdDogLT5cclxuICAgIEBsaXN0LnNvcnQgKGEsIGIpIC0+XHJcbiAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZVxyXG5cclxuICBwdXNoOiAobikgLT5cclxuICAgIEBsaXN0LnB1c2gobilcclxuICAgIEBzb3J0TGlzdCgpXHJcblxyXG4gIHNpemU6IC0+XHJcbiAgICByZXR1cm4gQGxpc3QubGVuZ3RoXHJcblxyXG4gIHBvcDogLT5cclxuICAgIHJldHVybiBAbGlzdC5zaGlmdCgpXHJcblxyXG4gIHJlc2NvcmU6IChuKSAtPlxyXG4gICAgQHNvcnRMaXN0KClcclxuXHJcbmNsYXNzIERpamtzdHJhXHJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IpIC0+XHJcbiAgICBmb3IgeCBpbiBbMC4uLkBmbG9vci53aWR0aF1cclxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxyXG4gICAgICAgIG5vZGUgPSBAZmxvb3IuZ3JpZFt4XVt5XVxyXG4gICAgICAgIG5vZGUuZGlzdGFuY2UgPSA5OTk5OVxyXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXHJcbiAgICAgICAgbm9kZS5oZWFwZWQgPSBmYWxzZVxyXG4gICAgICAgIG5vZGUucGFyZW50ID0gbnVsbFxyXG5cclxuICBjcmVhdGVIZWFwOiAtPlxyXG4gICAgcmV0dXJuIG5ldyBGYWtlSGVhcCAobm9kZSkgLT5cclxuICAgICAgcmV0dXJuIG5vZGUuZGlzdGFuY2VcclxuXHJcbiAgc2VhcmNoOiAoc3RhcnQsIGVuZCkgLT5cclxuICAgIGdyaWQgPSBAZmxvb3IuZ3JpZFxyXG4gICAgaGV1cmlzdGljID0gQG1hbmhhdHRhblxyXG5cclxuICAgIHN0YXJ0LmRpc3RhbmNlID0gMFxyXG5cclxuICAgIGhlYXAgPSBAY3JlYXRlSGVhcCgpXHJcbiAgICBoZWFwLnB1c2goc3RhcnQpXHJcbiAgICBzdGFydC5oZWFwZWQgPSB0cnVlXHJcblxyXG4gICAgd2hpbGUgaGVhcC5zaXplKCkgPiAwXHJcbiAgICAgIGN1cnJlbnROb2RlID0gaGVhcC5wb3AoKVxyXG4gICAgICBjdXJyZW50Tm9kZS52aXNpdGVkID0gdHJ1ZVxyXG5cclxuICAgICAgaWYgY3VycmVudE5vZGUgPT0gZW5kXHJcbiAgICAgICAgcmV0ID0gW11cclxuICAgICAgICBjdXJyID0gZW5kXHJcbiAgICAgICAgd2hpbGUgY3Vyci5wYXJlbnRcclxuICAgICAgICAgIHJldC5wdXNoKHt4OmN1cnIueCwgeTpjdXJyLnl9KVxyXG4gICAgICAgICAgY3VyciA9IGN1cnIucGFyZW50XHJcbiAgICAgICAgcmV0dXJuIHJldC5yZXZlcnNlKClcclxuXHJcbiAgICAgICMgRmluZCBhbGwgbmVpZ2hib3JzIGZvciB0aGUgY3VycmVudCBub2RlLlxyXG4gICAgICBuZWlnaGJvcnMgPSBAbmVpZ2hib3JzKGdyaWQsIGN1cnJlbnROb2RlKVxyXG5cclxuICAgICAgZm9yIG5laWdoYm9yIGluIG5laWdoYm9yc1xyXG4gICAgICAgIGlmIG5laWdoYm9yLnZpc2l0ZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcclxuICAgICAgICAgICMgTm90IGEgdmFsaWQgbm9kZSB0byBwcm9jZXNzLCBza2lwIHRvIG5leHQgbmVpZ2hib3IuXHJcbiAgICAgICAgICBjb250aW51ZVxyXG5cclxuICAgICAgICAjIFRoZSBkaXN0YW5jZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXHJcbiAgICAgICAgIyBXZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBwYXRoIHdlIGhhdmUgYXJyaXZlZCBhdCB0aGlzIG5laWdoYm9yIGlzIHRoZSBzaG9ydGVzdCBvbmUgd2UgaGF2ZSBzZWVuIHlldC5cclxuICAgICAgICBhbHQgPSBjdXJyZW50Tm9kZS5kaXN0YW5jZSArIDFcclxuICAgICAgICBpc0RpYWdvbmFsID0gKGN1cnJlbnROb2RlLnggIT0gbmVpZ2hib3IueCkgYW5kIChjdXJyZW50Tm9kZS55ICE9IG5laWdoYm9yLnkpXHJcbiAgICAgICAgaWYgaXNEaWFnb25hbFxyXG4gICAgICAgICAgYWx0ICs9IDAuMVxyXG5cclxuICAgICAgICBpZiAoYWx0IDwgbmVpZ2hib3IuZGlzdGFuY2UpIGFuZCBub3QgbmVpZ2hib3IudmlzaXRlZFxyXG4gICAgICAgICAgIyBGb3VuZCBhbiBvcHRpbWFsIChzbyBmYXIpIHBhdGggdG8gdGhpcyBub2RlLlxyXG4gICAgICAgICAgbmVpZ2hib3IuZGlzdGFuY2UgPSBhbHRcclxuICAgICAgICAgIG5laWdoYm9yLnBhcmVudCA9IGN1cnJlbnROb2RlXHJcbiAgICAgICAgICBpZiBuZWlnaGJvci5oZWFwZWRcclxuICAgICAgICAgICAgaGVhcC5yZXNjb3JlKG5laWdoYm9yKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoZWFwLnB1c2gobmVpZ2hib3IpXHJcbiAgICAgICAgICAgIG5laWdoYm9yLmhlYXBlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gW11cclxuXHJcbiAgbmVpZ2hib3JzOiAoZ3JpZCwgbm9kZSkgLT5cclxuICAgIHJldCA9IFtdXHJcbiAgICB4ID0gbm9kZS54XHJcbiAgICB5ID0gbm9kZS55XHJcblxyXG4gICAgIyBTb3V0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3ktMV0pXHJcblxyXG4gICAgIyBTb3V0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ktMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3ktMV0pXHJcblxyXG4gICAgIyBOb3J0aHdlc3RcclxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3krMV0pXHJcblxyXG4gICAgIyBOb3J0aGVhc3RcclxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4KzFdW3krMV0pXHJcblxyXG4gICAgIyBXZXN0XHJcbiAgICBpZiBncmlkW3gtMV0gYW5kIGdyaWRbeC0xXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3gtMV1beV0pXHJcblxyXG4gICAgIyBFYXN0XHJcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5XVxyXG4gICAgICByZXQucHVzaChncmlkW3grMV1beV0pXHJcblxyXG4gICAgIyBTb3V0aFxyXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5LTFdXHJcbiAgICAgIHJldC5wdXNoKGdyaWRbeF1beS0xXSlcclxuXHJcbiAgICAjIE5vcnRoXHJcbiAgICBpZiBncmlkW3hdIGFuZCBncmlkW3hdW3krMV1cclxuICAgICAgcmV0LnB1c2goZ3JpZFt4XVt5KzFdKVxyXG5cclxuICAgIHJldHVybiByZXRcclxuXHJcbmNsYXNzIFBhdGhmaW5kZXJcclxuICBjb25zdHJ1Y3RvcjogKEBmbG9vciwgQGZsYWdzKSAtPlxyXG5cclxuICBjYWxjOiAoc3RhcnRYLCBzdGFydFksIGRlc3RYLCBkZXN0WSkgLT5cclxuICAgIGRpamtzdHJhID0gbmV3IERpamtzdHJhIEBmbG9vclxyXG4gICAgcmV0dXJuIGRpamtzdHJhLnNlYXJjaChAZmxvb3IuZ3JpZFtzdGFydFhdW3N0YXJ0WV0sIEBmbG9vci5ncmlkW2Rlc3RYXVtkZXN0WV0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhmaW5kZXJcclxuIl19
;