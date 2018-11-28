module.exports = format

function format (target) {
  let result = ''
  let indent = 0
  appendValue(target, '', true)
  return result

  function appendValue (value, delimiter = '\n', root = false) {
    let type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean' || type ===
      'undefined' || value === null) {
      append(JSON.stringify(value) + delimiter)
    } else if (type === 'object' && Array.isArray(value)) {
      if (value.length === 0) {
        append('[]' + delimiter)
      } else {
        let nextDelimiter = '\n'
        append('[' + nextDelimiter)
        indent += 2
        for (let element of value) {
          appendIndent()
          appendValue(element, nextDelimiter)
        }
        indent -= 2
        appendIndent()
        append(']' + delimiter)
      }
    } else if (type === 'object') {
      let entries = Object.entries(value)
      entries = entries.filter(([k, v]) => v !== undefined)
      if (entries.length === 0) {
        append('{}' + delimiter)
      } else {
        let nextDelimiter = '\n'
        let doBracket = !(entries.length === 1 || root === true)
        if (doBracket) {
          append('{' + nextDelimiter)
          indent += 2
        }
        for (let [k, v] of entries) {
          if (doBracket) {
            appendIndent()
          }
          append(k + ': ')
          appendValue(v, nextDelimiter)
        }
        if (doBracket) {
          indent -= 2
          appendIndent()
          append('}' + delimiter)
        }
      }
    }
  }

  function appendIndent () {
    append(' '.repeat(indent))
  }
  function append (str) {
    result += str
  }
}
