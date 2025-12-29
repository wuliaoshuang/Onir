/**
 * 蕾姆精心设计的独立聊天页面
 * 包含左侧会话列表和右侧聊天区域
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Send, Plus, Copy, Check, MessageSquare, Search,
  Ellipsis, Menu, X,
} from 'lucide-react'
import { MessageContent } from '../components/MessageContent'
import { ThemeToggle } from '../components/ThemeToggle'
import { useChatStore, selectActiveMessages } from '../stores/chatStore'
import { useUIStore } from '../stores/uiStore'

function ChatListPage() {
  const navigate = useNavigate()
  // 尝试获取 id 参数，如果没有则返回 undefined（适用于 /chats 路由）
  const params = useParams({ strict: false })
  const id = params.id as string | undefined
  const messages = useChatStore(selectActiveMessages)
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
  } = useChatStore()
  const {
    copiedMessageId,
    copyToClipboard,
    mobileChatSidebarOpen,
    setMobileChatSidebarOpen,
  } = useUIStore()

  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 光标状态
  const [isFocused, setIsFocused] = useState(false)
  const [caretVisible, setCaretVisible] = useState(false)
  const [tailActive, setTailActive] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [caretHeight, setCaretHeight] = useState(22)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const tailTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const focusCooldownRef = useRef(false)
  const targetPosRef = useRef({ x: 0, y: 0 })
  const moveDirectionRef = useRef(1)

  // 同步 mirror 样式
  const syncMirrorStyle = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return

    const computed = window.getComputedStyle(textarea)
    const properties = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'letterSpacing', 'lineHeight', 'textTransform',
      'wordSpacing', 'paddingTop', 'paddingBottom',
      'paddingLeft', 'paddingRight', 'borderLeftWidth',
      'borderRightWidth', 'borderTopWidth', 'borderBottomWidth',
      'width', 'maxWidth', 'whiteSpace', 'wordWrap',
      'textAlign', 'textIndent', 'boxSizing'
    ]
    properties.forEach(prop => {
      mirror.style[prop as any] = computed[prop as any]
    })
  }

  const calculateCaretHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return 22
    const computed = window.getComputedStyle(textarea)
    const fontSize = parseFloat(computed.fontSize)
    const lineHeight = computed.lineHeight
    let height = lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(lineHeight)
    return Math.max(18, Math.min(height, 40))
  }

  const isCaretVisible = (rawX: number, rawY: number) => {
    const textarea = textareaRef.current
    if (!textarea) return true
    const computed = window.getComputedStyle(textarea)
    const paddingTop = parseFloat(computed.paddingTop)
    const paddingBottom = parseFloat(computed.paddingBottom)
    const contentTop = paddingTop
    const contentBottom = textarea.scrollHeight - paddingBottom
    const viewportTop = textarea.scrollTop
    const viewportBottom = textarea.scrollTop + textarea.clientHeight
    const caretTop = rawY
    const inContentY = caretTop >= contentTop && caretTop < contentBottom
    const isVisibleY = caretTop > viewportTop + 2 && caretTop < viewportBottom - 2
    return inContentY && isVisibleY
  }

  const getCaretPosition = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return { x: 0, y: 0, height: 22, rawX: 0, rawY: 0 }

    const height = calculateCaretHeight()
    setCaretHeight(height)

    const computed = window.getComputedStyle(textarea)
    const textareaOffsetX = textarea.offsetLeft
    const textareaOffsetY = textarea.offsetTop

    const properties = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'letterSpacing', 'lineHeight', 'textTransform',
      'wordSpacing', 'whiteSpace', 'wordWrap', 'textAlign',
      'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
      'borderWidth', 'boxSizing'
    ]
    properties.forEach(prop => { mirror.style[prop as any] = computed[prop as any] })
    mirror.style.width = textarea.clientWidth + 'px'

    const textBeforeCaret = textarea.value.substring(0, textarea.selectionStart)
    mirror.textContent = textBeforeCaret

    const span = document.createElement('span')
    span.textContent = '|'
    mirror.appendChild(span)

    const rawX = span.offsetLeft
    const rawY = span.offsetTop

    const x = rawX + textareaOffsetX - textarea.scrollLeft
    const y = rawY + textareaOffsetY - textarea.scrollTop

    mirror.removeChild(span)

    return { x, y, height, rawX, rawY }
  }

  const updateCaret = (isInputEvent = false, enableTail = true) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const pos = getCaretPosition()
    const dx = pos.x - lastPosRef.current.x
    if (dx > 0.5) moveDirectionRef.current = 1
    else if (dx < -0.5) moveDirectionRef.current = -1

    const distance = Math.sqrt(dx * dx + Math.pow(pos.y - lastPosRef.current.y, 2))

    if (enableTail && !focusCooldownRef.current && distance > 3) {
      setTailActive(true)
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)
      tailTimeoutRef.current = setTimeout(() => setTailActive(false), 150)
    }

    lastPosRef.current = pos
    targetPosRef.current = { x: pos.x, y: pos.y }

    if (isInputEvent) {
      setIsTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800)
    }

    if (isFocused) {
      const visible = isCaretVisible(pos.rawX, pos.rawY)
      setCaretVisible(visible)
    }
  }

  useEffect(() => {
    syncMirrorStyle()
    const handleResize = () => {
      syncMirrorStyle()
      setCaretHeight(calculateCaretHeight())
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)
    }
  }, [])

  useEffect(() => { updateCaret(true) }, [input, isFocused])

  const handleInputFocus = () => {
    setIsFocused(true)
    syncMirrorStyle()
    setTailActive(false)
    if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)
    focusCooldownRef.current = true
    setTimeout(() => { focusCooldownRef.current = false }, 200)

    const pos = getCaretPosition()
    lastPosRef.current = pos
    targetPosRef.current = { x: pos.x, y: pos.y }
    setCaretHeight(pos.height)
    setCaretVisible(isCaretVisible(pos.rawX, pos.rawY))
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    setTimeout(() => setCaretVisible(false), 100)
  }

  const handleSend = () => {
    if (!input.trim()) return
    useChatStore.getState().addMessage('user', input)
    const userInput = input
    setInput('')
    setTimeout(() => {
      useChatStore.getState().addMessage('assistant', `我收到了你的消息："${userInput}"\n\n这是一个演示界面。`)
    }, 500)
  }

  const handleNewChat = () => {
    const newId = createConversation('新对话')
    navigate({ to: '/conversation/$id', params: { id: newId } })
    setMobileChatSidebarOpen(false)
  }

  const handleSelectConversation = (convId: string) => {
    setActiveConversation(convId)
    if (convId === 'default') {
      navigate({ to: '/' })
    } else {
      navigate({ to: '/conversation/$id', params: { id: convId } })
    }
    setMobileChatSidebarOpen(false)
  }

  // 过滤会话
  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConv = conversations.find(c => c.id === activeConversationId)

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      {/* 顶部栏 */}
      <header className="h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex items-center justify-between px-4 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            onClick={() => setMobileChatSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
          <h1 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {activeConv?.title || '新对话'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all">
            <Ellipsis className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 会话侧边栏 - 桌面应用优化 */}
        <aside
          className={`
            ${mobileChatSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:relative h-full z-40 md:z-0
            w-72 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl
            border-r border-[#e5e5ea] dark:border-[#3a3a3c]
            flex flex-col transition-transform duration-300
          `}
        >
          {/* 移动端遮罩 */}
          {mobileChatSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 md:hidden z-[-1]"
              onClick={() => setMobileChatSidebarOpen(false)}
            />
          )}

          {/* 搜索框 */}
          <div className="p-4 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] dark:text-[#636366]" />
              <input
                type="text"
                placeholder="搜索对话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#636366] outline-none focus:ring-2 focus:ring-[#95C0EC]/20"
              />
            </div>
          </div>

          {/* 新对话按钮 */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#95C0EC] text-white rounded-xl text-[14px] font-medium hover:bg-[#7aaddd] dark:hover:bg-[#b0d4f0] transition-all shadow-lg shadow-[#95C0EC]/25"
            >
              <Plus className="w-4 h-4" />
              新对话
            </button>
          </div>

          {/* 对话列表 */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                    activeConversationId === conv.id
                      ? 'bg-[#95C0EC]/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    activeConversationId === conv.id ? 'text-[#95C0EC]' : 'text-[#86868b] dark:text-[#636366]'
                  }`} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-[14px] font-medium truncate ${
                      activeConversationId === conv.id ? 'text-[#95C0EC]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'
                    }`}>
                      {conv.title}
                    </p>
                    <p className="text-[12px] text-[#86868b] dark:text-[#636366] truncate">
                      {conv.messages[conv.messages.length - 1]?.content.slice(0, 30) || '暂无消息'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 聊天区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-6 max-w-3xl mx-auto px-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group ${message.role === 'user' ? 'flex justify-end py-3' : 'py-4'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-1 relative pb-8">
                      <div className="prose prose-sm max-w-none">
                        <MessageContent content={message.content} />
                      </div>
                      <div className="absolute bottom-0 left-0 flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all text-[#86868b] dark:text-[#8e8e93]"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-4 h-4 text-[#95C0EC]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {message.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="relative group/bubble max-w-xl">
                        <div className="px-5 py-3 bg-[#95C0EC] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#95C0EC]/20">
                          <div className="prose prose-sm max-w-none prose-p:text-white prose-invert">
                            <MessageContent content={message.content} />
                          </div>
                        </div>
                        <div className="absolute -bottom-8 right-0 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1.5 bg-white dark:bg-[#1c1c1e] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-[#95C0EC]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 输入区域 */}
          <div className="bg-gradient-to-t from-[#f5f5f7] dark:from-black via-[#f5f5f7] dark:via-black to-transparent p-4 pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
                <div className="relative flex items-start gap-3 px-4 py-4">
                  <div className="flex-1 relative">
                    <div
                      ref={mirrorRef}
                      id="caret-mirror"
                      style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        zIndex: -1,
                        overflow: 'hidden',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    />
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      onClick={updateCaret}
                      onKeyUp={updateCaret}
                      onSelect={updateCaret}
                      onScroll={updateCaret}
                      onKeyDown={(e) => {
                        updateCaret()
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder="输入消息..."
                      className="custom-caret-textarea w-full bg-transparent resize-none outline-none text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#636366] min-h-[24px] max-h-60 leading-relaxed py-2 overflow-y-auto block"
                      style={{ height: 'auto' }}
                    />

                    {/* 彗星光标 */}
                    {caretVisible && (
                      <div
                        className={`comet-caret absolute pointer-events-none ${isTyping ? 'typing' : ''}`}
                        data-direction={moveDirectionRef.current > 0 ? '1' : '-1'}
                        style={{
                          transform: `translate(${targetPosRef.current.x}px, ${targetPosRef.current.y}px)`,
                        }}
                      >
                        <div className={`comet-tail ${tailActive ? 'active' : ''}`} />
                        {tailActive && [...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="comet-particle"
                            style={{
                              '--particle-offset': `${(i + 1) * 10 + 8}px`,
                              width: `${6 - i}px`,
                              height: `${6 - i}px`,
                              opacity: 0.6 - i * 0.12,
                              animation: `particle-fade 0.4s ease-out ${i * 0.03}s both`,
                            } as React.CSSProperties}
                          />
                        ))}
                        <div className="comet-caret-main" style={{ height: `${caretHeight}px` }}>
                          <div className="comet-caret-glow" />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`p-3 rounded-2xl transition-all duration-200 active:scale-95 self-end shrink-0 ${
                      input.trim()
                        ? 'bg-[#95C0EC] text-white hover:bg-[#7aaddd] dark:hover:bg-[#b0d4f0] shadow-lg shadow-[#95C0EC]/25'
                        : 'bg-[#e5e5ea] dark:bg-[#3a3a3c] text-[#86868b] dark:text-[#636366] cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-3">
                <p className="text-[12px] text-[#86868b] dark:text-[#636366]">
                  AI 可能产生错误，请核实重要信息
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatListPage
