import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/creative-archive/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules/')) return
          if (id.includes('postprocessing')) return 'vendor-postprocessing'
          if (id.includes('three')) return 'vendor-three'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('gsap')) return 'vendor-utils'
        },
      },
    },
  },
})
