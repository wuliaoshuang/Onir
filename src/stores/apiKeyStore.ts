/**
 * 蕾姆精心设计的密钥管理 Store
 * 支持多供应商、多密钥的完整状态管理
 * ✨ 现在支持跨窗口同步
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  ApiKey,
  Provider,
  ProviderType,
  ValidationResult,
  ApiKeysStorage
} from '../types/apiKeys'
import { PROVIDERS } from '../config/providers'
import { secureStorage } from '../services/secureStorage'
import { ProviderValidator } from '../services/providerValidator'
import { notifyApiKeysUpdated, notifyProvidersUpdated, enableCrossWindowSync, CrossWindowEventType } from '../lib/crossWindowEvents'

// ========================================
// State 接口
// ========================================
interface ApiKeyState {
  // ========== 数据 ==========
  keys: ApiKey[]
  providers: Provider[]
  activeProviders: ProviderType[]
  defaultProvider: ProviderType

  // ========== UI 状态 ==========
  isLoading: boolean
  validatingKeyId: string | null
  testingKeyId: string | null
  error: string | null

  // ========== Actions ==========

  // 初始化
  initialize: () => Promise<void>

  // 密钥管理
  addKey: (
    providerId: ProviderType,
    keyValue: string,
    name?: string,
    metadata?: Record<string, any>
  ) => Promise<string>
  removeKey: (keyId: string) => Promise<void>
  updateKey: (keyId: string, updates: Partial<ApiKey>) => Promise<void>
  setDefaultKey: (keyId: string) => Promise<void>

  // 验证和测试
  validateKey: (keyId: string) => Promise<ValidationResult>
  testConnection: (keyId: string) => Promise<boolean>

  // 供应商管理
  activateProvider: (providerId: ProviderType) => void
  deactivateProvider: (providerId: ProviderType) => void
  setDefaultProvider: (providerId: ProviderType) => void

  // 蕾姆新增：动态供应商管理
  addProvider: (provider: Omit<Provider, 'id' | 'stats' | 'status' | 'isBuiltIn'>) => Promise<string>
  updateProvider: (providerId: ProviderType, updates: Partial<Provider>) => Promise<void>
  deleteProvider: (providerId: ProviderType) => Promise<void>
  getBuiltInProviders: () => Provider[]
  getCustomProviders: () => Provider[]
  canDeleteProvider: (providerId: ProviderType) => { canDelete: boolean; reason?: string }

  // 蕾姆新增：更新供应商模型列表（内置和自定义供应商都可以使用）
  updateProviderModels: (providerId: ProviderType, models: string[]) => Promise<void>

  // 获取方法
  getKeysByProvider: (providerId: ProviderType) => ApiKey[]
  getDefaultKey: (providerId: ProviderType) => ApiKey | undefined
  getActiveKey: (providerId: ProviderType) => ApiKey | undefined
  getCurrentApiKey: () => string | null

  // 清空数据
  clearAll: () => Promise<void>
}

// ========================================
// 辅助函数
// ========================================

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 保存到安全存储并发送跨窗口事件
 */
async function saveToStorage(state: ApiKeyState): Promise<void> {
  console.log('💾 蕾姆：开始保存 API Keys 到存储')

  const storage: ApiKeysStorage = {
    keys: state.keys,
    providers: state.providers,
    activeProviders: state.activeProviders,
    defaultProvider: state.defaultProvider,
  }

  await secureStorage.setApiKeysStorage(storage)
  console.log('💾 蕾姆：API Keys 已保存到加密存储')

  // 蕾姆：通知所有窗口 API 密钥已更新
  try {
    await notifyApiKeysUpdated()
    console.log('📡 蕾姆：已发送 API Keys 更新事件到所有窗口')
  } catch (error) {
    console.error('❌ 蕾姆：发送跨窗口事件失败', error)
  }
}

// ========================================
// Store 创建
// ========================================
export const useApiKeyStore = create<ApiKeyState>()(
  devtools((set, get) => ({
    // ========== Initial State ==========
    keys: [],
    providers: PROVIDERS,
    activeProviders: [],
    defaultProvider: 'deepseek',
    isLoading: false,
    validatingKeyId: null,
    testingKeyId: null,
    error: null,

    // ========== Actions ==========

    /**
     * 初始化：从安全存储加载配置
     * 蕾姆增强：自动迁移旧数据，确保供应商列表始终为最新
     */
    initialize: async () => {
      set({ isLoading: true })
      try {
        const storage = await secureStorage.getApiKeysStorage()
        if (storage) {
          // 蕾姆数据迁移：智能合并供应商数据
          // 1. 对于内置供应商，优先使用 storage 中的版本（保留 models 等动态数据）
          // 2. 对于新增的内置供应商，使用 PROVIDERS 中的版本
          // 3. 对于自定义供应商，保留 storage 中的版本

          const mergedProviders = PROVIDERS.map(builtIn => {
            const storageProvider = storage.providers.find(sp => sp.id === builtIn.id)
            if (storageProvider) {
              // storage 中有这个供应商，合并数据
              // 保留 storage 中的 models、stats、status 等动态数据
              return {
                ...builtIn,
                models: storageProvider.models || builtIn.models,
                stats: storageProvider.stats || builtIn.stats,
                status: storageProvider.status || builtIn.status,
              }
            }
            // storage 中没有这个供应商，使用 PROVIDERS 中的版本
            return builtIn
          }).concat(
            storage.providers.filter(p => !p.isBuiltIn) // 保留自定义供应商
          )

          // 清理 activeProviders：移除已删除的供应商
          const validActiveProviders = storage.activeProviders.filter(ap =>
            mergedProviders.some(mp => mp.id === ap)
          )

          // 清理 keys：移除已删除供应商的密钥
          const validKeys = storage.keys.filter(key =>
            mergedProviders.some(mp => mp.id === key.providerId)
          )

          // 检查 defaultProvider 是否有效，无效则重置为 deepseek
          const validDefaultProvider = mergedProviders.some(
            p => p.id === storage.defaultProvider
          )
            ? storage.defaultProvider
            : 'deepseek'

          // 更新存储
          const migratedStorage: ApiKeysStorage = {
            keys: validKeys,
            providers: mergedProviders,
            activeProviders: validActiveProviders,
            defaultProvider: validDefaultProvider,
          }

          // 如果有数据变更，保存到存储
          if (JSON.stringify(storage) !== JSON.stringify(migratedStorage)) {
            await secureStorage.setApiKeysStorage(migratedStorage)
            console.log('蕾姆：已迁移旧数据，供应商列表已更新为最新版本')
          }

          set({
            keys: migratedStorage.keys,
            providers: migratedStorage.providers,
            activeProviders: migratedStorage.activeProviders,
            defaultProvider: migratedStorage.defaultProvider,
            isLoading: false,
          })
        } else {
          // 首次使用，创建默认配置
          const defaultStorage: ApiKeysStorage = {
            keys: [],
            providers: PROVIDERS,
            activeProviders: [],
            defaultProvider: 'deepseek',
          }
          await secureStorage.setApiKeysStorage(defaultStorage)
          set({
            keys: [],
            providers: PROVIDERS,
            activeProviders: [],
            defaultProvider: 'deepseek',
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('初始化失败:', error)
        set({
          error: (error as Error).message,
          isLoading: false,
        })
      }
    },

    /**
     * 添加新密钥
     */
    addKey: async (
      providerId: ProviderType,
      keyValue: string,
      name?: string,
      metadata?: Record<string, any>
    ) => {
      const { keys } = get()

      // 检查是否已存在相同密钥
      const existingKey = keys.find(
        k => k.providerId === providerId && k.keyValue === keyValue
      )
      if (existingKey) {
        throw new Error('该密钥已存在')
      }

      // 创建新密钥对象
      const newKey: ApiKey = {
        id: generateId(),
        providerId,
        name: name || `${providerId} 密钥`,
        keyValue,
        status: 'inactive',
        isDefault: keys.filter(k => k.providerId === providerId).length === 0,
        createdAt: Date.now(),
        metadata,
      }

      // 如果是第一个密钥，自动设为默认
      const updatedKeys = [...keys, newKey]

      set({ keys: updatedKeys })
      await saveToStorage(get())

      return newKey.id
    },

    /**
     * 删除密钥
     */
    removeKey: async (keyId: string) => {
      const { keys, activeProviders } = get()
      const keyToDelete = keys.find(k => k.id === keyId)

      if (!keyToDelete) return

      // 删除密钥
      let updatedKeys = keys.filter(k => k.id !== keyId)

      // 如果删除的是默认密钥，需要重新指定默认
      if (keyToDelete.isDefault) {
        const providerKeys = updatedKeys.filter(k => k.providerId === keyToDelete.providerId)
        if (providerKeys.length > 0) {
          providerKeys[0].isDefault = true
        }
      }

      // 如果该供应商没有密钥了，从活跃供应商中移除
      const hasProviderKeys = updatedKeys.some(k => k.providerId === keyToDelete.providerId)
      let updatedActiveProviders = activeProviders
      if (!hasProviderKeys) {
        updatedActiveProviders = activeProviders.filter(p => p !== keyToDelete.providerId)
      }

      set({
        keys: updatedKeys,
        activeProviders: updatedActiveProviders,
      })
      await saveToStorage(get())
    },

    /**
     * 更新密钥
     */
    updateKey: async (keyId: string, updates: Partial<ApiKey>) => {
      const { keys } = get()
      const updatedKeys = keys.map(k =>
        k.id === keyId ? { ...k, ...updates } : k
      )

      set({ keys: updatedKeys })
      await saveToStorage(get())
    },

    /**
     * 设置默认密钥
     */
    setDefaultKey: async (keyId: string) => {
      const { keys } = get()
      const targetKey = keys.find(k => k.id === keyId)

      if (!targetKey) return

      // 取消该供应商的其他默认密钥，设置新的默认
      const updatedKeys = keys.map(k =>
        k.providerId === targetKey.providerId
          ? { ...k, isDefault: k.id === keyId }
          : k
      )

      set({ keys: updatedKeys })
      await saveToStorage(get())
    },

    /**
     * 验证密钥
     */
    validateKey: async (keyId: string) => {
      const { keys } = get()
      const key = keys.find(k => k.id === keyId)

      if (!key) {
        return { isValid: false, error: '密钥不存在' }
      }

      set({ validatingKeyId: keyId })

      try {
        const result = await ProviderValidator.validate(
          key.providerId,
          key.keyValue,
          key.metadata
        )

        const updatedKeys = keys.map(k =>
          k.id === keyId
            ? {
                ...k,
                status: result.isValid ? 'active' : 'error',
                errorMessage: result.error,
                lastValidatedAt: Date.now(),
              }
            : k
        )

        set({ keys: updatedKeys, validatingKeyId: null })
        await saveToStorage(get())

        return result
      } catch (error) {
        set({ validatingKeyId: null })
        return {
          isValid: false,
          error: (error as Error).message || '验证失败'
        }
      }
    },

    /**
     * 测试连接
     */
    testConnection: async (keyId: string) => {
      set({ testingKeyId: keyId })
      const result = await get().validateKey(keyId)
      set({ testingKeyId: null })
      return result.isValid
    },

    /**
     * 激活供应商
     */
    activateProvider: (providerId: ProviderType) => {
      const { activeProviders } = get()
      if (!activeProviders.includes(providerId)) {
        set({ activeProviders: [...activeProviders, providerId] })
        saveToStorage(get())
      }
    },

    /**
     * 停用供应商
     */
    deactivateProvider: (providerId: ProviderType) => {
      const { activeProviders } = get()
      set({
        activeProviders: activeProviders.filter(p => p !== providerId)
      })
      saveToStorage(get())
    },

    /**
     * 设置默认供应商
     */
    setDefaultProvider: (providerId: ProviderType) => {
      set({ defaultProvider: providerId })
      saveToStorage(get())
    },

    /**
     * 获取指定供应商的所有密钥
     */
    getKeysByProvider: (providerId: ProviderType) => {
      return get().keys.filter(k => k.providerId === providerId)
    },

    /**
     * 获取指定供应商的默认密钥
     */
    getDefaultKey: (providerId: ProviderType) => {
      return get().keys.find(
        k => k.providerId === providerId && k.isDefault
      )
    },

    /**
     * 获取当前活跃的密钥（优先返回默认密钥）
     */
    getActiveKey: (providerId: ProviderType) => {
      const { keys } = get()
      return (
        keys.find(k => k.providerId === providerId && k.isDefault) ||
        keys.find(k => k.providerId === providerId && k.status === 'active') ||
        keys.find(k => k.providerId === providerId)
      )
    },

    /**
     * 获取当前使用的 API Key（用于聊天）
     */
    getCurrentApiKey: () => {
      const { defaultProvider } = get()
      const activeKey = get().getActiveKey(defaultProvider)
      return activeKey?.keyValue || null
    },

    /**
     * 清空所有数据
     */
    clearAll: async () => {
      await secureStorage.deleteApiKeysStorage()
      await secureStorage.migrateOldKey()

      const defaultStorage: ApiKeysStorage = {
        keys: [],
        providers: PROVIDERS,
        activeProviders: [],
        defaultProvider: 'deepseek',
      }
      await secureStorage.setApiKeysStorage(defaultStorage)

      set({
        keys: [],
        activeProviders: [],
        defaultProvider: 'deepseek',
      })
    },

    // ========================================
    // 蕾姆新增：动态供应商管理方法
    // ========================================

    /**
     * 添加自定义供应商
     * @param providerData 供应商数据（不包含 id、stats、status、isBuiltIn）
     * @returns 新创建的供应商 ID
     */
    addProvider: async (providerData) => {
      const { providers } = get()

      // 蕾姆生成唯一 ID：custom-时间戳
      const id: ProviderType = `custom-${Date.now()}`

      const newProvider: Provider = {
        ...providerData,
        id,
        stats: { calls: 0, success: 0, latency: 0 },
        status: 'inactive',
        isBuiltIn: false, // 蕾姆标记：这是自定义供应商
      }

      // 添加到供应商列表
      set({ providers: [...providers, newProvider] })
      await saveToStorage(get())

      return id
    },

    /**
     * 更新供应商（仅限自定义供应商）
     * @param providerId 供应商 ID
     * @param updates 要更新的字段
     */
    updateProvider: async (providerId, updates) => {
      const { providers } = get()
      const provider = providers.find(p => p.id === providerId)

      if (!provider) {
        throw new Error('供应商不存在')
      }

      // 蕾姆保护：内置供应商不允许修改
      if (provider.isBuiltIn) {
        throw new Error('不能修改内置供应商')
      }

      // 更新供应商
      const updatedProviders = providers.map(p =>
        p.id === providerId ? { ...p, ...updates } : p
      )

      set({ providers: updatedProviders })
      await saveToStorage(get())
    },

    /**
     * 删除供应商（仅限自定义供应商）
     * @param providerId 供应商 ID
     */
    deleteProvider: async (providerId) => {
      const { providers, keys, activeProviders, defaultProvider } = get()
      const provider = providers.find(p => p.id === providerId)

      if (!provider) {
        throw new Error('供应商不存在')
      }

      // 蕾姆保护：内置供应商不允许删除
      if (provider.isBuiltIn) {
        throw new Error('不能删除内置供应商')
      }

      // 检查是否有关联的密钥
      const associatedKeys = keys.filter(k => k.providerId === providerId)
      if (associatedKeys.length > 0) {
        throw new Error(
          `该供应商下还有 ${associatedKeys.length} 个密钥，请先删除密钥后再删除供应商`
        )
      }

      // 删除供应商
      const updatedProviders = providers.filter(p => p.id !== providerId)
      const updatedActiveProviders = activeProviders.filter(p => p !== providerId)

      set({
        providers: updatedProviders,
        activeProviders: updatedActiveProviders,
      })

      // 如果删除的是默认供应商，重置为 deepseek
      if (defaultProvider === providerId) {
        set({ defaultProvider: 'deepseek' })
      }

      await saveToStorage(get())
    },

    /**
     * 检查供应商是否可以删除
     * @param providerId 供应商 ID
     * @returns { canDelete: boolean, reason?: string }
     */
    canDeleteProvider: (providerId) => {
      const { providers, keys } = get()
      const provider = providers.find(p => p.id === providerId)

      if (!provider) {
        return { canDelete: false, reason: '供应商不存在' }
      }

      if (provider.isBuiltIn) {
        return { canDelete: false, reason: '内置供应商不能删除' }
      }

      const associatedKeys = keys.filter(k => k.providerId === providerId)
      if (associatedKeys.length > 0) {
        return {
          canDelete: false,
          reason: `该供应商下还有 ${associatedKeys.length} 个密钥`,
        }
      }

      return { canDelete: true }
    },

    /**
     * 获取所有内置供应商
     */
    getBuiltInProviders: () => {
      return get().providers.filter(p => p.isBuiltIn !== false)
    },

    /**
     * 获取所有自定义供应商
     */
    getCustomProviders: () => {
      return get().providers.filter(p => p.isBuiltIn === false)
    },

    /**
     * 蕾姆新增：更新供应商模型列表
     * @param providerId 供应商 ID
     * @param models 模型列表
     *
     * 此方法允许更新内置供应商的 models 字段
     * 用于在测试连接成功后更新可用模型列表
     */
    updateProviderModels: async (providerId, models) => {
      const { providers } = get()
      const provider = providers.find(p => p.id === providerId)

      if (!provider) {
        console.warn(`蕾姆：供应商 ${providerId} 不存在，无法更新模型列表`)
        return
      }

      // 更新供应商的 models 字段
      const updatedProviders = providers.map(p =>
        p.id === providerId ? { ...p, models } : p
      )

      set({ providers: updatedProviders })
      await saveToStorage(get())

      console.log(`蕾姆：已更新供应商 ${providerId} 的模型列表`, models)
    },
  }))
)

// ========================================
// 蕾姆：跨窗口同步初始化
// ========================================

/**
 * 在应用启动时调用此函数以启用跨窗口同步
 *
 * 使用示例：
 * ```tsx
 * import { initCrossWindowSync } from './stores/apiKeyStore'
 *
 * useEffect(() => {
 *   const unlistenPromise = initCrossWindowSync()
 *   return () => {
 *     unlistenPromise.then(unlisten => unlisten())
 *   }
 * }, [])
 * ```
 */
export async function initCrossWindowSync() {
  return enableCrossWindowSync(
    useApiKeyStore,
    ['initialize'],  // 重新调用 initialize 方法
    CrossWindowEventType.API_KEYS_UPDATED
  )
}
