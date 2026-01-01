/**
 * 蕾姆精心重构的删除确认模态框
 * ✨ 已迁移到新的 Dialog 系统，使用 Portal + Focus Trap
 *
 * 用于确认删除自定义供应商，并显示不可删除的原因
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
import type { Provider } from '../types/apiKeys'

// ========================================
// 组件 Props
// ========================================
interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: Provider
  canDelete: boolean
  reason?: string
  onConfirm: () => void
}

// ========================================
// 主组件
// ========================================
export default function DeleteConfirmModal({
  open,
  onOpenChange,
  provider,
  canDelete,
  reason,
  onConfirm,
}: DeleteConfirmModalProps) {
  // 处理确认删除
  const handleConfirm = () => {
    if (canDelete) {
      onConfirm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" onClose={() => onOpenChange(false)}>
        {/* ========================================
            模态框头部
        ======================================== */}
        <DialogHeader>
          <DialogTitle>确认删除供应商</DialogTitle>
        </DialogHeader>

        {/* ========================================
            模态框内容
        ======================================== */}
        <DialogBody>
          {/* 警告图标 */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          {/* 确认消息 */}
          <div className="text-center mb-4">
            <p className="text-light-text-primary dark:text-dark-text-primary mb-2">
              确定要删除供应商吗？
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              即将删除 <strong className="text-primary-500">{provider.name}</strong>
            </p>
          </div>

          {/* 不可删除原因（如果存在） */}
          {!canDelete && reason && (
            <div className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-500 mb-1">
                    无法删除
                  </p>
                  <p className="text-sm text-amber-500/80">{reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* 蕾姆的温馨提示 */}
          {canDelete && (
            <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm text-blue-500 text-center">
                此操作无法撤销，删除后需要重新添加才能使用
              </p>
            </div>
          )}
        </DialogBody>

        {/* ========================================
            操作按钮
        ======================================== */}
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
            disabled={!canDelete}
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
