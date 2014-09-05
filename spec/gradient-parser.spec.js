'use strict';

var expect = require('expect.js');
var GradientParser = require('gradient-parser');

// [
//   {
//     type: 'linear-gradient',
//     orientation: {
//       type: 'directional',
//       value: 'right'
//     },
//     colorStops: [
//       {
//         type: 'literal',
//         value: 'transparent',
//         length: {
//           value: '10',
//           type: 'px'
//         }
//       },
//       {
//         type: 'hex',
//         value: 'c2c2c2',
//         length: {
//           value: '10',
//           type: 'px'
//         }
//       }
//     ]
//   }
// ]

describe('gradient-parser.js', function () {
  it('should exist', function () {
    expect(typeof GradientParser).to.equal('function');
  });

  describe('when parsing a simple definition', function(){
    var ast;

    beforeEach(function() {
      var parser = new GradientParser();
      ast = parser.parse('linear-gradient(to right bottom, red, blue)');
    });

    it('should get the gradient type', function () {
      expect(ast[0].type).to.equal('linear-gradient');
    });

  });
});
