/**
 * 蕾姆精心设计的主导航侧边栏
 * 用于多页面应用架构，提供各功能模块导航
 * 样式已统一至 Sidebar 规范
 */
import { useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  Zap,
  MessageSquare,
  Database,
  User,
  Globe,
  Key,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Folder,
} from "lucide-react";
import { useUIStore } from "../stores/uiStore";
import { Button } from "./ui/Button";

// 蕾姆：声明 Electron API 类型
declare global {
  interface Window {
    electronAPI?: {
      getPlatform: () => string;
      openSettingsWindow: () => void;
      closeSettingsWindow: () => void;
    };
    __TAURI__?: any;
  }
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  to: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: "general",
    label: "通用设置",
    icon: SettingsIcon,
    to: "/general-settings",
  },
  { id: "providers", label: "供应商", icon: Zap, to: "/providers" },
  { id: "workspace", label: "工作目录", icon: Folder, to: "/workspace" },
  { id: "network", label: "网络", icon: Globe, to: "/network" },
  { id: "ui", label: "用户界面", icon: User, to: "/ui" },
  { id: "memory", label: "内存", icon: Database, to: "/memory" },
];

interface MainSidebarProps {
  currentPath?: string;
  /**
   * 是否在设置页面中
   * 在设置页面中，不显示底部的"打开设置"按钮
   */
  inSettingsContext?: boolean;
}

export default function MainSidebar({
  currentPath,
  inSettingsContext = false,
}: MainSidebarProps) {
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  // 蕾姆：打开设置窗口的处理函数
  const handleOpenSettings = () => {
    try {
      // 直接调用 Electron API 打开设置窗口
      window.electronAPI?.openSettingsWindow();
    } catch (error) {
      console.error("❌ 蕾姆：打开设置窗口失败:", error);
    }
  };

  // 蕾姆：关闭设置窗口的处理函数
  const handleCloseSettings = () => {
    try {
      // 🎯 优先使用 Electron API
      if (window.electronAPI?.closeSettingsWindow) {
        window.electronAPI.closeSettingsWindow();
      } else {
        // Web 环境下的降级方案：导航回首页
        console.warn("蕾姆：当前环境不支持窗口关闭 API");
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("关闭窗口失败:", error);
    }
  };

  return (
    <aside
      className={`     
        relative z-10 h-full shrink-0
        ${sidebarCollapsed ? "w-14" : "w-48"}
        bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl
        flex flex-col
        transition-all duration-300 ease-out
      `}
    >
      {/* Logo 区域 - 桌面应用优化 */}
      <div className={sidebarCollapsed ? "py-3" : "p-3"}>
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="group/btn relative w-8 h-8 mx-auto flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all duration-200 group-hover/btn:scale-105">
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
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              展开
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/30">
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
              <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-[14px] tracking-tight">
                Setting
              </span>
            </div>
            <Button
              variant="icon"
              size="sm"
              icon={PanelLeftClose}
              title="收起侧边栏"
              onClick={() => setSidebarCollapsed(true)}
            />
          </div>
        )}
      </div>

      {/* 折叠状态 - 桌面应用优化 */}
      {sidebarCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-1.5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.to ||
              (item.to !== "/" && currentPath?.startsWith(item.to));

            return (
              <button
                key={item.id}
                onClick={() => navigate({ to: item.to as any })}
                className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-primary-500"
                      : "text-light-text-secondary dark:text-dark-text-secondary"
                  }`}
                />
                <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                  {item.label}
                </div>
              </button>
            );
          })}

          {/* 折叠状态下的底部按钮 */}
          {inSettingsContext ? (
            <button
              onClick={handleCloseSettings}
              className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <X className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                关闭设置
              </div>
            </button>
          ) : (
            <button
              onClick={handleOpenSettings}
              className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <SettingsIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                设置
              </div>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 展开状态：导航菜单 - 桌面应用优化 */}
          <nav className="flex-1 px-2 overflow-y-auto">
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 mb-1.5 font-medium tracking-wide uppercase">
              导航
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.to ||
                  (item.to !== "/" && currentPath?.startsWith(item.to));

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ to: item.to as any })}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg
                      transition-all duration-200 group relative
                      ${
                        isActive
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10"
                      }
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? "text-primary-500"
                          : "text-light-text-secondary dark:text-dark-text-secondary"
                      }`}
                    />
                    <span className="text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 bg-primary-500 text-white text-[10px] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* 底部按钮 - 根据上下文显示不同按钮 */}
          <div className="p-2">
            {inSettingsContext ? (
              <button
                onClick={handleCloseSettings}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <X className="w-4 h-4 shrink-0 text-light-text-secondary dark:text-dark-text-secondary" />
                <span className="text-[13px]">关闭设置</span>
              </button>
            ) : (
              <button
                onClick={handleOpenSettings}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <SettingsIcon className="w-4 h-4 shrink-0 text-light-text-secondary dark:text-dark-text-secondary" />
                <span className="text-[13px]">打开设置</span>
              </button>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export { navItems };
