import {
  getCompClassName,
  getCompJsName,
  treeToCompArr,
  renderTextNode,
  getSpanStyle,
  tryCall,
  walkTreeNode,
  isSafeArea
} from './utils';

const importTypeMap = {
  styled: (tr, options) => {
    const compArr = treeToCompArr(tr, options.doc);
    const hasSafeArea = compArr.find(item => isSafeArea(item));
    const importCompNames = compArr
      .filter(item => !isSafeArea(item))
      .map(item => getCompJsName(item))
      .concat(hasSafeArea ? ['PageWrap', 'SafeArea'] : []);
    return `
    import { ${importCompNames.join(',')}  } from './Styles';
    import vw from 'rpf/un/vw';
    `.trim();
  },
  module: () => {
    return `
    import $s from './index.module.css';
    import vw from 'rpf/un/vw';
    `.trim();
  },
  html: () => {
    return `
    import './index.css';
    import vw from 'rpf/un/vw';
    `.trim();
  }
};

function getSpanInlineStyle(text, index, options) {
  const valueNameMap = {
    fontSize: value => {
      return `vw(${value})`;
    }
  };
  const spanStyle = getSpanStyle(text, index, options);
  const styles = spanStyle.map(item => {
    return `${item.key}: ${
      tryCall(valueNameMap[item.key], item.value) || `'${item.value}'`
    }`;
  });
  if (styles.length) {
    return ` style={{${styles.join(',')}}} `;
  }
  return '';
}

const getOnTextNodeFn = options => {
  return ({ item }) => {
    return renderTextNode(item.text, options, {
      render: ({ value, index }) => {
        return `<span ${getSpanInlineStyle(
          item.text,
          index,
          options
        )}>${value.replace(/\r/g, '<br />')}</span>`;
      }
    });
  };
};

const returnTypeMap = {
  styled: (tr, options) => {
    const { code, hasSafeArea } = walkTreeNode(tr, undefined, options, {
      onNode: ({ isCont, renderComp, children }) => {
        const compJsName = getCompJsName(renderComp);
        return `<${compJsName} ${isCont ? `data-cont="true"` : ''}>
        ${children}</${compJsName}>`;
      },
      onEmpty: () => ``,
      onSafeArea: ({ children }) => {
        return `<SafeArea>${children}</SafeArea>`;
      },
      onTextNode: getOnTextNodeFn(options)
    });
    return hasSafeArea ? `<PageWrap>${code}</PageWrap>` : `<>${code}</>`;
  },
  module: (tr, options) => {
    const { code, hasSafeArea } = walkTreeNode(tr, undefined, options, {
      onNode: ({ isCont, renderComp, children }) => {
        return `<div ${
          isCont ? `data-cont="true"` : ''
        } className={$s['${getCompClassName(renderComp)}']}>
        ${children}</div>`;
      },
      onEmpty: () => ``,
      onSafeArea: ({ children }) => {
        return `<div className={$s['safe-area']}>${children}</div>`;
      },
      onTextNode: getOnTextNodeFn(options)
    });
    return hasSafeArea
      ? `<div className={$s['page-wrap']}>${code}</div>`
      : `<>${code}</>`;
  },
  html: (tr, options) => {
    const { code, hasSafeArea } = walkTreeNode(tr, undefined, options, {
      onNode: ({ isCont, renderComp, children }) => {
        return `<div ${
          isCont ? `data-cont="true"` : ''
        } className="${getCompClassName(renderComp)}">
        ${children}</div>`;
      },
      onEmpty: () => ``,
      onSafeArea: ({ children }) => {
        return `<div className="safe-area">${children}</div>`;
      },
      onTextNode: getOnTextNodeFn(options)
    });
    return hasSafeArea
      ? `<div className="page-wrap">${code}</div>`
      : `<>${code}</>`;
  }
};

export default function renderJSX(
  tr,
  options = {
    reactType: 'styled', // 'module', 'html'
    vwBase: 750,
    doc: {
      width: 0,
      height: 0
    }
  }
) {
  return `
  import React from 'react';
  ${importTypeMap[options.reactType](tr, options)}

  export default props => {
    return (
      ${returnTypeMap[options.reactType](tr, options)}
    )
  };
  `;
}
