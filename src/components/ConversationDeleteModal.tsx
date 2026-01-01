/**
 * 蕾姆精心重构的会话删除确认模态框
 * ✨ 已迁移到新的 Dialog 系统，使用 Portal + Focus Trap
 *
 * 二次确认后完全清理会话（取消请求 + 清理状态）
 */

import { AlertCircle } from 'lucide-react'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from './ui/Dialog'

// ========================================
// 组件 Props
// ========================================
interface ConversationDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationTitle: string
  onConfirm: () => void
}

// ========================================
// 主组件
// ========================================
export function ConversationDeleteModal({
  open,
  onOpenChange,
  conversationTitle,
  onConfirm,
}: ConversationDeleteModalProps) {
  // 处理确认删除
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" onClose={() => onOpenChange(false)}>
        {/* 模态框头部 */}
        <DialogHeader>
          <DialogTitle>确认删除会话</DialogTitle>
        </DialogHeader>

        {/* 模态框内容 */}
        <DialogBody>
          {/* 警告图标 */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          {/* 确认消息 */}
          <div className="text-center mb-4">
            <p className="text-light-text-primary dark:text-dark-text-primary mb-2">
              确定要删除这个会话吗？
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              即将删除 <strong className="text-primary-500">{conversationTitle}</strong>
            </p>
          </div>

          {/* 蕾姆的温馨提示 */}
          <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <p className="text-sm text-blue-500 text-center">
              删除后无法恢复，如果该会话正在进行 AI 对话，也会被中断
            </p>
          </div>
        </DialogBody>

        {/* 操作按钮 */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" display="block">
              取消
            </Button>
          </DialogClose>

          <Button
            variant="danger"
            display="block"
            onClick={handleConfirm}
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
