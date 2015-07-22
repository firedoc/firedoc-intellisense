
FireDoc Intellisense
--------------------

Build an intellisense from FireDoc AST

### Install

```sh
$ npm install firedoc-intellisense
```

### Usage

```js

var FireDoc = require('firedoc-api').Firedoc;
var Intellisense = require('firedoc-intellisense');

FireDoc({
  path: <your dest path>,
  parseOnly: true
}).build(
  function (err, ast, opt) {
    Intellisense(ast); // get intellisense
  }
);
```

### License

MIT

