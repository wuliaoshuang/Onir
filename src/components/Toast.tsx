/**
 * 蕾姆精心设计的 Toast 通知组件
 * 与现有 UI 风格完美融合
 */

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { ToastComponentProps } from '../types/toast'

/**
 * 获取 Toast 类型对应的图标和颜色样式
 */
const getToastStyles = (type: string) => {
  const styles = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 dark:border-emerald-500/30',
      progressColor: 'bg-emerald-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-sakura-500/10 dark:bg-sakura-500/20',
      iconColor: 'text-sakura-500 dark:text-sakura-400',
      borderColor: 'border-sakura-500/20 dark:border-sakura-500/30',
      progressColor: 'bg-sakura-500',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-500 dark:text-amber-400',
      borderColor: 'border-amber-500/20 dark:border-amber-500/30',
      progressColor: 'bg-amber-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary-500/10 dark:bg-primary-500/20',
      iconColor: 'text-primary-500 dark:text-primary-400',
      borderColor: 'border-primary-500/20 dark:border-primary-500/30',
      progressColor: 'bg-primary-500',
    },
  }

  return styles[type as keyof typeof styles] || styles.info
}

/**
 * Toast 通知组件
 *
 * 功能：
 * - 显示图标、消息、关闭按钮
 * - 倒计时进度条
 * - 鼠标悬停暂停
 * - 进入/退出动画
 */
export default function Toast({ toast, onClose, onPause, onResume }: ToastComponentProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const styles = getToastStyles(toast.type)
  const Icon = styles.icon
  const duration = toast.duration ?? 3000

  // 进度条倒计时逻辑
  useEffect(() => {
    if (duration === 0) return // 不自动关闭

    const interval = 50 // 更新频率（毫秒）
    const decrement = (100 / (duration / interval)) // 每次减少的百分比

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer)
            return 0
          }
          return prev - decrement
        })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [duration, isPaused])

  /**
   * 关闭处理（带退出动画）
   */
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 300) // 等待退出动画完成
  }

  /**
   * 鼠标悬停暂停
   */
  const handleMouseEnter = () => {
    if (toast.persistent) {
      setIsPaused(true)
      onPause?.(toast.id)
    }
  }

  /**
   * 鼠标离开恢复
   */
  const handleMouseLeave = () => {
    if (toast.persistent) {
      setIsPaused(false)
      onResume?.(toast.id)
    }
  }

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3
        bg-white/80 dark:bg-dark-card/80
        backdrop-blur-xl rounded-xl shadow-lg shadow-black/5
        overflow-hidden
        border ${styles.borderColor}
        transition-all duration-300
        ${isExiting ? 'animate-out fade-out slide-out-to-top-2 duration-300' : 'animate-in fade-in slide-in-from-top-2 duration-300'}
        min-w-md
        group
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ========================================
          图标
      ======================================== */}
      <div className={`
        shrink-0 w-5 h-5 rounded-full flex items-center justify-center
        ${styles.bgColor}
      `}>
        <Icon className={`w-3.5 h-3.5 ${styles.iconColor}`} />
      </div>

      {/* ========================================
          消息内容
      ======================================== */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary warp-break-words">
          {toast.message}
        </p>
      </div>

      {/* ========================================
          关闭按钮（悬停时显示）
      ======================================== */}
      <button
        onClick={handleClose}
        className="
          shrink-0 w-5 h-5 rounded-md flex items-center justify-center
          text-light-text-secondary dark:text-dark-text-secondary
          hover:bg-[#f5f5f7] dark:hover:bg-black
          hover:text-light-text-primary dark:hover:text-dark-text-primary
          transition-all duration-200
          opacity-0 group-hover:opacity-100
        "
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* ========================================
          进度条（底部）
      ======================================== */}
      {toast.showProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-light-border dark:bg-dark-border rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${styles.progressColor} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
