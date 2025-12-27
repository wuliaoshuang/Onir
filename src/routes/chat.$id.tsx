/**
 * 蕾姆精心设计的特定会话页面
 * 匹配 /chat/:id 路径
 */
import { createFileRoute } from '@tanstack/react-router'
import ChatPage from '../pages/ChatPage'

export const Route = createFileRoute('/chat/$id')({
  component: ChatPage,
})
