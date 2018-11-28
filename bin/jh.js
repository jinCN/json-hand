#!/usr/bin/env node

const jsonh = require('../lib')
try {
  var result = jsonh.json(process.argv[2])
} catch (e) {
  console.error(e.toString())
  process.exit(1)
}
console.log(result)
