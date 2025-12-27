/**
 * 用户界面设置页面路由
 */
import { createFileRoute } from '@tanstack/react-router'
import UIPage from '../pages/UIPage'

export const Route = createFileRoute('/ui')({
  component: UIPage,
})
