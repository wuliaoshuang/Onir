/**
 * 内存管理页面路由
 */
import { createFileRoute } from '@tanstack/react-router'
import MemoryPage from '../pages/MemoryPage'

export const Route = createFileRoute('/memory')({
  component: MemoryPage,
})
