/* eslint-env jest */

const parse = require('../lib/parse')

function t (x, y) {
  if (y == null) {
    expect(parse(x)).toEqual(JSON.parse(x))
  } else {
    expect(parse(x)).toEqual(y)
  }
}

test('parse simple', () => {
  let values = [
    `1`,
    ` 1`,
    `1 `,
    `null `,
    `true`,
    `false`,
    `{ "a ": 3, " b": "x k" , "c":[ {"x":1},3 ]}`
  ]
  for (let x of values) {
    t(x)
  }
})

test('parse complex', () => {
  let values = []
  values.push([
    `{
a:1a b:1e
c:1e1 d: [ a: 1 b :2;c:3]
1x :{2a- :-1 3(:-x:-_y}
}`,
    {
      a: '1a',
      b: '1e',
      c: 1e1,
      d: [{ a: 1 }, { b: 2, c: 3 }],
      '1x': {
        '2a-': -1,
        '3(': { '-x': '-_y' }
      }
    }
  ])

  values.push([
    `a:b:1;c:2 d:e:[
x:y:z:u;,
a:b;,
c:d:e;,
f:g:h;;
3:4:5;
7:8 9
k:j:i
]`,
    {
      a: { b: 1, c: 2 },
      d: { e: [
        { x: { y: { z: 'u', a: 'b', c: { d: 'e' }, f: { g: 'h', 3: { 4: 5 } } }, 7: 8 } },
        9,
        { k: { j: 'i' } }
      ] }
    }

  ])

  for (let [x, y] of values) {
    t(x, y)
  }
})
