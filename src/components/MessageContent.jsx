import React, { useState, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'

/**
 * Markdown 消息组件 - 适配蕾姆主题的浅色/深色模式
 * 设计原则：与整体卡片风格统一，支持深色模式自动适配
 */
export function MessageContent({ content }) {
  const [copiedCodeId, setCopiedCodeId] = useState(null)
  const codeBlockIndexRef = useRef(0)

  const handleCopyCode = useCallback((code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }, [])

  // 生成唯一 ID（使用 useRef 确保每次渲染时索引正确）
  const generateCodeId = useCallback((index) => {
    return `code-block-${index}`
  }, [])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // ========== 标题系统 ==========
        h1({ children }) {
          return <h1 className="text-[20px] font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-5 mb-3">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-[18px] font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-4 mb-2.5">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-[16px] font-semibold text-light-text-primary dark:text-dark-text-primary mt-3 mb-2">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-[15px] font-medium text-light-text-primary dark:text-dark-text-primary mt-2.5 mb-1.5">{children}</h4>;
        },

        // ========== 正文 ==========
        p({ node, children }) {
          // 检查子节点中是否包含代码元素（避免 HTML 嵌套错误：<p> 不能包含 <div>/<pre>）
          const hasCodeChild = node?.children?.some(
            child => child?.type === 'element' && child?.tagName === 'code'
          )
          if (hasCodeChild) {
            return <span className="block my-2 break-words">{children}</span>
          }
          return <p className="text-[15px] leading-[1.6] text-light-text-primary dark:text-dark-text-primary my-2 break-words">{children}</p>;
        },

        // ========== 文字样式 ==========
        strong({ children }) {
          return <strong className="font-semibold text-light-text-primary dark:text-dark-text-primary">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic text-light-text-primary dark:text-dark-text-primary">{children}</em>;
        },

        // ========== 引用块 ==========
        blockquote({ children }) {
          return (
            <blockquote className="border-l-[3px] border-primary-500 bg-primary-500/8 dark:bg-primary-500/15 pl-4 py-2.5 my-3 rounded-r-xl text-light-text-primary dark:text-dark-text-primary">
              {children}
            </blockquote>
          );
        },

        // ========== 列表 ==========
        ul({ children }) {
          return <ul className="my-2.5 space-y-1.5 text-light-text-primary dark:text-dark-text-primary list-disc pl-5 marker:text-primary-500">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="my-2.5 space-y-1.5 text-light-text-primary dark:text-dark-text-primary list-decimal pl-5 marker:text-primary-500 marker:font-semibold">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-[15px] leading-[1.6]">{children}</li>;
        },

        // ========== 代码块（重新设计）==========
        code({ inline, className, children, ...props }) {
          const language = className?.replace('language-', '') || ''
          const codeContent = String(children).replace(/\n$/, '')
          const currentIndex = codeBlockIndexRef.current++

          return !inline ? (
            <div className="my-4 rounded-2xl overflow-hidden shadow-md dark:shadow-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card transition-colors duration-200">
              {/* 代码头部栏 */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-light-page dark:bg-black border-b border-light-border dark:border-dark-border">
                {/* 左侧：语言标签 + 装饰点 */}
                <div className="flex items-center gap-2.5">
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

                {/* 右侧：复制按钮 */}
                <button
                  onClick={() => handleCopyCode(codeContent, generateCodeId(currentIndex))}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
                    transition-all duration-200 active:scale-95
                    ${copiedCodeId === generateCodeId(currentIndex)
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 dark:bg-primary-500/20 dark:hover:bg-primary-500/30'}
                  `}
                  title="复制代码"
                >
                  {copiedCodeId === generateCodeId(currentIndex) ? (
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

              {/* 代码内容区 */}
              <pre className="p-4 overflow-x-auto bg-white dark:bg-dark-card">
                <code
                  className="text-[13px] font-mono leading-[1.7] text-light-text-primary dark:text-[#e5e5ea] block whitespace-pre"
                  {...props}
                >
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-light-page dark:bg-black text-primary-500 border border-light-border dark:border-dark-border break-all" {...props}>
              {children}
            </code>
          );
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
          );
        },

        // ========== 表格 ==========
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
              <table className="min-w-full text-[14px]">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-light-page dark:bg-black border-b border-light-border dark:border-dark-border">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody className="divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">{children}</tbody>;
        },
        tr({ children }) {
          return <tr className="hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors duration-150">{children}</tr>;
        },
        th({ children }) {
          return <th className="px-4 py-2.5 text-left font-semibold text-light-text-primary dark:text-dark-text-primary">{children}</th>;
        },
        td({ children }) {
          return <td className="px-4 py-2.5 text-light-text-primary dark:text-dark-text-primary max-w-md break-words">{children}</td>;
        },

        // ========== 其他元素 ==========
        hr() {
          return <hr className="my-5 border-t border-light-border dark:border-dark-border" />;
        },
        del({ children }) {
          return <del className="text-[#86868b] dark:text-dark-text-secondary line-through">{children}</del>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
