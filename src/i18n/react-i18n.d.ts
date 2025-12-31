/**
 * 蕾姆精心设计的 i18n TypeScript 类型声明
 * 为翻译资源提供完整的类型安全支持
 */
import 'react-i18next';
import { zhCN } from './locales/zh-CN';

// 声明翻译资源类型
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof zhCN;
    defaultNS: 'translation';
    ns: 'translation';
  }
}
