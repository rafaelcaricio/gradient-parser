'use strict';

var expect = require('expect.js');
var gradients = require('../build/node');

function pprint(ast) {
  console.log(JSON.stringify(ast, true, 2));
}

describe('lib/stringify.js', function () {
  var subject;

  it('should exist', function () {
    expect(typeof gradients.stringify).to.equal('function');
  });

  describe('serialization', function() {

    it('if tree is null', function() {
      expect(gradients.stringify(null)).to.equal('');
    });

    it('should serialize a simple gradient', function() {
      var gradientDef = 'linear-gradient(black, white)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    it('should serialize gradient with hex', function() {
      var gradientDef = 'linear-gradient(#fff, white)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    it('should serialize gradient with rgb', function() {
      var gradientDef = 'linear-gradient(rgb(1, 2, 3), white)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    it('should serialize gradient with rgba', function() {
      var gradientDef = 'linear-gradient(rgba(1, 2, 3, .0), white)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    it('should serialize gradient with deg', function() {
      var gradientDef = 'linear-gradient(45deg, #fff, transparent)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    it('should serialize gradient with directional', function() {
      var gradientDef = 'linear-gradient(to left, #fff, transparent)';
      expect(gradients.stringify(gradients.parse(gradientDef))).to.equal(gradientDef);
    });

    describe('all metric values', function() {
      [
        'px',
        'em',
        '%'
      ].forEach(function(metric) {
        var expectedResult;

        describe('stringify color stop for metric '+ metric, function() {
          beforeEach(function() {
            expectedResult = 'linear-gradient(blue 10.3' + metric + ', transparent)';
            var ast = gradients.parse(expectedResult);
            subject = gradients.stringify(ast);
          });

          it('should result as expected', function() {
            expect(subject).to.equal(expectedResult);
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
        'farthest-corner, red, blue',
        'farthest-corner at 87.23px -58.3px, red, blue'
      ].forEach(function(declaration) {

        it('should parse ' + declaration + ' declaration', function() {
          var expectedResult = 'radial-gradient(' + declaration + ', red, blue)';
          var ast = gradients.parse(expectedResult);
          subject = gradients.stringify(ast);

          expect(subject).to.equal(expectedResult);
        });

      });
    });

  });

});
