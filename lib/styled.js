"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = renderStyled;

var _utils = require("./utils");

function renderStyled(tr) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    imgPathPrefix: '',
    useAutoBgMacro: false,
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
  return "\n    import styled from 'styled-components/macro';\n    import vw from 'rpf/un/vw';\n    ".concat(options.useAutoBgMacro ? "import autobg from 'autobg.macro';" : '', "\n  ").trim() + '\n\n' + compArr.filter(function (item) {
    return !(0, _utils.isSafeArea)(item);
  }).map(function (item) {
    return "\n    export const ".concat((0, _utils.getCompJsName)(item), " = styled.div`\n      position: absolute;\n      top: ${vw(").concat(item.top, ")};\n      left: ${vw(").concat(item.left, ")};\n      ").concat(options.useAutoBgMacro && (0, _utils.hasBgImg)(item) ? '' : "\n          width: ${vw(".concat(item.width, ")};\n          height: ${vw(").concat(item.height, ")};"), "\n      ").concat((0, _utils.hasBgImg)(item) ? options.useAutoBgMacro ? "${autobg('".concat(options.imgPathPrefix).concat(item.name, "')}") : "\n            background-size: 100%;\n            background-repeat: no-repeat;\n            background-image: url('${require('".concat(options.imgPathPrefix).concat(item.name, "')}');") : '', "\n      ").concat((0, _utils.hasText)(item) ? "\n          color: #".concat((0, _utils.psdColorToHex)(item.text.font.colors[0]), ";\n          font-size: ${vw(").concat((0, _utils.getRealFontSize)(item), ")};\n          ").concat((0, _utils.hasBoldFont)(item) ? "font-weight: bold;" : '', "\n          white-space: nowrap;\n          line-height: 1;") : '', "\n    `;\n    ");
  }).concat(hasSafeArea ? "\n          export const PageWrap = styled.div`\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            top: 0;\n            left: 0;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n          `;\n          export const SafeArea = styled.div`\n            position: relative;\n            width: 100%;\n            height: ${vw(".concat(_utils.SAFE_HEIGHT, ")};\n\n            @media (min-aspect-ratio: ").concat(options.doc.width, " / ").concat(_utils.SAFE_HEIGHT, ") {\n              height: 100%;\n            }\n          `;\n          ") : '').join('\n').replace(/^\s*\n/gm, '');
}