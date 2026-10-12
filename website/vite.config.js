import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    cors: true,
    fs: { allow: [projectRoot, path.resolve(projectRoot, '..')] },
    proxy: {
      '/api': { target: 'https://backend-mastergas.be-kite.com', changeOrigin: true, secure: false },
      '/storage': { target: 'https://backend-mastergas.be-kite.com', changeOrigin: true, secure: false },
    },
  },
});
