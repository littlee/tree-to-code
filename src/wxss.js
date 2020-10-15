import {
  getCompClassName,
  psdColorToHex,
  treeToCompArr,
  hasText,
  hasBoldFont,
  isSafeArea,
  SAFE_HEIGHT,
  getRealFontSize
} from './utils';
export default function renderWXSS(
  tr,
  options = {
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
    .inline-text {
      display: inline-block;
    }
    .view-bg-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    ` +
    compArr
      .filter(item => {
        return !isSafeArea(item);
      })
      .map(item => {
        return `.${getCompClassName(item)} {
      position: absolute;
      top: ${item.top}rpx;
      left: ${item.left}rpx;
      width: ${item.width}rpx;
      height: ${item.height}rpx;
      
      ${
        hasText(item)
          ? `
          color: #${psdColorToHex(item.text.font.colors[0])};
          font-size: ${getRealFontSize(item)}rpx;
          ${hasBoldFont(item) ? `font-weight: bold;` : ''}
          white-space: nowrap;
          line-height: 1;`
          : ''
      }
    }`;
      })
      .concat(
        hasSafeArea
          ? `
        .page-wrap {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .safe-area {
          position: relative;
          width: 100%;
          height: ${SAFE_HEIGHT}rpx;
        }
        @media (min-aspect-ratio: ${options.doc.width} / ${SAFE_HEIGHT}) {
          .safe-area {
            height: 100%;
          }
        }
        `
          : ''
      )
      .join('\n')
      .replace(/^\s*\n/gm, '')
  );
}
