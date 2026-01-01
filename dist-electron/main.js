import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
function getDistPath() {
  if (!app.isPackaged) {
    return path.join(process.cwd(), "dist");
  }
  return path.join(__dirname$1, "..", "dist");
}
function getPreloadPath() {
  return path.join(__dirname$1, "preload.cjs");
}
let mainWindow = null;
let settingsWindow = null;
function createWindow() {
  const preloadPath = getPreloadPath();
  const distPath = getDistPath();
  const indexPath = path.join(distPath, "index.html");
  console.log("🎯 蕾姆：主窗口配置", {
    preloadPath,
    distPath,
    indexPath,
    platform: process.platform
  });
  mainWindow = new BrowserWindow({
    width: 1200,
    // 📏 蕾姆：加大宽度，提供更舒适的工作空间
    height: 800,
    // 📏 蕾姆：增加高度，展示更多内容
    backgroundColor: "#FFFFFF",
    show: false,
    // 等待加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: preloadPath,
      // 🎯 蕾姆：允许加载本地文件
      webSecurity: false
      // 仅用于本地开发，生产环境可考虑开启
    }
  });
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("❌ 蕾姆：页面加载失败", {
        errorCode,
        errorDescription,
        validatedURL
      });
    }
  );
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ 蕾姆：主窗口加载完成");
    mainWindow.webContents.send("window-type", "main");
  });
  if (!app.isPackaged) {
    const devServerUrl = "http://localhost:5173";
    console.log("🌐 蕾姆：加载开发服务器", devServerUrl);
    mainWindow.loadURL(devServerUrl);
  } else {
    console.log("📁 蕾姆：加载打包文件", indexPath);
    mainWindow.loadFile(indexPath);
  }
  mainWindow.once("ready-to-show", () => {
    console.log("🎉 蕾姆：主窗口准备显示");
    mainWindow.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }
  const preloadPath = getPreloadPath();
  const distPath = getDistPath();
  const indexPath = path.join(distPath, "index.html");
  settingsWindow = new BrowserWindow({
    width: 900,
    // 📏 蕾姆：扩展设置面板宽度
    height: 700,
    // 📏 蕾姆：增加设置面板高度
    show: false,
    // 等待加载完成后再显示，避免白屏
    resizable: true,
    title: "Onir 设置",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      // 🎯 蕾姆：暂时关闭沙箱，确保 preload 正常加载
      preload: preloadPath,
      webSecurity: false
    }
  });
  if (!app.isPackaged) ;
  settingsWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("❌ 蕾姆：设置窗口加载失败", {
        errorCode,
        errorDescription,
        validatedURL
      });
    }
  );
  if (!app.isPackaged) {
    const devServerUrl = "http://localhost:5173";
    const settingsURL = `${devServerUrl}/general-settings`;
    console.log("🎯 蕾姆：设置窗口 URL =", settingsURL);
    settingsWindow.loadURL(settingsURL);
    settingsWindow.webContents.on("did-finish-load", () => {
      console.log(
        "📋 蕾姆：设置窗口加载完成，当前 URL =",
        settingsWindow.webContents.getURL()
      );
      settingsWindow.webContents.send("window-type", "settings");
    });
  } else {
    console.log("📋 蕾姆：生产环境设置窗口加载", indexPath);
    settingsWindow.loadFile(indexPath);
    settingsWindow.webContents.once("did-finish-load", () => {
      console.log("📋 蕾姆：生产环境设置窗口加载完成");
      settingsWindow.webContents.executeJavaScript(
        'window.__WINDOW_TYPE__ = "settings"'
      );
      settingsWindow.webContents.send("window-type", "settings");
    });
  }
  settingsWindow.once("ready-to-show", () => {
    console.log("🎉 蕾姆：设置窗口准备显示");
    settingsWindow.show();
  });
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  ipcMain.on("open-settings-window", () => {
    createSettingsWindow();
  });
  ipcMain.on("close-settings-window", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });
  const requestControllers = /* @__PURE__ */ new Map();
  ipcMain.handle(
    "deepseek-chat",
    async (event, { messages, options, apiKey }) => {
      const requestId = Date.now();
      console.log("🤖 蕾姆：收到 DeepSeek 聊天请求，requestId =", requestId);
      try {
        const { DeepSeekClient } = await import("./index-rkdGEccl.js");
        const client = new DeepSeekClient(apiKey);
        const controller = new AbortController();
        requestControllers.set(requestId, controller);
        await client.chat(
          messages,
          {
            onChunk: (chunk) => {
              if (!mainWindow.isDestroyed()) {
                mainWindow.webContents.send("deepseek-chunk", {
                  requestId,
                  chunk
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
                  error: error.message
                });
              }
              requestControllers.delete(requestId);
            }
          },
          {
            signal: controller.signal,
            ...options
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
  ipcMain.on("abort-deepseek-chat", (event, requestId) => {
    console.log("🛑 蕾姆：收到取消请求，requestId =", requestId);
    const controller = requestControllers.get(requestId);
    if (controller) {
      controller.abort();
      requestControllers.delete(requestId);
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
