import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/creative-archive/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-postprocessing': ['@react-three/postprocessing', 'postprocessing'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['gsap'],
        },
      },
    },
  },
})
