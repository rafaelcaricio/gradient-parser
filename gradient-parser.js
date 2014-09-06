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
    ],
    metrics: [
      'px'
    ]
  };

  var tokens = {
    linearGradient: /^linear\-gradient/i,
    radialGradient: /^radial\-gradient/i,
    sideOrCorner: /^to (left (top|bottom)|right (top|bottom)|left|right|top|bottom)/i,
    pixelValue: /^([0-9]+)px/,
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
    var ast = matchListDefinitions();

    if (input.length > 0) {
      error('Invalid input not EOF');
    }

    return ast;
  }

  function matchListDefinitions() {
    var definitions = [],
      currentDefinition = matchDefinition();

    if (currentDefinition) {
      definitions.push(currentDefinition);
      while (scan(tokens.comma)) {
        currentDefinition = matchDefinition();
        if (currentDefinition) {
          definitions.push(currentDefinition);
        } else {
          error('One extra comma');
        }
      }
    }

    return definitions;
  }

  function matchDefinition() {
    return matchGradient(
            'linear-gradient',
            tokens.linearGradient,
            matchOrientation);
  }

  function matchGradient(gradientType, token, orientationMatcher) {
    var captures = scan(token),
      orientation,
      colorStops;

    if (captures) {
      if (!scan(tokens.startCall)) {
        error('Missing (');
      }

      orientation = orientationMatcher();
      if (orientation) {
        if (!scan(tokens.comma)) {
          error('Missing comma before color stops');
        }
      }

      colorStops = matchColorStops();
      if (!colorStops.length) {
        error('Missing color definitions');
      }

      if (!scan(tokens.endCall)) {
        error('Missing )');
      }

      return {
        type: gradientType,
        orientation: orientation,
        colorStops: colorStops
      };
    }
  }

  function matchOrientation() {
    return matchSideOrCorner();
  }

  function matchSideOrCorner() {
    var captures = scan(tokens.sideOrCorner);
    if (captures) {
      return {
        type: 'directional',
        value: captures[1].toLowerCase()
      };
    }
  }

  function matchColorStops() {
    var color = matchColorStop(),
      colors = [];

    if (color) {
      colors.push(color);
      while (scan(tokens.comma)) {
        color = matchColorStop();
        if (color) {
          colors.push(color);
        } else {
          error('One extra comma');
        }
      }
    }

    return colors;
  }

  function matchColorStop() {
    var color = matchColor();

    if (!color) {
      error('Expected color definition');
    }

    color.length = matchLength();
    return color;
  }

  function matchColor() {
    return matchLiteralColor();
  }

  function matchLiteralColor() {
    var literalColors = /^([a-zA-Z]+)/,
      captures = scan(literalColors);

    if (captures) {
      return {
        type: 'literal',
        value: captures[0].toLowerCase()
      };
    }
  }

  function matchLength() {
    return matchPixel();
  }

  function matchPixel() {
    var captures = scan(tokens.pixelValue);
    if (captures) {
      return {
        type: 'px',
        value: captures[1]
      };
    }
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
