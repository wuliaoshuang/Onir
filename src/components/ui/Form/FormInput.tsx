/**
 * 蕾姆精心设计的表单输入框组件
 * 功能完整、类型安全的文本输入框
 */

import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/cn'
import { FormLabel } from './FormLabel'
import { FormError } from './FormError'
import { FormHelper } from './FormHelper'
import type { FormInputProps } from './Form.types'

/**
 * 表单输入框组件
 *
 * 功能：
 * - 内置 label、error、helper 渲染
 * - 支持 3 种尺寸 (sm/md/lg)
 * - 支持错误状态
 * - 支持左右图标
 * - onChange 简化（自动提取 value）
 * - 完整的深色模式
 * - 无障碍支持（自动生成 id）
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({
    value,
    onChange,
    type = 'text',
    placeholder,
    disabled = false,
    readOnly = false,
    maxLength,
    minLength,
    label,
    required = false,
    error,
    helperText,
    size = 'md',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    id,
    name,
    autoFocus = false,
    className,
    inputClassName,
    ...props
  }, ref) => {
    // 自动生成唯一 id
    const inputId = id || useId()

    // ========================================
    // 尺寸样式配置
    // ========================================
    const sizeStyles = {
      sm: 'px-3 py-2 text-[12px]',
      md: 'px-4 py-3 text-[13px]',
      lg: 'px-5 py-4 text-[14px]',
    }

    const iconSizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
    }

    // ========================================
    // 基础样式配置
    // ========================================
    const baseInputStyles = [
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
          <FormLabel htmlFor={inputId} required={required}>
            {label}
          </FormLabel>
        )}

        {/* ========================================
            输入框容器（用于图标布局）
        ======================================== */}
        <div className="relative">
          {/* 左侧图标 */}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon
                className={cn(
                  iconSizeStyles[size],
                  'text-light-text-secondary dark:text-dark-text-secondary'
                )}
              />
            </div>
          )}

          {/* ========================================
              输入框元素
          ======================================== */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            autoFocus={autoFocus}
            className={cn(
              // 尺寸样式
              sizeStyles[size],
              // 左右内边距调整（如果存在图标）
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              // 基础样式
              ...baseInputStyles,
              // 焦点/错误样式
              ...focusStyles,
              // 自定义输入框类名
              inputClassName
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* 右侧图标 */}
          {RightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                onRightIconClick && 'cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors'
              )}
              onClick={onRightIconClick}
            >
              <RightIcon
                className={cn(
                  iconSizeStyles[size],
                  'text-light-text-secondary dark:text-dark-text-secondary'
                )}
              />
            </div>
          )}
        </div>

        {/* ========================================
            错误提示（如果有错误）
        ======================================== */}
        {error && (
          <FormError id={`${inputId}-error`}>
            {error}
          </FormError>
        )}

        {/* ========================================
            帮助文本（如果没有错误）
        ======================================== */}
        {helperText && !error && (
          <FormHelper id={`${inputId}-helper`}>
            {helperText}
          </FormHelper>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
