import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
let mainWindow = null;
let settingsWindow = null;
function createWindow() {
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
      preload: path.join(__dirname$1, "preload.js")
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("window-type", "main");
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  mainWindow.once("ready-to-show", () => {
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
      preload: path.join(__dirname$1, "preload.js")
    }
  });
  {
    const settingsURL = `${"http://localhost:5173"}/general-settings`;
    console.log("🎯 蕾姆：设置窗口 URL =", settingsURL);
    settingsWindow.loadURL(settingsURL);
    settingsWindow.webContents.on("did-finish-load", () => {
      console.log("📋 蕾姆：设置窗口加载完成，当前 URL =", settingsWindow.webContents.getURL());
      settingsWindow.webContents.send("window-type", "settings");
    });
  }
  settingsWindow.once("ready-to-show", () => {
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
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
