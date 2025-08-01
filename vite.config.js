import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // GitHub Pages部署配置
  base: process.env.NODE_ENV === 'production' ? '/library/' : '/',
  build: {
    outDir: 'dist',
  }
})