import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),

  clearScreen: false,
  
  server: {
    port: 1420,
    strictPort: true
  },

  plugins: [react()],

  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },

  test: {
    globals: true,
    setupFiles: path.resolve(__dirname, '__tests__', 'setupTests.ts'),
    environment: 'jsdom'
  }
}))
