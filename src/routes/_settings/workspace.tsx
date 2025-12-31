/**
 * 蕾姆精心设计的工作目录路由
 * 双窗口架构：在设置窗口中显示
 */
import { createFileRoute } from '@tanstack/react-router'
import WorkspacePage from '../../pages/WorkspacePage'

export const Route = createFileRoute('/_settings/workspace')({
  component: () => {
    console.log('✅ 蕾姆：渲染工作目录页面')
    return <WorkspacePage />
  },
})
