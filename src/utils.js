export function isContainer(item) {
  return /_\$c$/i.test(item.name);
}

export const SAFE_HEIGHT = 1206;

export function isSafeArea(item) {
  return /_\$safe$/i.test(item.name);
}

export function isTextNode(item) {
  return /_\$t$/.test(item.name);
}

export function getLastChild(item) {
  return item.children && item.children[item.children.length - 1];
}

export function isRenderNode(item) {
  return (
    item.visible && (isEndNode(item) || /_\$(c|t|b|safe)$/i.test(item.name))
  );
}

export function isEndNode(item) {
  return /\.(png|jpg)$/i.test(item.name) || /_\$t$/i.test(item.name);
}

export function psdColorToHex(color) {
  return color
    .slice(0, 3)
    .map(i => {
      const val = i.toString(16);
      return val.length < 2 ? `0${val}` : val;
    })
    .join('');
}

export function getCompClassName(item) {
  return item.name
    .replace(/\.(png|jpg)$/i, '')
    .replace(/_\$(c|t|b)$/, '')
    .replace(/_/g, '-');
}

export function getCompJsName(item) {
  const name = getCompClassName(item).replace(/-[\d\w]/g, str => {
    return str.slice(1).toUpperCase();
  });
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function maxDigit(num, digit = 6) {
  return Number(num.toFixed(digit));
}
export function vw(px, base = 750, unit = true) {
  return maxDigit((Math.round(px) / base) * 100) + (unit ? 'vw' : '');
}

export function hasBgImg(item) {
  return /\.(png|jpg)$/i.test(item.name) || /_\$c$/i.test(item.name);
}

export function hasText(item) {
  return item.text;
}

export function hasBoldFont(item) {
  return (
    hasText(item) && item.text.font.names.some(f => /(bold|heavy)/i.test(f))
  );
}

export function calcLeft(item, parent) {
  if (item.left < 0) {
    return item.left - parent.left - item.left;
  }
  return item.left - parent.left;
}

export function calcTop(item, parent) {
  if (item.top < 0) {
    return item.top - parent.top - item.top;
  }
  return item.top - parent.top;
}

export function calcWidth(item, docWidth) {
  let itemWidth = item.width;
  if (item.left < 0) {
    itemWidth = item.width + item.left;
  } else if (item.left + item.width > docWidth) {
    itemWidth = item.width - (item.left + item.width - docWidth);
  }
  return Math.min(docWidth, itemWidth);
}

export function calcHeight(item, docHeight) {
  let itemHeight = item.height;
  if (item.top < 0) {
    itemHeight = item.height + item.top;
  } else if (item.top + item.height > docHeight) {
    itemHeight = item.height - (item.top + item.height - docHeight);
  }
  return Math.min(docHeight, itemHeight);
}

export function treeToCompArr(tr, doc) {
  let compArr = [];
  function walkTree(
    tr,
    parent = {
      isCont: false,
      top: 0,
      left: 0,
      diffTop: 0,
      diffLeft: 0
    }
  ) {
    if (tr.children) {
      tr.children
        .slice()
        .reverse()
        .forEach((item, index, arr) => {
          if (!isRenderNode(item) || (parent.isCont && index === 0)) {
            return;
          }
          const isCont = isContainer(item);
          const renderComp = isCont ? getLastChild(item) : item;
          const { top, left } = renderComp;

          const cTop = calcTop(renderComp, parent);
          const cLeft = calcLeft(renderComp, parent);

          const cWidth = calcWidth(renderComp, doc.width);
          const cHeight = calcHeight(renderComp, doc.height);

          compArr.push({
            ...renderComp,
            top: cTop - parent.diffTop,
            left: cLeft - parent.diffLeft,
            width: cWidth,
            height: cHeight
          });

          if (!isEndNode(item)) {
            walkTree(item, {
              isCont,
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

export function walkTreeNode(
  tr,
  parent = { isCont: false },
  options = {},
  { onNode, onEmpty, onSafeArea, onTextNode }
) {
  let hasSafeArea = false;
  function walk(tr, parent, options) {
    return tr.children
      ? tr.children
          .slice()
          .reverse()
          .map((item, index) => {
            if (!isRenderNode(item) || (parent.isCont && index === 0)) {
              return onEmpty();
            }

            const isCont = isContainer(item);
            const renderComp = isCont ? getLastChild(item) : item;

            let children = null;
            if (isEndNode(item)) {
              if (isTextNode(item)) {
                item.text.font = getFixedFont(item.text);
                children = onTextNode({ item });
              } else {
                children = onEmpty();
              }
            } else {
              children = walk(item, { isCont }, options);
            }

            if (isSafeArea(item)) {
              hasSafeArea = true;
              return onSafeArea({ children });
            }

            return onNode({ isCont, renderComp, children });
          })
          .join('\n')
      : '';
  }
  const codeStr = walk(tr, parent, options);
  return {
    code: codeStr.replace(/^\s*\n/gm, ''),
    hasSafeArea
  };
}

export function getSpanStyle(text, index, options) {
  const firstFont = {
    size: text.font.sizes[0],
    color: text.font.colors[0]
  };
  const currFont = {
    size: text.font.sizes[index],
    color: text.font.colors[index]
  };
  const isDiffFontSize = firstFont.size !== currFont.size;
  const isDiffColor = firstFont.color.join(',') !== currFont.color.join(',');

  let styles = [];
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
      value: `#${psdColorToHex(currFont.color)}`
    });
  }
  return styles;
}

export function renderTextNode(text, options, { render }) {
  if (!text.font) {
    return '';
  }
  // const fixedFont = getFixedFont(text);
  let cur = 0;
  return text.font.lengthArray
    .reduce((acc, item, index) => {
      acc.push(
        render({
          value: text.value.slice(cur, cur + item),
          index
        })
      );

      cur += item;
      return acc;
    }, [])
    .join('\n');
}

export function tryCall(fn, ...args) {
  if (typeof fn === 'function') {
    return fn(...args);
  }
  return void 0;
}

export function getRealFontSize(item) {
  return Math.round(item.text.font.sizes[0] * item.text.transform.xx);
}

export function getFixedFont(text) {
  // console.log('getFixedFont');
  if (!text) {
    return {};
  }

  const compKeys = [
    'styles',
    'weights',
    'sizes',
    'colors',
    'textDecoration',
    'leading'
  ];

  function canMergeFont(prev, curr) {
    return compKeys.every(k => {
      return (
        prev[k] != null && curr[k] != null && `${prev[k]}` === `${curr[k]}`
      );
    });
  }

  function getFontItem(font, index) {
    return compKeys.reduce((acc, k) => {
      acc[k] = font[k][index];
      return acc;
    }, {});
  }

  const nextFont = text.font.lengthArray.reduce(
    (acc, item, index) => {
      const prevItem = index > 0 ? getFontItem(text.font, index - 1) : {};
      const currItem = getFontItem(text.font, index);
      if (canMergeFont(prevItem, currItem)) {
        acc.lengthArray[index - 1] += text.font.lengthArray[index];
      } else {
        acc.lengthArray.push(text.font.lengthArray[index]);
        compKeys.forEach(k => {
          acc[k].push(text.font[k][index]);
        });
      }

      return acc;
    },
    {
      lengthArray: [],
      styles: [],
      weights: [],
      sizes: [],
      colors: [],
      textDecoration: [],
      leading: []
    }
  );
  return {
    ...text.font,
    ...nextFont
  };
}
