"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderJSX;

var _utils = require("./utils");

var importTypeMap = {
  styled: function styled(tr, options) {
    var compArr = (0, _utils.treeToCompArr)(tr, options.doc);
    var hasSafeArea = compArr.find(function (item) {
      return (0, _utils.isSafeArea)(item);
    });
    var importCompNames = compArr.filter(function (item) {
      return !(0, _utils.isSafeArea)(item);
    }).map(function (item) {
      return (0, _utils.getCompJsName)(item);
    }).concat(hasSafeArea ? ['PageWrap', 'SafeArea'] : []);
    return "\n    import { ".concat(importCompNames.join(','), "  } from './Styles';\n    import vw from 'rpf/un/vw';\n    ").trim();
  },
  module: function module() {
    return "\n    import $s from './index.module.css';\n    import vw from 'rpf/un/vw';\n    ".trim();
  },
  html: function html() {
    return "\n    import './index.css';\n    import vw from 'rpf/un/vw';\n    ".trim();
  }
};

function getSpanInlineStyle(text, index, options) {
  var valueNameMap = {
    fontSize: function fontSize(value) {
      return "vw(".concat(value, ")");
    }
  };
  var spanStyle = (0, _utils.getSpanStyle)(text, index, options);
  var styles = spanStyle.map(function (item) {
    return "".concat(item.key, ": ").concat((0, _utils.tryCall)(valueNameMap[item.key], item.value) || "'".concat(item.value, "'"));
  });

  if (styles.length) {
    return " style={{".concat(styles.join(','), "}} ");
  }

  return '';
}

var getOnTextNodeFn = function getOnTextNodeFn(options) {
  return function (_ref) {
    var item = _ref.item;
    return (0, _utils.renderTextNode)(item.text, options, {
      render: function render(_ref2) {
        var value = _ref2.value,
            index = _ref2.index;
        return "<span ".concat(getSpanInlineStyle(item.text, index, options), ">").concat(value.replace(/\r/g, '<br />'), "</span>");
      }
    });
  };
};

var returnTypeMap = {
  styled: function styled(tr, options) {
    var _walkTreeNode = (0, _utils.walkTreeNode)(tr, undefined, options, {
      onNode: function onNode(_ref3) {
        var isCont = _ref3.isCont,
            renderComp = _ref3.renderComp,
            children = _ref3.children;
        var compJsName = (0, _utils.getCompJsName)(renderComp);
        return "<".concat(compJsName, " ").concat(isCont ? "data-cont=\"true\"" : '', ">\n        ").concat(children, "</").concat(compJsName, ">");
      },
      onEmpty: function onEmpty() {
        return "";
      },
      onSafeArea: function onSafeArea(_ref4) {
        var children = _ref4.children;
        return "<SafeArea>".concat(children, "</SafeArea>");
      },
      onTextNode: getOnTextNodeFn(options)
    }),
        code = _walkTreeNode.code,
        hasSafeArea = _walkTreeNode.hasSafeArea;

    return hasSafeArea ? "<PageWrap>".concat(code, "</PageWrap>") : "<>".concat(code, "</>");
  },
  module: function module(tr, options) {
    var _walkTreeNode2 = (0, _utils.walkTreeNode)(tr, undefined, options, {
      onNode: function onNode(_ref5) {
        var isCont = _ref5.isCont,
            renderComp = _ref5.renderComp,
            children = _ref5.children;
        return "<div ".concat(isCont ? "data-cont=\"true\"" : '', " className={$s['").concat((0, _utils.getCompClassName)(renderComp), "']}>\n        ").concat(children, "</div>");
      },
      onEmpty: function onEmpty() {
        return "";
      },
      onSafeArea: function onSafeArea(_ref6) {
        var children = _ref6.children;
        return "<div className={$s['safe-area']}>".concat(children, "</div>");
      },
      onTextNode: getOnTextNodeFn(options)
    }),
        code = _walkTreeNode2.code,
        hasSafeArea = _walkTreeNode2.hasSafeArea;

    return hasSafeArea ? "<div className={$s['page-wrap']}>".concat(code, "</div>") : "<>".concat(code, "</>");
  },
  html: function html(tr, options) {
    var _walkTreeNode3 = (0, _utils.walkTreeNode)(tr, undefined, options, {
      onNode: function onNode(_ref7) {
        var isCont = _ref7.isCont,
            renderComp = _ref7.renderComp,
            children = _ref7.children;
        return "<div ".concat(isCont ? "data-cont=\"true\"" : '', " className=\"").concat((0, _utils.getCompClassName)(renderComp), "\">\n        ").concat(children, "</div>");
      },
      onEmpty: function onEmpty() {
        return "";
      },
      onSafeArea: function onSafeArea(_ref8) {
        var children = _ref8.children;
        return "<div className=\"safe-area\">".concat(children, "</div>");
      },
      onTextNode: getOnTextNodeFn(options)
    }),
        code = _walkTreeNode3.code,
        hasSafeArea = _walkTreeNode3.hasSafeArea;

    return hasSafeArea ? "<div className=\"page-wrap\">".concat(code, "</div>") : "<>".concat(code, "</>");
  }
};

function renderJSX(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    reactType: 'styled',
    // 'module', 'html'
    vwBase: 750,
    doc: {
      width: 0,
      height: 0
    }
  };
  return "\n  import React from 'react';\n  ".concat(importTypeMap[options.reactType](tr, options), "\n\n  export default props => {\n    return (\n      ").concat(returnTypeMap[options.reactType](tr, options), "\n    )\n  };\n  ");
}