/**
 * 蕾姆精心设计的用户设置 Store
 * 管理用户的全局偏好设置
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserSettings } from '../services/secureStorage'
import { secureStorage } from '../services/secureStorage'

// 默认系统提示词
const DEFAULT_SYSTEM_PROMPT = '你是蕾姆，一个友好的 AI 助手。'

interface UserSettingsState {
  // 状态
  systemPrompt: string

  // Actions
  setSystemPrompt: (prompt: string) => Promise<void>
  resetSystemPrompt: () => Promise<void>
  initialize: () => Promise<void>
}

/**
 * 用户设置 Store
 * 使用 Zustand + persist 实现状态管理和持久化
 */
export const useUserSettingsStore = create<UserSettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        systemPrompt: DEFAULT_SYSTEM_PROMPT,

        // ========== Actions ==========

        /**
         * 设置系统提示词
         */
        setSystemPrompt: async (prompt: string) => {
          const trimmedPrompt = prompt.trim()
          set({ systemPrompt: trimmedPrompt })

          // 保存到加密存储
          try {
            const currentSettings = await secureStorage.getUserSettings()
            await secureStorage.setUserSettings({
              ...currentSettings,
              systemPrompt: trimmedPrompt,
            })
          } catch (error) {
            console.error('保存系统提示词失败:', error)
          }
        },

        /**
         * 重置系统提示词为默认值
         */
        resetSystemPrompt: async () => {
          set({ systemPrompt: DEFAULT_SYSTEM_PROMPT })

          // 保存到加密存储
          try {
            const currentSettings = await secureStorage.getUserSettings()
            await secureStorage.setUserSettings({
              ...currentSettings,
              systemPrompt: DEFAULT_SYSTEM_PROMPT,
            })
          } catch (error) {
            console.error('重置系统提示词失败:', error)
          }
        },

        /**
         * 初始化：从加密存储加载用户设置
         */
        initialize: async () => {
          try {
            const savedSettings = await secureStorage.getUserSettings()
            if (savedSettings) {
              set({ systemPrompt: savedSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT })
            }
          } catch (error) {
            console.error('加载用户设置失败:', error)
          }
        },
      }),
      {
        name: 'user-settings-storage',
        // 持久化配置
        partialize: (state) => ({
          systemPrompt: state.systemPrompt,
        }),
      }
    ),
    { name: 'UserSettingsStore' }
  )
)

// 导出默认系统提示词
export const DEFAULT_PROMPT = DEFAULT_SYSTEM_PROMPT
