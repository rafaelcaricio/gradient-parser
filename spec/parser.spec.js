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
      {type: 'angular', unparsedValue: '1rad', value: '1'},
      {type: 'directional', unparsedValue: 'to left top', value: 'left top'},
      {type: 'directional', unparsedValue: 'to top left', value: 'top left'},
      {type: 'directional', unparsedValue: 'to top right', value: 'top right'},
      {type: 'directional', unparsedValue: 'to bottom left', value: 'bottom left'},
      {type: 'directional', unparsedValue: 'to bottom right', value: 'bottom right'}
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
      {type: 'rgba', unparsedValue: 'rgba(243, 226, 195)', value: ['243', '226', '195']},
      {type: 'var', unparsedValue: 'var(--color-red)', value: '--color-red'},
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
    
    it('should parse ellipse with dimensions and position', function() {
      const gradient = 'repeating-radial-gradient(ellipse 40px 134px at 50% 96%, rgb(0, 165, 223) 0%, rgb(62, 20, 123) 6.6%)';
      const ast = gradients.parse(gradient);
      
      expect(ast[0].type).to.equal('repeating-radial-gradient');
      expect(ast[0].orientation[0].type).to.equal('shape');
      expect(ast[0].orientation[0].value).to.equal('ellipse');
      
      // Check the style (size dimensions)
      expect(ast[0].orientation[0].style.type).to.equal('position');
      expect(ast[0].orientation[0].style.value.x.type).to.equal('px');
      expect(ast[0].orientation[0].style.value.x.value).to.equal('40');
      expect(ast[0].orientation[0].style.value.y.type).to.equal('px');
      expect(ast[0].orientation[0].style.value.y.value).to.equal('134');
      
      // Check the position
      expect(ast[0].orientation[0].at.type).to.equal('position');
      expect(ast[0].orientation[0].at.value.x.type).to.equal('%');
      expect(ast[0].orientation[0].at.value.x.value).to.equal('50');
      expect(ast[0].orientation[0].at.value.y.type).to.equal('%');
      expect(ast[0].orientation[0].at.value.y.value).to.equal('96');
      
      // Check the color stops
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].type).to.equal('rgb');
      expect(ast[0].colorStops[0].value).to.eql(['0', '165', '223']);
      expect(ast[0].colorStops[0].length.type).to.equal('%');
      expect(ast[0].colorStops[0].length.value).to.equal('0');
      
      expect(ast[0].colorStops[1].type).to.equal('rgb');
      expect(ast[0].colorStops[1].value).to.eql(['62', '20', '123']);
      expect(ast[0].colorStops[1].length.type).to.equal('%');
      expect(ast[0].colorStops[1].length.value).to.equal('6.6');
    });
    
    it('should parse full Pride flag gradient', function() {
      const gradient = 'repeating-radial-gradient(ellipse 40px 134px at 50% 96%,rgb(0, 165, 223) 0%,rgb(62, 20, 123) 6.6%,rgb(226, 0, 121) 13.2%,rgb(223, 19, 44) 18.8%,rgb(243, 239, 21) 24.1%,rgb(0, 152, 71) 33.3%)';
      const ast = gradients.parse(gradient);
      
      expect(ast[0].type).to.equal('repeating-radial-gradient');
      expect(ast[0].orientation[0].type).to.equal('shape');
      expect(ast[0].orientation[0].value).to.equal('ellipse');
      
      // Check dimensions and position
      expect(ast[0].orientation[0].style.type).to.equal('position');
      expect(ast[0].orientation[0].at.type).to.equal('position');
      
      // Verify all color stops are present (Pride flag colors)
      expect(ast[0].colorStops).to.have.length(6);
      
      // Check the first and last color stops
      expect(ast[0].colorStops[0].type).to.equal('rgb');
      expect(ast[0].colorStops[0].value).to.eql(['0', '165', '223']);
      
      expect(ast[0].colorStops[5].type).to.equal('rgb');
      expect(ast[0].colorStops[5].value).to.eql(['0', '152', '71']);
      expect(ast[0].colorStops[5].length.type).to.equal('%');
      expect(ast[0].colorStops[5].length.value).to.equal('33.3');
    });
  });

  describe('parse gradient strings with trailing semicolons', function() {
    it('should parse linear-gradient with trailing semicolon', function() {
      const inputWithSemicolon = 'linear-gradient(red, blue);';
      const ast = gradients.parse(inputWithSemicolon);
      expect(ast[0].type).to.equal('linear-gradient');
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].value).to.equal('red');
      expect(ast[0].colorStops[1].value).to.equal('blue');
    });

    it('should parse radial-gradient with trailing semicolon', function() {
      const inputWithSemicolon = 'radial-gradient(circle, red, blue);';
      const ast = gradients.parse(inputWithSemicolon);
      expect(ast[0].type).to.equal('radial-gradient');
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].value).to.equal('red');
      expect(ast[0].colorStops[1].value).to.equal('blue');
    });

    it('should parse complex gradient with trailing semicolon', function() {
      const inputWithSemicolon = 'linear-gradient(to right, rgb(22, 234, 174) 0%, rgb(126, 32, 207) 100%);';
      const ast = gradients.parse(inputWithSemicolon);
      expect(ast[0].type).to.equal('linear-gradient');
      expect(ast[0].orientation.type).to.equal('directional');
      expect(ast[0].orientation.value).to.equal('right');
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].type).to.equal('rgb');
      expect(ast[0].colorStops[0].length.type).to.equal('%');
      expect(ast[0].colorStops[0].length.value).to.equal('0');
      expect(ast[0].colorStops[1].type).to.equal('rgb');
      expect(ast[0].colorStops[1].length.type).to.equal('%');
      expect(ast[0].colorStops[1].length.value).to.equal('100');
    });
  });

  describe('parse gradient strings', function() {
    it('should parse repeating linear gradient with bottom right direction', function() {
      const gradient = 'repeating-linear-gradient(to bottom right,rgb(254, 158, 150) 0%,rgb(172, 79, 115) 100%)';
      const ast = gradients.parse(gradient);
      
      expect(ast[0].type).to.equal('repeating-linear-gradient');
      expect(ast[0].orientation.type).to.equal('directional');
      expect(ast[0].orientation.value).to.equal('bottom right');
      
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].type).to.equal('rgb');
      expect(ast[0].colorStops[0].value).to.eql(['254', '158', '150']);
      expect(ast[0].colorStops[0].length.type).to.equal('%');
      expect(ast[0].colorStops[0].length.value).to.equal('0');
      
      expect(ast[0].colorStops[1].type).to.equal('rgb');
      expect(ast[0].colorStops[1].value).to.eql(['172', '79', '115']);
      expect(ast[0].colorStops[1].length.type).to.equal('%');
      expect(ast[0].colorStops[1].length.value).to.equal('100');
    });
  });

});
