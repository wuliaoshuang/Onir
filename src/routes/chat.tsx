/**
 * 蕾姆精心设计的聊天布局路由
 * 包含聊天侧边栏 + 子路由内容区域
 */
import { createFileRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '../components/Sidebar'

export const Route = createFileRoute('/chat')({
  component: ChatLayout,
})

function ChatLayout() {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 聊天侧边栏 */}
      <Sidebar />

      {/* 子路由内容区域 */}
      <Outlet />
    </div>
  )
}
