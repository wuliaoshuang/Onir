/**
 * 蕾姆精心设计的跨窗口事件通信系统
 * 基于 Electron IPC 实现
 *
 * 使用场景：
 * - Settings 窗口修改配置后，Main 窗口自动刷新
 * - 任意窗口更新主题后，其他窗口同步更新主题
 * - 语言切换等全局状态同步
 */

// ========================================
// 事件类型定义
// ========================================

export enum CrossWindowEventType {
  // 主题相关事件
  THEME_UPDATED = 'theme-updated',                 // 主题设置更新（模式、颜色、字体等）

  // 语言相关事件
  LANGUAGE_UPDATED = 'language-updated',           // 语言设置更新

  // API 密钥相关事件
  API_KEYS_UPDATED = 'api-keys-updated',           // API 密钥列表更新

  // 供应商相关事件
  PROVIDERS_UPDATED = 'providers-updated',         // 供应商列表更新
}

// ========================================
// 事件数据接口
// ========================================

export interface ThemeUpdatedEvent {
  timestamp: number
  windowLabel: string  // 发送事件的窗口标识
}

export interface LanguageUpdatedEvent {
  language: string
  timestamp: number
  windowLabel: string
}

// ========================================
// 事件发送器（使用 Electron IPC）
// ========================================

/**
 * 发送跨窗口事件
 * @param eventType 事件类型
 * @param payload 事件数据
 */
export async function emitCrossWindowEvent<T = any>(
  eventType: CrossWindowEventType,
  payload?: T
): Promise<void> {
  try {
    // 🎯 蕾姆：使用 BroadcastChannel API 发送跨窗口事件
    if (!channel) {
      channel = new BroadcastChannel('onir-cross-window-events')
    }

    channel.postMessage({
      type: 'cross-window-event',
      eventType,
      payload
    })

    console.log(`✅ 蕾姆：发送跨窗口事件 [${eventType}]`, payload)
  } catch (error) {
    console.error(`❌ 蕾姆：发送跨窗口事件失败 [${eventType}]`, error)
  }
}

// ========================================
// 便捷事件发送函数
// ========================================

export async function notifyThemeUpdated(): Promise<void> {
  await emitCrossWindowEvent<ThemeUpdatedEvent>(
    CrossWindowEventType.THEME_UPDATED,
    {
      timestamp: Date.now(),
      windowLabel: window.electronAPI?.getWindowType() || 'unknown'
    }
  )
}

export async function notifyLanguageUpdated(language: string): Promise<void> {
  await emitCrossWindowEvent<LanguageUpdatedEvent>(
    CrossWindowEventType.LANGUAGE_UPDATED,
    {
      language,
      timestamp: Date.now(),
      windowLabel: window.electronAPI?.getWindowType() || 'unknown'
    }
  )
}

export async function notifyApiKeysUpdated(): Promise<void> {
  await emitCrossWindowEvent(CrossWindowEventType.API_KEYS_UPDATED, {
    timestamp: Date.now(),
    windowLabel: window.electronAPI?.getWindowType() || 'unknown'
  })
}

export async function notifyProvidersUpdated(): Promise<void> {
  await emitCrossWindowEvent(CrossWindowEventType.PROVIDERS_UPDATED, {
    timestamp: Date.now(),
    windowLabel: window.electronAPI?.getWindowType() || 'unknown'
  })
}

// ========================================
// 事件监听器（使用 BroadcastChannel API）
// ========================================

type UnlistenFunction = () => void

let channel: BroadcastChannel | null = null

/**
 * 监听跨窗口事件
 * @param eventType 事件类型
 * @param handler 事件处理函数
 * @returns 取消监听函数
 */
export function listenCrossWindowEvent<T = any>(
  eventType: CrossWindowEventType,
  handler: (payload: T) => void | Promise<void>
): Promise<UnlistenFunction> {
  // 🎯 蕾姆：使用 BroadcastChannel API 实现跨窗口通信
  if (!channel) {
    channel = new BroadcastChannel('onir-cross-window-events')
  }

  const messageHandler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'cross-window-event' && event.data.eventType === eventType) {
      console.log(`📥 蕾姆：收到跨窗口事件 [${eventType}]`, event.data.payload)
      handler(event.data.payload)
    }
  }

  channel.addEventListener('message', messageHandler)

  console.log(`🔈 蕾姆：开始监听跨窗口事件 [${eventType}]`)

  // 返回取消监听函数
  return Promise.resolve(() => {
    channel?.removeEventListener('message', messageHandler)
    console.log(`🔕 蕾姆：停止监听跨窗口事件 [${eventType}]`)
  })
}

// ========================================
// 高级工具：自动同步 Store
// ========================================

/**
 * 为 Store 启用跨窗口自动同步
 * @param store Zustand Store 实例
 * @param eventType 事件类型
 * @returns 取消同步函数
 */
export async function enableCrossWindowSync<T extends object>(
  store: any,
  eventType: CrossWindowEventType
): Promise<UnlistenFunction> {
  console.log(`🔄 蕾姆：启用跨窗口 Store 同步 [${eventType}]`)

  // 监听其他窗口的更新事件
  const unlisten = await listenCrossWindowEvent(eventType, async (payload) => {
    console.log(`📥 蕾姆：收到 Store 更新事件 [${eventType}]`, payload)

    // 重新初始化 Store（从 localStorage 读取最新数据）
    if (typeof store.getState().initTheme === 'function') {
      store.getState().initTheme()
    }
    if (typeof store.getState().reloadFromStorage === 'function') {
      store.getState().reloadFromStorage()
    }
  })

  return unlisten
}
