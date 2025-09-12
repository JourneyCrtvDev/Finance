import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    rollupOptions: {
      input: 'index.html',
      external: [
        '@capacitor/status-bar',
        '@capacitor/splash-screen'
      ]
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});