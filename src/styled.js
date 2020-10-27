import {
  getCompJsName,
  treeToCompArr,
  psdColorToHex,
  isSafeArea,
  hasBgImg,
  hasText,
  hasBoldFont,
  SAFE_HEIGHT,
  getRealFontSize
} from './utils';

export default function renderStyled(
  tr,
  options = {
    imgPathPrefix: '',
    useAutoBgMacro: false,
    vwBase: 750,
    doc: {
      width: 0,
      height: 0
    }
  }
) {
  const compArr = treeToCompArr(tr, options.doc);
  const hasSafeArea = compArr.find(item => isSafeArea(item));
  return (
    `
    import styled from 'styled-components/macro';
    import vw from 'rpf/un/vw';
    ${options.useAutoBgMacro ? `import autobg from 'autobg.macro';` : ''}
  `.trim() +
    '\n\n' +
    compArr
      .filter(item => {
        return !isSafeArea(item);
      })
      .map(item => {
        return `
    export const ${getCompJsName(item)} = styled.div\`
      position: absolute;
      top: \${vw(${item.top})};
      left: \${vw(${item.left})};
      ${
        options.useAutoBgMacro && hasBgImg(item)
          ? ''
          : `
          width: \${vw(${item.width})};
          height: \${vw(${item.height})};`
      }
      ${
        hasBgImg(item)
          ? options.useAutoBgMacro
            ? `\${autobg('${options.imgPathPrefix}${item.name}')}`
            : `
            background-size: 100%;
            background-repeat: no-repeat;
            background-image: url('\${require('${options.imgPathPrefix}${item.name}')}');`
          : ''
      }
      ${
        hasText(item)
          ? `
          color: #${psdColorToHex(item.text.font.colors[0])};
          font-size: \${vw(${getRealFontSize(item)})};
          ${hasBoldFont(item) ? `font-weight: bold;` : ''}
          white-space: nowrap;
          line-height: 1;`
          : ''
      }
    \`;
    `;
      })
      .concat(
        hasSafeArea
          ? `
          export const PageWrap = styled.div\`
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          \`;
          export const SafeArea = styled.div\`
            position: relative;
            width: 100%;
            height: \${vw(${SAFE_HEIGHT})};

            @media (min-aspect-ratio: ${options.doc.width} / ${SAFE_HEIGHT}) {
              height: 100%;
            }
          \`;
          `
          : ''
      )
      .join('\n')
      .replace(/^\s*\n/gm, '')
  );
}
