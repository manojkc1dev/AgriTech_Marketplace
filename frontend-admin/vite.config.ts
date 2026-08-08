import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true, // This forces it to fail if 3001 is taken, rather than opening 3002
  }
})