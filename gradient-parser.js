// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var GradientParser = module.exports = (function() {

  var types = {
    gradients: [
      'linear-gradient',
      'radial-gradient',
      'repeating-radial-gradient'
    ],
    colors: [
      'hex',
      'rgb',
      'rgba',
      'hsl',
      'literal'
    ]
  };

  var tokens = {
    linearGradient: /^linear\-gradient/i,
    sideOrCorner: /^to (left (top|bottom)|right (top|bottom)|left|right|top|bottom)/i,
    startCall: /^\(/,
    endCall: /^\)/,
    comma: /^,/
  };

  function Constructor(input) {
    this.input = input;
    this.cursor = 0;
  }

  var def = Constructor.prototype;

  def.parse = function(input) {
    if (input) {
      this.input = input;
    }
    return this.listDefinitions();
  };

  def.listDefinitions = function() {
    var definitions = [],
      definition = this.definition();

    if (definition) {
      definitions.push(definition);
      while (this.scan(tokens.comma)) {
        definition = this.definition();
        if (definition) {
          definitions.push(definition);
        } else {
          // throw error
        }
      }
    }

    return definitions;
  };

  def.definition = function() {
    return this.linearGradient();
  };

  def.linearGradient = function() {
    var captures = this.scan(tokens.linearGradient),
      orientation,
      colorStops;


    if (captures) {
      this.scan(tokens.startCall);
      orientation = this.orientation();
      this.scan(tokens.comma);
      colorStops = this.colorStops();
      this.scan(tokens.endCall);

      return {
        type: 'linear-gradient',
        orientation: orientation,
        colorStops: colorStops
      };
    }
  };

  def.orientation = function() {
    return this.sideOrCorner();
  };

  def.sideOrCorner = function() {
    var captures = this.scan(tokens.sideOrCorner);
    if (captures) {
      return {
        type: 'directional',
        value: captures[1].toLowerCase()
      };
    }
  };

  def.colorStops = function() {
    var literalColors = /^([a-zA-Z]+)/,
      captures = this.scan(literalColors),
      colors = [];

    if (captures) {
      colors.push(captures[0].toLowerCase());
      while (this.scan(tokens.comma)) {
        captures = this.scan(literalColors);
        if (captures) {
          colors.push(captures[0].toLowerCase());
        } else {
          // trow error
        }
      }
    }

    return colors;
  };

  def.scan = function(regexp) {
    var captures,
        blankCaptures;

    blankCaptures = /^[\n\r\t\s]+/.exec(this.input);
    if (blankCaptures) {
        this.consume(blankCaptures[0].length);
    }

    captures = regexp.exec(this.input);
    if (captures) {
        this.consume(captures[0].length);
    }

    return captures;
  };

  def.consume = function(size) {
    this.cursor += size;
    this.input = this.input.substr(size);
  };

  return Constructor;
})();
