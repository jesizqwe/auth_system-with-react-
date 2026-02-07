import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: './src/Dashboard.jsx'
      },
      output: {
        entryFileNames: 'dashboard-bundle.js',
        chunkFileNames: 'dashboard-bundle.js',
        assetFileNames: 'dashboard-bundle.css'
      }
    }
  }
})