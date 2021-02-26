export const libraryName = 'my-ghp-lib';

import * as math from './math';

export default {
  libraryName,
  math,
};

export * as math from './math';
