"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isContainer = isContainer;
exports.isSafeArea = isSafeArea;
exports.isTextNode = isTextNode;
exports.getLastChild = getLastChild;
exports.isRenderNode = isRenderNode;
exports.isEndNode = isEndNode;
exports.psdColorToHex = psdColorToHex;
exports.getCompClassName = getCompClassName;
exports.getCompJsName = getCompJsName;
exports.vw = vw;
exports.hasBgImg = hasBgImg;
exports.hasText = hasText;
exports.hasBoldFont = hasBoldFont;
exports.calcLeft = calcLeft;
exports.calcTop = calcTop;
exports.calcWidth = calcWidth;
exports.calcHeight = calcHeight;
exports.treeToCompArr = treeToCompArr;
exports.walkTreeNode = walkTreeNode;
exports.getSpanStyle = getSpanStyle;
exports.renderTextNode = renderTextNode;
exports.tryCall = tryCall;
exports.getRealFontSize = getRealFontSize;
exports.getFixedFont = getFixedFont;
exports.SAFE_HEIGHT = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isContainer(item) {
  return /_\$c$/i.test(item.name);
}

var SAFE_HEIGHT = 1206;
exports.SAFE_HEIGHT = SAFE_HEIGHT;

function isSafeArea(item) {
  return /_\$safe$/i.test(item.name);
}

function isTextNode(item) {
  return /_\$t$/.test(item.name);
}

function getLastChild(item) {
  return item.children && item.children[item.children.length - 1];
}

function isRenderNode(item) {
  return item.visible && (isEndNode(item) || /_\$(c|t|b|safe)$/i.test(item.name));
}

function isEndNode(item) {
  return /\.(png|jpg)$/i.test(item.name) || /_\$t$/i.test(item.name);
}

function psdColorToHex(color) {
  return color.slice(0, 3).map(function (i) {
    var val = i.toString(16);
    return val.length < 2 ? "0".concat(val) : val;
  }).join('');
}

function getCompClassName(item) {
  return item.name.replace(/\.(png|jpg)$/i, '').replace(/_\$(c|t|b)$/, '').replace(/_/g, '-');
}

function getCompJsName(item) {
  var name = getCompClassName(item).replace(/-[\d\w]/g, function (str) {
    return str.slice(1).toUpperCase();
  });
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function maxDigit(num) {
  var digit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;
  return Number(num.toFixed(digit));
}

function vw(px) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 750;
  var unit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return maxDigit(Math.round(px) / base * 100) + (unit ? 'vw' : '');
}

function hasBgImg(item) {
  return /\.(png|jpg)$/i.test(item.name) || /_\$c$/i.test(item.name);
}

function hasText(item) {
  return item.text;
}

function hasBoldFont(item) {
  return hasText(item) && item.text.font.names.some(function (f) {
    return /(bold|heavy)/i.test(f);
  });
}

function calcLeft(item, parent) {
  if (item.left < 0) {
    return item.left - parent.left - item.left;
  }

  return item.left - parent.left;
}

function calcTop(item, parent) {
  if (item.top < 0) {
    return item.top - parent.top - item.top;
  }

  return item.top - parent.top;
}

function calcWidth(item, docWidth) {
  var itemWidth = item.width;

  if (item.left < 0) {
    itemWidth = item.width + item.left;
  } else if (item.left + item.width > docWidth) {
    itemWidth = item.width - (item.left + item.width - docWidth);
  }

  return Math.min(docWidth, itemWidth);
}

function calcHeight(item, docHeight) {
  var itemHeight = item.height;

  if (item.top < 0) {
    itemHeight = item.height + item.top;
  } else if (item.top + item.height > docHeight) {
    itemHeight = item.height - (item.top + item.height - docHeight);
  }

  return Math.min(docHeight, itemHeight);
}

function treeToCompArr(tr, doc) {
  var compArr = [];

  function walkTree(tr) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      isCont: false,
      top: 0,
      left: 0,
      diffTop: 0,
      diffLeft: 0
    };

    if (tr.children) {
      tr.children.slice().reverse().forEach(function (item, index, arr) {
        if (!isRenderNode(item) || parent.isCont && index === 0) {
          return;
        }

        var isCont = isContainer(item);
        var renderComp = isCont ? getLastChild(item) : item;
        var top = renderComp.top,
            left = renderComp.left;
        var cTop = calcTop(renderComp, parent);
        var cLeft = calcLeft(renderComp, parent);
        var cWidth = calcWidth(renderComp, doc.width);
        var cHeight = calcHeight(renderComp, doc.height);
        compArr.push(_objectSpread(_objectSpread({}, renderComp), {}, {
          top: cTop - parent.diffTop,
          left: cLeft - parent.diffLeft,
          width: cWidth,
          height: cHeight
        }));

        if (!isEndNode(item)) {
          walkTree(item, {
            isCont: isCont,
            top: top,
            left: left,
            diffTop: cTop - (top - parent.top),
            diffLeft: cLeft - (left - parent.left)
          });
        }
      });
    }
  }

  walkTree(tr);
  return compArr;
}

function walkTreeNode(tr) {
  var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    isCont: false
  };
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var _ref = arguments.length > 3 ? arguments[3] : undefined,
      onNode = _ref.onNode,
      onEmpty = _ref.onEmpty,
      onSafeArea = _ref.onSafeArea,
      onTextNode = _ref.onTextNode;

  var hasSafeArea = false;

  function walk(tr, parent, options) {
    return tr.children ? tr.children.slice().reverse().map(function (item, index) {
      if (!isRenderNode(item) || parent.isCont && index === 0) {
        return onEmpty();
      }

      var isCont = isContainer(item);
      var renderComp = isCont ? getLastChild(item) : item;
      var children = null;

      if (isEndNode(item)) {
        if (isTextNode(item)) {
          item.text.font = getFixedFont(item.text);
          children = onTextNode({
            item: item
          });
        } else {
          children = onEmpty();
        }
      } else {
        children = walk(item, {
          isCont: isCont
        }, options);
      }

      if (isSafeArea(item)) {
        hasSafeArea = true;
        return onSafeArea({
          children: children
        });
      }

      return onNode({
        isCont: isCont,
        renderComp: renderComp,
        children: children
      });
    }).join('\n') : '';
  }

  var codeStr = walk(tr, parent, options);
  return {
    code: codeStr.replace(/^\s*\n/gm, ''),
    hasSafeArea: hasSafeArea
  };
}

function getSpanStyle(text, index, options) {
  var firstFont = {
    size: text.font.sizes[0],
    color: text.font.colors[0]
  };
  var currFont = {
    size: text.font.sizes[index],
    color: text.font.colors[index]
  };
  var isDiffFontSize = firstFont.size !== currFont.size;
  var isDiffColor = firstFont.color.join(',') !== currFont.color.join(',');
  var styles = [];

  if (isDiffFontSize) {
    styles.push({
      key: 'fontSize',
      value: Math.round(currFont.size * text.transform.xx),
      unit: 'px'
    });
  }

  if (isDiffColor) {
    styles.push({
      key: 'color',
      value: "#".concat(psdColorToHex(currFont.color))
    });
  }

  return styles;
}

function renderTextNode(text, options, _ref2) {
  var render = _ref2.render;

  if (!text.font) {
    return '';
  } // const fixedFont = getFixedFont(text);


  var cur = 0;
  return text.font.lengthArray.reduce(function (acc, item, index) {
    acc.push(render({
      value: text.value.slice(cur, cur + item),
      index: index
    }));
    cur += item;
    return acc;
  }, []).join('\n');
}

function tryCall(fn) {
  if (typeof fn === 'function') {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return fn.apply(void 0, args);
  }

  return void 0;
}

function getRealFontSize(item) {
  return Math.round(item.text.font.sizes[0] * item.text.transform.xx);
}

function getFixedFont(text) {
  // console.log('getFixedFont');
  if (!text) {
    return {};
  }

  var compKeys = ['styles', 'weights', 'sizes', 'colors', 'textDecoration', 'leading'];

  function canMergeFont(prev, curr) {
    return compKeys.every(function (k) {
      return prev[k] != null && curr[k] != null && "".concat(prev[k]) === "".concat(curr[k]);
    });
  }

  function getFontItem(font, index) {
    return compKeys.reduce(function (acc, k) {
      acc[k] = font[k][index];
      return acc;
    }, {});
  }

  var nextFont = text.font.lengthArray.reduce(function (acc, item, index) {
    var prevItem = index > 0 ? getFontItem(text.font, index - 1) : {};
    var currItem = getFontItem(text.font, index);

    if (canMergeFont(prevItem, currItem)) {
      acc.lengthArray[index - 1] += text.font.lengthArray[index];
    } else {
      acc.lengthArray.push(text.font.lengthArray[index]);
      compKeys.forEach(function (k) {
        acc[k].push(text.font[k][index]);
      });
    }

    return acc;
  }, {
    lengthArray: [],
    styles: [],
    weights: [],
    sizes: [],
    colors: [],
    textDecoration: [],
    leading: []
  });
  return _objectSpread(_objectSpread({}, text.font), nextFont);
}