"use strict";

function _objectEntries(obj) {
  var entries = [];
  var keys = Object.keys(obj);

  for (var k = 0; k < keys.length; k++) entries.push([keys[k], obj[keys[k]]]);

  return entries;
}

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = format;

function format(target) {
  var result = '';
  var indent = 0;
  appendValue(target, '', true);
  return result;

  function appendValue(value) {
    var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\n';
    var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var type = _typeof(value);

    if (type === 'number' || type === 'boolean' || type === 'undefined' || value === null) {
      append(JSON.stringify(value) + delimiter);
    } else if (type === 'string') {
      append(util.quoteString(value, true) + delimiter);
    } else if (type === 'object' && Array.isArray(value)) {
      if (value.length === 0) {
        append('[]' + delimiter);
      } else {
        var nextDelimiter = '\n';
        append('[' + nextDelimiter);
        indent += 2;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var element = _step.value;
            appendIndent();
            appendValue(element, nextDelimiter);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        indent -= 2;
        appendIndent();
        append(']' + delimiter);
      }
    } else if (type === 'object') {
      var entries = _objectEntries(value);

      entries = entries.filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        return v !== undefined;
      });

      if (entries.length === 0) {
        append('{}' + delimiter);
      } else {
        var _nextDelimiter = '\n';
        var doBracket = !(entries.length === 1 || root === true);

        if (doBracket) {
          append('{' + _nextDelimiter);
          indent += 2;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = entries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                k = _step2$value[0],
                v = _step2$value[1];

            if (doBracket) {
              appendIndent();
            }

            append(util.quoteString(k) + ': ');
            appendValue(v, _nextDelimiter);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (doBracket) {
          indent -= 2;
          appendIndent();
          append('}' + delimiter);
        }
      }
    }
  }

  function appendIndent() {
    append(' '.repeat(indent));
  }

  function append(str) {
    result += str;
  }
}

var util = {
  quoteString: function quoteString(value) {
    var asValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var isQuote = false;
    var quotes = {
      '\'': 0.1,
      '"': 0.2
    };
    var replacements = {
      '\'': '\\\'',
      '"': '\\"',
      '\\': '\\\\',
      '\b': '\\b',
      '\f': '\\f',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\v': '\\v',
      '\0': '\\0',
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    var product = '';
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var c = _step3.value;

        switch (c) {
          case '\'':
          case '"':
            quotes[c]++;
            product += c;
            isQuote = true;
            continue;
        }

        if (util.isSpaceSeparator(c) || util.isSpecial(c)) {
          isQuote = true;
        }

        if (replacements[c]) {
          product += replacements[c];
          isQuote = true;
          continue;
        }

        if (c < ' ') {
          var hexString = c.charCodeAt(0).toString(16);
          product += '\\x' + ('00' + hexString).substring(hexString.length);
          isQuote = true;
          continue;
        }

        product += c;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    if (!isQuote && asValue) {
      if (value !== util.translate(value)) {
        isQuote = true;
      }
    }

    if (!isQuote) {
      return value;
    }

    var quoteChar = Object.keys(quotes).reduce(function (a, b) {
      return quotes[a] < quotes[b] ? a : b;
    });
    product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);
    return quoteChar + product + quoteChar;
  },
  translate: function translate(rawString) {
    switch (rawString) {
      case 'null':
        return null;

      case 'true':
        return true;

      case 'false':
        return false;
    }

    if (!isNaN(rawString)) {
      return rawString - 0;
    }

    return rawString;
  },
  isSpaceSeparator: function isSpaceSeparator(c) {
    switch (c) {
      case '\t':
      case '\v':
      case '\f':
      case ' ':
      case "\xA0":
      case "\uFEFF":
      case '\n':
      case '\r':
      case "\u2028":
      case "\u2029":
        return true;
    }

    return /[\u1680\u2000-\u200A\u202F\u205F\u3000]/.test(c);
  },
  isSpecial: function isSpecial(c) {
    switch (c) {
      case ',':
      case ';':
      case '[':
      case ']':
      case '{':
      case '}':
      case ':':
        return true;
    }

    return false;
  }
};