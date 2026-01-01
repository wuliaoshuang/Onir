/**
 * 蕾姆精心设计的表单帮助文本组件
 * 显示表单字段的辅助说明信息
 */

import { cn } from '../../../lib/cn'
import type { FormHelperProps } from './Form.types'

/**
 * 表单帮助文本组件
 *
 * 功能：
 * - 统一的帮助文本样式
 * - 小字号显示
 * - 深色模式支持
 * - 用于显示提示、说明等信息
 */
export function FormHelper({ children, className }: FormHelperProps) {
  if (!children) {
    return null
  }

  return (
    <p
      className={cn(
        // 基础样式
        'text-[12px]',
        // 颜色
        'text-light-text-secondary dark:text-dark-text-secondary',
        // 间距
        'mt-1.5',
        // 自定义类名
        className
      )}
    >
      {children}
    </p>
  )
}
