import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,

  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1421,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421
        }
      : undefined
  },

  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
      '~': path.resolve(__dirname, 'src')
    }
  },

  test: {
    globals: true,
    setupFiles: path.resolve(__dirname, '__tests__', 'setupTests.ts'),
    environment: 'jsdom'
  }
}))
