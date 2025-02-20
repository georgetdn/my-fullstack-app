import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Fixes asset paths for Electron file:// protocol
  build: {
    outDir: 'dist', // Ensure the output directory is 'dist'
  },
});
