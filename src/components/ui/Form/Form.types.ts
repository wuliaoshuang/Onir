/**
 * 蕾姆精心设计的表单组件类型定义
 * 统一的 TypeScript 类型系统，确保类型安全
 */

import type { ComponentType, ReactNode } from 'react'

// ========================================
// 基础组件 Props
// ========================================

/**
 * FormLabel 组件 Props
 */
export interface FormLabelProps {
  /** 关联的 input 元素 id */
  htmlFor?: string
  /** 是否为必填项（显示红色 *） */
  required?: boolean
  /** 标签内容 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * FormError 组件 Props
 */
export interface FormErrorProps {
  /** 错误信息内容 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * FormHelper 组件 Props
 */
export interface FormHelperProps {
  /** 帮助文本内容 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * FormField 组件 Props
 */
export interface FormFieldProps {
  /** 字段标签 */
  label?: string
  /** 是否为必填项 */
  required?: boolean
  /** 错误信息 */
  error?: string
  /** 帮助文本 */
  helperText?: string
  /** 字段内容 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
}

// ========================================
// FormInput 组件 Props
// ========================================

/**
 * 输入框尺寸
 */
export type FormInputSize = 'sm' | 'md' | 'lg'

/**
 * 输入框类型
 */
export type FormInputType = 'text' | 'email' | 'password' | 'url' | 'number'

/**
 * FormInput 组件 Props
 */
export interface FormInputProps {
  /** 输入框值（受控组件） */
  value: string
  /** 值变化回调（自动提取 event.target.value） */
  onChange: (value: string) => void

  /** 输入框类型 */
  type?: FormInputType
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number

  /** 字段标签 */
  label?: string
  /** 是否为必填项 */
  required?: boolean
  /** 错误信息 */
  error?: string
  /** 帮助文本 */
  helperText?: string

  /** 输入框尺寸 */
  size?: FormInputSize
  /** 左侧图标 */
  leftIcon?: ComponentType<{ className?: string }>
  /** 右侧图标 */
  rightIcon?: ComponentType<{ className?: string }>
  /** 右侧图标点击事件 */
  onRightIconClick?: () => void

  /** input 元素 id（自动生成如果未提供） */
  id?: string
  /** input 元素 name */
  name?: string
  /** 自动聚焦 */
  autoFocus?: boolean

  /** 自定义类名 */
  className?: string
  /** 输入框元素的自定义类名 */
  inputClassName?: string
}

// ========================================
// FormTextarea 组件 Props
// ========================================

/**
 * 调整大小方向
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

/**
 * FormTextarea 组件 Props
 */
export interface FormTextareaProps {
  /** 文本域值（受控组件） */
  value: string
  /** 值变化回调（自动提取 event.target.value） */
  onChange: (value: string) => void

  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 显示行数 */
  rows?: number
  /** 最小显示行数 */
  minRows?: number
  /** 最大显示行数 */
  maxRows?: number
  /** 调整大小方向 */
  resize?: TextareaResize

  /** 字段标签 */
  label?: string
  /** 是否为必填项 */
  required?: boolean
  /** 错误信息 */
  error?: string
  /** 帮助文本 */
  helperText?: string

  /** 输入框尺寸 */
  size?: FormInputSize

  /** textarea 元素 id（自动生成如果未提供） */
  id?: string
  /** textarea 元素 name */
  name?: string
  /** 自动聚焦 */
  autoFocus?: boolean

  /** 自定义类名 */
  className?: string
  /** textarea 元素的自定义类名 */
  textareaClassName?: string
}

// ========================================
// FormCheckbox 组件 Props
// ========================================

/**
 * FormCheckbox 组件 Props
 */
export interface FormCheckboxProps {
  /** 是否选中（受控组件） */
  checked: boolean
  /** 状态变化回调（自动提取 event.target.checked） */
  onChange: (checked: boolean) => void

  /** 复选框标签 */
  label?: string
  /** 帮助文本 */
  helperText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean

  /** 复选框尺寸 */
  size?: FormInputSize

  /** input 元素 id（自动生成如果未提供） */
  id?: string
  /** input 元素 name */
  name?: string
  /** 自动聚焦 */
  autoFocus?: boolean

  /** 自定义类名 */
  className?: string
  /** 复选框容器（包含 label）的自定义类名 */
  containerClassName?: string
}
