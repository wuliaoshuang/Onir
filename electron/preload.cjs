// electron/preload.cjs
// 【蕾姆的预加载脚本】在渲染进程中安全地暴露 Node.js API
// 🎯 使用 CommonJS 以支持沙箱模式
const { contextBridge, ipcRenderer } = require('electron')

// 🎯 蕾姆：过滤 DevTools 的 Autofill 相关错误消息
// 这些错误来自 Chrome DevTools 尝试调用 Electron 不支持的协议方法
// 参考: https://github.com/electron/electron/issues/46868
const originalConsoleError = console.error
console.error = function (...args) {
  const message = args[0]
  if (
    typeof message === 'string' &&
    (message.includes('Autofill.enable failed') ||
     message.includes('Autofill.setAddresses failed') ||
     message.includes("'Autofill.enable' wasn't found") ||
     message.includes("'Autofill.setAddresses' wasn't found"))
  ) {
    // 静默忽略这些无害的错误
    return
  }
  // 其他错误正常输出
  originalConsoleError.apply(console, args)
}

// 🎯 蕾姆：监听窗口类型通知
// 🎯 蕾姆优化：在 preload 初始化时就判断窗口类型（通过 URL）
// 这样 React 应用启动时就能获取正确的窗口类型，避免重定向问题
let currentWindowType = 'main' // 默认为主窗口

// 根据当前 URL 判断窗口类型（在开发环境有效）
try {
  const currentUrl = window.location.href
  if (currentUrl.includes('/general-settings')) {
    currentWindowType = 'settings'
    console.log('🔍 蕾姆：通过 URL 识别为设置窗口')
  }
} catch (e) {
  // window.location 可能还不存在，忽略错误
}

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

  // 🎯 蕾姆新增：DeepSeek API 调用（通过 IPC）
  // 在主进程中处理 API 请求，保证 API Key 安全
  deepseekChat: (messages, options) =>
    ipcRenderer.invoke('deepseek-chat', { messages, options }),

  // 🎯 蕾姆新增：取消进行中的 DeepSeek 请求
  abortDeepseekChat: (requestId) =>
    ipcRenderer.send('abort-deepseek-chat', requestId),

  // 🎯 蕾姆新增：监听 DeepSeek 流式响应
  onDeepseekChunk: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('deepseek-chunk', listener)
    return () => ipcRenderer.removeListener('deepseek-chunk', listener)
  },

  // 🎯 蕾姆新增：监听 DeepSeek 请求完成
  onDeepseekComplete: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('deepseek-complete', listener)
    return () => ipcRenderer.removeListener('deepseek-complete', listener)
  },

  // 🎯 蕾姆新增：监听 DeepSeek 请求错误
  onDeepseekError: (callback) => {
    const listener = (_event, data) => callback(data)
    ipcRenderer.on('deepseek-error', listener)
    return () => ipcRenderer.removeListener('deepseek-error', listener)
  },
})
