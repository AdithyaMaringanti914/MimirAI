import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use /MimirAI/ for GitHub Pages deployment, otherwise / for local dev
  base: process.env.GITHUB_ACTIONS ? '/MimirAI/' : '/',
})

