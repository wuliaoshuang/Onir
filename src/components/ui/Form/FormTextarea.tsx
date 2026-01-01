/**
 * 蕾姆精心设计的表单多行文本框组件
 * 支持多行输入、可控调整大小的文本域
 */

import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/cn'
import { FormLabel } from './FormLabel'
import { FormError } from './FormError'
import { FormHelper } from './FormHelper'
import type { FormTextareaProps } from './Form.types'

/**
 * 表单多行文本框组件
 *
 * 功能：
 * - 内置 label、error、helper 渲染
 * - 支持 3 种尺寸 (sm/md/lg)
 * - 支持错误状态
 * - 可控调整大小 (resize)
 * - 可设置行数 (rows)
 * - onChange 简化（自动提取 value）
 * - 完整的深色模式
 * - 无障碍支持（自动生成 id）
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({
    value,
    onChange,
    placeholder,
    disabled = false,
    readOnly = false,
    maxLength,
    rows = 3,
    minRows,
    maxRows,
    resize = 'none',
    label,
    required = false,
    error,
    helperText,
    size = 'md',
    id,
    name,
    autoFocus = false,
    className,
    textareaClassName,
    ...props
  }, ref) => {
    // 自动生成唯一 id
    const textareaId = id || useId()

    // ========================================
    // 尺寸样式配置
    // ========================================
    const sizeStyles = {
      sm: 'px-3 py-2 text-[12px]',
      md: 'px-4 py-3 text-[13px]',
      lg: 'px-5 py-4 text-[14px]',
    }

    // ========================================
    // 调整大小样式配置
    // ========================================
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }

    // ========================================
    // 基础样式配置
    // ========================================
    const baseStyles = [
      // 宽度和布局
      'w-full',
      // 背景色
      'bg-light-page dark:bg-dark-page',
      // 圆角
      'rounded-xl',
      // 边框
      'border-2',
      'border-transparent',
      // 文本颜色
      'text-light-text-primary dark:text-dark-text-primary',
      // 占位符颜色
      'placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary',
      // 过渡效果
      'transition-all',
      // 轮廓
      'outline-none',
      // 禁用状态
      disabled && 'opacity-50 cursor-not-allowed',
      // 只读状态
      readOnly && 'cursor-default',
    ]

    // 焦点和错误状态样式
    const focusStyles = error
      ? [
          // 错误状态：红色边框和阴影
          'border-red-500',
          'focus:ring-2',
          'focus:ring-red-500/50',
        ]
      : [
          // 正常状态：主题色边框和阴影
          'focus:border-primary-500',
          'focus:ring-2',
          'focus:ring-primary-500/50',
        ]

    return (
      <div className={cn('space-y-1.5', className)}>
        {/* ========================================
            标签（如果提供）
        ======================================== */}
        {label && (
          <FormLabel htmlFor={textareaId} required={required}>
            {label}
          </FormLabel>
        )}

        {/* ========================================
            多行文本框元素
        ======================================== */}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          rows={rows}
          autoFocus={autoFocus}
          className={cn(
            // 尺寸样式
            sizeStyles[size],
            // 调整大小样式
            resizeStyles[resize],
            // 基础样式
            ...baseStyles,
            // 焦点/错误样式
            ...focusStyles,
            // 自定义类名
            textareaClassName
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {/* ========================================
            错误提示（如果有错误）
        ======================================== */}
        {error && (
          <FormError id={`${textareaId}-error`}>
            {error}
          </FormError>
        )}

        {/* ========================================
            帮助文本（如果没有错误）
        ======================================== */}
        {helperText && !error && (
          <FormHelper id={`${textareaId}-helper`}>
            {helperText}
          </FormHelper>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
