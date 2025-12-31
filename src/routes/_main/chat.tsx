/**
 * 蕾姆精心设计的聊天布局路由
 * 包含聊天侧边栏 + 子路由内容区域
 * 双窗口架构：只在主窗口显示对话侧边栏，设置窗口隐藏
 */
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'

export const Route = createFileRoute('/_main/chat')({
  component: ChatLayout,
})

function ChatLayout() {
  const [isMainWindow, setIsMainWindow] = useState(true)

  // 检测当前窗口类型
  useEffect(() => {
    const detectWindow = async () => {
      try {
        // 🎯 蕾姆：检查是否在 Tauri 环境下
        if (window.__TAURI__ && window.__TAURI__.window) {
          const currentWindow = await window.__TAURI__.window.getCurrent()
          const label = currentWindow.label
          // 主窗口显示对话侧边栏，设置窗口隐藏
          setIsMainWindow(label !== 'settings')
        } else {
          // 非 Tauri 环境（Electron/Web），默认显示侧边栏
          setIsMainWindow(true)
        }
      } catch (error) {
        // 出错时默认显示侧边栏
        setIsMainWindow(true)
      }
    }

    detectWindow()
  }, [])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 聊天侧边栏 - 只在主窗口显示 */}
      {isMainWindow && <Sidebar />}

      {/* 子路由内容区域 */}
      <Outlet />
    </div>
  )
}
