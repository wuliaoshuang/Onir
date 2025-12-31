import { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

const ThemeContext = createContext()

/**
 * 蕾姆精心重构的主题提供者
 * ✨ 现在使用 themeStore 统一管理所有主题设置
 * ✨ 确保在应用启动时从 localStorage 恢复主题并应用到 DOM
 */
export function ThemeProvider({ children }) {
  // 从 themeStore 获取主题状态和初始化方法
  const { resolvedTheme, initTheme } = useThemeStore()

  // 🎯 关键：在应用启动时初始化主题（从 localStorage 恢复并应用到 DOM）
  useEffect(() => {
    // 确保在 DOM 完全加载后初始化主题
    initTheme()

    // 监听系统主题变化（仅当 mode 为 'system' 时有效）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      // 重新应用主题（会自动处理 system 模式）
      initTheme()
    }

    // 添加监听器
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // 清理监听器
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [initTheme])

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * @deprecated 请使用 useThemeStore() 替代
 * 这个 hook 仅为向后兼容保留
 */
/* eslint-disable react-refresh/only-export-components */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
