/**
 * 蕾姆精心设计的通用设置路由
 * 双窗口架构：在设置窗口中显示
 */
import { createFileRoute } from '@tanstack/react-router'
import GeneralSettingsPage from '../../pages/GeneralSettingsPage'

export const Route = createFileRoute('/_settings/general-settings')({
  component: () => {
    console.log('✅ 蕾姆：渲染通用设置页面')
    return <GeneralSettingsPage />
  },
})
