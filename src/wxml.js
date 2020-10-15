import {
  getCompClassName,
  getSpanStyle,
  vw,
  tryCall,
  walkTreeNode,
  hasBgImg,
  renderTextNode
} from './utils';

function getSpanInlineStyle(text, index, options) {
  const keyNameMap = {
    fontSize: 'font-size'
  };
  const valueNameMap = {
    fontSize: value => {
      return vw(value, options.vwBase);
    }
  };
  const spanStyle = getSpanStyle(text, index, options);
  const styles = spanStyle.map(item => {
    return `${keyNameMap[item.key] || item.key}: ${
      tryCall(valueNameMap[item.key], item.value) || item.value
    };`;
  });

  if (styles.length) {
    return ` style="${styles.join('')}" `;
  }
  return '';
}

export default function renderWxml(tr, options = {}) {
  const { code, hasSafeArea } = walkTreeNode(tr, undefined, options, {
    onNode: ({ isCont, renderComp, children }) => {
      return `<view ${
        isCont ? `data-cont="true"` : ''
      } class="${getCompClassName(renderComp)}">
      ${
        hasBgImg(renderComp)
          ? `<image class="view-bg-img" src="${options.imgPathPrefix}${renderComp.name}"></image>`
          : ''
      }${children}</view>`;
    },
    onEmpty: () => ``,
    onSafeArea: ({ children }) => {
      return `<view class="safe-area">${children}</view>`;
    },
    onTextNode: ({ item }) => {
      return renderTextNode(item.text, options, {
        render: ({ value, index }) => {
          return `<view class="inline-text" ${getSpanInlineStyle(
            item.text,
            index,
            options
          )}>${value.replace(/\r/g, '\n')}</view>`;
        }
      });
    }
  });
  return hasSafeArea ? `<view class="page-wrap">${code}</view>` : code;
}
