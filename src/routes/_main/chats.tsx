/**
 * 聊天页面路由 - 显示默认会话
 */
import { createFileRoute } from '@tanstack/react-router'
import ChatListPage from '../../pages/ChatListPage'

export const Route = createFileRoute('/_main/chats')({
  component: ChatListPage,
})
