import {
  getCompClassName,
  psdColorToHex,
  treeToCompArr,
  hasBgImg,
  hasText,
  hasBoldFont,
  isSafeArea,
  SAFE_HEIGHT,
  getRealFontSize
} from './utils';

export default function renderSCSS(
  tr,
  options = {
    imgPathPrefix: '',
    prependVwFn: false,
    usePostcssAutoBg: false,
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
    (options.prependVwFn
      ? `@function vw($x, $vpw: ${options.vwBase}) {
      @return ($x / $vpw * 100) * 1vw;
    }\n\n`
      : '') +
    compArr
      .filter(item => {
        return !isSafeArea(item);
      })
      .map(item => {
        return `.${getCompClassName(item)} {
      position: absolute;
      top: vw(${item.top});
      left: vw(${item.left});
      ${
        options.usePostcssAutoBg && hasBgImg(item)
          ? ''
          : `
          width: vw(${item.width});
          height: vw(${item.height});`
      }
      ${
        hasBgImg(item)
          ? `
          ${
            !options.usePostcssAutoBg
              ? `
              background-size: 100%;
              background-repeat: no-repeat;`
              : ''
          }
          background-image: url('${options.imgPathPrefix}${item.name}');`
          : ''
      }
      ${
        hasText(item)
          ? `
          color: #${psdColorToHex(item.text.font.colors[0])};
          font-size: vw(${getRealFontSize(item)});
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
            height: vw(${SAFE_HEIGHT});
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
