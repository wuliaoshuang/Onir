/**
 * 蕾姆精心设计的语言状态管理 Store
 * 使用 Zustand + persist 中间件实现持久化
 * 完全参照 themeStore 的设计模式
 * ✨ 支持跨窗口语言同步
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LanguageCode } from '../i18n/config';
import { DEFAULT_LANGUAGE } from '../i18n/config';
import i18n from '../i18n/config';
import { notifyLanguageUpdated } from '../lib/crossWindowEvents';

// ========================================
// 类型定义
// ========================================
export type LocaleSettings = {
  language: LanguageCode;
};

interface LocaleState extends LocaleSettings {
  // ========== Actions ==========

  // 设置语言
  setLanguage: (language: LanguageCode) => void;

  // 切换到下一个语言
  toggleLanguage: () => void;

  // 重置为默认语言
  resetLanguage: () => void;

  // 初始化语言（从存储恢复）
  initLanguage: () => void;

  // 从 localStorage 重新加载语言设置（用于跨窗口同步）
  reloadFromStorage: () => void;
}

// ========================================
// 辅助函数
// ========================================

/**
 * 获取支持的语言代码列表
 */
const SUPPORTED_LANGUAGES: LanguageCode[] = ['zh-CN', 'zh-TW', 'en-US'];

/**
 * 获取下一个语言（循环切换）
 */
const getNextLanguage = (current: LanguageCode): LanguageCode => {
  const currentIndex = SUPPORTED_LANGUAGES.indexOf(current);
  const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
  return SUPPORTED_LANGUAGES[nextIndex];
};

// ========================================
// DOM 应用函数（参照 applyThemeToDOM）
// ========================================

/**
 * 将语言设置应用到 i18n 实例
 */
const applyLanguageToI18n = (language: LanguageCode) => {
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
};

// ========================================
// Store 创建
// ========================================
export const useLocaleStore = create<LocaleState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        language: DEFAULT_LANGUAGE,

        // ========== Actions ==========

        setLanguage: (language) => {
          set({ language });
          applyLanguageToI18n(language);

          // 蕾姆：通知所有窗口语言已更新
          notifyLanguageUpdated(language).catch(err => console.error('发送语言更新事件失败:', err))
        },

        toggleLanguage: () => {
          const current = get().language;
          const next = getNextLanguage(current);
          set({ language: next });
          applyLanguageToI18n(next);

          // 蕾姆：通知所有窗口语言已更新
          notifyLanguageUpdated(next).catch(err => console.error('发送语言更新事件失败:', err))
        },

        resetLanguage: () => {
          set({ language: DEFAULT_LANGUAGE });
          applyLanguageToI18n(DEFAULT_LANGUAGE);

          // 蕾姆：通知所有窗口语言已更新
          notifyLanguageUpdated(DEFAULT_LANGUAGE).catch(err => console.error('发送语言更新事件失败:', err))
        },

        initLanguage: () => {
          const state = get();
          applyLanguageToI18n(state.language);
        },

        reloadFromStorage: () => {
          // 蕾姆：从 localStorage 读取最新语言设置
          const storageKey = 'onir-locale-storage';
          const storedData = localStorage.getItem(storageKey);

          if (storedData) {
            try {
              const parsed = JSON.parse(storedData);
              if (parsed.language && parsed.language !== get().language) {
                console.log('🔄 蕾姆：从 localStorage 重新加载语言设置 =', parsed.language)
                set({ language: parsed.language });
                applyLanguageToI18n(parsed.language);
              }
            } catch (error) {
              console.error('❌ 蕾姆：解析语言设置失败', error);
            }
          }
        },
      }),
      {
        name: 'onir-locale-storage',
        // 持久化语言设置
        partialize: (state) => ({
          language: state.language,
        }),
      }
    ),
    { name: 'LocaleStore' }
  )
);

// ========================================
// Selectors
// ========================================
export const selectLanguage = (state: LocaleState) => state.language;
