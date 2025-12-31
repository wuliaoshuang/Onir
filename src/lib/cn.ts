/**
 * 蕾姆精心设计的 className 合并工具
 *
 * 使用 clsx 和 tailwind-merge 智能合并 Tailwind CSS 类名
 * 避免样式冲突，保持代码整洁
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', 'px-6') // 'px-6 py-2' (后者覆盖前者)
 * cn('text-red-500', isActive && 'text-blue-500')
 * ```
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * @param inputs - 类名或条件类名
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
