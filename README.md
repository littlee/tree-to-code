# tree-to-code

generate code from a `psd.js` tree

## Usage

```js
const css = require('tree-to-code/lib/css');
const html = require('tree-to-code/lib/html');
const jsx = require('tree-to-code/lib/jsx');
const scss = require('tree-to-code/lib/scss');
const styled = require('tree-to-code/lib/styled');
const wxml = require('tree-to-code/lib/wxml');
const wxss = require('tree-to-code/lib/wxss');
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
