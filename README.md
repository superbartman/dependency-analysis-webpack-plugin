# Usage

A webpack plugin for find useless files

## Start

```js
npm install dependency-analysis-webpack-plugin --save-dev
yarn add -D dependency-analysis-webpack-plugin
pnpm add -D dependency-analysis-webpack-plugin
```

## Use

```js
const { DependencyAnalysisWebpackPlugin } = require('dependency-analysis-webpack-plugin');

module.exports = {
  plugins: [
    new DependencyAnalysisWebpackPlugin(),
  ],
};
```

## Options

```typescript
entry?: string; // default src
include?: string[]; // default []
exclude?: string[]; // default []
isDelete?: boolean; // default false
```

## Reference

[reference](https://s1.zhuanstatic.com/common/u/article-dependencyAnalysisPlugin.js)

## Bug

[issue](https://github.com/TypeStrong/ts-loader/issues/783)
