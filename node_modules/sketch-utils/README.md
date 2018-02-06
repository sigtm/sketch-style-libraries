# Sketch Utils

_A collection of useful functions to deal with Sketch's CocoaScript bridge_

## Installation

```bash
npm install --save sketch-utils
```

## API

### `utils.toArray`

When an `NSArray` is bridged by CocoaScript, it is not exactly a JavaScript array, some methods are missing (like `map` for example). `utils.toArray` makes sure that you have a proper array.

```js
var utils = require('sketch-utils')

var array = utils.toArray(nsArray)
```

### `utils.prepareStackTrace`

When an error occurs, CocoaScript returns a stack trace that is not following the NodeJS syntax. `utils.prepareStackTrace` parses the stack trace and returns an array of callsites.

```js
var utils = require('sketch-utils')

var stackTrace = utils.prepareStackTrace(err.stack)
[
  {
    fn: string, // the name of the function in which the error occurred
    file: string, // the name of the file in which the error occurred
    filePath: string, // the path to the file
    line: number, // the line at which the error occurred
    column: number // the column at which the error occurred
  }
]
```

### `utils.prepareValue`

When an error occurs, CocoaScript returns a stack trace that is not following the NodeJS syntax. `utils.prepareStackTrace` parses the stack trace and returns an array of callsites.

```js
var utils = require('sketch-utils')

var stackTrace = utils.prepareStackTrace(err.stack)
[
  {
    fn: string, // the name of the function in which the error occurred
    file: string, // the name of the file in which the error occurred
    filePath: string, // the path to the file
    line: number, // the line at which the error occurred
    column: number // the column at which the error occurred
  }
]
```
