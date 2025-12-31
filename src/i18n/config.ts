/**
 * 蕾姆精心设计的 i18n 初始化配置
 * 支持简体中文、繁体中文、英语三种语言
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from './locales';

// ========================================
// 支持的语言列表
// ========================================
export const SUPPORTED_LANGUAGES = {
  'zh-CN': {
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  'zh-TW': {
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇨🇳'
  },
  'en-US': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
export const DEFAULT_LANGUAGE: LanguageCode = 'zh-CN';

// ========================================
// i18n 初始化
// ========================================
i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传递 i18n 实例给 react-i18next
  .use(initReactI18next)
  // 初始化
  .init({
    resources,

    // 默认语言
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,

    // 语言检测配置
    detection: {
      // 检测顺序：localStorage -> 浏览器语言
      order: ['localStorage', 'navigator'],
      // 缓存用户语言选择
      caches: ['localStorage'],
      lookupLocalStorage: 'onir-locale',
    },

    // 调试模式（生产环境关闭）
    debug: import.meta.env.DEV,

    // 插值配置
    interpolation: {
      escapeValue: false, // React 已经防止 XSS
    },

    // 命名空间（可选，用于大型项目）
    defaultNS: 'translation',
    ns: ['translation'],

    // React 特定配置
    react: {
      useSuspense: false, // 禁用 Suspense（桌面应用更适合）
    },
  });

export default i18n;
