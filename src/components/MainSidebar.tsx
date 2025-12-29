/**
 * 蕾姆精心设计的主导航侧边栏
 * 用于多页面应用架构，提供各功能模块导航
 * 样式已统一至 Sidebar 规范
 */
import { useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard, Zap, MessageSquare, Database,
  User, Globe, Key, PanelLeftClose, PanelLeftOpen, X,
} from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

export interface NavItem {
  id: string
  label: string
  icon: any
  to: string
  badge?: string
}

const navItems: NavItem[] = [
  { id: 'general', label: '概览', icon: LayoutDashboard, to: '/' },
  { id: 'providers', label: '供应商', icon: Zap, to: '/providers' },
  { id: 'chat', label: '聊天', icon: MessageSquare, to: '/chat' },
  { id: 'memory', label: '内存', icon: Database, to: '/memory' },
  { id: 'ui', label: '用户界面', icon: User, to: '/ui' },
  { id: 'network', label: '网络', icon: Globe, to: '/network' },
  { id: 'keys', label: '密钥绑定', icon: Key, to: '/keys' },
]

interface MainSidebarProps {
  currentPath?: string
}

export default function MainSidebar({ currentPath }: MainSidebarProps) {
  const navigate = useNavigate()
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()

  return (
    <aside
      className={`
        relative z-10 h-full flex-shrink-0
        ${sidebarCollapsed ? 'w-14' : 'w-48'}
        bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl
        flex flex-col
        transition-all duration-300 ease-out
      `}
    >
      {/* Logo 区域 - 桌面应用优化 */}
      <div className={sidebarCollapsed ? 'py-3' : 'p-3'}>
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="group/btn relative w-8 h-8 mx-auto flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#95C0EC] to-[#7aaddd] rounded-lg flex items-center justify-center shadow-lg shadow-[#95C0EC]/30 transition-all duration-200 group-hover/btn:scale-105">
              <svg
                className="w-4 h-4 text-white transition-opacity duration-200 group-hover/btn:opacity-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <PanelLeftOpen className="w-4 h-4 text-white absolute opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              展开
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#95C0EC] to-[#7aaddd] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#95C0EC]/30">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-[14px] tracking-tight">
                AI Assistant
              </span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
            </button>
          </div>
        )}
      </div>

      {/* 折叠状态 - 桌面应用优化 */}
      {sidebarCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-1.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.to ||
              (item.to !== '/' && currentPath?.startsWith(item.to))

            return (
              <button
                key={item.id}
                onClick={() => navigate({ to: item.to as any })}
                className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#95C0EC]' : 'text-[#86868b] dark:text-[#8e8e93]'}`} />
                <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                  {item.label}
                </div>
              </button>
            )
          })}

          <button className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 mt-auto">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              正常
            </div>
          </button>
        </div>
      ) : (
        <>
          {/* 展开状态：导航菜单 - 桌面应用优化 */}
          <nav className="flex-1 px-2 overflow-y-auto">
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              导航
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.to ||
                  (item.to !== '/' && currentPath?.startsWith(item.to))

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ to: item.to as any })}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg
                      transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-[#95C0EC]/10 text-[#95C0EC]'
                        : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#95C0EC]' : 'text-[#86868b] dark:text-[#8e8e93]'}`} />
                    <span className="text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 bg-[#95C0EC] text-white text-[10px] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* 底部版本信息 - 桌面应用优化 */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                v1.0.0
              </span>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}

export { navItems }
