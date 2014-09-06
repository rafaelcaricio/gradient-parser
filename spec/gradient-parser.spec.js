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
  var ast,
    subject;

  it('should exist', function () {
    expect(typeof gradientParser).to.equal('function');
  });

  describe('when parsing wrong definition should throw an error', function() {
    it('when there\'s one more comma in definitions', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue),');
      }).to.throwException(/One extra comma/);
    });

    it('when there\'s one more comma in colors', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue,)');
      }).to.throwException(/One extra comma/);
    });

    it('when there\'s invalid input', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue) aaa');
      }).to.throwException(/Invalid input not EOF/);
    });

    it('when there\'s missing open call', function() {
      expect(function() {
        gradientParser('linear-gradient red, blue');
      }).to.throwException(/Missing \(/);
    });

    it('when there\'s missing comma before color stops', function() {
      expect(function() {
        gradientParser('linear-gradient(to right red, blue)');
      }).to.throwException(/Missing comma before color stops/);
    });

    it('when there\'s missing color stops', function() {
      expect(function() {
        gradientParser('linear-gradient(to right, )');
      }).to.throwException(/Missing color definitions/);
    });

    it('when there\'s missing closing call', function() {
      expect(function() {
        gradientParser('linear-gradient(to right, red, blue aaa');
      }).to.throwException(/Missing \)/);
    });
  });

  describe('when parsing a simple definition', function(){
    beforeEach(function() {
      ast = gradientParser('linear-gradient(red, blue)');
      subject = ast[0];
    });

    it('should get the gradient type', function () {
      expect(subject.type).to.equal('linear-gradient');
    });

    it('should get the orientation', function() {
      expect(subject.orientation).to.be(undefined);
    });

    describe('colors', function() {
      it('should get all colors', function() {
        expect(subject.colorStops).to.have.length(2);
      });

      describe('first color', function() {
        beforeEach(function() {
          subject = subject.colorStops[0];
        });

        it('should get literal type', function() {
          expect(subject.type).to.equal('literal');
        });

        it('should get the right color', function() {
          expect(subject.value).to.equal('red');
        });
      });

      describe('second color', function() {
        beforeEach(function() {
          subject = subject.colorStops[1];
        });

        it('should get literal type', function() {
          expect(subject.type).to.equal('literal');
        });

        it('should get the right color', function() {
          expect(subject.value).to.equal('blue');
        });
      });
    });
  });
});
