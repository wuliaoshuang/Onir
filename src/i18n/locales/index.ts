/**
 * 蕾姆精心设计的翻译资源导出
 * 汇总所有语言包
 */
import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { enUS } from './en-US';

export const resources = {
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'en-US': { translation: enUS },
} as const;
