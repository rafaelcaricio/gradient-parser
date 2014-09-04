'use strict';

var expect = require('expect.js');
var GradientParser = require('gradient-parser');

describe('gradient-parser.js', function () {
  it('should exist', function () {
    expect(typeof GradientParser).to.equal('function');
  });

  describe('when parsing a simple definition', function(){
    var ast;

    beforeEach(function() {
      var parser = new GradientParser();
      ast = parser.parse('linar-gradient(to right, transparent 10px, blue)');
    });

    it('should get the gradient type', function () {
      expect(ast[0].type).to.equal('linear-gradient');
    });

  });
});
