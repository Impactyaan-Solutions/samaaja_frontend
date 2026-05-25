import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://dev.samaaja.impactyaan.com',
        changeOrigin: true,
        cookieDomainRewrite: "localhost"
      },
      '/website_script.js': {
        target: 'https://dev.samaaja.impactyaan.com',
        changeOrigin: true
    },
      '/files': {
        target: 'https://dev.samaaja.impactyaan.com',
        changeOrigin: true
      },
      '/private': {
        target: 'https://dev.samaaja.impactyaan.com',
        changeOrigin: true
      },
      // Added to catch default Frappe system avatars and static files
      '/assets': {
        target: 'https://dev.samaaja.impactyaan.com',
        changeOrigin: true
      }
    }
  }
})
