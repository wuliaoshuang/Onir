/**
 * 蕾姆精心设计的 Toast 通知系统类型定义
 * 全局通知系统的类型安全保证
 */

/**
 * Toast 通知类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast 显示位置
 */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

/**
 * 单个 Toast 通知
 */
export interface Toast {
  id: string                          // 唯一标识
  type: ToastType                     // 通知类型
  message: string                     // 消息内容
  duration?: number                   // 持续时间（毫秒），0 表示不自动关闭
  position?: ToastPosition            // 显示位置
  showProgress?: boolean              // 是否显示进度条
  persistent?: boolean                // 是否在鼠标悬停时暂停倒计时
  createdAt: number                   // 创建时间戳
}

/**
 * Toast Store 状态
 */
export interface ToastState {
  toasts: Toast[]                     // 当前显示的通知列表

  // ========== Actions ==========

  /**
   * 添加通知
   */
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string

  /**
   * 移除通知
   */
  removeToast: (id: string) => void

  /**
   * 清空所有通知
   */
  clearAll: () => void

  // ========== 便捷方法 ==========

  /**
   * 显示成功通知
   */
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => string

  /**
   * 显示错误通知
   */
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => string

  /**
   * 显示警告通知
   */
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => string

  /**
   * 显示信息通知
   */
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => string
}

/**
 * Toast 组件 Props
 */
export interface ToastComponentProps {
  toast: Toast                        // Toast 数据
  onClose: (id: string) => void       // 关闭回调
  onPause?: (id: string) => void      // 暂停回调
  onResume?: (id: string) => void     // 恢复回调
}
