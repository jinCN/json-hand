module.exports = format;

function format(target) {
  let result = '';
  let indent = 0;
  appendValue(target, '', true);
  return result;

  function appendValue(value, delimiter = '\n', root = false) {
    let type = typeof value;

    if (type === 'number' || type === 'boolean' || type === 'undefined' || value === null) {
      append(JSON.stringify(value) + delimiter);
    } else if (type === 'string') {
      append(util.quoteString(value, true) + delimiter);
    } else if (type === 'object' && Array.isArray(value)) {
      if (value.length === 0) {
        append('[]' + delimiter);
      } else {
        let nextDelimiter = '\n';
        append('[' + nextDelimiter);
        indent += 2;

        for (let element of value) {
          appendIndent();
          appendValue(element, nextDelimiter);
        }

        indent -= 2;
        appendIndent();
        append(']' + delimiter);
      }
    } else if (type === 'object') {
      let entries = Object.entries(value);
      entries = entries.filter(([k, v]) => v !== undefined);

      if (entries.length === 0) {
        append('{}' + delimiter);
      } else {
        let nextDelimiter = '\n';
        let doBracket = !(entries.length === 1 || root === true);

        if (doBracket) {
          append('{' + nextDelimiter);
          indent += 2;
        }

        for (let [k, v] of entries) {
          if (doBracket) {
            appendIndent();
          }

          append(util.quoteString(k) + ': ');
          appendValue(v, nextDelimiter);
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

let util = {
  quoteString(value, asValue = false) {
    let isQuote = false;
    const quotes = {
      '\'': 0.1,
      '"': 0.2
    };
    const replacements = {
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
      '\u2028': '\\u2028',
      '\u2029': '\\u2029'
    };
    let product = '';

    for (const c of value) {
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
        let hexString = c.charCodeAt(0).toString(16);
        product += '\\x' + ('00' + hexString).substring(hexString.length);
        isQuote = true;
        continue;
      }

      product += c;
    }

    if (!isQuote && asValue) {
      if (value !== util.translate(value)) {
        isQuote = true;
      }
    }

    if (!isQuote) {
      return value;
    }

    const quoteChar = Object.keys(quotes).reduce((a, b) => quotes[a] < quotes[b] ? a : b);
    product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);
    return quoteChar + product + quoteChar;
  },

  translate(rawString) {
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

  isSpaceSeparator(c) {
    switch (c) {
      case '\t':
      case '\v':
      case '\f':
      case ' ':
      case '\u00A0':
      case '\uFEFF':
      case '\n':
      case '\r':
      case '\u2028':
      case '\u2029':
        return true;
    }

    return /[\u1680\u2000-\u200A\u202F\u205F\u3000]/.test(c);
  },

  isSpecial(c) {
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