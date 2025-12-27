import { useState } from 'react'
import {
  Send, Plus, Code, Image, FileText, Settings,
  User, Bot, Copy, Check, Edit3, MoreHorizontal
} from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '你好！我是 AI 助手，有什么可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const quickActions = [
    { icon: Code, label: '代码生成' },
    { icon: Image, label: '图像分析' },
    { icon: FileText, label: '文档总结' }
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
    <div className="h-screen flex bg-white">
      {/* 侧边栏 */}
      <aside className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#95C0EC] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-slate-900">Assistant</span>
          </div>
        </div>

        {/* 新对话按钮 */}
        <div className="p-3">
          <button className="flex items-center gap-2 w-full px-3 py-2 bg-[#95C0EC] text-white rounded-lg text-sm font-medium hover:bg-[#7aaddd] transition-colors">
            <Plus className="w-4 h-4" />
            新对话
          </button>
        </div>

        {/* 快捷操作 */}
        <div className="px-3 pb-3">
          <p className="text-xs text-slate-400 px-3 mb-2">快捷操作</p>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 text-sm hover:bg-slate-200 transition-colors"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        <div className="flex-1 px-3 overflow-y-auto">
          <p className="text-xs text-slate-400 px-3 mb-2">历史</p>
          <div className="space-y-1">
            {['项目构思', '代码重构', '文案优化'].map((item) => (
              <button
                key={item}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 text-sm hover:bg-slate-200 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-3 border-t border-slate-200">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 text-sm hover:bg-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
            设置
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-sm font-medium text-slate-600">新对话</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-[#95C0EC] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="group relative">
                  <div className={`px-4 py-3 rounded-2xl max-w-md ${
                    message.role === 'user'
                      ? 'bg-[#95C0EC] text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  {/* 悬浮操作 */}
                  <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                  }`}>
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-slate-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-slate-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-slate-100 rounded-xl p-2 focus-within:ring-2 focus-within:ring-[#95C0EC] focus-within:bg-white transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="输入消息..."
                className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder-slate-400 py-2 px-3 min-h-[24px] max-h-32"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  input.trim()
                    ? 'bg-[#95C0EC] text-white hover:bg-[#7aaddd]'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              AI 可能产生错误
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
