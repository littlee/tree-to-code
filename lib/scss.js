"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderSCSS;

var _utils = require("./utils");

function renderSCSS(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    imgPathPrefix: '',
    prependVwFn: false,
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
  return (options.prependVwFn ? "@function vw($x, $vpw: ".concat(options.vwBase, ") {\n      @return ($x / $vpw * 100) * 1vw;\n    }\n\n") : '') + compArr.filter(function (item) {
    return !(0, _utils.isSafeArea)(item);
  }).map(function (item) {
    return ".".concat((0, _utils.getCompClassName)(item), " {\n      position: absolute;\n      top: vw(").concat(item.top, ");\n      left: vw(").concat(item.left, ");\n      ").concat(options.usePostcssAutoBg && (0, _utils.hasBgImg)(item) ? '' : "\n          width: vw(".concat(item.width, ");\n          height: vw(").concat(item.height, ");"), "\n      ").concat((0, _utils.hasBgImg)(item) ? "\n          ".concat(!options.usePostcssAutoBg ? "\n              background-size: 100%;\n              background-repeat: no-repeat;" : '', "\n          background-image: url('").concat(options.imgPathPrefix).concat(item.name, "');") : '', "\n      ").concat((0, _utils.hasText)(item) ? "\n          color: #".concat((0, _utils.psdColorToHex)(item.text.font.colors[0]), ";\n          font-size: vw(").concat((0, _utils.getRealFontSize)(item), ");\n          ").concat((0, _utils.hasBoldFont)(item) ? "font-weight: bold;" : '', "\n          white-space: nowrap;\n          line-height: 1;") : '', "\n    }");
  }).concat(hasSafeArea ? "\n          .page-wrap {\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            top: 0;\n            left: 0;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n          }\n          .safe-area {\n            position: relative;\n            width: 100%;\n            height: vw(".concat(_utils.SAFE_HEIGHT, ");\n          }\n          @media (min-aspect-ratio: ").concat(options.doc.width, " / ").concat(_utils.SAFE_HEIGHT, ") {\n            .safe-area {\n              height: 100%;\n            }\n          }\n          ") : '').join('\n').replace(/^\s*\n/gm, '');
}