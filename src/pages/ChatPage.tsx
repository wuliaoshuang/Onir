/**
 * 蕾姆精心设计的聊天页面
 * 从 App.jsx 重构而来，使用 Zustand 状态管理
 * 使用 react-resizable-panels 实现可调整大小的面板布局
 * ~~支持双窗口架构：主窗口显示聊天，设置窗口独立显示~~（Electron 版本待实现）
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
// import { invoke } from "@tauri-apps/api/core"; // 蕾姆：已移除 Tauri 依赖
import {
  Send,
  Plus,
  Code,
  Image,
  FileText,
  Settings,
  Copy,
  Check,
  Ellipsis,
  MessageSquare,
  Paperclip,
  Mic,
  Sticker,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Square,
  GripVertical,
  FileTerminal,
  Files,
  Eye,
} from "lucide-react";
import { MessageContent } from "../components/MessageContent";
import { StreamingMessage } from "../components/StreamingMessage";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";
import { useChatStore, selectActiveMessages } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore";
import { useApiKeyStore } from "../stores/apiKeyStore";
import { useDeepSeekChat } from "../hooks/useDeepSeekChat";
import InputArea from "../components/InputArea";

function ChatPage() {
  const navigate = useNavigate();
  const messages = useChatStore(selectActiveMessages);
  const { addMessage, createConversation, isGenerating } = useChatStore();
  const { copiedMessageId, setCopiedMessageId, copyToClipboard } = useUIStore();
  const { isConfigured } = useApiKeyStore();

  const { sendMessage } = useDeepSeekChat();

  const [input, setInput] = useState("");

  // 面板状态 - 蕾姆新增：右侧工具面板控制
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [rightPanelActiveTab, setRightPanelActiveTab] = useState<'files' | 'terminal' | 'preview'>('files');

  // 光标状态
  const [isFocused, setIsFocused] = useState(false);
  const [caretVisible, setCaretVisible] = useState(false);
  const [tailActive, setTailActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [caretHeight, setCaretHeight] = useState(22);
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const tailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusCooldownRef = useRef(false);

  const targetPosRef = useRef({ x: 0, y: 0 });
  const moveDirectionRef = useRef(1);

  // 同步 mirror 样式
  const syncMirrorStyle = () => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    const computed = window.getComputedStyle(textarea);

    const properties = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "lineHeight",
      "textTransform",
      "wordSpacing",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "borderLeftWidth",
      "borderRightWidth",
      "borderTopWidth",
      "borderBottomWidth",
      "width",
      "maxWidth",
      "whiteSpace",
      "wordWrap",
      "textAlign",
      "textIndent",
      "boxSizing",
    ];

    properties.forEach((prop) => {
      mirror.style[prop as any] = computed[prop as any];
    });
  };

  const calculateCaretHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return 22;

    const computed = window.getComputedStyle(textarea);
    const fontSize = parseFloat(computed.fontSize);
    const lineHeight = computed.lineHeight;

    let height;
    if (lineHeight === "normal") {
      height = fontSize * 1.2;
    } else {
      height = parseFloat(lineHeight);
    }

    return Math.max(18, Math.min(height, 40));
  };

  const isCaretVisible = (rawX: number, rawY: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return true;

    const computed = window.getComputedStyle(textarea);
    const paddingTop = parseFloat(computed.paddingTop);
    const paddingBottom = parseFloat(computed.paddingBottom);
    const paddingLeft = parseFloat(computed.paddingLeft);
    const paddingRight = parseFloat(computed.paddingRight);

    const viewportTop = textarea.scrollTop;
    const viewportBottom = textarea.scrollTop + textarea.clientHeight;
    const viewportLeft = textarea.scrollLeft;
    const viewportRight = textarea.scrollLeft + textarea.clientWidth;

    const contentTop = paddingTop;
    const contentBottom = textarea.scrollHeight - paddingBottom;
    const contentLeft = paddingLeft;
    const contentRight = textarea.scrollWidth - paddingRight;

    const caretTop = rawY;
    const caretBottom = rawY + caretHeight;
    const caretLeft = rawX;
    const caretRight = rawX + 2.5;

    const inContentY = caretTop >= contentTop && caretTop < contentBottom;
    const inContentX = caretLeft >= contentLeft && caretLeft < contentRight;

    const tolerance = 2;
    const isVisibleY =
      caretBottom > viewportTop + tolerance &&
      caretTop < viewportBottom - tolerance;
    const isVisibleX =
      caretRight > viewportLeft + tolerance &&
      caretLeft < viewportRight - tolerance;

    return inContentY && inContentX && isVisibleY && isVisibleX;
  };

  const getCaretPosition = () => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror)
      return { x: 0, y: 0, height: 22, rawX: 0, rawY: 0 };

    const computed = window.getComputedStyle(textarea);
    const height = calculateCaretHeight();
    setCaretHeight(height);

    const textareaOffsetX = textarea.offsetLeft;
    const textareaOffsetY = textarea.offsetTop;

    const properties = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "letterSpacing",
      "lineHeight",
      "textTransform",
      "wordSpacing",
      "whiteSpace",
      "wordWrap",
      "textAlign",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "borderWidth",
      "boxSizing",
    ];
    properties.forEach((prop) => {
      mirror.style[prop as any] = computed[prop as any];
    });

    mirror.style.width = textarea.clientWidth + "px";

    const textBeforeCaret = textarea.value.substring(
      0,
      textarea.selectionStart
    );
    mirror.textContent = textBeforeCaret;

    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);

    const rawX = span.offsetLeft;
    const rawY = span.offsetTop;

    const x = rawX + textareaOffsetX - textarea.scrollLeft;
    const y = rawY + textareaOffsetY - textarea.scrollTop;

    mirror.removeChild(span);

    return { x, y, height, rawX, rawY };
  };

  const autoGrowTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 240);
    textarea.style.height = newHeight + "px";
  };

  const updateCaret = (isInputEvent = false, enableTail = true) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = getCaretPosition();

    const dx = pos.x - lastPosRef.current.x;
    if (dx > 0.5) {
      moveDirectionRef.current = 1;
    } else if (dx < -0.5) {
      moveDirectionRef.current = -1;
    }

    const dy = pos.y - lastPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (enableTail && !focusCooldownRef.current && distance > 3) {
      setTailActive(true);
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current);
      tailTimeoutRef.current = setTimeout(() => setTailActive(false), 150);
    }

    lastPosRef.current = pos;

    targetPosRef.current = {
      x: pos.x,
      y: pos.y,
    };

    if (isInputEvent) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
    }

    setCaretPosition(pos);

    if (isFocused) {
      const visible = isCaretVisible(pos.rawX, pos.rawY);
      setCaretVisible(visible);
    }
  };

  useEffect(() => {
    syncMirrorStyle();
    const handleResize = () => {
      syncMirrorStyle();
      setCaretHeight(calculateCaretHeight());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    updateCaret(true);
  }, [input]);

  useEffect(() => {
    autoGrowTextarea();
  }, [input]);

  const handleInputFocus = () => {
    setIsFocused(true);
    syncMirrorStyle();

    setTailActive(false);
    if (tailTimeoutRef.current) clearTimeout(tailTimeoutRef.current);

    focusCooldownRef.current = true;
    setTimeout(() => {
      focusCooldownRef.current = false;
    }, 200);

    const pos = getCaretPosition();
    lastPosRef.current = pos;
    targetPosRef.current = { x: pos.x, y: pos.y };
    setCaretPosition(pos);
    setCaretHeight(pos.height);

    const visible = isCaretVisible(pos.rawX, pos.rawY);
    setCaretVisible(visible);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setTimeout(() => setCaretVisible(false), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userInput = input;
    setInput("");

    try {
      await sendMessage(userInput);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleAbort = () => {
    useChatStore.getState().abortGeneration();
  };

  const handleCopyMessage = (id: number, content: string) => {
    copyToClipboard(content, id);
  };

  return (
    <div className="flex-1 h-dvh flex flex-col min-w-0 relative">
      {/* 顶部栏 - 桌面应用优化高度 */}
      

      {/* 蕾姆重构：可调整大小的面板布局 */}
      <Group direction="horizontal" className="flex-1 overflow-hidden">
        {/* 左侧：聊天面板 */}
        <Panel
          defaultSize={70}
          minSize={40}
          className="flex flex-col min-w-0"
        >
          <header className="h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => useUIStore.getState().setMobileSidebarOpen(true)}
          >
            <Menu className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
          <h2 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            新对话
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {/* 蕾姆新增：右侧面板切换按钮 */}
          <button
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className="hidden md:flex p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
            title={rightPanelVisible ? "隐藏工具面板" : "显示工具面板"}
          >
            <PanelLeftOpen className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
          <ThemeToggle />
        </div>
      </header>
          {/* 消息区域 - 桌面应用优化宽度 */}
          <div className="flex-1 overflow-y-auto bg-[#f5f5f7] dark:bg-black">
            <div className="py-2 max-w-3xl mx-auto px-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`group ${
                    message.role === "user" ? "flex justify-end py-2" : "py-3"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-1 relative pb-6">
                      {/* 流式消息组件（最后一条且正在生成） */}
                      {index === messages.length - 1 && isGenerating ? (
                        <StreamingMessage
                          messageId={message.id}
                          content={message.content}
                          isStreaming={true}
                        />
                      ) : (
                        <div className="prose prose-sm max-w-none prose-p:break-words prose-a:break-words">
                          <MessageContent content={message.content} />
                        </div>
                      )}

                      {/* 复制按钮 */}
                      <div className="absolute bottom-0 left-0 flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleCopyMessage(message.id, message.content)
                          }
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-primary-500"
                          title="复制"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-primary-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {message.role === "user" && (
                    <div className="flex justify-end">
                      <div className="relative group/bubble max-w-[85%] min-w-[120px] w-fit">
                        <div className="px-4 py-2.5 bg-primary-500 text-white rounded-xl rounded-br-md shadow-lg shadow-primary-500/20 overflow-hidden">
                          <p className="text-[15px] leading-[1.6] text-white whitespace-pre-wrap break-all">
                            {message.content}
                          </p>
                        </div>
                        <div className="absolute -bottom-6 right-0 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              handleCopyMessage(message.id, message.content)
                            }
                            className="p-1 bg-white dark:bg-[#1c1c1e] rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 shadow-sm"
                            title="复制"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-3 h-3 text-primary-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#86868b] dark:text-[#8e8e93]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 输入区域 */}
          <div className="relative">
            {/* 中断按钮 */}
            {isGenerating && (
              <button
                onClick={handleAbort}
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium shadow-lg hover:bg-red-600 transition-all"
              >
                <Square className="w-3 h-3" />
                停止生成
              </button>
            )}

            <InputArea
              input={input}
              setInput={setInput}
              onSend={handleSend}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              caretVisible={caretVisible}
              isTyping={isTyping}
              caretHeight={caretHeight}
              caretPosition={caretPosition}
              moveDirection={moveDirectionRef.current}
              tailActive={tailActive}
              targetPosition={targetPosRef.current}
              textareaRef={textareaRef}
              mirrorRef={mirrorRef}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              updateCaret={updateCaret}
              disabled={isGenerating}
            />
          </div>
        </Panel>

        {/* 蕾姆新增：可拖动的分隔条 */}
        {rightPanelVisible && (
          <Separator className="w-1 bg-transparent hover:bg-primary-500/30 transition-colors relative group">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
            </div>
          </Separator>
        )}

        {/* 蕾姆新增：右侧工具面板 */}
        {rightPanelVisible && (
          <Panel
            defaultSize={300}
            minSize={300}
            maxSize={1000}
            className="flex-col bg-white dark:bg-[#1c1c1e] border-l border-black/5 dark:border-white/10"
          >
            {/* 工具面板头部 */}
            <div className="h-12 border-b border-black/5 dark:border-white/10 flex items-center px-4 gap-2">
              <Button
                variant={rightPanelActiveTab === 'files' ? 'primary' : 'ghost'}
                size="sm"
                icon={Files}
                onClick={() => setRightPanelActiveTab('files')}
              >
                文件
              </Button>
              <Button
                variant={rightPanelActiveTab === 'terminal' ? 'primary' : 'ghost'}
                size="sm"
                icon={FileTerminal}
                onClick={() => setRightPanelActiveTab('terminal')}
              >
                终端
              </Button>
              <Button
                variant={rightPanelActiveTab === 'preview' ? 'primary' : 'ghost'}
                size="sm"
                icon={Eye}
                onClick={() => setRightPanelActiveTab('preview')}
              >
                预览
              </Button>
            </div>

            {/* 工具面板内容 */}
            <div className="flex-1 overflow-y-auto">
              {rightPanelActiveTab === 'files' && (
                <div className="h-full flex flex-col">
                  {/* 空状态占位 */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center mb-4">
                      <Files className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                      文件管理
                    </h3>
                    <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                      管理项目文件和资源
                    </p>
                    <div className="mt-6 w-full space-y-2">
                      <Button variant="primary" size="sm" className="w-full">
                        上传文件
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full">
                        新建文件夹
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelActiveTab === 'terminal' && (
                <div className="h-full flex flex-col">
                  {/* 终端窗口 */}
                  <div className="flex-1 bg-[#1d1d1f] rounded-lg m-3 p-4 font-mono text-sm overflow-y-auto">
                    <div className="text-green-400 mb-2">
                      <span className="text-white">user</span>@<span className="text-white">onir</span>:<span className="text-blue-400">~</span>$
                    </div>
                    <div className="text-[#8e8e93] opacity-80">
                      欢迎使用 Onir 终端<br/>
                      输入命令开始使用...
                    </div>
                    <div className="mt-3 text-green-400">
                      <span className="text-white">user</span>@<span className="text-white">onir</span>:<span className="text-blue-400">~</span>$
                      <span className="animate-pulse">_</span>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelActiveTab === 'preview' && (
                <div className="h-full flex flex-col">
                  {/* 空状态占位 */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center mb-4">
                      <Eye className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                      实时预览
                    </h3>
                    <p className="text-xs text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                      预览代码和内容的渲染效果
                    </p>
                    <div className="mt-6 px-4 py-3 bg-primary-500/10 rounded-lg">
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        💡 选择一条消息即可预览
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}
      </Group>
    </div>
  );
}

export default ChatPage;
