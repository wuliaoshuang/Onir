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

interface GoogleGenerateContentRequest {
  contents: GoogleContent[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

// ========================================
// Google AI API 响应格式
// ========================================
interface GoogleCandidate {
  content?: {
    parts: Array<{ text?: string }>
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
   * 格式: /v1beta/models/{model}:streamGenerateContent
   */
  private buildEndpoint(model: string): string {
    // 移除尾部斜杠
    const baseUrl = this.baseUrl.replace(/\/$/, '')
    return `${baseUrl}/v1beta/models/${model}:streamGenerateContent`
  }

  /**
   * 构建请求头
   * Google AI 使用 x-goog-api-key header
   */
  private buildHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
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
   * Google AI 的流式响应特点:
   * - 返回一个完整的 JSON 数组: [{...}, {...}, ...]
   * - 数组可能被网络分块传输，需要累积到完整才能解析
   * - 文本内容在 candidates[0].content.parts[0].text
   * - finishReason: "STOP" 表示完成
   *
   * 处理策略:
   * 1. 累积所有接收到的数据
   * 2. 尝试解析为完整的 JSON 数组
   * 3. 解析成功后，使用打字机效果逐个处理元素
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
    let chunkCount = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log(`🔍 蕾姆调试：流结束，共接收 ${chunkCount} 个 chunk`)
          break
        }

        chunkCount++
        const chunkText = decoder.decode(value, { stream: true })
        buffer += chunkText

        console.log(`🔍 蕾姆调试：chunk #${chunkCount}，新增 ${chunkText.length} 字符，buffer 总计 ${buffer.length} 字符`)

        // 尝试解析 buffer 为 JSON
        try {
          const parsed = JSON.parse(buffer)

          if (Array.isArray(parsed)) {
            console.log(`✅ 蕾姆调试：成功解析 JSON 数组，${parsed.length} 个元素，准备用打字机效果输出`)
            // 使用打字机效果处理数组中的每个元素
            await this.processArrayWithTypewriterEffect(parsed, callbacks)
            buffer = ''
          } else if (parsed && typeof parsed === 'object') {
            console.log('✅ 蕾姆调试：成功解析 JSON 对象')
            if (this.processResponseItem(parsed, callbacks)) {
              return
            }
            buffer = ''
          }
        } catch (parseError) {
          // JSON 还不完整，继续累积数据
          const errMsg = (parseError as Error).message
          // 只在第一次和偶尔打印，避免日志过多
          if (chunkCount === 1 || chunkCount % 10 === 0) {
            console.log(`🔍 蕾姆调试：JSON 解析中... (chunk ${chunkCount}, buffer=${buffer.length} 字符)`)
          }
        }

        // 防止 buffer 无限增长
        if (buffer.length > 500000) {
          console.warn('🔍 蕾姆警告：buffer 过大 (>500KB)，清空')
          buffer = ''
        }
      }

      // 流结束，尝试处理剩余数据
      if (buffer.trim().length > 0) {
        console.log(`🔍 蕾姆调试：流结束，尝试处理剩余 buffer (${buffer.length} 字符)`)
        try {
          const parsed = JSON.parse(buffer)
          if (Array.isArray(parsed)) {
            await this.processArrayWithTypewriterEffect(parsed, callbacks)
          } else if (parsed && typeof parsed === 'object') {
            this.processResponseItem(parsed, callbacks)
          }
        } catch (e) {
          console.error('❌ 蕾姆调试：最终 buffer 解析失败', e)
        }
      }

      console.log('🔍 蕾姆调试：流正常结束')
      callbacks.onComplete()
    } catch (error) {
      console.error('❌ 蕾姆调试：processStream 错误 =', error)
      callbacks.onError(error as Error)
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 使用打字机效果处理数组元素
   * 每个元素之间添加小延迟，模拟流式输出
   * 🎯 蕾姆：增加延迟以获得更好的阅读体验
   */
  private async processArrayWithTypewriterEffect(
    items: GenerateContentResponse[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    const TYPING_DELAY = 120  // 每个元素之间的延迟（毫秒）- 蕾姆调整为更舒适的阅读速度

    console.log(`🔍 蕾姆调试：开始打字机效果，${items.length} 个元素，每个延迟 ${TYPING_DELAY}ms`)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (this.processResponseItem(item, callbacks)) {
        console.log(`🔍 蕾姆调试：元素 [${i}] 触发完成信号，停止打字机效果`)
        return
      }

      // 最后一个元素不需要延迟
      if (i < items.length - 1) {
        await this.delay(TYPING_DELAY)
      }
    }

    console.log('✅ 蕾姆调试：打字机效果完成')
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 处理单个响应项
   * @returns true 表示收到完成信号，应该结束流
   */
  private processResponseItem(
    data: GenerateContentResponse,
    callbacks: StreamCallbacks
  ): boolean {
    // 提取文本内容
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      console.log(`✅ 蕾姆调试：收到文本块，长度=${text.length}, 内容="${text.slice(0, 30)}..."`)
      callbacks.onChunk(text)
      return false  // 继续处理下一个元素
    }

    // 检查是否完成
    const finishReason = data.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'IN_PROGRESS') {
      console.log(`✅ 蕾姆调试：Google AI 完成原因 = ${finishReason}`)
      callbacks.onComplete()
      return true  // 应该结束流
    }

    return false
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
