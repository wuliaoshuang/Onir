/**
 * 蕾姆精心设计的根路由布局 - 支持双窗口架构
 *
 * 多窗口架构说明：
 * - 主窗口：加载主应用内容
 * - 设置窗口：独立的子窗口，显示设置页面
 */
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useEffect, useState } from 'react'
import { initCrossWindowSync } from '../stores/apiKeyStore'
import { useThemeStore } from '../stores/themeStore'
import { listenCrossWindowEvent, CrossWindowEventType } from '../lib/crossWindowEvents'

function RootComponent() {
  const [isReady, setIsReady] = useState(false)
  const initTheme = useThemeStore((state) => state.initTheme)
  const reloadFromStorage = useThemeStore((state) => state.reloadFromStorage)

  // 🎯 蕾姆：初始化主题
  useEffect(() => {
    initTheme()
    setIsReady(true)
  }, [initTheme])

  // 🎯 蕾姆：初始化跨窗口同步
  useEffect(() => {
    let unlistenApiKey: (() => Promise<void>) | null = null
    let unlistenTheme: (() => Promise<void>) | null = null
    let unlistenLanguage: (() => Promise<void>) | null = null

    const initSync = async () => {
      try {
        // API 密钥跨窗口同步
        unlistenApiKey = await initCrossWindowSync()
        console.log('🎯 蕾姆：API密钥跨窗口同步已启用')

        // 主题跨窗口同步
        unlistenTheme = await listenCrossWindowEvent(
          CrossWindowEventType.THEME_UPDATED,
          async (payload) => {
            console.log('🎨 蕾姆：收到主题更新事件', payload)
            // 从 localStorage 重新加载主题设置
            reloadFromStorage()
          }
        )
        console.log('🎨 蕾姆：主题跨窗口同步已启用')

        // 语言跨窗口同步
        unlistenLanguage = await listenCrossWindowEvent(
          CrossWindowEventType.LANGUAGE_UPDATED,
          async (payload) => {
            console.log('🌐 蕾姆：收到语言更新事件', payload)
            // 从 localStorage 重新加载语言设置
            const { useLocaleStore } = await import('../stores/localeStore')
            useLocaleStore.getState().reloadFromStorage()
          }
        )
        console.log('🌐 蕾姆：语言跨窗口同步已启用')
      } catch (error) {
        console.error('❌ 蕾姆：跨窗口同步初始化失败', error)
      }
    }

    initSync()

    return () => {
      if (unlistenApiKey) {
        unlistenApiKey().then(() => console.log('🔚 蕾姆：API密钥跨窗口同步已停止'))
      }
      if (unlistenTheme) {
        unlistenTheme().then(() => console.log('🔚 蕾姆：主题跨窗口同步已停止'))
      }
      if (unlistenLanguage) {
        unlistenLanguage().then(() => console.log('🔚 蕾姆：语言跨窗口同步已停止'))
      }
    }
  }, [reloadFromStorage])

  // 等待初始化完成
  if (!isReady) {
    console.log('⏳ 蕾姆：等待初始化完成...')
    return null
  }

  return (
    <ThemeProvider>
      {/* 🎯 路由出口：TanStack Router 会根据当前路径自动选择正确的布局路由 */}
      <Outlet />

      {/* 开发环境显示路由调试工具 */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </ThemeProvider>
  )
}

// 404 未找到页面组件
function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f7] dark:bg-black">
      <div className="text-center">
        <h1 className="text-[64px] font-bold text-primary-500 mb-4">404</h1>
        <p className="text-[16px] text-[#86868b] dark:text-[#8e8e93]">
          页面未找到
        </p>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})
