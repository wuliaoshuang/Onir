/**
 * 蕾姆精心设计的首页路由
 * 显示仪表盘概览
 */
import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '../pages/DashboardPage'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})
