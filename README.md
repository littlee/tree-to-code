# tree-to-code

generate code from a `psd.js` tree

## Usage

```js
const css = require('tree-to-code/lib/css').default;
const html = require('tree-to-code/lib/html').default;
const jsx = require('tree-to-code/lib/jsx').default;
const scss = require('tree-to-code/lib/scss').default;
const styled = require('tree-to-code/lib/styled').default;
const wxml = require('tree-to-code/lib/wxml').default;
const wxss = require('tree-to-code/lib/wxss').default;
const PSD = require('psd.js');

const treeExp = PSD.fromFile('./path/to/file.psd').parse().tree().export();

const options = {
  imgPathPrefix: 'assets/',
  usePostcssAutoBg: true,
  useAutoBgMacro: true,
  prependVwFn: false,
  reactType: 'styled',
  vwBase: doc.width,
  doc: {
    width: doc.width,
    height: doc.height
  }
};

const cssCode = css(treeExp, options);
const htmlCode = html(treeExp, options);
console.log(cssCode, htmlCode);
/* ... */
```
