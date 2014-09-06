# Gradient Parser

## About

Parse CSS3 gradient definition and returns AST.

## Examples

### JavaScript

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

## Install Choices
- `bower install gradient-parser`
- [download the zip](https://github.com/rafaelcaricio/gradient-parser/archive/master.zip)

## License

(The MIT License)

Copyright (c) 2014 Rafael Caricio rafael@caricio.com

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
