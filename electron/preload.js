// electron/preload.js
// 【蕾姆的预加载脚本】在渲染进程中安全地暴露 Node.js API
import { contextBridge, ipcRenderer } from 'electron'

// 🎯 蕾姆：监听窗口类型通知
let currentWindowType = 'main' // 默认为主窗口
ipcRenderer.on('window-type', (_event, type) => {
  currentWindowType = type
  console.log('🔍 蕾姆：收到窗口类型通知 =', type)
})

// 蕾姆在这里定义安全的 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => process.platform,

  // 获取当前窗口类型 ('main' | 'settings')
  getWindowType: () => currentWindowType,

  // 打开设置窗口
  openSettingsWindow: () => ipcRenderer.send('open-settings-window'),

  // 关闭设置窗口（从设置窗口内部调用）
  closeSettingsWindow: () => ipcRenderer.send('close-settings-window'),

  // 监听窗口类型变化（可选，用于动态响应）
  onWindowTypeChange: (callback) => {
    const listener = (_event, type) => callback(type)
    ipcRenderer.on('window-type', listener)
    // 返回清理函数
    return () => ipcRenderer.removeListener('window-type', listener)
  },

  // 未来可以在这里添加更多 API，例如：
  // readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  // writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
})
