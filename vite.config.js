import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/floudy-app.github.io/',
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.js',
    exclude: ['./tests/floudy.spec.js'],
  },
});
