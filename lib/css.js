"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderCSS;

var _utils = require("./utils");

function renderCSS(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    imgPathPrefix: '',
    usePostcssAutoBg: false,
    vwBase: 750,
    doc: {
      width: 0,
      height: 0
    }
  };
  var compArr = (0, _utils.treeToCompArr)(tr, options.doc);
  var hasSafeArea = compArr.find(function (item) {
    return (0, _utils.isSafeArea)(item);
  });
  return compArr.filter(function (item) {
    return !(0, _utils.isSafeArea)(item);
  }).map(function (item) {
    return ".".concat((0, _utils.getCompClassName)(item), " {\n      position: absolute;\n      top: ").concat((0, _utils.vw)(item.top), ";\n      left: ").concat((0, _utils.vw)(item.left), ";\n      ").concat(options.usePostcssAutoBg && (0, _utils.hasBgImg)(item) ? '' : "\n          width: ".concat((0, _utils.vw)(item.width), ";\n          height: ").concat((0, _utils.vw)(item.height), ";"), "\n      ").concat((0, _utils.hasBgImg)(item) ? "\n          ".concat(!options.usePostcssAutoBg ? "\n              background-size: 100%;\n              background-repeat: no-repeat;" : '', "\n          background-image: url('").concat(options.imgPathPrefix).concat(item.name, "');") : '', "\n      ").concat((0, _utils.hasText)(item) ? "\n          color: #".concat((0, _utils.psdColorToHex)(item.text.font.colors[0]), ";\n          font-size: ").concat((0, _utils.vw)((0, _utils.getRealFontSize)(item)), ";\n          ").concat((0, _utils.hasBoldFont)(item) ? "font-weight: bold;" : '', "\n          white-space: nowrap;\n          line-height: 1;") : '', "\n    }");
  }).concat(hasSafeArea ? "\n        .page-wrap {\n          position: absolute;\n          width: 100%;\n          height: 100%;\n          top: 0;\n          left: 0;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n        }\n        .safe-area {\n          position: relative;\n          width: 100%;\n          height: ".concat((0, _utils.vw)(_utils.SAFE_HEIGHT), ";\n        }\n        @media (min-aspect-ratio: ").concat(options.doc.width, " / ").concat(_utils.SAFE_HEIGHT, ") {\n          .safe-area {\n            height: 100%;\n          }\n        }\n        ") : '').join('\n').replace(/^\s*\n/gm, '');
}