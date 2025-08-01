/* eslint-env node */
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/library/'
    : '/'
}
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          firebase: ['firebase/app', 'firebase/firestore'],
          bootstrap: ['bootstrap']
        }
      }
    }
  },
  // 根据环境设置 base URL
  base: process.env.NODE_ENV === 'production' 
    ? '/library/' 
    : '/',
  server: {
    port: 3000,
    host: true
  }
})