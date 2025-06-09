import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['frontfordeploy-production.up.railway.app']
  },
  plugins: [react(),
  
    
  ],
})