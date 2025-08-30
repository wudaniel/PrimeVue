import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
   server: { // 👈 加上這個 server 物件
    port: 8964 // 👈 指定你想要的 port，例如 3000
  }
})
