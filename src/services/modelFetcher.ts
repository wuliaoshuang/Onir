/**
 * 蕾姆精心设计的模型获取服务
 * 从各个供应商 API 动态获取可用模型列表
 */

import type { ProviderType } from '../types/apiKeys'

/**
 * 模型信息接口
 */
export interface ModelInfo {
  id: string
  name?: string
  description?: string
  context_length?: number
  // 🎯 蕾姆：是否为推理模型（支持思考链）
  reasoning?: boolean
}

/**
 * 模型获取结果
 */
export interface ModelsResult {
  success: boolean
  models: ModelInfo[]
  error?: string
}

/**
 * 🎯 蕾姆：判断模型是否为推理模型（支持思考链）
 * @param modelId 模型 ID
 */
function isReasoningModel(modelId: string): boolean {
  const lowerId = modelId.toLowerCase()

  // DeepSeek 推理模型
  if (lowerId.includes('reasoner') || lowerId.includes('r1')) {
    return true
  }

  // OpenAI o1/o3 系列推理模型
  if (lowerId.startsWith('o1-') || lowerId.startsWith('o3-')) {
    return true
  }

  // Google Gemini Thinking 和 Pro 模型（2.5 Pro 默认开启思考链）
  if (lowerId.includes('thinking') || lowerId.includes('-pro') || lowerId.startsWith('gemini-2.5-pro')) {
    return true
  }

  return false
}

/**
 * 统一的模型获取服务
 */
export class ModelFetcher {
  /**
   * 获取 DeepSeek 可用模型列表
   * API 文档: https://api.deepseek.com/v1/models
   */
  static async fetchDeepSeekModels(apiKey: string): Promise<ModelsResult> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        return {
          success: false,
          models: [],
          error: error.error?.message || `HTTP ${response.status}`,
        }
      }

      const data = await response.json()

      // DeepSeek API 返回格式: { object: 'list', data: [{ id, ... }] }
      const models: ModelInfo[] = (data.data || []).map((model: any) => ({
        id: model.id,
        reasoning: isReasoningModel(model.id),
      }))

      return {
        success: true,
        models,
      }
    } catch (error) {
      return {
        success: false,
        models: [],
        error: (error as Error).message || 'Network error',
      }
    }
  }

  /**
   * 获取 OpenAI 可用模型列表
   * API 文档: https://platform.openai.com/docs/models
   */
  static async fetchOpenAIModels(apiKey: string): Promise<ModelsResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        return {
          success: false,
          models: [],
          error: error.error?.message || `HTTP ${response.status}`,
        }
      }

      const data = await response.json()

      // OpenAI API 返回格式: { object: 'list', data: [{ id, ... }] }
      // 蕾姆过滤出聊天模型
      const allModels = data.data || []
      const chatModels: ModelInfo[] = allModels
        .filter((model: any) => {
          const id = model.id as string
          return id.startsWith('gpt-') || id.startsWith('o1-') || id.startsWith('o3-') || id.startsWith('chatgpt-')
        })
        .map((model: any) => ({
          id: model.id,
          reasoning: isReasoningModel(model.id),
        }))

      return {
        success: true,
        models: chatModels,
      }
    } catch (error) {
      return {
        success: false,
        models: [],
        error: (error as Error).message || 'Network error',
      }
    }
  }

  /**
   * 获取 Google Gemini 可用模型列表
   * API 文档: https://ai.google.dev/api/models
   * 端点: GET https://generativelanguage.googleapis.com/v1beta/models
   */
  static async fetchGoogleModels(apiKey: string): Promise<ModelsResult> {
    try {
      // Google API 使用 API key 作为查询参数
      // 蕾姆修复：使用 v1beta 而不是 v1
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        return {
          success: false,
          models: [],
          error: error.error?.message || `HTTP ${response.status}`,
        }
      }

      const data = await response.json()

      // Google API 返回格式: { models: [{ name, ... }] }
      // 蕾姆过滤出生成模型（generateContent 为 true）
      const models: ModelInfo[] = (data.models || [])
        .filter((model: any) =>
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map((model: any) => {
          const id = model.name.replace('models/', '')
          return {
            id,
            reasoning: isReasoningModel(id),
          }
        })

      return {
        success: true,
        models,
      }
    } catch (error) {
      return {
        success: false,
        models: [],
        error: (error as Error).message || 'Network error',
      }
    }
  }

  /**
   * 根据供应商类型路由模型获取
   */
  static async fetchModels(
    providerId: ProviderType,
    apiKey: string
  ): Promise<ModelsResult> {
    switch (providerId) {
      case 'deepseek':
        return this.fetchDeepSeekModels(apiKey)
      case 'openai':
        return this.fetchOpenAIModels(apiKey)
      case 'google':
        return this.fetchGoogleModels(apiKey)
      default:
        return {
          success: false,
          models: [],
          error: 'Unsupported provider for model fetching',
        }
    }
  }

  /**
   * 获取多个供应商的模型列表（并行请求）
   */
  static async fetchMultipleModels(
    providers: Array<{ providerId: ProviderType; apiKey: string }>
  ): Promise<Map<ProviderType, ModelsResult>> {
    const promises = providers.map(async ({ providerId, apiKey }) => {
      const result = await this.fetchModels(providerId, apiKey)
      return [providerId, result] as const
    })

    const results = await Promise.all(promises)
    return new Map(results)
  }
}
