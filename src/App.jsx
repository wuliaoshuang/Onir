import { useState } from 'react'
import {
  Send, Plus, Code, Image, FileText, Settings,
  User, Bot, Copy, Check, Ellipsis, MessageSquare,
  Paperclip, Mic, Sticker, Smile, X
} from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [showTools, setShowTools] = useState(false)

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
    <div className="h-screen flex bg-[#f5f5f7]">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-black/5 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#95C0EC] rounded-xl flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-[#1d1d1f] text-[15px]">Assistant</span>
              <p className="text-[13px] text-[#86868b]">AI Chat</p>
            </div>
          </div>
        </div>

        {/* 新对话按钮 */}
        <div className="p-3">
          <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#95C0EC] text-white rounded-xl text-[15px] font-medium hover:bg-[#7aaddd] active:scale-[0.98] transition-all shadow-sm shadow-[#95C0EC]/20">
            <Plus className="w-4 h-4" />
            新对话
          </button>
        </div>

        {/* 快捷操作 */}
        <div className="px-3 pb-4">
          <p className="text-[13px] text-[#86868b] px-4 mb-2 font-medium">快捷操作</p>
          <div className="space-y-0.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-[#1d1d1f] hover:bg-black/[0.03] active:bg-black/[0.05] transition-colors"
              >
                <action.icon className="w-4 h-4 text-[#95C0EC]" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        <div className="flex-1 px-3 overflow-y-auto">
          <p className="text-[13px] text-[#86868b] px-4 mb-2 font-medium">历史</p>
          <div className="space-y-0.5">
            {['项目构思', '代码重构', '文案优化', '技术方案', '产品规划'].map((item) => (
              <button
                key={item}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-[#1d1d1f] hover:bg-black/[0.03] active:bg-black/[0.05] transition-colors text-left group"
              >
                <MessageSquare className="w-4 h-4 text-[#86868b] group-hover:text-[#95C0EC] transition-colors" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-3 border-t border-black/5">
          <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-[#1d1d1f] hover:bg-black/[0.03] active:bg-black/[0.05] transition-colors">
            <Settings className="w-4 h-4 text-[#86868b]" />
            设置
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-14 bg-white/60 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-6">
          <h2 className="text-[15px] font-medium text-[#1d1d1f]">新对话</h2>
          <button className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors">
            <Ellipsis className="w-5 h-5 text-[#86868b]" />
          </button>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#95C0EC] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="group relative max-w-md">
                  <div className={`px-5 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#95C0EC] text-white'
                      : 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.03]'
                  }`}>
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  {/* 悬浮操作 */}
                  <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                  }`}>
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="p-2 bg-white/90 backdrop-blur-xl border border-black/5 rounded-xl hover:bg-white transition-all shadow-sm shadow-black/[0.03]"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-[#95C0EC]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#86868b]" />
                      )}
                    </button>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-[#e5e5ea] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#86868b]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="px-5 py-4 bg-white/60 backdrop-blur-xl border-t border-black/5">
          <div className="max-w-4xl mx-auto">
            {/* 输入框 */}
            <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.03] border border-black/5 focus-within:border-[#95C0EC]/50 focus-within:shadow-md focus-within:shadow-[#95C0EC]/10 transition-all overflow-hidden">
              {/* 工具栏 */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-black/5">
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors relative"
                >
                  <Plus className="w-4 h-4 text-[#86868b]" />
                </button>
                <button className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors">
                  <Paperclip className="w-4 h-4 text-[#86868b]" />
                </button>
                <button className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors">
                  <Image className="w-4 h-4 text-[#86868b]" />
                </button>
                <div className="flex-1" />
                <button className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors">
                  <Mic className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>

              {/* 文本输入区 */}
              <div className="flex items-end gap-2 px-4 py-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="输入消息... (⌘Enter 发送)"
                  className="flex-1 bg-transparent resize-none outline-none text-[15px] text-[#1d1d1f] placeholder-[#86868b] min-h-[24px] max-h-48 leading-relaxed"
                  rows={1}
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                    input.trim()
                      ? 'bg-[#95C0EC] text-white hover:bg-[#7aaddd] shadow-sm shadow-[#95C0EC]/20'
                      : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 提示文本 */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <p className="text-[13px] text-[#86868b]">
                AI 可能产生错误，请核实重要信息
              </p>
              <span className="text-[#86868b]">·</span>
              <button className="text-[13px] text-[#95C0EC] hover:underline">
                查看快捷键
              </button>
            </div>
          </div>
        </div>

        {/* 展开工具面板 */}
        {showTools && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/[0.1] border border-black/5 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => setShowTools(false)}
              className="absolute top-2 right-2 p-1 hover:bg-black/[0.03] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
            <div className="grid grid-cols-4 gap-1">
              {toolItems.map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-black/[0.03] active:bg-black/[0.05] transition-colors min-w-[80px]"
                >
                  <item.icon className="w-5 h-5 text-[#95C0EC]" />
                  <span className="text-[13px] text-[#1d1d1f]">{item.label}</span>
                  <span className="text-[11px] text-[#86868b]">{item.shortcut}</span>
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
