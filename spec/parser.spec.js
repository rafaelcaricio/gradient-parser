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
    
    it('should correctly parse directional value without "to" keyword (legacy syntax)', function() {
      // This uses the legacy syntax without "to" keyword (e.g., "right" instead of "to right")
      const parsed = gradients.parse('-webkit-linear-gradient(right, rgb(248, 6, 234) 71%, rgb(202, 74, 208) 78%)');
      subject = parsed[0];
      
      // It should properly identify the orientation as directional "right"
      expect(subject.orientation).to.be.an('object');
      expect(subject.orientation.type).to.equal('directional');
      expect(subject.orientation.value).to.equal('right');
      
      // And it should have only 2 color stops
      expect(subject.colorStops).to.have.length(2);
      expect(subject.colorStops[0].type).to.equal('rgb');
      expect(subject.colorStops[0].value).to.eql(['248', '6', '234']);
      expect(subject.colorStops[0].length.type).to.equal('%');
      expect(subject.colorStops[0].length.value).to.equal('71');
      
      expect(subject.colorStops[1].type).to.equal('rgb');
      expect(subject.colorStops[1].value).to.eql(['202', '74', '208']);
      expect(subject.colorStops[1].length.type).to.equal('%');
      expect(subject.colorStops[1].length.value).to.equal('78');
    });
  });

  describe('parse all color types', function() {
    [
      {type: 'literal', unparsedValue: 'red', value: 'red'},
      {type: 'hex', unparsedValue: '#c2c2c2', value: 'c2c2c2'},
      {type: 'rgb', unparsedValue: 'rgb(243, 226, 195)', value: ['243', '226', '195']},
      {type: 'rgba', unparsedValue: 'rgba(243, 226, 195)', value: ['243', '226', '195']},
      {type: 'hsl', unparsedValue: 'hsl(120, 60%, 70%)', value: ['120', '60', '70']},
      {type: 'hsla', unparsedValue: 'hsla(120, 60%, 70%, 0.3)', value: ['120', '60', '70', '0.3']},
      {type: 'hsla', unparsedValue: 'hsla(240, 100%, 50%, 0.5)', value: ['240', '100', '50', '0.5']},
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

    describe('error cases for HSL/HSLA', function() {
      it('should error on missing percentage for saturation', function() {
        expect(function() {
          gradients.parse('linear-gradient(hsl(120, 60, 70%))');
        }).to.throwException(/Expected percentage value/);
      });

      it('should error on missing percentage for lightness', function() {
        expect(function() {
          gradients.parse('linear-gradient(hsl(120, 60%, 70))');
        }).to.throwException(/Expected percentage value/);
      });

      it('should error on percentage for hue', function() {
        expect(function() {
          gradients.parse('linear-gradient(hsl(120%, 60%, 70%))');
        }).to.throwException(/HSL hue value must be a number in degrees \(0-360\) or normalized \(-360 to 360\), not a percentage/);
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

    it('should parse radial-gradient with position only (no shape/extent)', function() {
      const gradient = 'radial-gradient(at 57% 50%, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)';
      const ast = gradients.parse(gradient);
      
      expect(ast[0].type).to.equal('radial-gradient');
      
      // Verify the orientation (position only)
      expect(ast[0].orientation[0].type).to.equal('default-radial');
      expect(ast[0].orientation[0].at.type).to.equal('position');
      expect(ast[0].orientation[0].at.value.x.type).to.equal('%');
      expect(ast[0].orientation[0].at.value.x.value).to.equal('57');
      expect(ast[0].orientation[0].at.value.y.type).to.equal('%');
      expect(ast[0].orientation[0].at.value.y.value).to.equal('50');
      
      // Verify color stops
      expect(ast[0].colorStops).to.have.length(2);
      expect(ast[0].colorStops[0].type).to.equal('rgb');
      expect(ast[0].colorStops[0].value).to.eql(['102', '126', '234']);
      expect(ast[0].colorStops[0].length.type).to.equal('%');
      expect(ast[0].colorStops[0].length.value).to.equal('0');
      
      expect(ast[0].colorStops[1].type).to.equal('rgb');
      expect(ast[0].colorStops[1].value).to.eql(['118', '75', '162']);
      expect(ast[0].colorStops[1].length.type).to.equal('%');
      expect(ast[0].colorStops[1].length.value).to.equal('100');
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

    describe('parse different color formats', function() {
      const testGradients = [
        'linear-gradient(red, blue)',
        'linear-gradient(red, #00f)',
        'linear-gradient(red, #0000ff)',
        'linear-gradient(red, rgb(0, 0, 255))',
        'linear-gradient(red, rgba(0, 0, 255, 1))',
        'linear-gradient(red, hsl(240, 50%, 100%))',
        'linear-gradient(red, hsla(240, 50%, 100%, 1))'
      ];

      testGradients.forEach(function(gradient) {
        it('should parse ' + gradient, function() {
          const result = gradients.parse(gradient);
          expect(result[0].type).to.equal('linear-gradient');
          expect(result[0].colorStops).to.have.length(2);
          expect(result[0].colorStops[0].type).to.equal('literal');
          expect(result[0].colorStops[0].value).to.equal('red');
        });
      });
    });

    describe('parse calc expressions', function() {
      it('should parse linear gradient with calc in color stop position', function() {
        const gradient = 'linear-gradient(to right, red calc(10% + 20px), blue 50%)';
        const ast = gradients.parse(gradient);
        
        expect(ast[0].type).to.equal('linear-gradient');
        expect(ast[0].orientation.type).to.equal('directional');
        expect(ast[0].orientation.value).to.equal('right');
        
        expect(ast[0].colorStops).to.have.length(2);
        expect(ast[0].colorStops[0].type).to.equal('literal');
        expect(ast[0].colorStops[0].value).to.equal('red');
        expect(ast[0].colorStops[0].length.type).to.equal('calc');
        expect(ast[0].colorStops[0].length.value).to.equal('10% + 20px');
        
        expect(ast[0].colorStops[1].type).to.equal('literal');
        expect(ast[0].colorStops[1].value).to.equal('blue');
        expect(ast[0].colorStops[1].length.type).to.equal('%');
        expect(ast[0].colorStops[1].length.value).to.equal('50');
      });

      it('should parse radial gradient with calc in position', function() {
        const gradient = 'radial-gradient(circle at calc(50% + 25px) 50%, red, blue)';
        const ast = gradients.parse(gradient);
        
        expect(ast[0].type).to.equal('radial-gradient');
        expect(ast[0].orientation[0].type).to.equal('shape');
        expect(ast[0].orientation[0].value).to.equal('circle');
        
        // Check the position
        expect(ast[0].orientation[0].at.type).to.equal('position');
        expect(ast[0].orientation[0].at.value.x.type).to.equal('calc');
        expect(ast[0].orientation[0].at.value.x.value).to.equal('50% + 25px');
        expect(ast[0].orientation[0].at.value.y.type).to.equal('%');
        expect(ast[0].orientation[0].at.value.y.value).to.equal('50');
        
        // Check the color stops
        expect(ast[0].colorStops).to.have.length(2);
        expect(ast[0].colorStops[0].value).to.equal('red');
        expect(ast[0].colorStops[1].value).to.equal('blue');
      });

      it('should parse calc expressions with multiple operations', function() {
        const gradient = 'linear-gradient(90deg, yellow calc(100% - 50px), green calc(100% - 20px))';
        const ast = gradients.parse(gradient);
        
        expect(ast[0].type).to.equal('linear-gradient');
        expect(ast[0].orientation.type).to.equal('angular');
        expect(ast[0].orientation.value).to.equal('90');
        
        expect(ast[0].colorStops).to.have.length(2);
        expect(ast[0].colorStops[0].type).to.equal('literal');
        expect(ast[0].colorStops[0].value).to.equal('yellow');
        expect(ast[0].colorStops[0].length.type).to.equal('calc');
        expect(ast[0].colorStops[0].length.value).to.equal('100% - 50px');
        
        expect(ast[0].colorStops[1].type).to.equal('literal');
        expect(ast[0].colorStops[1].value).to.equal('green');
        expect(ast[0].colorStops[1].length.type).to.equal('calc');
        expect(ast[0].colorStops[1].length.value).to.equal('100% - 20px');
      });
      
      it('should parse calc expressions with nested parentheses', function() {
        const gradient = 'linear-gradient(to bottom, red calc(50% + (25px * 2)), blue)';
        const ast = gradients.parse(gradient);
        
        expect(ast[0].type).to.equal('linear-gradient');
        expect(ast[0].orientation.type).to.equal('directional');
        expect(ast[0].orientation.value).to.equal('bottom');
        
        expect(ast[0].colorStops).to.have.length(2);
        expect(ast[0].colorStops[0].type).to.equal('literal');
        expect(ast[0].colorStops[0].value).to.equal('red');
        expect(ast[0].colorStops[0].length.type).to.equal('calc');
        expect(ast[0].colorStops[0].length.value).to.equal('50% + (25px * 2)');
      });
      
      it('should parse multiple calc expressions in the same gradient', function() {
        const gradient = 'radial-gradient(circle at calc(50% - 10px) calc(50% + 10px), red calc(20% + 10px), blue)';
        const ast = gradients.parse(gradient);
        
        expect(ast[0].type).to.equal('radial-gradient');
        expect(ast[0].orientation[0].type).to.equal('shape');
        expect(ast[0].orientation[0].value).to.equal('circle');
        
        // Check the position
        expect(ast[0].orientation[0].at.type).to.equal('position');
        expect(ast[0].orientation[0].at.value.x.type).to.equal('calc');
        expect(ast[0].orientation[0].at.value.x.value).to.equal('50% - 10px');
        expect(ast[0].orientation[0].at.value.y.type).to.equal('calc');
        expect(ast[0].orientation[0].at.value.y.value).to.equal('50% + 10px');
        
        // Check the color stops
        expect(ast[0].colorStops).to.have.length(2);
        expect(ast[0].colorStops[0].type).to.equal('literal');
        expect(ast[0].colorStops[0].value).to.equal('red');
        expect(ast[0].colorStops[0].length.type).to.equal('calc');
        expect(ast[0].colorStops[0].length.value).to.equal('20% + 10px');
      });

      it('should throw an error for unbalanced parentheses in calc expressions', function() {
        // Different test cases throw different errors, so we need to be more specific
        expect(function() {
          gradients.parse('linear-gradient(to right, red calc(50% + (25px), blue)');
        }).to.throwException();
        
        expect(function() {
          gradients.parse('radial-gradient(circle at calc(50% + 25px, red, blue)');
        }).to.throwException(/Missing comma before color stops/);
        
        expect(function() {
          gradients.parse('linear-gradient(90deg, yellow calc(100% - (50px - 20px), green)');
        }).to.throwException();
      });
    });
  });

});
