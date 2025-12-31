/**
 * 蕾姆精心设计的侧边栏组件
 * 桌面应用优化 - 与 MainSidebar 尺寸保持一致
 * 支持双窗口架构：设置按钮打开独立设置窗口（Electron 版本已实现）
 */
import { useNavigate } from "@tanstack/react-router";
// import { invoke } from "@tauri-apps/api/core"; // 蕾姆：已移除 Tauri 依赖
import {
  Plus,
  Code,
  Image,
  FileText,
  Settings,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useUIStore } from "../stores/uiStore";
import { useChatStore } from "../stores/chatStore";

// 蕾姆：声明 Electron API 类型
declare global {
  interface Window {
    electronAPI?: {
      getPlatform: () => string;
      openSettingsWindow: () => void;
      closeSettingsWindow: () => void;
    };
  }
}

// 快捷操作配置
const quickActions = [
  { icon: Code, label: "代码生成" },
  { icon: Image, label: "图像分析" },
  { icon: FileText, label: "文档总结" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
  } = useChatStore();

  const handleNewConversation = () => {
    createConversation("新对话");
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // 跳转到对应路由
    if (id === "default") {
      navigate({ to: "/" });
    } else {
      navigate({ to: "/chat/$id", params: { id } });
    }
  };

  const handleSettings = () => {
    // 蕾姆：优先使用 Electron 多窗口架构
    if (window.electronAPI?.openSettingsWindow) {
      window.electronAPI.openSettingsWindow()
    } else {
      // 降级方案：使用路由导航（Web 版本）
      navigate({ to: "/general-settings" })
    }
  };

  return (
    <aside
      className={`
        relative z-10 h-s flex-shrink-0
        ${sidebarCollapsed ? "w-14" : "w-48"}
        bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl
        flex flex-col
        transition-all duration-300 ease-out
      `}
    >
      {/* Logo 区域 - 与 MainSidebar 保持一致 */}
      <div className={sidebarCollapsed ? "py-3" : "p-3"}>
        {sidebarCollapsed ? (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="group/btn relative w-8 h-8 mx-auto flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all duration-200 group-hover/btn:scale-105">
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
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
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
                Assistant
              </span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
            </button>
          </div>
        )}
      </div>

      {/* 折叠状态 - 与 MainSidebar 保持一致 */}
      {sidebarCollapsed ? (
        <div className="flex-1 flex flex-col items-center gap-1.5 py-2">
          <button
            onClick={handleNewConversation}
            className="group/btn relative w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 dark:hover:bg-primary-600 active:scale-95 transition-all duration-200 shadow-lg shadow-primary-500/25"
          >
            <Plus className="w-4 h-4" />
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              新对话
            </div>
          </button>

          {quickActions.map((action) => (
            <button
              key={action.label}
              className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <action.icon className="w-4 h-4 text-primary-500" />
              <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                {action.label}
              </div>
            </button>
          ))}

          <button
            onClick={handleSettings}
            className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 mt-auto"
          >
            <Settings className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              设置
            </div>
          </button>
        </div>
      ) : (
        <>
          {/* 展开状态：新对话按钮 - 与 MainSidebar 保持一致 */}
          <div className="px-2 pb-2">
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 w-full px-3 py-2 bg-primary-500 text-white rounded-lg text-[13px] font-medium hover:bg-primary-600 dark:hover:bg-primary-600 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-primary-500/25"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>新对话</span>
            </button>
          </div>

          {/* 快捷操作 - 与 MainSidebar 保持一致 */}
          <div className="px-2 pb-3">
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              快捷操作
            </p>
            <div className="space-y-0.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                >
                  <action.icon className="w-4 h-4 text-primary-500" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录 - 与 MainSidebar 保持一致 */}
          <div className="flex-1 px-2 overflow-y-auto">
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              历史
            </p>
            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                    activeConversationId === conv.id
                      ? "bg-primary-500/10 text-primary-500"
                      : "text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 底部设置按钮 - 与 MainSidebar 保持一致 */}
          <div className="p-2">
            <button
              onClick={handleSettings}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
              <span>设置</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
