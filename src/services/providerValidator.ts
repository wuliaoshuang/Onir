/**
 * 蕾姆精心设计的供应商验证服务
 * 统一的 API Key 验证接口
 */

import type { ProviderType, ValidationResult } from '../types/apiKeys'
import { ModelFetcher } from './modelFetcher'

/**
 * 统一的供应商验证服务
 */
export class ProviderValidator {
  /**
   * 验证 DeepSeek API Key
   */
  static async validateDeepSeek(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        return { isValid: true, model: 'deepseek-chat' }
      }

      const error = await response.json()
      return {
        isValid: false,
        error: error.error?.message || 'Invalid API key'
      }
    } catch (error) {
      return {
        isValid: false,
        error: (error as Error).message || 'Network error'
      }
    }
  }

  /**
   * 验证 OpenAI API Key
   */
  static async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        return { isValid: true, model: 'gpt-4' }
      }

      const error = await response.json()
      return {
        isValid: false,
        error: error.error?.message || 'Invalid API key'
      }
    } catch (error) {
      return {
        isValid: false,
        error: (error as Error).message || 'Network error'
      }
    }
  }

  /**
   * 验证 Google AI API Key
   * 蕾姆修复：使用 v1beta 端点
   */
  static async validateGoogle(apiKey: string): Promise<ValidationResult> {
    try {
      // 蕾姆修复：使用 v1beta 而不是 v1
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`

      const response = await fetch(url)

      if (response.ok) {
        return { isValid: true, model: 'gemini-pro' }
      }

      const error = await response.json().catch(() => ({}))
      return {
        isValid: false,
        error: error.error?.message || 'Invalid API key',
      }
    } catch (error) {
      return {
        isValid: false,
        error: (error as Error).message || 'Network error',
      }
    }
  }

  /**
   * 获取供应商可用模型列表
   */
  static async fetchModels(providerId: ProviderType, apiKey: string) {
    return ModelFetcher.fetchModels(providerId, apiKey)
  }

  /**
   * 根据供应商类型路由验证
   * 蕾姆精简：只支持 deepseek、openai、google
   */
  static async validate(
    providerId: ProviderType,
    apiKey: string,
    metadata?: Record<string, any>
  ): Promise<ValidationResult> {
    switch (providerId) {
      case 'deepseek':
        return this.validateDeepSeek(apiKey)
      case 'openai':
        return this.validateOpenAI(apiKey)
      case 'google':
        return this.validateGoogle(apiKey)
      default:
        // 蕾姆添加：尝试验证自定义供应商
        if (typeof providerId === 'string' && providerId.startsWith('custom-')) {
          return this.validateCustom(apiKey, metadata?.baseUrl)
        }
        return { isValid: false, error: 'Unsupported provider' }
    }
  }
}
