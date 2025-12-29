/**
 * 蕾姆精心设计的输入区域组件
 * 包含彗星光标效果的独立组件
 */
import { useRef, RefObject, useEffect } from "react";
import { Plus, Paperclip, Image, Mic, Sticker, X } from "lucide-react";
import { useUIStore } from "../stores/uiStore";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  caretVisible: boolean;
  isTyping: boolean;
  caretHeight: number;
  caretPosition: { x: number; y: number };
  moveDirection: number;
  tailActive: boolean;
  targetPosition: { x: number; y: number };
  textareaRef: RefObject<HTMLTextAreaElement>;
  mirrorRef: RefObject<HTMLDivElement>;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  updateCaret: (isInputEvent?: boolean, enableTail?: boolean) => void;
}

const toolItems = [
  { icon: Paperclip, label: "上传文件", shortcut: "⌘⇧U" },
  { icon: Image, label: "发送图片", shortcut: "⌘⇧I" },
  { icon: Mic, label: "语音输入", shortcut: "⌘⇧V" },
  { icon: Sticker, label: "表情符号", shortcut: "⌘⇧E" },
];

export default function InputArea({
  input,
  setInput,
  onSend,
  isFocused,
  caretVisible,
  isTyping,
  caretHeight,
  caretPosition,
  moveDirection,
  tailActive,
  targetPosition,
  textareaRef,
  mirrorRef,
  handleInputFocus,
  handleInputBlur,
  updateCaret,
}: InputAreaProps) {
  const { showTools, setShowTools, setMobileSidebarOpen } = useUIStore();

  // 点击遮罩关闭工具面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showTools && !target.closest(".tools-panel")) {
        setShowTools(false);
      }
    };

    if (showTools) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTools, setShowTools]);

  return (
    <>
      {/* 输入区域 - 桌面应用优化 */}
      <div className="input-gradient relative px-2.5 sm:px-4 pb-3 sm:pb-6">
        <div className="max-w-3xl mx-auto relative z-10">
          {/* 悬浮输入框 - 桌面应用优化 */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-xl sm:rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
            {/* 工具栏 - 桌面应用优化 */}
            <div className="flex items-center gap-1 px-2.5 py-2 sm:px-4 sm:py-2.5">
              <button
                onClick={() => setShowTools(!showTools)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Paperclip className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Image className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
              <div className="flex-1" />
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Mic className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
              </button>
            </div>

            {/* 文本输入区 - 桌面应用优化 */}
            <div className="relative flex items-start gap-2 px-2.5 pb-2.5 sm:px-4 sm:pb-3">
              <div className="flex-1 relative">
                {/* 镜像层 */}
                <div
                  ref={mirrorRef}
                  id="caret-mirror"
                  style={{
                    position: "absolute",
                    visibility: "hidden",
                    zIndex: -1,
                    overflow: "hidden",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onClick={updateCaret}
                  onKeyUp={updateCaret}
                  onSelect={updateCaret}
                  onScroll={updateCaret}
                  onKeyDown={(e) => {
                    updateCaret();
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  placeholder="输入消息..."
                  className="custom-caret-textarea w-full bg-transparent resize-none outline-none text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#636366] min-h-[24px] max-h-36 leading-relaxed py-1.5 overflow-y-auto block"
                  style={{ height: "auto" }}
                />

                {/* 自定义彗星光标 */}
                {caretVisible && (
                  <div
                    className={`comet-caret absolute pointer-events-none ${
                      isTyping ? "typing" : ""
                    }`}
                    data-direction={moveDirection > 0 ? "1" : "-1"}
                    style={{
                      transform: `translate(${targetPosition.x}px, ${targetPosition.y}px)`,
                    }}
                  >
                    <div
                      className={`comet-tail ${tailActive ? "active" : ""}`}
                    />
                    {tailActive &&
                      [...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="comet-particle"
                          style={
                            {
                              "--particle-offset": `${(i + 1) * 10 + 8}px`,
                              width: `${6 - i}px`,
                              height: `${6 - i}px`,
                              opacity: 0.6 - i * 0.12,
                              animation: `particle-fade 0.4s ease-out ${
                                i * 0.03
                              }s both`,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    <div
                      className="comet-caret-main"
                      style={{ height: `${caretHeight}px` }}
                    >
                      <div className="comet-caret-glow" />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className={`p-2 rounded-xl transition-all duration-200 active:scale-95 self-end shrink-0 ${
                  input.trim()
                    ? "bg-[#95C0EC] text-white hover:bg-[#7aaddd] dark:hover:bg-[#b0d4f0] shadow-lg shadow-[#95C0EC]/25"
                    : "bg-[#e5e5ea] dark:bg-[#3a3a3c] text-[#86868b] dark:text-[#636366] cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19V5m0 0l-7 7m7-7l7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 提示文本 - 桌面应用优化 */}
          <div className="hidden sm:flex items-center justify-center gap-2 mt-1.5">
            <p className="text-[11px] text-[#86868b] dark:text-[#636366]">
              AI 可能产生错误，请核实重要信息
            </p>
            <span className="text-[#d1d1d6] dark:text-[#4a4a4c]">·</span>
            <button className="text-[11px] text-[#95C0EC] hover:underline">
              查看快捷键
            </button>
          </div>
        </div>
      </div>

      {/* 展开工具面板 - 桌面应用优化 */}
      {showTools && (
        <div className="tools-panel fixed bottom-16 sm:bottom-28 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 p-2 sm:p-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setShowTools(false)}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
          <div className="grid grid-cols-4 gap-1">
            {toolItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <item.icon className="w-4 h-4 text-[#95C0EC]" />
                <span className="text-[10px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
