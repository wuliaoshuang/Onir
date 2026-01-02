/**
 * 蕾姆精心构建的 Google AI 专用适配器
 * ✨ 解决 Google AI 与 OpenAI 格式不兼容问题
 *
 * Google AI API 格式完全不同：
 * - 认证: x-goog-api-key (不是 Authorization: Bearer)
 * - 端点: /v1beta/models/{model}:streamGenerateContent
 * - 请求: contents[{role, parts:[{text}]}] (不是 messages[{role, content}])
 * - 响应: candidates[{content:{parts:[{text}]}}] (不是 choices[{message:{content}}])
 * - 角色: model (不是 assistant)
 *
 * @example
 * ```ts
 * import { GoogleAIClient } from '@/services/chat'
 *
 * const client = new GoogleAIClient({
 *   apiKey: 'AIza...',
 *   model: 'gemini-2.5-flash',
 * })
 *
 * await client.chat(messages, callbacks, { temperature: 0.7 })
 * ```
 */

import type {
  ChatCompletionRequest,
  StreamCallbacks,
  ChatError,
} from './types'

// ========================================
// Google AI 客户端配置
// ========================================
export interface GoogleAIClientConfig {
  apiKey: string
  baseUrl?: string   // 默认: https://generativelanguage.googleapis.com
}

// ========================================
// Google AI API 请求格式
// ========================================
interface GoogleContent {
  role: 'user' | 'model'
  parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>
}

// 🎯 蕾姆：思考链配置
interface ThinkingConfig {
  includeThoughts?: boolean  // 是否返回思考摘要
  thinkingBudget?: number     // -1 = 动态, 0 = 禁用, >0 = 固定预算
}

interface GoogleGenerateContentRequest {
  contents: GoogleContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
    thinkingConfig?: ThinkingConfig  // 🎯 蕾姆：思考链配置
  }
}

// ========================================
// Google AI API 响应格式
// ========================================
interface GooglePart {
  text?: string
  thought?: boolean  // 🎯 蕾姆：是否为思考内容
}

interface GoogleCandidate {
  content?: {
    parts: Array<GooglePart>
    role: string
  }
  finishReason?: string
  index: number
}

interface GenerateContentResponse {
  candidates: GoogleCandidate[]
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
  modelVersion?: string
  responseId?: string
}

// ========================================
// Google AI 客户端
// ========================================
export class GoogleAIClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(config: GoogleAIClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com'

    console.log(`🔍 蕾姆调试：GoogleAIClient 初始化 - baseUrl=${this.baseUrl}`)
  }

  /**
   * 构建 API endpoint URL
   * 格式: /v1beta/models/{model}:streamGenerateContent?alt=sse
   *
   * 🎯 蕾姆关键修复：添加 alt=sse 参数启用真正的 SSE 流式！
   */
  private buildEndpoint(model: string): string {
    // 移除尾部斜杠
    const baseUrl = this.baseUrl.replace(/\/$/, '')
    return `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse`
  }

  /**
   * 🎯 蕾姆：判断模型是否支持思考链
   * Gemini 2.5 Pro/Flash 系列支持 thinking
   */
  private isThinkingModel(model: string): boolean {
    const lowerModel = model.toLowerCase()
    return (
      lowerModel.includes('gemini-2.5-pro') ||
      lowerModel.includes('gemini-2.5-flash') ||
      lowerModel.includes('gemini-2.5-flash-lite') ||
      lowerModel.includes('gemini-3-pro') ||
      lowerModel.includes('gemini-3-flash') ||
      // 通用匹配：thinking 系列模型
      lowerModel.includes('thinking')
    )
  }

  /**
   * 构建请求头
   * Google AI 使用 x-goog-api-key header
   */
  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',  // 🎯 蕾姆：明确要求 SSE 流式响应
      'x-goog-api-key': this.apiKey,
    }
  }

  /**
   * 转换 OpenAI 格式的消息为 Google AI 格式
   *
   * OpenAI: { role: 'assistant', content: '...' }
   * Google: { role: 'model', parts: [{ text: '...' }] }
   */
  private convertMessagesToGoogleContents(
    messages: Array<{ role: string; content: string }>
  ): GoogleContent[] {
    return messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : ('user' as const),
      parts: [{ text: msg.content }],
    }))
  }

  /**
   * 发送流式聊天请求
   *
   * @param messages - OpenAI 格式的消息历史
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
    try {
      const model = options?.model || 'gemini-2.5-flash'
      const url = this.buildEndpoint(model)
      const headers = this.buildHeaders()

      console.log(`🔍 蕾姆调试：Google AI 发送请求 - url=${url}, model=${model}`)

      // 转换消息格式
      const googleContents = this.convertMessagesToGoogleContents(messages)

      // 如果有系统提示词，插入到开头（作为第一条 user 消息）
      let finalContents = googleContents
      if (options?.systemPrompt) {
        finalContents = [
          {
            role: 'user' as const,
            parts: [{ text: `系统指令：${options.systemPrompt}` }],
          },
          ...googleContents,
        ]
      }

      const requestBody: GoogleGenerateContentRequest = {
        contents: finalContents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
          // 🎯 蕾姆：为 Pro/Thinking 模型启用思考链
          thinkingConfig: this.isThinkingModel(model) ? {
            includeThoughts: true,   // 返回思考摘要
            thinkingBudget: -1,       // 动态思考预算（模型自己决定）
          } : undefined,
        },
      }

      console.log('🔍 蕾姆调试：Google AI 请求体 =', JSON.stringify(requestBody, null, 2))

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
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
   *
   * 🎯 蕾姆修复 v4：支持 Gemini 思考链（thought 字段）
   *
   * SSE 格式:
   * data: {"candidates": [{"content": {"parts": [{"text": "...", "thought": true}]}}]}
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

        // 按行处理 SSE 格式
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''  // 保留最后不完整的行

        for (const line of lines) {
          const trimmed = line.trim()

          // 跳过空行
          if (!trimmed) continue

          // 移除 SSE 的 "data: " 前缀（如果有）
          const dataStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed

          try {
            const parsed = JSON.parse(dataStr)

            // 处理单个响应对象或数组
            const items = Array.isArray(parsed) ? parsed : [parsed]

            for (const item of items) {
              const candidate = item.candidates?.[0]
              if (!candidate?.content?.parts) continue

              // 🎯 蕾姆关键：遍历所有 parts，检查 thought 字段
              for (const part of candidate.content.parts) {
                if (part.text) {
                  if (part.thought === true) {
                    // 这是思考链内容
                    if (callbacks.onReasoningChunk) {
                      callbacks.onReasoningChunk(part.text)
                    }
                  } else {
                    // 这是正常回答内容
                    callbacks.onChunk(part.text)
                  }
                }
              }

              // 检查是否完成
              const finishReason = candidate.finishReason
              if (finishReason && finishReason !== 'IN_PROGRESS') {
                callbacks.onComplete()
                return
              }
            }
          } catch (parseError) {
            console.debug('解析 SSE 行失败，跳过:', parseError, dataStr.slice(0, 100))
          }
        }
      }

      callbacks.onComplete()
    } catch (error) {
      console.error('Google AI 流处理错误:', error)
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
    errorMessage = `[Google AI] ${errorMessage}`
    throw new Error(errorMessage)
  }
}

// 重新导出类型
export type { ChatCompletionRequest, StreamCallbacks, ChatError } from './types'
