import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // 后端地址走 .env 配置（域名+路由前缀一体，换环境只改那里，不动代码）
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [tanstackRouter({ target: 'react' }), react()],
    server: {
      proxy: {
        // 前端调 /api/** → 转发到 VITE_API_PROXY_TARGET/**（去 /api 前缀）
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
