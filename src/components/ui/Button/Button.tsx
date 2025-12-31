/**
 * 蕾姆精心设计的通用 Button 组件
 *
 * 特性：
 * - 5种视觉变体（primary, secondary, danger, ghost, icon）
 * - 5种尺寸（xs, sm, md, lg, xl）
 * - 完整的主题色支持（自动适配5种主题色）
 * - 响应式设计（亮色/深色模式）
 * - Loading 状态支持
 * - 图标支持（左右位置可选）
 * - 完整的无障碍支持（WCAG 2.1 AA）
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Button>Click me</Button>
 *
 * // 带图标
 * <Button variant="primary" icon={Send} iconPosition="left">
 *   Send Message
 * </Button>
 *
 * // 加载状态
 * <Button loading={isLoading}>Submit</Button>
 *
 * // 图标按钮
 * <Button variant="icon" icon={Settings} aria-label="Settings" />
 * ```
 */

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { buttonVariants } from './Button.variants'
import type { ButtonProps } from './Button.types'

/**
 * Button 组件
 *
 * 蕾姆精心设计的通用按钮，支持所有常见的按钮样式和交互模式
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      display = 'inline',
      shape,
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      loadingSpinner,
      disableWhileLoading = true,
      iconSize,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 判断按钮是否应该禁用
    const isDisabled = disabled || (loading && disableWhileLoading)

    // 根据按钮尺寸计算图标尺寸
    // 图标尺寸略大于字体大小，确保视觉平衡
    const getIconSize = () => {
      if (iconSize) return iconSize
      const sizeMap = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }
      return sizeMap[size]
    }

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            display,
            shape: shape || (variant === 'icon' ? 'sm' : 'lg'),
            loading,
          }),
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading Spinner - 绝对定位居中 */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            {loadingSpinner || (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </span>
        )}

        {/* 图标按钮模式（variant="icon" 且没有 children） */}
        {variant === 'icon' && !children && Icon && !loading && (
          <Icon
            className="w-4 h-4"
            style={{ fontSize: `${getIconSize()}px` }}
          />
        )}

        {/* 带文字的按钮模式 */}
        {children && (
          <>
            {/* 左侧图标 */}
            {Icon && iconPosition === 'left' && !loading && (
              <Icon
                className="w-4 h-4"
                style={{ fontSize: `${getIconSize()}px` }}
              />
            )}

            {/* 按钮内容 - 加载时隐藏 */}
            <span className={loading ? 'invisible' : ''}>
              {children}
            </span>

            {/* 右侧图标 */}
            {Icon && iconPosition === 'right' && !loading && (
              <Icon
                className="w-4 h-4"
                style={{ fontSize: `${getIconSize()}px` }}
              />
            )}
          </>
        )}
      </button>
    )
  }
)

/**
 * 组件显示名称（用于 React DevTools）
 */
Button.displayName = 'Button'

/**
 * IconButton 便捷组件
 *
 * 专门用于图标按钮，强制要求 aria-label 以确保无障碍访问
 *
 * @example
 * ```tsx
 * <IconButton icon={Settings} aria-label="打开设置" />
 * <IconButton icon={Trash} aria-label="删除" variant="danger" />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'icon', size = 'md', ...props }, ref) => {
    // 如果没有提供 aria-label，在开发环境中发出警告
    if (!props['aria-label']) { 
      console.warn(
        'IconButton requires aria-label for accessibility. ' +
        'Please provide a descriptive aria-label prop.'
      )
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        {...props}
      />
    )
  }
)

/**
 * 组件显示名称
 */
IconButton.displayName = 'IconButton'
