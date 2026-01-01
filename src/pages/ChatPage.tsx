/**
 * 蕾姆精心设计的聊天页面
 * 🎯 header 放在 Allotment 里面，给右侧面板留空间
 * 🎯 悬浮按钮：竖向排列的圆形图标按钮
 * 🎯 使用 Framer Motion 添加平滑动画
 */
import { useState, useCallback } from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, FileTerminal, Files, Eye, X } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/EmptyState";
import { ScrollableMessageList } from "../components/ScrollableMessageList";
import { FloatingPanelButtons } from "../components/FloatingPanelButtons";
import { useChatStore, selectActiveMessages } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore";
import { useApiKeyStore } from "../stores/apiKeyStore";
import { useDeepSeekChat } from "../hooks/useDeepSeekChat";
import InputArea from "../components/InputArea";

function ChatPage() {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId
  );
  const messages = useChatStore(selectActiveMessages);
  const {
    createConversation,
    setActiveConversation,
    getConversationModel,
    setConversationModel,
    // 🎯 蕾姆：右侧面板状态管理
    setConversationPanelVisible,
    setConversationPanelTab,
    openConversationPanelWithTab,
  } = useChatStore();
  const { copiedMessageId, copyToClipboard } = useUIStore();
  const { getDefaultModel } = useApiKeyStore();

  // 🎯 蕾姆：判断是否有活动会话
  const hasConversation = !!activeConversationId;

  // 🎯 蕾姆：创建新对话的处理函数
  const handleNewChat = () => {
    const newId = createConversation();
    setActiveConversation(newId);
  };

  // 🎯 蕾姆：模型管理
  const currentModel = activeConversationId
    ? getConversationModel(activeConversationId) || getDefaultModel() || ""
    : getDefaultModel() || "";

  const handleModelChange = (model: string) => {
    if (activeConversationId) {
      setConversationModel(activeConversationId, model);
    }
  };

  // 🎯 蕾姆：使用新的 Hook，传入 conversationId
  const { sendMessage, abort, isGenerating } = useDeepSeekChat({
    conversationId: activeConversationId || "default",
  });

  const [input, setInput] = useState("");

  // 🎯 蕾姆：会话独立的面板状态（使用选择器订阅变化）
  const panelVisible = useChatStore((state) => {
    const conversation = state.conversations.find(
      (c) => c.id === activeConversationId
    );
    return conversation?.rightPanel?.visible ?? false;
  });
  const panelActiveTab = useChatStore((state) => {
    const conversation = state.conversations.find(
      (c) => c.id === activeConversationId
    );
    return conversation?.rightPanel?.activeTab ?? "files";
  });

  // 🎯 蕾姆：延迟移除状态，让 exit 动画有时间播放
  const [isPanelAnimatingOut, setIsPanelAnimatingOut] = useState(false);

  // 🎯 蕾姆：计算面板是否应该渲染（动画期间也要渲染）
  const shouldRenderPanel = panelVisible || isPanelAnimatingOut;

  // 🎯 蕾姆：面板默认关闭，Allotment 控制宽度
  const defaultSizes = panelVisible ? [70, 30] : [100, 0];

  // 🎯 蕾姆：打开面板并切换 tab 的回调
  const handleOpenPanel = useCallback(
    (tab: "files" | "terminal" | "preview") => {
      if (activeConversationId) {
        openConversationPanelWithTab(activeConversationId, tab);
      }
    },
    [activeConversationId, openConversationPanelWithTab]
  );

  // 🎯 蕾姆：关闭面板的回调 - 先触发动画，再延迟关闭
  const handleClosePanel = useCallback(() => {
    if (activeConversationId) {
      // 1. 先设置状态为 false（触发 Allotment 宽度动画）
      setConversationPanelVisible(activeConversationId, false);
      // 2. 延迟后让 motion.div 完成 exit 动画
      setIsPanelAnimatingOut(true);
      setTimeout(() => {
        setIsPanelAnimatingOut(false);
      }, 300); // 与 transition duration 一致
    }
  }, [activeConversationId, setConversationPanelVisible]);

  // 🎯 蕾姆：切换 tab 的回调
  const handleSetTab = useCallback(
    (tab: "files" | "terminal" | "preview") => {
      if (activeConversationId) {
        setConversationPanelTab(activeConversationId, tab);
      }
    },
    [activeConversationId, setConversationPanelTab]
  );

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userInput = input;
    setInput("");

    try {
      await sendMessage(userInput);
    } catch (error) {
      console.error("发送消息失败:", error);
      setInput(userInput);
    }
  };

  const handleAbort = () => {
    abort();
  };

  const handleCopyMessage = (id: number, content: string) => {
    copyToClipboard(content, id);
  };

  return (
    <div className="flex-1 h-dvh flex flex-col min-w-0">
      {/* Allotment 布局 - header 在里面 */}
      <Allotment
        key={panelVisible ? "panel-open" : "panel-closed"}
        defaultSizes={defaultSizes}
        minSize={0}
        className="flex-1 overflow-hidden"
      >
        {/* 左侧：聊天区域（包含 header） */}
        <Allotment.Pane className="flex flex-col min-w-0 relative">
          {/* header - 在 Allotment.Pane 里面 */}
          <header className="h-14 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                onClick={() => useUIStore.getState().setMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
                  新对话
                </h2>
                {/* 🎯 蕾姆：只在有消息时显示条数 */}
                {messages.length > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-black/5 dark:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary rounded-full">
                    {messages.length} 条
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
            </div>
          </header>

          {/* 消息区域 */}
          {hasConversation ? (
            <ScrollableMessageList
              messages={messages}
              isGenerating={isGenerating}
              copiedMessageId={copiedMessageId}
              onCopyMessage={handleCopyMessage}
            />
          ) : (
            <div className="flex-1 bg-light-page dark:bg-dark-page">
              <EmptyState onNewChat={handleNewChat} />
            </div>
          )}

          {/* 输入区域 */}
          {hasConversation && (
            <InputArea
              input={input}
              setInput={setInput}
              onSend={handleSend}
              currentModel={currentModel}
              onModelChange={handleModelChange}
              isSending={isGenerating}
              onStop={handleAbort}
            />
          )}

          {/* 🎯 蕾姆：悬浮按钮组（面板关闭时显示，在聊天区域内） */}
          <FloatingPanelButtons
            visible={!panelVisible}
            onTabClick={handleOpenPanel}
          />
        </Allotment.Pane>

        {/* 右侧：工具面板 - CSS 过渡动画 */}
        {shouldRenderPanel && (
          <Allotment.Pane
            minSize={0}
            className="flex flex-col bg-white dark:bg-dark-card border-l border-black/5 dark:border-white/10 overflow-hidden"
          >
            {/* 🎯 蕾姆：motion.div 包裹内容，处理显隐动画 */}
            <AnimatePresence>
              {panelVisible && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col h-full"
                >
                  {/* 面板头部 */}
                  <div className="h-14 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex gap-2">
                      <Button
                        variant={
                          panelActiveTab === "files" ? "primary" : "ghost"
                        }
                        size="sm"
                        icon={Files}
                        onClick={() => handleSetTab("files")}
                      >
                        文件
                      </Button>
                      <Button
                        variant={
                          panelActiveTab === "terminal" ? "primary" : "ghost"
                        }
                        size="sm"
                        icon={FileTerminal}
                        onClick={() => handleSetTab("terminal")}
                      >
                        终端
                      </Button>
                      <Button
                        variant={
                          panelActiveTab === "preview" ? "primary" : "ghost"
                        }
                        size="sm"
                        icon={Eye}
                        onClick={() => handleSetTab("preview")}
                      >
                        预览
                      </Button>
                    </div>
                    <button
                      onClick={handleClosePanel}
                      className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-light-text-secondary dark:text-dark-text-secondary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 面板内容 - 内部元素显隐动画 */}
                  <div className="flex-1 overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      {panelActiveTab === "files" && (
                        <motion.div
                          key="files"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="h-full flex flex-col absolute inset-0"
                        >
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center mb-4">
                              <Files className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                              文件管理
                            </h3>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                              管理项目文件和资源
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {panelActiveTab === "terminal" && (
                        <motion.div
                          key="terminal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="h-full flex flex-col absolute inset-0"
                        >
                          <div className="flex-1 bg-light-text-primary rounded-lg m-3 p-4 font-mono text-sm overflow-y-auto">
                            <div className="text-green-400 mb-2">
                              <span className="text-white">user</span>@
                              <span className="text-white">onir</span>:
                              <span className="text-blue-400">~</span>$
                            </div>
                            <div className="text-[#8e8e93] opacity-80">
                              欢迎使用 Onir 终端
                              <br />
                              输入命令开始使用...
                            </div>
                            <div className="mt-3 text-green-400">
                              <span className="text-white">user</span>@
                              <span className="text-white">onir</span>:
                              <span className="text-blue-400">~</span>$
                              <span className="animate-pulse">_</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {panelActiveTab === "preview" && (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="h-full flex flex-col absolute inset-0"
                        >
                          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center mb-4">
                              <Eye className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                              实时预览
                            </h3>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                              预览代码和内容的渲染效果
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
}

export default ChatPage;
