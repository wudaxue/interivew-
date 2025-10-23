import path, { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const env = loadEnv('dev', './')
const version = env.VITE_APP_VERSION
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        messageMain: resolve(__dirname, `src/pages/message/${version}/main/index.html`),
        messageIframe1: resolve(__dirname, `src/pages/message/${version}/frame1/index.html`),
        messageIframe2: resolve(__dirname, `src/pages/message/${version}/frame2/index.html`),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
