/*
  https://rollupjs.org/
  https://devhints.io/rollup
*/

import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

import kebabCase from 'lodash.kebabcase';

//----------------------------------------------------------------------------//

import pkg from './package.json';

//----------------------------------------------------------------------------//

const defaultBuildConfig = {
  libraryName: 'MyLibrary',
  outputBrowserDir: 'dist-browser',
  outputDir: 'dist-pack',
  bundleDir: 'dist',
  declarationDir: 'types',
  bundleEntry: 'src/index.ts',
  browserEntry: 'src/index.ts',
  moduleEntries: [],
};

const {
  libraryName,
  outputBrowserDir,
  outputDir,
  bundleDir,
  declarationDir,
  bundleEntry,
  browserEntry = defaultBuildConfig.browserEntry,
  moduleEntries = [],
} = { ...defaultBuildConfig, ...(pkg.buildConfig || {}) };

const libraryFileName = kebabCase(libraryName);

const tsPluginConfig = {
  useTsconfigDeclarationDir: true,
  tsconfigOverride: {
    compilerOptions: {
      declaration: true,
      declarationDir: `${outputDir}/${declarationDir}`,
      sourceMap: true,
    },
  },
};

const rollupCommonPlugins = [
  resolve(),
  commonjs(),
  json(),
  typescript(tsPluginConfig),
];

const bundleConfig = {
  input: bundleEntry,
  output: [
    {
      file: `${outputDir}/${bundleDir}/esm.js`,
      format: 'esm',
    },
    {
      file: `${outputDir}/${bundleDir}/cjs.js`,
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: rollupCommonPlugins,
};

const browserConfig = {
  input: browserEntry,
  output: [
    {
      file: `${outputBrowserDir}/${libraryFileName}.js`,
      format: 'umd',
      name: libraryName,
      exports: 'named',
    },
    {
      file: `${outputBrowserDir}/${libraryFileName}-dev.js`,
      format: 'umd',
      name: libraryName,
      exports: 'named',
      sourcemap: true,
    },
    {
      file: `${outputBrowserDir}/${libraryFileName}.min.js`,
      format: 'umd',
      name: libraryName,
      exports: 'named',
      plugins: [terser()],
    },
    {
      file: `${outputBrowserDir}/${libraryFileName}-dev.min.js`,
      format: 'umd',
      name: libraryName,
      exports: 'named',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: rollupCommonPlugins,
};

// https://rollupjs.org/guide/en/#outputpreservemodulesroot
const modulesConfig = {
  input: moduleEntries,
  output: {
    format: 'es',
    dir: outputDir,
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  plugins: rollupCommonPlugins,
};

export default moduleEntries.length > 0
  ? [bundleConfig, browserConfig, modulesConfig]
  : [bundleConfig, browserConfig];
