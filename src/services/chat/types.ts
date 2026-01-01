/**
 * 聊天服务类型定义
 * 与 DeepSeek 类型兼容
 */

// ========================================
// 聊天请求类型
// ========================================
export interface ChatCompletionRequest {
  model: string
  messages: Array<{ role: string; content: string }>
  stream: boolean
  temperature?: number
  max_tokens?: number
}

// ========================================
// 流式回调类型
// ========================================
export interface StreamCallbacks {
  onChunk: (chunk: string) => void
  onComplete: () => void
  onError: (error: Error) => void
}

// ========================================
// 错误类型
// ========================================
export interface ChatError {
  error?: {
    message: string
    type: string
    code?: string
  }
}
