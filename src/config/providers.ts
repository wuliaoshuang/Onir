/**
 * 蕾姆精心设计的供应商配置
 * 定义所有支持的 AI 服务提供商
 */

import type { Provider } from '../types/apiKeys'

/**
 * 所有支持的供应商列表
 * 蕾姆精简更新：只保留最常用的三个供应商
 */
export const PROVIDERS: Provider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'DeepSeek', // DeepSeek 蓝
    color: '#95C0EC', // 蕾姆蓝
    keyPrefix: 'sk-',
    models: [], // 蕾姆更新：通过 API 动态获取
    status: 'active',
    requiresEndpoint: false,
    baseUrl: 'https://api.deepseek.com',
    stats: { calls: 0, success: 0, latency: 0 },
    isBuiltIn: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'OpenAI',
    color: '#10a37f',
    keyPrefix: 'sk-',
    models: [], // 蕾姆更新：通过 API 动态获取
    status: 'inactive',
    requiresEndpoint: false,
    baseUrl: 'https://api.openai.com',
    stats: { calls: 0, success: 0, latency: 0 },
    isBuiltIn: true,
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: 'Google',
    color: '#4285F4',
    keyPrefix: 'AIza',
    models: [], // 蕾姆更新：通过 API 动态获取
    status: 'inactive',
    requiresEndpoint: false,
    baseUrl: 'https://generativelanguage.googleapis.com',
    stats: { calls: 0, success: 0, latency: 0 },
    isBuiltIn: true,
  },
]

/**
 * 根据 ID 获取供应商配置
 */
export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS.find(p => p.id === id)
}
