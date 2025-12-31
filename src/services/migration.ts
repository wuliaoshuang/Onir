/**
 * 蕾姆精心设计的数据迁移服务
 * 负责从旧版本迁移到新的多密钥系统
 */

import { secureStorage } from './secureStorage'
import { PROVIDERS } from '../config/providers'
import type { ApiKeysStorage } from '../types/apiKeys'
import { useApiKeyStore } from '../stores/apiKeyStore'

/**
 * 迁移到 v2 密钥管理系统
 * - 尝试读取旧的 DeepSeek 密钥
 * - 如果存在，迁移到新结构
 * - 如果不存在，创建默认配置
 */
export async function migrateToV2(): Promise<boolean> {
  console.log('蕾姆正在开始迁移到 v2 密钥管理系统...')

  try {
    // 1. 尝试读取旧的 DeepSeek 密钥
    const oldKey = await secureStorage.getApiKey()

    if (oldKey) {
      console.log('发现旧密钥，开始迁移...')

      // 2. 创建新的存储结构，包含迁移的密钥
      const newStorage: ApiKeysStorage = {
        keys: [
          {
            id: `migrated_${Date.now()}`,
            providerId: 'deepseek',
            name: '迁移的 DeepSeek 密钥',
            keyValue: oldKey,
            status: 'active',
            isDefault: true,
            createdAt: Date.now(),
          }
        ],
        providers: PROVIDERS,
        activeProviders: ['deepseek'],
        defaultProvider: 'deepseek',
      }

      // 3. 保存新结构
      await secureStorage.setApiKeysStorage(newStorage)

      // 4. 删除旧密钥
      await secureStorage.migrateOldKey()

      // 5. 初始化 Store
      await useApiKeyStore.getState().initialize()

      console.log('✅ 迁移完成！')
      return true
    } else {
      console.log('未发现旧密钥，创建默认配置...')

      // 创建空配置
      const newStorage: ApiKeysStorage = {
        keys: [],
        providers: PROVIDERS,
        activeProviders: [],
        defaultProvider: 'deepseek',
      }

      await secureStorage.setApiKeysStorage(newStorage)

      // 初始化 Store
      await useApiKeyStore.getState().initialize()

      console.log('✅ 默认配置创建完成！')
      return true
    }
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    return false
  }
}

/**
 * 完全重置（清空所有数据）
 * 用户选择"清空重新配置"时调用
 */
export async function resetAllData(): Promise<boolean> {
  console.log('蕾姆正在清空所有数据...')

  try {
    // 1. 删除新版本存储
    await secureStorage.deleteApiKeysStorage()

    // 2. 删除旧版本密钥（如果存在）
    await secureStorage.migrateOldKey()

    // 3. 创建全新的默认配置
    const newStorage: ApiKeysStorage = {
      keys: [],
      providers: PROVIDERS,
      activeProviders: [],
      defaultProvider: 'deepseek',
    }

    await secureStorage.setApiKeysStorage(newStorage)

    // 4. 重新初始化 Store
    await useApiKeyStore.getState().initialize()

    console.log('✅ 数据重置完成！')
    return true
  } catch (error) {
    console.error('❌ 重置失败:', error)
    return false
  }
}

/**
 * 检查是否需要迁移
 */
export async function needsMigration(): Promise<boolean> {
  const v2Storage = await secureStorage.getApiKeysStorage()
  const oldKey = await secureStorage.getApiKey()

  // 如果 v2 存储不存在，但旧密钥存在，需要迁移
  return !v2Storage && !!oldKey
}
