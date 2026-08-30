import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('globe.gl') || id.includes('cobe')) {
              return 'vendor-globe'
            }
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide'
            }
            return 'vendor-core'
          }
        }
      }
    }
  }
})

