import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'

describe('App', () => {
  const renderWithTheme = (ui) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>)
  }

  it('renders initial assistant message', () => {
    renderWithTheme(<App />)
    expect(screen.getByText(/你好！我是 AI 助手/)).toBeInTheDocument()
  })

  it('renders input placeholder', () => {
    renderWithTheme(<App />)
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument()
  })

  it('has send button with Send icon', () => {
    renderWithTheme(<App />)
    // 找到包含 Send 图标的按钮
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.innerHTML.includes('Send') || btn.querySelector('svg'))
    expect(sendButton).toBeDefined()
  })
})
