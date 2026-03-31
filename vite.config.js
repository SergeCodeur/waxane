import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiMiddleware } from './vite-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddleware()],
})
