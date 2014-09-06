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

  describe('error cases', function() {
    it('one more comma in definitions', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue),');
      }).to.throwException(/One extra comma/);
    });

    it('one more comma in colors', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue,)');
      }).to.throwException(/Expected color definition/);
    });

    it('invalid input', function() {
      expect(function() {
        gradientParser('linear-gradient(red, blue) aaa');
      }).to.throwException(/Invalid input not EOF/);
    });

    it('missing open call', function() {
      expect(function() {
        gradientParser('linear-gradient red, blue');
      }).to.throwException(/Missing \(/);
    });

    it('missing comma before color stops', function() {
      expect(function() {
        gradientParser('linear-gradient(to right red, blue)');
      }).to.throwException(/Missing comma before color stops/);
    });

    it('missing color stops', function() {
      expect(function() {
        gradientParser('linear-gradient(to right, )');
      }).to.throwException(/Expected color definition/);
    });

    it('missing closing call', function() {
      expect(function() {
        gradientParser('linear-gradient(to right, red, blue aaa');
      }).to.throwException(/Missing \)/);
    });
  });

  describe('when parsing a simple definition', function() {
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

  ['px', 'em', '%'].forEach(function(metric) {
    describe('parse color stop for metric '+ metric, function() {
      beforeEach(function() {
        ast = gradientParser('linear-gradient(blue 10' + metric + ', transparent)');
        subject = ast[0];
      });

      describe('the first color', function() {
        beforeEach(function() {
          subject = subject.colorStops[0];
        });

        it('should have the length', function() {
          expect(subject.length.type).to.equal(metric);
          expect(subject.length.value).to.equal('10');
        });
      });
    });
  });

  [
    {type: 'angle', unparsedValue: '145deg', value: '145'},
    {type: 'directional', unparsedValue: 'to left top', value: 'left top'}
  ].forEach(function(orientation) {
    describe('parse orientation ' + orientation.type, function() {
      beforeEach(function() {
        ast = gradientParser('linear-gradient(' + orientation.unparsedValue + ', blue, green)');
        subject = ast[0];
      });

      it('should parse the ' + orientation.type + ' orientation', function() {
        expect(subject.orientation.type).to.equal(orientation.type);
        expect(subject.orientation.value).to.equal(orientation.value);
      });
    });
  });
});
