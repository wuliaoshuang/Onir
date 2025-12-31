/**
 * API Key 验证服务
 */

import { secureStorage } from '../secureStorage'

/**
 * 验证 API Key 是否有效
 *
 * @param apiKey - 要验证的 API Key
 * @returns Promise<boolean> - 是否有效
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * 测试已存储的 API Key 是否有效
 *
 * @returns Promise<boolean> - 是否有效
 */
export async function testStoredApiKey(): Promise<boolean> {
  const apiKey = await secureStorage.getApiKey()
  if (!apiKey) return false
  return validateApiKey(apiKey)
}
