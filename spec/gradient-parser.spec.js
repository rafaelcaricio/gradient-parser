'use strict';

var expect = require('expect.js');
var gradientParser = require('gradient-parser');

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
    expect(typeof gradientParser).to.equal('function');
  });

  describe('when parsing a simple definition', function(){
    var ast;

    beforeEach(function() {
      ast = gradientParser('linear-gradient(to right bottom, red, blue)');
    });

    it('should get the gradient type', function () {
      expect(ast[0].type).to.equal('linear-gradient');
    });

  });
});
