import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginFaviconsInject from 'vite-plugin-favicons-inject';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    vitePluginFaviconsInject(
      './src/assets/icon-color.svg',
      {
        background: '#141517',
        theme_color: '#141517',
        appleStatusBarStyle: 'default',
      }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    host: '0.0.0.0',
  },
});
