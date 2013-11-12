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


},{"boot/maindroid":"HCq9uM","boot/mainweb":"4GzHxr"}],"HCq9uM":[function(require,module,exports){
var nullScene;

require('jsb.js');

require('main');

nullScene = new cc.Scene();

nullScene.init();

cc.Director.getInstance().runWithScene(nullScene);

cc.game.modes.intro.activate();


},{"main":"QhDFR6"}],"boot/maindroid":[function(require,module,exports){
module.exports=require('HCq9uM');
},{}],"boot/mainweb":[function(require,module,exports){
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


},{"config":"iMuVlD","main":"QhDFR6","resources":"91JGgx"}],"dM/HqE":[function(require,module,exports){
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
module.exports=require('dM/HqE');
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


},{}],"gfx":[function(require,module,exports){
module.exports=require('4XUS/O');
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


},{}],"gfx/tilesheet":[function(require,module,exports){
module.exports=require('8TUzEH');
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


},{"gfx/tilesheet":"8TUzEH"}],"world/floor":[function(require,module,exports){
module.exports=require('xJVDSW');
},{}],"xJVDSW":[function(require,module,exports){
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


},{"gfx":"4XUS/O","resources":"91JGgx"}],"Bo8xW5":[function(require,module,exports){
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


},{"world/floorgen":"Bo8xW5"}]},{},[6])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcc2VlZC1yYW5kb21cXGluZGV4LmpzIiwiIC4uXFxzcmNcXGJhc2VcXG1vZGUuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXGJvb3QuY29mZmVlIiwiIC4uXFxzcmNcXGJvb3RcXG1haW5kcm9pZC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbndlYi5jb2ZmZWUiLCIgLi5cXHNyY1xcYnJhaW5cXGJyYWluLmNvZmZlZSIsIiAuLlxcc3JjXFxicmFpblxccGxheWVyLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSIsIiAuLlxcc3JjXFx3b3JsZFxccGF0aGZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xLQSxJQUFBLDJEQUFBOztBQUFBLG9CQUFBLEdBQXVCLEVBQXZCLENBQUE7O0FBQUEsVUFFQSxHQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFnQjtBQUFBLEVBQzNCLElBQUEsRUFBTSxTQUFFLElBQUYsR0FBQTtBQUNKLElBREssSUFBQyxDQUFBLE9BQUEsSUFDTixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0Es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QUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxJQUFDLENBQUEsS0FBUCxDQUFaLENBQUE7QUFDQSxXQUFPLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFLLENBQUEsTUFBQSxDQUFRLENBQUEsTUFBQSxDQUFqQyxFQUEwQyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQUssQ0FBQSxLQUFBLENBQU8sQ0FBQSxLQUFBLENBQTdELENBQVAsQ0FGSTtFQUFBLENBRk4sQ0FBQTs7b0JBQUE7O0lBdk9GLENBQUE7O0FBQUEsTUE2T00sQ0FBQyxPQUFQLEdBQWlCLFVBN09qQixDQUFBIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJcbi8vIG5vdCBpbXBsZW1lbnRlZFxuLy8gVGhlIHJlYXNvbiBmb3IgaGF2aW5nIGFuIGVtcHR5IGZpbGUgYW5kIG5vdCB0aHJvd2luZyBpcyB0byBhbGxvd1xuLy8gdW50cmFkaXRpb25hbCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIG1vZHVsZS5cbiIsInZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIHNpZ25pZmljYW5jZSA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxuXHJcbnZhciBvdmVyZmxvdywgc3RhcnRkZW5vbTsgLy9udW1iZXJzXHJcblxyXG5cclxudmFyIG9sZFJhbmRvbSA9IE1hdGgucmFuZG9tO1xyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvdmVyUmlkZUdsb2JhbCkge1xyXG4gIGlmICghc2VlZCkge1xyXG4gICAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICAgIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9sZFJhbmRvbTtcclxuICB9XHJcbiAgdmFyIGtleSA9IFtdO1xyXG4gIHZhciBhcmM0O1xyXG5cclxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cclxuICBzZWVkID0gbWl4a2V5KGZsYXR0ZW4oc2VlZCwgMyksIGtleSk7XHJcblxyXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxyXG4gIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgZnVuY3Rpb24gcmFuZG9tKCkgeyAgLy8gQ2xvc3VyZSB0byByZXR1cm4gYSByYW5kb20gZG91YmxlOlxyXG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKTsgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XHJcbiAgICB2YXIgZCA9IHN0YXJ0ZGVub207ICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxyXG4gICAgdmFyIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXHJcbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcclxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxyXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXHJcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxyXG4gICAgfVxyXG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcclxuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXHJcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgTWF0aCB1bnRpbFxyXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cclxuICAgIH1cclxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxyXG4gIH1cclxuICByYW5kb20uc2VlZCA9IHNlZWQ7XHJcbiAgaWYgKG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgICBNYXRoWydyYW5kb20nXSA9IHJhbmRvbTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybiB0aGUgc2VlZCB0aGF0IHdhcyB1c2VkXHJcbiAgcmV0dXJuIHJhbmRvbTtcclxufTtcclxuXHJcbi8vXHJcbi8vIEFSQzRcclxuLy9cclxuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxyXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cclxuLy9cclxuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcclxuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxyXG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXHJcbi8vXHJcbi8qKiBAY29uc3RydWN0b3IgKi9cclxuZnVuY3Rpb24gQVJDNChrZXkpIHtcclxuICB2YXIgdCwgdSwgbWUgPSB0aGlzLCBrZXlsZW4gPSBrZXkubGVuZ3RoO1xyXG4gIHZhciBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gbWUubSA9IDA7XHJcbiAgbWUuUyA9IFtdO1xyXG4gIG1lLmMgPSBbXTtcclxuXHJcbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cclxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XHJcblxyXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXHJcbiAgd2hpbGUgKGkgPCB3aWR0aCkgeyBtZS5TW2ldID0gaSsrOyB9XHJcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcclxuICAgIHQgPSBtZS5TW2ldO1xyXG4gICAgaiA9IGxvd2JpdHMoaiArIHQgKyBrZXlbaSAlIGtleWxlbl0pO1xyXG4gICAgdSA9IG1lLlNbal07XHJcbiAgICBtZS5TW2ldID0gdTtcclxuICAgIG1lLlNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIG1lLmcgPSBmdW5jdGlvbiBnZXRuZXh0KGNvdW50KSB7XHJcbiAgICB2YXIgcyA9IG1lLlM7XHJcbiAgICB2YXIgaSA9IGxvd2JpdHMobWUuaSArIDEpOyB2YXIgdCA9IHNbaV07XHJcbiAgICB2YXIgaiA9IGxvd2JpdHMobWUuaiArIHQpOyB2YXIgdSA9IHNbal07XHJcbiAgICBzW2ldID0gdTtcclxuICAgIHNbal0gPSB0O1xyXG4gICAgdmFyIHIgPSBzW2xvd2JpdHModCArIHUpXTtcclxuICAgIHdoaWxlICgtLWNvdW50KSB7XHJcbiAgICAgIGkgPSBsb3diaXRzKGkgKyAxKTsgdCA9IHNbaV07XHJcbiAgICAgIGogPSBsb3diaXRzKGogKyB0KTsgdSA9IHNbal07XHJcbiAgICAgIHNbaV0gPSB1O1xyXG4gICAgICBzW2pdID0gdDtcclxuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7XHJcbiAgICBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gIH07XHJcbiAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgLy8gU2VlIGh0dHA6Ly93d3cucnNhLmNvbS9yc2FsYWJzL25vZGUuYXNwP2lkPTIwMDlcclxuICBtZS5nKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuLyoqIEBwYXJhbSB7T2JqZWN0PX0gcmVzdWx0IFxyXG4gICogQHBhcmFtIHtzdHJpbmc9fSBwcm9wXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHR5cCAqL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgsIHJlc3VsdCwgcHJvcCwgdHlwKSB7XHJcbiAgcmVzdWx0ID0gW107XHJcbiAgdHlwID0gdHlwZW9mKG9iaik7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICBpZiAocHJvcC5pbmRleE9mKCdTJykgPCA1KSB7ICAgIC8vIEF2b2lkIEZGMyBidWcgKGxvY2FsL3Nlc3Npb25TdG9yYWdlKVxyXG4gICAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiBvYmogKyAodHlwICE9ICdzdHJpbmcnID8gJ1xcMCcgOiAnJykpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG4vKiogQHBhcmFtIHtudW1iZXI9fSBzbWVhciBcclxuICAqIEBwYXJhbSB7bnVtYmVyPX0gaiAqL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5LCBzbWVhciwgaikge1xyXG4gIHNlZWQgKz0gJyc7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgc2VlZCBpcyBhIHN0cmluZ1xyXG4gIHNtZWFyID0gMDtcclxuICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7IGorKykge1xyXG4gICAga2V5W2xvd2JpdHMoaildID1cclxuICAgICAgbG93Yml0cygoc21lYXIgXj0ga2V5W2xvd2JpdHMoaildICogMTkpICsgc2VlZC5jaGFyQ29kZUF0KGopKTtcclxuICB9XHJcbiAgc2VlZCA9ICcnO1xyXG4gIGZvciAoaiBpbiBrZXkpIHsgc2VlZCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleVtqXSk7IH1cclxuICByZXR1cm4gc2VlZDtcclxufVxyXG5cclxuLy9cclxuLy8gbG93Yml0cygpXHJcbi8vIEEgcXVpY2sgXCJuIG1vZCB3aWR0aFwiIGZvciB3aWR0aCBhIHBvd2VyIG9mIDIuXHJcbi8vXHJcbmZ1bmN0aW9uIGxvd2JpdHMobikgeyByZXR1cm4gbiAmICh3aWR0aCAtIDEpOyB9XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKTtcclxuc2lnbmlmaWNhbmNlID0gTWF0aC5wb3coMiwgc2lnbmlmaWNhbmNlKTtcclxub3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyO1xyXG4iLCIjIGhvdyBtYW55IHBpeGVscyBjYW4geW91IGRyYWcgYmVmb3JlIGl0IGlzIGFjdHVhbGx5IGNvbnNpZGVyZWQgYSBkcmFnXHJcbkVOR0FHRV9EUkFHX0RJU1RBTkNFID0gMzBcclxuXHJcbklucHV0TGF5ZXIgPSBjYy5MYXllci5leHRlbmQge1xyXG4gIGluaXQ6IChAbW9kZSkgLT5cclxuICAgIEBfc3VwZXIoKVxyXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxyXG4gICAgQHNldE1vdXNlRW5hYmxlZCh0cnVlKVxyXG4gICAgQHRyYWNrZWRUb3VjaGVzID0gW11cclxuXHJcbiAgY2FsY0Rpc3RhbmNlOiAoeDEsIHkxLCB4MiwgeTIpIC0+XHJcbiAgICBkeCA9IHgyIC0geDFcclxuICAgIGR5ID0geTIgLSB5MVxyXG4gICAgcmV0dXJuIE1hdGguc3FydChkeCpkeCArIGR5KmR5KVxyXG5cclxuICBzZXREcmFnUG9pbnQ6IC0+XHJcbiAgICBAZHJhZ1ggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgQGRyYWdZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgY2FsY1BpbmNoQW5jaG9yOiAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIEBwaW5jaFggPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueCArIEB0cmFja2VkVG91Y2hlc1sxXS54KSAvIDIpXHJcbiAgICAgIEBwaW5jaFkgPSBNYXRoLmZsb29yKChAdHJhY2tlZFRvdWNoZXNbMF0ueSArIEB0cmFja2VkVG91Y2hlc1sxXS55KSAvIDIpXHJcbiAgICAgICMgY2MubG9nIFwicGluY2ggYW5jaG9yIHNldCBhdCAje0BwaW5jaFh9LCAje0BwaW5jaFl9XCJcclxuXHJcbiAgYWRkVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGZvciB0IGluIEB0cmFja2VkVG91Y2hlc1xyXG4gICAgICBpZiB0LmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMucHVzaCB7XHJcbiAgICAgIGlkOiBpZFxyXG4gICAgICB4OiB4XHJcbiAgICAgIHk6IHlcclxuICAgIH1cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMlxyXG4gICAgICAjIFdlIGp1c3QgYWRkZWQgYSBzZWNvbmQgdG91Y2ggc3BvdC4gQ2FsY3VsYXRlIHRoZSBhbmNob3IgZm9yIHBpbmNoaW5nIG5vd1xyXG4gICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICNjYy5sb2cgXCJhZGRpbmcgdG91Y2ggI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHJlbW92ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuICAgICAgaWYgaW5kZXggPCAyXHJcbiAgICAgICAgIyBXZSBqdXN0IGZvcmdvdCBvbmUgb2Ygb3VyIHBpbmNoIHRvdWNoZXMuIFBpY2sgYSBuZXcgYW5jaG9yIHNwb3QuXHJcbiAgICAgICAgQGNhbGNQaW5jaEFuY2hvcigpXHJcbiAgICAgICNjYy5sb2cgXCJmb3JnZXR0aW5nIGlkICN7aWR9LCB0cmFja2luZyAje0B0cmFja2VkVG91Y2hlcy5sZW5ndGh9IHRvdWNoZXNcIlxyXG5cclxuICB1cGRhdGVUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgaW5kZXggPSAtMVxyXG4gICAgZm9yIGkgaW4gWzAuLi5AdHJhY2tlZFRvdWNoZXMubGVuZ3RoXVxyXG4gICAgICBpZiBAdHJhY2tlZFRvdWNoZXNbaV0uaWQgPT0gaWRcclxuICAgICAgICBpbmRleCA9IGlcclxuICAgICAgICBicmVha1xyXG4gICAgaWYgaW5kZXggIT0gLTFcclxuICAgICAgQHRyYWNrZWRUb3VjaGVzW2luZGV4XS54ID0geFxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnkgPSB5XHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQGRyYWdnaW5nID0gZmFsc2VcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEBhZGRUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+IDFcclxuICAgICAgIyBUaGV5J3JlIHBpbmNoaW5nLCBkb24ndCBldmVuIGJvdGhlciB0byBlbWl0IGEgY2xpY2tcclxuICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG5cclxuICBvblRvdWNoZXNNb3ZlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgcHJldkRpc3RhbmNlID0gMFxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgIHByZXZEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDFcclxuICAgICAgcHJldlggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueFxyXG4gICAgICBwcmV2WSA9IEB0cmFja2VkVG91Y2hlc1swXS55XHJcblxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQHVwZGF0ZVRvdWNoKHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55KVxyXG5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAjIHNpbmdsZSB0b3VjaCwgY29uc2lkZXIgZHJhZ2dpbmdcclxuICAgICAgZHJhZ0Rpc3RhbmNlID0gQGNhbGNEaXN0YW5jZSBAZHJhZ1gsIEBkcmFnWSwgQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55XHJcbiAgICAgIGlmIEBkcmFnZ2luZyBvciAoZHJhZ0Rpc3RhbmNlID4gRU5HQUdFX0RSQUdfRElTVEFOQ0UpXHJcbiAgICAgICAgQGRyYWdnaW5nID0gdHJ1ZVxyXG4gICAgICAgIGlmIGRyYWdEaXN0YW5jZSA+IDAuNVxyXG4gICAgICAgICAgZHggPSBAdHJhY2tlZFRvdWNoZXNbMF0ueCAtIEBkcmFnWFxyXG4gICAgICAgICAgZHkgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueSAtIEBkcmFnWVxyXG4gICAgICAgICAgI2NjLmxvZyBcInNpbmdsZSBkcmFnOiAje2R4fSwgI3tkeX1cIlxyXG4gICAgICAgICAgQG1vZGUub25EcmFnKGR4LCBkeSlcclxuICAgICAgICBAc2V0RHJhZ1BvaW50KClcclxuXHJcbiAgICBlbHNlIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPj0gMlxyXG4gICAgICAjIGF0IGxlYXN0IHR3byBmaW5nZXJzIHByZXNlbnQsIGNoZWNrIGZvciBwaW5jaC96b29tXHJcbiAgICAgIGN1cnJEaXN0YW5jZSA9IEBjYWxjRGlzdGFuY2UoQHRyYWNrZWRUb3VjaGVzWzBdLngsIEB0cmFja2VkVG91Y2hlc1swXS55LCBAdHJhY2tlZFRvdWNoZXNbMV0ueCwgQHRyYWNrZWRUb3VjaGVzWzFdLnkpXHJcbiAgICAgIGRlbHRhRGlzdGFuY2UgPSBjdXJyRGlzdGFuY2UgLSBwcmV2RGlzdGFuY2VcclxuICAgICAgaWYgZGVsdGFEaXN0YW5jZSAhPSAwXHJcbiAgICAgICAgI2NjLmxvZyBcImRpc3RhbmNlIGRyYWdnZWQgYXBhcnQ6ICN7ZGVsdGFEaXN0YW5jZX0gW2FuY2hvcjogI3tAcGluY2hYfSwgI3tAcGluY2hZfV1cIlxyXG4gICAgICAgIEBtb2RlLm9uWm9vbShAcGluY2hYLCBAcGluY2hZLCBkZWx0YURpc3RhbmNlKVxyXG5cclxuICBvblRvdWNoZXNFbmRlZDogKHRvdWNoZXMsIGV2ZW50KSAtPlxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxIGFuZCBub3QgQGRyYWdnaW5nXHJcbiAgICAgIHBvcyA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKVxyXG4gICAgICAjY2MubG9nIFwiY2xpY2sgYXQgI3twb3MueH0sICN7cG9zLnl9XCJcclxuICAgICAgQG1vZGUub25DbGljayhwb3MueCwgcG9zLnkpXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAcmVtb3ZlVG91Y2ggdC5nZXRJZCgpLCBwb3MueCwgcG9zLnlcclxuXHJcbiAgb25TY3JvbGxXaGVlbDogKGV2KSAtPlxyXG4gICAgcG9zID0gZXYuZ2V0TG9jYXRpb24oKVxyXG4gICAgQG1vZGUub25ab29tKHBvcy54LCBwb3MueSwgZXYuZ2V0V2hlZWxEZWx0YSgpKVxyXG59XHJcblxyXG5HZnhMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbn1cclxuXHJcbk1vZGVTY2VuZSA9IGNjLlNjZW5lLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcblxyXG4gICAgQGlucHV0ID0gbmV3IElucHV0TGF5ZXIoKVxyXG4gICAgQGlucHV0LmluaXQoQG1vZGUpXHJcbiAgICBAYWRkQ2hpbGQoQGlucHV0KVxyXG5cclxuICAgIEBnZnggPSBuZXcgR2Z4TGF5ZXIoKVxyXG4gICAgQGdmeC5pbml0KClcclxuICAgIEBhZGRDaGlsZChAZ2Z4KVxyXG5cclxuICBvbkVudGVyOiAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAbW9kZS5vbkFjdGl2YXRlKClcclxufVxyXG5cclxuY2xhc3MgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUpIC0+XHJcbiAgICBAc2NlbmUgPSBuZXcgTW9kZVNjZW5lKClcclxuICAgIEBzY2VuZS5pbml0KHRoaXMpXHJcbiAgICBAc2NlbmUucmV0YWluKClcclxuXHJcbiAgYWN0aXZhdGU6IC0+XHJcbiAgICBjYy5sb2cgXCJhY3RpdmF0aW5nIG1vZGUgI3tAbmFtZX1cIlxyXG4gICAgaWYgY2Muc2F3T25lU2NlbmU/XHJcbiAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucG9wU2NlbmUoKVxyXG4gICAgZWxzZVxyXG4gICAgICBjYy5zYXdPbmVTY2VuZSA9IHRydWVcclxuICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucHVzaFNjZW5lKEBzY2VuZSlcclxuXHJcbiAgYWRkOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5hZGRDaGlsZChvYmopXHJcblxyXG4gIHJlbW92ZTogKG9iaikgLT5cclxuICAgIEBzY2VuZS5nZngucmVtb3ZlQ2hpbGQob2JqKVxyXG5cclxuICAjIHRvIGJlIG92ZXJyaWRkZW4gYnkgZGVyaXZlZCBNb2Rlc1xyXG4gIG9uQWN0aXZhdGU6IC0+XHJcbiAgb25DbGljazogKHgsIHkpIC0+XHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlXHJcbiIsImlmIGRvY3VtZW50P1xuICByZXF1aXJlICdib290L21haW53ZWInXG5lbHNlXG4gIHJlcXVpcmUgJ2Jvb3QvbWFpbmRyb2lkJ1xuIiwicmVxdWlyZSAnanNiLmpzJ1xucmVxdWlyZSAnbWFpbidcblxubnVsbFNjZW5lID0gbmV3IGNjLlNjZW5lKClcbm51bGxTY2VuZS5pbml0KClcbmNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucnVuV2l0aFNjZW5lKG51bGxTY2VuZSlcbmNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxuIiwiY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xuXG5jb2NvczJkQXBwID0gY2MuQXBwbGljYXRpb24uZXh0ZW5kIHtcbiAgY29uZmlnOiBjb25maWdcbiAgY3RvcjogKHNjZW5lKSAtPlxuICAgIEBfc3VwZXIoKVxuICAgIGNjLkNPQ09TMkRfREVCVUcgPSBAY29uZmlnWydDT0NPUzJEX0RFQlVHJ11cbiAgICBjYy5pbml0RGVidWdTZXR0aW5nKClcbiAgICBjYy5zZXR1cChAY29uZmlnWyd0YWcnXSlcbiAgICBjYy5BcHBDb250cm9sbGVyLnNoYXJlQXBwQ29udHJvbGxlcigpLmRpZEZpbmlzaExhdW5jaGluZ1dpdGhPcHRpb25zKClcblxuICBhcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogLT5cbiAgICAgIGlmIGNjLlJlbmRlckRvZXNub3RTdXBwb3J0KClcbiAgICAgICAgICAjIHNob3cgSW5mb3JtYXRpb24gdG8gdXNlclxuICAgICAgICAgIGFsZXJ0IFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgV2ViR0xcIlxuICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAjIGluaXRpYWxpemUgZGlyZWN0b3JcbiAgICAgIGRpcmVjdG9yID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKVxuXG4gICAgICBjYy5FR0xWaWV3LmdldEluc3RhbmNlKCkuc2V0RGVzaWduUmVzb2x1dGlvblNpemUoMTI4MCwgNzIwLCBjYy5SRVNPTFVUSU9OX1BPTElDWS5TSE9XX0FMTClcblxuICAgICAgIyB0dXJuIG9uIGRpc3BsYXkgRlBTXG4gICAgICBkaXJlY3Rvci5zZXREaXNwbGF5U3RhdHMgQGNvbmZpZ1snc2hvd0ZQUyddXG5cbiAgICAgICMgc2V0IEZQUy4gdGhlIGRlZmF1bHQgdmFsdWUgaXMgMS4wLzYwIGlmIHlvdSBkb24ndCBjYWxsIHRoaXNcbiAgICAgIGRpcmVjdG9yLnNldEFuaW1hdGlvbkludGVydmFsIDEuMCAvIEBjb25maWdbJ2ZyYW1lUmF0ZSddXG5cbiAgICAgICMgbG9hZCByZXNvdXJjZXNcbiAgICAgIHJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcbiAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQocmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QsIC0+XG4gICAgICAgIHJlcXVpcmUgJ21haW4nXG4gICAgICAgIG51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpO1xuICAgICAgICBudWxsU2NlbmUuaW5pdCgpXG4gICAgICAgIGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkucmVwbGFjZVNjZW5lKG51bGxTY2VuZSlcbiMgICAgICAgIGNjLmdhbWUubW9kZXMuaW50cm8uYWN0aXZhdGUoKVxuICAgICAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxuICAgICAgdGhpcylcblxuICAgICAgcmV0dXJuIHRydWVcbn1cblxubXlBcHAgPSBuZXcgY29jb3MyZEFwcCgpXG4iLCJjbGFzcyBCcmFpblxuICBjb25zdHJ1Y3RvcjogKEB0aWxlcywgQGFuaW1GcmFtZSkgLT5cbiAgICBAZmFjaW5nUmlnaHQgPSB0cnVlXG4gICAgQGNkID0gMFxuICAgIEBpbnRlcnBGcmFtZXMgPSBbXVxuICAgIEBwYXRoID0gW11cblxuICBtb3ZlOiAoZ3gsIGd5LCBmcmFtZXMpIC0+XG4gICAgQGludGVycEZyYW1lcyA9IFtdXG4gICAgZHggPSAoQHggLSBneCkgKiBjYy51bml0U2l6ZVxuICAgIGR5ID0gKEB5IC0gZ3kpICogY2MudW5pdFNpemVcbiAgICBAZmFjaW5nUmlnaHQgPSAoZHggPCAwKVxuICAgIGkgPSBmcmFtZXMubGVuZ3RoXG4gICAgZm9yIGYgaW4gZnJhbWVzXG4gICAgICBhbmltRnJhbWUgPSB7XG4gICAgICAgIHg6IGR4ICogaSAvIGZyYW1lcy5sZW5ndGhcbiAgICAgICAgeTogZHkgKiBpIC8gZnJhbWVzLmxlbmd0aFxuICAgICAgICBhbmltRnJhbWU6IGZcbiAgICAgIH1cbiAgICAgIEBpbnRlcnBGcmFtZXMucHVzaCBhbmltRnJhbWVcbiAgICAgIGktLVxuXG4gICAgY2MuZ2FtZS5zZXRUdXJuRnJhbWVzKGZyYW1lcy5sZW5ndGgpXG5cbiAgICAjIEltbWVkaWF0ZWx5IG1vdmUsIG9ubHkgcHJldGVuZCB0byBhbmltYXRlIHRoZXJlIG92ZXIgdGhlIG5leHQgZnJhbWVzLmxlbmd0aCBmcmFtZXNcbiAgICBAeCA9IGd4XG4gICAgQHkgPSBneVxuXG4gIHdhbGtQYXRoOiAoQHBhdGgpIC0+XG5cbiAgY3JlYXRlU3ByaXRlOiAtPlxuICAgIHMgPSBjYy5TcHJpdGUuY3JlYXRlIEB0aWxlcy5yZXNvdXJjZVxuICAgIEB1cGRhdGVTcHJpdGUocylcbiAgICByZXR1cm4gc1xuXG4gIHVwZGF0ZVNwcml0ZTogKHNwcml0ZSkgLT5cbiAgICB4ID0gQHggKiBjYy51bml0U2l6ZVxuICAgIHkgPSBAeSAqIGNjLnVuaXRTaXplXG4gICAgYW5pbUZyYW1lID0gQGFuaW1GcmFtZVxuICAgIGlmIEBpbnRlcnBGcmFtZXMubGVuZ3RoXG4gICAgICBmcmFtZSA9IEBpbnRlcnBGcmFtZXMuc3BsaWNlKDAsIDEpWzBdXG4gICAgICB4ICs9IGZyYW1lLnhcbiAgICAgIHkgKz0gZnJhbWUueVxuICAgICAgYW5pbUZyYW1lID0gZnJhbWUuYW5pbUZyYW1lXG4gICAgIyBlbHNlXG4gICAgIyAgIGFuaW1GcmFtZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXG4gICAgc3ByaXRlLnNldFRleHR1cmVSZWN0KEB0aWxlcy5yZWN0KGFuaW1GcmFtZSkpXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoeCwgeSkpXG4gICAgeGFuY2hvciA9IDEuMFxuICAgIHhzY2FsZSA9IC0xLjBcbiAgICBpZiBAZmFjaW5nUmlnaHRcbiAgICAgIHhhbmNob3IgPSAwXG4gICAgICB4c2NhbGUgPSAxLjBcbiAgICBzcHJpdGUuc2V0U2NhbGVYKHhzY2FsZSlcbiAgICBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCh4YW5jaG9yLCAwKSlcblxuICB0YWtlU3RlcDogLT5cbiAgICBpZiBAaW50ZXJwRnJhbWVzLmxlbmd0aCA9PSAwXG4gICAgICBpZiBAcGF0aC5sZW5ndGggPiAwXG4gICAgICAgIHN0ZXAgPSBAcGF0aC5zcGxpY2UoMCwgMSlbMF1cbiAgICAgICAgIyBjYy5sb2cgXCJ0YWtpbmcgc3RlcCB0byAje3N0ZXAueH0sICN7c3RlcC55fVwiXG4gICAgICAgIEBtb3ZlKHN0ZXAueCwgc3RlcC55LCBbMiwzLDRdKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHRpY2s6IChlbGFwc2VkVHVybnMpIC0+XG4gICAgaWYgQGNkID4gMFxuICAgICAgQGNkIC09IGVsYXBzZWRUdXJucyBpZiBAY2QgPiAwXG4gICAgICBAY2QgPSAwIGlmIEBjZCA8IDBcbiAgICBpZiBAY2QgPT0gMFxuICAgICAgQHRoaW5rKClcblxuICB0aGluazogLT5cbiAgICBjYy5sb2cgXCJ0aGluayBub3QgaW1wbGVtZW50ZWQhXCJcblxubW9kdWxlLmV4cG9ydHMgPSBCcmFpblxuIiwicmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuQnJhaW4gPSByZXF1aXJlICdicmFpbi9icmFpbidcblBhdGhmaW5kZXIgPSByZXF1aXJlICd3b3JsZC9wYXRoZmluZGVyJ1xuVGlsZXNoZWV0ID0gcmVxdWlyZSAnZ2Z4L3RpbGVzaGVldCdcblxuY2xhc3MgUGxheWVyIGV4dGVuZHMgQnJhaW5cbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgIEBhbmltRnJhbWUgPSAwXG4gICAgZm9yIGssdiBvZiBkYXRhXG4gICAgICB0aGlzW2tdID0gdlxuICAgIHN1cGVyIHJlc291cmNlcy50aWxlc2hlZXRzLnBsYXllciwgQGFuaW1GcmFtZVxuXG4gIHdhbGtQYXRoOiAoQHBhdGgpIC0+XG5cbiAgdGhpbms6IC0+XG4gICAgaWYgQHRha2VTdGVwKClcbiAgICAgIEBjZCA9IDUwXG5cbiAgYWN0OiAoZ3gsIGd5KSAtPlxuICAgIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxuICAgIHBhdGggPSBwYXRoZmluZGVyLmNhbGMoQHgsIEB5LCBneCwgZ3kpXG4gICAgQHdhbGtQYXRoKHBhdGgpXG4gICAgY2MubG9nIFwicGF0aCBpcyAje3BhdGgubGVuZ3RofSBsb25nXCJcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgc2NhbGU6XG4gICAgbWluOiAxLjVcbiAgICBtYXg6IDguMFxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcbiAgYm94MmQ6ZmFsc2VcbiAgY2hpcG11bms6ZmFsc2VcbiAgc2hvd0ZQUzp0cnVlXG4gIGZyYW1lUmF0ZTo2MFxuICBsb2FkRXh0ZW5zaW9uOmZhbHNlXG4gIHJlbmRlck1vZGU6MFxuICB0YWc6J2dhbWVDYW52YXMnXG4gIGFwcEZpbGVzOiBbXG4gICAgJ2J1bmRsZS5qcydcbiAgXVxuIiwiY2xhc3MgTGF5ZXIgZXh0ZW5kcyBjYy5MYXllclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY3RvcigpXG4gICAgQGluaXQoKVxuXG5jbGFzcyBTY2VuZSBleHRlbmRzIGNjLlNjZW5lXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBjdG9yKClcbiAgICBAaW5pdCgpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgTGF5ZXI6IExheWVyXG4gIFNjZW5lOiBTY2VuZVxuIiwiXG4jIFRoaXMgaXMgZnVja2luZyB0cmFnaWMuXG5QSVhFTF9GVURHRV9GQUNUT1IgPSAwLjUgICMgaG93IG1hbnkgcGl4ZWxzIHRvIHJlbW92ZSBmcm9tIHRoZSBlZGdlIHRvIHJlbW92ZSBibGVlZFxuU0NBTEVfRlVER0VfRkFDVE9SID0gMC4wMiAgIyBhZGRpdGlvbmFsIHNwcml0ZSBzY2FsZSB0byBlbnN1cmUgcHJvcGVyIHRpbGluZ1xuXG5UaWxlc2hlZXRCYXRjaE5vZGUgPSBjYy5TcHJpdGVCYXRjaE5vZGUuZXh0ZW5kIHtcbiAgaW5pdDogKGZpbGVJbWFnZSwgY2FwYWNpdHkpIC0+XG4gICAgQF9zdXBlcihmaWxlSW1hZ2UsIGNhcGFjaXR5KVxuXG4gIGNyZWF0ZVNwcml0ZTogKHRpbGVJbmRleCwgeCwgeSkgLT5cbiAgICBzcHJpdGUgPSBjYy5TcHJpdGUuY3JlYXRlV2l0aFRleHR1cmUoQGdldFRleHR1cmUoKSwgQHRpbGVzaGVldC5yZWN0KHRpbGVJbmRleCkpXG4gICAgc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXG4gICAgc3ByaXRlLnNldFBvc2l0aW9uKHgsIHkpXG4gICAgc3ByaXRlLnNldFNjYWxlKEB0aWxlc2hlZXQuYWRqdXN0ZWRTY2FsZS54LCBAdGlsZXNoZWV0LmFkanVzdGVkU2NhbGUueSlcbiAgICBAYWRkQ2hpbGQgc3ByaXRlXG4gICAgcmV0dXJuIHNwcml0ZVxufVxuXG5jbGFzcyBUaWxlc2hlZXRcbiAgY29uc3RydWN0b3I6IChAcmVzb3VyY2UsIEB3aWR0aCwgQGhlaWdodCwgQHN0cmlkZSkgLT5cbiAgICBAYWRqdXN0ZWRTY2FsZSA9XG4gICAgICB4OiAxICsgU0NBTEVfRlVER0VfRkFDVE9SICsgKFBJWEVMX0ZVREdFX0ZBQ1RPUiAvIEB3aWR0aClcbiAgICAgIHk6IDEgKyBTQ0FMRV9GVURHRV9GQUNUT1IgKyAoUElYRUxfRlVER0VfRkFDVE9SIC8gQGhlaWdodClcblxuICByZWN0OiAodikgLT5cbiAgICB5ID0gTWF0aC5mbG9vcih2IC8gQHN0cmlkZSlcbiAgICB4ID0gdiAlIEBzdHJpZGVcbiAgICByZXR1cm4gY2MucmVjdCh4ICogQHdpZHRoLCB5ICogQGhlaWdodCwgQHdpZHRoIC0gUElYRUxfRlVER0VfRkFDVE9SLCBAaGVpZ2h0IC0gUElYRUxfRlVER0VfRkFDVE9SKVxuXG4gIGNyZWF0ZUJhdGNoTm9kZTogKGNhcGFjaXR5KSAtPlxuICAgIGJhdGNoTm9kZSA9IG5ldyBUaWxlc2hlZXRCYXRjaE5vZGUoKVxuICAgIGJhdGNoTm9kZS50aWxlc2hlZXQgPSB0aGlzXG4gICAgYmF0Y2hOb2RlLmluaXQoQHJlc291cmNlLCBjYXBhY2l0eSlcbiAgICByZXR1cm4gYmF0Y2hOb2RlXG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZXNoZWV0XG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5QbGF5ZXIgPSByZXF1aXJlICdicmFpbi9wbGF5ZXInXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAdHVybkZyYW1lcyA9IDBcclxuICAgIEBtb2RlcyA9XHJcbiAgICAgIGludHJvOiBuZXcgSW50cm9Nb2RlKClcclxuICAgICAgZ2FtZTogbmV3IEdhbWVNb2RlKClcclxuXHJcbiAgbmV3Rmxvb3I6IC0+XHJcbiAgICBmbG9vcmdlbi5nZW5lcmF0ZSgpXHJcblxyXG4gIGN1cnJlbnRGbG9vcjogLT5cclxuICAgIHJldHVybiBAc3RhdGUuZmxvb3JzW0BzdGF0ZS5wbGF5ZXIuZmxvb3JdXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBjYy5sb2cgXCJuZXdHYW1lXCJcclxuICAgIEBzdGF0ZSA9IHtcclxuICAgICAgcnVubmluZzogZmFsc2VcclxuICAgICAgcGxheWVyOiBuZXcgUGxheWVyKHtcclxuICAgICAgICB4OiA0MFxyXG4gICAgICAgIHk6IDQwXHJcbiAgICAgICAgZmxvb3I6IDFcclxuICAgICAgfSlcclxuICAgICAgZmxvb3JzOiBbXHJcbiAgICAgICAge31cclxuICAgICAgICBAbmV3Rmxvb3IoKVxyXG4gICAgICBdXHJcbiAgICB9XHJcblxyXG4gIHNldFR1cm5GcmFtZXM6IChjb3VudCkgLT5cclxuICAgIGlmIEB0dXJuRnJhbWVzIDwgY291bnRcclxuICAgICAgQHR1cm5GcmFtZXMgPSBjb3VudFxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy51bml0U2l6ZSA9IDE2XHJcbiAgY2Mud2lkdGggPSBzaXplLndpZHRoXHJcbiAgY2MuaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcclxuICBjYy5nYW1lID0gbmV3IEdhbWUoKVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5jb25maWcgPSByZXF1aXJlICdjb25maWcnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuUGF0aGZpbmRlciA9IHJlcXVpcmUgJ3dvcmxkL3BhdGhmaW5kZXInXHJcblxyXG5jbGFzcyBHYW1lTW9kZSBleHRlbmRzIE1vZGVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKFwiR2FtZVwiKVxyXG5cclxuICB0aWxlRm9yR3JpZFZhbHVlOiAodikgLT5cclxuICAgIHN3aXRjaFxyXG4gICAgICB3aGVuIHYgPT0gZmxvb3JnZW4uV0FMTCB0aGVuIDE2XHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5ET09SIHRoZW4gNVxyXG4gICAgICB3aGVuIHYgPj0gZmxvb3JnZW4uRklSU1RfUk9PTV9JRCB0aGVuIDE4XHJcbiAgICAgIGVsc2UgMFxyXG5cclxuICBnZnhDbGVhcjogLT5cclxuICAgIGlmIEBnZng/XHJcbiAgICAgIGlmIEBnZnguZmxvb3JMYXllcj9cclxuICAgICAgICBAcmVtb3ZlIEBnZnguZmxvb3JMYXllclxyXG4gICAgQGdmeCA9IHt9XHJcblxyXG4gIGdmeFJlbmRlckZsb29yOiAtPlxyXG4gICAgZmxvb3IgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyID0gbmV3IGNjLkxheWVyKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgQGdmeC5mbG9vckJhdGNoTm9kZSA9IHJlc291cmNlcy50aWxlc2hlZXRzLnRpbGVzMC5jcmVhdGVCYXRjaE5vZGUoKGZsb29yLndpZHRoICogZmxvb3IuaGVpZ2h0KSAvIDIpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuYWRkQ2hpbGQgQGdmeC5mbG9vckJhdGNoTm9kZSwgLTFcclxuICAgIGZvciBqIGluIFswLi4uZmxvb3IuaGVpZ2h0XVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLmZsb29yLndpZHRoXVxyXG4gICAgICAgIHYgPSBmbG9vci5nZXQoaSwgailcclxuICAgICAgICBpZiB2ICE9IDBcclxuICAgICAgICAgIEBnZnguZmxvb3JCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKEB0aWxlRm9yR3JpZFZhbHVlKHYpLCBpICogY2MudW5pdFNpemUsIGogKiBjYy51bml0U2l6ZSlcclxuXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoY29uZmlnLnNjYWxlLm1pbilcclxuICAgIEBhZGQgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4Q2VudGVyTWFwKClcclxuXHJcbiAgZ2Z4UGxhY2VNYXA6IChtYXBYLCBtYXBZLCBzY3JlZW5YLCBzY3JlZW5ZKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgeCA9IHNjcmVlblggLSAobWFwWCAqIHNjYWxlKVxyXG4gICAgeSA9IHNjcmVlblkgLSAobWFwWSAqIHNjYWxlKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHgsIHkpXHJcblxyXG4gIGdmeENlbnRlck1hcDogLT5cclxuICAgIGNlbnRlciA9IGNjLmdhbWUuY3VycmVudEZsb29yKCkuYmJveC5jZW50ZXIoKVxyXG4gICAgQGdmeFBsYWNlTWFwKGNlbnRlci54ICogY2MudW5pdFNpemUsIGNlbnRlci55ICogY2MudW5pdFNpemUsIGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMilcclxuXHJcbiAgZ2Z4U2NyZWVuVG9NYXBDb29yZHM6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6ICh4IC0gcG9zLngpIC8gc2NhbGVcclxuICAgICAgeTogKHkgLSBwb3MueSkgLyBzY2FsZVxyXG4gICAgfVxyXG5cclxuICBnZnhSZW5kZXJQbGF5ZXI6IC0+XHJcbiAgICBAZ2Z4LnBsYXllciA9IHt9XHJcbiAgICBAZ2Z4LnBsYXllci5zcHJpdGUgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jcmVhdGVTcHJpdGUoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGxheWVyLnNwcml0ZSwgMFxyXG5cclxuICBnZnhBZGp1c3RNYXBTY2FsZTogKGRlbHRhKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgc2NhbGUgKz0gZGVsdGFcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1heCBpZiBzY2FsZSA+IGNvbmZpZy5zY2FsZS5tYXhcclxuICAgIHNjYWxlID0gY29uZmlnLnNjYWxlLm1pbiBpZiBzY2FsZSA8IGNvbmZpZy5zY2FsZS5taW5cclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRTY2FsZShzY2FsZSlcclxuXHJcbiAgZ2Z4UmVuZGVyUGF0aDogKHBhdGgpIC0+XHJcbiAgICBpZiBAZ2Z4LnBhdGhCYXRjaE5vZGU/XHJcbiAgICAgIEBnZnguZmxvb3JMYXllci5yZW1vdmVDaGlsZCBAZ2Z4LnBhdGhCYXRjaE5vZGVcclxuICAgIHJldHVybiBpZiBwYXRoLmxlbmd0aCA9PSAwXHJcbiAgICBAZ2Z4LnBhdGhCYXRjaE5vZGUgPSByZXNvdXJjZXMudGlsZXNoZWV0cy50aWxlczAuY3JlYXRlQmF0Y2hOb2RlKHBhdGgubGVuZ3RoKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIEBnZngucGF0aEJhdGNoTm9kZVxyXG4gICAgZm9yIHAgaW4gcGF0aFxyXG4gICAgICBzcHJpdGUgPSBAZ2Z4LnBhdGhCYXRjaE5vZGUuY3JlYXRlU3ByaXRlKDE3LCBwLnggKiBjYy51bml0U2l6ZSwgcC55ICogY2MudW5pdFNpemUpXHJcbiAgICAgIHNwcml0ZS5zZXRPcGFjaXR5KDEyOClcclxuXHJcbiAgb25EcmFnOiAoZHgsIGR5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIEBnZnguZmxvb3JMYXllci5zZXRQb3NpdGlvbihwb3MueCArIGR4LCBwb3MueSArIGR5KVxyXG5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICAgIHBvcyA9IEBnZnhTY3JlZW5Ub01hcENvb3Jkcyh4LCB5KVxyXG4gICAgQGdmeEFkanVzdE1hcFNjYWxlKGRlbHRhIC8gMjAwKVxyXG4gICAgQGdmeFBsYWNlTWFwKHBvcy54LCBwb3MueSwgeCwgeSlcclxuXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICAgIGNjLmdhbWUubmV3R2FtZSgpXHJcbiAgICBAZ2Z4Q2xlYXIoKVxyXG4gICAgQGdmeFJlbmRlckZsb29yKClcclxuICAgIEBnZnhSZW5kZXJQbGF5ZXIoKVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRTY2hlZHVsZXIoKS5zY2hlZHVsZUNhbGxiYWNrRm9yVGFyZ2V0KHRoaXMsIEB1cGRhdGUsIDEgLyA2MC4wLCBjYy5SRVBFQVRfRk9SRVZFUiwgMCwgZmFsc2UpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBjYy51bml0U2l6ZSlcclxuICAgIGdyaWRZID0gTWF0aC5mbG9vcihwb3MueSAvIGNjLnVuaXRTaXplKVxyXG5cclxuICAgIGlmIG5vdCBjYy5nYW1lLnN0YXRlLnJ1bm5pbmdcclxuICAgICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIuYWN0KGdyaWRYLCBncmlkWSlcclxuICAgICAgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nID0gdHJ1ZVxyXG4gICAgICBjYy5sb2cgXCJydW5uaW5nXCJcclxuXHJcbiAgICAjIHBhdGhmaW5kZXIgPSBuZXcgUGF0aGZpbmRlcihjYy5nYW1lLmN1cnJlbnRGbG9vcigpLCAwKVxyXG4gICAgIyBwYXRoID0gcGF0aGZpbmRlci5jYWxjKGNjLmdhbWUuc3RhdGUucGxheWVyLngsIGNjLmdhbWUuc3RhdGUucGxheWVyLnksIGdyaWRYLCBncmlkWSlcclxuICAgICMgQGdmeFJlbmRlclBhdGgocGF0aClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBjYy5nYW1lLnN0YXRlLnBsYXllci51cGRhdGVTcHJpdGUoQGdmeC5wbGF5ZXIuc3ByaXRlKVxyXG5cclxuICAgIGlmIGNjLmdhbWUudHVybkZyYW1lcyA+IDBcclxuICAgICAgY2MuZ2FtZS50dXJuRnJhbWVzLS1cclxuICAgIGVsc2VcclxuICAgICAgaWYgY2MuZ2FtZS5zdGF0ZS5ydW5uaW5nXHJcbiAgICAgICAgbWluaW11bUNEID0gMTAwMFxyXG4gICAgICAgIGlmIG1pbmltdW1DRCA+IGNjLmdhbWUuc3RhdGUucGxheWVyLmNkXHJcbiAgICAgICAgICBtaW5pbXVtQ0QgPSBjYy5nYW1lLnN0YXRlLnBsYXllci5jZFxyXG4gICAgICAgICMgVE9ETzogY2hlY2sgY2Qgb2YgYWxsIE5QQ3Mgb24gdGhlIGZsb29yIGFnYWluc3QgdGhlIG1pbmltdW1DRFxyXG4gICAgICAgIGNjLmdhbWUuc3RhdGUucGxheWVyLnRpY2sobWluaW11bUNEKVxyXG4gICAgICAgIGlmIGNjLmdhbWUuc3RhdGUucGxheWVyLmNkID09IDAgIyBXZSBqdXN0IHJhbiwgeWV0IGRpZCBub3RoaW5nXHJcbiAgICAgICAgICBjYy5nYW1lLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZVxyXG4gICAgICAgICAgY2MubG9nIFwibm90IHJ1bm5pbmdcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTW9kZVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuXG5jbGFzcyBJbnRyb01vZGUgZXh0ZW5kcyBNb2RlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKFwiSW50cm9cIilcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuaW1hZ2VzLnNwbGFzaHNjcmVlblxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucChjYy53aWR0aCAvIDIsIGNjLmhlaWdodCAvIDIpKVxuICAgIEBhZGQgQHNwcml0ZVxuXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxuICAgIGNjLmdhbWUubW9kZXMuZ2FtZS5hY3RpdmF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXG4iLCJUaWxlc2hlZXQgPSByZXF1aXJlIFwiZ2Z4L3RpbGVzaGVldFwiXHJcblxyXG5pbWFnZXMgPVxyXG4gIHNwbGFzaHNjcmVlbjogJ3Jlcy9zcGxhc2hzY3JlZW4ucG5nJ1xyXG4gIHRpbGVzMDogJ3Jlcy90aWxlczAucG5nJ1xyXG4gIHBsYXllcjogJ3Jlcy9wbGF5ZXIucG5nJ1xyXG5cclxudGlsZXNoZWV0cyA9XHJcbiAgdGlsZXMwOiBuZXcgVGlsZXNoZWV0KGltYWdlcy50aWxlczAsIDE2LCAxNiwgMTYpXHJcbiAgcGxheWVyOiBuZXcgVGlsZXNoZWV0KGltYWdlcy5wbGF5ZXIsIDEyLCAxNCwgMTgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgaW1hZ2VzOiBpbWFnZXNcclxuICB0aWxlc2hlZXRzOiB0aWxlc2hlZXRzXHJcbiAgY29jb3NQcmVsb2FkTGlzdDogKHtzcmM6IHZ9IGZvciBrLCB2IG9mIGltYWdlcylcclxuIiwiZ2Z4ID0gcmVxdWlyZSAnZ2Z4J1xucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xuXG5jbGFzcyBGbG9vciBleHRlbmRzIGdmeC5MYXllclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcigpXG4gICAgc2l6ZSA9IGNjLkRpcmVjdG9yLmdldEluc3RhbmNlKCkuZ2V0V2luU2l6ZSgpXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlbiwgY2MucmVjdCg0NTAsMzAwLDE2LDE2KVxuICAgIEBzZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxuICAgIEBzcHJpdGUuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcbiAgICBAYWRkQ2hpbGQoQHNwcml0ZSwgMClcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoMCwgMCkpXG4gICAgQHNldFBvc2l0aW9uKGNjLnAoMTAwLCAxMDApKVxuICAgIEBzZXRTY2FsZSgxMCwgMTApXG4gICAgQHNldFRvdWNoRW5hYmxlZCh0cnVlKVxuXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XG4gICAgaWYgdG91Y2hlc1xuICAgICAgeCA9IHRvdWNoZXNbMF0uZ2V0TG9jYXRpb24oKS54XG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcbiAgICAgIGNjLmxvZyBcInRvdWNoIEZsb29yIGF0ICN7eH0sICN7eX1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yXG4iLCJmcyA9IHJlcXVpcmUgJ2ZzJ1xuc2VlZFJhbmRvbSA9IHJlcXVpcmUgJ3NlZWQtcmFuZG9tJ1xuXG5TSEFQRVMgPSBbXG4gIFwiXCJcIlxuICAjIyMjIyMjIyMjIyNcbiAgIy4uLi4uLi4uLi4jXG4gICMuLi4uLi4uLi4uI1xuICAjIyMjIyMjIy4uLiNcbiAgICAgICAgICMuLi4jXG4gICAgICAgICAjLi4uI1xuICAgICAgICAgIy4uLiNcbiAgICAgICAgICMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgIyMjIyMjIyMjIyMjXG4gICMuLi4uLi4uLi4uI1xuICAjLi4uLi4uLi4uLiNcbiAgIy4uLiMjIyMjIyMjXG4gICMuLi4jXG4gICMuLi4jXG4gICMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgIyMjIyNcbiAgIy4uLiNcbiAgIy4uLiMjIyMjIyMjXG4gICMuLi4uLi4uLi4uI1xuICAjLi4uLi4uLi4uLiNcbiAgIyMjIyMjIyMjIyMjXG4gIFwiXCJcIlxuICBcIlwiXCJcbiAgICAgICMjIyNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgICAgICMuLiNcbiAgIyMjIyMuLiNcbiAgIy4uLi4uLiNcbiAgIy4uLi4uLiNcbiAgIy4uLi4uLiNcbiAgIyMjIyMjIyNcbiAgXCJcIlwiXG5dXG5cbkVNUFRZID0gMFxuV0FMTCA9IDFcbkRPT1IgPSAyXG5GSVJTVF9ST09NX0lEID0gNVxuXG52YWx1ZVRvQ29sb3IgPSAocCwgdikgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiB2ID09IFdBTEwgdGhlbiByZXR1cm4gcC5jb2xvciAzMiwgMzIsIDMyXG4gICAgd2hlbiB2ID09IERPT1IgdGhlbiByZXR1cm4gcC5jb2xvciAxMjgsIDEyOCwgMTI4XG4gICAgd2hlbiB2ID49IEZJUlNUX1JPT01fSUQgdGhlbiByZXR1cm4gcC5jb2xvciAwLCAwLCA1ICsgTWF0aC5taW4oMjQwLCAxNSArICh2ICogMikpXG4gIHJldHVybiBwLmNvbG9yIDAsIDAsIDBcblxuY2xhc3MgUmVjdFxuICBjb25zdHJ1Y3RvcjogKEBsLCBAdCwgQHIsIEBiKSAtPlxuXG4gIHc6IC0+IEByIC0gQGxcbiAgaDogLT4gQGIgLSBAdFxuICBhcmVhOiAtPiBAdygpICogQGgoKVxuICBhc3BlY3Q6IC0+XG4gICAgaWYgQGgoKSA+IDBcbiAgICAgIHJldHVybiBAdygpIC8gQGgoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiAwXG5cbiAgc3F1YXJlbmVzczogLT5cbiAgICByZXR1cm4gTWF0aC5hYnMoQHcoKSAtIEBoKCkpXG5cbiAgY2VudGVyOiAtPlxuICAgIHJldHVybiB7XG4gICAgICB4OiBNYXRoLmZsb29yKChAciArIEBsKSAvIDIpXG4gICAgICB5OiBNYXRoLmZsb29yKChAYiArIEB0KSAvIDIpXG4gICAgfVxuXG4gIGNsb25lOiAtPlxuICAgIHJldHVybiBuZXcgUmVjdChAbCwgQHQsIEByLCBAYilcblxuICBleHBhbmQ6IChyKSAtPlxuICAgIGlmIEBhcmVhKClcbiAgICAgIEBsID0gci5sIGlmIEBsID4gci5sXG4gICAgICBAdCA9IHIudCBpZiBAdCA+IHIudFxuICAgICAgQHIgPSByLnIgaWYgQHIgPCByLnJcbiAgICAgIEBiID0gci5iIGlmIEBiIDwgci5iXG4gICAgZWxzZVxuICAgICAgIyBzcGVjaWFsIGNhc2UsIGJib3ggaXMgZW1wdHkuIFJlcGxhY2UgY29udGVudHMhXG4gICAgICBAbCA9IHIubFxuICAgICAgQHQgPSByLnRcbiAgICAgIEByID0gci5yXG4gICAgICBAYiA9IHIuYlxuXG4gIHRvU3RyaW5nOiAtPiBcInsgKCN7QGx9LCAje0B0fSkgLT4gKCN7QHJ9LCAje0BifSkgI3tAdygpfXgje0BoKCl9LCBhcmVhOiAje0BhcmVhKCl9LCBhc3BlY3Q6ICN7QGFzcGVjdCgpfSwgc3F1YXJlbmVzczogI3tAc3F1YXJlbmVzcygpfSB9XCJcblxuY2xhc3MgUm9vbVRlbXBsYXRlXG4gIGNvbnN0cnVjdG9yOiAoQHdpZHRoLCBAaGVpZ2h0LCBAcm9vbWlkKSAtPlxuICAgIEBncmlkID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIEBncmlkW2ldID0gW11cbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgICAgQGdyaWRbaV1bal0gPSBFTVBUWVxuXG4gICAgQGdlbmVyYXRlU2hhcGUoKVxuXG4gIGdlbmVyYXRlU2hhcGU6IC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIEBzZXQoaSwgaiwgQHJvb21pZClcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cbiAgICAgIEBzZXQoaSwgMCwgV0FMTClcbiAgICAgIEBzZXQoaSwgQGhlaWdodCAtIDEsIFdBTEwpXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgQHNldCgwLCBqLCBXQUxMKVxuICAgICAgQHNldChAd2lkdGggLSAxLCBqLCBXQUxMKVxuXG4gIHJlY3Q6ICh4LCB5KSAtPlxuICAgIHJldHVybiBuZXcgUmVjdCB4LCB5LCB4ICsgQHdpZHRoLCB5ICsgQGhlaWdodFxuXG4gIHNldDogKGksIGosIHYpIC0+XG4gICAgQGdyaWRbaV1bal0gPSB2XG5cbiAgZ2V0OiAobWFwLCB4LCB5LCBpLCBqKSAtPlxuICAgIGlmIGkgPj0gMCBhbmQgaSA8IEB3aWR0aCBhbmQgaiA+PSAwIGFuZCBqIDwgQGhlaWdodFxuICAgICAgdiA9IEBncmlkW2ldW2pdXG4gICAgICByZXR1cm4gdiBpZiB2ICE9IEVNUFRZXG4gICAgcmV0dXJuIG1hcC5nZXQgeCArIGksIHkgKyBqXG5cbiAgcGxhY2U6IChtYXAsIHgsIHkpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIHYgPSBAZ3JpZFtpXVtqXVxuICAgICAgICBtYXAuc2V0KHggKyBpLCB5ICsgaiwgdikgaWYgdiAhPSBFTVBUWVxuXG4gIGZpdHM6IChtYXAsIHgsIHkpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXG4gICAgICAgIG12ID0gbWFwLmdldCh4ICsgaSwgeSArIGopXG4gICAgICAgIHN2ID0gQGdyaWRbaV1bal1cbiAgICAgICAgaWYgbXYgIT0gRU1QVFkgYW5kIHN2ICE9IEVNUFRZIGFuZCAobXYgIT0gV0FMTCBvciBzdiAhPSBXQUxMKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgZG9vckVsaWdpYmxlOiAobWFwLCB4LCB5LCBpLCBqKSAtPlxuICAgIHdhbGxOZWlnaGJvcnMgPSAwXG4gICAgcm9vbXNTZWVuID0ge31cbiAgICB2YWx1ZXMgPSBbXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSArIDEsIGopXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSAtIDEsIGopXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiArIDEpXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiAtIDEpXG4gICAgXVxuICAgIGZvciB2IGluIHZhbHVlc1xuICAgICAgaWYgdlxuICAgICAgICBpZiB2ID09IDFcbiAgICAgICAgICB3YWxsTmVpZ2hib3JzKytcbiAgICAgICAgZWxzZSBpZiB2ICE9IDJcbiAgICAgICAgICByb29tc1NlZW5bdl0gPSAxXG4gICAgcm9vbXMgPSBPYmplY3Qua2V5cyhyb29tc1NlZW4pLnNvcnQgKGEsIGIpIC0+IGEtYlxuICAgIHJvb21zID0gcm9vbXMubWFwIChyb29tKSAtPiBwYXJzZUludChyb29tKVxuICAgIHJvb21Db3VudCA9IHJvb21zLmxlbmd0aFxuICAgIGlmICh3YWxsTmVpZ2hib3JzID09IDIpIGFuZCAocm9vbUNvdW50ID09IDIpIGFuZCAoQHJvb21pZCBpbiByb29tcylcbiAgICAgIGlmICh2YWx1ZXNbMF0gPT0gdmFsdWVzWzFdKSBvciAodmFsdWVzWzJdID09IHZhbHVlc1szXSlcbiAgICAgICAgcmV0dXJuIHJvb21zXG4gICAgcmV0dXJuIFstMSwgLTFdXG5cbiAgZG9vckxvY2F0aW9uOiAobWFwLCB4LCB5KSAtPlxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgICByb29tcyA9IEBkb29yRWxpZ2libGUobWFwLCB4LCB5LCBpLCBqKVxuICAgICAgICBpZiByb29tc1swXSAhPSAtMSBhbmQgQHJvb21pZCBpbiByb29tc1xuICAgICAgICAgIHJldHVybiBbaSwgal1cbiAgICByZXR1cm4gWy0xLCAtMV1cblxuICBtZWFzdXJlOiAobWFwLCB4LCB5KSAtPlxuICAgIGJib3hUZW1wID0gbWFwLmJib3guY2xvbmUoKVxuICAgIGJib3hUZW1wLmV4cGFuZCBAcmVjdCh4LCB5KVxuICAgIFtiYm94VGVtcC5hcmVhKCksIGJib3hUZW1wLnNxdWFyZW5lc3MoKV1cblxuICBmaW5kQmVzdFNwb3Q6IChtYXApIC0+XG4gICAgbWluU3F1YXJlbmVzcyA9IE1hdGgubWF4IG1hcC53aWR0aCwgbWFwLmhlaWdodFxuICAgIG1pbkFyZWEgPSBtYXAud2lkdGggKiBtYXAuaGVpZ2h0XG4gICAgbWluWCA9IC0xXG4gICAgbWluWSA9IC0xXG4gICAgZG9vckxvY2F0aW9uID0gWy0xLCAtMV1cbiAgICBzZWFyY2hMID0gbWFwLmJib3gubCAtIEB3aWR0aFxuICAgIHNlYXJjaFIgPSBtYXAuYmJveC5yXG4gICAgc2VhcmNoVCA9IG1hcC5iYm94LnQgLSBAaGVpZ2h0XG4gICAgc2VhcmNoQiA9IG1hcC5iYm94LmJcbiAgICBmb3IgaSBpbiBbc2VhcmNoTCAuLi4gc2VhcmNoUl1cbiAgICAgIGZvciBqIGluIFtzZWFyY2hUIC4uLiBzZWFyY2hCXVxuICAgICAgICBpZiBAZml0cyhtYXAsIGksIGopXG4gICAgICAgICAgW2FyZWEsIHNxdWFyZW5lc3NdID0gQG1lYXN1cmUgbWFwLCBpLCBqXG4gICAgICAgICAgaWYgYXJlYSA8PSBtaW5BcmVhIGFuZCBzcXVhcmVuZXNzIDw9IG1pblNxdWFyZW5lc3NcbiAgICAgICAgICAgIGxvY2F0aW9uID0gQGRvb3JMb2NhdGlvbiBtYXAsIGksIGpcbiAgICAgICAgICAgIGlmIGxvY2F0aW9uWzBdICE9IC0xXG4gICAgICAgICAgICAgIGRvb3JMb2NhdGlvbiA9IGxvY2F0aW9uXG4gICAgICAgICAgICAgIG1pbkFyZWEgPSBhcmVhXG4gICAgICAgICAgICAgIG1pblNxdWFyZW5lc3MgPSBzcXVhcmVuZXNzXG4gICAgICAgICAgICAgIG1pblggPSBpXG4gICAgICAgICAgICAgIG1pblkgPSBqXG4gICAgcmV0dXJuIFttaW5YLCBtaW5ZLCBkb29yTG9jYXRpb25dXG5cbmNsYXNzIFNoYXBlUm9vbVRlbXBsYXRlIGV4dGVuZHMgUm9vbVRlbXBsYXRlXG4gIGNvbnN0cnVjdG9yOiAoc2hhcGUsIHJvb21pZCkgLT5cbiAgICBAbGluZXMgPSBzaGFwZS5zcGxpdChcIlxcblwiKVxuICAgIHcgPSAwXG4gICAgZm9yIGxpbmUgaW4gQGxpbmVzXG4gICAgICB3ID0gTWF0aC5tYXgodywgbGluZS5sZW5ndGgpXG4gICAgQHdpZHRoID0gd1xuICAgIEBoZWlnaHQgPSBAbGluZXMubGVuZ3RoXG4gICAgc3VwZXIgQHdpZHRoLCBAaGVpZ2h0LCByb29taWRcblxuICBnZW5lcmF0ZVNoYXBlOiAtPlxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgICBAc2V0KGksIGosIEVNUFRZKVxuICAgIGkgPSAwXG4gICAgaiA9IDBcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcbiAgICAgIGZvciBjIGluIGxpbmUuc3BsaXQoXCJcIilcbiAgICAgICAgdiA9IHN3aXRjaCBjXG4gICAgICAgICAgd2hlbiAnLicgdGhlbiBAcm9vbWlkXG4gICAgICAgICAgd2hlbiAnIycgdGhlbiBXQUxMXG4gICAgICAgICAgZWxzZSAwXG4gICAgICAgIGlmIHZcbiAgICAgICAgICBAc2V0KGksIGosIHYpXG4gICAgICAgIGkrK1xuICAgICAgaisrXG4gICAgICBpID0gMFxuXG5jbGFzcyBSb29tXG4gIGNvbnN0cnVjdG9yOiAoQHJlY3QpIC0+XG4gICAgIyBjb25zb2xlLmxvZyBcInJvb20gY3JlYXRlZCAje0ByZWN0fVwiXG5cbmNsYXNzIE1hcFxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHNlZWQpIC0+XG4gICAgQHJhbmRSZXNldCgpXG4gICAgQGdyaWQgPSBbXVxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxuICAgICAgQGdyaWRbaV0gPSBbXVxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxuICAgICAgICBAZ3JpZFtpXVtqXSA9XG4gICAgICAgICAgdHlwZTogRU1QVFlcbiAgICAgICAgICB4OiBpXG4gICAgICAgICAgeTogalxuICAgIEBiYm94ID0gbmV3IFJlY3QgMCwgMCwgMCwgMFxuICAgIEByb29tcyA9IFtdXG5cbiAgcmFuZFJlc2V0OiAtPlxuICAgIEBybmcgPSBzZWVkUmFuZG9tKEBzZWVkKVxuXG4gIHJhbmQ6ICh2KSAtPlxuICAgIHJldHVybiBNYXRoLmZsb29yKEBybmcoKSAqIHYpXG5cbiAgc2V0OiAoaSwgaiwgdikgLT5cbiAgICBAZ3JpZFtpXVtqXS50eXBlID0gdlxuXG4gIGdldDogKGksIGopIC0+XG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XG4gICAgICByZXR1cm4gQGdyaWRbaV1bal0udHlwZVxuICAgIHJldHVybiAwXG5cbiAgYWRkUm9vbTogKHJvb21UZW1wbGF0ZSwgeCwgeSkgLT5cbiAgICAjIGNvbnNvbGUubG9nIFwicGxhY2luZyByb29tIGF0ICN7eH0sICN7eX1cIlxuICAgIHJvb21UZW1wbGF0ZS5wbGFjZSB0aGlzLCB4LCB5XG4gICAgciA9IHJvb21UZW1wbGF0ZS5yZWN0KHgsIHkpXG4gICAgQHJvb21zLnB1c2ggbmV3IFJvb20gclxuICAgIEBiYm94LmV4cGFuZChyKVxuICAgICMgY29uc29sZS5sb2cgXCJuZXcgbWFwIGJib3ggI3tAYmJveH1cIlxuXG4gIHJhbmRvbVJvb21UZW1wbGF0ZTogKHJvb21pZCkgLT5cbiAgICByID0gQHJhbmQoMTAwKVxuICAgIHN3aXRjaFxuICAgICAgd2hlbiAgMCA8IHIgPCAxMCB0aGVuIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDMsIDUgKyBAcmFuZCgxMCksIHJvb21pZCAgICAgICAgICAgICAgICAgICMgdmVydGljYWwgY29ycmlkb3JcbiAgICAgIHdoZW4gMTAgPCByIDwgMjAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA1ICsgQHJhbmQoMTApLCAzLCByb29taWQgICAgICAgICAgICAgICAgICAjIGhvcml6b250YWwgY29ycmlkb3JcbiAgICAgIHdoZW4gMjAgPCByIDwgMzAgdGhlbiByZXR1cm4gbmV3IFNoYXBlUm9vbVRlbXBsYXRlIFNIQVBFU1tAcmFuZChTSEFQRVMubGVuZ3RoKV0sIHJvb21pZCAjIHJhbmRvbSBzaGFwZSBmcm9tIFNIQVBFU1xuICAgIHJldHVybiBuZXcgUm9vbVRlbXBsYXRlIDQgKyBAcmFuZCg1KSwgNCArIEByYW5kKDUpLCByb29taWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgZ2VuZXJpYyByZWN0YW5ndWxhciByb29tXG5cbiAgZ2VuZXJhdGVSb29tOiAocm9vbWlkKSAtPlxuICAgIHJvb21UZW1wbGF0ZSA9IEByYW5kb21Sb29tVGVtcGxhdGUgcm9vbWlkXG4gICAgaWYgQHJvb21zLmxlbmd0aCA9PSAwXG4gICAgICB4ID0gTWF0aC5mbG9vcigoQHdpZHRoIC8gMikgLSAocm9vbVRlbXBsYXRlLndpZHRoIC8gMikpXG4gICAgICB5ID0gTWF0aC5mbG9vcigoQGhlaWdodCAvIDIpIC0gKHJvb21UZW1wbGF0ZS5oZWlnaHQgLyAyKSlcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxuICAgIGVsc2VcbiAgICAgIFt4LCB5LCBkb29yTG9jYXRpb25dID0gcm9vbVRlbXBsYXRlLmZpbmRCZXN0U3BvdCh0aGlzKVxuICAgICAgaWYgeCA8IDBcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByb29tVGVtcGxhdGUuc2V0IGRvb3JMb2NhdGlvblswXSwgZG9vckxvY2F0aW9uWzFdLCAyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGdlbmVyYXRlUm9vbXM6IChjb3VudCkgLT5cbiAgICBmb3IgaSBpbiBbMC4uLmNvdW50XVxuICAgICAgcm9vbWlkID0gRklSU1RfUk9PTV9JRCArIGlcblxuICAgICAgYWRkZWQgPSBmYWxzZVxuICAgICAgd2hpbGUgbm90IGFkZGVkXG4gICAgICAgIGFkZGVkID0gQGdlbmVyYXRlUm9vbSByb29taWRcblxuZ2VuZXJhdGUgPSAtPlxuICBtYXAgPSBuZXcgTWFwIDgwLCA4MCwgMTBcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXG4gIHJldHVybiBtYXBcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW5lcmF0ZTogZ2VuZXJhdGVcbiAgRU1QVFk6IEVNUFRZXG4gIFdBTEw6IFdBTExcbiAgRE9PUjpET09SXG4gIEZJUlNUX1JPT01fSUQ6IEZJUlNUX1JPT01fSURcbiIsImZsb29yZ2VuID0gcmVxdWlyZSAnd29ybGQvZmxvb3JnZW4nXG5cbmNsYXNzIEJpbmFyeUhlYXBcbiAgY29uc3RydWN0b3I6IChzY29yZUZ1bmN0aW9uKSAtPlxuICAgIEBjb250ZW50ID0gW11cbiAgICBAc2NvcmVGdW5jdGlvbiA9IHNjb3JlRnVuY3Rpb25cblxuICBwdXNoOiAoZWxlbWVudCkgLT5cbiAgICAjIEFkZCB0aGUgbmV3IGVsZW1lbnQgdG8gdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgQGNvbnRlbnQucHVzaChlbGVtZW50KVxuXG4gICAgIyBBbGxvdyBpdCB0byBzaW5rIGRvd24uXG4gICAgQHNpbmtEb3duKEBjb250ZW50Lmxlbmd0aCAtIDEpXG5cbiAgcG9wOiAtPlxuICAgICMgU3RvcmUgdGhlIGZpcnN0IGVsZW1lbnQgc28gd2UgY2FuIHJldHVybiBpdCBsYXRlci5cbiAgICByZXN1bHQgPSBAY29udGVudFswXVxuICAgICMgR2V0IHRoZSBlbGVtZW50IGF0IHRoZSBlbmQgb2YgdGhlIGFycmF5LlxuICAgIGVuZCA9IEBjb250ZW50LnBvcCgpXG4gICAgIyBJZiB0aGVyZSBhcmUgYW55IGVsZW1lbnRzIGxlZnQsIHB1dCB0aGUgZW5kIGVsZW1lbnQgYXQgdGhlXG4gICAgIyBzdGFydCwgYW5kIGxldCBpdCBidWJibGUgdXAuXG4gICAgaWYgQGNvbnRlbnQubGVuZ3RoID4gMFxuICAgICAgQGNvbnRlbnRbMF0gPSBlbmRcbiAgICAgIEBidWJibGVVcCgwKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIHJlbW92ZTogKG5vZGUpIC0+XG4gICAgaSA9IEBjb250ZW50LmluZGV4T2Yobm9kZSlcblxuICAgICMgV2hlbiBpdCBpcyBmb3VuZCwgdGhlIHByb2Nlc3Mgc2VlbiBpbiAncG9wJyBpcyByZXBlYXRlZFxuICAgICMgdG8gZmlsbCB1cCB0aGUgaG9sZS5cbiAgICBlbmQgPSBAY29udGVudC5wb3AoKVxuXG4gICAgaWYgaSAhPSBAY29udGVudC5sZW5ndGggLSAxXG4gICAgICBAY29udGVudFtpXSA9IGVuZFxuXG4gICAgaWYgQHNjb3JlRnVuY3Rpb24oZW5kKSA8IEBzY29yZUZ1bmN0aW9uKG5vZGUpXG4gICAgICBAc2lua0Rvd24oaSlcbiAgICBlbHNlXG4gICAgICBAYnViYmxlVXAoaSlcblxuICBzaXplOiAtPlxuICAgIHJldHVybiBAY29udGVudC5sZW5ndGhcblxuICByZXNjb3JlRWxlbWVudDogKG5vZGUpIC0+XG4gICAgQHNpbmtEb3duKEBjb250ZW50LmluZGV4T2Yobm9kZSkpXG5cbiAgc2lua0Rvd246IChuKSAtPlxuICAgICMgRmV0Y2ggdGhlIGVsZW1lbnQgdGhhdCBoYXMgdG8gYmUgc3Vuay5cbiAgICBlbGVtZW50ID0gQGNvbnRlbnRbbl1cblxuICAgICMgV2hlbiBhdCAwLCBhbiBlbGVtZW50IGNhbiBub3Qgc2luayBhbnkgZnVydGhlci5cbiAgICB3aGlsZSAobiA+IDApXG4gICAgICAjIENvbXB1dGUgdGhlIHBhcmVudCBlbGVtZW50J3MgaW5kZXgsIGFuZCBmZXRjaCBpdC5cbiAgICAgIHBhcmVudE4gPSAoKG4gKyAxKSA+PiAxKSAtIDFcbiAgICAgIHBhcmVudCA9IEBjb250ZW50W3BhcmVudE5dXG4gICAgICAjIFN3YXAgdGhlIGVsZW1lbnRzIGlmIHRoZSBwYXJlbnQgaXMgZ3JlYXRlci5cbiAgICAgIGlmIEBzY29yZUZ1bmN0aW9uKGVsZW1lbnQpIDwgQHNjb3JlRnVuY3Rpb24ocGFyZW50KVxuICAgICAgICBAY29udGVudFtwYXJlbnROXSA9IGVsZW1lbnRcbiAgICAgICAgQGNvbnRlbnRbbl0gPSBwYXJlbnRcbiAgICAgICAgIyBVcGRhdGUgJ24nIHRvIGNvbnRpbnVlIGF0IHRoZSBuZXcgcG9zaXRpb24uXG4gICAgICAgIG4gPSBwYXJlbnROXG5cbiAgICAgICMgRm91bmQgYSBwYXJlbnQgdGhhdCBpcyBsZXNzLCBubyBuZWVkIHRvIHNpbmsgYW55IGZ1cnRoZXIuXG4gICAgICBlbHNlXG4gICAgICAgIGJyZWFrXG5cbiAgYnViYmxlVXA6IChuKSAtPlxuICAgICMgTG9vayB1cCB0aGUgdGFyZ2V0IGVsZW1lbnQgYW5kIGl0cyBzY29yZS5cbiAgICBsZW5ndGggPSBAY29udGVudC5sZW5ndGhcbiAgICBlbGVtZW50ID0gQGNvbnRlbnRbbl1cbiAgICBlbGVtU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihlbGVtZW50KVxuXG4gICAgd2hpbGUodHJ1ZSlcbiAgICAgICMgQ29tcHV0ZSB0aGUgaW5kaWNlcyBvZiB0aGUgY2hpbGQgZWxlbWVudHMuXG4gICAgICBjaGlsZDJOID0gKG4gKyAxKSA8PCAxXG4gICAgICBjaGlsZDFOID0gY2hpbGQyTiAtIDFcbiAgICAgICMgVGhpcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBuZXcgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsXG4gICAgICAjIGlmIGFueS5cbiAgICAgIHN3YXAgPSBudWxsXG4gICAgICAjIElmIHRoZSBmaXJzdCBjaGlsZCBleGlzdHMgKGlzIGluc2lkZSB0aGUgYXJyYXkpLi4uXG4gICAgICBpZiBjaGlsZDFOIDwgbGVuZ3RoXG4gICAgICAgICMgTG9vayBpdCB1cCBhbmQgY29tcHV0ZSBpdHMgc2NvcmUuXG4gICAgICAgIGNoaWxkMSA9IEBjb250ZW50W2NoaWxkMU5dXG4gICAgICAgIGNoaWxkMVNjb3JlID0gQHNjb3JlRnVuY3Rpb24oY2hpbGQxKVxuXG4gICAgICAgICMgSWYgdGhlIHNjb3JlIGlzIGxlc3MgdGhhbiBvdXIgZWxlbWVudCdzLCB3ZSBuZWVkIHRvIHN3YXAuXG4gICAgICAgIGlmIGNoaWxkMVNjb3JlIDwgZWxlbVNjb3JlXG4gICAgICAgICAgc3dhcCA9IGNoaWxkMU5cblxuICAgICAgIyBEbyB0aGUgc2FtZSBjaGVja3MgZm9yIHRoZSBvdGhlciBjaGlsZC5cbiAgICAgIGlmIGNoaWxkMk4gPCBsZW5ndGhcbiAgICAgICAgY2hpbGQyID0gQGNvbnRlbnRbY2hpbGQyTl1cbiAgICAgICAgY2hpbGQyU2NvcmUgPSBAc2NvcmVGdW5jdGlvbihjaGlsZDIpXG4gICAgICAgIGlmIGNoaWxkMlNjb3JlIDwgKHN3YXAgPT0gbnVsbCA/IGVsZW1TY29yZSA6IGNoaWxkMVNjb3JlKVxuICAgICAgICAgIHN3YXAgPSBjaGlsZDJOXG5cbiAgICAgICMgSWYgdGhlIGVsZW1lbnQgbmVlZHMgdG8gYmUgbW92ZWQsIHN3YXAgaXQsIGFuZCBjb250aW51ZS5cbiAgICAgIGlmIHN3YXAgIT0gbnVsbFxuICAgICAgICBAY29udGVudFtuXSA9IEBjb250ZW50W3N3YXBdXG4gICAgICAgIEBjb250ZW50W3N3YXBdID0gZWxlbWVudFxuICAgICAgICBuID0gc3dhcFxuXG4gICAgICAjIE90aGVyd2lzZSwgd2UgYXJlIGRvbmUuXG4gICAgICBlbHNlXG4gICAgICAgIGJyZWFrXG5cbmNsYXNzIEFTdGFyXG4gIGNvbnN0cnVjdG9yOiAoQGZsb29yKSAtPlxuICAgIGZvciB4IGluIFswLi4uQGZsb29yLndpZHRoXVxuICAgICAgZm9yIHkgaW4gWzAuLi5AZmxvb3IuaGVpZ2h0XVxuICAgICAgICBub2RlID0gQGZsb29yLmdyaWRbeF1beV1cbiAgICAgICAgbm9kZS5mID0gMFxuICAgICAgICBub2RlLmcgPSAwXG4gICAgICAgIG5vZGUuaCA9IDBcbiAgICAgICAgbm9kZS5jb3N0ID0gbm9kZS50eXBlXG4gICAgICAgIG5vZGUudmlzaXRlZCA9IGZhbHNlXG4gICAgICAgIG5vZGUuY2xvc2VkID0gZmFsc2VcbiAgICAgICAgbm9kZS5wYXJlbnQgPSBudWxsXG5cbiAgaGVhcDogLT5cbiAgICByZXR1cm4gbmV3IEJpbmFyeUhlYXAgKG5vZGUpIC0+XG4gICAgICByZXR1cm4gbm9kZS5mXG5cbiAgc2VhcmNoOiAoc3RhcnQsIGVuZCkgLT5cbiAgICBncmlkID0gQGZsb29yLmdyaWRcbiAgICBoZXVyaXN0aWMgPSBAbWFuaGF0dGFuXG5cbiAgICBvcGVuSGVhcCA9IEBoZWFwKClcbiAgICBvcGVuSGVhcC5wdXNoKHN0YXJ0KVxuXG4gICAgd2hpbGUgb3BlbkhlYXAuc2l6ZSgpID4gMFxuICAgICAgIyBHcmFiIHRoZSBsb3dlc3QgZih4KSB0byBwcm9jZXNzIG5leHQuICBIZWFwIGtlZXBzIHRoaXMgc29ydGVkIGZvciB1cy5cbiAgICAgIGN1cnJlbnROb2RlID0gb3BlbkhlYXAucG9wKClcblxuICAgICAgIyBFbmQgY2FzZSAtLSByZXN1bHQgaGFzIGJlZW4gZm91bmQsIHJldHVybiB0aGUgdHJhY2VkIHBhdGguXG4gICAgICBpZiBjdXJyZW50Tm9kZSA9PSBlbmRcbiAgICAgICAgY3VyciA9IGN1cnJlbnROb2RlXG4gICAgICAgIHJldCA9IFtdXG4gICAgICAgIHdoaWxlIGN1cnIucGFyZW50XG4gICAgICAgICAgcmV0LnB1c2goY3VycilcbiAgICAgICAgICBjdXJyID0gY3Vyci5wYXJlbnRcblxuICAgICAgICByZXR1cm4gcmV0LnJldmVyc2UoKVxuXG4gICAgICAjIE5vcm1hbCBjYXNlIC0tIG1vdmUgY3VycmVudE5vZGUgZnJvbSBvcGVuIHRvIGNsb3NlZCwgcHJvY2VzcyBlYWNoIG9mIGl0cyBuZWlnaGJvcnMuXG4gICAgICBjdXJyZW50Tm9kZS5jbG9zZWQgPSB0cnVlXG5cbiAgICAgICMgRmluZCBhbGwgbmVpZ2hib3JzIGZvciB0aGUgY3VycmVudCBub2RlLlxuICAgICAgbmVpZ2hib3JzID0gQG5laWdoYm9ycyhncmlkLCBjdXJyZW50Tm9kZSlcblxuICAgICAgZm9yIG5laWdoYm9yIGluIG5laWdoYm9yc1xuICAgICAgICBpZiBuZWlnaGJvci5jbG9zZWQgb3IgKG5laWdoYm9yLnR5cGUgPT0gZmxvb3JnZW4uV0FMTClcbiAgICAgICAgICAjIE5vdCBhIHZhbGlkIG5vZGUgdG8gcHJvY2Vzcywgc2tpcCB0byBuZXh0IG5laWdoYm9yLlxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgIyBUaGUgZyBzY29yZSBpcyB0aGUgc2hvcnRlc3QgZGlzdGFuY2UgZnJvbSBzdGFydCB0byBjdXJyZW50IG5vZGUuXG4gICAgICAgICMgV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgcGF0aCB3ZSBoYXZlIGFycml2ZWQgYXQgdGhpcyBuZWlnaGJvciBpcyB0aGUgc2hvcnRlc3Qgb25lIHdlIGhhdmUgc2VlbiB5ZXQuXG4gICAgICAgIGdTY29yZSA9IGN1cnJlbnROb2RlLmcgKyBuZWlnaGJvci5jb3N0XG4gICAgICAgIGJlZW5WaXNpdGVkID0gbmVpZ2hib3IudmlzaXRlZFxuXG4gICAgICAgIGlmIChub3QgYmVlblZpc2l0ZWQpIG9yIChnU2NvcmUgPCBuZWlnaGJvci5nKVxuICAgICAgICAgICMgRm91bmQgYW4gb3B0aW1hbCAoc28gZmFyKSBwYXRoIHRvIHRoaXMgbm9kZS4gIFRha2Ugc2NvcmUgZm9yIG5vZGUgdG8gc2VlIGhvdyBnb29kIGl0IGlzLlxuICAgICAgICAgIG5laWdoYm9yLnZpc2l0ZWQgPSB0cnVlXG4gICAgICAgICAgbmVpZ2hib3IucGFyZW50ID0gY3VycmVudE5vZGVcbiAgICAgICAgICBuZWlnaGJvci5oID0gbmVpZ2hib3IuaCBvciBoZXVyaXN0aWMobmVpZ2hib3IueCwgbmVpZ2hib3IueSwgZW5kLngsIGVuZC55KVxuICAgICAgICAgIG5laWdoYm9yLmcgPSBnU2NvcmVcbiAgICAgICAgICBuZWlnaGJvci5mID0gbmVpZ2hib3IuZyArIG5laWdoYm9yLmhcblxuICAgICAgICAgIGlmIG5vdCBiZWVuVmlzaXRlZFxuICAgICAgICAgICAgIyBQdXNoaW5nIHRvIGhlYXAgd2lsbCBwdXQgaXQgaW4gcHJvcGVyIHBsYWNlIGJhc2VkIG9uIHRoZSAnZicgdmFsdWUuXG4gICAgICAgICAgICBvcGVuSGVhcC5wdXNoKG5laWdoYm9yKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgQWxyZWFkeSBzZWVuIHRoZSBub2RlLCBidXQgc2luY2UgaXQgaGFzIGJlZW4gcmVzY29yZWQgd2UgbmVlZCB0byByZW9yZGVyIGl0IGluIHRoZSBoZWFwXG4gICAgICAgICAgICBvcGVuSGVhcC5yZXNjb3JlRWxlbWVudChuZWlnaGJvcilcblxuICAgICMgTm8gcmVzdWx0IHdhcyBmb3VuZCAtIGVtcHR5IGFycmF5IHNpZ25pZmllcyBmYWlsdXJlIHRvIGZpbmQgcGF0aC5cbiAgICByZXR1cm4gW11cblxuICBtYW5oYXR0YW46ICh4MCwgeTAsIHgxLCB5MSkgLT5cbiAgICAjIFNlZSBsaXN0IG9mIGhldXJpc3RpY3M6IGh0dHA6Ly90aGVvcnkuc3RhbmZvcmQuZWR1L35hbWl0cC9HYW1lUHJvZ3JhbW1pbmcvSGV1cmlzdGljcy5odG1sXG4gICAgZDEgPSBNYXRoLmFicyAoeDEgLSB4MClcbiAgICBkMiA9IE1hdGguYWJzICh5MSAtIHkwKVxuICAgIHJldHVybiBkMSArIGQyXG5cbiAgZGlzdFNxdWFyZWQ6ICh4MCwgeTAsIHgxLCB5MSkgLT5cbiAgICBkeCA9IHgxIC0geDBcbiAgICBkeSA9IHkxIC0geTBcbiAgICByZXR1cm4gKGR4ICogZHgpICsgKGR5ICogZHkpXG5cbiAgbmVpZ2hib3JzOiAoZ3JpZCwgbm9kZSkgLT5cbiAgICByZXQgPSBbXVxuICAgIHggPSBub2RlLnhcbiAgICB5ID0gbm9kZS55XG5cbiAgICAjIFNvdXRod2VzdFxuICAgIGlmIGdyaWRbeC0xXSBhbmQgZ3JpZFt4LTFdW3ktMV1cbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5LTFdKVxuXG4gICAgIyBTb3V0aGVhc3RcbiAgICBpZiBncmlkW3grMV0gYW5kIGdyaWRbeCsxXVt5LTFdXG4gICAgICByZXQucHVzaChncmlkW3grMV1beS0xXSlcblxuICAgICMgTm9ydGh3ZXN0XG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beSsxXVxuICAgICAgcmV0LnB1c2goZ3JpZFt4LTFdW3krMV0pXG5cbiAgICAjIE5vcnRoZWFzdFxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3krMV1cbiAgICAgIHJldC5wdXNoKGdyaWRbeCsxXVt5KzFdKVxuXG4gICAgIyBXZXN0XG4gICAgaWYgZ3JpZFt4LTFdIGFuZCBncmlkW3gtMV1beV1cbiAgICAgIHJldC5wdXNoKGdyaWRbeC0xXVt5XSlcblxuICAgICMgRWFzdFxuICAgIGlmIGdyaWRbeCsxXSBhbmQgZ3JpZFt4KzFdW3ldXG4gICAgICByZXQucHVzaChncmlkW3grMV1beV0pXG5cbiAgICAjIFNvdXRoXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5LTFdXG4gICAgICByZXQucHVzaChncmlkW3hdW3ktMV0pXG5cbiAgICAjIE5vcnRoXG4gICAgaWYgZ3JpZFt4XSBhbmQgZ3JpZFt4XVt5KzFdXG4gICAgICByZXQucHVzaChncmlkW3hdW3krMV0pXG5cbiAgICByZXR1cm4gcmV0XG5cbmNsYXNzIFBhdGhmaW5kZXJcbiAgY29uc3RydWN0b3I6IChAZmxvb3IsIEBmbGFncykgLT5cblxuICBjYWxjOiAoc3RhcnRYLCBzdGFydFksIGRlc3RYLCBkZXN0WSkgLT5cbiAgICBhc3RhciA9IG5ldyBBU3RhciBAZmxvb3JcbiAgICByZXR1cm4gYXN0YXIuc2VhcmNoKEBmbG9vci5ncmlkW3N0YXJ0WF1bc3RhcnRZXSwgQGZsb29yLmdyaWRbZGVzdFhdW2Rlc3RZXSlcblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoZmluZGVyXG4iXX0=
;