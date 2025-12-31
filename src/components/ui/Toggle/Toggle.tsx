/**
 * 蕾姆精心设计的 Toggle 组件
 *
 * 特性：
 * - 3种尺寸（sm, md, lg）精确映射现有代码
 * - 4种颜色主题（primary, success, warning, danger）
 * - 完整的主题色支持（自动适配5种主题色）
 * - 受控/非受控双模式
 * - 完整的无障碍支持（WCAG 2.1 AA）
 * - 丝滑的动画效果
 *
 * @example
 * ```tsx
 * // 基础用法（非受控）
 * <Toggle defaultChecked={false} onChange={setEnabled} />
 *
 * // 受控模式
 * <Toggle checked={enabled} onChange={setEnabled} />
 *
 * // 带标签
 * <Toggle checked={enabled} onChange={setEnabled} label="启用功能" showLabel />
 *
 * // 不同尺寸
 * <Toggle size="sm" checked={enabled} onChange={setEnabled} />
 * <Toggle size="md" checked={enabled} onChange={setEnabled} />
 * <Toggle size="lg" checked={enabled} onChange={setEnabled} />
 *
 * // 不同颜色
 * <Toggle color="success" checked={enabled} onChange={setEnabled} />
 * <Toggle color="warning" checked={enabled} onChange={setEnabled} />
 * <Toggle color="danger" checked={enabled} onChange={setEnabled} />
 * ```
 */

import { forwardRef, useState, useId } from 'react'
import { cn } from '../../../lib/cn'
import type { ToggleProps } from './Toggle.types'

/**
 * 尺寸配置
 *
 * 蕾姆精心设计的尺寸系统，精确映射到现有代码：
 * - sm: w-10 h-6 (NetworkPage.tsx:202)
 * - md: w-14 h-8 (ThemeSettingsPanel.tsx:208)
 * - lg: w-16 h-10 (未来扩展)
 */
const toggleSizes = {
  sm: {
    container: 'w-11 h-6',                    // 容器尺寸
    thumb: 'w-5 h-5',                         // 滑块尺寸
    thumbPosition: {
      checked: 'translate-x-5',               // 选中位置
      unchecked: 'translate-x-0',             // 未选中位置
    },
    thumbOffset: 'left-0.5 top-0.5',          // 滑块偏移
  },
  md: {
    container: 'w-14 h-8',                    // 容器尺寸
    thumb: 'w-6 h-6',                         // 滑块尺寸
    thumbPosition: {
      checked: 'left-7',                      // 选中位置（使用 left 而非 translate）
      unchecked: 'left-1',                    // 未选中位置
    },
    thumbOffset: 'top-1',                     // 滑块偏移
  },
  lg: {
    container: 'w-16 h-10',                   // 容器尺寸
    thumb: 'w-8 h-8',                         // 滑块尺寸
    thumbPosition: {
      checked: 'translate-x-6',               // 选中位置
      unchecked: 'translate-x-0',             // 未选中位置
    },
    thumbOffset: 'left-1 top-1',              // 滑块偏移
  },
}

/**
 * 颜色映射
 *
 * 使用 Tailwind 的完整颜色类，确保背景色正确显示
 */
const colorMap = {
  primary: {
    checked: 'bg-[var(--primary)]',          // 选中：主题色（动态）
    unchecked: 'bg-[var(--border)]',         // 未选中：边框色
  },
  success: {
    checked: 'bg-emerald-500',               // 选中：绿色
    unchecked: 'bg-gray-200 dark:bg-gray-700', // 未选中：灰色
  },
  warning: {
    checked: 'bg-amber-500',                 // 选中：黄色
    unchecked: 'bg-gray-200 dark:bg-gray-700', // 未选中：灰色
  },
  danger: {
    checked: 'bg-red-500',                   // 选中：红色
    unchecked: 'bg-gray-200 dark:bg-gray-700', // 未选中：灰色
  },
}

/**
 * Toggle 组件
 *
 * 蕾姆精心设计的开关组件，支持所有常见的开关交互模式
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      size = 'md',
      color = 'primary',
      disabled = false,
      label,
      showLabel = false,
      className,
      ...props
    },
    ref
  ) => {
    // ========================================
    // 状态管理
    // ========================================

    /**
     * 非受控模式：内部状态
     * 仅在没有提供 checked prop 时使用
     */
    const [internalChecked, setInternalChecked] = useState(defaultChecked)

    /**
     * 当前选中状态
     * 优先使用受控值，否则使用内部状态
     */
    const checked = controlledChecked ?? internalChecked

    /**
     * 生成唯一 ID
     * 用于无障碍访问（label 关联）
     */
    const toggleId = useId()

    // ========================================
    // 事件处理
    // ========================================

    /**
     * 处理开关切换
     */
    const handleToggle = () => {
      // 禁用状态不允许切换
      if (disabled) return

      // 计算新状态
      const newChecked = !checked

      // 更新非受控状态
      if (controlledChecked === undefined) {
        setInternalChecked(newChecked)
      }

      // 触发回调
      onChange?.(newChecked)
    }

    // ========================================
    // 样式计算
    // ========================================

    const sizeConfig = toggleSizes[size]
    const colorConfig = colorMap[color]
    const backgroundColor = checked ? colorConfig.checked : colorConfig.unchecked

    // ========================================
    // 渲染
    // ========================================

    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* 开关按钮 */}
        <button
          ref={ref}
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            // 基础样式
            'relative rounded-full transition-all duration-200',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-primary-500',
            'focus-visible:ring-offset-2',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            // 尺寸
            sizeConfig.container,
            // 背景色（根据选中状态）
            backgroundColor
          )}
          {...props}
        >
          {/* 滑块 */}
          <span
            className={cn(
              'absolute bg-white rounded-full shadow-md transition-all duration-200',
              sizeConfig.thumb,
              sizeConfig.thumbOffset,
              checked ? sizeConfig.thumbPosition.checked : sizeConfig.thumbPosition.unchecked
            )}
          />
        </button>

        {/* 标签（可选） */}
        {showLabel && label && (
          <label
            htmlFor={toggleId}
            className={cn(
              'text-sm font-medium text-[--text-primary]',
              'cursor-pointer',
              'select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && handleToggle()}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

/**
 * 组件显示名称（用于 React DevTools）
 */
Toggle.displayName = 'Toggle'
