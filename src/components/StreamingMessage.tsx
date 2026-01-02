/**
 * 蕾姆精心设计的流式消息组件
 * 支持打字机效果和实时 Markdown 渲染
 *
 * 🎯 蕾姆修复：移除强制滚动逻辑
 * - 滚动行为由 ScrollableMessageList 统一管理
 * - 不再在这里强制 scrollIntoView，避免打断用户的浏览操作
 *
 * 🎯 蕾姆增强：支持思考链内容显示
 * - 推理模型的思考过程会显示在可折叠的区域中
 * - 正文出现后自动收起思考区域
 */

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Brain } from 'lucide-react'
import { MessageContent } from './MessageContent'

interface StreamingMessageProps {
  messageId: number
  content: string
  reasoning_content?: string  // 🎯 蕾姆：思考链内容
  isStreaming?: boolean
}

export function StreamingMessage({
  messageId,
  content,
  reasoning_content,
  isStreaming = false,
}: StreamingMessageProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)

  // 🎯 蕾姆：当正文有内容时，自动收起思考区域
  useEffect(() => {
    if (content.length > 0 && reasoning_content) {
      setIsReasoningExpanded(false)
    }
  }, [content.length, reasoning_content])

  return (
    <div className="flex-1 relative pb-6">
      {/* 🎯 蕾姆：思考链区域（推理模型的思考过程） */}
      {reasoning_content && (
        <div className="mb-4 rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/30 overflow-hidden">
          {/* 可折叠的标题栏 */}
          <button
            onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors duration-200"
          >
            {isReasoningExpanded ? (
              <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            )}
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-[13px] font-medium text-purple-700 dark:text-purple-300">
              思考过程
            </span>
            <span className="text-[11px] text-purple-500/70 dark:text-purple-400/70 ml-auto">
              {isReasoningExpanded ? '收起' : '展开'}
            </span>
          </button>

          {/* 可折叠的内容区 */}
          {isReasoningExpanded && (
            <div className="px-4 pb-3 pt-1 border-t border-purple-200/50 dark:border-purple-800/30">
              <div className="text-[13px] leading-relaxed text-purple-900/80 dark:text-purple-200/80 whitespace-pre-wrap">
                {reasoning_content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 消息内容 */}
      <div className="prose prose-sm max-w-none prose-p:break-words prose-a:break-words">
        <MessageContent content={content} />
      </div>

      {/* 流式生成指示器 */}
      {isStreaming && (
        <span className="inline-flex items-center gap-1 ml-2">
          <span className="w-1 h-1 bg-primary-500 rounded-full animate-pulse" />
          <span className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-150" />
        </span>
      )}
    </div>
  )
}
