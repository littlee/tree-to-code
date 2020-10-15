import {
  getCompClassName,
  getSpanStyle,
  renderTextNode,
  vw,
  tryCall,
  walkTreeNode
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

export default function renderHtml(tr, options = {}) {
  const { code, hasSafeArea } = walkTreeNode(tr, undefined, options, {
    onNode: ({ isCont, renderComp, children }) => {
      return `<div ${
        isCont ? `data-cont="true"` : ''
      } class="${getCompClassName(renderComp)}">
      ${children}</div>`;
    },
    onEmpty: () => ``,
    onSafeArea: ({ children }) => {
      return `<div class="safe-area">${children}</div>`;
    },
    onTextNode: ({ item }) => {
      return renderTextNode(item.text, options, {
        render: ({ value, index }) => {
          return `<span ${getSpanInlineStyle(
            item.text,
            index,
            options
          )}>${value.trim().replace(/\r/g, '<br/>')}</span>`;
        }
      });
    }
  });
  return hasSafeArea ? `<div class="page-wrap">${code}</div>` : code;
}
