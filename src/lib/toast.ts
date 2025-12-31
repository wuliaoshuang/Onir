/**
 * 蕾姆精心设计的 Toast 工具对象
 * 可以在任何地方直接使用，无需 Hook
 *
 * 特别适合在异步函数、工具函数、事件处理器中使用
 *
 * @example
 * ```tsx
 * import { toast } from '../lib/toast'
 *
 * async function fetchData() {
 *   try {
 *     const data = await api.fetch()
 *     toast.success('数据加载成功')
 *     return data
 *   } catch (error) {
 *     toast.error('加载失败，请重试')
 *     throw error
 *   }
 * }
 * ```
 */

import { useToastStore } from '../stores/toastStore'

/**
 * Toast 工具对象
 * 提供静态方法风格的 API，可以直接调用
 */
export const toast = {
  /**
   * 显示成功通知
   */
  success: (message: string, options?: any) => {
    return useToastStore.getState().success(message, options)
  },

  /**
   * 显示错误通知
   */
  error: (message: string, options?: any) => {
    return useToastStore.getState().error(message, options)
  },

  /**
   * 显示警告通知
   */
  warning: (message: string, options?: any) => {
    return useToastStore.getState().warning(message, options)
  },

  /**
   * 显示信息通知
   */
  info: (message: string, options?: any) => {
    return useToastStore.getState().info(message, options)
  },

  /**
   * 清空所有通知
   */
  clear: () => {
    useToastStore.getState().clearAll()
  },
}
