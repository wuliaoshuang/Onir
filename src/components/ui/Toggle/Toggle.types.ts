/**
 * 蕾姆精心设计的 Toggle 组件类型定义
 *
 * 提供完整的 TypeScript 类型支持，确保类型安全
 */

import type { HTMLAttributes } from 'react'

/**
 * Toggle 尺寸变体
 *
 * 映射到现有代码中的三种尺寸：
 * - sm: w-10 h-6 (NetworkPage.tsx:202)
 * - md: w-14 h-8 (ThemeSettingsPanel.tsx:208)
 * - lg: w-16 h-10 (大尺寸变体，未来扩展)
 */
export type ToggleSize = 'sm' | 'md' | 'lg'

/**
 * Toggle 颜色主题
 *
 * 支持多种语义化颜色
 */
export type ToggleColor =
  | 'primary'    // 主题色（默认）
  | 'success'    // 成功（绿色）
  | 'warning'    // 警告（黄色）
  | 'danger'     // 危险（红色）

/**
 * Toggle 组件 Props 接口
 * 继承原生 button 元素的所有属性（除了 onChange）
 */
export interface ToggleProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /**
   * 受控模式：当前选中状态
   * 如果提供此 prop，组件进入受控模式
   */
  checked?: boolean

  /**
   * 非受控模式：默认选中状态
   * 仅在非受控模式下生效
   * @default false
   */
  defaultChecked?: boolean

  /**
   * 状态变化回调
   * @param checked - 新的选中状态
   */
  onChange?: (checked: boolean) => void

  /**
   * 尺寸
   * @default 'md'
   */
  size?: ToggleSize

  /**
   * 颜色主题
   * @default 'primary'
   */
  color?: ToggleColor

  /**
   * 禁用开关
   * @default false
   */
  disabled?: boolean

  /**
   * 辅助标签文本
   * 用于无障碍访问和显示
   */
  label?: string

  /**
   * 是否显示标签文本
   * @default false
   */
  showLabel?: boolean
}
