// electron/main.js
// 【蕾姆的 Electron 主进程】负责管理应用窗口和系统交互
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 蕾姆正在维护窗口引用...
let mainWindow = null
let settingsWindow = null // 设置窗口引用

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,  // 📏 蕾姆：加大宽度，提供更舒适的工作空间
    height: 800, // 📏 蕾姆：增加高度，展示更多内容
    backgroundColor: '#FFFFFF',
    show: false, // 等待加载完成后再显示，避免白屏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 🎯 蕾姆：在窗口创建后，将窗口标识传递给渲染进程
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('window-type', 'main')
  })

  // 开发环境加载 Vite 开发服务器，生产环境加载打包后的文件
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示，提升用户体验
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Windows/Linux 下窗口关闭时清除引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 创建设置窗口
function createSettingsWindow() {
  // 如果设置窗口已经存在，直接聚焦
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 900,  // 📏 蕾姆：扩展设置面板宽度
    height: 700,  // 📏 蕾姆：增加设置面板高度
    show: false, // 等待加载完成后再显示，避免白屏
    resizable: true,
    title: 'Onir 设置',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 开发环境加载 Vite 开发服务器，生产环境加载打包后的文件
  if (process.env.VITE_DEV_SERVER_URL) {
    // 🎯 蕾姆：使用 history 路由（非 hash 模式）
    const settingsURL = `${process.env.VITE_DEV_SERVER_URL}/general-settings`
    console.log('🎯 蕾姆：设置窗口 URL =', settingsURL)
    settingsWindow.loadURL(settingsURL)

    // 🎯 蕾姆：在窗口创建后，将窗口标识传递给渲染进程
    settingsWindow.webContents.on('did-finish-load', () => {
      console.log('📋 蕾姆：设置窗口加载完成，当前 URL =', settingsWindow.webContents.getURL())
      settingsWindow.webContents.send('window-type', 'settings')
    })
  } else {
    // 生产环境：直接加载 HTML 文件，通过 URL 路径访问
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'))

    // 🎯 蕾姆：加载完成后导航到设置页面并发送窗口类型
    settingsWindow.webContents.once('did-finish-load', () => {
      console.log('📋 蕾姆：生产环境设置窗口加载完成')
      // 通过 JavaScript 导航到设置页面
      settingsWindow.webContents.executeJavaScript('window.history.pushState({}, "", "/general-settings")')
      // 发送窗口类型通知
      settingsWindow.webContents.send('window-type', 'settings')
    })
  }

  // 窗口准备好后显示，提升用户体验
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show()
  })

  // 设置窗口关闭时清除引用
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow()

  // macOS 特有行为：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // IPC 监听：打开设置窗口
  ipcMain.on('open-settings-window', () => {
    createSettingsWindow()
  })

  // IPC 监听：关闭设置窗口（从设置窗口内部发送）
  ipcMain.on('close-settings-window', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close()
    }
  })
})

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
