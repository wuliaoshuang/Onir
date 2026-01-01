/**
 * 蕾姆精心设计的聊天状态管理 Store
 * 使用 Zustand 实现轻量级、类型安全的状态管理
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ========================================
// 🎯 蕾姆：全局消息 ID 生成器，确保唯一性
// 使用时间戳 + 随机数，避免冲突
// ========================================
const getNextMessageId = (): number => {
  // 时间戳（13位） + 随机数（4位）
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return parseInt(`${timestamp}${random.toString().padStart(4, '0')}`)
}

// ========================================
// 类型定义
// ========================================
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: number
  role: MessageRole
  content: string
  timestamp?: number
}

// 🎯 蕾姆：右侧面板 Tab 类型
export type RightPanelTab = 'files' | 'terminal' | 'preview'

// 🎯 蕾姆：右侧面板状态（每个会话独立）
export interface RightPanelState {
  visible: boolean
  activeTab: RightPanelTab
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  // 🎯 蕾姆：每个对话独立选择的模型
  selectedModel?: string
  // 🎯 蕾姆：标题生成状态
  hasGeneratedTitle?: boolean
  isGeneratingTitle?: boolean
  // 🎯 蕾姆：每个对话独立的面板状态
  rightPanel?: RightPanelState
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  prompt?: string
}

// 🎯 蕾姆：流式状态定义
export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'

export interface StreamingState {
  status: GenerationStatus
  messageId: number | null
  abortController: AbortController | null
  error?: string | null
}

// ========================================
// Store 状态与操作
// ========================================
interface ChatState {
  // 当前对话列表
  conversations: Conversation[]

  // 当前激活的对话 ID
  activeConversationId: string | null

  // 快捷操作配置
  quickActions: QuickAction[]

  // 🎯 核心：每个会话独立的流式状态 Map（不持久化）
  streamingStates: Map<string, StreamingState>

  // ========== Actions ==========

  // 创建新对话
  createConversation: (title?: string) => string

  // 删除对话
  deleteConversation: (id: string) => void

  // 切换当前对话
  setActiveConversation: (id: string) => void

  // 重命名对话
  renameConversation: (id: string, newTitle: string) => void

  // 🎯 修改：添加消息时指定会话 ID
  addMessage: (conversationId: string, role: MessageRole, content: string) => number

  // 更新指定对话的消息列表
  setMessages: (conversationId: string, messages: Message[]) => void

  // 获取指定对话
  getConversation: (id: string) => Conversation | undefined

  // 获取当前对话
  getActiveConversation: () => Conversation | undefined

  // 清空所有对话
  clearAll: () => void

  // ========== 流式状态管理 ==========

  // 获取会话的流式状态
  getStreamingState: (conversationId: string) => StreamingState | undefined

  // 设置会话的流式状态
  setStreamingState: (conversationId: string, state: Partial<StreamingState>) => void

  // 🎯 修改：更新流式内容时校验会话和消息 ID
  updateStreamingContent: (conversationId: string, messageId: number, content: string) => void

  // 取消指定会话的生成
  abortConversationGeneration: (conversationId: string) => void

  // ========== 🎯 模型管理 ==========

  // 设置对话的模型
  setConversationModel: (conversationId: string, model: string) => void

  // 获取对话的模型
  getConversationModel: (conversationId: string) => string | undefined

  // ========== 🎯 标题生成管理 ==========

  // 标记标题生成完成
  setTitleGenerated: (conversationId: string) => void

  // 设置标题生成状态
  setTitleGenerating: (conversationId: string, isGenerating: boolean) => void

  // ========== 🎯 右侧面板状态管理 ==========

  // 获取会话的面板状态（带默认值）
  getConversationPanelState: (conversationId: string) => RightPanelState

  // 设置面板可见性
  setConversationPanelVisible: (conversationId: string, visible: boolean) => void

  // 设置面板激活 tab
  setConversationPanelTab: (conversationId: string, tab: RightPanelTab) => void

  // 打开面板并切换到指定 tab（悬浮按钮使用）
  openConversationPanelWithTab: (conversationId: string, tab: RightPanelTab) => void
}

// ========================================
// Store 创建
// ========================================
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        // 🎯 蕾姆：空初始状态，让用户看到空状态界面
        conversations: [],
        activeConversationId: null,

        quickActions: [
          { id: 'code', label: '代码生成', icon: 'Code', prompt: '请帮我生成以下代码：' },
          { id: 'image', label: '图像分析', icon: 'Image', prompt: '请分析这张图片：' },
          { id: 'doc', label: '文档总结', icon: 'FileText', prompt: '请总结以下文档：' },
        ],

        // 🎯 核心：每个会话独立的流式状态（不持久化）
        streamingStates: new Map<string, StreamingState>(),

        // ========== Actions ==========

        createConversation: (title = '新对话') => {
          const newConversation: Conversation = {
            id: `conv_${Date.now()}`,
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            activeConversationId: newConversation.id,
          }))

          return newConversation.id
        },

        deleteConversation: (id) => {
          // 🎯 蕾姆：删除会话时完全清理（取消请求 + 清理状态）
          const { streamingStates } = get()
          const streamingState = streamingStates.get(id)

          // 1. 取消正在进行的请求
          if (streamingState?.abortController) {
            streamingState.abortController.abort()
          }

          set((state) => {
            const filtered = state.conversations.filter((c) => c.id !== id)

            // 2. 清理流式状态
            const newStreamingStates = new Map(state.streamingStates)
            newStreamingStates.delete(id)

            // 3. 如果删除的是当前对话，切换到第一个对话
            let newActiveId = state.activeConversationId
            if (state.activeConversationId === id) {
              newActiveId = filtered.length > 0 ? filtered[0].id : null
            }

            return {
              conversations: filtered,
              activeConversationId: newActiveId,
              streamingStates: newStreamingStates,
            }
          })
        },

        setActiveConversation: (id) => {
          // 🎯 蕾姆：切换会话时，之前的生成继续静默进行
          set({ activeConversationId: id })
        },

        renameConversation: (id, newTitle) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
            ),
          }))
        },

        addMessage: (conversationId, role, content) => {
          const newMessage: Message = {
            id: getNextMessageId(),
            role,
            content,
            timestamp: Date.now(),
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))

          return newMessage.id
        },

        setMessages: (conversationId, messages) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages, updatedAt: Date.now() }
                : c
            ),
          }))
        },

        getConversation: (id) => {
          const { conversations } = get()
          return conversations.find((c) => c.id === id)
        },

        getActiveConversation: () => {
          const { conversations, activeConversationId } = get()
          return conversations.find((c) => c.id === activeConversationId)
        },

        clearAll: () => {
          set({
            conversations: [],
            activeConversationId: null,
            streamingStates: new Map(),
          })
        },

        // ========== 流式状态管理 ==========

        getStreamingState: (conversationId) => {
          const { streamingStates } = get()
          return streamingStates.get(conversationId)
        },

        setStreamingState: (conversationId, state) => {
          set((store) => {
            const newStreamingStates = new Map(store.streamingStates)
            const currentState = newStreamingStates.get(conversationId) || {
              status: 'idle' as const,
              messageId: null,
              abortController: null,
            }
            newStreamingStates.set(conversationId, { ...currentState, ...state })
            return { streamingStates: newStreamingStates }
          })
        },

        updateStreamingContent: (conversationId, messageId, content) => {
          const streamingState = get().streamingStates.get(conversationId)

          // 🎯 蕾姆：严格校验，只更新当前会话正在生成的消息
          if (
            !streamingState ||
            streamingState.messageId !== messageId ||
            streamingState.status !== 'generating'
          ) {
            console.warn('Invalid streaming update', { conversationId, messageId, streamingState })
            return
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === messageId ? { ...m, content } : m
                    ),
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        abortConversationGeneration: (conversationId) => {
          const { streamingStates } = get()
          const streamingState = streamingStates.get(conversationId)

          if (streamingState?.abortController) {
            streamingState.abortController.abort()
          }

          set((state) => {
            const newStreamingStates = new Map(state.streamingStates)
            newStreamingStates.set(conversationId, {
              status: 'idle',
              messageId: null,
              abortController: null,
            })
            return { streamingStates: newStreamingStates }
          })
        },

        // ========== 🎯 模型管理 ==========

        setConversationModel: (conversationId, model) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, selectedModel: model, updatedAt: Date.now() }
                : c
            ),
          }))
        },

        getConversationModel: (conversationId) => {
          const { conversations } = get()
          return conversations.find((c) => c.id === conversationId)?.selectedModel
        },

        // ========== 🎯 标题生成管理 ==========

        setTitleGenerated: (conversationId) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, hasGeneratedTitle: true, isGeneratingTitle: false }
                : c
            ),
          }))
        },

        setTitleGenerating: (conversationId, isGenerating) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, isGeneratingTitle: isGenerating }
                : c
            ),
          }))
        },

        // ========== 🎯 右侧面板状态管理 ==========

        // 🎯 蕾姆：获取会话的面板状态，如果没有则返回默认值
        // 默认关闭面板，显示悬浮按钮组
        getConversationPanelState: (conversationId) => {
          const { conversations } = get()
          const conversation = conversations.find((c) => c.id === conversationId)
          return conversation?.rightPanel ?? { visible: false, activeTab: 'files' }
        },

        // 🎯 蕾姆：设置面板可见性
        setConversationPanelVisible: (conversationId, visible) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    rightPanel: {
                      ...c.rightPanel,
                      visible,
                      activeTab: c.rightPanel?.activeTab ?? 'files',
                    },
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        // 🎯 蕾姆：设置面板激活 tab
        setConversationPanelTab: (conversationId, activeTab) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    rightPanel: {
                      visible: c.rightPanel?.visible ?? true,
                      activeTab,
                    },
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        // 🎯 蕾姆：打开面板并切换到指定 tab（悬浮按钮使用）
        openConversationPanelWithTab: (conversationId, activeTab) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    rightPanel: { visible: true, activeTab },
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },
      }),
      {
        name: 'chat-storage',
        // 持久化配置 - streamingStates 不持久化
        partialize: (state) => ({
          conversations: state.conversations,
          activeConversationId: state.activeConversationId,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
)

// ========================================
// Selectors（优化性能，避免不必要的重渲染）
// ========================================
// 🎯 蕾姆：使用常量空数组避免引用变化导致的无限循环
const EMPTY_MESSAGES: Message[] = []

export const selectActiveConversation = (state: ChatState) =>
  state.conversations.find((c) => c.id === state.activeConversationId)

export const selectActiveMessages = (state: ChatState): Message[] => {
  const conversation = state.conversations.find((c) => c.id === state.activeConversationId)
  return conversation?.messages ?? EMPTY_MESSAGES
}
