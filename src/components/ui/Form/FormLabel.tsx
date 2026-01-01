/**
 * 蕾姆精心设计的表单标签组件
 * 统一的标签样式，支持必填标记和无障碍访问
 */

import { cn } from '../../../lib/cn'
import type { FormLabelProps } from './Form.types'

/**
 * 表单标签组件
 *
 * 功能：
 * - 统一的标签样式
 * - 自动添加必填标记 (*)
 * - 支持无障碍关联 (htmlFor)
 * - 深色模式支持
 */
export function FormLabel({
  htmlFor,
  required = false,
  children,
  className,
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        // 基础样式
        'block',
        // 字体大小和粗细
        'text-sm',
        'font-medium',
        // 颜色
        'text-light-text-primary dark:text-dark-text-primary',
        // 间距
        'mb-2',
        // 自定义类名
        className
      )}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-0.5" aria-label="必填">
          *
        </span>
      )}
    </label>
  )
}
