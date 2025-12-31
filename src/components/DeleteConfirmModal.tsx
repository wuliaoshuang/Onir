/**
 * 蕾姆精心设计的删除确认模态框
 * 用于确认删除自定义供应商，并显示不可删除的原因
 */

import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from './ui/Button'
import type { Provider } from '../types/apiKeys'

// ========================================
// 组件 Props
// ========================================
interface DeleteConfirmModalProps {
  provider: Provider
  canDelete: boolean
  reason?: string
  onConfirm: () => void
  onClose: () => void
}

// ========================================
// 主组件
// ========================================
export default function DeleteConfirmModal({
  provider,
  canDelete,
  reason,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  // 禁用背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 处理确认删除
  const handleConfirm = () => {
    if (canDelete) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================
            模态框头部
        ======================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            确认删除供应商
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f5f5f7] dark:hover:bg-black rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        </div>

        {/* ========================================
            模态框内容
        ======================================== */}
        <div className="p-6">
          {/* 警告图标 */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          {/* 确认消息 */}
          <div className="text-center mb-4">
            <p className="text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              确定要删除供应商吗？
            </p>
            <p className="text-[#86868b] dark:text-[#8e8e93]">
              即将删除 <strong className="text-primary-500">{provider.name}</strong>
            </p>
          </div>

          {/* 不可删除原因（如果存在） */}
          {!canDelete && reason && (
            <div className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
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

          {/* ========================================
              操作按钮
          ======================================== */}
          <div className="flex gap-3">
            {/* 取消按钮 */}
            <Button
              variant="secondary"
              display="block"
              onClick={onClose}
            >
              取消
            </Button>

            {/* 确认删除按钮 */}
            <Button
              variant="danger"
              display="block"
              onClick={handleConfirm}
              disabled={!canDelete}
            >
              确认删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
