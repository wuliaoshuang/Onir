/**
 * 蕾姆精心设计的设置窗口布局组件
 *
 * 设置窗口使用统一的 MainSidebar 组件
 * - inSettingsContext={true} 表示当前在设置页面上下文
 * - 会显示关闭设置按钮而不是打开设置按钮
 */
import { createFileRoute, Outlet } from '@tanstack/react-router'
import MainSidebar from '../components/MainSidebar'
import ToastContainer from '../components/ToastContainer'
import { useLocation } from '@tanstack/react-router'

function SettingsLayout() {
  const location = useLocation()

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-[#f5f5f7] dark:bg-black">
        <div className="h-full flex">
          {/* 🎯 使用统一的 MainSidebar 组件，inSettingsContext={true} */}
          <MainSidebar
            currentPath={location.pathname}
            inSettingsContext={true}
          />

          {/* 设置页面内容 - 使用 Outlet 渲染子路由 */}
          <div className="flex-1 overflow-y-auto">
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
export const Route = createFileRoute('/_settings')({
  component: SettingsLayout,
})
