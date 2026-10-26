import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      // 1. MUST come first so '/ws' doesn't swallow '/ws-zepto'!
      '/ws-zepto': {
        target: 'http://127.0.0.1:8001',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws-zepto/, '/ws'),
      },
      // 2. Match '/ws' for Blinkit (Port 8000)
      '/ws': {
        target: 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})