import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

// https://vite.dev/config/
// 【蕾姆注意】TanStackRouterVite 必须在 react() 之前！
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    // 🎯 蕾姆：Electron 主进程集成
    // 注意：preload 脚本直接使用纯 CommonJS 格式（preload.cjs），不通过 Vite 构建
    electron([
      {
        // 主进程入口文件
        entry: "electron/main.js",
        onstart(args) {
          // 🎯 蕾姆：确保主进程重启时也重新加载渲染进程
          args.reload();
        },
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: ["electron"],
            },
          },
          // 🎯 蕾姆：只在开发模式下定义环境变量
          // 使用 process.env.NODE_ENV 来判断，避免生产环境打包进去
          ...(process.env.NODE_ENV !== "production"
            ? {
                define: {
                  "process.env.VITE_DEV_SERVER_URL": JSON.stringify(
                    "http://localhost:5173"
                  ),
                },
              }
            : {}),
        },
      },
    ]),
    electronRenderer(),
  ],
  // Electron 开发服务器配置
  server: {
    port: 5173,
    strictPort: true,
  },
});
