/**
 * 蕾姆精心设计的表单错误提示组件
 * 显示表单验证错误信息
 */

import { cn } from '../../../lib/cn'
import type { FormErrorProps } from './Form.types'

/**
 * 表单错误提示组件
 *
 * 功能：
 * - 统一的错误提示样式
 * - 红色主题
 * - 深色模式支持
 * - 支持自定义内容
 */
export function FormError({ children, className }: FormErrorProps) {
  if (!children) {
    return null
  }

  return (
    <p
      className={cn(
        // 基础样式
        'text-sm',
        // 红色主题
        'text-red-500',
        // 间距
        'mt-1.5',
        // 自定义类名
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {children}
    </p>
  )
}
