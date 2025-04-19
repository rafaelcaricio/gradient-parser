# Gradient Parser

[![npm version](https://badge.fury.io/js/gradient-parser.svg)](https://badge.fury.io/js/gradient-parser)

## About

Parse CSS3 gradient definition and returns AST `object`.

## Examples

```JavaScript
  var gradient = require('gradient-parser');
  var obj = gradient.parse('linear-gradient(30deg, #000, transparent)');
  console.log(JSON.stringify(obj, null, 2));
```

Results in:

```JSON
[
  {
    "type": "linear-gradient",
    "orientation": {
      "type": "angular",
      "value": "30"
    },
    "colorStops": [
      {
        "type": "hex",
        "value": "000"
      },
      {
        "type": "literal",
        "value": "transparent"
      }
    ]
  }
]
```

## Installation

Install via npm:
```bash
npm install gradient-parser
```

Import in Node.js:
```javascript
const gradient = require('gradient-parser');
```

For browser usage:
```html
<script src="node_modules/gradient-parser/build/web.js"></script>
```

Or [download the zip](https://github.com/rafaelcaricio/gradient-parser/archive/master.zip)

## Development

### Project Status

Gradient-parser has been modernized (as of v1.1.0):
- Removed Bower support in favor of npm exclusively
- Replaced Grunt with a modern build system using esbuild
- Added minification support
- Updated dependencies to specific versions
- Improved npm scripts for better developer experience

### Build

Gradient-parser uses a modern build system with esbuild for building and minification.

```bash
# Build both Node.js and web bundles
npm run build

# Build only Node.js bundle
npm run build:node

# Build only web bundle
npm run build:web

# Build minified bundles
npm run build:minify
```

### Testing

Run the test suite with:

```bash
npm test
```

### Starting a local server

You can run a simple HTTP server for development:

```bash
npm start
```

## API

### gradient.parse

Accepts the gradient definitions as it is declared in `background-image` and returns an AST `object`.

## AST

### Common properties

All nodes have the following properties.

#### type

`String`. The possible values are the ones listed in the Types section bellow.

### Types

The available values of `node.type` are listed below, as well as the available properties of each node (other than the common properties listed above).

### linear-gradient

- orientation: `Object` possible types `directional` or `angular`.
- colorStops: `Array` of color stops of type `literal`, `hex`, `rgb`, or `rgba`.

### repeating-linear-gradient

- orientation: `Object` possible types `directional` or `angular`.
- colorStops: `Array` of color stops of type `literal`, `hex`, `rgb`, or `rgba`.

### radial-gradient

- orientation: `Array` or `undefined`. `Array` of possible types `shape`, `default-radial`.
- colorStops: `Array` of color stops of type `literal`, `hex`, `rgb`, or `rgba`.

### repeating-radial-gradient

- orientation: `Array` or `undefined`. `Array` of possible types `shape`, `default-radial`.
- colorStops: `Array` of color stops of type `literal`, `hex`, `rgb`, or `rgba`.

### directional

- value: `String` possible values `left`, `top`, `bottom`, or `right`.

### angular

- value: `Number` integer number.

### literal

- value: `String` literal name of the color.

### hex

- value: `String` hex value.

### rgb

- value: `Array` of length 3 of `Number`'s.

### rgba

- value: `Array` of length 4 or `Number`'s.

### shape

- style: `Object` or `undefined` possible types `extent-keyword`, `px`, `em`, `%`, or `positioning-keyword`.
- value: `String` possible values `ellipse` or `circle`.
- at: `Object` of attributes:
	- x: `Object` possible types `extent-keyword`, `px`, `em`, `%`, or `positioning-keyword`.
	- y: `Object` possible types `extent-keyword`, `px`, `em`, `%`, or `positioning-keyword`.

### default-radial

- at: `Object` of attributes:
	- x: `Object` possible types `extent-keyword`, `px`, `em`, `%`, or `positioning-keyword`.
	- y: `Object` possible types `extent-keyword`, `px`, `em`, `%`, or `positioning-keyword`.

### positioning-keyword

- value: `String` possible values `center`, `left`, `top`, `bottom`, or `right`.

### extent-keyword

- value: `String` possible values `closest-side`, `closest-corner`, `farthest-side`, `farthest-corner`, `contain`, or `cover`.

## License

(The MIT License)

Copyright (c) 2014-2025 Rafael Caricio rafael@caricio.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
