import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        earth: resolve(__dirname, 'earth/index.html'),
      },
      output: {
        manualChunks: {
          threejs: ['three'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
