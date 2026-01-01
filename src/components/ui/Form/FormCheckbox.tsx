/**
 * 蕾姆精心设计的表单复选框组件
 * 统一的复选框样式，支持水平布局和多种尺寸
 */

import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/cn'
import { FormHelper } from './FormHelper'
import type { FormCheckboxProps } from './Form.types'

/**
 * 表单复选框组件
 *
 * 功能：
 * - 统一的复选框样式
 * - 支持 3 种尺寸 (sm/md/lg)
 * - 标签可选（无标签时仅显示复选框）
 * - 水平布局（复选框 + 标签）
 * - onChange 简化（自动提取 checked）
 * - 完整的深色模式
 * - 无障碍支持（自动生成 id）
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({
    checked,
    onChange,
    label,
    helperText,
    disabled = false,
    readOnly = false,
    size = 'md',
    id,
    name,
    autoFocus = false,
    className,
    containerClassName,
    ...props
  }, ref) => {
    // 自动生成唯一 id
    const checkboxId = id || useId()

    // ========================================
    // 尺寸样式配置
    // ========================================
    const sizeStyles = {
      sm: {
        checkbox: 'w-4 h-4',
        container: 'px-3 py-2',
        text: 'text-[12px]',
      },
      md: {
        checkbox: 'w-5 h-5',
        container: 'px-4 py-3',
        text: 'text-sm',
      },
      lg: {
        checkbox: 'w-6 h-6',
        container: 'px-5 py-4',
        text: 'text-base',
      },
    }

    const currentSize = sizeStyles[size]

    return (
      <div className={cn('space-y-1.5', className)}>
        {/* ========================================
            复选框容器（水平布局）
        ======================================== */}
        <div
          className={cn(
            'flex',
            'items-center',
            'gap-3',
            'bg-light-page dark:bg-dark-page',
            'rounded-xl',
            currentSize.container,
            disabled && 'opacity-50 cursor-not-allowed',
            containerClassName
          )}
        >
          {/* ========================================
              复选框元素
          ======================================== */}
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            className={cn(
              // 尺寸
              currentSize.checkbox,
              // 圆角
              'rounded',
              // 边框
              'border-2',
              'border-light-border dark:border-dark-border',
              // 颜色
              'text-primary-500',
              // 焦点环
              'focus:ring-2',
              'focus:ring-primary-500/50',
              'focus:ring-offset-0',
              // 过渡效果
              'transition-all',
              // 光标
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              // 只读状态
              readOnly && 'cursor-default'
            )}
            aria-describedby={
              helperText ? `${checkboxId}-helper` : undefined
            }
            {...props}
          />

          {/* ========================================
              标签（如果提供）
          ======================================== */}
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                // 字体大小
                currentSize.text,
                // 字体粗细
                'font-medium',
                // 颜色
                'text-light-text-primary dark:text-dark-text-primary',
                // 光标
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                // 选择禁用
                'select-none',
                // 过渡效果
                'transition-colors'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {/* ========================================
            帮助文本（如果提供）
        ======================================== */}
        {helperText && (
          <FormHelper id={`${checkboxId}-helper`}>
            {helperText}
          </FormHelper>
        )}
      </div>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'
