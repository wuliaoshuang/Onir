/**
 * UI 组件库统一导出
 *
 * 蕾姆精心设计的组件库，提供开箱即用的高质量组件
 *
 * @example
 * ```tsx
 * // 从统一入口导入
 * import { Button, Toggle } from '@/components/ui'
 * import type { ButtonProps, ToggleProps } from '@/components/ui'
 *
 * // 或者从子模块导入
 * import { Button } from '@/components/ui/Button'
 * import { Toggle } from '@/components/ui/Toggle'
 * ```
 */

// ========================================
// Button 组件
// ========================================
export { Button, IconButton } from './Button'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonDisplay,
  ButtonShape,
  IconButtonProps,
} from './Button'

// ========================================
// Toggle 组件
// ========================================
export { Toggle } from './Toggle'
export type {
  ToggleProps,
  ToggleSize,
  ToggleColor,
} from './Toggle'
