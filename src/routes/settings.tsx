/**
 * 蕾姆精心设计的设置页面
 */
import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '../pages/SettingsPage'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
