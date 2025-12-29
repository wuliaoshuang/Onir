/**
 * 蕾姆精心设计的聊天页面
 * 从 App.jsx 重构而来，使用 Zustand 状态管理
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { MessageContent } from "../components/MessageContent";
import { ThemeToggle } from "../components/ThemeToggle";
import { useChatStore, selectActiveMessages } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore";
import InputArea from "../components/InputArea";

function ChatPage() {
  const navigate = useNavigate();
  const messages = useChatStore(selectActiveMessages);
  const { addMessage, createConversation } = useChatStore();
  const { copiedMessageId, setCopiedMessageId, copyToClipboard } = useUIStore();

  const [input, setInput] = useState("");

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

  const handleSend = () => {
    if (!input.trim()) return;

    // 添加用户消息
    addMessage("user", input);
    const userInput = input;
    setInput("");

    // 模拟 AI 回复
    setTimeout(() => {
      addMessage(
        "assistant",
        `我收到了你的消息："${userInput}"\n\n这是一个演示界面。`
      );
    }, 500);
  };

  const handleCopyMessage = (id: number, content: string) => {
    copyToClipboard(content, id);
  };

  return (
    <div className="flex-1 h-dvh flex flex-col min-w-0 relative">
      {/* 顶部栏 - 桌面应用优化高度 */}
      <header className="h-11 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-1">
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
          <ThemeToggle />
          <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
            <Ellipsis className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        </div>
      </header>

      {/* 消息区域 - 桌面应用优化宽度 */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] dark:bg-black">
        <div className="py-2 max-w-3xl mx-auto px-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group ${
                message.role === "user" ? "flex justify-end py-2" : "py-3"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-1 relative pb-6">
                  <div className="prose prose-sm max-w-none">
                    <MessageContent content={message.content} />
                  </div>
                  <div className="absolute bottom-0 left-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        handleCopyMessage(message.id, message.content)
                      }
                      className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 text-[#86868b] dark:text-[#8e8e93] hover:text-[#95C0EC]"
                      title="复制"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-[#95C0EC]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {message.role === "user" && (
                <div className="flex justify-end">
                  <div className="relative group/bubble max-w-md">
                    <div className="px-4 py-2.5 bg-[#95C0EC] text-white rounded-xl rounded-br-md shadow-lg shadow-[#95C0EC]/20">
                      <div className="prose prose-sm max-w-none prose-p:text-white prose-invert">
                        <MessageContent content={message.content} />
                      </div>
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
                          <Check className="w-3 h-3 text-[#95C0EC]" />
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
      />
    </div>
  );
}

export default ChatPage;
