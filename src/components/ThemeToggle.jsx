import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

/**
 * 主题切换按钮 - 太阳/月亮图标
 * 放置在顶部栏右侧，用于切换深色/浅色模式
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[#86868b]" />
      ) : (
        <Sun className="w-5 h-5 text-[#fbbf24]" />
      )}
    </button>
  )
}
