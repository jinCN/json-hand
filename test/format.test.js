/* eslint-env jest */
const parse = require('../lib/parse')
const format = require('../lib/format')

function t (x) {
  expect(parse(format(x))).toEqual(x)
}

test('format simple', () => {
  let values = [
    1e4,
    `1`,
    ` 1`,
    `1 `,
    `null `,
    `true`,
    `false`,
    1,
    5,
    null,
    true,
    false,
    [],
    {},
    { a: [{}] }
  ]
  for (let x of values) {
    t(x)
  }
})

test('format complex', () => {
  let values = [
    [1e4, null, { a: 3 }, [1, 3], 'go go'],
    { abc: { d: { e: [1, 3, 4] } } }
  ]
  for (let x of values) {
    t(x)
  }
})
