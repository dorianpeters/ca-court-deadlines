import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].min.js',
      },
    },
  }
});
