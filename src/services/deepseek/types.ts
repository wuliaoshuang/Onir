/**
 * DeepSeek API 类型定义
 * 完全兼容 OpenAI API 格式
 */

// ========================================
// 消息类型
// ========================================
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ========================================
// 请求参数
// ========================================
export interface ChatCompletionRequest {
  model: 'deepseek-chat' | 'deepseek-reasoner'
  messages: DeepSeekMessage[]
  stream: true
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

// ========================================
// 流式响应（SSE）
// ========================================
export interface ChatCompletionChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

// ========================================
// 流式回调函数类型
// ========================================
export interface StreamCallbacks {
  onChunk: (chunk: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

// ========================================
// API 错误类型
// ========================================
export interface DeepSeekAPIError {
  error: {
    message: string
    type: string
    param?: string
    code?: string
  }
}

export class DeepSeekError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type?: string
  ) {
    super(message)
    this.name = 'DeepSeekError'
  }
}
