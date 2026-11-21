import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const apiOrigin = new URL(apiBaseUrl, 'http://127.0.0.1:8000').origin;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
        },
        '/storage': {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
