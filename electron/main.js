// electron/main.js
// 【蕾姆的 Electron 主进程】负责管理应用窗口和系统交互
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 蕾姆：获取资源目录路径（兼容开发/打包环境）
// 在打包后，__dirname 类似于 /path/to/app/app.asar.unpacked/dist-electron
// 需要正确解析 dist 目录
function getDistPath() {
  // 🎯 关键修复：使用 app.isPackaged 来判断是否是打包环境
  // 而不是依赖 process.env.VITE_DEV_SERVER_URL（它可能在打包后仍然存在）
  if (!app.isPackaged) {
    // 开发环境：直接返回项目目录下的 dist
    return path.join(process.cwd(), "dist");
  }
  // 生产环境：从 dist-electron 目录向上查找 dist
  // 打包后结构：app.asar/dist-electron/main.js
  //           app.asar/dist/index.html
  return path.join(__dirname, "..", "dist");
}

function getPreloadPath() {
  // 开发环境和生产环境都使用相同的相对路径
  // 🎯 蕾姆：使用 .cjs 扩展名确保 CommonJS 格式被正确识别
  return path.join(__dirname, "preload.cjs");
}

// 蕾姆正在维护窗口引用...
let mainWindow = null;
let settingsWindow = null; // 设置窗口引用

// 创建主窗口
function createWindow() {
  const preloadPath = getPreloadPath();
  const distPath = getDistPath();
  const indexPath = path.join(distPath, "index.html");

  console.log("🎯 蕾姆：主窗口配置", {
    preloadPath,
    distPath,
    indexPath,
    platform: process.platform,
  });

  mainWindow = new BrowserWindow({
    width: 1200, // 📏 蕾姆：加大宽度，提供更舒适的工作空间
    height: 800, // 📏 蕾姆：增加高度，展示更多内容
    backgroundColor: "#FFFFFF",
    show: false, // 等待加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: preloadPath,
      // 🎯 蕾姆：允许加载本地文件
      webSecurity: false, // 仅用于本地开发，生产环境可考虑开启
    },
  });

  // 🎯 蕾姆：开发环境打开 DevTools
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // 🎯 蕾姆：监听加载错误
  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("❌ 蕾姆：页面加载失败", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    }
  );

  // 🎯 蕾姆：在窗口创建后，将窗口标识传递给渲染进程
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ 蕾姆：主窗口加载完成");
    mainWindow.webContents.send("window-type", "main");
  });

  // 🎯 蕾姆：根据环境选择加载方式
  if (!app.isPackaged) {
    // 开发环境：加载 Vite 开发服务器
    const devServerUrl =
      process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    console.log("🌐 蕾姆：加载开发服务器", devServerUrl);
    mainWindow.loadURL(devServerUrl);
  } else {
    // 生产环境：加载打包后的文件
    console.log("📁 蕾姆：加载打包文件", indexPath);
    mainWindow.loadFile(indexPath);
  }

  // 窗口准备好后显示，提升用户体验
  mainWindow.once("ready-to-show", () => {
    console.log("🎉 蕾姆：主窗口准备显示");
    mainWindow.show();
  });

  // Windows/Linux 下窗口关闭时清除引用
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 创建设置窗口
function createSettingsWindow() {
  // 如果设置窗口已经存在，直接聚焦
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const preloadPath = getPreloadPath();
  const distPath = getDistPath();
  const indexPath = path.join(distPath, "index.html");

  settingsWindow = new BrowserWindow({
    width: 900, // 📏 蕾姆：扩展设置面板宽度
    height: 700, // 📏 蕾姆：增加设置面板高度
    show: false, // 等待加载完成后再显示，避免白屏
    resizable: true,
    title: "Onir 设置",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: preloadPath,
      webSecurity: false,
    },
  });

  // 🎯 蕾姆：开发环境打开 DevTools
  if (!app.isPackaged) {
    // settingsWindow.webContents.openDevTools()
  }

  // 🎯 蕾姆：监听加载错误
  settingsWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("❌ 蕾姆：设置窗口加载失败", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    }
  );

  // 🎯 蕾姆：根据环境选择加载方式
  if (!app.isPackaged) {
    // 开发环境：使用 history 路由（非 hash 模式）
    const devServerUrl =
      process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    const settingsURL = `${devServerUrl}/general-settings`;
    console.log("🎯 蕾姆：设置窗口 URL =", settingsURL);
    settingsWindow.loadURL(settingsURL);

    // 🎯 蕾姆：在窗口创建后，将窗口标识传递给渲染进程
    settingsWindow.webContents.on("did-finish-load", () => {
      console.log(
        "📋 蕾姆：设置窗口加载完成，当前 URL =",
        settingsWindow.webContents.getURL()
      );
      settingsWindow.webContents.send("window-type", "settings");
    });
  } else {
    // 生产环境：直接加载 HTML 文件，通过 URL 路径访问
    console.log("📋 蕾姆：生产环境设置窗口加载", indexPath);
    settingsWindow.loadFile(indexPath);

    // 🎯 蕾姆：加载完成后导航到设置页面并发送窗口类型
    settingsWindow.webContents.once("did-finish-load", () => {
      console.log("📋 蕾姆：生产环境设置窗口加载完成");
      // 🎯 蕾姆：设置窗口类型全局变量（在 React 渲染前）
      settingsWindow.webContents.executeJavaScript(
        'window.__WINDOW_TYPE__ = "settings"'
      );
      // 发送窗口类型通知
      settingsWindow.webContents.send("window-type", "settings");
    });
  }

  // 窗口准备好后显示，提升用户体验
  settingsWindow.once("ready-to-show", () => {
    console.log("🎉 蕾姆：设置窗口准备显示");
    settingsWindow.show();
  });

  // 设置窗口关闭时清除引用
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 特有行为：点击 Dock 图标时重新创建窗口
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // IPC 监听：打开设置窗口
  ipcMain.on("open-settings-window", () => {
    createSettingsWindow();
  });

  // IPC 监听：关闭设置窗口（从设置窗口内部发送）
  ipcMain.on("close-settings-window", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });

  // 🎯 蕾姆新增：DeepSeek API 调用处理
  // 存储进行中的请求控制器（用于取消请求）
  const requestControllers = new Map();

  ipcMain.handle(
    "deepseek-chat",
    async (event, { messages, options, apiKey }) => {
      const requestId = Date.now();
      console.log("🤖 蕾姆：收到 DeepSeek 聊天请求，requestId =", requestId);

      try {
        // 动态导入 DeepSeek 客户端（使用 ES Module）
        const { DeepSeekClient } = await import(
          "../src/services/deepseek/index.js"
        );

        // 创建客户端
        const client = new DeepSeekClient(apiKey);

        // 创建 AbortController
        const controller = new AbortController();
        requestControllers.set(requestId, controller);

        // 发起流式请求
        await client.chat(
          messages,
          {
            onChunk: (chunk) => {
              // 🎯 蕾姆：通过 IPC 发送流式数据回渲染进程
              if (!mainWindow.isDestroyed()) {
                mainWindow.webContents.send("deepseek-chunk", {
                  requestId,
                  chunk,
                });
              }
            },
            onComplete: () => {
              console.log("✅ 蕾姆：请求完成，requestId =", requestId);
              if (!mainWindow.isDestroyed()) {
                mainWindow.webContents.send("deepseek-complete", { requestId });
              }
              requestControllers.delete(requestId);
            },
            onError: (error) => {
              console.error("❌ 蕾姆：请求失败，requestId =", requestId, error);
              if (!mainWindow.isDestroyed()) {
                mainWindow.webContents.send("deepseek-error", {
                  requestId,
                  error: error.message,
                });
              }
              requestControllers.delete(requestId);
            },
          },
          {
            signal: controller.signal,
            ...options,
          }
        );

        return { requestId };
      } catch (error) {
        console.error("❌ 蕾姆：处理请求失败", error);
        requestControllers.delete(requestId);
        throw error;
      }
    }
  );

  // 🎯 蕾姆新增：取消 DeepSeek 请求
  ipcMain.on("abort-deepseek-chat", (event, requestId) => {
    console.log("🛑 蕾姆：收到取消请求，requestId =", requestId);
    const controller = requestControllers.get(requestId);
    if (controller) {
      controller.abort();
      requestControllers.delete(requestId);
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
