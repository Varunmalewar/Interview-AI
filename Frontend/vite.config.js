import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api/* calls to the backend during dev. The browser only
      // ever talks to localhost:5173 (same origin), so CORS and cross-site
      // cookie issues with localhost:3000 disappear. Restart the dev server
      // after changing this file.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
