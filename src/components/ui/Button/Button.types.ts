/**
 * 蕾姆精心设计的 Button 组件类型定义
 *
 * 提供完整的 TypeScript 类型支持，确保类型安全
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

/**
 * Button 视觉变体
 * - primary: 主要操作按钮，使用主题色
 * - secondary: 次要操作按钮，灰色背景
 * - danger: 危险操作按钮，红色
 * - ghost: 幽灵按钮，透明背景带悬停效果
 * - icon: 图标按钮，只有图标
 */
export type ButtonVariant =
  | 'primary'      // 主操作按钮
  | 'secondary'    // 次要操作
  | 'danger'       // 危险操作（删除、取消等）
  | 'ghost'        // 幽灵按钮（透明背景）
  | 'icon'         // 图标按钮（只有图标）

/**
 * Button 尺寸
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button 显示模式
 * - inline: 自动宽度（默认）
 * - block: 响应式块级（小屏全宽，大屏自动）
 * - full-width: 始终全宽
 */
export type ButtonDisplay = 'inline' | 'block' | 'full-width'

/**
 * Button 形状（圆角）
 */
export type ButtonShape = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

/**
 * Button 组件 Props 接口
 * 继承原生 button 元素的所有属性
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /**
   * 视觉变体
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * 尺寸
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * 显示模式
   * @default 'inline'
   */
  display?: ButtonDisplay

  /**
   * 图标组件（来自 lucide-react）
   */
  icon?: LucideIcon

  /**
   * 图标位置（仅当有 icon 和 children 时有效）
   * @default 'left'
   */
  iconPosition?: 'left' | 'right'

  /**
   * 显示加载状态
   * @default false
   */
  loading?: boolean

  /**
   * 自定义加载动画组件
   */
  loadingSpinner?: ReactNode

  /**
   * 加载时禁用按钮
   * @default true
   */
  disableWhileLoading?: boolean

  /**
   * 自定义图标尺寸（像素）
   * 默认根据按钮 size 自动计算
   */
  iconSize?: number

  /**
   * 按钮形状（圆角大小）
   * @default 'lg' (大多数情况), 'sm' (icon按钮)
   */
  shape?: ButtonShape

  /**
   * 子元素内容
   */
  children?: ReactNode
}

/**
 * Icon-only Button 的 Props 接口
 * 强制要求 aria-label 以确保无障碍访问
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * 必须提供 aria-label 用于无障碍访问
   */
  'aria-label': string
}
