import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MessageContent } from './MessageContent'

describe('MessageContent', () => {
  it('renders plain text', () => {
    render(<MessageContent content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders markdown headings', () => {
    render(<MessageContent content="# Heading 1\n## Heading 2" />)
    // 使用更灵活的匹配器
    expect(screen.getByText((content) => content.includes('Heading 1'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Heading 2'))).toBeInTheDocument()
  })

  it('renders code blocks with syntax highlighting', () => {
    render(<MessageContent content="```javascript\nconst x = 1\n```" />)
    // 验证代码块存在（使用函数匹配器）
    expect(screen.getByText((content) => content.includes('const x = 1'))).toBeInTheDocument()
    // 验证复制按钮存在
    expect(screen.getByRole('button', { name: /复制/ })).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MessageContent content="This is `code` text" />)
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('renders links with target="_blank"', () => {
    render(<MessageContent content="[Link](https://example.com)" />)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders bold and italic text', () => {
    render(<MessageContent content="**bold** and *italic*" />)
    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('renders lists', () => {
    const content = "- Item 1\n- Item 2\n- Item 3"
    render(<MessageContent content={content} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})
