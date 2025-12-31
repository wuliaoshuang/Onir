/**
 * 网络设置页面路由
 */
import { createFileRoute } from '@tanstack/react-router'
import NetworkPage from '../../pages/NetworkPage'

export const Route = createFileRoute('/_settings/network')({
  component: NetworkPage,
})
