import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // Add this line

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add this line
  ],
})