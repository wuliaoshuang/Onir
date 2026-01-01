/**
 * 蕾姆精心设计的空状态引导组件
 *
 * 当用户没有会话时显示，引导用户开始使用
 * - 居中的图标和标题
 * - 两个主要操作按钮
 * - 优雅的动画效果
 */
import { MessageSquare, Key, Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { useNavigate } from '@tanstack/react-router'

interface EmptyStateProps {
  /** 新建对话的回调函数 */
  onNewChat?: () => void
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  const navigate = useNavigate()

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat()
    } else {
      navigate({ to: '/conversation/new' })
    }
  }

  const handleGoToSettings = () => {
    navigate({ to: '/settings/providers' })
  }

  return (
    <div className="h-full flex items-center justify-center bg-light-page dark:bg-dark-page">
      <div className="text-center px-6">
        {/* 图标容器 - 带有渐变背景和动画 */}
        <div className="relative mb-8 inline-flex">
          {/* 背景光晕 */}
          <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full animate-pulse-slow" />

          {/* 图标外圈 */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-xl shadow-primary-500/30">
            <MessageSquare className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          开始新对话
        </h2>

        {/* 描述 */}
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-8 leading-relaxed">
          配置 AI 密钥后，即可开始与智能助手对话
        </p>

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* 新对话按钮 - 主按钮 */}
          <Button
            variant="primary"
            size="lg"
            icon={Plus}
            onClick={handleNewChat}
            className="w-full sm:w-auto min-w-[140px]"
          >
            新对话
          </Button>

          {/* 配置密钥按钮 - 次要按钮 */}
          <Button
            variant="secondary"
            size="lg"
            icon={Key}
            onClick={handleGoToSettings}
            className="w-full sm:w-auto min-w-[140px]"
          >
            配置 AI 密钥
          </Button>
        </div>

        {/* 底部提示 */}
        <p className="mt-8 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
          支持 DeepSeek、OpenAI 等多种 AI 提供商
        </p>
      </div>
    </div>
  )
}
