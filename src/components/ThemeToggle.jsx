import { Moon, Sun, Monitor } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { Button } from './ui/Button'

/**
 * 主题切换按钮 - 支持浅色/深色/跟随系统三种模式
 * 蕾姆精心优化，现在使用 themeStore 进行状态管理
 * 已迁移到统一的 Button 组件系统
 */
export function ThemeToggle() {
  const { mode, resolvedTheme, setThemeMode } = useThemeStore()

  // 循环切换模式：浅色 → 深色 → 跟随系统 → 浅色
  const handleToggle = () => {
    if (mode === 'light') {
      setThemeMode('dark')
    } else if (mode === 'dark') {
      setThemeMode('system')
    } else {
      setThemeMode('light')
    }
  }

  // 根据当前模式选择图标和样式
  const getIcon = () => {
    if (mode === 'system') {
      return <Monitor className="w-5 h-5 text-emerald-500" />
    }
    return resolvedTheme === 'light' ? (
      <Sun className="w-5 h-5 text-amber-500" />
    ) : (
      <Moon className="w-5 h-5 text-primary-500" />
    )
  }

  const getTitle = () => {
    if (mode === 'light') return '当前：浅色模式 (点击切换到深色)'
    if (mode === 'dark') return '当前：深色模式 (点击切换到跟随系统)'
    return '当前：跟随系统 (点击切换到浅色)'
  }

  return (
    <Button
      variant="ghost"
      size="md"
      aria-label={getTitle()}
      title={getTitle()}
      onClick={handleToggle}
      className="p-2.5 rounded-xl [&_svg]:transition-all [&_svg]:duration-200"
    >
      {getIcon()}
    </Button>
  )
}
