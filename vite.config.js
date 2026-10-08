import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for static hosting. Defaults to '/' (local dev/preview);
  // the GitHub Pages workflow sets VITE_BASE_PATH=/DATAOPS-INSIGHT-HUB/.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        }
      }
    }
  }
});
