"use strict";
const electron = require("electron");
let currentWindowType = "main";
electron.ipcRenderer.on("window-type", (_event, type) => {
  currentWindowType = type;
  console.log("🔍 蕾姆：收到窗口类型通知 =", type);
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getPlatform: () => process.platform,
  // 获取当前窗口类型 ('main' | 'settings')
  getWindowType: () => currentWindowType,
  // 打开设置窗口
  openSettingsWindow: () => electron.ipcRenderer.send("open-settings-window"),
  // 关闭设置窗口（从设置窗口内部调用）
  closeSettingsWindow: () => electron.ipcRenderer.send("close-settings-window"),
  // 监听窗口类型变化（可选，用于动态响应）
  onWindowTypeChange: (callback) => {
    const listener = (_event, type) => callback(type);
    electron.ipcRenderer.on("window-type", listener);
    return () => electron.ipcRenderer.removeListener("window-type", listener);
  }
  // 未来可以在这里添加更多 API，例如：
  // readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  // writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
});
