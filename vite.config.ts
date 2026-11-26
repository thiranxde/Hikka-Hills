import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The backend (backend/, `php artisan serve`). The site calls its own /api and these forward it, so no CORS locally.
const api = { '/api': { target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8000', changeOrigin: true } }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // Listen on all interfaces so phones on the same Wi-Fi can open http://<this-PC-IP>:5173
    host: true,
    port: 5173,
    strictPort: true,
    proxy: api,
  },
  preview: {
    host: true,
    port: 4173,
    proxy: api,
  },
})
