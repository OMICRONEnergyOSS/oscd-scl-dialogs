/* eslint-disable import-x/no-extraneous-dependencies */
import copy from 'rollup-plugin-copy';

import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: [
      './foundation.ts',
      './OscdSclDialogs.ts',
      './oscd-scl-dialogs.ts',
      './OscdTextEditor.ts',
    ],
    output: {
      sourcemap: true, // Add source map to build output
      format: 'es', // ES module type export
      dir: 'dist', // The build output folder
      // preserveModules: true,  // Keep directory structure and files
    },
    preserveEntrySignatures: 'strict', // leaves export of the plugin entry point

    plugins: [
      /** Resolve bare module imports */
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
      importMetaAssets(),
      copy({
        targets: [
          {
            src: 'node_modules/ace-builds/src-noconflict/*.js',
            dest: 'dist/ace',
          },
        ],
        verbose: true,
        flatten: true,
      }),
    ],
  },
  {
    input: ['./wizards/wizards.ts'],
    output: {
      sourcemap: true, // Add source map to build output
      format: 'es', // ES module type export
      dir: 'dist', // The build output folder
      preserveModules: true, // Keep directory structure and files
    },
    preserveEntrySignatures: 'strict', // leaves export of the plugin entry point

    plugins: [
      /** Resolve bare module imports */
      nodeResolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
      importMetaAssets(),
    ],
  },
  {
    input: 'demo/index.html',
    plugins: [
      html({
        input: 'demo/index.html',
      }),
      /** Resolve bare module imports */
      nodeResolve(),

      typescript({
        tsconfig: './tsconfig.demo.json',
        declaration: false,
        declarationMap: false,
      }),

      /** Bundle assets references via import.meta.url */
      importMetaAssets(),

      copy({
        targets: [{ src: 'demo/sample.scd', dest: 'dist/demo' }],
        verbose: true,
        flatten: false,
      }),

      copy({
        targets: [
          {
            src: 'node_modules/ace-builds/src-noconflict/*.js',
            dest: 'dist/demo/ace',
          },
        ],
        verbose: true,
        flatten: true,
      }),
    ],
    output: {
      dir: 'dist/demo',
      format: 'es',
      sourcemap: true,
    },
  },
];
