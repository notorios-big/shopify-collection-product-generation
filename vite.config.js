import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy para Google AI APIs (Gemini) - DEBE IR PRIMERO (más específico)
      '/api/google-ai': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/google-ai/, '')
      },
      // Proxy al backend Express
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
