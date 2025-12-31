/**
 * 蕾姆精心设计的聊天状态管理 Store
 * 使用 Zustand 实现轻量级、类型安全的状态管理
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

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

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  prompt?: string
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

  // ========== 流式消息状态（新增） ==========

  // 当前正在流式传输的消息 ID
  streamingMessageId: number | null

  // 是否正在生成
  isGenerating: boolean

  // ========== Actions ==========

  // 创建新对话
  createConversation: (title?: string) => string

  // 删除对话
  deleteConversation: (id: string) => void

  // 切换当前对话
  setActiveConversation: (id: string) => void

  // 重命名对话
  renameConversation: (id: string, newTitle: string) => void

  // 添加消息到当前对话
  addMessage: (role: MessageRole, content: string) => void

  // 更新指定对话的消息列表
  setMessages: (conversationId: string, messages: Message[]) => void

  // 获取当前对话
  getActiveConversation: () => Conversation | undefined

  // 清空所有对话
  clearAll: () => void

  // ========== 流式消息 Actions（新增） ==========

  // 开始流式消息
  startStreamingMessage: () => number

  // 更新流式内容
  updateStreamingContent: (messageId: number, content: string) => void

  // 完成流式消息
  completeStreamingMessage: (messageId: number) => void

  // 中断生成
  abortGeneration: () => void
}

// ========================================
// Store 创建
// ========================================
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        conversations: [
          {
            id: 'default',
            title: '新对话',
            messages: [
              {
                id: 1,
                role: 'assistant',
                content: `# Markdown 渲染测试

你好！我是 AI 助手，这是**富文本渲染**效果的演示：

## 📝 支持的语法

### 1. 文字样式
- **粗体文字**
- *斜体文字*
- ~~删除线~~ (GFM)

### 2. 代码
行内代码：\`console.log('Hello')\`

代码块：
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`)
  return true
}
\`\`\`

### 3. 链接
访问 [OpenAI](https://openai.com) 了解更多

### 4. 列表
- 第一项
- 第二项
  - 嵌套项
- 第三项

### 5. 引用
> 这是一段引用文字
> 可以有多行

---

试试发送包含 Markdown 的消息吧！🚀`,
                timestamp: Date.now(),
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        activeConversationId: 'default',

        quickActions: [
          { id: 'code', label: '代码生成', icon: 'Code', prompt: '请帮我生成以下代码：' },
          { id: 'image', label: '图像分析', icon: 'Image', prompt: '请分析这张图片：' },
          { id: 'doc', label: '文档总结', icon: 'FileText', prompt: '请总结以下文档：' },
        ],

        // ========== 流式消息 Initial State（新增） ==========
        streamingMessageId: null,
        isGenerating: false,

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
          set((state) => {
            const filtered = state.conversations.filter((c) => c.id !== id)

            // 如果删除的是当前对话，切换到第一个对话
            let newActiveId = state.activeConversationId
            if (state.activeConversationId === id) {
              newActiveId = filtered.length > 0 ? filtered[0].id : null
            }

            return {
              conversations: filtered,
              activeConversationId: newActiveId,
            }
          })
        },

        setActiveConversation: (id) => {
          set({ activeConversationId: id })
        },

        renameConversation: (id, newTitle) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
            ),
          }))
        },

        addMessage: (role, content) => {
          const { activeConversationId, conversations } = get()
          if (!activeConversationId) return

          const newMessage: Message = {
            id: Date.now(),
            role,
            content,
            timestamp: Date.now(),
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
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

        getActiveConversation: () => {
          const { conversations, activeConversationId } = get()
          return conversations.find((c) => c.id === activeConversationId)
        },

        clearAll: () => {
          set({
            conversations: [],
            activeConversationId: null,
          })
        },

        // ========== 流式消息 Actions（新增） ==========

        /**
         * 开始流式消息
         * 创建一个空的助手消息并返回消息 ID
         */
        startStreamingMessage: () => {
          const { activeConversationId } = get()
          if (!activeConversationId) {
            throw new Error('没有激活的对话')
          }

          const newMessage: Message = {
            id: Date.now(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    updatedAt: Date.now(),
                  }
                : c
            ),
            streamingMessageId: newMessage.id,
            isGenerating: true,
          }))

          return newMessage.id
        },

        /**
         * 更新流式消息内容
         */
        updateStreamingContent: (messageId: number, content: string) => {
          const { activeConversationId } = get()
          if (!activeConversationId) return

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === messageId ? { ...m, content } : m
                    ),
                  }
                : c
            ),
          }))
        },

        /**
         * 完成流式消息
         */
        completeStreamingMessage: (messageId: number) => {
          set((state) => ({
            streamingMessageId: null,
            isGenerating: false,
          }))
        },

        /**
         * 中断生成
         */
        abortGeneration: () => {
          set({
            streamingMessageId: null,
            isGenerating: false,
          })
        },
      }),
      {
        name: 'chat-storage',
        // 持久化配置
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
export const selectActiveConversation = (state: ChatState) =>
  state.conversations.find((c) => c.id === state.activeConversationId)

export const selectActiveMessages = (state: ChatState) =>
  state.conversations.find((c) => c.id === state.activeConversationId)?.messages || []
