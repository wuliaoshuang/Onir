/**
 * 蕾姆精心设计的流式消息组件
 * 支持打字机效果和实时 Markdown 渲染
 */

import { useEffect, useRef } from 'react'
import { MessageContent } from './MessageContent'

interface StreamingMessageProps {
  messageId: number
  content: string
  isStreaming?: boolean
}

export function StreamingMessage({
  messageId,
  content,
  isStreaming = false,
}: StreamingMessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (isStreaming && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [content, isStreaming])

  return (
    <div className="flex-1 relative pb-6">
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

      {/* 滚动锚点 */}
      <div ref={messagesEndRef} />
    </div>
  )
}
