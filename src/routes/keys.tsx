/**
 * 密钥绑定页面路由
 */
import { createFileRoute } from '@tanstack/react-router'
import KeysPage from '../pages/KeysPage'

export const Route = createFileRoute('/keys')({
  component: KeysPage,
})
