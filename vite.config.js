import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para Shopify Admin API
      '/api/shopify': {
        target: 'https://placeholder.myshopify.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/shopify/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Extraer la tienda real del header personalizado
            const targetStore = req.headers['x-shopify-store'];
            if (targetStore) {
              // Cambiar el host destino dinámicamente
              proxyReq.setHeader('host', targetStore);
              options.target = `https://${targetStore}`;
            }
          });
        }
      },
      // Proxy para Google AI APIs (Gemini)
      '/api/google-ai': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/google-ai/, '')
      }
    }
  }
})
