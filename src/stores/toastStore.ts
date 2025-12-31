/**
 * 蕾姆精心设计的 Toast 通知状态管理 Store
 * 参考现有 uiStore.ts 的模式设计
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Toast, ToastState, ToastType } from '../types/toast'

// ========================================
// 常量定义
// ========================================

/**
 * 默认持续时间（毫秒）
 */
const DEFAULT_DURATION = 3000

/**
 * 生成唯一 ID
 */
const generateId = () => `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// ========================================
// Store 创建
// ========================================
export const useToastStore = create<ToastState>()(
  devtools(
    (set, get) => ({
      // ========== Initial State ==========
      toasts: [],

      // ========== Actions ==========

      /**
       * 添加 Toast 通知
       */
      addToast: (toastData) => {
        const id = generateId()
        const toast: Toast = {
          id,
          createdAt: Date.now(),
          showProgress: true,
          persistent: true,
          ...toastData,
        }

        set((state) => ({
          toasts: [...state.toasts, toast]
        }))

        // 自动移除（如果设置了持续时间）
        if (toast.duration !== 0) {
          const duration = toast.duration ?? DEFAULT_DURATION
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }

        return id
      },

      /**
       * 移除 Toast 通知
       */
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      },

      /**
       * 清空所有通知
       */
      clearAll: () => {
        set({ toasts: [] })
      },

      // ========== 便捷方法 ==========

      /**
       * 显示成功通知
       */
      success: (message, options) => {
        return get().addToast({ type: 'success', message, ...options })
      },

      /**
       * 显示错误通知
       */
      error: (message, options) => {
        return get().addToast({ type: 'error', message, ...options })
      },

      /**
       * 显示警告通知
       */
      warning: (message, options) => {
        return get().addToast({ type: 'warning', message, ...options })
      },

      /**
       * 显示信息通知
       */
      info: (message, options) => {
        return get().addToast({ type: 'info', message, ...options })
      },
    }),
    { name: 'ToastStore' }
  )
)

// ========================================
// Selectors（可选，用于性能优化）
// ========================================
export const selectToasts = (state: ToastState) => state.toasts
