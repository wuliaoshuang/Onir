/**
 * 蕾姆精心设计的主窗口布局组件
 *
 * 主窗口包含：
 * - MainSidebar（主导航侧边栏）
 * - Outlet（子路由内容区域）
 * - ToastContainer（通知容器）
 */
import { createFileRoute, Outlet } from '@tanstack/react-router'
import MainSidebar from '../components/MainSidebar'
import ToastContainer from '../components/ToastContainer'
import { useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'

function MainLayout() {
  const location = useLocation()

  // 判断当前是否为 Chat 路由（需要独立布局，隐藏 MainSidebar）
  const isChatRoute = useMemo(() => {
    const path = location.pathname
    return path.startsWith('/chat') || path.startsWith('/conversation')
  }, [location.pathname])

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-[#f5f5f7] dark:bg-black">
        <div className="h-full flex">
          {/* 主导航侧边栏 */}
          {!isChatRoute && (
            <MainSidebar currentPath={location.pathname} />
          )}
          {/* 页面内容区域 - 使用 Outlet 渲染子路由 */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Toast 容器 */}
      <ToastContainer />
    </>
  )
}

// 🎯 蕾姆：导出布局路由，让 TanStack Router 识别为文件路由
export const Route = createFileRoute('/_main')({
  component: MainLayout,
})
