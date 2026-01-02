/**
 * 蕾姆精心重构的多供应商聊天 Hook
 * ✨ 修复严重 bug：现在根据模型名称使用正确的 API endpoint
 *
 * 修复内容：
 * - 之前：总是使用 DeepSeek API，不管选择什么模型
 * - 现在：根据模型名称查找对应供应商，使用正确的 API endpoint
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useApiKeyStore } from '../stores/apiKeyStore'
import { useUserSettingsStore, DEFAULT_PROMPT } from '../stores/userSettingsStore'
import { UniversalChatClient } from '../services/chat'
import { generateTitle } from '../services/titleGenerator'

// 🎯 蕾姆：默认模型
const DEFAULT_MODEL = 'deepseek-chat'

interface UseDeepSeekChatOptions {
  conversationId: string
}

interface UseDeepSeekChatResult {
  sendMessage: (userMessage: string) => Promise<void>
  abort: () => void
  isGenerating: boolean
  error: string | null
}

/**
 * DeepSeek 聊天 Hook
 *
 * @param conversationId - 会话 ID，每个会话独立管理状态
 * @example
 * const { sendMessage, abort, isGenerating } = useDeepSeekChat({ conversationId: 'conv_123' })
 */
export function useDeepSeekChat({ conversationId }: UseDeepSeekChatOptions): UseDeepSeekChatResult {
  // 🎯 蕾姆：本地状态，只用于 UI 反馈
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🎯 蕾姆：Store 方法
  const {
    addMessage,
    getConversation,
    setStreamingState,
    getStreamingState,
    updateStreamingContent,
    updateStreamingReasoning,  // 🎯 蕾姆：更新思考链内容
    abortConversationGeneration,
    getConversationModel,  // 🎯 蕾姆：获取对话的模型
    renameConversation,    // 🎯 蕾姆：重命名对话（用于标题生成）
    setTitleGenerating,    // 🎯 蕾姆：设置标题生成状态
    setTitleGenerated,     // 🎯 蕾姆：标记标题生成完成
  } = useChatStore()

  const { getModelCredentials } = useApiKeyStore()
  const { systemPrompt } = useUserSettingsStore()  // 🎯 蕾姆：获取用户自定义提示词

  // 🎯 蕾姆：组件卸载时清理
  useEffect(() => {
    return () => {
      // 如果当前会话正在生成，取消它
      const streamingState = getStreamingState(conversationId)
      if (streamingState?.status === 'generating') {
        abortConversationGeneration(conversationId)
      }
    }
  }, [conversationId, getStreamingState, abortConversationGeneration])

  /**
   * 发送消息并处理流式响应
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      // 🎯 蕾姆：获取对话的模型或使用默认模型
      const conversationModel = getConversationModel(conversationId)
      const model = conversationModel || DEFAULT_MODEL

      // 🎯 蕾姆修复：根据模型名称获取正确的 API endpoint 和 Key
      const credentials = getModelCredentials(model)
      if (!credentials) {
        throw new Error(`找不到模型 "${model}" 对应的供应商配置，请检查供应商是否已配置 API Key`)
      }

      console.log('🔍 蕾姆调试：使用模型 =', model, ', 供应商 =', credentials.providerId)

      // 🎯 蕾姆：清理之前的请求
      const streamingState = getStreamingState(conversationId)
      if (streamingState?.status === 'generating' && streamingState.abortController) {
        streamingState.abortController.abort()
      }

      // 1. 添加用户消息
      addMessage(conversationId, 'user', userMessage)

      // 🎯 蕾姆：标题生成 - 检查是否需要生成标题
      const conversation = getConversation(conversationId)
      const shouldGenerateTitle = conversation && !conversation.hasGeneratedTitle

      if (shouldGenerateTitle && conversation) {
        // 这是第一条用户消息，异步生成标题
        setTitleGenerating(conversationId, true)

        // 使用模型的 credentials 来生成标题
        generateTitle(userMessage, {
          apiKey: credentials.apiKey,
          baseUrl: credentials.baseUrl,
          providerId: credentials.providerId,
          model,
        })
          .then((title) => {
            if (title) {
              renameConversation(conversationId, title)
            }
            setTitleGenerated(conversationId)
          })
          .catch((err) => {
            console.warn('标题生成失败:', err)
            // 失败时也标记为已生成，避免重复尝试
            setTitleGenerated(conversationId)
          })
      }

      // 2. 创建助手消息并获取 ID
      const assistantMessageId = addMessage(conversationId, 'assistant', '')

      // 3. 创建 AbortController
      const abortController = new AbortController()

      // 4. 设置流式状态
      setStreamingState(conversationId, {
        status: 'generating',
        messageId: assistantMessageId,
        abortController,
        error: null,
      })

      setIsGenerating(true)
      setError(null)

      try {
        // 5. 获取会话和消息历史
        const conversation = getConversation(conversationId)
        if (!conversation) {
          throw new Error('会话不存在')
        }

        // 🎯 蕾姆调试：打印完整消息列表
        console.log('🔍 蕾姆调试：完整消息列表 =', JSON.stringify(conversation.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content.slice(0, 50) + (m.content.length > 50 ? '...' : ''),
          contentLength: m.content.length
        })), null, 2))

        // 🎯 蕾姆修复：正确的消息过滤逻辑
        // - 排除 system 角色
        // - 只包含有内容的消息（content.length > 0）
        // - 排除当前正在生成的空消息
        const messageHistory = conversation.messages
          .filter((m) => {
            const kept = m.role !== 'system' && m.content.length > 0 && m.id !== assistantMessageId
            if (!kept && m.id !== assistantMessageId) {
              console.log('🔍 蕾姆调试：过滤掉消息', { id: m.id, role: m.role, contentLength: m.content.length, reason: m.role === 'system' ? 'system' : m.content.length === 0 ? 'empty' : 'unknown' })
            }
            return kept
          })
          .map((m) => ({ role: m.role, content: m.content }))

        // 🎯 蕾姆：获取对话的模型或使用默认模型
        const conversationModel = getConversationModel(conversationId)
        const model = conversationModel || DEFAULT_MODEL

        // 🎯 蕾姆调试：打印消息历史
        console.log('🔍 蕾姆调试：发送消息历史 =', JSON.stringify(messageHistory, null, 2))
        console.log('🔍 蕾姆调试：系统提示词 =', systemPrompt || DEFAULT_PROMPT)
        console.log('🔍 蕾姆调试：使用模型 =', model)

        // 🎯 蕾姆修复：根据模型名称获取正确的 API endpoint 和 Key
        const credentials = getModelCredentials(model)
        if (!credentials) {
          throw new Error(`找不到模型 "${model}" 对应的供应商配置，请检查供应商是否已配置 API Key`)
        }

        console.log('🔍 蕾姆调试：使用供应商 =', credentials.providerId, ', baseUrl =', credentials.baseUrl)

        // 6. 创建通用聊天客户端并发起请求
        const client = new UniversalChatClient({
          apiKey: credentials.apiKey,
          baseUrl: credentials.baseUrl,
          providerId: credentials.providerId,
        })

        // 🎯 蕾姆：打字机效果状态
        let accumulatedContent = ''
        let displayedContent = ''  // 实际显示的内容（逐字增加）
        let accumulatedReasoning = ''
        let displayedReasoning = ''  // 🎯 蕾姆：思考内容显示
        let typewriterTimer: ReturnType<typeof setTimeout> | null = null
        let reasoningTimer: ReturnType<typeof setTimeout> | null = null  // 🎯 蕾姆：思考打字机定时器

        // 🎯 蕾姆：平滑打字机效果函数（正文）
        const enqueueTypewriter = (newContent: string) => {
          // 清除之前的定时器
          if (typewriterTimer) {
            clearTimeout(typewriterTimer)
          }

          const targetLength = newContent.length
          let currentIndex = displayedContent.length

          // 如果新内容比显示内容短（不应该发生，但防御性编程）
          if (targetLength < currentIndex) {
            displayedContent = newContent
            updateStreamingContent(conversationId, assistantMessageId, displayedContent)
            return
          }

          // 🎯 蕾姆：每次增加至少一个字符，速度根据剩余内容动态调整
          const typeNextChar = () => {
            if (currentIndex < targetLength) {
              // 计算本次要输出的字符数：剩余越多，输出越快
              const remaining = targetLength - currentIndex
              let charsToAdd = 1

              if (remaining > 100) {
                charsToAdd = Math.min(15, Math.floor(remaining / 10))
              } else if (remaining > 50) {
                charsToAdd = Math.min(8, Math.floor(remaining / 8))
              } else if (remaining > 20) {
                charsToAdd = Math.min(4, Math.floor(remaining / 5))
              }

              currentIndex = Math.min(currentIndex + charsToAdd, targetLength)
              displayedContent = newContent.slice(0, currentIndex)
              updateStreamingContent(conversationId, assistantMessageId, displayedContent)

              // 继续下一个字符，延迟动态调整
              const delay = remaining > 50 ? 10 : remaining > 20 ? 20 : 30
              typewriterTimer = setTimeout(typeNextChar, delay)
            }
          }

          typeNextChar()
        }

        // 🎯 蕾姆：思考内容打字机效果函数
        const enqueueReasoningTypewriter = (newContent: string) => {
          // 清除之前的定时器
          if (reasoningTimer) {
            clearTimeout(reasoningTimer)
          }

          const targetLength = newContent.length
          let currentIndex = displayedReasoning.length

          if (targetLength < currentIndex) {
            displayedReasoning = newContent
            updateStreamingReasoning(conversationId, assistantMessageId, displayedReasoning)
            return
          }

          // 🎯 蕾姆：思考内容打字机效果 - 稍微快一点
          const typeNextChar = () => {
            if (currentIndex < targetLength) {
              const remaining = targetLength - currentIndex
              let charsToAdd = 1

              // 思考内容输出速度稍快
              if (remaining > 200) {
                charsToAdd = Math.min(20, Math.floor(remaining / 8))
              } else if (remaining > 100) {
                charsToAdd = Math.min(12, Math.floor(remaining / 10))
              } else if (remaining > 50) {
                charsToAdd = Math.min(6, Math.floor(remaining / 6))
              }

              currentIndex = Math.min(currentIndex + charsToAdd, targetLength)
              displayedReasoning = newContent.slice(0, currentIndex)
              updateStreamingReasoning(conversationId, assistantMessageId, displayedReasoning)

              // 思考内容延迟更短
              const delay = remaining > 50 ? 5 : remaining > 20 ? 10 : 15
              reasoningTimer = setTimeout(typeNextChar, delay)
            }
          }

          typeNextChar()
        }

        await client.chat(
          messageHistory,
          {
            onChunk: (chunk) => {
              accumulatedContent += chunk
              // 使用打字机效果输出
              enqueueTypewriter(accumulatedContent)
            },
            // 🎯 蕾姆：处理思考链内容（推理模型的思考过程）
            onReasoningChunk: (chunk) => {
              accumulatedReasoning += chunk
              // 🎯 蕾姆：思考内容也使用打字机效果
              enqueueReasoningTypewriter(accumulatedReasoning)
            },
            onComplete: () => {
              // 🎯 蕾姆：完成时立即显示所有剩余内容
              if (typewriterTimer) {
                clearTimeout(typewriterTimer)
              }
              if (reasoningTimer) {
                clearTimeout(reasoningTimer)
              }
              if (accumulatedContent !== displayedContent) {
                displayedContent = accumulatedContent
                updateStreamingContent(conversationId, assistantMessageId, displayedContent)
              }
              // 🎯 蕾姆：完成时显示所有剩余思考内容
              if (accumulatedReasoning !== displayedReasoning) {
                displayedReasoning = accumulatedReasoning
                updateStreamingReasoning(conversationId, assistantMessageId, displayedReasoning)
              }

              setStreamingState(conversationId, {
                status: 'completed',
                messageId: assistantMessageId,
                abortController: null,
              })
              setIsGenerating(false)
            },
            onError: (err) => {
              const errorMsg = accumulatedContent
                ? `${accumulatedContent}\n\n生成失败：${err.message}`
                : `生成失败：${err.message}`
              updateStreamingContent(conversationId, assistantMessageId, errorMsg)
              setStreamingState(conversationId, {
                status: 'error',
                messageId: assistantMessageId,
                abortController: null,
                error: err.message,
              })
              setError(err.message)
              setIsGenerating(false)
            },
          },
          {
            systemPrompt: systemPrompt || DEFAULT_PROMPT,  // 🎯 蕾姆：使用用户自定义提示词
            temperature: 0.7,
            model,  // 🎯 蕾姆：使用选中的模型
          }
        )
      } catch (err) {
        const errorObj = err as Error
        // 忽略 AbortError（用户主动取消）
        if (errorObj.name !== 'AbortError') {
          const conversation = getConversation(conversationId)
          const streamingState = getStreamingState(conversationId)

          if (conversation && streamingState?.messageId) {
            const errorMsg = `生成失败：${errorObj.message}`
            updateStreamingContent(conversationId, streamingState.messageId, errorMsg)
          }

          setStreamingState(conversationId, {
            status: 'error',
            messageId: streamingState?.messageId || null,
            abortController: null,
            error: errorObj.message,
          })
          setError(errorObj.message)
        }
        setIsGenerating(false)
      }
    },
    [conversationId, getModelCredentials, addMessage, getConversation, getConversationModel, setStreamingState, getStreamingState, updateStreamingContent, updateStreamingReasoning, abortConversationGeneration, renameConversation, setTitleGenerating, setTitleGenerated, systemPrompt]
  )

  /**
   * 取消当前会话的生成
   */
  const abort = useCallback(() => {
    abortConversationGeneration(conversationId)
    setIsGenerating(false)
    setError(null)
  }, [conversationId, abortConversationGeneration])

  return {
    sendMessage,
    abort,
    isGenerating,
    error,
  }
}
