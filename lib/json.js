"use strict";

module.exports = json;

var parse = require('./parse');

function json(source) {
  source = String(source);
  return JSON.stringify(parse(source), null, 2);
}