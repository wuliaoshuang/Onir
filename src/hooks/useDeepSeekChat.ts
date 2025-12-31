/**
 * 蕾姆精心设计的 DeepSeek 聊天 Hook
 * 封装聊天逻辑，简化组件使用
 */

import { useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useApiKeyStore } from '../stores/apiKeyStore'
import { DeepSeekClient } from '../services/deepseek'

/**
 * DeepSeek 聊天 Hook
 *
 * @example
 * const { sendMessage, isGenerating } = useDeepSeekChat()
 * await sendMessage('你好，蕾姆！')
 */
export function useDeepSeekChat() {
  const {
    addMessage,
    startStreamingMessage,
    updateStreamingContent,
    completeStreamingMessage,
    isGenerating,
  } = useChatStore()

  const { apiKey } = useApiKeyStore()

  // 获取当前对话的消息历史
  const messages = useChatStore((state) =>
    state.conversations.find((c) => c.id === state.activeConversationId)?.messages || []
  )

  /**
   * 发送消息并处理流式响应
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      // 检查 API Key
      if (!apiKey) {
        throw new Error('请先配置 API Key')
      }

      // 添加用户消息
      addMessage('user', userMessage)

      // 开始流式消息
      const assistantMessageId = startStreamingMessage()
      let accumulatedContent = ''

      try {
        // 创建 DeepSeek 客户端
        const client = new DeepSeekClient(apiKey)

        // 准备消息历史（排除系统消息和当前正在生成的消息）
        const messageHistory = messages
          .filter((m) => m.role !== 'system' && m.content)
          .map((m) => ({ role: m.role, content: m.content }))

        // 发起流式请求
        await client.chat(
          messageHistory,
          {
            onChunk: (chunk) => {
              // 累积内容并更新 UI
              accumulatedContent += chunk
              updateStreamingContent(assistantMessageId, accumulatedContent)
            },
            onComplete: () => {
              // 完成流式消息
              completeStreamingMessage(assistantMessageId)
            },
            onError: (error) => {
              // 错误处理
              console.error('生成失败:', error)
              const errorMessage = accumulatedContent
                ? `${accumulatedContent}\n\n生成失败：${error.message}`
                : `生成失败：${error.message}`
              updateStreamingContent(assistantMessageId, errorMessage)
              completeStreamingMessage(assistantMessageId)
            },
          },
          {
            systemPrompt: '你是蕾姆，一个友好的 AI 助手。',
            temperature: 0.7,
          }
        )
      } catch (error) {
        // 异常处理
        console.error('发送消息失败:', error)
        const errorMessage = accumulatedContent
          ? `${accumulatedContent}\n\n生成失败：${(error as Error).message}`
          : `生成失败：${(error as Error).message}`
        updateStreamingContent(assistantMessageId, errorMessage)
        completeStreamingMessage(assistantMessageId)
      }
    },
    [apiKey, messages]
  )

  return {
    sendMessage,
    isGenerating,
    messages,
  }
}
