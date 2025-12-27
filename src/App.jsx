import { useState, useRef, useEffect } from 'react'
import {
  Send, Plus, Code, Image, FileText, Settings,
  Copy, Check, Ellipsis, MessageSquare,
  Paperclip, Mic, Sticker, X, PanelLeftClose, PanelLeftOpen, Menu
} from 'lucide-react'
import { MessageContent } from './components/MessageContent'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: `# Markdown 渲染测试

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

试试发送包含 Markdown 的消息吧！🚀` }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 光标状态
  const [isFocused, setIsFocused] = useState(false) // 跟踪输入框是否聚焦
  const [caretVisible, setCaretVisible] = useState(false)
  const [tailActive, setTailActive] = useState(false)
  const [isTyping, setIsTyping] = useState(false) // 输入状态，用于暂停闪烁
  const [caretHeight, setCaretHeight] = useState(22) // 动态光标高度
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 })
  const textareaRef = useRef(null)
  const mirrorRef = useRef(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const tailTimeoutRef = useRef(null)
  const typingTimeoutRef = useRef(null) // 输入后恢复闪烁的定时器
  const focusCooldownRef = useRef(false) // 聚焦冷却期，禁用拖尾

  // 目标位置（相对于容器）
  const targetPosRef = useRef({ x: 0, y: 0 })
  const moveDirectionRef = useRef(1) // 移动方向：1=向右，-1=向左

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
      mirror.style[prop] = computed[prop]
    })
  }

  // 计算光标高度（基于行高）
  const calculateCaretHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return 22

    const computed = window.getComputedStyle(textarea)
    const fontSize = parseFloat(computed.fontSize)
    const lineHeight = computed.lineHeight

    let height
    if (lineHeight === 'normal') {
      height = fontSize * 1.2
    } else {
      height = parseFloat(lineHeight)
    }

    // 确保高度合理
    return Math.max(18, Math.min(height, 40))
  }

  // 检查光标是否在可视区域内
  const isCaretVisible = (rawX, rawY) => {
    const textarea = textareaRef.current
    if (!textarea) return true

    const computed = window.getComputedStyle(textarea)
    const paddingTop = parseFloat(computed.paddingTop)
    const paddingBottom = parseFloat(computed.paddingBottom)
    const paddingLeft = parseFloat(computed.paddingLeft)
    const paddingRight = parseFloat(computed.paddingRight)

    // textarea 的可视区域边界（包含 padding）
    const viewportTop = textarea.scrollTop
    const viewportBottom = textarea.scrollTop + textarea.clientHeight
    const viewportLeft = textarea.scrollLeft
    const viewportRight = textarea.scrollLeft + textarea.clientWidth

    // 有效内容区域（排除 padding）
    const contentTop = paddingTop
    const contentBottom = textarea.scrollHeight - paddingBottom
    const contentLeft = paddingLeft
    const contentRight = textarea.scrollWidth - paddingRight

    // 光标位置和尺寸
    const caretTop = rawY
    const caretBottom = rawY + caretHeight
    const caretLeft = rawX
    const caretRight = rawX + 2.5 // 光标宽度

    // 【关键】检查光标是否在有效内容区域内（严格检查，不能进入 padding 区域）
    // 光标顶部必须在有效内容区域内
    const inContentY = caretTop >= contentTop && caretTop < contentBottom
    const inContentX = caretLeft >= contentLeft && caretLeft < contentRight

    // 检查光标是否在可视区域内
    const tolerance = 2 // 小容差
    const isVisibleY = caretBottom > viewportTop + tolerance && caretTop < viewportBottom - tolerance
    const isVisibleX = caretRight > viewportLeft + tolerance && caretLeft < viewportRight - tolerance

    return inContentY && inContentX && isVisibleY && isVisibleX
  }

  // 获取光标位置（使用纯 offsetLeft/offsetTop 方案 - 更可靠）
  const getCaretPosition = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return { x: 0, y: 0, height: 22, rawX: 0, rawY: 0 }

    const computed = window.getComputedStyle(textarea)

    // 计算光标高度
    const height = calculateCaretHeight()
    setCaretHeight(height)

    // 获取 textarea 的 offset（相对于其 offsetParent）
    const textareaOffsetX = textarea.offsetLeft
    const textareaOffsetY = textarea.offsetTop

    // 设置 mirror 的样式以匹配 textarea
    const properties = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'letterSpacing', 'lineHeight', 'textTransform',
      'wordSpacing', 'whiteSpace', 'wordWrap', 'textAlign',
      'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
      'borderWidth', 'boxSizing'
    ]
    properties.forEach(prop => {
      mirror.style[prop] = computed[prop]
    })

    // 【关键修复】mirror 宽度必须与 textarea 的 clientWidth 同步
    mirror.style.width = textarea.clientWidth + 'px'

    // 复制内容到光标位置
    const textBeforeCaret = textarea.value.substring(0, textarea.selectionStart)
    mirror.textContent = textBeforeCaret

    // 插入定位探针
    const span = document.createElement('span')
    span.textContent = '|'
    mirror.appendChild(span)

    // 【核心】使用 offsetLeft/offsetTop 获取位置
    // span.offsetLeft 是相对于 mirror 的，已经包含了 padding
    const rawX = span.offsetLeft // 在内容中的原始位置
    const rawY = span.offsetTop // 在内容中的原始位置

    // 加上 textarea.offsetLeft 得到相对于容器的位置（减去滚动）
    const x = rawX + textareaOffsetX - textarea.scrollLeft
    const y = rawY + textareaOffsetY - textarea.scrollTop

    // 清理探针
    mirror.removeChild(span)

    return { x, y, height, rawX, rawY }
  }

  // 自动增高 textarea
  const autoGrowTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto'

    // 计算新高度（最小高度 24px，最大高度 240px）
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 240)
    textarea.style.height = newHeight + 'px'
  }

  // 更新光标位置
  const updateCaret = (isInputEvent = false, enableTail = true) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const pos = getCaretPosition()

    // 计算移动方向（用于尾巴方向）
    const dx = pos.x - lastPosRef.current.x
    if (dx > 0.5) {
      moveDirectionRef.current = 1
    } else if (dx < -0.5) {
      moveDirectionRef.current = -1
    }

    const dy = pos.y - lastPosRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 移动超过阈值时触发尾巴（冷却期或 enableTail 为 false 时不触发）
    if (enableTail && !focusCooldownRef.current && distance > 3) {
      setTailActive(true)
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)
      tailTimeoutRef.current = setTimeout(() => setTailActive(false), 150)
    }

    lastPosRef.current = pos

    // 直接设置目标位置（相对于容器）
    targetPosRef.current = {
      x: pos.x,
      y: pos.y
    }

    // 输入时暂停闪烁
    if (isInputEvent) {
      setIsTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      // 800ms 后恢复闪烁
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800)
    }

    // 触发重渲染来更新光标位置
    setCaretPosition(pos)

    // 【关键】只有聚焦时且光标在可视区域内才显示光标
    if (isFocused) {
      const visible = isCaretVisible(pos.rawX, pos.rawY)
      setCaretVisible(visible)
    }
  }

  // 初始化和窗口变化时同步样式
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

  // 监听输入变化
  useEffect(() => {
    updateCaret(true) // 输入变化时标记为输入事件
  }, [input])

  // 监听 input 变化来自动增高 textarea
  useEffect(() => {
    autoGrowTextarea()
  }, [input])

  const handleInputFocus = () => {
    setIsFocused(true)
    syncMirrorStyle()

    // 聚焦时主动关闭拖尾效果
    setTailActive(false)
    if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current)

    // 进入冷却期，防止聚焦时触发拖尾
    focusCooldownRef.current = true
    setTimeout(() => {
      focusCooldownRef.current = false
    }, 200) // 200ms 冷却期

    // 先获取当前位置并初始化 lastPosRef
    const pos = getCaretPosition()
    lastPosRef.current = pos
    // 直接设置位置，不通过 updateCaret（避免重复获取位置）
    targetPosRef.current = { x: pos.x, y: pos.y }
    setCaretPosition(pos)
    setCaretHeight(pos.height)

    // 【关键】聚焦时也检查光标是否在可视区域内
    const visible = isCaretVisible(pos.rawX, pos.rawY)
    setCaretVisible(visible)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    setTimeout(() => setCaretVisible(false), 100)
  }

  const quickActions = [
    { icon: Code, label: '代码生成' },
    { icon: Image, label: '图像分析' },
    { icon: FileText, label: '文档总结' }
  ]

  const toolItems = [
    { icon: Paperclip, label: '上传文件', shortcut: '⌘⇧U' },
    { icon: Image, label: '发送图片', shortcut: '⌘⇧I' },
    { icon: Mic, label: '语音输入', shortcut: '⌘⇧V' },
    { icon: Sticker, label: '表情符号', shortcut: '⌘⇧E' },
  ]

  const handleSend = () => {
    if (!input.trim()) return
    const newMessage = { id: Date.now(), role: 'user', content: input }
    setMessages([...messages, newMessage])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '我收到了你的消息："' + input + '"\n\n这是一个演示界面。'
      }])
    }, 500)
  }

  const copyMessage = (id, content) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-screen flex bg-[#f5f5f7] dark:bg-black">
        {/* 移动端遮罩 - 无边框，纯模糊背景 */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* 侧边栏 - macOS 风格无边框 */}
        <aside className={`
          fixed lg:relative z-50 h-full
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex flex-col
          transition-all duration-300 ease-out
        `}>
          {/* Logo 区域 */}
          <div className={ sidebarCollapsed ? "py-4" : "p-4" }>
            {sidebarCollapsed ? (
              /* 折叠状态：Logo 图标 hover 变成展开按钮 */
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="group/btn relative w-9 h-9 mx-auto flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#95C0EC] to-[#7aaddd] rounded-xl flex items-center justify-center shadow-lg shadow-[#95C0EC]/30 transition-all duration-200 group-hover/btn:scale-105">
                  <svg className="w-5 h-5 text-white transition-opacity duration-200 group-hover/btn:opacity-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <PanelLeftOpen className="w-5 h-5 text-white absolute opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
                </div>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[12px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  展开侧边栏
                </div>
              </button>
            ) : (
              /* 展开状态：Logo + 折叠按钮 */
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#95C0EC] to-[#7aaddd] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#95C0EC]/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-[17px] tracking-tight">Assistant</span>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
                  title="收起侧边栏"
                >
                  <PanelLeftClose className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                </button>
              </div>
            )}
          </div>

          {/* 折叠状态：按钮区域 */}
          {sidebarCollapsed ? (
            <div className="flex-1 flex flex-col items-center gap-2 py-2">
              {/* 新对话 */}
              <button className="group/btn relative w-9 h-9 bg-[#95C0EC] text-white rounded-xl flex items-center justify-center hover:bg-[#7aaddd] dark:hover:bg-[#b0d4f0] active:scale-95 transition-all duration-200 shadow-lg shadow-[#95C0EC]/25">
                <Plus className="w-5 h-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[12px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  新对话
                </div>
              </button>

              {/* 快捷操作 */}
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="group/btn relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                >
                  <action.icon className="w-5 h-5 text-[#95C0EC]" />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[12px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {action.label}
                  </div>
                </button>
              ))}

              {/* 底部设置 */}
              <button className="group/btn relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 mt-auto">
                <Settings className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[12px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  设置
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* 展开状态：新对话按钮 */}
              <div className="px-3 pb-3">
                <button className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-[#95C0EC] text-white rounded-2xl text-[15px] font-medium hover:bg-[#7aaddd] dark:hover:bg-[#b0d4f0] active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[#95C0EC]/25">
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span>新对话</span>
                </button>
              </div>

              {/* 快捷操作 */}
              <div className="px-3 pb-4">
                <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">快捷操作</p>
                <div className="space-y-0.5">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                    >
                      <action.icon className="w-4 h-4 text-[#95C0EC]" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 历史记录 */}
              <div className="flex-1 px-3 overflow-y-auto">
                <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">历史</p>
                <div className="space-y-0.5">
                  {['项目构思', '代码重构', '文案优化', '技术方案', '产品规划'].map((item) => (
                    <button
                      key={item}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93] flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 底部设置按钮 */}
              <div className="p-3">
                <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200">
                  <Settings className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                  <span>设置</span>
                </button>
              </div>
            </>
          )}
        </aside>

        {/* 主区域 */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* 顶部栏 - macOS 风格无边框，纯背景色 */}
          <header className="h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
              <h2 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">新对话</h2>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
                <Ellipsis className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
            </div>
          </header>

          {/* 消息区域 - 去除边框，纯白背景 */}
          <div className="flex-1 overflow-y-auto bg-[#f5f5f7] dark:bg-black">
            <div className="py-6 max-w-3xl mx-auto px-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group ${message.role === 'user' ? 'flex justify-end py-3' : 'py-4'}`}
                >
                  {/* AI 消息 */}
                  {message.role === 'assistant' && (
                    <div className="flex-1 relative pb-8">
                      <div className="prose prose-sm max-w-none">
                        <MessageContent content={message.content} />
                      </div>
                      {/* 操作按钮 - 左下角（消息下方），直接显示 */}
                      <div className="absolute bottom-0 left-0 flex items-center gap-1">
                        <button
                          onClick={() => copyMessage(message.id, message.content)}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-[#95C0EC]"
                          title="复制"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-4 h-4 text-[#95C0EC]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-[#95C0EC]"
                          title="重新生成"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-[#95C0EC]"
                          title="点赞"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-[#95C0EC]"
                          title="点踩"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 用户消息 */}
                  {message.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="relative group/bubble max-w-xl">
                        <div className="px-5 py-3 bg-[#95C0EC] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#95C0EC]/20">
                          <div className="prose prose-sm max-w-none prose-p:text-white prose-invert">
                            <MessageContent content={message.content} />
                          </div>
                        </div>
                        {/* 操作按钮 - 右下角 */}
                        <div className="absolute -bottom-8 right-0 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMessage(message.id, message.content)}
                            className="p-1.5 bg-white dark:bg-[#1c1c1e] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
                            title="复制"
                          >
                            {copiedId === message.id ? (
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

          {/* 输入区域 - macOS 风格悬浮卡片 */}
          <div className="bg-gradient-to-t from-[#f5f5f7] dark:from-black via-[#f5f5f7] dark:via-black to-transparent p-4 pb-6">
            <div className="max-w-3xl mx-auto">
              {/* 悬浮输入框 */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
                {/* 工具栏 - 无边框分隔 */}
                <div className="flex items-center gap-1 px-4 py-3">
                  <button
                    onClick={() => setShowTools(!showTools)}
                    className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                  </button>
                  <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
                    <Paperclip className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                  </button>
                  <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
                    <Image className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                  </button>
                  <div className="flex-1" />
                  <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
                    <Mic className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                  </button>
                </div>

                {/* 文本输入区 */}
                <div className="relative flex items-start gap-3 px-4 pb-4">
                  <div className="flex-1 relative">
                    {/* 镜像层 - 必须与 textarea 在同一容器内 */}
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
                      onChange={(e) => {
                        setInput(e.target.value)
                        // updateCaret 由 useEffect 监听 input 变化自动触发
                      }}
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

                    {/* 自定义光标组件 - 相对于 textarea 容器 */}
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
                            }}
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

              {/* 提示文本 */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <p className="text-[12px] text-[#86868b] dark:text-[#636366]">
                  AI 可能产生错误，请核实重要信息
                </p>
                <span className="text-[#d1d1d6] dark:text-[#4a4a4c]">·</span>
                <button className="text-[12px] text-[#95C0EC] hover:underline">
                  查看快捷键
                </button>
              </div>
            </div>
          </div>

          {/* 展开工具面板 - macOS 风格 */}
          {showTools && (
            <div className="absolute bottom-28 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => setShowTools(false)}
                className="absolute top-3 right-3 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <X className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {toolItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center gap-2 px-4 py-3 sm:px-5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 text-[#95C0EC]" />
                    <span className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">{item.label}</span>
                    <span className="text-[10px] text-[#86868b] dark:text-[#636366] hidden sm:inline">{item.shortcut}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
    </div>
  )
}

export default App
