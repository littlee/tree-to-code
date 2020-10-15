"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderWXSS;

var _utils = require("./utils");

function renderWXSS(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    doc: {
      width: 0,
      height: 0
    }
  };
  var compArr = (0, _utils.treeToCompArr)(tr, options.doc);
  var hasSafeArea = compArr.find(function (item) {
    return (0, _utils.isSafeArea)(item);
  });
  return "\n    .inline-text {\n      display: inline-block;\n    }\n    .view-bg-img {\n      position: absolute;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n    }\n    " + compArr.filter(function (item) {
    return !(0, _utils.isSafeArea)(item);
  }).map(function (item) {
    return ".".concat((0, _utils.getCompClassName)(item), " {\n      position: absolute;\n      top: ").concat(item.top, "rpx;\n      left: ").concat(item.left, "rpx;\n      width: ").concat(item.width, "rpx;\n      height: ").concat(item.height, "rpx;\n      \n      ").concat((0, _utils.hasText)(item) ? "\n          color: #".concat((0, _utils.psdColorToHex)(item.text.font.colors[0]), ";\n          font-size: ").concat((0, _utils.getRealFontSize)(item), "rpx;\n          ").concat((0, _utils.hasBoldFont)(item) ? "font-weight: bold;" : '', "\n          white-space: nowrap;\n          line-height: 1;") : '', "\n    }");
  }).concat(hasSafeArea ? "\n        .page-wrap {\n          position: absolute;\n          width: 100%;\n          height: 100%;\n          top: 0;\n          left: 0;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n        .safe-area {\n          position: relative;\n          width: 100%;\n          height: ".concat(_utils.SAFE_HEIGHT, "rpx;\n        }\n        @media (min-aspect-ratio: ").concat(options.doc.width, " / ").concat(_utils.SAFE_HEIGHT, ") {\n          .safe-area {\n            height: 100%;\n          }\n        }\n        ") : '').join('\n').replace(/^\s*\n/gm, '');
}