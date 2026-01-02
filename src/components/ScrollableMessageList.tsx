/**
 * 蕾姆精心设计的可滚动消息列表组件
 * ✨ 基于哨兵模式（Sentinel Pattern）的智能滚动系统
 * 🎯 新增：消息淡进淡出动画
 *
 * 核心设计（参考 index2.html Demo）：
 * 1. 哨兵模式：使用 IntersectionObserver 监测底部哨兵元素是否在视口内
 * 2. 完全解耦：状态监测与滚动逻辑分离，避免竞态条件
 * 3. 不依赖手动计算：不使用 scrollTop/scrollHeight 计算，避免精度问题
 * 4. 性能优化：IntersectionObserver 运行在独立线程，不阻塞主线程
 *
 * 状态说明：
 * - isAtBottom: 哨兵元素是否可见（用户是否在底部）
 * - showScrollButton: 是否显示"回到底部"按钮
 */
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { MessageContent } from './MessageContent'
import { StreamingMessage } from './StreamingMessage'

interface Message {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ScrollableMessageListProps {
  messages: Message[]
  isGenerating: boolean
  copiedMessageId: number | null
  onCopyMessage: (id: number, content: string) => void
}

// 蕾姆：用于追踪是否是首次加载（首次需要强制滚动）
const isFirstLoadRef = { current: true }

export function ScrollableMessageList({
  messages,
  isGenerating,
  copiedMessageId,
  onCopyMessage,
}: ScrollableMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null) // 🎯 哨兵元素 Ref
  const prevFirstMessageIdRef = useRef<number | undefined>(undefined) // 🎯 追踪上一条消息 ID，用于检测对话切换

  // 🎯 核心状态：由 IntersectionObserver 控制
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // 🎯 蕾姆：内容淡入动画状态
  const [isVisible, setIsVisible] = useState(false)

  // 🎯 蕾姆：组件挂载后触发淡入动画
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 🎯 蕾姆：滚动到底部的函数
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      })
    }
  }, [])

  // ========================================================================
  // 1. 🎯 核心逻辑：哨兵监测 (IntersectionObserver)
  // ========================================================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting 为 true 表示哨兵在视口内 -> 用户在底部
        const atBottom = entry.isIntersecting
        setIsAtBottom(atBottom)

        // 如果不在底部，就显示悬浮按钮
        setShowScrollButton(!atBottom)
      },
      {
        root: scrollRef.current, // 监听滚动容器
        threshold: 0.1, // 只要出现一点点就算到底了
      }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // ========================================================================
  // 2. 🎯 核心逻辑：自动滚动 (Auto Scroll)
  // ========================================================================
  // 只有当 isAtBottom 为 true 时，才执行跟随
  // 如果用户向上滚动了，isAtBottom 变为 false，此处逻辑被短路
  useLayoutEffect(() => {
    if (isAtBottom && scrollRef.current) {
      const container = scrollRef.current
      // 使用 instant 瞬间跳到底部，避免高频输出时的动画延迟
      container.scrollTop = container.scrollHeight
    }
  }, [messages]) // 监听 messages 变化

  // ========================================================================
  // 3. 🎯 首次加载/切换对话时的处理
  // ========================================================================
  // 当对话切换时，重置状态并滚动到底部
  useEffect(() => {
    if (isFirstLoadRef.current) {
      scrollToBottom(false)
      isFirstLoadRef.current = false
      return
    }

    // 检测对话切换：当第一条消息的 id 变化时
    const firstMessageId = messages[0]?.id
    const prevFirstMessageId = prevFirstMessageIdRef.current

    if (prevFirstMessageId !== undefined && firstMessageId !== prevFirstMessageId) {
      // 对话切换了，强制滚动到底部并重置状态
      setIsAtBottom(true)
      setShowScrollButton(false)
      setTimeout(() => scrollToBottom(false), 0)
    }

    prevFirstMessageIdRef.current = firstMessageId
  }, [messages, scrollToBottom])

  // 🎯 蕾姆：手动点击"回到底部"按钮
  const scrollToBottomManual = useCallback(() => {
    scrollToBottom(true)
  }, [scrollToBottom])

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* 消息滚动区域 */}
      <div
        ref={scrollRef}
        className="flex-1 w-full overflow-y-auto bg-light-page dark:bg-dark-page h-full"
      >
        {/* 🎯 蕾姆：整体淡入动画包裹 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="py-2 max-w-3xl mx-auto px-4"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`group ${
                message.role === 'user' ? 'flex justify-end py-2' : 'py-3'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-1 relative pb-6">
                  {/* 流式消息组件（最后一条且正在生成） */}
                  {index === messages.length - 1 && isGenerating ? (
                    <StreamingMessage
                      messageId={message.id}
                      content={message.content}
                      reasoning_content={message.reasoning_content}  // 🎯 蕾姆：传递思考链内容
                      isStreaming={true}
                    />
                  ) : (
                    // 🎯 蕾姆：静态消息也可能有思考链内容
                    <StreamingMessage
                      messageId={message.id}
                      content={message.content}
                      reasoning_content={message.reasoning_content}
                      isStreaming={false}
                    />
                  )}

                  {/* 复制按钮 */}
                  <div className="absolute bottom-0 left-0 flex items-center gap-1">
                    <button
                      onClick={() => onCopyMessage(message.id, message.content)}
                      className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500"
                      title="复制"
                    >
                      {copiedMessageId === message.id ? (
                        <svg
                          className="w-3.5 h-3.5 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {message.role === 'user' && (
                <div className="flex justify-end">
                  <div className="relative group/bubble  w-full max-w-sm">
                    <div className="px-4 py-2.5 bg-primary-500 text-white rounded-xl rounded-br-md shadow-lg shadow-primary-500/20 overflow-hidden">
                      <p className="text-[15px] leading-[1.6] text-white whitespace-pre-wrap break-all">
                        {message.content}
                      </p>
                    </div>
                    <div className="absolute -bottom-6 right-0 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                      <button
                        onClick={() => onCopyMessage(message.id, message.content)}
                        className="p-1 bg-white dark:bg-dark-card rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
                        title="复制"
                      >
                        {copiedMessageId === message.id ? (
                          <svg
                            className="w-3 h-3 text-primary-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* --- 🎯 哨兵元素 (Sentinel) --- */}
          {/* 这是一个不可见的 1px 高度元素，用于 IntersectionObserver 监测 */}
          <div ref={sentinelRef} className="h-px w-full opacity-0 pointer-events-none" />
        </motion.div>
      </div>

      {/* 🎯 蕾姆：回到底部按钮 */}
      {showScrollButton && (
        <button
          onClick={scrollToBottomManual}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card shadow-lg border border-black/5 dark:border-white/10 rounded-full text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
        >
          <ArrowDown className="w-4 h-4" />
          回到底部
        </button>
      )}
    </div>
  )
}
