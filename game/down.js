require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],3:[function(require,module,exports){
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"q9TxCC":[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":1,"assert":6,"base64-js":4}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],4:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],5:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":5,"util":7}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg instanceof Buffer;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":5}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],4:[function(require,module,exports){
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


},{}],"base/mode":[function(require,module,exports){
module.exports=require('mhMvP9');
},{}],7:[function(require,module,exports){
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


},{"config":"tWG/YV","main":"mBOMH+","resources":"NN+gjI"}],"tWG/YV":[function(require,module,exports){
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


},{}],"mBOMH+":[function(require,module,exports){
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
    return {
      grid: floorgen.generate()
    };
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


},{"mode/game":"fSCZ8s","mode/intro":"GT1UVd","resources":"NN+gjI","world/floorgen":"4WaFsS"}],"main":[function(require,module,exports){
module.exports=require('mBOMH+');
},{}],"fSCZ8s":[function(require,module,exports){
var GameMode, Mode, SCALE_MAX, SCALE_MIN, Tilesheet, UNIT_SIZE, floorgen, resources,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mode = require('base/mode');

resources = require('resources');

floorgen = require('world/floorgen');

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
      unitSize: UNIT_SIZE
    };
  };

  GameMode.prototype.gfxRenderFloor = function() {
    var grid, i, j, sprite, tiles, v, _i, _j, _ref, _ref1;
    this.gfx.floorLayer = new cc.Layer();
    this.gfx.floorLayer.setAnchorPoint(cc.p(0, 0));
    tiles = new Tilesheet(resources.tiles0, 16, 16, 16);
    grid = cc.game.currentFloor().grid;
    for (j = _i = 0, _ref = grid.height; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = grid.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        v = grid.get(i, j);
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
    center = cc.game.currentFloor().grid.bbox.center();
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
    var gridX, gridY, pos;
    pos = this.gfxScreenToMapCoords(x, y);
    gridX = Math.floor(pos.x / this.gfx.unitSize);
    gridY = Math.floor(pos.y / this.gfx.unitSize);
    cc.game.state.player.x = gridX;
    cc.game.state.player.y = gridY;
    return this.gfxUpdatePositions();
  };

  return GameMode;

})(Mode);

module.exports = GameMode;


},{"base/mode":"mhMvP9","gfx/tilesheet":"2l7Ub8","resources":"NN+gjI","world/floorgen":"4WaFsS"}],"mode/game":[function(require,module,exports){
module.exports=require('fSCZ8s');
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


},{"base/mode":"mhMvP9","resources":"NN+gjI"}],"mode/intro":[function(require,module,exports){
module.exports=require('GT1UVd');
},{}],"resources":[function(require,module,exports){
module.exports=require('NN+gjI');
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
var Buffer=require("__browserify_Buffer").Buffer;var DOOR, EMPTY, FIRST_ROOM_ID, Map, Rect, Room, RoomTemplate, SHAPES, ShapeRoomTemplate, TYPE, WALL, fs, generate, seedRandom, valueToColor,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs');

seedRandom = require('seed-random');

TYPE = function(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
};

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
    this.width = width;
    this.height = height;
    this.roomid = roomid;
    this.grid = new Buffer(this.width * this.height);
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
    return this.grid[i + (j * this.width)] = v;
  };

  RoomTemplate.prototype.get = function(map, x, y, i, j) {
    var v;
    if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
      v = this.grid[i + (j * this.width)];
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
          v = this.grid[i + (j * this.width)];
          if (v !== EMPTY) {
            _results1.push(map.grid[x + i + ((y + j) * map.width)] = v);
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
        mv = map.grid[x + i + ((y + j) * map.width)];
        sv = this.grid[i + (j * this.width)];
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
    this.grid = new Buffer(this.width * this.height);
    this.bbox = new Rect(0, 0, 0, 0);
    this.rooms = [];
    for (j = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; j = 0 <= _ref ? ++_i : --_i) {
      for (i = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        this.set(i, j, EMPTY);
      }
    }
  }

  Map.prototype.randReset = function() {
    return this.rng = seedRandom(this.seed);
  };

  Map.prototype.rand = function(v) {
    return Math.floor(this.rng() * v);
  };

  Map.prototype.set = function(i, j, v) {
    return this.grid[i + (j * this.width)] = v;
  };

  Map.prototype.get = function(i, j) {
    if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
      return this.grid[i + (j * this.width)];
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
  var H, W, map;
  W = 80;
  H = 80;
  map = new Map(W, H, 10);
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


},{"__browserify_Buffer":3,"fs":2,"seed-random":4}],"world/floorgen":[function(require,module,exports){
module.exports=require('4WaFsS');
},{}]},{},[7])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcX2VtcHR5LmpzIiwiIC4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1idWlsdGluc1xcYnVpbHRpblxcZnMuanMiLCIgLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxpbnNlcnQtbW9kdWxlLWdsb2JhbHNcXGJ1ZmZlci5qcyIsIiAuLlxcbm9kZV9tb2R1bGVzXFxzZWVkLXJhbmRvbVxcaW5kZXguanMiLCIgLi5cXHNyY1xcYmFzZVxcbW9kZS5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcYm9vdC5jb2ZmZWUiLCIgLi5cXHNyY1xcYm9vdFxcbWFpbmRyb2lkLmNvZmZlZSIsIiAuLlxcc3JjXFxib290XFxtYWlud2ViLmNvZmZlZSIsIiAuLlxcc3JjXFxjb25maWcuY29mZmVlIiwiIC4uXFxzcmNcXGdmeC5jb2ZmZWUiLCIgLi5cXHNyY1xcZ2Z4XFx0aWxlc2hlZXQuY29mZmVlIiwiIC4uXFxzcmNcXG1haW4uY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGdhbWUuY29mZmVlIiwiIC4uXFxzcmNcXG1vZGVcXGludHJvLmNvZmZlZSIsIiAuLlxcc3JjXFxyZXNvdXJjZXMuY29mZmVlIiwiIC4uXFxzcmNcXHdvcmxkXFxmbG9vci5jb2ZmZWUiLCIgLi5cXHNyY1xcd29ybGRcXGZsb29yZ2VuLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMTBFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQSxJQUFBLHVEQUFBOztBQUFBLENBQUEsQ0FBQSxDQUF1Qixp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QUFPWCxDQWxUQSxFQW1URSxHQURJLENBQU47Q0FDRSxDQUFBLE1BQUE7Q0FBQSxDQUNBLEdBQUE7Q0FEQSxDQUVBLEVBQUE7Q0FGQSxDQUdBLEVBQUE7Q0FIQSxDQUlBLFdBQUE7Q0F2VEYsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiXG4vLyBub3QgaW1wbGVtZW50ZWRcbi8vIFRoZSByZWFzb24gZm9yIGhhdmluZyBhbiBlbXB0eSBmaWxlIGFuZCBub3QgdGhyb3dpbmcgaXMgdG8gYWxsb3dcbi8vIHVudHJhZGl0aW9uYWwgaW1wbGVtZW50YXRpb24gb2YgdGhpcyBtb2R1bGUuXG4iLCJyZXF1aXJlPShmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbmV4cG9ydHMucmVhZElFRUU3NTQgPSBmdW5jdGlvbihidWZmZXIsIG9mZnNldCwgaXNCRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNCRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNCRSA/IDEgOiAtMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV07XG5cbiAgaSArPSBkO1xuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBzID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gZUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIGUgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBtTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXM7XG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KTtcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pO1xuICAgIGUgPSBlIC0gZUJpYXM7XG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbik7XG59O1xuXG5leHBvcnRzLndyaXRlSUVFRTc1NCA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0JFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0JFID8gLTEgOiAxLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG5cbn0se31dLFwicTlUeENDXCI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGFzc2VydDtcbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyO1xuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyO1xuQnVmZmVyLnBvb2xTaXplID0gODE5MjtcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MDtcblxuZnVuY3Rpb24gc3RyaW5ndHJpbShzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKTtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbmZ1bmN0aW9uIEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgb2Zmc2V0KSB7XG4gIGlmKCFhc3NlcnQpIGFzc2VydD0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG9mZnNldCk7XG4gIH1cbiAgdGhpcy5wYXJlbnQgPSB0aGlzO1xuICB0aGlzLm9mZnNldCA9IDA7XG5cbiAgLy8gV29yay1hcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb25cbiAgLy8gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3Mgd2hpbGUgYmFzZTY0LWpzXG4gIC8vIGRvZXMgbm90Li5cbiAgaWYgKGVuY29kaW5nID09IFwiYmFzZTY0XCIgJiYgdHlwZW9mIHN1YmplY3QgPT0gXCJzdHJpbmdcIikge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpO1xuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyBcIj1cIjsgXG4gICAgfVxuICB9XG5cbiAgdmFyIHR5cGU7XG5cbiAgLy8gQXJlIHdlIHNsaWNpbmc/XG4gIGlmICh0eXBlb2Ygb2Zmc2V0ID09PSAnbnVtYmVyJykge1xuICAgIHRoaXMubGVuZ3RoID0gY29lcmNlKGVuY29kaW5nKTtcbiAgICAvLyBzbGljaW5nIHdvcmtzLCB3aXRoIGxpbWl0YXRpb25zIChubyBwYXJlbnQgdHJhY2tpbmcvdXBkYXRlKVxuICAgIC8vIGNoZWNrIGh0dHBzOi8vZ2l0aHViLmNvbS90b290cy9idWZmZXItYnJvd3NlcmlmeS9pc3N1ZXMvMTlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpc1tpXSA9IHN1YmplY3QuZ2V0KGkrb2Zmc2V0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gICAgc3dpdGNoICh0eXBlID0gdHlwZW9mIHN1YmplY3QpIHtcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIHRoaXMubGVuZ3RoID0gY29lcmNlKHN1YmplY3QpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgdGhpcy5sZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdvYmplY3QnOiAvLyBBc3N1bWUgb2JqZWN0IGlzIGFuIGFycmF5XG4gICAgICAgIHRoaXMubGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FycmF5IG9yIHN0cmluZy4nKTtcbiAgICB9XG5cbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXkuXG4gICAgaWYgKGlzQXJyYXlJc2goc3ViamVjdCkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3ViamVjdCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgIHRoaXNbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzW2ldID0gc3ViamVjdFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnc3RyaW5nJykge1xuICAgICAgLy8gV2UgYXJlIGEgc3RyaW5nXG4gICAgICB0aGlzLmxlbmd0aCA9IHRoaXMud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzW2ldID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoaSkge1xuICBpZiAoaSA8IDAgfHwgaSA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdvb2InKTtcbiAgcmV0dXJuIHRoaXNbaV07XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldChpLCB2KSB7XG4gIGlmIChpIDwgMCB8fCBpID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ29vYicpO1xuICByZXR1cm4gdGhpc1tpXSA9IHY7XG59O1xuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgXCJ1dGY4XCIpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIHN0ci5sZW5ndGggLyAyO1xuXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoO1xuXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXR1cm4gc3RyLmxlbmd0aDtcblxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKTtcbiAgfVxufTtcblxuQnVmZmVyLnByb3RvdHlwZS51dGY4V3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgYnl0ZXMsIHBvcztcbiAgcmV0dXJuIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgdGhpcywgb2Zmc2V0LCBsZW5ndGgpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5hc2NpaVdyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGJ5dGVzLCBwb3M7XG4gIHJldHVybiBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9ICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCB0aGlzLCBvZmZzZXQsIGxlbmd0aCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLmJpbmFyeVdyaXRlID0gQnVmZmVyLnByb3RvdHlwZS5hc2NpaVdyaXRlO1xuXG5CdWZmZXIucHJvdG90eXBlLmJhc2U2NFdyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGJ5dGVzLCBwb3M7XG4gIHJldHVybiBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCB0aGlzLCBvZmZzZXQsIGxlbmd0aCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLmJhc2U2NFNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgcmV0dXJuIHJlcXVpcmUoXCJiYXNlNjQtanNcIikuZnJvbUJ5dGVBcnJheShieXRlcyk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnV0ZjhTbGljZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGJ5dGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIHZhciByZXMgPSBcIlwiO1xuICB2YXIgdG1wID0gXCJcIjtcbiAgdmFyIGkgPSAwO1xuICB3aGlsZSAoaSA8IGJ5dGVzLmxlbmd0aCkge1xuICAgIGlmIChieXRlc1tpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgICAgdG1wID0gXCJcIjtcbiAgICB9IGVsc2VcbiAgICAgIHRtcCArPSBcIiVcIiArIGJ5dGVzW2ldLnRvU3RyaW5nKDE2KTtcblxuICAgIGkrKztcbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmFzY2lpU2xpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBieXRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB2YXIgcmV0ID0gXCJcIjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gIHJldHVybiByZXQ7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuYmluYXJ5U2xpY2UgPSBCdWZmZXIucHJvdG90eXBlLmFzY2lpU2xpY2U7XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3V0ID0gW10sXG4gICAgICBsZW4gPSB0aGlzLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pO1xuICAgIGlmIChpID09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPic7XG59O1xuXG5cbkJ1ZmZlci5wcm90b3R5cGUuaGV4U2xpY2UgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aDtcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwO1xuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuO1xuXG4gIHZhciBvdXQgPSAnJztcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgodGhpc1tpXSk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG5cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKTtcbiAgc3RhcnQgPSArc3RhcnQgfHwgMDtcbiAgaWYgKHR5cGVvZiBlbmQgPT0gJ3VuZGVmaW5lZCcpIGVuZCA9IHRoaXMubGVuZ3RoO1xuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKCtlbmQgPT0gc3RhcnQpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiB0aGlzLmhleFNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0dXJuIHRoaXMudXRmOFNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0dXJuIHRoaXMuYXNjaWlTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXR1cm4gdGhpcy5iaW5hcnlTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXR1cm4gdGhpcy5iYXNlNjRTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIHJldHVybiB0aGlzLnVjczJTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKTtcbiAgfVxufTtcblxuXG5CdWZmZXIucHJvdG90eXBlLmhleFdyaXRlID0gZnVuY3Rpb24oc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSArb2Zmc2V0IHx8IDA7XG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldDtcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmc7XG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gK2xlbmd0aDtcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmc7XG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGg7XG4gIGlmIChzdHJMZW4gJSAyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKTtcbiAgfVxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDI7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KTtcbiAgICBpZiAoaXNOYU4oYnl0ZSkpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9IGJ5dGU7XG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMjtcbiAgcmV0dXJuIGk7XG59O1xuXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aDtcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gb2Zmc2V0O1xuICAgIG9mZnNldCA9IGxlbmd0aDtcbiAgICBsZW5ndGggPSBzd2FwO1xuICB9XG5cbiAgb2Zmc2V0ID0gK29mZnNldCB8fCAwO1xuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXQ7XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nO1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9ICtsZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nO1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKCk7XG5cbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gdGhpcy5oZXhXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldHVybiB0aGlzLnV0ZjhXcml0ZShzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKTtcblxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldHVybiB0aGlzLmFzY2lpV3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0dXJuIHRoaXMuYmluYXJ5V3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0dXJuIHRoaXMuYmFzZTY0V3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgICByZXR1cm4gdGhpcy51Y3MyV3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJyk7XG4gIH1cbn07XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuO1xuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4O1xuICBpbmRleCArPSBsZW47XG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXg7XG4gIHJldHVybiAwO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGg7XG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMCk7XG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pO1xuICByZXR1cm4gbmV3IEJ1ZmZlcih0aGlzLCBlbmQgLSBzdGFydCwgK3N0YXJ0KTtcbn07XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzO1xuICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGVuZCkpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aDtcbiAgfVxuICB0YXJnZXRfc3RhcnQgfHwgKHRhcmdldF9zdGFydCA9IDApO1xuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IEVycm9yKCdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpO1xuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDA7XG4gIGlmICh0YXJnZXQubGVuZ3RoID09IDAgfHwgc291cmNlLmxlbmd0aCA9PSAwKSByZXR1cm4gMDtcblxuICBpZiAodGFyZ2V0X3N0YXJ0IDwgMCB8fCB0YXJnZXRfc3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpO1xuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSBzb3VyY2UubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJyk7XG4gIH1cblxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiBzb3VyY2UubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpO1xuICB9XG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGg7XG4gIH1cblxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0O1xuICB9XG5cbiAgdmFyIHRlbXAgPSBbXTtcbiAgZm9yICh2YXIgaT1zdGFydDsgaTxlbmQ7IGkrKykge1xuICAgIGFzc2VydC5vayh0eXBlb2YgdGhpc1tpXSAhPT0gJ3VuZGVmaW5lZCcsIFwiY29weWluZyB1bmRlZmluZWQgYnVmZmVyIGJ5dGVzIVwiKTtcbiAgICB0ZW1wLnB1c2godGhpc1tpXSk7XG4gIH1cblxuICBmb3IgKHZhciBpPXRhcmdldF9zdGFydDsgaTx0YXJnZXRfc3RhcnQrdGVtcC5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldFtpXSA9IHRlbXBbaS10YXJnZXRfc3RhcnRdO1xuICB9XG59O1xuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgdmFsdWUgfHwgKHZhbHVlID0gMCk7XG4gIHN0YXJ0IHx8IChzdGFydCA9IDApO1xuICBlbmQgfHwgKGVuZCA9IHRoaXMubGVuZ3RoKTtcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKTtcbiAgfVxuICBpZiAoISh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB8fCBpc05hTih2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpO1xuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgRXJyb3IoJ2VuZCA8IHN0YXJ0Jyk7XG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMDtcbiAgaWYgKHRoaXMubGVuZ3RoID09IDApIHJldHVybiAwO1xuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0YXJ0IG91dCBvZiBib3VuZHMnKTtcbiAgfVxuXG4gIGlmIChlbmQgPCAwIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdlbmQgb3V0IG9mIGJvdW5kcycpO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWU7XG4gIH1cbn1cblxuLy8gU3RhdGljIG1ldGhvZHNcbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyKGIpIHtcbiAgcmV0dXJuIGIgaW5zdGFuY2VvZiBCdWZmZXIgfHwgYiBpbnN0YW5jZW9mIEJ1ZmZlcjtcbn07XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4gXFxcbiAgICAgIGxpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LlwiKTtcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApO1xuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF07XG4gIH1cblxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBidWYgPSBsaXN0W2ldO1xuICAgICAgdG90YWxMZW5ndGggKz0gYnVmLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aCk7XG4gIHZhciBwb3MgPSAwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXTtcbiAgICBidWYuY29weShidWZmZXIsIHBvcyk7XG4gICAgcG9zICs9IGJ1Zi5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgc3dpdGNoICgoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vLyBoZWxwZXJzXG5cbmZ1bmN0aW9uIGNvZXJjZShsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKTtcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5KHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8XG4gICAgZnVuY3Rpb24oc3ViamVjdCl7XG4gICAgICByZXR1cm4ge30udG9TdHJpbmcuYXBwbHkoc3ViamVjdCkgPT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH0pXG4gICAgKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlJc2goc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiB0b0hleChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KTtcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpO1xufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyhzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICBpZiAoc3RyLmNoYXJDb2RlQXQoaSkgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKTtcbiAgICBlbHNlIHtcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5jaGFyQXQoaSkpLnN1YnN0cigxKS5zcGxpdCgnJScpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpO1xuICAgIH1cblxuICByZXR1cm4gYnl0ZUFycmF5O1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKyApXG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goIHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRiApO1xuXG4gIHJldHVybiBieXRlQXJyYXk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoc3RyKSB7XG4gIHJldHVybiByZXF1aXJlKFwiYmFzZTY0LWpzXCIpLnRvQnl0ZUFycmF5KHN0cik7XG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3MsIGkgPSAwO1xuICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgIGlmICgoaStvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVhaztcblxuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXTtcbiAgICBpKys7XG4gIH1cbiAgcmV0dXJuIGk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKTsgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLy8gcmVhZC93cml0ZSBiaXQtdHdpZGRsaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YXIgYnVmZmVyID0gdGhpcztcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICBpZiAob2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHJldHVybjtcblxuICByZXR1cm4gYnVmZmVyW29mZnNldF07XG59O1xuXG5mdW5jdGlvbiByZWFkVUludDE2KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFyIHZhbCA9IDA7XG5cblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICBpZiAob2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHJldHVybiAwO1xuXG4gIGlmIChpc0JpZ0VuZGlhbikge1xuICAgIHZhbCA9IGJ1ZmZlcltvZmZzZXRdIDw8IDg7XG4gICAgaWYgKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICB2YWwgfD0gYnVmZmVyW29mZnNldCArIDFdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZmZXJbb2Zmc2V0XTtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0ICsgMV0gPDwgODtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gcmVhZFVJbnQzMihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhciB2YWwgPSAwO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkgcmV0dXJuIDA7XG5cbiAgaWYgKGlzQmlnRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsID0gYnVmZmVyW29mZnNldCArIDFdIDw8IDE2O1xuICAgIGlmIChvZmZzZXQgKyAyIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0ICsgMl0gPDwgODtcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgfD0gYnVmZmVyW29mZnNldCArIDNdO1xuICAgIHZhbCA9IHZhbCArIChidWZmZXJbb2Zmc2V0XSA8PCAyNCA+Pj4gMCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsID0gYnVmZmVyW29mZnNldCArIDJdIDw8IDE2O1xuICAgIGlmIChvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCB8PSBidWZmZXJbb2Zmc2V0ICsgMV0gPDwgODtcbiAgICB2YWwgfD0gYnVmZmVyW29mZnNldF07XG4gICAgaWYgKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZmZlcltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMCk7XG4gIH1cblxuICByZXR1cm4gdmFsO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuXG4vKlxuICogU2lnbmVkIGludGVnZXIgdHlwZXMsIHlheSB0ZWFtISBBIHJlbWluZGVyIG9uIGhvdyB0d28ncyBjb21wbGVtZW50IGFjdHVhbGx5XG4gKiB3b3Jrcy4gVGhlIGZpcnN0IGJpdCBpcyB0aGUgc2lnbmVkIGJpdCwgaS5lLiB0ZWxscyB1cyB3aGV0aGVyIG9yIG5vdCB0aGVcbiAqIG51bWJlciBzaG91bGQgYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmUuIElmIHRoZSB0d28ncyBjb21wbGVtZW50IHZhbHVlIGlzXG4gKiBwb3NpdGl2ZSwgdGhlbiB3ZSdyZSBkb25lLCBhcyBpdCdzIGVxdWl2YWxlbnQgdG8gdGhlIHVuc2lnbmVkIHJlcHJlc2VudGF0aW9uLlxuICpcbiAqIE5vdyBpZiB0aGUgbnVtYmVyIGlzIHBvc2l0aXZlLCB5b3UncmUgcHJldHR5IG11Y2ggZG9uZSwgeW91IGNhbiBqdXN0IGxldmVyYWdlXG4gKiB0aGUgdW5zaWduZWQgdHJhbnNsYXRpb25zIGFuZCByZXR1cm4gdGhvc2UuIFVuZm9ydHVuYXRlbHksIG5lZ2F0aXZlIG51bWJlcnNcbiAqIGFyZW4ndCBxdWl0ZSB0aGF0IHN0cmFpZ2h0Zm9yd2FyZC5cbiAqXG4gKiBBdCBmaXJzdCBnbGFuY2UsIG9uZSBtaWdodCBiZSBpbmNsaW5lZCB0byB1c2UgdGhlIHRyYWRpdGlvbmFsIGZvcm11bGEgdG9cbiAqIHRyYW5zbGF0ZSBiaW5hcnkgbnVtYmVycyBiZXR3ZWVuIHRoZSBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzIGluIHR3bydzXG4gKiBjb21wbGVtZW50LiAoVGhvdWdoIGl0IGRvZXNuJ3QgcXVpdGUgd29yayBmb3IgdGhlIG1vc3QgbmVnYXRpdmUgdmFsdWUpXG4gKiBNYWlubHk6XG4gKiAgLSBpbnZlcnQgYWxsIHRoZSBiaXRzXG4gKiAgLSBhZGQgb25lIHRvIHRoZSByZXN1bHRcbiAqXG4gKiBPZiBjb3Vyc2UsIHRoaXMgZG9lc24ndCBxdWl0ZSB3b3JrIGluIEphdmFzY3JpcHQuIFRha2UgZm9yIGV4YW1wbGUgdGhlIHZhbHVlXG4gKiBvZiAtMTI4LiBUaGlzIGNvdWxkIGJlIHJlcHJlc2VudGVkIGluIDE2IGJpdHMgKGJpZy1lbmRpYW4pIGFzIDB4ZmY4MC4gQnV0IG9mXG4gKiBjb3Vyc2UsIEphdmFzY3JpcHQgd2lsbCBkbyB0aGUgZm9sbG93aW5nOlxuICpcbiAqID4gfjB4ZmY4MFxuICogLTY1NDA5XG4gKlxuICogV2hvaCB0aGVyZSwgSmF2YXNjcmlwdCwgdGhhdCdzIG5vdCBxdWl0ZSByaWdodC4gQnV0IHdhaXQsIGFjY29yZGluZyB0b1xuICogSmF2YXNjcmlwdCB0aGF0J3MgcGVyZmVjdGx5IGNvcnJlY3QuIFdoZW4gSmF2YXNjcmlwdCBlbmRzIHVwIHNlZWluZyB0aGVcbiAqIGNvbnN0YW50IDB4ZmY4MCwgaXQgaGFzIG5vIG5vdGlvbiB0aGF0IGl0IGlzIGFjdHVhbGx5IGEgc2lnbmVkIG51bWJlci4gSXRcbiAqIGFzc3VtZXMgdGhhdCB3ZSd2ZSBpbnB1dCB0aGUgdW5zaWduZWQgdmFsdWUgMHhmZjgwLiBUaHVzLCB3aGVuIGl0IGRvZXMgdGhlXG4gKiBiaW5hcnkgbmVnYXRpb24sIGl0IGNhc3RzIGl0IGludG8gYSBzaWduZWQgdmFsdWUsIChwb3NpdGl2ZSAweGZmODApLiBUaGVuXG4gKiB3aGVuIHlvdSBwZXJmb3JtIGJpbmFyeSBuZWdhdGlvbiBvbiB0aGF0LCBpdCB0dXJucyBpdCBpbnRvIGEgbmVnYXRpdmUgbnVtYmVyLlxuICpcbiAqIEluc3RlYWQsIHdlJ3JlIGdvaW5nIHRvIGhhdmUgdG8gdXNlIHRoZSBmb2xsb3dpbmcgZ2VuZXJhbCBmb3JtdWxhLCB0aGF0IHdvcmtzXG4gKiBpbiBhIHJhdGhlciBKYXZhc2NyaXB0IGZyaWVuZGx5IHdheS4gSSdtIGdsYWQgd2UgZG9uJ3Qgc3VwcG9ydCB0aGlzIGtpbmQgb2ZcbiAqIHdlaXJkIG51bWJlcmluZyBzY2hlbWUgaW4gdGhlIGtlcm5lbC5cbiAqXG4gKiAoQklULU1BWCAtICh1bnNpZ25lZCl2YWwgKyAxKSAqIC0xXG4gKlxuICogVGhlIGFzdHV0ZSBvYnNlcnZlciwgbWF5IHRoaW5rIHRoYXQgdGhpcyBkb2Vzbid0IG1ha2Ugc2Vuc2UgZm9yIDgtYml0IG51bWJlcnNcbiAqIChyZWFsbHkgaXQgaXNuJ3QgbmVjZXNzYXJ5IGZvciB0aGVtKS4gSG93ZXZlciwgd2hlbiB5b3UgZ2V0IDE2LWJpdCBudW1iZXJzLFxuICogeW91IGRvLiBMZXQncyBnbyBiYWNrIHRvIG91ciBwcmlvciBleGFtcGxlIGFuZCBzZWUgaG93IHRoaXMgd2lsbCBsb29rOlxuICpcbiAqICgweGZmZmYgLSAweGZmODAgKyAxKSAqIC0xXG4gKiAoMHgwMDdmICsgMSkgKiAtMVxuICogKDB4MDA4MCkgKiAtMVxuICovXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YXIgYnVmZmVyID0gdGhpcztcbiAgdmFyIG5lZztcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICBpZiAob2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHJldHVybjtcblxuICBuZWcgPSBidWZmZXJbb2Zmc2V0XSAmIDB4ODA7XG4gIGlmICghbmVnKSB7XG4gICAgcmV0dXJuIChidWZmZXJbb2Zmc2V0XSk7XG4gIH1cblxuICByZXR1cm4gKCgweGZmIC0gYnVmZmVyW29mZnNldF0gKyAxKSAqIC0xKTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRJbnQxNihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhciBuZWcsIHZhbDtcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICB2YWwgPSByZWFkVUludDE2KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICBuZWcgPSB2YWwgJiAweDgwMDA7XG4gIGlmICghbmVnKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gcmVhZEludDMyKGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFyIG5lZywgdmFsO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIHZhbCA9IHJlYWRVSW50MzIoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDA7XG4gIGlmICghbmVnKSB7XG4gICAgcmV0dXJuICh2YWwpO1xuICB9XG5cbiAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gcmVhZEZsb2F0KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIHJldHVybiByZXF1aXJlKCcuL2J1ZmZlcl9pZWVlNzU0JykucmVhZElFRUU3NTQoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLFxuICAgICAgMjMsIDQpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiByZWFkRG91YmxlKGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDcgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcbiAgfVxuXG4gIHJldHVybiByZXF1aXJlKCcuL2J1ZmZlcl9pZWVlNzU0JykucmVhZElFRUU3NTQoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLFxuICAgICAgNTIsIDgpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXQgaXNcbiAqIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90IGV4Y2VlZCB0aGVcbiAqIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqXG4gKiAgICAgIHZhbHVlICAgICAgICAgICBUaGUgbnVtYmVyIHRvIGNoZWNrIGZvciB2YWxpZGl0eVxuICpcbiAqICAgICAgbWF4ICAgICAgICAgICAgIFRoZSBtYXhpbXVtIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydC5vayh0eXBlb2YgKHZhbHVlKSA9PSAnbnVtYmVyJyxcbiAgICAgICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlID49IDAsXG4gICAgICAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKTtcblxuICBhc3NlcnQub2sodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpO1xuXG4gIGFzc2VydC5vayhNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YXIgYnVmZmVyID0gdGhpcztcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpO1xuICB9XG5cbiAgaWYgKG9mZnNldCA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBidWZmZXJbb2Zmc2V0XSA9IHZhbHVlO1xuICB9XG59O1xuXG5mdW5jdGlvbiB3cml0ZVVJbnQxNihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZik7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgubWluKGJ1ZmZlci5sZW5ndGggLSBvZmZzZXQsIDIpOyBpKyspIHtcbiAgICBidWZmZXJbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChpc0JpZ0VuZGlhbiA/IDEgLSBpIDogaSkpKSkgPj4+XG4gICAgICAgICAgICAoaXNCaWdFbmRpYW4gPyAxIC0gaSA6IGkpICogODtcbiAgfVxuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZVVJbnQzMihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLm1pbihidWZmZXIubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSsrKSB7XG4gICAgYnVmZmVyW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAoaXNCaWdFbmRpYW4gPyAzIC0gaSA6IGkpICogOCkgJiAweGZmO1xuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5cbi8qXG4gKiBXZSBub3cgbW92ZSBvbnRvIG91ciBmcmllbmRzIGluIHRoZSBzaWduZWQgbnVtYmVyIGNhdGVnb3J5LiBVbmxpa2UgdW5zaWduZWRcbiAqIG51bWJlcnMsIHdlJ3JlIGdvaW5nIHRvIGhhdmUgdG8gd29ycnkgYSBiaXQgbW9yZSBhYm91dCBob3cgd2UgcHV0IHZhbHVlcyBpbnRvXG4gKiBhcnJheXMuIFNpbmNlIHdlIGFyZSBvbmx5IHdvcnJ5aW5nIGFib3V0IHNpZ25lZCAzMi1iaXQgdmFsdWVzLCB3ZSdyZSBpblxuICogc2xpZ2h0bHkgYmV0dGVyIHNoYXBlLiBVbmZvcnR1bmF0ZWx5LCB3ZSByZWFsbHkgY2FuJ3QgZG8gb3VyIGZhdm9yaXRlIGJpbmFyeVxuICogJiBpbiB0aGlzIHN5c3RlbS4gSXQgcmVhbGx5IHNlZW1zIHRvIGRvIHRoZSB3cm9uZyB0aGluZy4gRm9yIGV4YW1wbGU6XG4gKlxuICogPiAtMzIgJiAweGZmXG4gKiAyMjRcbiAqXG4gKiBXaGF0J3MgaGFwcGVuaW5nIGFib3ZlIGlzIHJlYWxseTogMHhlMCAmIDB4ZmYgPSAweGUwLiBIb3dldmVyLCB0aGUgcmVzdWx0cyBvZlxuICogdGhpcyBhcmVuJ3QgdHJlYXRlZCBhcyBhIHNpZ25lZCBudW1iZXIuIFVsdGltYXRlbHkgYSBiYWQgdGhpbmcuXG4gKlxuICogV2hhdCB3ZSdyZSBnb2luZyB0byB3YW50IHRvIGRvIGlzIGJhc2ljYWxseSBjcmVhdGUgdGhlIHVuc2lnbmVkIGVxdWl2YWxlbnQgb2ZcbiAqIG91ciByZXByZXNlbnRhdGlvbiBhbmQgcGFzcyB0aGF0IG9mZiB0byB0aGUgd3VpbnQqIGZ1bmN0aW9ucy4gVG8gZG8gdGhhdFxuICogd2UncmUgZ29pbmcgdG8gZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAgLSBpZiB0aGUgdmFsdWUgaXMgcG9zaXRpdmVcbiAqICAgICAgd2UgY2FuIHBhc3MgaXQgZGlyZWN0bHkgb2ZmIHRvIHRoZSBlcXVpdmFsZW50IHd1aW50XG4gKiAgLSBpZiB0aGUgdmFsdWUgaXMgbmVnYXRpdmVcbiAqICAgICAgd2UgZG8gdGhlIGZvbGxvd2luZyBjb21wdXRhdGlvbjpcbiAqICAgICAgICAgbWIgKyB2YWwgKyAxLCB3aGVyZVxuICogICAgICAgICBtYiAgIGlzIHRoZSBtYXhpbXVtIHVuc2lnbmVkIHZhbHVlIGluIHRoYXQgYnl0ZSBzaXplXG4gKiAgICAgICAgIHZhbCAgaXMgdGhlIEphdmFzY3JpcHQgbmVnYXRpdmUgaW50ZWdlclxuICpcbiAqXG4gKiBBcyBhIGNvbmNyZXRlIHZhbHVlLCB0YWtlIC0xMjguIEluIHNpZ25lZCAxNiBiaXRzIHRoaXMgd291bGQgYmUgMHhmZjgwLiBJZlxuICogeW91IGRvIG91dCB0aGUgY29tcHV0YXRpb25zOlxuICpcbiAqIDB4ZmZmZiAtIDEyOCArIDFcbiAqIDB4ZmZmZiAtIDEyN1xuICogMHhmZjgwXG4gKlxuICogWW91IGNhbiB0aGVuIGVuY29kZSB0aGlzIHZhbHVlIGFzIHRoZSBzaWduZWQgdmVyc2lvbi4gVGhpcyBpcyByZWFsbHkgcmF0aGVyXG4gKiBoYWNreSwgYnV0IGl0IHNob3VsZCB3b3JrIGFuZCBnZXQgdGhlIGpvYiBkb25lIHdoaWNoIGlzIG91ciBnb2FsIGhlcmUuXG4gKi9cblxuLypcbiAqIEEgc2VyaWVzIG9mIGNoZWNrcyB0byBtYWtlIHN1cmUgd2UgYWN0dWFsbHkgaGF2ZSBhIHNpZ25lZCAzMi1iaXQgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHZlcmlmc2ludCh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0Lm9rKHR5cGVvZiAodmFsdWUpID09ICdudW1iZXInLFxuICAgICAgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKTtcblxuICBhc3NlcnQub2sodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKTtcblxuICBhc3NlcnQub2soTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKTtcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0KHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQub2sodHlwZW9mICh2YWx1ZSkgPT0gJ251bWJlcicsXG4gICAgICAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKTtcblxuICBhc3NlcnQub2sodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpO1xufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhciBidWZmZXIgPSB0aGlzO1xuXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApO1xuICB9XG5cbiAgaWYgKHZhbHVlID49IDApIHtcbiAgICBidWZmZXIud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHdyaXRlSW50MTYoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApO1xuICB9XG5cbiAgaWYgKHZhbHVlID49IDApIHtcbiAgICB3cml0ZVVJbnQxNihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIH0gZWxzZSB7XG4gICAgd3JpdGVVSW50MTYoYnVmZmVyLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuXG5mdW5jdGlvbiB3cml0ZUludDMyKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApO1xuICB9XG5cbiAgaWYgKHZhbHVlID49IDApIHtcbiAgICB3cml0ZVVJbnQzMihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIH0gZWxzZSB7XG4gICAgd3JpdGVVSW50MzIoYnVmZmVyLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gd3JpdGVGbG9hdChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KTtcbiAgfVxuXG4gIHJlcXVpcmUoJy4vYnVmZmVyX2llZWU3NTQnKS53cml0ZUlFRUU3NTQoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbixcbiAgICAgIDIzLCA0KTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gd3JpdGVEb3VibGUoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyA3IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KTtcbiAgfVxuXG4gIHJlcXVpcmUoJy4vYnVmZmVyX2llZWU3NTQnKS53cml0ZUlFRUU3NTQoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbixcbiAgICAgIDUyLCA4KTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbn0se1wiLi9idWZmZXJfaWVlZTc1NFwiOjEsXCJhc3NlcnRcIjo2LFwiYmFzZTY0LWpzXCI6NH1dLFwiYnVmZmVyLWJyb3dzZXJpZnlcIjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5tb2R1bGUuZXhwb3J0cz1yZXF1aXJlKCdxOVR4Q0MnKTtcbn0se31dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5KGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyO1xuXHRcblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyAnSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCc7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHBsYWNlSG9sZGVycyA9IGI2NC5pbmRleE9mKCc9Jyk7XG5cdFx0cGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSBwbGFjZUhvbGRlcnMgOiAwO1xuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gW107Ly9uZXcgVWludDhBcnJheShiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpO1xuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoO1xuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGxvb2t1cC5pbmRleE9mKGI2NFtpXSkgPDwgMTgpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pIDw8IDEyKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA8PCA2KSB8IGxvb2t1cC5pbmRleE9mKGI2NFtpICsgM10pO1xuXHRcdFx0YXJyLnB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNik7XG5cdFx0XHRhcnIucHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDIpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pID4+IDQpO1xuXHRcdFx0YXJyLnB1c2godG1wICYgMHhGRik7XG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDEwKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA8PCA0KSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA+PiAyKTtcblx0XHRcdGFyci5wdXNoKCh0bXAgPj4gOCkgJiAweEZGKTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0KHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGg7XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdO1xuXHRcdH07XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKTtcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcCk7XG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbdGVtcCA+PiAyXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA8PCA0KSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gJz09Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwW3RlbXAgPj4gMTBdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wID4+IDQpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPDwgMikgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9ICc9Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXk7XG5cdG1vZHVsZS5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0O1xufSgpKTtcblxufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cblxuLy9cbi8vIFRoZSBzaGltcyBpbiB0aGlzIGZpbGUgYXJlIG5vdCBmdWxseSBpbXBsZW1lbnRlZCBzaGltcyBmb3IgdGhlIEVTNVxuLy8gZmVhdHVyZXMsIGJ1dCBkbyB3b3JrIGZvciB0aGUgcGFydGljdWxhciB1c2VjYXNlcyB0aGVyZSBpcyBpblxuLy8gdGhlIG90aGVyIG1vZHVsZXMuXG4vL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gQXJyYXkuaXNBcnJheSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5mdW5jdGlvbiBpc0FycmF5KHhzKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cbmV4cG9ydHMuaXNBcnJheSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nID8gQXJyYXkuaXNBcnJheSA6IGlzQXJyYXk7XG5cbi8vIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YoeHMsIHgpIHtcbiAgaWYgKHhzLmluZGV4T2YpIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHggPT09IHhzW2ldKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuZmlsdGVyIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyKHhzLCBmbikge1xuICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGZuKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZuKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmZvckVhY2ggaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaCh4cywgZm4sIHNlbGYpIHtcbiAgaWYgKHhzLmZvckVhY2gpIHJldHVybiB4cy5mb3JFYWNoKGZuLCBzZWxmKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIGZuLmNhbGwoc2VsZiwgeHNbaV0sIGksIHhzKTtcbiAgfVxufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLm1hcCBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uIG1hcCh4cywgZm4pIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmbik7XG4gIHZhciBvdXQgPSBuZXcgQXJyYXkoeHMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIG91dFtpXSA9IGZuKHhzW2ldLCBpLCB4cyk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5yZWR1Y2UgPSBmdW5jdGlvbiByZWR1Y2UoYXJyYXksIGNhbGxiYWNrLCBvcHRfaW5pdGlhbFZhbHVlKSB7XG4gIGlmIChhcnJheS5yZWR1Y2UpIHJldHVybiBhcnJheS5yZWR1Y2UoY2FsbGJhY2ssIG9wdF9pbml0aWFsVmFsdWUpO1xuICB2YXIgdmFsdWUsIGlzVmFsdWVTZXQgPSBmYWxzZTtcblxuICBpZiAoMiA8IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB2YWx1ZSA9IG9wdF9pbml0aWFsVmFsdWU7XG4gICAgaXNWYWx1ZVNldCA9IHRydWU7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGwgPiBpOyArK2kpIHtcbiAgICBpZiAoYXJyYXkuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgIGlmIChpc1ZhbHVlU2V0KSB7XG4gICAgICAgIHZhbHVlID0gY2FsbGJhY2sodmFsdWUsIGFycmF5W2ldLCBpLCBhcnJheSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBhcnJheVtpXTtcbiAgICAgICAgaXNWYWx1ZVNldCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxuaWYgKCdhYicuc3Vic3RyKC0xKSAhPT0gJ2InKSB7XG4gIGV4cG9ydHMuc3Vic3RyID0gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbmd0aCkge1xuICAgIC8vIGRpZCB3ZSBnZXQgYSBuZWdhdGl2ZSBzdGFydCwgY2FsY3VsYXRlIGhvdyBtdWNoIGl0IGlzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgc3RyaW5nXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG5cbiAgICAvLyBjYWxsIHRoZSBvcmlnaW5hbCBmdW5jdGlvblxuICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW5ndGgpO1xuICB9O1xufSBlbHNlIHtcbiAgZXhwb3J0cy5zdWJzdHIgPSBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbmd0aCk7XG4gIH07XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUudHJpbSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLnRyaW0gPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufTtcblxuLy8gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHZhciBmbiA9IGFyZ3Muc2hpZnQoKTtcbiAgaWYgKGZuLmJpbmQpIHJldHVybiBmbi5iaW5kLmFwcGx5KGZuLCBhcmdzKTtcbiAgdmFyIHNlbGYgPSBhcmdzLnNoaWZ0KCk7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgZm4uYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoW0FycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyldKSk7XG4gIH07XG59O1xuXG4vLyBPYmplY3QuY3JlYXRlIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgdmFyIG9iamVjdDtcbiAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuICAgIG9iamVjdCA9IHsgJ19fcHJvdG9fXycgOiBudWxsIH07XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAndHlwZW9mIHByb3RvdHlwZVsnICsgKHR5cGVvZiBwcm90b3R5cGUpICsgJ10gIT0gXFwnb2JqZWN0XFwnJ1xuICAgICAgKTtcbiAgICB9XG4gICAgdmFyIFR5cGUgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgIG9iamVjdC5fX3Byb3RvX18gPSBwcm90b3R5cGU7XG4gIH1cbiAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcykge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG9iamVjdCwgcHJvcGVydGllcyk7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cbmV4cG9ydHMuY3JlYXRlID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicgPyBPYmplY3QuY3JlYXRlIDogY3JlYXRlO1xuXG4vLyBPYmplY3Qua2V5cyBhbmQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgaXMgc3VwcG9ydGVkIGluIElFOSBob3dldmVyXG4vLyB0aGV5IGRvIHNob3cgYSBkZXNjcmlwdGlvbiBhbmQgbnVtYmVyIHByb3BlcnR5IG9uIEVycm9yIG9iamVjdHNcbmZ1bmN0aW9uIG5vdE9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICgodHlwZW9mIG9iamVjdCAhPSBcIm9iamVjdFwiICYmIHR5cGVvZiBvYmplY3QgIT0gXCJmdW5jdGlvblwiKSB8fCBvYmplY3QgPT09IG51bGwpO1xufVxuXG5mdW5jdGlvbiBrZXlzU2hpbShvYmplY3QpIHtcbiAgaWYgKG5vdE9iamVjdChvYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5rZXlzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIG5hbWUgaW4gb2JqZWN0KSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBuYW1lKSkge1xuICAgICAgcmVzdWx0LnB1c2gobmFtZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIGdldE93blByb3BlcnR5TmFtZXMgaXMgYWxtb3N0IHRoZSBzYW1lIGFzIE9iamVjdC5rZXlzIG9uZSBrZXkgZmVhdHVyZVxuLy8gIGlzIHRoYXQgaXQgcmV0dXJucyBoaWRkZW4gcHJvcGVydGllcywgc2luY2UgdGhhdCBjYW4ndCBiZSBpbXBsZW1lbnRlZCxcbi8vICB0aGlzIGZlYXR1cmUgZ2V0cyByZWR1Y2VkIHNvIGl0IGp1c3Qgc2hvd3MgdGhlIGxlbmd0aCBwcm9wZXJ0eSBvbiBhcnJheXNcbmZ1bmN0aW9uIHByb3BlcnR5U2hpbShvYmplY3QpIHtcbiAgaWYgKG5vdE9iamVjdChvYmplY3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIGNhbGxlZCBvbiBhIG5vbi1vYmplY3RcIik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ga2V5c1NoaW0ob2JqZWN0KTtcbiAgaWYgKGV4cG9ydHMuaXNBcnJheShvYmplY3QpICYmIGV4cG9ydHMuaW5kZXhPZihvYmplY3QsICdsZW5ndGgnKSA9PT0gLTEpIHtcbiAgICByZXN1bHQucHVzaCgnbGVuZ3RoJyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIGtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgPyBPYmplY3Qua2V5cyA6IGtleXNTaGltO1xudmFyIGdldE93blByb3BlcnR5TmFtZXMgPSB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgPT09ICdmdW5jdGlvbicgP1xuICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyA6IHByb3BlcnR5U2hpbTtcblxuaWYgKG5ldyBFcnJvcigpLmhhc093blByb3BlcnR5KCdkZXNjcmlwdGlvbicpKSB7XG4gIHZhciBFUlJPUl9QUk9QRVJUWV9GSUxURVIgPSBmdW5jdGlvbiAob2JqLCBhcnJheSkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEVycm9yXScpIHtcbiAgICAgIGFycmF5ID0gZXhwb3J0cy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiBuYW1lICE9PSAnZGVzY3JpcHRpb24nICYmIG5hbWUgIT09ICdudW1iZXInICYmIG5hbWUgIT09ICdtZXNzYWdlJztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBFUlJPUl9QUk9QRVJUWV9GSUxURVIob2JqZWN0LCBrZXlzKG9iamVjdCkpO1xuICB9O1xuICBleHBvcnRzLmdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEVSUk9SX1BST1BFUlRZX0ZJTFRFUihvYmplY3QsIGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSk7XG4gIH07XG59IGVsc2Uge1xuICBleHBvcnRzLmtleXMgPSBrZXlzO1xuICBleHBvcnRzLmdldE93blByb3BlcnR5TmFtZXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xufVxuXG4vLyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIC0gc3VwcG9ydGVkIGluIElFOCBidXQgb25seSBvbiBkb20gZWxlbWVudHNcbmZ1bmN0aW9uIHZhbHVlT2JqZWN0KHZhbHVlLCBrZXkpIHtcbiAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbn1cblxuaWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gIHRyeSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih7J2EnOiAxfSwgJ2EnKTtcbiAgICBleHBvcnRzLmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJRTggZG9tIGVsZW1lbnQgaXNzdWUgLSB1c2UgYSB0cnkgY2F0Y2ggYW5kIGRlZmF1bHQgdG8gdmFsdWVPYmplY3RcbiAgICBleHBvcnRzLmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlT2JqZWN0KHZhbHVlLCBrZXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0gZWxzZSB7XG4gIGV4cG9ydHMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gdmFsdWVPYmplY3Q7XG59XG5cbn0se31dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIFVUSUxJVFlcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIHNoaW1zID0gcmVxdWlyZSgnX3NoaW1zJyk7XG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlIHx8IGdldE1lc3NhZ2UodGhpcyk7XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gc2hpbXMua2V5cyhhKSxcbiAgICAgICAga2IgPSBzaGltcy5rZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xufSx7XCJfc2hpbXNcIjo1LFwidXRpbFwiOjd9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgc2hpbXMgPSByZXF1aXJlKCdfc2hpbXMnKTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBzaGltcy5mb3JFYWNoKGFycmF5LCBmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzKTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBzaGltcy5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuXG4gIHNoaW1zLmZvckVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gc2hpbXMuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKHNoaW1zLmluZGV4T2YoY3R4LnNlZW4sIGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBzaGltcy5yZWR1Y2Uob3V0cHV0LCBmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gc2hpbXMuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmc7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiYgb2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5mdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyBpbnN0YW5jZW9mIEJ1ZmZlcjtcbn1cbmV4cG9ydHMuaXNCdWZmZXIgPSBpc0J1ZmZlcjtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IHNoaW1zLmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59LHtcIl9zaGltc1wiOjV9XX0se30sW10pXG47O21vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJidWZmZXItYnJvd3NlcmlmeVwiKVxuIiwidmFyIHdpZHRoID0gMjU2Oy8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcclxudmFyIGNodW5rcyA9IDY7Ly8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxyXG52YXIgc2lnbmlmaWNhbmNlID0gNTI7Ly8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxyXG5cclxudmFyIG92ZXJmbG93LCBzdGFydGRlbm9tOyAvL251bWJlcnNcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG92ZXJSaWRlR2xvYmFsKSB7XHJcbiAgaWYgKCFzZWVkKSB7XHJcbiAgICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgICAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2xkUmFuZG9tO1xyXG4gIH1cclxuICB2YXIga2V5ID0gW107XHJcbiAgdmFyIGFyYzQ7XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHNlZWQgPSBtaXhrZXkoZmxhdHRlbihzZWVkLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE92ZXJyaWRlIE1hdGgucmFuZG9tXHJcblxyXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcclxuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxyXG5cclxuICBmdW5jdGlvbiByYW5kb20oKSB7ICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpOyAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgIHZhciBkID0gc3RhcnRkZW5vbTsgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICB2YXIgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfVxyXG4gIHJhbmRvbS5zZWVkID0gc2VlZDtcclxuICBpZiAob3ZlclJpZGVHbG9iYWwpIHtcclxuICAgIE1hdGhbJ3JhbmRvbSddID0gcmFuZG9tO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBzZWVkIHRoYXQgd2FzIHVzZWRcclxuICByZXR1cm4gcmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCB1LCBtZSA9IHRoaXMsIGtleWxlbiA9IGtleS5sZW5ndGg7XHJcbiAgdmFyIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSBtZS5tID0gMDtcclxuICBtZS5TID0gW107XHJcbiAgbWUuYyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7IG1lLlNbaV0gPSBpKys7IH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgdCA9IG1lLlNbaV07XHJcbiAgICBqID0gbG93Yml0cyhqICsgdCArIGtleVtpICUga2V5bGVuXSk7XHJcbiAgICB1ID0gbWUuU1tqXTtcclxuICAgIG1lLlNbaV0gPSB1O1xyXG4gICAgbWUuU1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgbWUuZyA9IGZ1bmN0aW9uIGdldG5leHQoY291bnQpIHtcclxuICAgIHZhciBzID0gbWUuUztcclxuICAgIHZhciBpID0gbG93Yml0cyhtZS5pICsgMSk7IHZhciB0ID0gc1tpXTtcclxuICAgIHZhciBqID0gbG93Yml0cyhtZS5qICsgdCk7IHZhciB1ID0gc1tqXTtcclxuICAgIHNbaV0gPSB1O1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgICB2YXIgciA9IHNbbG93Yml0cyh0ICsgdSldO1xyXG4gICAgd2hpbGUgKC0tY291bnQpIHtcclxuICAgICAgaSA9IGxvd2JpdHMoaSArIDEpOyB0ID0gc1tpXTtcclxuICAgICAgaiA9IGxvd2JpdHMoaiArIHQpOyB1ID0gc1tqXTtcclxuICAgICAgc1tpXSA9IHU7XHJcbiAgICAgIHNbal0gPSB0O1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1tsb3diaXRzKHQgKyB1KV07XHJcbiAgICB9XHJcbiAgICBtZS5pID0gaTtcclxuICAgIG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgfTtcclxuICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIG1lLmcod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtPYmplY3Q9fSByZXN1bHQgXHJcbiAgKiBAcGFyYW0ge3N0cmluZz19IHByb3BcclxuICAqIEBwYXJhbSB7c3RyaW5nPX0gdHlwICovXHJcbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCwgcmVzdWx0LCBwcm9wLCB0eXApIHtcclxuICByZXN1bHQgPSBbXTtcclxuICB0eXAgPSB0eXBlb2Yob2JqKTtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XHJcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChwcm9wLmluZGV4T2YoJ1MnKSA8IDUpIHsgICAgLy8gQXZvaWQgRkYzIGJ1ZyAobG9jYWwvc2Vzc2lvblN0b3JhZ2UpXHJcbiAgICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IG9iaiArICh0eXAgIT0gJ3N0cmluZycgPyAnXFwwJyA6ICcnKSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge251bWJlcj19IHNtZWFyIFxyXG4gICogQHBhcmFtIHtudW1iZXI9fSBqICovXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXksIHNtZWFyLCBqKSB7XHJcbiAgc2VlZCArPSAnJzsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSBzZWVkIGlzIGEgc3RyaW5nXHJcbiAgc21lYXIgPSAwO1xyXG4gIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgaisrKSB7XHJcbiAgICBrZXlbbG93Yml0cyhqKV0gPVxyXG4gICAgICBsb3diaXRzKChzbWVhciBePSBrZXlbbG93Yml0cyhqKV0gKiAxOSkgKyBzZWVkLmNoYXJDb2RlQXQoaikpO1xyXG4gIH1cclxuICBzZWVkID0gJyc7XHJcbiAgZm9yIChqIGluIGtleSkgeyBzZWVkICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5W2pdKTsgfVxyXG4gIHJldHVybiBzZWVkO1xyXG59XHJcblxyXG4vL1xyXG4vLyBsb3diaXRzKClcclxuLy8gQSBxdWljayBcIm4gbW9kIHdpZHRoXCIgZm9yIHdpZHRoIGEgcG93ZXIgb2YgMi5cclxuLy9cclxuZnVuY3Rpb24gbG93Yml0cyhuKSB7IHJldHVybiBuICYgKHdpZHRoIC0gMSk7IH1cclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxuc3RhcnRkZW5vbSA9IE1hdGgucG93KHdpZHRoLCBjaHVua3MpO1xyXG5zaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBzaWduaWZpY2FuY2UpO1xyXG5vdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDI7XHJcbiIsIiMgaG93IG1hbnkgcGl4ZWxzIGNhbiB5b3UgZHJhZyBiZWZvcmUgaXQgaXMgYWN0dWFsbHkgY29uc2lkZXJlZCBhIGRyYWdcclxuRU5HQUdFX0RSQUdfRElTVEFOQ0UgPSAzMFxyXG5cclxuSW5wdXRMYXllciA9IGNjLkxheWVyLmV4dGVuZCB7XHJcbiAgaW5pdDogKEBtb2RlKSAtPlxyXG4gICAgQF9zdXBlcigpXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcbiAgICBAc2V0TW91c2VFbmFibGVkKHRydWUpXHJcbiAgICBAdHJhY2tlZFRvdWNoZXMgPSBbXVxyXG5cclxuICBjYWxjRGlzdGFuY2U6ICh4MSwgeTEsIHgyLCB5MikgLT5cclxuICAgIGR4ID0geDIgLSB4MVxyXG4gICAgZHkgPSB5MiAtIHkxXHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpXHJcblxyXG4gIHNldERyYWdQb2ludDogLT5cclxuICAgIEBkcmFnWCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICBAZHJhZ1kgPSBAdHJhY2tlZFRvdWNoZXNbMF0ueVxyXG5cclxuICBjYWxjUGluY2hBbmNob3I6IC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgQHBpbmNoWCA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS54ICsgQHRyYWNrZWRUb3VjaGVzWzFdLngpIC8gMilcclxuICAgICAgQHBpbmNoWSA9IE1hdGguZmxvb3IoKEB0cmFja2VkVG91Y2hlc1swXS55ICsgQHRyYWNrZWRUb3VjaGVzWzFdLnkpIC8gMilcclxuICAgICAgIyBjYy5sb2cgXCJwaW5jaCBhbmNob3Igc2V0IGF0ICN7QHBpbmNoWH0sICN7QHBpbmNoWX1cIlxyXG5cclxuICBhZGRUb3VjaDogKGlkLCB4LCB5KSAtPlxyXG4gICAgZm9yIHQgaW4gQHRyYWNrZWRUb3VjaGVzXHJcbiAgICAgIGlmIHQuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm5cclxuICAgIEB0cmFja2VkVG91Y2hlcy5wdXNoIHtcclxuICAgICAgaWQ6IGlkXHJcbiAgICAgIHg6IHhcclxuICAgICAgeTogeVxyXG4gICAgfVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAyXHJcbiAgICAgICMgV2UganVzdCBhZGRlZCBhIHNlY29uZCB0b3VjaCBzcG90LiBDYWxjdWxhdGUgdGhlIGFuY2hvciBmb3IgcGluY2hpbmcgbm93XHJcbiAgICAgIEBjYWxjUGluY2hBbmNob3IoKVxyXG4gICAgI2NjLmxvZyBcImFkZGluZyB0b3VjaCAje2lkfSwgdHJhY2tpbmcgI3tAdHJhY2tlZFRvdWNoZXMubGVuZ3RofSB0b3VjaGVzXCJcclxuXHJcbiAgcmVtb3ZlVG91Y2g6IChpZCwgeCwgeSkgLT5cclxuICAgIGluZGV4ID0gLTFcclxuICAgIGZvciBpIGluIFswLi4uQHRyYWNrZWRUb3VjaGVzLmxlbmd0aF1cclxuICAgICAgaWYgQHRyYWNrZWRUb3VjaGVzW2ldLmlkID09IGlkXHJcbiAgICAgICAgaW5kZXggPSBpXHJcbiAgICAgICAgYnJlYWtcclxuICAgIGlmIGluZGV4ICE9IC0xXHJcbiAgICAgIEB0cmFja2VkVG91Y2hlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG4gICAgICBpZiBpbmRleCA8IDJcclxuICAgICAgICAjIFdlIGp1c3QgZm9yZ290IG9uZSBvZiBvdXIgcGluY2ggdG91Y2hlcy4gUGljayBhIG5ldyBhbmNob3Igc3BvdC5cclxuICAgICAgICBAY2FsY1BpbmNoQW5jaG9yKClcclxuICAgICAgI2NjLmxvZyBcImZvcmdldHRpbmcgaWQgI3tpZH0sIHRyYWNraW5nICN7QHRyYWNrZWRUb3VjaGVzLmxlbmd0aH0gdG91Y2hlc1wiXHJcblxyXG4gIHVwZGF0ZVRvdWNoOiAoaWQsIHgsIHkpIC0+XHJcbiAgICBpbmRleCA9IC0xXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB0cmFja2VkVG91Y2hlcy5sZW5ndGhdXHJcbiAgICAgIGlmIEB0cmFja2VkVG91Y2hlc1tpXS5pZCA9PSBpZFxyXG4gICAgICAgIGluZGV4ID0gaVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICBpZiBpbmRleCAhPSAtMVxyXG4gICAgICBAdHJhY2tlZFRvdWNoZXNbaW5kZXhdLnggPSB4XHJcbiAgICAgIEB0cmFja2VkVG91Y2hlc1tpbmRleF0ueSA9IHlcclxuXHJcbiAgb25Ub3VjaGVzQmVnYW46ICh0b3VjaGVzLCBldmVudCkgLT5cclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAZHJhZ2dpbmcgPSBmYWxzZVxyXG4gICAgZm9yIHQgaW4gdG91Y2hlc1xyXG4gICAgICBwb3MgPSB0LmdldExvY2F0aW9uKClcclxuICAgICAgQGFkZFRvdWNoIHQuZ2V0SWQoKSwgcG9zLngsIHBvcy55XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID4gMVxyXG4gICAgICAjIFRoZXkncmUgcGluY2hpbmcsIGRvbid0IGV2ZW4gYm90aGVyIHRvIGVtaXQgYSBjbGlja1xyXG4gICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcblxyXG4gIG9uVG91Y2hlc01vdmVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBwcmV2RGlzdGFuY2UgPSAwXHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID49IDJcclxuICAgICAgcHJldkRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgIGlmIEB0cmFja2VkVG91Y2hlcy5sZW5ndGggPT0gMVxyXG4gICAgICBwcmV2WCA9IEB0cmFja2VkVG91Y2hlc1swXS54XHJcbiAgICAgIHByZXZZID0gQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuXHJcbiAgICBmb3IgdCBpbiB0b3VjaGVzXHJcbiAgICAgIHBvcyA9IHQuZ2V0TG9jYXRpb24oKVxyXG4gICAgICBAdXBkYXRlVG91Y2godC5nZXRJZCgpLCBwb3MueCwgcG9zLnkpXHJcblxyXG4gICAgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA9PSAxXHJcbiAgICAgICMgc2luZ2xlIHRvdWNoLCBjb25zaWRlciBkcmFnZ2luZ1xyXG4gICAgICBkcmFnRGlzdGFuY2UgPSBAY2FsY0Rpc3RhbmNlIEBkcmFnWCwgQGRyYWdZLCBAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnlcclxuICAgICAgaWYgQGRyYWdnaW5nIG9yIChkcmFnRGlzdGFuY2UgPiBFTkdBR0VfRFJBR19ESVNUQU5DRSlcclxuICAgICAgICBAZHJhZ2dpbmcgPSB0cnVlXHJcbiAgICAgICAgaWYgZHJhZ0Rpc3RhbmNlID4gMC41XHJcbiAgICAgICAgICBkeCA9IEB0cmFja2VkVG91Y2hlc1swXS54IC0gQGRyYWdYXHJcbiAgICAgICAgICBkeSA9IEB0cmFja2VkVG91Y2hlc1swXS55IC0gQGRyYWdZXHJcbiAgICAgICAgICAjY2MubG9nIFwic2luZ2xlIGRyYWc6ICN7ZHh9LCAje2R5fVwiXHJcbiAgICAgICAgICBAbW9kZS5vbkRyYWcoZHgsIGR5KVxyXG4gICAgICAgIEBzZXREcmFnUG9pbnQoKVxyXG5cclxuICAgIGVsc2UgaWYgQHRyYWNrZWRUb3VjaGVzLmxlbmd0aCA+PSAyXHJcbiAgICAgICMgYXQgbGVhc3QgdHdvIGZpbmdlcnMgcHJlc2VudCwgY2hlY2sgZm9yIHBpbmNoL3pvb21cclxuICAgICAgY3VyckRpc3RhbmNlID0gQGNhbGNEaXN0YW5jZShAdHJhY2tlZFRvdWNoZXNbMF0ueCwgQHRyYWNrZWRUb3VjaGVzWzBdLnksIEB0cmFja2VkVG91Y2hlc1sxXS54LCBAdHJhY2tlZFRvdWNoZXNbMV0ueSlcclxuICAgICAgZGVsdGFEaXN0YW5jZSA9IGN1cnJEaXN0YW5jZSAtIHByZXZEaXN0YW5jZVxyXG4gICAgICBpZiBkZWx0YURpc3RhbmNlICE9IDBcclxuICAgICAgICAjY2MubG9nIFwiZGlzdGFuY2UgZHJhZ2dlZCBhcGFydDogI3tkZWx0YURpc3RhbmNlfSBbYW5jaG9yOiAje0BwaW5jaFh9LCAje0BwaW5jaFl9XVwiXHJcbiAgICAgICAgQG1vZGUub25ab29tKEBwaW5jaFgsIEBwaW5jaFksIGRlbHRhRGlzdGFuY2UpXHJcblxyXG4gIG9uVG91Y2hlc0VuZGVkOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiBAdHJhY2tlZFRvdWNoZXMubGVuZ3RoID09IDEgYW5kIG5vdCBAZHJhZ2dpbmdcclxuICAgICAgcG9zID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpXHJcbiAgICAgICNjYy5sb2cgXCJjbGljayBhdCAje3Bvcy54fSwgI3twb3MueX1cIlxyXG4gICAgICBAbW9kZS5vbkNsaWNrKHBvcy54LCBwb3MueSlcclxuICAgIGZvciB0IGluIHRvdWNoZXNcclxuICAgICAgcG9zID0gdC5nZXRMb2NhdGlvbigpXHJcbiAgICAgIEByZW1vdmVUb3VjaCB0LmdldElkKCksIHBvcy54LCBwb3MueVxyXG5cclxuICBvblNjcm9sbFdoZWVsOiAoZXYpIC0+XHJcbiAgICBwb3MgPSBldi5nZXRMb2NhdGlvbigpXHJcbiAgICBAbW9kZS5vblpvb20ocG9zLngsIHBvcy55LCBldi5nZXRXaGVlbERlbHRhKCkpXHJcbn1cclxuXHJcbkdmeExheWVyID0gY2MuTGF5ZXIuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxufVxyXG5cclxuTW9kZVNjZW5lID0gY2MuU2NlbmUuZXh0ZW5kIHtcclxuICBpbml0OiAoQG1vZGUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuXHJcbiAgICBAaW5wdXQgPSBuZXcgSW5wdXRMYXllcigpXHJcbiAgICBAaW5wdXQuaW5pdChAbW9kZSlcclxuICAgIEBhZGRDaGlsZChAaW5wdXQpXHJcblxyXG4gICAgQGdmeCA9IG5ldyBHZnhMYXllcigpXHJcbiAgICBAZ2Z4LmluaXQoKVxyXG4gICAgQGFkZENoaWxkKEBnZngpXHJcblxyXG4gIG9uRW50ZXI6IC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIEBtb2RlLm9uQWN0aXZhdGUoKVxyXG59XHJcblxyXG5jbGFzcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT5cclxuICAgIEBzY2VuZSA9IG5ldyBNb2RlU2NlbmUoKVxyXG4gICAgQHNjZW5lLmluaXQodGhpcylcclxuICAgIEBzY2VuZS5yZXRhaW4oKVxyXG5cclxuICBhY3RpdmF0ZTogLT5cclxuICAgIGNjLmxvZyBcImFjdGl2YXRpbmcgbW9kZSAje0BuYW1lfVwiXHJcbiAgICBpZiBjYy5zYXdPbmVTY2VuZT9cclxuICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wb3BTY2VuZSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIGNjLnNhd09uZVNjZW5lID0gdHJ1ZVxyXG4gICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5wdXNoU2NlbmUoQHNjZW5lKVxyXG5cclxuICBhZGQ6IChvYmopIC0+XHJcbiAgICBAc2NlbmUuZ2Z4LmFkZENoaWxkKG9iailcclxuXHJcbiAgcmVtb3ZlOiAob2JqKSAtPlxyXG4gICAgQHNjZW5lLmdmeC5yZW1vdmVDaGlsZChvYmopXHJcblxyXG4gICMgdG8gYmUgb3ZlcnJpZGRlbiBieSBkZXJpdmVkIE1vZGVzXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICBvblpvb206ICh4LCB5LCBkZWx0YSkgLT5cclxuICBvbkRyYWc6IChkeCwgZHkpIC0+XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVcclxuIiwiaWYgZG9jdW1lbnQ/XHJcbiAgcmVxdWlyZSAnYm9vdC9tYWlud2ViJ1xyXG5lbHNlXHJcbiAgcmVxdWlyZSAnYm9vdC9tYWluZHJvaWQnXHJcbiIsInJlcXVpcmUgJ2pzYi5qcydcclxucmVxdWlyZSAnbWFpbidcclxuXHJcbm51bGxTY2VuZSA9IG5ldyBjYy5TY2VuZSgpXHJcbm51bGxTY2VuZS5pbml0KClcclxuY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5ydW5XaXRoU2NlbmUobnVsbFNjZW5lKVxyXG5jYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuIiwiY29uZmlnID0gcmVxdWlyZSAnY29uZmlnJ1xyXG5cclxuY29jb3MyZEFwcCA9IGNjLkFwcGxpY2F0aW9uLmV4dGVuZCB7XHJcbiAgY29uZmlnOiBjb25maWdcclxuICBjdG9yOiAoc2NlbmUpIC0+XHJcbiAgICBAX3N1cGVyKClcclxuICAgIGNjLkNPQ09TMkRfREVCVUcgPSBAY29uZmlnWydDT0NPUzJEX0RFQlVHJ11cclxuICAgIGNjLmluaXREZWJ1Z1NldHRpbmcoKVxyXG4gICAgY2Muc2V0dXAoQGNvbmZpZ1sndGFnJ10pXHJcbiAgICBjYy5BcHBDb250cm9sbGVyLnNoYXJlQXBwQ29udHJvbGxlcigpLmRpZEZpbmlzaExhdW5jaGluZ1dpdGhPcHRpb25zKClcclxuXHJcbiAgYXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IC0+XHJcbiAgICAgIGlmIGNjLlJlbmRlckRvZXNub3RTdXBwb3J0KClcclxuICAgICAgICAgICMgc2hvdyBJbmZvcm1hdGlvbiB0byB1c2VyXHJcbiAgICAgICAgICBhbGVydCBcIkJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IFdlYkdMXCJcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgIyBpbml0aWFsaXplIGRpcmVjdG9yXHJcbiAgICAgIGRpcmVjdG9yID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKVxyXG5cclxuICAgICAgY2MuRUdMVmlldy5nZXRJbnN0YW5jZSgpLnNldERlc2lnblJlc29sdXRpb25TaXplKDEyODAsIDcyMCwgY2MuUkVTT0xVVElPTl9QT0xJQ1kuU0hPV19BTEwpXHJcblxyXG4gICAgICAjIHR1cm4gb24gZGlzcGxheSBGUFNcclxuICAgICAgZGlyZWN0b3Iuc2V0RGlzcGxheVN0YXRzIEBjb25maWdbJ3Nob3dGUFMnXVxyXG5cclxuICAgICAgIyBzZXQgRlBTLiB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLjAvNjAgaWYgeW91IGRvbid0IGNhbGwgdGhpc1xyXG4gICAgICBkaXJlY3Rvci5zZXRBbmltYXRpb25JbnRlcnZhbCAxLjAgLyBAY29uZmlnWydmcmFtZVJhdGUnXVxyXG5cclxuICAgICAgIyBsb2FkIHJlc291cmNlc1xyXG4gICAgICByZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbiAgICAgIGNjLkxvYWRlclNjZW5lLnByZWxvYWQocmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QsIC0+XHJcbiAgICAgICAgcmVxdWlyZSAnbWFpbidcclxuICAgICAgICBudWxsU2NlbmUgPSBuZXcgY2MuU2NlbmUoKTtcclxuICAgICAgICBudWxsU2NlbmUuaW5pdCgpXHJcbiAgICAgICAgY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5yZXBsYWNlU2NlbmUobnVsbFNjZW5lKVxyXG4jICAgICAgICBjYy5nYW1lLm1vZGVzLmludHJvLmFjdGl2YXRlKClcclxuICAgICAgICBjYy5nYW1lLm1vZGVzLmdhbWUuYWN0aXZhdGUoKVxyXG4gICAgICB0aGlzKVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxufVxyXG5cclxubXlBcHAgPSBuZXcgY29jb3MyZEFwcCgpXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBDT0NPUzJEX0RFQlVHOjIgIyAwIHRvIHR1cm4gZGVidWcgb2ZmLCAxIGZvciBiYXNpYyBkZWJ1ZywgYW5kIDIgZm9yIGZ1bGwgZGVidWdcclxuICBib3gyZDpmYWxzZVxyXG4gIGNoaXBtdW5rOmZhbHNlXHJcbiAgc2hvd0ZQUzp0cnVlXHJcbiAgZnJhbWVSYXRlOjMwXHJcbiAgbG9hZEV4dGVuc2lvbjpmYWxzZVxyXG4gIHJlbmRlck1vZGU6MFxyXG4gIHRhZzonZ2FtZUNhbnZhcydcclxuICBhcHBGaWxlczogW1xyXG4gICAgJ2J1bmRsZS5qcydcclxuICBdXHJcbiIsImNsYXNzIExheWVyIGV4dGVuZHMgY2MuTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbmNsYXNzIFNjZW5lIGV4dGVuZHMgY2MuU2NlbmVcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjdG9yKClcclxuICAgIEBpbml0KClcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBMYXllcjogTGF5ZXJcclxuICBTY2VuZTogU2NlbmVcclxuIiwiXHJcbmNsYXNzIFRpbGVzaGVldFxyXG4gIGNvbnN0cnVjdG9yOiAoQHJlc291cmNlLCBAd2lkdGgsIEBoZWlnaHQsIEBzdHJpZGUpIC0+XHJcblxyXG4gIHJlY3Q6ICh2KSAtPlxyXG4gICAgeSA9IE1hdGguZmxvb3IodiAvIEBzdHJpZGUpXHJcbiAgICB4ID0gdiAlIEBzdHJpZGVcclxuICAgIHJldHVybiBjYy5yZWN0KHggKiBAd2lkdGgsIHkgKiBAaGVpZ2h0LCBAd2lkdGgsIEBoZWlnaHQpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVzaGVldFxyXG4iLCJyZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcbkludHJvTW9kZSA9IHJlcXVpcmUgJ21vZGUvaW50cm8nXHJcbkdhbWVNb2RlID0gcmVxdWlyZSAnbW9kZS9nYW1lJ1xyXG5mbG9vcmdlbiA9IHJlcXVpcmUgJ3dvcmxkL2Zsb29yZ2VuJ1xyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQG1vZGVzID1cclxuICAgICAgaW50cm86IG5ldyBJbnRyb01vZGUoKVxyXG4gICAgICBnYW1lOiBuZXcgR2FtZU1vZGUoKVxyXG5cclxuICBuZXdGbG9vcjogLT5cclxuICAgIHtcclxuICAgICAgZ3JpZDogZmxvb3JnZW4uZ2VuZXJhdGUoKVxyXG4gICAgfVxyXG5cclxuICBjdXJyZW50Rmxvb3I6IC0+XHJcbiAgICByZXR1cm4gQHN0YXRlLmZsb29yc1tAc3RhdGUucGxheWVyLmZsb29yXVxyXG5cclxuICBuZXdHYW1lOiAtPlxyXG4gICAgY2MubG9nIFwibmV3R2FtZVwiXHJcbiAgICBAc3RhdGUgPVxyXG4gICAgICBwbGF5ZXI6XHJcbiAgICAgICAgeDogNDBcclxuICAgICAgICB5OiA0MFxyXG4gICAgICAgIGZsb29yOiAxXHJcbiAgICAgIGZsb29yczogW1xyXG4gICAgICAgIHt9XHJcbiAgICAgICAgQG5ld0Zsb29yKClcclxuICAgICAgXVxyXG5cclxuaWYgbm90IGNjLmdhbWVcclxuICBzaXplID0gY2MuRGlyZWN0b3IuZ2V0SW5zdGFuY2UoKS5nZXRXaW5TaXplKClcclxuICBjYy53aWR0aCA9IHNpemUud2lkdGhcclxuICBjYy5oZWlnaHQgPSBzaXplLmhlaWdodFxyXG4gIGNjLmdhbWUgPSBuZXcgR2FtZSgpXHJcbiIsIk1vZGUgPSByZXF1aXJlICdiYXNlL21vZGUnXHJcbnJlc291cmNlcyA9IHJlcXVpcmUgJ3Jlc291cmNlcydcclxuZmxvb3JnZW4gPSByZXF1aXJlICd3b3JsZC9mbG9vcmdlbidcclxuVGlsZXNoZWV0ID0gcmVxdWlyZSAnZ2Z4L3RpbGVzaGVldCdcclxuXHJcblVOSVRfU0laRSA9IDE2XHJcblNDQUxFX01JTiA9IDIuMFxyXG5TQ0FMRV9NQVggPSA4LjBcclxuXHJcbmNsYXNzIEdhbWVNb2RlIGV4dGVuZHMgTW9kZVxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgc3VwZXIoXCJHYW1lXCIpXHJcblxyXG4gIHRpbGVGb3JHcmlkVmFsdWU6ICh2KSAtPlxyXG4gICAgc3dpdGNoXHJcbiAgICAgIHdoZW4gdiA9PSBmbG9vcmdlbi5XQUxMIHRoZW4gMTZcclxuICAgICAgd2hlbiB2ID09IGZsb29yZ2VuLkRPT1IgdGhlbiA1XHJcbiAgICAgIHdoZW4gdiA+PSBmbG9vcmdlbi5GSVJTVF9ST09NX0lEIHRoZW4gMThcclxuICAgICAgZWxzZSAwXHJcblxyXG4gIGdmeENsZWFyOiAtPlxyXG4gICAgaWYgQGdmeD9cclxuICAgICAgaWYgQGdmeC5mbG9vckxheWVyP1xyXG4gICAgICAgIEByZW1vdmUgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4ID1cclxuICAgICAgdW5pdFNpemU6IFVOSVRfU0laRVxyXG5cclxuICBnZnhSZW5kZXJGbG9vcjogLT5cclxuICAgIEBnZnguZmxvb3JMYXllciA9IG5ldyBjYy5MYXllcigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0QW5jaG9yUG9pbnQoY2MucCgwLCAwKSlcclxuXHJcbiAgICB0aWxlcyA9IG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnRpbGVzMCwgMTYsIDE2LCAxNilcclxuICAgIGdyaWQgPSBjYy5nYW1lLmN1cnJlbnRGbG9vcigpLmdyaWRcclxuICAgIGZvciBqIGluIFswLi4uZ3JpZC5oZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uZ3JpZC53aWR0aF1cclxuICAgICAgICB2ID0gZ3JpZC5nZXQoaSwgailcclxuICAgICAgICBpZiB2ICE9IDBcclxuICAgICAgICAgIHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgdGlsZXMucmVzb3VyY2VcclxuICAgICAgICAgIHNwcml0ZS5zZXRBbmNob3JQb2ludChjYy5wKDAsIDApKVxyXG4gICAgICAgICAgc3ByaXRlLnNldFRleHR1cmVSZWN0KHRpbGVzLnJlY3QoQHRpbGVGb3JHcmlkVmFsdWUodikpKVxyXG4gICAgICAgICAgc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoaSAqIEBnZngudW5pdFNpemUsIGogKiBAZ2Z4LnVuaXRTaXplKSlcclxuICAgICAgICAgIEBnZnguZmxvb3JMYXllci5hZGRDaGlsZCBzcHJpdGUsIC0xXHJcblxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFNjYWxlKFNDQUxFX01JTilcclxuICAgIEBhZGQgQGdmeC5mbG9vckxheWVyXHJcbiAgICBAZ2Z4Q2VudGVyTWFwKClcclxuXHJcbiAgZ2Z4UGxhY2VNYXA6IChtYXBYLCBtYXBZLCBzY3JlZW5YLCBzY3JlZW5ZKSAtPlxyXG4gICAgc2NhbGUgPSBAZ2Z4LmZsb29yTGF5ZXIuZ2V0U2NhbGUoKVxyXG4gICAgeCA9IHNjcmVlblggLSAobWFwWCAqIHNjYWxlKVxyXG4gICAgeSA9IHNjcmVlblkgLSAobWFwWSAqIHNjYWxlKVxyXG4gICAgQGdmeC5mbG9vckxheWVyLnNldFBvc2l0aW9uKHgsIHkpXHJcblxyXG4gIGdmeENlbnRlck1hcDogLT5cclxuICAgIGNlbnRlciA9IGNjLmdhbWUuY3VycmVudEZsb29yKCkuZ3JpZC5iYm94LmNlbnRlcigpXHJcbiAgICBAZ2Z4UGxhY2VNYXAoY2VudGVyLnggKiBAZ2Z4LnVuaXRTaXplLCBjZW50ZXIueSAqIEBnZngudW5pdFNpemUsIGNjLndpZHRoIC8gMiwgY2MuaGVpZ2h0IC8gMilcclxuXHJcbiAgZ2Z4U2NyZWVuVG9NYXBDb29yZHM6ICh4LCB5KSAtPlxyXG4gICAgcG9zID0gQGdmeC5mbG9vckxheWVyLmdldFBvc2l0aW9uKClcclxuICAgIHNjYWxlID0gQGdmeC5mbG9vckxheWVyLmdldFNjYWxlKClcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6ICh4IC0gcG9zLngpIC8gc2NhbGVcclxuICAgICAgeTogKHkgLSBwb3MueSkgLyBzY2FsZVxyXG4gICAgfVxyXG5cclxuICBnZnhSZW5kZXJQbGF5ZXI6IC0+XHJcbiAgICBAZ2Z4LnBsYXllciA9IHt9XHJcbiAgICBAZ2Z4LnBsYXllci50aWxlcyA9IG5ldyBUaWxlc2hlZXQocmVzb3VyY2VzLnBsYXllciwgMTIsIDE0LCAxOClcclxuICAgIHMgPSBjYy5TcHJpdGUuY3JlYXRlIEBnZngucGxheWVyLnRpbGVzLnJlc291cmNlXHJcbiAgICBzLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBzLnNldFRleHR1cmVSZWN0KEBnZngucGxheWVyLnRpbGVzLnJlY3QoMTYpKVxyXG4gICAgQGdmeC5wbGF5ZXIuc3ByaXRlID0gc1xyXG4gICAgQGdmeC5mbG9vckxheWVyLmFkZENoaWxkIHMsIDBcclxuXHJcbiAgZ2Z4VXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgeCA9IGNjLmdhbWUuc3RhdGUucGxheWVyLnggKiBAZ2Z4LnVuaXRTaXplXHJcbiAgICB5ID0gY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueSAqIEBnZngudW5pdFNpemVcclxuICAgIEBnZngucGxheWVyLnNwcml0ZS5zZXRQb3NpdGlvbihjYy5wKHgsIHkpKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHdoaWNoID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNSlcclxuICAgIEBnZngucGxheWVyLnNwcml0ZS5zZXRUZXh0dXJlUmVjdChAZ2Z4LnBsYXllci50aWxlcy5yZWN0KHdoaWNoKSlcclxuXHJcbiAgb25BY3RpdmF0ZTogLT5cclxuICAgIGNjLmdhbWUubmV3R2FtZSgpXHJcbiAgICBAZ2Z4Q2xlYXIoKVxyXG4gICAgQGdmeFJlbmRlckZsb29yKClcclxuICAgIEBnZnhSZW5kZXJQbGF5ZXIoKVxyXG4gICAgQGdmeFVwZGF0ZVBvc2l0aW9ucygpXHJcbiAgICBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFNjaGVkdWxlcigpLnNjaGVkdWxlQ2FsbGJhY2tGb3JUYXJnZXQodGhpcywgQHVwZGF0ZSwgMS4wLCBjYy5SRVBFQVRfRk9SRVZFUiwgMCwgZmFsc2UpXHJcblxyXG4gIGdmeEFkanVzdE1hcFNjYWxlOiAoZGVsdGEpIC0+XHJcbiAgICBzY2FsZSA9IEBnZnguZmxvb3JMYXllci5nZXRTY2FsZSgpXHJcbiAgICBzY2FsZSArPSBkZWx0YVxyXG4gICAgc2NhbGUgPSBTQ0FMRV9NQVggaWYgc2NhbGUgPiBTQ0FMRV9NQVhcclxuICAgIHNjYWxlID0gU0NBTEVfTUlOIGlmIHNjYWxlIDwgU0NBTEVfTUlOXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0U2NhbGUoc2NhbGUpXHJcblxyXG4gIG9uRHJhZzogKGR4LCBkeSkgLT5cclxuICAgIHBvcyA9IEBnZnguZmxvb3JMYXllci5nZXRQb3NpdGlvbigpXHJcbiAgICBAZ2Z4LmZsb29yTGF5ZXIuc2V0UG9zaXRpb24ocG9zLnggKyBkeCwgcG9zLnkgKyBkeSlcclxuXHJcbiAgb25ab29tOiAoeCwgeSwgZGVsdGEpIC0+XHJcbiAgICBwb3MgPSBAZ2Z4U2NyZWVuVG9NYXBDb29yZHMoeCwgeSlcclxuICAgIEBnZnhBZGp1c3RNYXBTY2FsZShkZWx0YSAvIDIwMClcclxuICAgIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gIG9uQ2xpY2s6ICh4LCB5KSAtPlxyXG4gICAgIyBAZ2Z4QWRqdXN0TWFwU2NhbGUgMC4xXHJcbiAgICAjIEBnZnhQbGFjZU1hcChwb3MueCwgcG9zLnksIHgsIHkpXHJcblxyXG4gICAgcG9zID0gQGdmeFNjcmVlblRvTWFwQ29vcmRzKHgsIHkpXHJcbiAgICBncmlkWCA9IE1hdGguZmxvb3IocG9zLnggLyBAZ2Z4LnVuaXRTaXplKVxyXG4gICAgZ3JpZFkgPSBNYXRoLmZsb29yKHBvcy55IC8gQGdmeC51bml0U2l6ZSlcclxuICAgICMgY2MubG9nIFwiZ3JpZCBjbGljayAje2dyaWRYfSwgI3tncmlkWX1cIlxyXG4gICAgY2MuZ2FtZS5zdGF0ZS5wbGF5ZXIueCA9IGdyaWRYXHJcbiAgICBjYy5nYW1lLnN0YXRlLnBsYXllci55ID0gZ3JpZFlcclxuICAgIEBnZnhVcGRhdGVQb3NpdGlvbnMoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lTW9kZVxyXG4iLCJNb2RlID0gcmVxdWlyZSAnYmFzZS9tb2RlJ1xyXG5yZXNvdXJjZXMgPSByZXF1aXJlICdyZXNvdXJjZXMnXHJcblxyXG5jbGFzcyBJbnRyb01vZGUgZXh0ZW5kcyBNb2RlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBzdXBlcihcIkludHJvXCIpXHJcbiAgICBAc3ByaXRlID0gY2MuU3ByaXRlLmNyZWF0ZSByZXNvdXJjZXMuc3BsYXNoc2NyZWVuXHJcbiAgICBAc3ByaXRlLnNldFBvc2l0aW9uKGNjLnAoY2Mud2lkdGggLyAyLCBjYy5oZWlnaHQgLyAyKSlcclxuICAgIEBhZGQgQHNwcml0ZVxyXG5cclxuICBvbkNsaWNrOiAoeCwgeSkgLT5cclxuICAgIGNjLmxvZyBcImludHJvIGNsaWNrICN7eH0sICN7eX1cIlxyXG4gICAgY2MuZ2FtZS5tb2Rlcy5nYW1lLmFjdGl2YXRlKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW50cm9Nb2RlXHJcbiIsInJlc291cmNlcyA9XHJcbiAgJ3NwbGFzaHNjcmVlbic6ICdyZXMvc3BsYXNoc2NyZWVuLnBuZydcclxuICAndGlsZXMwJzogJ3Jlcy90aWxlczAucG5nJ1xyXG4gICdwbGF5ZXInOiAncmVzL3BsYXllci5wbmcnXHJcblxyXG5jb2Nvc1ByZWxvYWRMaXN0ID0gKHtzcmM6IHZ9IGZvciBrLCB2IG9mIHJlc291cmNlcylcclxucmVzb3VyY2VzLmNvY29zUHJlbG9hZExpc3QgPSBjb2Nvc1ByZWxvYWRMaXN0XHJcbm1vZHVsZS5leHBvcnRzID0gcmVzb3VyY2VzXHJcbiIsImdmeCA9IHJlcXVpcmUgJ2dmeCdcclxucmVzb3VyY2VzID0gcmVxdWlyZSAncmVzb3VyY2VzJ1xyXG5cclxuY2xhc3MgRmxvb3IgZXh0ZW5kcyBnZnguTGF5ZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIHN1cGVyKClcclxuICAgIHNpemUgPSBjYy5EaXJlY3Rvci5nZXRJbnN0YW5jZSgpLmdldFdpblNpemUoKVxyXG4gICAgQHNwcml0ZSA9IGNjLlNwcml0ZS5jcmVhdGUgcmVzb3VyY2VzLnNwbGFzaHNjcmVlbiwgY2MucmVjdCg0NTAsMzAwLDE2LDE2KVxyXG4gICAgQHNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAc3ByaXRlLnNldEFuY2hvclBvaW50KGNjLnAoMCwgMCkpXHJcbiAgICBAYWRkQ2hpbGQoQHNwcml0ZSwgMClcclxuICAgIEBzcHJpdGUuc2V0UG9zaXRpb24oY2MucCgwLCAwKSlcclxuICAgIEBzZXRQb3NpdGlvbihjYy5wKDEwMCwgMTAwKSlcclxuICAgIEBzZXRTY2FsZSgxMCwgMTApXHJcbiAgICBAc2V0VG91Y2hFbmFibGVkKHRydWUpXHJcblxyXG4gIG9uVG91Y2hlc0JlZ2FuOiAodG91Y2hlcywgZXZlbnQpIC0+XHJcbiAgICBpZiB0b3VjaGVzXHJcbiAgICAgIHggPSB0b3VjaGVzWzBdLmdldExvY2F0aW9uKCkueFxyXG4gICAgICB5ID0gdG91Y2hlc1swXS5nZXRMb2NhdGlvbigpLnlcclxuICAgICAgY2MubG9nIFwidG91Y2ggRmxvb3IgYXQgI3t4fSwgI3t5fVwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZsb29yXHJcbiIsImZzID0gcmVxdWlyZSAnZnMnXHJcbnNlZWRSYW5kb20gPSByZXF1aXJlICdzZWVkLXJhbmRvbSdcclxuXHJcblRZUEUgPSAob2JqKSAtPlxyXG4gIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopLnNsaWNlKDgsIC0xKVxyXG5cclxuU0hBUEVTID0gW1xyXG4gIFwiXCJcIlxyXG4gICMjIyMjIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMjIyMjIyMjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjLi4uI1xyXG4gICAgICAgICAjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICMjIyMjIyMjIyMjI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4uLi4uLi4uI1xyXG4gICMuLi4jIyMjIyMjI1xyXG4gICMuLi4jXHJcbiAgIy4uLiNcclxuICAjIyMjI1xyXG4gIFwiXCJcIlxyXG4gIFwiXCJcIlxyXG4gICMjIyMjXHJcbiAgIy4uLiNcclxuICAjLi4uIyMjIyMjIyNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjLi4uLi4uLi4uLiNcclxuICAjIyMjIyMjIyMjIyNcclxuICBcIlwiXCJcclxuICBcIlwiXCJcclxuICAgICAgIyMjI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICAgICAjLi4jXHJcbiAgICAgICMuLiNcclxuICAgICAgIy4uI1xyXG4gICMjIyMjLi4jXHJcbiAgIy4uLi4uLiNcclxuICAjLi4uLi4uI1xyXG4gICMuLi4uLi4jXHJcbiAgIyMjIyMjIyNcclxuICBcIlwiXCJcclxuXVxyXG5cclxuRU1QVFkgPSAwXHJcbldBTEwgPSAxXHJcbkRPT1IgPSAyXHJcbkZJUlNUX1JPT01fSUQgPSA1XHJcblxyXG52YWx1ZVRvQ29sb3IgPSAocCwgdikgLT5cclxuICBzd2l0Y2hcclxuICAgIHdoZW4gdiA9PSBXQUxMIHRoZW4gcmV0dXJuIHAuY29sb3IgMzIsIDMyLCAzMlxyXG4gICAgd2hlbiB2ID09IERPT1IgdGhlbiByZXR1cm4gcC5jb2xvciAxMjgsIDEyOCwgMTI4XHJcbiAgICB3aGVuIHYgPj0gRklSU1RfUk9PTV9JRCB0aGVuIHJldHVybiBwLmNvbG9yIDAsIDAsIDUgKyBNYXRoLm1pbigyNDAsIDE1ICsgKHYgKiAyKSlcclxuICByZXR1cm4gcC5jb2xvciAwLCAwLCAwXHJcblxyXG5jbGFzcyBSZWN0XHJcbiAgY29uc3RydWN0b3I6IChAbCwgQHQsIEByLCBAYikgLT5cclxuXHJcbiAgdzogLT4gQHIgLSBAbFxyXG4gIGg6IC0+IEBiIC0gQHRcclxuICBhcmVhOiAtPiBAdygpICogQGgoKVxyXG4gIGFzcGVjdDogLT5cclxuICAgIGlmIEBoKCkgPiAwXHJcbiAgICAgIHJldHVybiBAdygpIC8gQGgoKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gMFxyXG5cclxuICBzcXVhcmVuZXNzOiAtPlxyXG4gICAgcmV0dXJuIE1hdGguYWJzKEB3KCkgLSBAaCgpKVxyXG5cclxuICBjZW50ZXI6IC0+XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBNYXRoLmZsb29yKChAciArIEBsKSAvIDIpXHJcbiAgICAgIHk6IE1hdGguZmxvb3IoKEBiICsgQHQpIC8gMilcclxuICAgIH1cclxuXHJcbiAgY2xvbmU6IC0+XHJcbiAgICByZXR1cm4gbmV3IFJlY3QoQGwsIEB0LCBAciwgQGIpXHJcblxyXG4gIGV4cGFuZDogKHIpIC0+XHJcbiAgICBpZiBAYXJlYSgpXHJcbiAgICAgIEBsID0gci5sIGlmIEBsID4gci5sXHJcbiAgICAgIEB0ID0gci50IGlmIEB0ID4gci50XHJcbiAgICAgIEByID0gci5yIGlmIEByIDwgci5yXHJcbiAgICAgIEBiID0gci5iIGlmIEBiIDwgci5iXHJcbiAgICBlbHNlXHJcbiAgICAgICMgc3BlY2lhbCBjYXNlLCBiYm94IGlzIGVtcHR5LiBSZXBsYWNlIGNvbnRlbnRzIVxyXG4gICAgICBAbCA9IHIubFxyXG4gICAgICBAdCA9IHIudFxyXG4gICAgICBAciA9IHIuclxyXG4gICAgICBAYiA9IHIuYlxyXG5cclxuICB0b1N0cmluZzogLT4gXCJ7ICgje0BsfSwgI3tAdH0pIC0+ICgje0ByfSwgI3tAYn0pICN7QHcoKX14I3tAaCgpfSwgYXJlYTogI3tAYXJlYSgpfSwgYXNwZWN0OiAje0Bhc3BlY3QoKX0sIHNxdWFyZW5lc3M6ICN7QHNxdWFyZW5lc3MoKX0gfVwiXHJcblxyXG5jbGFzcyBSb29tVGVtcGxhdGVcclxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHJvb21pZCkgLT5cclxuICAgIEBncmlkID0gbmV3IEJ1ZmZlcihAd2lkdGggKiBAaGVpZ2h0KVxyXG4gICAgQGdlbmVyYXRlU2hhcGUoKVxyXG5cclxuICBnZW5lcmF0ZVNoYXBlOiAtPlxyXG4gICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgICBAc2V0KGksIGosIEByb29taWQpXHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgQHNldChpLCAwLCBXQUxMKVxyXG4gICAgICBAc2V0KGksIEBoZWlnaHQgLSAxLCBXQUxMKVxyXG4gICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICBAc2V0KDAsIGosIFdBTEwpXHJcbiAgICAgIEBzZXQoQHdpZHRoIC0gMSwgaiwgV0FMTClcclxuXHJcbiAgcmVjdDogKHgsIHkpIC0+XHJcbiAgICByZXR1cm4gbmV3IFJlY3QgeCwgeSwgeCArIEB3aWR0aCwgeSArIEBoZWlnaHRcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2kgKyAoaiAqIEB3aWR0aCldID0gdlxyXG5cclxuICBnZXQ6IChtYXAsIHgsIHksIGksIGopIC0+XHJcbiAgICBpZiBpID49IDAgYW5kIGkgPCBAd2lkdGggYW5kIGogPj0gMCBhbmQgaiA8IEBoZWlnaHRcclxuICAgICAgdiA9IEBncmlkW2kgKyAoaiAqIEB3aWR0aCldXHJcbiAgICAgIHJldHVybiB2IGlmIHYgIT0gRU1QVFlcclxuICAgIHJldHVybiBtYXAuZ2V0IHggKyBpLCB5ICsgalxyXG5cclxuICBwbGFjZTogKG1hcCwgeCwgeSkgLT5cclxuICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgdiA9IEBncmlkW2kgKyAoaiAqIEB3aWR0aCldXHJcbiAgICAgICAgbWFwLmdyaWRbeCArIGkgKyAoKHkgKyBqKSAqIG1hcC53aWR0aCldID0gdiBpZiB2ICE9IEVNUFRZXHJcblxyXG4gIGZpdHM6IChtYXAsIHgsIHkpIC0+XHJcbiAgICBmb3IgaSBpbiBbMC4uLkB3aWR0aF1cclxuICAgICAgZm9yIGogaW4gWzAuLi5AaGVpZ2h0XVxyXG4gICAgICAgIG12ID0gbWFwLmdyaWRbeCArIGkgKyAoKHkgKyBqKSAqIG1hcC53aWR0aCldXHJcbiAgICAgICAgc3YgPSBAZ3JpZFtpICsgKGogKiBAd2lkdGgpXVxyXG4gICAgICAgIGlmIG12ICE9IEVNUFRZIGFuZCBzdiAhPSBFTVBUWSBhbmQgKG12ICE9IFdBTEwgb3Igc3YgIT0gV0FMTClcclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgZG9vckVsaWdpYmxlOiAobWFwLCB4LCB5LCBpLCBqKSAtPlxyXG4gICAgd2FsbE5laWdoYm9ycyA9IDBcclxuICAgIHJvb21zU2VlbiA9IHt9XHJcbiAgICB2YWx1ZXMgPSBbXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpICsgMSwgailcclxuICAgICAgQGdldChtYXAsIHgsIHksIGkgLSAxLCBqKVxyXG4gICAgICBAZ2V0KG1hcCwgeCwgeSwgaSwgaiArIDEpXHJcbiAgICAgIEBnZXQobWFwLCB4LCB5LCBpLCBqIC0gMSlcclxuICAgIF1cclxuICAgIGZvciB2IGluIHZhbHVlc1xyXG4gICAgICBpZiB2XHJcbiAgICAgICAgaWYgdiA9PSAxXHJcbiAgICAgICAgICB3YWxsTmVpZ2hib3JzKytcclxuICAgICAgICBlbHNlIGlmIHYgIT0gMlxyXG4gICAgICAgICAgcm9vbXNTZWVuW3ZdID0gMVxyXG4gICAgcm9vbXMgPSBPYmplY3Qua2V5cyhyb29tc1NlZW4pLnNvcnQgKGEsIGIpIC0+IGEtYlxyXG4gICAgcm9vbXMgPSByb29tcy5tYXAgKHJvb20pIC0+IHBhcnNlSW50KHJvb20pXHJcbiAgICByb29tQ291bnQgPSByb29tcy5sZW5ndGhcclxuICAgIGlmICh3YWxsTmVpZ2hib3JzID09IDIpIGFuZCAocm9vbUNvdW50ID09IDIpIGFuZCAoQHJvb21pZCBpbiByb29tcylcclxuICAgICAgaWYgKHZhbHVlc1swXSA9PSB2YWx1ZXNbMV0pIG9yICh2YWx1ZXNbMl0gPT0gdmFsdWVzWzNdKVxyXG4gICAgICAgIHJldHVybiByb29tc1xyXG4gICAgcmV0dXJuIFstMSwgLTFdXHJcblxyXG4gIGRvb3JMb2NhdGlvbjogKG1hcCwgeCwgeSkgLT5cclxuICAgIGZvciBqIGluIFswLi4uQGhlaWdodF1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5Ad2lkdGhdXHJcbiAgICAgICAgcm9vbXMgPSBAZG9vckVsaWdpYmxlKG1hcCwgeCwgeSwgaSwgailcclxuICAgICAgICBpZiByb29tc1swXSAhPSAtMSBhbmQgQHJvb21pZCBpbiByb29tc1xyXG4gICAgICAgICAgcmV0dXJuIFtpLCBqXVxyXG4gICAgcmV0dXJuIFstMSwgLTFdXHJcblxyXG4gIG1lYXN1cmU6IChtYXAsIHgsIHkpIC0+XHJcbiAgICBiYm94VGVtcCA9IG1hcC5iYm94LmNsb25lKClcclxuICAgIGJib3hUZW1wLmV4cGFuZCBAcmVjdCh4LCB5KVxyXG4gICAgW2Jib3hUZW1wLmFyZWEoKSwgYmJveFRlbXAuc3F1YXJlbmVzcygpXVxyXG5cclxuICBmaW5kQmVzdFNwb3Q6IChtYXApIC0+XHJcbiAgICBtaW5TcXVhcmVuZXNzID0gTWF0aC5tYXggbWFwLndpZHRoLCBtYXAuaGVpZ2h0XHJcbiAgICBtaW5BcmVhID0gbWFwLndpZHRoICogbWFwLmhlaWdodFxyXG4gICAgbWluWCA9IC0xXHJcbiAgICBtaW5ZID0gLTFcclxuICAgIGRvb3JMb2NhdGlvbiA9IFstMSwgLTFdXHJcbiAgICBzZWFyY2hMID0gbWFwLmJib3gubCAtIEB3aWR0aFxyXG4gICAgc2VhcmNoUiA9IG1hcC5iYm94LnJcclxuICAgIHNlYXJjaFQgPSBtYXAuYmJveC50IC0gQGhlaWdodFxyXG4gICAgc2VhcmNoQiA9IG1hcC5iYm94LmJcclxuICAgIGZvciBpIGluIFtzZWFyY2hMIC4uLiBzZWFyY2hSXVxyXG4gICAgICBmb3IgaiBpbiBbc2VhcmNoVCAuLi4gc2VhcmNoQl1cclxuICAgICAgICBpZiBAZml0cyhtYXAsIGksIGopXHJcbiAgICAgICAgICBbYXJlYSwgc3F1YXJlbmVzc10gPSBAbWVhc3VyZSBtYXAsIGksIGpcclxuICAgICAgICAgIGlmIGFyZWEgPD0gbWluQXJlYSBhbmQgc3F1YXJlbmVzcyA8PSBtaW5TcXVhcmVuZXNzXHJcbiAgICAgICAgICAgIGxvY2F0aW9uID0gQGRvb3JMb2NhdGlvbiBtYXAsIGksIGpcclxuICAgICAgICAgICAgaWYgbG9jYXRpb25bMF0gIT0gLTFcclxuICAgICAgICAgICAgICBkb29yTG9jYXRpb24gPSBsb2NhdGlvblxyXG4gICAgICAgICAgICAgIG1pbkFyZWEgPSBhcmVhXHJcbiAgICAgICAgICAgICAgbWluU3F1YXJlbmVzcyA9IHNxdWFyZW5lc3NcclxuICAgICAgICAgICAgICBtaW5YID0gaVxyXG4gICAgICAgICAgICAgIG1pblkgPSBqXHJcbiAgICByZXR1cm4gW21pblgsIG1pblksIGRvb3JMb2NhdGlvbl1cclxuXHJcbmNsYXNzIFNoYXBlUm9vbVRlbXBsYXRlIGV4dGVuZHMgUm9vbVRlbXBsYXRlXHJcbiAgY29uc3RydWN0b3I6IChzaGFwZSwgcm9vbWlkKSAtPlxyXG4gICAgQGxpbmVzID0gc2hhcGUuc3BsaXQoXCJcXG5cIilcclxuICAgIHcgPSAwXHJcbiAgICBmb3IgbGluZSBpbiBAbGluZXNcclxuICAgICAgdyA9IE1hdGgubWF4KHcsIGxpbmUubGVuZ3RoKVxyXG4gICAgQHdpZHRoID0gd1xyXG4gICAgQGhlaWdodCA9IEBsaW5lcy5sZW5ndGhcclxuICAgIHN1cGVyIEB3aWR0aCwgQGhlaWdodCwgcm9vbWlkXHJcblxyXG4gIGdlbmVyYXRlU2hhcGU6IC0+XHJcbiAgICBmb3IgaiBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgIGZvciBpIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICAgIEBzZXQoaSwgaiwgRU1QVFkpXHJcbiAgICBpID0gMFxyXG4gICAgaiA9IDBcclxuICAgIGZvciBsaW5lIGluIEBsaW5lc1xyXG4gICAgICBmb3IgYyBpbiBsaW5lLnNwbGl0KFwiXCIpXHJcbiAgICAgICAgdiA9IHN3aXRjaCBjXHJcbiAgICAgICAgICB3aGVuICcuJyB0aGVuIEByb29taWRcclxuICAgICAgICAgIHdoZW4gJyMnIHRoZW4gV0FMTFxyXG4gICAgICAgICAgZWxzZSAwXHJcbiAgICAgICAgaWYgdlxyXG4gICAgICAgICAgQHNldChpLCBqLCB2KVxyXG4gICAgICAgIGkrK1xyXG4gICAgICBqKytcclxuICAgICAgaSA9IDBcclxuXHJcbmNsYXNzIFJvb21cclxuICBjb25zdHJ1Y3RvcjogKEByZWN0KSAtPlxyXG4gICAgIyBjb25zb2xlLmxvZyBcInJvb20gY3JlYXRlZCAje0ByZWN0fVwiXHJcblxyXG5jbGFzcyBNYXBcclxuICBjb25zdHJ1Y3RvcjogKEB3aWR0aCwgQGhlaWdodCwgQHNlZWQpIC0+XHJcbiAgICBAcmFuZFJlc2V0KClcclxuICAgIEBncmlkID0gbmV3IEJ1ZmZlcihAd2lkdGggKiBAaGVpZ2h0KVxyXG4gICAgQGJib3ggPSBuZXcgUmVjdCAwLCAwLCAwLCAwXHJcbiAgICBAcm9vbXMgPSBbXVxyXG5cclxuICAgIGZvciBqIGluIFswLi4uQHdpZHRoXVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLkBoZWlnaHRdXHJcbiAgICAgICAgQHNldChpLCBqLCBFTVBUWSlcclxuXHJcbiAgcmFuZFJlc2V0OiAtPlxyXG4gICAgQHJuZyA9IHNlZWRSYW5kb20oQHNlZWQpXHJcblxyXG4gIHJhbmQ6ICh2KSAtPlxyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoQHJuZygpICogdilcclxuXHJcbiAgc2V0OiAoaSwgaiwgdikgLT5cclxuICAgIEBncmlkW2kgKyAoaiAqIEB3aWR0aCldID0gdlxyXG5cclxuICBnZXQ6IChpLCBqKSAtPlxyXG4gICAgaWYgaSA+PSAwIGFuZCBpIDwgQHdpZHRoIGFuZCBqID49IDAgYW5kIGogPCBAaGVpZ2h0XHJcbiAgICAgIHJldHVybiBAZ3JpZFtpICsgKGogKiBAd2lkdGgpXVxyXG4gICAgcmV0dXJuIDBcclxuXHJcbiAgYWRkUm9vbTogKHJvb21UZW1wbGF0ZSwgeCwgeSkgLT5cclxuICAgICMgY29uc29sZS5sb2cgXCJwbGFjaW5nIHJvb20gYXQgI3t4fSwgI3t5fVwiXHJcbiAgICByb29tVGVtcGxhdGUucGxhY2UgdGhpcywgeCwgeVxyXG4gICAgciA9IHJvb21UZW1wbGF0ZS5yZWN0KHgsIHkpXHJcbiAgICBAcm9vbXMucHVzaCBuZXcgUm9vbSByXHJcbiAgICBAYmJveC5leHBhbmQocilcclxuICAgICMgY29uc29sZS5sb2cgXCJuZXcgbWFwIGJib3ggI3tAYmJveH1cIlxyXG5cclxuICByYW5kb21Sb29tVGVtcGxhdGU6IChyb29taWQpIC0+XHJcbiAgICByID0gQHJhbmQoMTAwKVxyXG4gICAgc3dpdGNoXHJcbiAgICAgIHdoZW4gIDAgPCByIDwgMTAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSAzLCA1ICsgQHJhbmQoMTApLCByb29taWQgICAgICAgICAgICAgICAgICAjIHZlcnRpY2FsIGNvcnJpZG9yXHJcbiAgICAgIHdoZW4gMTAgPCByIDwgMjAgdGhlbiByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA1ICsgQHJhbmQoMTApLCAzLCByb29taWQgICAgICAgICAgICAgICAgICAjIGhvcml6b250YWwgY29ycmlkb3JcclxuICAgICAgd2hlbiAyMCA8IHIgPCAzMCB0aGVuIHJldHVybiBuZXcgU2hhcGVSb29tVGVtcGxhdGUgU0hBUEVTW0ByYW5kKFNIQVBFUy5sZW5ndGgpXSwgcm9vbWlkICMgcmFuZG9tIHNoYXBlIGZyb20gU0hBUEVTXHJcbiAgICByZXR1cm4gbmV3IFJvb21UZW1wbGF0ZSA0ICsgQHJhbmQoNSksIDQgKyBAcmFuZCg1KSwgcm9vbWlkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGdlbmVyaWMgcmVjdGFuZ3VsYXIgcm9vbVxyXG5cclxuICBnZW5lcmF0ZVJvb206IChyb29taWQpIC0+XHJcbiAgICByb29tVGVtcGxhdGUgPSBAcmFuZG9tUm9vbVRlbXBsYXRlIHJvb21pZFxyXG4gICAgaWYgQHJvb21zLmxlbmd0aCA9PSAwXHJcbiAgICAgIHggPSBNYXRoLmZsb29yKChAd2lkdGggLyAyKSAtIChyb29tVGVtcGxhdGUud2lkdGggLyAyKSlcclxuICAgICAgeSA9IE1hdGguZmxvb3IoKEBoZWlnaHQgLyAyKSAtIChyb29tVGVtcGxhdGUuaGVpZ2h0IC8gMikpXHJcbiAgICAgIEBhZGRSb29tIHJvb21UZW1wbGF0ZSwgeCwgeVxyXG4gICAgZWxzZVxyXG4gICAgICBbeCwgeSwgZG9vckxvY2F0aW9uXSA9IHJvb21UZW1wbGF0ZS5maW5kQmVzdFNwb3QodGhpcylcclxuICAgICAgaWYgeCA8IDBcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgcm9vbVRlbXBsYXRlLnNldCBkb29yTG9jYXRpb25bMF0sIGRvb3JMb2NhdGlvblsxXSwgMlxyXG4gICAgICBAYWRkUm9vbSByb29tVGVtcGxhdGUsIHgsIHlcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGdlbmVyYXRlUm9vbXM6IChjb3VudCkgLT5cclxuICAgIGZvciBpIGluIFswLi4uY291bnRdXHJcbiAgICAgIHJvb21pZCA9IEZJUlNUX1JPT01fSUQgKyBpXHJcblxyXG4gICAgICBhZGRlZCA9IGZhbHNlXHJcbiAgICAgIHdoaWxlIG5vdCBhZGRlZFxyXG4gICAgICAgIGFkZGVkID0gQGdlbmVyYXRlUm9vbSByb29taWRcclxuXHJcbmdlbmVyYXRlID0gLT5cclxuICBXID0gODBcclxuICBIID0gODBcclxuICBtYXAgPSBuZXcgTWFwIFcsIEgsIDEwXHJcbiAgbWFwLmdlbmVyYXRlUm9vbXMoMjApXHJcbiAgcmV0dXJuIG1hcFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdlbmVyYXRlOiBnZW5lcmF0ZVxyXG4gIEVNUFRZOiBFTVBUWVxyXG4gIFdBTEw6IFdBTExcclxuICBET09SOkRPT1JcclxuICBGSVJTVF9ST09NX0lEOiBGSVJTVF9ST09NX0lEXHJcbiJdfQ==
;