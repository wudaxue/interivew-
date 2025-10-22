import path, { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        messageMain: resolve(__dirname, 'src/pages/message/main.html'),
        messageIframe1: resolve(__dirname, 'src/pages/message/frame1.html'),
        messageIframe2: resolve(__dirname, 'src/pages/message/frame2.html'),
        // 添加更多页面...
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
