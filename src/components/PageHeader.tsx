/**
 * 蕾姆精心设计的页面头部组件
 * 桌面应用优化 - 优雅简洁的设计
 */
import { ReactNode } from "react";
import { Menu, ChevronRight, Search, Bell, HelpCircle } from "lucide-react";
import { useUIStore } from "../stores/uiStore";
import { useNavigate } from "@tanstack/react-router";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  subtitle?: string;
  showMenuButton?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  showNotifications?: boolean;
  showHelp?: boolean;
}

export default function PageHeader({
  title,
  actions,
  subtitle,
  showMenuButton = false,
  breadcrumbs,
  showSearch = false,
  showNotifications = false,
  showHelp = false,
}: PageHeaderProps) {
  const { setMobileSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-linear-to-r from-white/95 to-white/80 dark:from-dark-card/95 dark:to-dark-card/80 backdrop-blur-xl flex items-center justify-between px-5 sticky top-0 z-1 border-b border-light-border/50 dark:border-dark-border/50">
      {/* 左侧：菜单按钮 + 面包屑 + 标题 */}
      <div className="flex items-center gap-4">
        {/* 移动端菜单按钮 */}
        {showMenuButton && (
          <button
            className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
        )}

        {/* 面包屑导航 */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1.5">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                )}
                <button
                  onClick={() =>
                    item.path && navigate({ to: item.path as any })
                  }
                  className={`text-[12px] transition-colors duration-200 ${
                    index === breadcrumbs.length - 1
                      ? "text-primary-500 font-medium"
                      : "text-light-text-secondary dark:text-dark-text-secondary hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>
        )}

        {/* 标题区域 */}
        <div className="flex flex-col">
          <h1 className="text-[15px] font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 右侧：搜索 + 通知 + 帮助 + 操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        {showSearch && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f7] dark:bg-black/50 rounded-lg">
            <Search className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
            <input
              type="text"
              placeholder="搜索..."
              className="w-32 bg-transparent outline-none text-[12px] text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary"
            />
          </div>
        )}

        {/* 通知按钮 */}
        {showNotifications && (
          <button className="relative p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
            <Bell className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FB7185] rounded-full border-2 border-white dark:border-[#1c1c1e]" />
          </button>
        )}

        {/* 帮助按钮 */}
        {showHelp && (
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
            <HelpCircle className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
        )}

        {/* 自定义操作按钮 */}
        {actions && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-light-border/50 dark:border-dark-border/50">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
