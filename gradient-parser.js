// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

module.exports = (function() {

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

  var input = '',
    cursor = 0;

  function error(msg) {
    var err = new Error(input + ':' + cursor + ': ' + msg);
    err.position = cursor;
    err.message = msg;
    err.source = input;
    throw err;
  }

  function getAST() {
    var ast = listDefinitions();

    if (input.length > 0) {
      error(input, cursor, 'Invalid input not EOF');
    }

    return ast;
  };

  function listDefinitions() {
    var definitions = [],
      currentDefinition = definition();

    if (currentDefinition) {
      definitions.push(currentDefinition);
      while (scan(tokens.comma)) {
        currentDefinition = definition();
        if (currentDefinition) {
          definitions.push(currentDefinition);
        } else {
          // throw error
        }
      }
    }

    return definitions;
  }

  function definition() {
    return linearGradient();
  }

  function linearGradient() {
    var captures = scan(tokens.linearGradient),
      orientation,
      colorStops;


    if (captures) {
      scan(tokens.startCall);
      orientation = matchOrientation();
      scan(tokens.comma);
      colorStops = matchColorStops();
      scan(tokens.endCall);

      return {
        type: 'linear-gradient',
        orientation: orientation,
        colorStops: colorStops
      };
    }
  }

  function matchOrientation() {
    return sideOrCorner();
  }

  function sideOrCorner() {
    var captures = scan(tokens.sideOrCorner);
    if (captures) {
      return {
        type: 'directional',
        value: captures[1].toLowerCase()
      };
    }
  }

  function matchColorStops() {
    var literalColors = /^([a-zA-Z]+)/,
      captures = scan(literalColors),
      colors = [];

    if (captures) {
      colors.push(captures[0].toLowerCase());
      while (scan(tokens.comma)) {
        captures = scan(literalColors);
        if (captures) {
          colors.push(captures[0].toLowerCase());
        } else {
          // trow error
        }
      }
    }

    return colors;
  }

  function scan(regexp) {
    var captures,
        blankCaptures;

    blankCaptures = /^[\n\r\t\s]+/.exec(input);
    if (blankCaptures) {
        consume(blankCaptures[0].length);
    }

    captures = regexp.exec(input);
    if (captures) {
        consume(captures[0].length);
    }

    return captures;
  }

  function consume(size) {
    cursor += size;
    input = input.substr(size);
  }

  return function(code) {
    input = code.toString();
    return getAST();
  };
})();
