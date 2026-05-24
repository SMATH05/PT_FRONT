import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiProxyTarget = (env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8010').replace(/\/+$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/auth-proxy': {
          target: 'http://localhost:8088',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/auth-proxy/, ''),
        },
      },
    },
  }
})
