import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

/**
 * 主题提供者 - 管理全局深色/浅色模式
 * 功能：
 * - 自动检测系统主题偏好
 * - localStorage 持久化
 * - 添加/移除 html 元素的 dark class
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 从 localStorage 读取，或使用系统偏好
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    // 处理测试环境或无 matchMedia 的情况
    if (typeof window.matchMedia !== 'function') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
