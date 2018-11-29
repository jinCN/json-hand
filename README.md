# json-hand
upgraded JSON for hand-writing with back-compatibility. [`play it`](https://unpkg.com/json-hand/example/index.html)

## example
### simple
```text
a:1 b:true c:null d:hello
```
means:
```json
{"a":1, "b":true, "c":null, "d":"hello"}
```

### object
```text
a:b:k b:c:1;d:e:2;f:3:4
```
means:
```json
{"a":{"b":"k"}, "b":{"c":1, "d":{"e":2}, "f":{"3":4}}}
```

### array
```text
[1 2 [3 b:4] {c:d:5; e:6}]
```
means
```json
[1, 2, [3, {"b":4}], {"c":{"d":5, "e":6} }]
```

## why you will like this JSON style?
1. avoid hand-writing(write JSON as a human) pain
2. remove any unnecessary element
3. that's all

## what does it do?
1. `,` can be totally replaced by any space separators
2. `{` and `}` can be removed in many situations
3. `'` and `"` are both supported for strings
4. (while they can both be removed if strings can be detected) 
5. one and only one thing is necessarily introduced here: `;` `;,` `;;` `;;,` and so on 

## install

the easiest way to install json-hand is from [`npm`](https://www.npmjs.com/):

```sh
npm install json-hand
```
require it in your code:
```javascript
const jsonh = require('json-hand')
```
also, you can use script tag in browser

```html
<script src="https://unpkg.com/json-hand/dist/index.min.js"></script>
```

this will create a global variable `jsonh`.

## usage
you can use it like this:

```javascript
let obj = jsonh.parse(`abc:1 d:2 c:[d:3 e:f:g;h:i]`)
console.log(jsonh.format(obj))
```

`jsonh.json` translates a json-hand string to json
```javascript
jsonh.json(`abc:1 d:2 c:[d:3 e:f:g;h:i]`)
//is equivalent to
JSON.stringify(jsonh.parse(`abc:1 d:2 c:[d:3 e:f:g;h:i]`), null, 2)
```

a cli tool `jh` who translates json-hand to json is a bonus for convenience. if you install json-hand globally, you can
 use it like this
```sh
npm install -g json-hand
jh a:1,b:2
```
output is
```sh 
{
  "a": 1,
  "b": 2
}
```
you can use `jh` with other tools who want json:
```sh
curl -d `jh a:1,b:2` ...
```

## one thing needs explaination

`;` is functioning almost same as space, except for its associativity and precedence

`a:b;c:d` just means `a:b c:d`, and while you write `x:a:b;c:d`, it can be recognized as `x:{a:b;c:d}`

in a context where `;` has already been used, you can use `;,` for higher precedence

space and `,` has a precedence of 1, `;` is 2, `;,`(same as `,;`) is 3, `;;` is 4, and so on

an example can explain them all:

```text
top1:some:some:node1:value1
              ;node2:subnode1:value2
                   ,;subnode2:value3
              ;node3:value4
top2:a:b;c:d
```
means

```json
{
  "top1": {
    "some": {
      "some": {
        "node1": "value1",
        "node2": {
          "subnode1": "value2",
          "subnode2": "value3"
        },
        "node3": "value4"
      }
    }
  },
  "top2": {
    "a": "b",
    "c": "d"
  }
}
```

## last
that's all. it has to be EXTREMEly simple from day one. it's also well tested and stable.

it's still not suggested for serious production use until 1.x.x version, but so long as it's simple and actively 
maintained, you can give it a try.
