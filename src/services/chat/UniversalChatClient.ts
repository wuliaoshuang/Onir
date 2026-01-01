/**
 * 蕾姆精心重构的通用聊天客户端
 * ✨ 修复严重 bug：现在根据模型名称使用正确的 API endpoint
 *
 * 问题修复：
 * - 之前：DeepSeekClient 硬编码 API endpoint，所有模型都发到 DeepSeek
 * - 现在：UniversalChatClient 根据供应商配置使用正确的 endpoint
 *
 * 支持的供应商：
 * - DeepSeek: https://api.deepseek.com/v1/chat/completions
 * - OpenAI: https://api.openai.com/v1/chat/completions
 * - Google AI: 使用 GoogleAIClient（完全不同的 API 格式）
 * - 自定义供应商：使用配置的 baseUrl
 *
 * 🎯 蕾姆重要提示：Google AI 使用完全不同的 API 格式
 * - 请求格式: contents[{role, parts:[{text}]}] vs messages[{role, content}]
 * - 响应格式: candidates[{content:{parts:[{text}]}}] vs choices[{message}]
 * - 认证方式: x-goog-api-key vs Authorization: Bearer
 * - 端点格式: /v1beta/models/{model}:streamGenerateContent
 *
 * 因此，Google AI 使用专门的 GoogleAIClient，而不是这里的通用逻辑
 */

import type {
  ChatCompletionRequest,
  StreamCallbacks,
  ChatError,
} from './types'
import { GoogleAIClient } from './GoogleAIClient'

// ========================================
// 通用聊天客户端配置
// ========================================
export interface ChatClientConfig {
  baseUrl: string      // API 基础 URL
  apiKey: string       // API Key
  providerId: string   // 供应商 ID（用于调试和错误处理）
}

// ========================================
// 通用聊天客户端
// ========================================
export class UniversalChatClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly providerId: string
  private readonly googleAIClient?: GoogleAIClient  // 🎯 蕾姆：Google AI 专用客户端

  constructor(config: ChatClientConfig) {
    this.baseUrl = config.baseUrl
    this.apiKey = config.apiKey
    this.providerId = config.providerId

    console.log(`🔍 蕾姆调试：UniversalChatClient 初始化 - providerId=${this.providerId}, baseUrl=${this.baseUrl}`)

    // 🎯 蕾姆：检测 Google AI，使用专用客户端
    const isGoogleAI = this.providerId === 'google' ||
                       this.baseUrl.includes('generativelanguage.googleapis.com') ||
                       this.baseUrl.includes('googleapis.com')

    if (isGoogleAI) {
      this.googleAIClient = new GoogleAIClient({
        apiKey: this.apiKey,
        baseUrl: this.baseUrl,
      })
      console.log('🔍 蕾姆调试：检测到 Google AI，使用专用客户端')
    }
  }

  /**
   * 构建 API endpoint URL
   * 不同供应商有不同的路径格式
   */
  private buildEndpoint(): string {
    // Google AI 使用不同的路径格式
    if (this.providerId === 'google' || this.baseUrl.includes('generativelanguage.googleapis.com')) {
      // Google AI: https://generativelanguage.googleapis.com/v1beta/chat/completions
      return `${this.baseUrl.replace(/\/$/, '')}/v1beta/chat/completions`
    }

    // OpenAI 兼容格式（DeepSeek、OpenAI、自定义供应商等）
    return `${this.baseUrl.replace(/\/$/, '')}/v1/chat/completions`
  }

  /**
   * 构建请求头
   * 不同供应商使用不同的认证方式
   */
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Google AI 使用 x-goog-api-key header
    if (this.providerId === 'google' || this.baseUrl.includes('generativelanguage.googleapis.com') || this.baseUrl.includes('googleapis.com')) {
      headers['x-goog-api-key'] = this.apiKey
      return headers
    }

    // OpenAI 兼容格式：Bearer token
    headers['Authorization'] = `Bearer ${this.apiKey}`
    return headers
  }

  /**
   * 构建请求 URL（可能包含查询参数）
   */
  private buildUrl(): string {
    const url = this.buildEndpoint()

    // Google AI 现在使用 x-goog-api-key header，不需要查询参数
    // 保留查询参数方式作为后备（某些场景可能需要）

    console.log(`🔍 蕾姆调试：buildUrl - providerId=${this.providerId}, baseUrl=${this.baseUrl}, url=${url}`)

    return url
  }

  /**
   * 发送流式聊天请求
   *
   * @param messages - 消息历史
   * @param callbacks - 流式回调函数
   * @param options - 可选参数（系统提示词、温度、模型等）
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    callbacks: StreamCallbacks,
    options?: {
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      model?: string
    }
  ): Promise<void> {
    // 🎯 蕾姆：Google AI 使用专用客户端
    if (this.googleAIClient) {
      console.log('🔍 蕾姆调试：使用 Google AI 专用客户端')
      return this.googleAIClient.chat(messages, callbacks, options)
    }

    // 🎯 蕾姆：OpenAI 兼容格式（DeepSeek、OpenAI 等）
    try {
      const url = this.buildUrl()
      const headers = this.buildHeaders()

      console.log(`🔍 蕾姆调试：发送请求 - url=${url}, model=${options?.model}`)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',
          messages: options?.systemPrompt
            ? [{ role: 'system', content: options.systemPrompt }, ...messages]
            : messages,
          stream: true,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 4096,
        }),
      })

      if (!response.ok) {
        await this.handleError(response)
      }

      await this.processStream(response, callbacks)
    } catch (error) {
      callbacks.onError(error as Error)
    }
  }

  /**
   * 处理 SSE 流式响应
   */
  private async processStream(
    response: Response,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()

          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue
          }

          const data = trimmed.slice(6).trim()

          if (data === '[DONE]') {
            callbacks.onComplete()
            return
          }

          try {
            const chunk = JSON.parse(data)
            const content = chunk.choices[0]?.delta?.content

            if (content) {
              callbacks.onChunk(content)
            }

            if (chunk.choices[0]?.finish_reason) {
              callbacks.onComplete()
              return
            }
          } catch (parseError) {
            console.error('解析 SSE 数据失败:', parseError, data)
          }
        }
      }
    } catch (error) {
      callbacks.onError(error as Error)
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 统一错误处理
   */
  private async handleError(response: Response): Promise<never> {
    let errorMessage = '请求失败'
    let errorType = 'unknown_error'

    try {
      const errorData: ChatError = await response.json()
      errorMessage = errorData.error?.message || errorMessage
      errorType = errorData.error?.type || errorType
    } catch {
      errorMessage = response.statusText || errorMessage
    }

    // 添加供应商信息到错误消息
    errorMessage = `[${this.providerId}] ${errorMessage}`
    throw new Error(errorMessage)
  }
}

// 重新导出类型
export type { ChatCompletionRequest, StreamCallbacks, ChatError } from './types'
