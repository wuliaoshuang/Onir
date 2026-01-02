/**
 * 蕾姆精心设计的数学公式渲染组件
 * 🎯 手动分割 LaTeX + KaTeX 渲染 + Shadow DOM 隔离
 *
 * 优势：
 * - 完全控制渲染过程
 * - 不依赖 remark-math + rehype-katex
 * - 可以直接用 Shadow DOM 隔离样式
 */

import { useMemo, useEffect, useRef } from 'react'
import katex from 'katex'

// 🎯 共享样式表（Constructable Stylesheets）
const sharedStyleSheet = new CSSStyleSheet()
const hostStyleSheet = new CSSStyleSheet()

// 初始化样式
import katexStyles from '../styles/katex-local.css?inline'
sharedStyleSheet.replaceSync(katexStyles)
hostStyleSheet.replaceSync(`
  :host {
    display: inline-block;
    line-height: 0;
  }
  .katex-wrapper {
    display: inline-block;
    font-size: var(--math-font-size, 1em);
    color: var(--math-color, inherit);
  }
  :host([data-theme="dark"]) .katex-wrapper {
    color: #f5f5f7;
  }
  :host([data-theme="dark"]) .katex .mord {
    color: #f5f5f7;
  }
`)

interface MathPart {
  type: 'text' | 'math'
  content: string
  display?: boolean
}

/**
 * Shadow DOM 数学公式片段
 */
function ShadowMathFragment({ tex, displayMode }: { tex: string; displayMode: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const shadowRootRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (!shadowRootRef.current) {
      const shadowRoot = containerRef.current.attachShadow({ mode: 'open' })
      shadowRootRef.current = shadowRoot

      // 挂载共享样式表
      shadowRoot.adoptedStyleSheets = [sharedStyleSheet, hostStyleSheet]

      // 创建容器
      const wrapper = document.createElement('span')
      wrapper.id = 'math-root'
      wrapper.className = 'katex-wrapper'
      shadowRoot.appendChild(wrapper)

      // 同步深色模式
      const updateTheme = () => {
        const isDark = document.documentElement.classList.contains('dark')
        shadowRoot.host.setAttribute('data-theme', isDark ? 'dark' : 'light')
      }

      updateTheme()

      const observer = new MutationObserver(updateTheme)
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })

      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!shadowRootRef.current) return

    const root = shadowRootRef.current.getElementById('math-root') as HTMLElement
    if (!root) return

    try {
      katex.render(tex, root, {
        displayMode,
        throwOnError: false,
        output: 'html',
        strict: false,
      })
    } catch {
      root.textContent = tex
    }
  }, [tex, displayMode])

  return (
    <span
      ref={containerRef}
      style={{
        display: displayMode ? 'block' : 'inline',
        textAlign: displayMode ? 'center' : 'left',
        margin: displayMode ? '0.5em 0' : 0,
      }}
    />
  )
}

interface MathRendererProps {
  expression: string
  className?: string
}

/**
 * 数学公式渲染组件
 *
 * @example
 * <MathRenderer expression="这是行内公式 $E = mc^2$ 和块级公式 $$\int_0^\infty x^2 dx$$" />
 */
export function MathRenderer({ expression, className = '' }: MathRendererProps) {
  const parts = useMemo(() => {
    if (!expression) return []

    // 🎯 正则分割 $$...$$ (块级) 和 $...$ (行内)
    const regex = /\$\$([\s\S]*?)\$\$|\$([\s\S]*?)\$/g
    const result: MathPart[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(expression)) !== null) {
      // 添加公式前的文本
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: expression.slice(lastIndex, match.index),
        })
      }

      const blockMath = match[1]
      const inlineMath = match[2]

      if (blockMath) {
        result.push({ type: 'math', content: blockMath, display: true })
      } else if (inlineMath) {
        result.push({ type: 'math', content: inlineMath, display: false })
      }

      lastIndex = regex.lastIndex
    }

    // 添加剩余文本
    if (lastIndex < expression.length) {
      result.push({
        type: 'text',
        content: expression.slice(lastIndex),
      })
    }

    return result
  }, [expression])

  return (
    <span className={`math-content leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          // 文本部分需要继续用 Markdown 渲染
          return <span key={index}>{part.content}</span>
        }

        return (
          <ShadowMathFragment
            key={index}
            tex={part.content}
            displayMode={part.display || false}
          />
        )
      })}
    </span>
  )
}
