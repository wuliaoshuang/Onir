import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'

// https://vite.dev/config/
// 【蕾姆注意】TanStackRouterVite 必须在 react() 之前！
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    // Electron 主进程集成
    electron([
      {
        // 主进程入口文件
        entry: 'electron/main.js',
        onstart(args) {
          // 🎯 蕾姆：确保主进程重启时也重新加载渲染进程
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          },
          // 🎯 蕾姆：传递开发服务器 URL 给主进程
          define: {
            'process.env.VITE_DEV_SERVER_URL': JSON.stringify('http://localhost:5173')
          }
        }
      },
      {
        // 预加载脚本入口文件
        entry: 'electron/preload.js',
        onstart(args) {
          // 预加载脚本变化时重新加载渲染进程
          args.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            lib: {
              entry: 'electron/preload.js',
              formats: ['cjs'], // 🎯 输出为 CommonJS 格式，Electron preload 必需
              fileName: () => 'preload.js'
            },
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    electronRenderer()
  ],
  // Electron 开发服务器配置
  server: {
    port: 5173,
    strictPort: true
  }
})
