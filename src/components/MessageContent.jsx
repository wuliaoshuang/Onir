import React, { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

// 引入高亮组件和样式
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// 🎯 蕾姆：同时引入浅色和深色主题，根据当前模式切换
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

/**
 * 🎯 蕾姆：代码块组件（支持折叠）
 */
function CodeBlock({ language, codeContent, blockId, isDark, syntaxTheme, onCopy, copiedId, isCollapsed, onToggleCollapse }) {
  const codeId = `copy-${blockId}`

  return (
    <div className="my-4 rounded-2xl overflow-hidden shadow-md dark:shadow-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card transition-colors duration-200">
      {/* 顶部栏：Mac 风格红绿灯 + 语言 + 折叠按钮 + 复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-light-page dark:bg-black border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          {/* Mac 风格红绿灯 */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500/30"></div>
          </div>
          {language && (
            <span className="text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wide ml-1">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 折叠按钮 */}
          <button
            onClick={() => onToggleCollapse(blockId)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-all duration-200"
            title={isCollapsed ? '展开代码' : '折叠代码'}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>展开</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>折叠</span>
              </>
            )}
          </button>

          {/* 复制按钮 */}
          <button
            onClick={() => onCopy(codeContent, codeId)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
              transition-all duration-200 active:scale-95
              ${copiedId === codeId
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 dark:bg-primary-500/20 dark:hover:bg-primary-500/30'}
            `}
            title="复制代码"
          >
            {copiedId === codeId ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 高亮内容区 - 根据折叠状态显示 */}
      {!isCollapsed && (
        <div className="text-[13px] overflow-x-auto bg-white dark:bg-dark-card">
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: '',
              fontSize: '13px',
              lineHeight: '1.7',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
            wrapLongLines={true}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      )}

      {/* 折叠时显示预览 */}
      {isCollapsed && (
        <div className="px-4 py-3 text-[12px] text-light-text-secondary dark:text-dark-text-secondary italic bg-white dark:bg-dark-card">
          {codeContent.split('\n').length} 行代码已折叠
        </div>
      )}
    </div>
  )
}

/**
 * Markdown 消息组件 - 适配蕾姆主题的浅色/深色模式
 * 包含：数学公式修复、代码高亮修复、Mac 风格窗口、代码折叠
 */
export function MessageContent({ content }) {
  const [copiedCodeId, setCopiedCodeId] = useState(null)

  // 🎯 蕾姆：管理代码块折叠状态（用 Set 存储基于内容的 ID）
  const [collapsedBlocks, setCollapsedBlocks] = useState(new Set())

  const toggleCollapse = useCallback((blockId) => {
    setCollapsedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blockId)) {
        newSet.delete(blockId)
      } else {
        newSet.add(blockId)
      }
      return newSet
    })
  }, [])

  // 🎯 蕾姆：生成稳定的代码块 ID（基于内容哈希）
  const generateBlockId = useCallback((code) => {
    // 简单哈希函数：将代码内容转换为数字 ID
    let hash = 0
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转为 32 位整数
    }
    return `code-${Math.abs(hash)}`
  }, [])

  // 🎯 蕾姆：检测当前主题模式
  const [isDark, setIsDark] = useState(() => {
    // 初始化时检测
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    // 监听 dark class 的变化
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // 根据主题选择代码高亮样式
  const syntaxTheme = isDark ? oneDark : oneLight

  const handleCopyCode = useCallback((code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }, [])

  // 🎯 预处理内容：修复 AI 返回的各种奇怪 LaTeX 格式
  const preprocessContent = (text) => {
    let processed = text || ''

    // 1. 移除 $ 内部多余空格
    processed = processed.replace(/\$\s+/g, '$').replace(/\s+\$/g, '$')
    processed = processed.replace(/\$\$\s+/g, '$$').replace(/\s+\$\$/g, '$$')

    // 2. 将 \[...\] 转换为 $$...$$
    processed = processed.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match, latex) => `$$${latex}$$`)

    // 3. 将 \(...\) 转换为 $...$
    processed = processed.replace(/\\\(\s*(.+?)\s*\\\)/gs, (_match, latex) => `$${latex}$`)

    return processed
  }

  const processedContent = preprocessContent(content)

  return (
    <ReactMarkdown
      // ⚠️ 核心修改：移除了 rehype-highlight，改用下方组件自定义渲染
      remarkPlugins={[[remarkMath, { singleDollar: true }], remarkGfm]}
      rehypePlugins={[[rehypeKatex, { strict: false, output: 'mathml' }]]}
      components={{
        // ========== 正文段落 ==========
        p({ node, children }) {
          // 检查是否包含块级元素，防止 <p> 嵌套 <div> 报错
          const hasBlockChild = node?.children?.some(
            child => child?.type === 'element' && (child.tagName === 'div' || child.tagName === 'pre')
          )
          // 如果包含代码块，改用 span 或 div 渲染
          if (hasBlockChild) {
            return <div className="my-2">{children}</div>
          }
          return <p className="text-[15px] leading-[1.6] text-light-text-primary dark:text-dark-text-primary my-2 break-words">{children}</p>
        },

        // ========== 文字样式 ==========
        strong({ children }) {
          return <strong className="font-semibold text-light-text-primary dark:text-dark-text-primary">{children}</strong>
        },
        em({ children }) {
          return <em className="italic text-light-text-primary dark:text-dark-text-primary">{children}</em>
        },

        // ========== 引用块 ==========
        blockquote({ children }) {
          return (
            <blockquote className="border-l-[3px] border-primary-500 bg-primary-500/8 dark:bg-primary-500/15 pl-4 py-2.5 my-3 rounded-r-xl text-light-text-primary dark:text-dark-text-primary">
              {children}
            </blockquote>
          )
        },

        // ========== 列表 ==========
        ul({ children }) {
          return <ul className="my-2.5 space-y-1.5 text-light-text-primary dark:text-dark-text-primary list-disc pl-5 marker:text-primary-500">{children}</ul>
        },
        ol({ children }) {
          return <ol className="my-2.5 space-y-1.5 text-light-text-primary dark:text-dark-text-primary list-decimal pl-5 marker:text-primary-500 marker:font-semibold">{children}</ol>
        },
        li({ children }) {
          return <li className="text-[15px] leading-[1.6]">{children}</li>
        },

        // ========== 代码块 ==========
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const codeContent = String(children).replace(/\n$/, '')
          const blockId = generateBlockId(codeContent)

          // 1. 行内代码
          if (inline || language === '') {
            return (
              <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-light-page dark:bg-black text-primary-500 border border-light-border dark:border-dark-border break-all" {...props}>
                {children}
              </code>
            )
          }

          // 2. 块级代码 - 使用 CodeBlock 组件（支持折叠）
          return (
            <CodeBlock
              language={language}
              codeContent={codeContent}
              blockId={blockId}
              isDark={isDark}
              syntaxTheme={syntaxTheme}
              onCopy={handleCopyCode}
              copiedId={copiedCodeId}
              isCollapsed={collapsedBlocks.has(blockId)}
              onToggleCollapse={toggleCollapse}
            />
          )
        },

        // ========== 链接 ==========
        a({ children, href, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400/90 hover:underline transition-colors duration-150"
              {...props}
            >
              {children}
            </a>
          )
        },

        // ========== 表格 ==========
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <table className="min-w-full text-[14px]">{children}</table>
            </div>
          )
        },
        thead({ children }) {
          return <thead className="bg-light-page dark:bg-black border-b border-light-border dark:border-dark-border">{children}</thead>
        },
        tbody({ children }) {
          return <tbody className="divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">{children}</tbody>
        },
        tr({ children }) {
          return <tr className="hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors duration-150">{children}</tr>
        },
        th({ children }) {
          return <th className="px-4 py-2.5 text-left font-semibold text-light-text-primary dark:text-dark-text-primary">{children}</th>
        },
        td({ children }) {
          return <td className="px-4 py-2.5 text-light-text-primary dark:text-dark-text-primary max-w-md break-words">{children}</td>
        },

        // ========== 分割线 & 删除线 ==========
        hr() {
          return <hr className="my-5 border-t border-light-border dark:border-dark-border" />
        },
        del({ children }) {
          return <del className="text-[#86868b] dark:text-dark-text-secondary line-through">{children}</del>
        },

        // ========== 数学公式样式包装 ==========
        span({ node, className, children, ...props }) {
          if (className?.includes('katex')) {
            return (
              <span
                className={`mx-1 text-light-text-primary dark:text-dark-text-primary ${className}`}
                style={{ fontSize: '0.95em' }}
                {...props}
              >
                {children}
              </span>
            )
          }
          return <span {...props}>{children}</span>
        },
        div({ node, className, children, ...props }) {
          if (className?.includes('katex')) {
            return (
              <div
                className={`my-4 overflow-x-auto p-4 rounded-xl bg-light-page dark:bg-black/50 border border-light-border dark:border-dark-border ${className}`}
                {...props}
              >
                {children}
              </div>
            )
          }
          return <div {...props}>{children}</div>
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}