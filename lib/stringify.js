// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var GradientParser = (GradientParser || {});

GradientParser.stringify = (function() {

  var visitor = {

    'visit_linear-gradient': function(node) {
      return visitor.visit_gradient(node);
    },

    'visit_repeating-linear-gradient': function(node) {
      return visitor.visit_gradient(node);
    },

    'visit_radial-gradient': function(node) {
      return visitor.visit_gradient(node);
    },

    'visit_repeating-radial-gradient': function(node) {
      return visitor.visit_gradient(node);
    },

    'visit_gradient': function(node) {
      var orientation = visitor.visit(node.orientation);
      if (orientation) {
        orientation += ', ';
      }

      return node.type + '(' + orientation + visitor.visit(node.colorStops) + ')';
    },

    'visit_shape': function(node) {
      var result = node.value,
          at = visitor.visit(node.at),
          style = visitor.visit(node.style);

      if (style) {
        result += ' ' + style;
      }

      if (at) {
        result += ' at ' + at;
      }

      return result;
    },

    'visit_default-radial': function(node) {
      var result = '',
          at = visitor.visit(node.at);

      if (at) {
        result += at;
      }
      return result;
    },

    'visit_extent-keyword': function(node) {
      var result = node.value,
          at = visitor.visit(node.at);

      if (at) {
        result += ' at ' + at;
      }

      return result;
    },

    'visit_position-keyword': function(node) {
      return node.value;
    },

    'visit_position': function(node) {
      return visitor.visit(node.value.x) + ' ' + visitor.visit(node.value.y);
    },

    'visit_%': function(node) {
      return node.value + '%';
    },

    'visit_em': function(node) {
      return node.value + 'em';
    },

    'visit_px': function(node) {
      return node.value + 'px';
    },

    'visit_literal': function(node) {
      return visitor.visit_color(node.value, node);
    },

    'visit_hex': function(node) {
      return visitor.visit_color('#' + node.value, node);
    },

    'visit_rgb': function(node) {
      return visitor.visit_color('rgb(' + node.value.join(', ') + ')', node);
    },

    'visit_rgba': function(node) {
      return visitor.visit_color('rgba(' + node.value.join(', ') + ')', node);
    },

    'visit_color': function(resultColor, node) {
      var result = resultColor,
          length = visitor.visit(node.length);

      if (length) {
        result += ' ' + length;
      }
      return result;
    },

    'visit_angular': function(node) {
      return node.value + 'deg';
    },

    'visit_directional': function(node) {
      return 'to ' + node.value;
    },

    'visit_array': function(elements) {
      var result = '',
          size = elements.length;

      elements.forEach(function(element, i) {
        result += visitor.visit(element);
        if (i < size - 1) {
          result += ', ';
        }
      });

      return result;
    },

    'visit': function(element) {
      if (!element) {
        return '';
      }
      var result = '';

      if (element instanceof Array) {
        return visitor.visit_array(element, result);
      } else if (element.type) {
        var nodeVisitor = visitor['visit_' + element.type];
        if (nodeVisitor) {
          return nodeVisitor(element);
        } else {
          throw Error('Missing visitor visit_' + element.type);
        }
      } else {
        throw Error('Invalid node.');
      }
    }

  };

  return function(root) {
    return visitor.visit(root);
  };
})();
