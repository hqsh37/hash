! function(t, n) {
    "object" == typeof exports ? module.exports = exports = n() : "function" == typeof define && define.amd ? define([], n) : t.CryptoJS = n()
}(this, function() {
    return function(f) {
        var i;
        if ("undefined" != typeof window && window.crypto && (i = window.crypto), "undefined" != typeof self && self.crypto && (i = self.crypto), !(i = !(i = !(i = "undefined" != typeof globalThis && globalThis.crypto ? globalThis.crypto : i) && "undefined" != typeof window && window.msCrypto ? window.msCrypto : i) && "undefined" != typeof global && global.crypto ? global.crypto : i) && "function" == typeof require) try {
            i = require("crypto")
        } catch (t) {}
        var e = Object.create || function(t) {
            return n.prototype = t, t = new n, n.prototype = null, t
        };

        function n() {}
        var t = {},
            r = t.lib = {},
            o = r.Base = {
                extend: function(t) {
                    var n = e(this);
                    return t && n.mixIn(t), n.hasOwnProperty("init") && this.init !== n.init || (n.init = function() {
                        n.$super.init.apply(this, arguments)
                    }), (n.init.prototype = n).$super = this, n
                },
                create: function() {
                    var t = this.extend();
                    return t.init.apply(t, arguments), t
                },
                init: function() {},
                mixIn: function(t) {
                    for (var n in t) t.hasOwnProperty(n) && (this[n] = t[n]);
                    t.hasOwnProperty("toString") && (this.toString = t.toString)
                },
                clone: function() {
                    return this.init.prototype.extend(this)
                }
            },
            u = r.WordArray = o.extend({
                init: function(t, n) {
                    t = this.words = t || [], this.sigBytes = null != n ? n : 4 * t.length
                },
                toString: function(t) {
                    return (t || a).stringify(this)
                },
                concat: function(t) {
                    var n = this.words,
                        e = t.words,
                        i = this.sigBytes,
                        r = t.sigBytes;
                    if (this.clamp(), i % 4)
                        for (var o = 0; o < r; o++) {
                            var s = e[o >>> 2] >>> 24 - o % 4 * 8 & 255;
                            n[i + o >>> 2] |= s << 24 - (i + o) % 4 * 8
                        } else
                            for (var a = 0; a < r; a += 4) n[i + a >>> 2] = e[a >>> 2];
                    return this.sigBytes += r, this
                },
                clamp: function() {
                    var t = this.words,
                        n = this.sigBytes;
                    t[n >>> 2] &= 4294967295 << 32 - n % 4 * 8, t.length = f.ceil(n / 4)
                },
                clone: function() {
                    var t = o.clone.call(this);
                    return t.words = this.words.slice(0), t
                },
                random: function(t) {
                    for (var n = [], e = 0; e < t; e += 4) n.push(function() {
                        if (i) {
                            if ("function" == typeof i.getRandomValues) try {
                                return i.getRandomValues(new Uint32Array(1))[0]
                            } catch (t) {}
                            if ("function" == typeof i.randomBytes) try {
                                return i.randomBytes(4).readInt32LE()
                            } catch (t) {}
                        }
                        throw new Error("Native crypto module could not be used to get secure random number.")
                    }());
                    return new u.init(n, t)
                }
            }),
            s = t.enc = {},
            a = s.Hex = {
                stringify: function(t) {
                    for (var n = t.words, e = t.sigBytes, i = [], r = 0; r < e; r++) {
                        var o = n[r >>> 2] >>> 24 - r % 4 * 8 & 255;
                        i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16))
                    }
                    return i.join("")
                },
                parse: function(t) {
                    for (var n = t.length, e = [], i = 0; i < n; i += 2) e[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4;
                    return new u.init(e, n / 2)
                }
            },
            c = s.Latin1 = {
                stringify: function(t) {
                    for (var n = t.words, e = t.sigBytes, i = [], r = 0; r < e; r++) {
                        var o = n[r >>> 2] >>> 24 - r % 4 * 8 & 255;
                        i.push(String.fromCharCode(o))
                    }
                    return i.join("")
                },
                parse: function(t) {
                    for (var n = t.length, e = [], i = 0; i < n; i++) e[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8;
                    return new u.init(e, n)
                }
            },
            p = s.Utf8 = {
                stringify: function(t) {
                    try {
                        return decodeURIComponent(escape(c.stringify(t)))
                    } catch (t) {
                        throw new Error("Malformed UTF-8 data")
                    }
                },
                parse: function(t) {
                    return c.parse(unescape(encodeURIComponent(t)))
                }
            },
            d = r.BufferedBlockAlgorithm = o.extend({
                reset: function() {
                    this._data = new u.init, this._nDataBytes = 0
                },
                _append: function(t) {
                    "string" == typeof t && (t = p.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes
                },
                _process: function(t) {
                    var n, e = this._data,
                        i = e.words,
                        r = e.sigBytes,
                        o = this.blockSize,
                        s = r / (4 * o),
                        a = (s = t ? f.ceil(s) : f.max((0 | s) - this._minBufferSize, 0)) * o,
                        r = f.min(4 * a, r);
                    if (a) {
                        for (var c = 0; c < a; c += o) this._doProcessBlock(i, c);
                        n = i.splice(0, a), e.sigBytes -= r
                    }
                    return new u.init(n, r)
                },
                clone: function() {
                    var t = o.clone.call(this);
                    return t._data = this._data.clone(), t
                },
                _minBufferSize: 0
            }),
            h = (r.Hasher = d.extend({
                cfg: o.extend(),
                init: function(t) {
                    this.cfg = this.cfg.extend(t), this.reset()
                },
                reset: function() {
                    d.reset.call(this), this._doReset()
                },
                update: function(t) {
                    return this._append(t), this._process(), this
                },
                finalize: function(t) {
                    return t && this._append(t), this._doFinalize()
                },
                blockSize: 16,
                _createHelper: function(e) {
                    return function(t, n) {
                        return new e.init(n).finalize(t)
                    }
                },
                _createHmacHelper: function(e) {
                    return function(t, n) {
                        return new h.HMAC.init(e, n).finalize(t)
                    }
                }
            }), t.algo = {});
        return t
    }(Math)
});