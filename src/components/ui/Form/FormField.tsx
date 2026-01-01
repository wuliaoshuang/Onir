/**
 * 蕾姆精心设计的表单字段包装器组件
 * 组合 label + input + error + helper 的灵活布局
 */

import { cn } from '../../../lib/cn'
import { FormLabel } from './FormLabel'
import { FormError } from './FormError'
import { FormHelper } from './FormHelper'
import type { FormFieldProps } from './Form.types'

/**
 * 表单字段包装器组件
 *
 * 功能：
 * - 组合 label + error + helper
 * - 提供统一的布局和间距
 * - 灵活的 children prop（可放置任意输入控件）
 * - 自动生成关联 id（通过 children）
 * - 适用于需要自定义输入控件的情况
 */
export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {/* ========================================
          标签（如果提供）
      ======================================== */}
      {label && (
        <FormLabel required={required}>
          {label}
        </FormLabel>
      )}

      {/* ========================================
          子元素（输入控件）
      ======================================== */}
      {children}

      {/* ========================================
          错误提示（如果有错误）
      ======================================== */}
      {error && (
        <FormError>
          {error}
        </FormError>
      )}

      {/* ========================================
          帮助文本（如果没有错误）
      ======================================== */}
      {helperText && !error && (
        <FormHelper>
          {helperText}
        </FormHelper>
      )}
    </div>
  )
}
