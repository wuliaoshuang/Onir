/**
 * 蕾姆精心重构的全局对话框组件
 * 参考 shadcn/ui 设计，使用 Portal + Focus Trap + 统一状态管理
 *
 * 核心特性：
 * - ✅ Portal 渲染到 document.body（解决 Electron 层级问题）
 * - ✅ Focus Trap（焦点陷阱，防止 Tab 键逃逸）
 * - ✅ 统一 z-index (z-50)
 * - ✅ 正确的 body scroll 管理
 * - ✅ ESC 键关闭
 * - ✅ 点击遮罩层关闭
 * - ✅ ARIA 无障碍属性
 * - ✅ 平滑动画过渡
 *
 * @example
 * ```tsx
 * // 基础使用
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>确认删除</DialogTitle>
 *       <DialogDescription>确定要删除这个项目吗？</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter>
 *       <Button variant="secondary" onClick={() => setOpen(false)}>取消</Button>
 *       <Button variant="danger" onClick={handleDelete}>删除</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

import React, { useEffect, useRef, useCallback, ReactNode, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// ========================================
// 类型定义
// ========================================

export interface DialogProps {
  /** 是否显示对话框 */
  open?: boolean
  /** 状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 对话框内容 */
  children: ReactNode
  /** 点击遮罩层是否关闭（默认：true） */
  closeOnOverlayClick?: boolean
  /** 按 ESC 键是否关闭（默认：true） */
  closeOnEscape?: boolean
  /** 是否禁用背景滚动（默认：true） */
  disableBodyScroll?: boolean
}

export interface DialogContentProps {
  /** 对话框宽度（默认：md） */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** 自定义类名 */
  className?: string
  /** 内容是否在打开时自动聚焦（默认：true） */
  autoFocus?: boolean
  /** 对话框内容 */
  children: ReactNode
  /** 关闭回调 */
  onClose?: () => void
}

export interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

export interface DialogFooterProps {
  children: ReactNode
  className?: string
  /** 按钮对齐方式 */
  align?: 'start' | 'center' | 'end' | 'space-between'
}

export interface DialogTitleProps {
  children: ReactNode
  className?: string
}

export interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

export interface DialogCloseProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** 是否作为子元素渲染（不创建额外的 button 元素） */
  asChild?: boolean
}

// ========================================
// 常量配置
// ========================================

const Z_INDEX = 50 // 统一的 z-index

const sizeClasses = {
  sm: 'max-w-sm w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  xl: 'max-w-xl w-full',
  full: 'max-w-5xl w-full',
}

const footerAlignClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
}

// ========================================
// Body Scroll 管理器（单例模式）
// ========================================

class BodyScrollManager {
  private counter = 0
  private originalOverflow = ''

  lock() {
    this.counter++
    if (this.counter === 1) {
      this.originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
  }

  unlock() {
    this.counter--
    if (this.counter <= 0) {
      this.counter = 0
      document.body.style.overflow = this.originalOverflow
    }
  }
}

const scrollManager = new BodyScrollManager()

// ========================================
// Focus Trap Hook
// ========================================

function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive, containerRef])
}

// ========================================
// Dialog Root 组件
// ========================================

export function Dialog({
  open = false,
  onOpenChange,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  disableBodyScroll = true,
}: DialogProps) {
  const previousOpen = useRef(open)

  // 管理 body scroll
  useEffect(() => {
    if (disableBodyScroll) {
      if (open && !previousOpen.current) {
        scrollManager.lock()
      } else if (!open && previousOpen.current) {
        scrollManager.unlock()
      }
    }
    previousOpen.current = open
    return () => {
      if (disableBodyScroll && open) {
        scrollManager.unlock()
      }
    }
  }, [open, disableBodyScroll])

  // ESC 键处理
  useEffect(() => {
    if (!closeOnEscape || !open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, open, onOpenChange])

  // 点击遮罩层关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onOpenChange?.(false)
    }
  }, [closeOnOverlayClick, onOpenChange])

  if (!open) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-${Z_INDEX}`}
      onClick={handleOverlayClick}
      data-dialog-overlay
    >
      {/* 遮罩层 - 使用与 shadcn/ui 相同的动画方式 */}
      <div
        data-state={open ? 'open' : 'closed'}
        className="fixed inset-0 bg-black/60 backdrop-blur-md
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          duration-200"
      />

      {/* 对话框内容容器 */}
      {children}
    </div>,
    document.body
  )
}

// ========================================
// Dialog Content 组件
// ========================================

export function DialogContent({
  size = 'md',
  className = '',
  autoFocus = true,
  children,
  onClose,
}: DialogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // 焦点陷阱
  useFocusTrap(true, contentRef)

  // 自动聚焦第一个可聚焦元素
  useEffect(() => {
    if (autoFocus && contentRef.current) {
      const focusableElement = contentRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      focusableElement?.focus()
    }
  }, [autoFocus])

  // shadcn/ui 风格的样式类
  const baseClasses = "bg-white dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border shadow-lg p-6 outline-none"
  const positionClasses = "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4"
  const sizeClass = sizeClasses[size].replace('w-full', '') // 移除 w-full，因为已经设置了
  const animationClasses = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"

  return (
    <div
      ref={contentRef}
      data-state="open"
      className={`${positionClasses} ${sizeClass} ${baseClasses} ${animationClasses} ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {/* 关闭按钮 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-sm
            text-light-text-secondary dark:text-dark-text-secondary
            hover:bg-light-page dark:hover:bg-black
            transition-all opacity-70 hover:opacity-100"
          aria-label="关闭对话框"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* 内容区域 */}
      <div className="overflow-y-auto max-h-[90vh] -m-6">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ========================================
// Dialog Header 组件
// ========================================

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

// ========================================
// Dialog Footer 组件
// ========================================

export function DialogFooter({ children, className = '', align = 'end' }: DialogFooterProps) {
  return (
    <div className={`flex gap-3 ${footerAlignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

// ========================================
// Dialog Title 组件
// ========================================

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-light-text-primary dark:text-dark-text-primary ${className}`}>
      {children}
    </h2>
  )
}

// ========================================
// Dialog Description 组件
// ========================================

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-light-text-secondary dark:text-dark-text-secondary ${className}`}>
      {children}
    </p>
  )
}

// ========================================
// Dialog Close 组件
// ========================================

export function DialogClose({ children, className = '', onClick, asChild = false }: DialogCloseProps) {
  // asChild 模式：直接返回子元素，并合并 props
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement
    return React.cloneElement(child, {
      onClick: (e: MouseEvent) => {
        child.props.onClick?.(e)
        onClick?.()
      },
      className: `${child.props.className || ''} ${className}`.trim(),
    })
  }

  // 默认模式：创建 button
  return (
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  )
}

// ========================================
// Dialog Body 组件（内容容器）
// ========================================

export interface DialogBodyProps {
  children: ReactNode
  className?: string
}

export function DialogBody({ children, className = '' }: DialogBodyProps) {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  )
}

// ========================================
// 导出所有组件
// ========================================

Dialog.Content = DialogContent
Dialog.Header = DialogHeader
Dialog.Footer = DialogFooter
Dialog.Title = DialogTitle
Dialog.Description = DialogDescription
Dialog.Close = DialogClose
Dialog.Body = DialogBody

export default Dialog
