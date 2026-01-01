/**
 * 蕾姆精心设计的首页路由
 * 双窗口架构：根据窗口类型重定向到不同页面
 */
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
    // 🎯 蕾姆：获取当前窗口类型，决定重定向目标
    // 优先检查全局变量（由主进程设置），然后检查 electronAPI
    const windowType = (window as any).__WINDOW_TYPE__ || (window as any).electronAPI?.getWindowType()

    if (windowType === 'settings') {
      console.log('⚙️ 蕾姆：设置窗口，重定向到 /general-settings')
      return <Navigate to="/general-settings" replace />
    }

    // 主窗口默认重定向到 chat
    console.log('⚠️ 蕾姆：主窗口，重定向到 /chat')
    return <Navigate to="/chat" replace />
  },
})
