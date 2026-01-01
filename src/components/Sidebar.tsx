/**
 * 蕾姆精心设计的侧边栏组件
 * 桌面应用优化 - 与 MainSidebar 尺寸保持一致
 * 支持双窗口架构：设置按钮打开独立设置窗口（Electron 版本已实现）
 */
import { useState } from "react";
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
  Trash2,
} from "lucide-react";
import { useUIStore } from "../stores/uiStore";
import { useChatStore } from "../stores/chatStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/Dialog";
import { Button } from "./ui/Button";

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
    deleteConversation,
  } = useChatStore();

  // 🎯 蕾姆：删除确认弹窗状态
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: string; title: string } | null>(null);

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
    // 蕾姆：直接调用 Electron API 打开设置窗口
    window.electronAPI?.openSettingsWindow()
  };

  // 🎯 蕾姆：删除会话处理
  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // 防止触发选择会话
    setConversationToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete.id);
    }
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  return (
    <aside
      className={`
        relative z-10 h-s shrink-0
        ${sidebarCollapsed ? "w-14" : "w-48"}
        bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl
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
                Assistant
              </span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
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
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              新对话
            </div>
          </button>

          {quickActions.map((action) => (
            <button
              key={action.label}
              className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <action.icon className="w-4 h-4 text-primary-500" />
              <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                {action.label}
              </div>
            </button>
          ))}

          <button
            onClick={handleSettings}
            className="group/btn relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 mt-auto"
          >
            <Settings className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            <div className="absolute left-full ml-2 z-50 px-2 py-1 bg-light-text-primary dark:bg-white text-white dark:text-light-text-primary text-[11px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
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
              <Plus className="w-4 h-4 shrink-0" />
              <span>新对话</span>
            </button>
          </div>

          {/* 快捷操作 - 与 MainSidebar 保持一致 */}
          <div className="px-2 pb-3">
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 mb-1.5 font-medium tracking-wide uppercase">
              快捷操作
            </p>
            <div className="space-y-0.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                >
                  <action.icon className="w-4 h-4 text-primary-500" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录 - 与 MainSidebar 保持一致 */}
          <div className="flex-1 px-2 overflow-y-auto">
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 mb-1.5 font-medium tracking-wide uppercase">
              历史
            </p>
            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                // 🎯 蕾姆：空状态提示
                <p className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary px-3 py-4 text-center">
                  暂无聊天记录，请创建
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-1 rounded-lg transition-all duration-200 ${
                      activeConversationId === conv.id
                        ? "bg-primary-500/10"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <button
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-[13px] ${
                        activeConversationId === conv.id
                          ? "text-primary-500"
                          : "text-light-text-primary dark:text-dark-text-primary"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </button>
                    {/* 🎯 蕾姆：删除按钮（悬停显示） */}
                    <button
                      onClick={(e) => handleDeleteClick(e, conv.id, conv.title)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all duration-200 mr-1"
                      title="删除会话"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 底部设置按钮 - 与 MainSidebar 保持一致 */}
          <div className="p-2">
            <button
              onClick={handleSettings}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              <span>设置</span>
            </button>
          </div>
        </>
      )}

      {/* 🎯 蕾姆：删除确认弹窗 - 使用新的 Dialog 组件 */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent size="md" onClose={handleCancelDelete}>
          <DialogHeader>
            <DialogTitle>确认删除会话</DialogTitle>
          </DialogHeader>
          <DialogDescription className="px-6 pt-2">
            确定要删除会话 <strong>"{conversationToDelete?.title || ''}"</strong> 吗？删除后无法恢复，如果该会话正在进行 AI 对话，也会被中断。
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" display="block">
                取消
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              display="block"
              onClick={handleConfirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
