/**
 * 蕾姆精心设计的主入口文件
 * 集成 TanStack Router、Zustand 和 i18n
 * 支持双窗口架构（窗口类型检测在路由根组件中进行）
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import './index.css'

// ========== 国际化初始化 ==========
import './i18n/config'
import { useLocaleStore } from './stores/localeStore'

// 生成的路由树
import { routeTree } from './routeTree.gen'

// 🎯 蕾姆：Electron 使用 Memory History
// 因为 file:// 协议不支持 HTML5 History API
const memoryHistory = createMemoryHistory({
  initialEntries: ['/'],
})

// 创建路由实例
const router = createRouter({
  routeTree,
  history: memoryHistory,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// 🎯 蕾姆：只在开发环境打印路由信息
if (import.meta.env.DEV) {
  console.log('🔍 蕾姆：路由配置 =', {
    basepath: router.options.basepath,
    history: router.history.location.href,
  })
}

// ========== 初始化组件 ==========
function AppWithProviders() {
  // 初始化语言（参照主题初始化模式）
  const initLanguage = useLocaleStore((state) => state.initLanguage)

  // ========== 初始化语言设置 ==========
  // 注意：需要在 useEffect 中调用以避免 SSR 问题
  // 但 Tauri 应用是纯客户端，可以直接初始化
  initLanguage()

  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')).render(
    <AppWithProviders />
)
