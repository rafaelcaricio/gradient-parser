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
    percentageValue: /^([0-9]+)\%/,
    emValue: /^([0-9]+)em/,
    angleValue: /^([0-9]+)deg/,
    startCall: /^\(/,
    endCall: /^\)/,
    comma: /^,/,
    hexColor: /^\#([0-9a-fA-F]+)/,
    literalColor: /^([a-zA-Z]+)/,
    rgbColor: /^rgb/i,
    rgbaColor: /^rgba/i,
    number: /^(([0-9]*\.[0-9]+)|([0-9]+\.?))/
  };

  var input = '';

  function error(msg) {
    var err = new Error(input + ': ' + msg);
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
    return matchListing(matchDefinition);
  }

  function matchDefinition() {
    return matchGradient(
            'linear-gradient',
            tokens.linearGradient,
            matchOrientation);
  }

  function matchGradient(gradientType, pattern, orientationMatcher) {
    return matchCall(pattern, function(captures) {
      orientation = orientationMatcher();
      if (orientation) {
        if (!scan(tokens.comma)) {
          error('Missing comma before color stops');
        }
      }

      colorStops = matchListing(matchColorStop);
      return {
        type: gradientType,
        orientation: orientation,
        colorStops: colorStops
      };
    });
  }

  function matchCall(pattern, callback) {
    var captures = scan(pattern),
      orientation,
      colorStops;

    if (captures) {
      if (!scan(tokens.startCall)) {
        error('Missing (');
      }

      result = callback(captures);

      if (!scan(tokens.endCall)) {
        error('Missing )');
      }

      return result;
    }
  }

  function matchOrientation() {
    return matchSideOrCorner() ||
      matchAngle();
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

  function matchAngle() {
    var captures = scan(tokens.angleValue);
    if (captures) {
      return {
        type: 'angle',
        value: captures[1]
      };
    }
  }

  function matchListing(matcher) {
    var captures = matcher(),
      result = [];

    if (captures) {
      result.push(captures);
      while (scan(tokens.comma)) {
        captures = matcher();
        if (captures) {
          result.push(captures);
        } else {
          error('One extra comma');
        }
      }
    }

    return result;
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
    return matchHexColor() ||
      matchRGBAColor() ||
      matchRGBColor() ||
      matchLiteralColor();
  }

  function matchLiteralColor() {
    var captures = scan(tokens.literalColor);

    if (captures) {
      return {
        type: 'literal',
        value: captures[0].toLowerCase()
      };
    }
  }

  function matchHexColor() {
    var captures = scan(tokens.hexColor);

    if (captures) {
      return {
        type: 'hex',
        value: captures[1]
      };
    }
  }

  function matchRGBColor() {
    return matchCall(tokens.rgbColor, function() {
      return  {
        type: 'rgb',
        value: matchListing(matchNumber)
      };
    });
  }

  function matchRGBAColor() {
    return matchCall(tokens.rgbaColor, function() {
      return  {
        type: 'rgba',
        value: matchListing(matchNumber)
      };
    });
  }

  function matchNumber() {
    return scan(tokens.number)[1];
  }

  function matchLength() {
    return matchMetric(tokens.pixelValue, 'px') ||
      matchMetric(tokens.percentageValue, '%') ||
      matchMetric(tokens.emValue, 'em');
  }

  function matchMetric(pattern, metric) {
    var captures = scan(pattern);
    if (captures) {
      return {
        type: metric,
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
    input = input.substr(size);
  }

  return function(code) {
    input = code.toString();
    return getAST();
  };
})();
