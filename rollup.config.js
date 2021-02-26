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

const getModuleName = (filepath) => {
  console.log(filepath);
  return `${filepath}`
    .replace(/^src\//, '')
    .replace(/\/index.[jt]sx?$/, '')
    .split('/')
    .join('_')
    .toLowerCase();
};

//----------------------------------------------------------------------------//

const defaultBuildConfig = {
  libraryName: 'MyLibrary',
  outputBrowserDir: 'dist-browser',
  outputDir: 'dist-pack',
  bundleDir: 'dist',
  bundleEntry: 'src/index.ts',
  browserEntry: 'src/index.ts',
  moduleEntries: [],
};

const {
  libraryName,
  outputBrowserDir,
  outputDir,
  bundleDir,
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
      declarationDir: `${outputDir}`,
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

let rollupConfig = [bundleConfig, browserConfig];

if (Array.isArray(moduleEntries) && moduleEntries.length > 0) {
  // https://rollupjs.org/guide/en/#outputpreservemodulesroot
  const modulesConfig = moduleEntries.map((entry) => ({
    input: moduleEntries,
    output: {
      name: `${libraryName}_${getModuleName(entry)}`,
      format: 'umd',
      exports: 'named',
      dir: outputDir,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: rollupCommonPlugins,
  }));

  rollupConfig = [...rollupConfig, ...modulesConfig];
}

export default rollupConfig;
