/**
 * 蕾姆精心设计的 Toast 便捷 Hook
 * 在组件中使用 Toast 的简洁方式
 */

import { useToastStore } from '../stores/toastStore'
import type { Toast } from '../types/toast'

/**
 * Toast 便捷 Hook
 *
 * 提供简洁的 API 用于触发 Toast 通知
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error, warning, info, clear } = useToast()
 *
 *   const handleClick = () => {
 *     success('操作成功！')
 *   }
 *
 *   return <button onClick={handleClick}>点击</button>
 * }
 * ```
 */
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast)
  const success = useToastStore((state) => state.success)
  const error = useToastStore((state) => state.error)
  const warning = useToastStore((state) => state.warning)
  const info = useToastStore((state) => state.info)
  const clearAll = useToastStore((state) => state.clearAll)

  return {
    /**
     * 显示自定义通知
     */
    show: (toast: Omit<Toast, 'id' | 'createdAt'>) => addToast(toast),

    /**
     * 显示成功通知
     */
    success,

    /**
     * 显示错误通知
     */
    error,

    /**
     * 显示警告通知
     */
    warning,

    /**
     * 显示信息通知
     */
    info,

    /**
     * 清空所有通知
     */
    clear: clearAll,
  }
}
