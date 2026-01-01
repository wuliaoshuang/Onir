/**
 * 蕾姆精心设计的 DeepSeek IPC 通信 Hook
 * 通过 Electron IPC 与主进程通信，安全地调用 DeepSeek API
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useApiKeyStore } from '../stores/apiKeyStore'

interface DeepSeekIpcHookResult {
  sendMessage: (userMessage: string) => Promise<void>
  abort: () => void
  isGenerating: boolean
  error: string | null
}

/**
 * DeepSeek IPC 通信 Hook
 *
 * 通过 Electron IPC 在主进程中处理 API 请求，保证 API Key 安全
 *
 * @example
 * const { sendMessage, abort, isGenerating } = useDeepSeekIpc()
 * await sendMessage('你好，蕾姆！')
 */
export function useDeepSeekIpc(): DeepSeekIpcHookResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<number | null>(null)

  // 🎯 蕾姆：使用 ref 存储当前正在生成的消息 ID
  const assistantMessageIdRef = useRef<number | null>(null)
  // 🎯 蕾姆：使用 ref 存储累积的内容（chunk 是增量数据）
  const accumulatedContentRef = useRef<string>('')

  // Store hooks
  const { addMessage, updateStreamingContent } = useChatStore()
  const { getCurrentApiKey, isConfigured } = useApiKeyStore()

  // 获取当前对话的消息历史
  const messages = useChatStore((state) =>
    state.conversations.find((c) => c.id === state.activeConversationId)?.messages || []
  )

  // 🎯 蕾姆：监听来自主进程的流式数据
  useEffect(() => {
    // 流式数据回调
    const handleChunk = (_event: any, data: { requestId: number; chunk: string }) => {
      if (data.requestId === requestId && assistantMessageIdRef.current) {
        // 累积内容（chunk 是增量数据）
        accumulatedContentRef.current += data.chunk
        // 🎯 蕾姆修复：使用正确的会话 ID 更新流式内容
        const activeConversationId = useChatStore.getState().activeConversationId || 'default'
        updateStreamingContent(activeConversationId, assistantMessageIdRef.current, accumulatedContentRef.current)
      }
    }

    // 完成回调
    const handleComplete = (_event: any, data: { requestId: number }) => {
      if (data.requestId === requestId && assistantMessageIdRef.current) {
        console.log('✅ 蕾姆：请求完成')
        setIsGenerating(false)
        // 清理 ref
        assistantMessageIdRef.current = null
        accumulatedContentRef.current = ''
        setRequestId(null)
      }
    }

    // 错误回调
    const handleError = (_event: any, data: { requestId: number; error: string }) => {
      if (data.requestId === requestId) {
        console.error('❌ 蕾姆：请求失败', data.error)
        setIsGenerating(false)
        setError(data.error)
        // 清理 ref
        assistantMessageIdRef.current = null
        accumulatedContentRef.current = ''
        setRequestId(null)
      }
    }

    // 注册监听器
    const unlistenChunk = window.electronAPI.onDeepseekChunk?.(handleChunk)
    const unlistenComplete = window.electronAPI.onDeepseekComplete?.(handleComplete)
    const unlistenError = window.electronAPI.onDeepseekError?.(handleError)

    // 清理函数
    return () => {
      unlistenChunk?.()
      unlistenComplete?.()
      unlistenError?.()
    }
  }, [requestId])

  // 🎯 蕾姆：发送消息
  const sendMessage = useCallback(async (userMessage: string) => {
    // 检查配置
    if (!isConfigured()) {
      throw new Error('请先配置 API Key')
    }

    // 获取 API Key
    const apiKey = getCurrentApiKey()
    if (!apiKey) {
      throw new Error('无法获取 API Key，请检查配置')
    }

    // 🎯 蕾姆修复：使用正确的会话 ID 添加消息
    const activeConversationId = useChatStore.getState().activeConversationId || 'default'
    addMessage(activeConversationId, 'user', userMessage)

    // 🎯 蕾姆修复：使用正确的会话 ID 添加助手消息
    const assistantMessageId = addMessage(activeConversationId, 'assistant', '')
    assistantMessageIdRef.current = assistantMessageId
    accumulatedContentRef.current = ''

    setIsGenerating(true)
    setError(null)

    try {
      // 准备消息历史
      const messageHistory = messages
        .filter((m) => m.role !== 'system' && m.content)
        .map((m) => ({ role: m.role, content: m.content }))

      // 🎯 蕾姆：通过 IPC 调用主进程
      const result = await window.electronAPI.deepseekChat(messageHistory, {
        systemPrompt: '你是蕾姆，一个友好的 AI 助手。',
        temperature: 0.7,
        apiKey // 🎯 蕾姆：将 API Key 传递给主进程
      })

      setRequestId(result.requestId)
      console.log('🤖 蕾姆：已发送请求，requestId =', result.requestId)
    } catch (err) {
      console.error('❌ 蕾姆：发送消息失败', err)
      setIsGenerating(false)
      setError((err as Error).message)
      throw err
    }
  }, [isConfigured, getCurrentApiKey, addMessage, messages])

  // 🎯 蕾姆：取消请求
  const abort = useCallback(() => {
    if (requestId) {
      console.log('🛑 蕾姆：取消请求，requestId =', requestId)
      window.electronAPI.abortDeepseekChat(requestId)
      setIsGenerating(false)
      // 清理 ref
      assistantMessageIdRef.current = null
      accumulatedContentRef.current = ''
      setRequestId(null)
    }
  }, [requestId])

  return {
    sendMessage,
    abort,
    isGenerating,
    error
  }
}
