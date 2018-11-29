const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const terser = require('rollup-plugin-terser').terser
const babel = require('rollup-plugin-babel')
const babelPresetEnv = require('@babel/preset-env')

const pkg = require('./package.json')

module.exports = [
  // ES5 Non-minified
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'jsonh',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        presets: [[babelPresetEnv, { modules: false }]],
        babelrc: false
      })
    ]
  },
  // ES5 Minified
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'jsonh',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        presets: [[babelPresetEnv, { modules: false }]],
        babelrc: false
      }),
      terser()
    ]
  }
]
