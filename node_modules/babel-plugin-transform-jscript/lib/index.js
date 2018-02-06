"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      FunctionExpression: {
        exit: function exit(path) {
          var node = path.node;

          if (!node.id) return;
          node._ignoreUserWhitespace = true;

          path.replaceWith(t.callExpression(t.functionExpression(null, [], t.blockStatement([t.toStatement(node), t.returnStatement(node.id)])), []));
        }
      }
    }
  };
};

module.exports = exports["default"];