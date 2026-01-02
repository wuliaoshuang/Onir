/**
 * 蕾姆精心设计的 Shadow DOM 数学公式组件
 * 🎯 使用 Constructable Stylesheets 实现高性能样式共享
 *
 * 核心优势：
 * - 全局单例样式表，所有公式共享
 * - 零 DOM 开销：不需要 <link> 或 <style> 标签
 * - 内存占用极低：无论多少公式，只有 1 个 CSSStyleSheet 对象
 */

import { useEffect, useRef, memo } from 'react'
import katex from 'katex'

// 🎯 使用 Vite 的 ?inline 特性直接导入 CSS 字符串
import katexStyles from '../styles/katex-local.css?inline'

// ========================================
// 🎯 全局单例：创建共享样式表
// 这段代码在整个应用生命周期只运行一次
// ========================================

const sharedStyleSheet = new CSSStyleSheet()
sharedStyleSheet.replaceSync(katexStyles)

// 🎯 宿主样式（解决字体继承和布局问题）
const hostStyleSheet = new CSSStyleSheet()
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
  /* 🎯 深色模式 */
  :host([data-theme="dark"]) .katex-wrapper {
    color: #f5f5f7;
  }
  :host([data-theme="dark"]) .katex .mord {
    color: #f5f5f7;
  }
  /* 🎯 修复根号 SVG 溢出 */
  .katex .sqrt > span:not([class]) {
    overflow: hidden;
    position: relative;
    width: 100%;
  }
`)

// ========================================
// 类型定义
// ========================================

interface BaseShadowMathProps {
  tex: string
}

// ========================================
// 基础组件
// ========================================

function BaseShadowMath({ tex, displayMode = false }: BaseShadowMathProps & { displayMode?: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const shadowRootRef = useRef<ShadowRoot | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return

    // 🎯 初始化 Shadow DOM（只运行一次）
    const shadowRoot = containerRef.current.attachShadow({ mode: 'open' })
    shadowRootRef.current = shadowRoot
    isInitializedRef.current = true

    // 🎯 核心魔法：直接挂载共享样式表
    // 没有 <style> 标签，没有 <link> 标签，极其干净
    shadowRoot.adoptedStyleSheets = [sharedStyleSheet, hostStyleSheet]

    // 创建挂载点
    const wrapper = document.createElement('span')
    wrapper.id = 'math-root'
    wrapper.className = 'katex-wrapper'
    shadowRoot.appendChild(wrapper)

    // 🎯 同步深色模式
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      shadowRoot.host.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }

    updateTheme()

    // 监听深色模式变化
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // 🎯 渲染数学公式
  useEffect(() => {
    if (!shadowRootRef.current) return

    const root = shadowRootRef.current.getElementById('math-root') as HTMLElement
    if (!root) return

    // 使用 KaTeX 渲染
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

// ========================================
// 导出组件
// ========================================

/**
 * 行内数学公式组件
 * @example
 * <ShadowMathInline tex="$E = mc^2$" />
 */
export function ShadowMathInline({ tex }: BaseShadowMathProps) {
  return <BaseShadowMath tex={tex} displayMode={false} />
}

/**
 * 块级数学公式组件
 * @example
 * <ShadowMathDisplay tex="$$\\int_0^\\infty x^2 dx$$" />
 */
export function ShadowMathDisplay({ tex }: BaseShadowMathProps) {
  return <BaseShadowMath tex={tex} displayMode={true} />
}

// ========================================
// React.memo 优化（推荐用于长列表）
// ========================================

export const MemoizedShadowMathInline = memo(ShadowMathInline)
export const MemoizedShadowMathDisplay = memo(ShadowMathDisplay)
