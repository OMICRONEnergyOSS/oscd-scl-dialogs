import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',

  server: {
    open: '/demo/',
    port: 8000,
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  esbuild: {
    target: 'es2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },

  optimizeDeps: {
    exclude: [
      '@openscd/oscd-editor',
      '@openscd/oscd-api',
      '@openscd/scl-lib',
      'ace-custom-element',
      'ace-builds',
    ],
  },
});
