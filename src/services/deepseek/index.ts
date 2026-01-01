/**
 * 蕾姆精心设计的 DeepSeek API 客户端
 * 支持流式响应和错误处理
 *
 * API 文档: https://api-docs.deepseek.com/
 */

import type {
  ChatCompletionRequest,
  StreamCallbacks,
  DeepSeekError,
} from './types'

const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

export class DeepSeekClient {
  constructor(private apiKey: string) {}

  /**
   * 发送流式聊天请求
   *
   * @param messages - 消息历史（不含系统消息）
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
      model?: string  // 🎯 蕾姆：支持自定义模型
    }
  ): Promise<void> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',  // 🎯 蕾姆：使用自定义模型或默认模型
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

        // 解码并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 处理缓冲区中的完整消息
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          const trimmed = line.trim()

          // 跳过空行和注释
          if (!trimmed || !trimmed.startsWith('data: ')) {
            continue
          }

          const data = trimmed.slice(6).trim()

          // 检查流结束标记
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

            // 检查是否完成
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
      const errorData: DeepSeekError = await response.json()
      errorMessage = errorData.error?.message || errorMessage
      errorType = errorData.error?.type || errorType
    } catch {
      errorMessage = response.statusText || errorMessage
    }

    throw new Error(errorMessage)
  }
}
