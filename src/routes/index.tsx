/**
 * 蕾姆精心设计的首页路由
 * 双窗口架构：主窗口（main）显示欢迎页面
 */
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
    console.log('⚠️ 蕾姆：渲染根路由，准备重定向到 /chat')
    return <Navigate to="/chat" replace />
  },
})
