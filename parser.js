// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var Parser = (function() {

  var types = {
    gradients: [
      'linear-gradient',
      'radial-gradient',
      'repeating-radial-gradient'
    ],
    colors: [
      'hex',
      'rgb',
      'rgba',
      'hsl',
      'literal'
    ]
  };

  function Constructor() {
  }

  Constructor.prototype.parse = function(input) {
    return null;
  }

  return Constructor;
})();


var p = new Parser('linear-gradient(to right, transparent 10px, #c2c2c2 10px)');
var ast = p.parse();

if (ast == [
  {
    type: 'linear-gradient',
    orientation: {
      type: 'directional',
      value: 'right'
    },
    colorStops: [
      {
        type: 'literal',
        value: 'transparent',
        length: {
          value: '10',
          type: 'px'
        }
      },
      {
        type: 'hex',
        value: 'c2c2c2',
        length: {
          value: '10',
          type: 'px'
        }
      }
    ]
  }]) {
  console.log('Done!');
} else {
  console.log('Keep working...');
}
