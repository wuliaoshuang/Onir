/**
 * 蕾姆精心设计的默认聊天页面
 * 匹配 /chat 路径
 */
import { createFileRoute } from '@tanstack/react-router'
import ChatPage from '../../pages/ChatPage'

export const Route = createFileRoute('/_main/chat/')({
  component: ChatPage,
})
