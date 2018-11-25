# json-hand
upgraded JSON for hand-writing with back-compatibility

## thoughts
1. avoid hand-writing(human-writing) pain
2. thus, we care about spaces, but not indents
3. and more, avoid unnecessary brackets
4. that's all
## example
### simple
```text
a:1 b:true c:null d:'hello'
```
```json
{"a":1, "b":true, "c":null, "d":"hello"}
```

### object
```text
a:{b:'k'} b:c:1 b:d:e:2 b:f:3
```
```json
{"a":{"b":"k"}, "b":{"c":1, "d":{"e":2}, "f":3}}
```
explain: thought it looks like b:d:e:2 is assigning 2 to b.d.e, it's not.

it's the same as saying bracketing them together.

so it's important for them being put together.

eg. b:c:1 followed by d:2 then followed by b:e:3 will introduce an error.

this is good to limit the functionality only for presenting data .

### array
```text
[1 2 [3 b:4] {c:d:5 c:e:6}]
```
```json
[1, 2, [3, {"b":4}], {"c":{"d":5, "e":6} }]
```

### and
that's all
