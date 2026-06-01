import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
    server: {
    // headers: {
    //   'X-Frame-Options': 'DENY',
    //   'X-Content-Type-Options': 'nosniff',
    //   'Referrer-Policy': 'same-origin',
    //   'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    //   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // }
  }
})
