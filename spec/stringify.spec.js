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

  });

});
