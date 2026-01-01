/**
 * 聊天服务统一导出
 * ✨ 使用通用聊天客户端，支持多供应商
 *
 * 支持的供应商：
 * - DeepSeek (OpenAI 兼容格式)
 * - OpenAI (OpenAI 格式)
 * - Google AI (专用格式，使用 GoogleAIClient)
 * - 自定义供应商
 *
 * @example
 * ```ts
 * import { UniversalChatClient } from '@/services/chat'
 *
 * const client = new UniversalChatClient({
 *   baseUrl: 'https://api.openai.com',
 *   apiKey: 'sk-xxx',
 *   providerId: 'openai',
 * })
 * ```
 */

export { UniversalChatClient } from './UniversalChatClient'
export { GoogleAIClient } from './GoogleAIClient'
export type { ChatClientConfig, StreamCallbacks, ChatError, ChatCompletionRequest } from './UniversalChatClient'
export type { GoogleAIClientConfig } from './GoogleAIClient'
