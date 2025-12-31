/**
 * 蕾姆的 Electron API 类型定义
 *
 * 为整个项目提供统一的 Electron API 类型支持
 */

declare global {
  interface Window {
    /**
     * Electron API 接口
     * 蕾姆通过预加载脚本安全地暴露这些 API
     */
    electronAPI?: {
      /**
       * 获取当前平台信息
       * @returns 'darwin' | 'win32' | 'linux' | etc.
       */
      getPlatform: () => string;

      /**
       * 获取当前窗口类型
       * @returns 'main' | 'settings'
       */
      getWindowType: () => 'main' | 'settings';

      /**
       * 打开独立的设置窗口
       * 如果设置窗口已存在，会聚焦到该窗口
       */
      openSettingsWindow: () => void;

      /**
       * 关闭设置窗口
       * 通常从设置窗口内部调用
       */
      closeSettingsWindow: () => void;

      /**
       * 监听窗口类型变化
       * @param callback 窗口类型变化时的回调函数
       * @returns 清理函数，用于取消监听
       */
      onWindowTypeChange: (callback: (type: 'main' | 'settings') => void) => () => void;
    };

    /**
     * Tauri API 接口（降级方案）
     * 蕾姆：保留用于兼容性，项目已迁移到 Electron
     * @deprecated 请使用 electronAPI
     */
    __TAURI__?: any;
  }
}

// 蕾姆：确保这是一个模块，以便全局声明生效
export {};
