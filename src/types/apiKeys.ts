/**
 * 蕾姆精心设计的密钥管理系统类型定义
 * 支持多供应商、多密钥的完整类型系统
 */

// ========================================
// 供应商类型
// ========================================
/**
 * 内置供应商类型（保持类型安全）
 * 蕾姆精简：只保留最常用的三个供应商
 */
export type BuiltInProviderType =
  | 'deepseek'
  | 'openai'
  | 'google'

/**
 * 供应商类型（支持自定义供应商）
 * 内置供应商使用字符串字面量，自定义供应商使用任意字符串
 */
export type ProviderType = BuiltInProviderType | string

// ========================================
// 密钥状态
// ========================================
export type KeyStatus = 'active' | 'inactive' | 'error' | 'expired'

// ========================================
// API 密钥配置
// ========================================
export interface ApiKey {
  id: string                    // 唯一标识
  providerId: ProviderType      // 供应商 ID
  name: string                  // 用户自定义名称（如"工作账号"）
  keyValue: string              // 实际密钥值（加密存储）
  status: KeyStatus             // 密钥状态
  isDefault: boolean            // 是否为该供应商的默认密钥
  createdAt: number             // 创建时间
  lastUsedAt?: number           // 最后使用时间
  lastValidatedAt?: number      // 最后验证时间
  errorMessage?: string         // 错误信息
  metadata?: Record<string, any> // 额外元数据（如 Azure 的 endpoint）
}

// ========================================
// 供应商配置
// ========================================
export interface Provider {
  id: ProviderType
  name: string                  // 显示名称
  icon: string                  // 图标 emoji
  color: string                 // 主题色
  baseUrl?: string              // API 基础 URL
  requiresEndpoint: boolean      // 是否需要额外配置 endpoint
  keyPrefix: string             // 密钥前缀（如 'sk-'）
  models: string[]              // 支持的模型列表
  reasoningModels?: string[]    // 🎯 蕾姆：推理模型列表（支持思考链的模型）
  status: 'active' | 'inactive' // 供应商状态
  stats: {                      // 使用统计
    calls: number
    success: number
    latency: number
  }
  isBuiltIn?: boolean           // 是否为内置供应商（true=内置，false=自定义）
}

// ========================================
// 验证结果
// ========================================
export interface ValidationResult {
  isValid: boolean
  error?: string
  model?: string // 识别到的模型
}

// ========================================
// 存储结构（JSON 序列化到 secure storage）
// ========================================
export interface ApiKeysStorage {
  keys: ApiKey[]                 // 所有密钥
  providers: Provider[]          // 供应商配置
  activeProviders: ProviderType[] // 已激活的供应商
  defaultProvider: ProviderType  // 默认供应商
  // 🎯 蕾姆新增：每个供应商的启用/禁用模型列表
  enabledModels?: Record<string, string[]>  // { providerId: [modelNames] }
}
