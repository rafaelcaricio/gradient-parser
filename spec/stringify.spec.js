'use strict';

var expect = require('expect.js');
var gradients = require('build/node');

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

  });

});
