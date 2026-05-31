import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Allows Rollup to ignore the external Framer hosted module during build compilation
      external: ['https://framer.com/m/LiquidMetal-7nNZ.js@NbxdDP6uG73LOOi54hYX'],
    },
  }
})