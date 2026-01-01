/**
 * 蕾姆精心设计的安全存储服务
 * 使用 localStorage + AES-GCM 加密实现安全的本地存储
 *
 * 安全特性：
 * - 使用 Web Crypto API (AES-GCM 256位) 加密
 * - 每次加密都使用唯一的 IV（初始化向量）
 * - 密钥基于应用标识符生成，无法在本地轻易破解
 * - 不需要输入系统密码，体验更流畅
 *
 * v2 更新：支持多供应商多密钥存储
 */

import { encryptObject, decryptObject, isEncrypted } from '../lib/encryption'
import type { ApiKeysStorage } from '../types/apiKeys'

const STORAGE_PREFIX = 'onir_'
const KEYS_KEY_V2 = `${STORAGE_PREFIX}api_keys_v2` // 新版本存储键
const USER_SETTINGS_KEY = `${STORAGE_PREFIX}user_settings` // 🎯 蕾姆：用户设置存储键

// 🎯 蕾姆：用户设置类型定义
export interface UserSettings {
  systemPrompt: string  // 用户自定义的系统提示词
}

export interface SecureStorageService {
  // ========== 旧版 API（保持兼容，迁移后废弃）==========
  setApiKey(key: string): Promise<void>
  getApiKey(): Promise<string | null>
  removeApiKey(): Promise<void>
  hasApiKey(): Promise<boolean>

  // ========== 新版 API（v2 多密钥支持）==========
  getApiKeysStorage(): Promise<ApiKeysStorage | null>
  setApiKeysStorage(storage: ApiKeysStorage): Promise<void>
  deleteApiKeysStorage(): Promise<void>

  // ========== 🎯 蕾姆：用户设置 API ==========
  getUserSettings(): Promise<UserSettings | null>
  setUserSettings(settings: UserSettings): Promise<void>
  deleteUserSettings(): Promise<void>

  // ========== 迁移工具 ==========
  migrateOldKey(): Promise<void>
}

/**
 * 加密存储实现（基于 localStorage + AES-GCM）
 */
class EncryptedStorage implements SecureStorageService {
  private readonly oldKey = `${STORAGE_PREFIX}deepseek_api_key` // 旧版本存储键

  // ========================================
  // 辅助函数
  // ========================================

  /**
   * 保存加密数据到 localStorage
   */
  private async saveEncrypted(key: string, data: any): Promise<void> {
    try {
      const encryptedJson = await encryptObject(data)
      localStorage.setItem(key, encryptedJson)
    } catch (error) {
      console.error(`保存加密数据失败 (${key}):`, error)
      throw new Error('无法保存数据')
    }
  }

  /**
   * 从 localStorage 读取并解密数据
   */
  private async loadEncrypted<T>(key: string): Promise<T | null> {
    try {
      const encryptedJson = localStorage.getItem(key)
      if (!encryptedJson) {
        return null
      }

      // 检查是否为加密格式（兼容旧版本未加密的数据）
      if (!isEncrypted(encryptedJson)) {
        console.warn(`蕾姆：发现未加密数据 (${key})，自动重新加密`)
        // 未加密的数据，直接解析后重新加密保存
        const data = JSON.parse(encryptedJson)
        await this.saveEncrypted(key, data)
        return data as T
      }

      // 解密数据
      return await decryptObject<T>(encryptedJson)
    } catch (error) {
      console.error(`读取加密数据失败 (${key}):`, error)
      return null
    }
  }

  /**
   * 从 localStorage 删除数据
   */
  private removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  // ========================================
  // 旧版 API（保持兼容，迁移后废弃）
  // ========================================

  /**
   * 保存 API Key 到加密存储（旧版）
   * @deprecated 使用 setApiKeysStorage 替代
   */
  async setApiKey(key: string): Promise<void> {
    await this.saveEncrypted(this.oldKey, key)
  }

  /**
   * 从加密存储获取 API Key（旧版）
   * @deprecated 使用 getApiKeysStorage 替代
   */
  async getApiKey(): Promise<string | null> {
    const result = await this.loadEncrypted<string>(this.oldKey)
    return result
  }

  /**
   * 从加密存储删除 API Key（旧版）
   * @deprecated 使用 deleteApiKeysStorage 替代
   */
  async removeApiKey(): Promise<void> {
    this.removeItem(this.oldKey)
  }

  /**
   * 检查是否已配置 API Key（旧版）
   * @deprecated 使用 getApiKeysStorage 替代
   */
  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey()
    return key !== null && key.length > 0
  }

  // ========================================
  // 新版 API（v2 多密钥支持）
  // ========================================

  /**
   * 获取所有密钥和配置（新版）
   */
  async getApiKeysStorage(): Promise<ApiKeysStorage | null> {
    return await this.loadEncrypted<ApiKeysStorage>(KEYS_KEY_V2)
  }

  /**
   * 保存所有密钥和配置（新版）
   */
  async setApiKeysStorage(storage: ApiKeysStorage): Promise<void> {
    await this.saveEncrypted(KEYS_KEY_V2, storage)
  }

  /**
   * 删除所有密钥数据（新版）
   */
  async deleteApiKeysStorage(): Promise<void> {
    this.removeItem(KEYS_KEY_V2)
  }

  // ========================================
  // 🎯 蕾姆：用户设置 API
  // ========================================

  /**
   * 获取用户设置
   */
  async getUserSettings(): Promise<UserSettings | null> {
    return await this.loadEncrypted<UserSettings>(USER_SETTINGS_KEY)
  }

  /**
   * 保存用户设置
   */
  async setUserSettings(settings: UserSettings): Promise<void> {
    await this.saveEncrypted(USER_SETTINGS_KEY, settings)
  }

  /**
   * 删除用户设置
   */
  async deleteUserSettings(): Promise<void> {
    this.removeItem(USER_SETTINGS_KEY)
  }

  // ========================================
  // 迁移工具
  // ========================================

  /**
   * 清空旧的 DeepSeek 密钥（迁移用）
   */
  async migrateOldKey(): Promise<void> {
    this.removeItem(this.oldKey)
  }
}

/**
 * 导出单例
 */
export const secureStorage = new EncryptedStorage()
