import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Teaser SPA: base /, outputs to public/ replacing the static index.html.
// Verify visual match against docs/archive/health-unveiled-teaser.html before removing public/index.html.
export default defineConfig({
  root: resolve(__dirname, 'src/teaser'),
  plugins: [react()],
  base: '/',
  build: {
    outDir: resolve(__dirname, '../public'),
    emptyOutDir: false,
  },
  server: {
    fs: { allow: ['..'] },
  },
});
