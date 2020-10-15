"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderHtml;

var _utils = require("./utils");

function getSpanInlineStyle(text, index, options) {
  var keyNameMap = {
    fontSize: 'font-size'
  };
  var valueNameMap = {
    fontSize: function fontSize(value) {
      return (0, _utils.vw)(value, options.vwBase);
    }
  };
  var spanStyle = (0, _utils.getSpanStyle)(text, index, options);
  var styles = spanStyle.map(function (item) {
    return "".concat(keyNameMap[item.key] || item.key, ": ").concat((0, _utils.tryCall)(valueNameMap[item.key], item.value) || item.value, ";");
  });

  if (styles.length) {
    return " style=\"".concat(styles.join(''), "\" ");
  }

  return '';
}

function renderHtml(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _walkTreeNode = (0, _utils.walkTreeNode)(tr, undefined, options, {
    onNode: function onNode(_ref) {
      var isCont = _ref.isCont,
          renderComp = _ref.renderComp,
          children = _ref.children;
      return "<div ".concat(isCont ? "data-cont=\"true\"" : '', " class=\"").concat((0, _utils.getCompClassName)(renderComp), "\">\n      ").concat(children, "</div>");
    },
    onEmpty: function onEmpty() {
      return "";
    },
    onSafeArea: function onSafeArea(_ref2) {
      var children = _ref2.children;
      return "<div class=\"safe-area\">".concat(children, "</div>");
    },
    onTextNode: function onTextNode(_ref3) {
      var item = _ref3.item;
      return (0, _utils.renderTextNode)(item.text, options, {
        render: function render(_ref4) {
          var value = _ref4.value,
              index = _ref4.index;
          return "<span ".concat(getSpanInlineStyle(item.text, index, options), ">").concat(value.trim().replace(/\r/g, '<br/>'), "</span>");
        }
      });
    }
  }),
      code = _walkTreeNode.code,
      hasSafeArea = _walkTreeNode.hasSafeArea;

  return hasSafeArea ? "<div class=\"page-wrap\">".concat(code, "</div>") : code;
}