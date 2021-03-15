'use strict';

var expect = require('expect.js');
var gradients = require('../build/node');


describe('lib/parser.js', function () {
  var ast,
    subject;

  it('should exist', function () {
    expect(typeof gradients.parse).to.equal('function');
  });

  describe('error cases', function() {
    it('one more comma in definitions', function() {
      expect(function() {
        gradients.parse('-webkit-linear-gradient(red, blue),');
      }).to.throwException(/One extra comma/);
    });

    it('one more comma in colors', function() {
      expect(function() {
        gradients.parse('-o-linear-gradient(red, blue,)');
      }).to.throwException(/Expected color definition/);
    });

    it('invalid input', function() {
      expect(function() {
        gradients.parse('linear-gradient(red, blue) aaa');
      }).to.throwException(/Invalid input not EOF/);
    });

    it('missing open call', function() {
      expect(function() {
        gradients.parse('linear-gradient red, blue');
      }).to.throwException(/Missing \(/);
    });

    it('missing comma before color stops', function() {
      expect(function() {
        gradients.parse('linear-gradient(to right red, blue)');
      }).to.throwException(/Missing comma before color stops/);
    });

    it('missing color stops', function() {
      expect(function() {
        gradients.parse('linear-gradient(to right, )');
      }).to.throwException(/Expected color definition/);
    });

    it('missing closing call', function() {
      expect(function() {
        gradients.parse('linear-gradient(to right, red, blue aaa');
      }).to.throwException(/Missing \)/);
    });
  });

  describe('when parsing a simple definition', function() {
    beforeEach(function() {
      ast = gradients.parse('linear-gradient(red, blue)');
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

  describe('parse all metric values', function() {
    [
      'px',
      'em',
      '%'
    ].forEach(function(metric) {
      describe('parse color stop for metric '+ metric, function() {
        beforeEach(function() {
          ast = gradients.parse('linear-gradient(blue 10.3' + metric + ', transparent)');
          subject = ast[0];
        });

        describe('the first color', function() {
          beforeEach(function() {
            subject = subject.colorStops[0];
          });

          it('should have the length', function() {
            expect(subject.length.type).to.equal(metric);
            expect(subject.length.value).to.equal('10.3');
          });
        });
      });
    });
  });

  describe('parse all linear directional', function() {
    [
      {type: 'angular', unparsedValue: '-145deg', value: '-145'},
      {type: 'directional', unparsedValue: 'to left top', value: 'left top'}
    ].forEach(function(orientation) {
      describe('parse orientation ' + orientation.type, function() {
        beforeEach(function() {
          ast = gradients.parse('linear-gradient(' + orientation.unparsedValue + ', blue, green)');
          subject = ast[0].orientation;
        });

        it('should parse value', function() {
          expect(subject.type).to.equal(orientation.type);
          expect(subject.value).to.equal(orientation.value);
        });
      });
    });
  });

  describe('parse all color types', function() {
    [
      {type: 'literal', unparsedValue: 'red', value: 'red'},
      {type: 'hex', unparsedValue: '#c2c2c2', value: 'c2c2c2'},
      {type: 'rgb', unparsedValue: 'rgb(243, 226, 195)', value: ['243', '226', '195']},
      {type: 'rgba', unparsedValue: 'rgba(243, 226, 195)', value: ['243', '226', '195']}
    ].forEach(function(color) {
      describe('parse color type '+ color.type, function() {
        beforeEach(function() {
            ast = gradients.parse('linear-gradient(12deg, ' + color.unparsedValue + ', blue, green)');
            subject = ast[0].colorStops[0];
          });

          it('should parse value', function() {
            expect(subject.type).to.equal(color.type);
            expect(subject.value).to.eql(color.value);
          });
      });
    });
  });

  describe('parse linear gradients', function() {
    [
      'linear-gradient',
      'radial-gradient',
      'repeating-linear-gradient',
      'repeating-radial-gradient'
    ].forEach(function(gradient) {
      describe('parse ' + gradient + ' gradient', function() {
        beforeEach(function() {
          ast = gradients.parse(gradient + '(red, blue)');
          subject = ast[0];
        });

        it('should parse the gradient', function() {
          expect(subject.type).to.equal(gradient);
        });
      });
    });
  });

  describe('different radial declarations', function() {
    [
      'ellipse farthest-corner',
      'ellipse cover',
      'circle cover',
      'center bottom, ellipse cover',
      'circle at 87.23px -58.3px',
      'farthest-side, red, blue',
      'farthest-corner, red, blue',
      'farthest-corner at 87.23px -58.3px, red, blue'
    ].forEach(function(declaration) {

      it('should parse ' + declaration + ' declaration', function() {
        ast = gradients.parse('radial-gradient(' + declaration + ', red, blue)');
      });

    });
  });

});
