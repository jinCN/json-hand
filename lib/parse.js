const unicode = require('./unicode')

let source
let parseState
let pos
let line
let column
let token
let root

module.exports = function parse (text, reviver) {
  source = String(text)
  parseState = 'start'
  pos = 0
  line = 1
  column = 0
  token = undefined
  root= undefined
  
  do {
    token = lex()
    
    // This code is unreachable.
    // if (!parseStates[parseState]) {
    //     throw invalidParseState()
    // }
    
    parseStates[parseState]()
  } while (token.type !== 'eof')
  
  if (typeof reviver === 'function') {
    return internalize({'':root}, '', reviver)
  }
  
  return root
}

function internalize (holder, name, reviver) {
  const value = holder[name]
  if (value != null && typeof value === 'object') {
    for (const key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        const replacement = internalize(value, key, reviver)
        if (replacement === undefined) {
          delete value[key]
        } else {
          value[key] = replacement
        }
      }
    }
  }
  
  return reviver.call(holder, name, value)
}

let lexState
let buffer

let escaped
let quote
let c
let level

function lex () {
  lexState = 'default'
  buffer = ''
  level = 0
  escaped = false
  quote = 0
  
  for (; ;) {
    c = peek()
    
    // This code is unreachable.
    // if (!lexStates[lexState]) {
    //     throw invalidLexState(lexState)
    // }
    
    const token = lexStates[lexState]()
    if (token) {
      return token
    }
  }
}

function peek () {
  if (source[pos]) {
    return String.fromCodePoint(source.codePointAt(pos))
  }
}

//pop peek result and modify c l p
function read () {
  const c = peek()
  
  if (c === '\n') {
    line++
    column = 0
  } else if (c) {
    column += c.length
  } else {
    column++
  }
  
  if (c) {
    pos += c.length
  }
  
  return c
}

const lexStates = {
  default () {
    if(c===undefined){
      read()
      return newToken('eof')
    }
    if (util.isSpaceSeparator(c)) {
      read()
      return
    }
    
    // This code is unreachable.
    // if (!lexStates[parseState]) {
    //     throw invalidLexState(parseState)
    // }
    lexState = 'value'
  },
  rawString () {
    if (c === '\\') {
      read()
      buffer += escape()
      escaped = true
      return
    }
    
    if (util.isSpaceSeparator(c) || util.isSpecial(c) || c === undefined) {
      if (c === '[' || c === '{') {
        throw invalidChar(read())
      }
      lexState = 'stringBuilt'
      return
    }
    
    buffer += read()
  },
  
  string () {
    switch (c) {
    case '\\':
      read()
      buffer += escape()
      return
    
    case '"':
    case '\'':
      if (quote === 1 && c === '\'' || quote === 2 && c === '"') {
        read()
        lexState = 'stringBuilt'
        let next = peek()
        if (!(util.isSpaceSeparator(next) || util.isSpecial(next))) {
          throw invalidChar(read())
        }
        if (next === '[' || next === '{') {
          throw invalidChar(read())
        }
        return
      }
      
      buffer += read()
      return
    
    case '\n':
    case '\r':
      throw invalidChar(read())
    
    case '\u2028':
    case '\u2029':
      separatorChar(c)
      break
    
    case undefined:
      throw invalidChar(read())
    }
    
    buffer += read()
  },
  delimiter () {
    if (c === ';') {
      read()
      level += 2
      return
    }
    // will return token seeing , or other
    if (c === ',') {
      if (level % 2 === 0) {
        throw invalidChar(read())
      }
      read()
      level += 1
    }
    return newToken('delimiter', level)
  },
  stringBuilt () {
    if (util.isSpaceSeparator(c)) {
      read()
      return
    }
    
    if (c === ':') {
      read()
      return newToken('key', buffer)
    }
    
    if (quote > 0 || escaped === true) {
      return newToken('string', buffer)
    }
    return newToken('rawString', buffer)
  },
  closePunctuator(){
    if(util.isSpaceSeparator(c)){
      return newToken('punctuator', buffer)
    }
    if(c==='}'||c===']'||c===','||c===';'||c===undefined){
      return newToken('punctuator', buffer)
    }
    throw invalidChar(c)
  },
  value () {
    switch (c) {
    case '{':
    case '[':
      return newToken('punctuator', read())
    case '}':
    case ']':
      buffer = read()
      lexState = 'closePunctuator'
      return
    
    case ',':
    case ';':
      if (read() === ',') {
        level = 0
      } else {
        level = 1
      }
      lexState = 'delimiter'
      return
    case '"':
    case '\'':
      if (read() === '"') {
        quote = 2
      } else {
        quote = 1
      }
      buffer = ''
      lexState = 'string'
      return
    
    case undefined:
      throw invalidChar(read())
    }
    lexState = 'rawString'
  }
}

//
function newToken (type, value) {
  return {
    type,
    value,
    line,
    column
  }
}

function literal (s) {
  for (const c of s) {
    const p = peek()
    
    if (p !== c) {
      throw invalidChar(read())
    }
    
    read()
  }
}

function escape () {
  const c = peek()
  switch (c) {
  case 'b':
    read()
    return '\b'
  
  case 'f':
    read()
    return '\f'
  
  case 'n':
    read()
    return '\n'
  
  case 'r':
    read()
    return '\r'
  
  case 't':
    read()
    return '\t'
  
  case 'v':
    read()
    return '\v'
  
  case '0':
    read()
    if (util.isDigit(peek())) {
      throw invalidChar(read())
    }
    
    return '\0'
  
  case 'x':
    read()
    return hexEscape()
  
  case 'u':
    read()
    return unicodeEscape()
  
  case '\n':
  case '\u2028':
  case '\u2029':
    read()
    return ''
  
  case '\r':
    read()
    if (peek() === '\n') {
      read()
    }
    
    return ''
  
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    throw invalidChar(read())
  
  case undefined:
    throw invalidChar(read())
  }
  
  return read()
}

function hexEscape () {
  let buffer = ''
  let c = peek()
  
  if (!util.isHexDigit(c)) {
    throw invalidChar(read())
  }
  
  buffer += read()
  
  c = peek()
  if (!util.isHexDigit(c)) {
    throw invalidChar(read())
  }
  
  buffer += read()
  
  return String.fromCodePoint(parseInt(buffer, 16))
}

function unicodeEscape () {
  let buffer = ''
  let count = 4
  
  while (count-- > 0) {
    const c = peek()
    if (!util.isHexDigit(c)) {
      throw invalidChar(read())
    }
    
    buffer += read()
  }
  
  return String.fromCodePoint(parseInt(buffer, 16))
}

let key
let stack
let parseLevel
const parseStates = {
  start () {
    parseLevel = 0
    stack = []
    key = undefined
    
    parseStates['beforeValue']()
  },
  beforeValue () {
    if (token.type === 'eof') {
      throw invalidEOF()
    }
    if (token.type === 'delimiter') {
      throw invalidToken()
    }
    if (token.type === 'punctuator' ) {
      if(token.value === ']'){
        throw invalidToken()
      }
      if (token.value === '}') {
        throw invalidToken()
      }
    }
    push()
  },
  beforeArrValue () {
    if (token.type === 'eof') {
      throw invalidEOF()
    }
    if (token.type === 'delimiter') {
      throw invalidToken()
    }
    if (token.type === 'punctuator') {
      if (token.value === ']') {
        return popUntilArr()
      }
      if (token.value === '}') {
        throw invalidToken()
      }
    }
    push()
  },
  beforeKey () {
    if (token.type === 'eof') {
      throw invalidEOF()
    }
    if (token.type === 'delimiter') {
      throw invalidToken()
    }
    if (token.type === 'punctuator') {
      if (token.value === '}') {
        return popUntilObj()
      }
      else {
        throw invalidToken()
      }
    }
    
    push()
  },
  afterValue () {
    if (token.type === 'eof') {
      return popUntilEof()
    }
    if (token.type === 'punctuator') {
      if (token.value === ']') {
        return popUntilArr()
      }
      if (token.value === '}') {
        return popUntilObj()
      }
    }
    if (token.type === 'delimiter') {
      popUntilLevel(token.value)
      parseState = 'afterDelimiter'
      return
    }
    popUntilLevel(0)
    push()
  }
}

function translate (rawString) {
  switch (rawString) {
  case 'null':
    return null
  case 'true':
    return true
  case 'false':
    return false
  }
  if (!isNaN(rawString)) {
    return rawString - 0
  }
  return rawString
}

function push () {
  let value
  let info
  switch (token.type) {
  case 'punctuator':
    switch (token.value) {
    case '{':
      parseLevel = 0
      value = {}
      info = {type: 'obj', value}
      
      break
    
    case '[':
      parseLevel = 0
      value = []
      info = {type: 'arr', value}
      break
    
    }
    
    break
  
  case 'rawString':
  case 'string':
    if (token.type === 'rawString') {
      value = translate(token.value)
    } else {
      value = token.value
    }
    info = {type: 'value', value}
    
    break
  
  case 'key':
    value = {}
    info = {type: 'obj_h', value}
    break
  }
  const parent = stack[stack.length - 1]
  if (root === undefined) {
    root = value
  } else if (info) {
    if (parent.type === 'obj' || parent.type === 'obj_h') {
      if (info.type === 'obj_h' && key === undefined) {
        key = token.value
        parseState = 'beforeValue'
        return
      }
      parent.value[key] = info.value
      key = undefined
    } else if (parent.type === 'arr') {
      parent.value.push(info.value)
    }
  }
  if (info.type = 'value') {
    parseState = 'afterValue'
    return
  }
  if (info.type === 'obj') {
    parseState = 'beforeKey'
  } else if (info.type === 'arr') {
    parseState = 'beforeArrValue'
  }
  else if (info.type === 'obj_h') {
    key = token.value
    parseState = 'beforeValue'
  }
  stack.push(info)
}

function popUntilLevel (level) {
  let current = stack[stack.length - 1]
  if(level === 0){
    while(current.type!=='obj'&&current.type!=='arr'){
      if(stack.length ===1){
      
      }
    }
  }
  while (current.level > level || current.limitLevel > level||current.type==='obj_h'||current.type==='arr_h')
  {
    current = pop()
  }
  
}

function popUntilEof(){
  do {
    var current = pop()
    if (current.type === 'arr') {
      throw invalidToken()
    }
    if (current.type === 'obj') {
      throw invalidToken()
    }
  }
  while (stack.length>0)
}
function popUntilObj () {
  do {
    var current = pop()
    if (current.type === 'arr') {
      throw invalidToken()
    }
  }
  while (current.type !== 'obj')
  parseState = 'afterValue'
}

function popUntilArr () {
  do {
    var current = pop()
    if (current.type === 'obj') {
      throw invalidToken()
    }
  }
  while (current.type !== 'arr')
  parseState = 'afterValue'
}

// This code is unreachable.
// function invalidParseState () {
//     return new Error(`JSON5: invalid parse state '${parseState}'`)
// }

// This code is unreachable.
// function invalidLexState (state) {
//     return new Error(`JSON5: invalid lex state '${state}'`)
// }

function invalidChar (c) {
  if (c === undefined) {
    return syntaxError(`json-hand: invalid end of input at ${line}:${column}`)
  }
  
  return syntaxError(`json-hand: invalid character '${formatChar(c)}' at ${line}:${column}`)
}

function invalidEOF () {
  return syntaxError(`json-hand: invalid end of input at ${line}:${column}`)
}

function invalidToken () {
  if (token.type === 'eof') {
    return syntaxError(`json-hand: invalid end of input at ${line}:${column}`)
  }
  
  const c = String.fromCodePoint(token.value.codePointAt(0))
  return syntaxError(`json-hand: invalid character '${formatChar(c)}' at ${line}:${column}`)
}

function invalidIdentifier () {
  column -= 5
  return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`)
}

function separatorChar (c) {
  console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`)
}

function formatChar (c) {
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
  }
  
  if (replacements[c]) {
    return replacements[c]
  }
  
  if (c < ' ') {
    const hexString = c.charCodeAt(0).toString(16)
    return '\\x' + ('00' + hexString).substring(hexString.length)
  }
  
  return c
}

function syntaxError (message) {
  const err = new SyntaxError(message)
  err.lineNumber = line
  err.columnNumber = column
  return err
}

var util = {
  isSpaceSeparator (c) {
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
      return true
    }
    return unicode.Space_Separator.test(c)
  },
  isSpecial (c) {
    switch (c) {
    case ',':
    case ';':
    case '[':
    case ']':
    case '{':
    case '}':
    case ':':
      return true
    }
    return false
  },
  isIdStartChar (c) {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      (c === '$') || (c === '_') ||
      unicode.ID_Start.test(c)
    )
  },
  
  isIdContinueChar (c) {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      (c >= '0' && c <= '9') ||
      (c === '$') || (c === '_') ||
      (c === '\u200C') || (c === '\u200D') ||
      unicode.ID_Continue.test(c)
    )
  },
  
  isDigit (c) {
    return /[0-9]/.test(c)
  },
  
  isHexDigit (c) {
    return /[0-9A-Fa-f]/.test(c)
  }
}

