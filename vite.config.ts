import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ca-court-deadlines/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].min.js',
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
