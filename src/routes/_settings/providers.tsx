/**
 * 供应商配置页面路由
 */
import { createFileRoute } from '@tanstack/react-router'
import ProvidersSettingsPage from '../../pages/ProvidersSettingsPage'

export const Route = createFileRoute('/_settings/providers')({
  component: ProvidersSettingsPage,
})
