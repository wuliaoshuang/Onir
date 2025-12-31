/**
 * 蕾姆精心设计的 Toast 容器组件
 * 管理所有 Toast 通知的显示位置和布局
 */

import { useToastStore } from '../stores/toastStore'
import Toast from './Toast'

/**
 * Toast 容器 - 管理所有 Toast 通知的显示位置
 *
 * 功能：
 * - 从 Store 读取所有通知
 * - 按创建时间排序（最新的在上）
 * - 根据第一个通知的位置设置容器位置
 * - 支持多个通知堆叠显示
 */
export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  // 没有通知时不渲染
  if (toasts.length === 0) return null

  // 按创建时间排序（最新的在上）
  const sortedToasts = [...toasts].sort((a, b) => b.createdAt - a.createdAt)

  // 获取第一个 Toast 的位置（统一使用相同位置）
  const position = toasts[0]?.position ?? 'top-right'

  // 位置映射
  const positionClasses: Record<string, string> = {
    'top-right': 'fixed top-4 right-4 z-[9999] flex flex-col gap-2',
    'top-left': 'fixed top-4 left-4 z-[9999] flex flex-col gap-2',
    'bottom-right': 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2',
    'bottom-left': 'fixed bottom-4 left-4 z-[9999] flex flex-col gap-2',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2',
  }

  return (
    <div className={positionClasses[position]}>
      {sortedToasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <Toast
            toast={toast}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )
}
