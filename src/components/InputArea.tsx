/**
 * 蕾姆精心设计的输入区域组件
 * 🎯 简化版自定义光标 - 只保留核心功能，确保流畅
 */
import React, { useRef, RefObject, useEffect, useCallback, useState, useLayoutEffect } from "react";
import { Plus, Paperclip, Image, Mic, Sticker, X, Square } from "lucide-react";
import { useUIStore } from "../stores/uiStore";
import { ModelSelector } from "./ModelSelector";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  currentModel?: string;
  onModelChange?: (model: string) => void;
  isSending?: boolean;
  onStop?: () => void;
}

const toolItems = [
  { icon: Paperclip, label: "上传文件", shortcut: "⌘⇧U" },
  { icon: Image, label: "发送图片", shortcut: "⌘⇧I" },
  { icon: Mic, label: "语音输入", shortcut: "⌘⇧V" },
  { icon: Sticker, label: "表情符号", shortcut: "⌘⇧E" },
];

// 需要同步的 CSS 属性
const STYLES_TO_COPY = [
  'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth',
  'boxSizing', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight',
  'letterSpacing', 'lineHeight', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop',
  'tabSize', 'textIndent', 'textRendering', 'textTransform', 'width', 'wordBreak', 'wordSpacing', 'wordWrap'
];

/**
 * 简化的光标组件 - 只做必要的事情
 */
const Cursor = React.memo(({
  textareaRef,
  content
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  content: string;
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#95C0EC');

  const cursorRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // 监听主题色变化
  useEffect(() => {
    const updateColor = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (color) setPrimaryColor(color);
    };
    updateColor();

    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme-color']
    });
    return () => observer.disconnect();
  }, []);

  // 计算光标位置
  const updatePos = useCallback(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    // 只同步一次样式
    if (!mirror.style.width) {
      const computed = getComputedStyle(textarea);
      STYLES_TO_COPY.forEach(prop => {
        (mirror.style as any)[prop] = computed[prop as any];
      });
    }
    mirror.style.width = textarea.clientWidth + 'px';

    // 计算位置
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    mirror.textContent = textBefore;

    const span = document.createElement('span');
    span.textContent = '|';
    mirror.appendChild(span);

    const x = span.offsetLeft - textarea.scrollLeft;
    const y = span.offsetTop - textarea.scrollTop;

    mirror.removeChild(span);

    setPos({ x, y });

    // 输入状态检测
    isTypingRef.current = true;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  }, [textareaRef]);

  // 内容变化时立即更新（同步）
  useLayoutEffect(() => {
    if (isFocused) {
      updatePos();
    }
  }, [content, isFocused, updatePos]);

  // 事件监听
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);

    const events = ['click', 'select', 'scroll'];
    events.forEach(e => {
      textarea.addEventListener(e, updatePos, { passive: true });
    });

    return () => {
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
      events.forEach(e => textarea.removeEventListener(e, updatePos));
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [textareaRef, updatePos]);

  const transform = `translate(${pos.x}px, ${pos.y}px)`;

  return (
    <>
      <div
        ref={mirrorRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          visibility: 'hidden', pointerEvents: 'none',
          whiteSpace: 'pre-wrap', wordWrap: 'break-word',
        }}
      />
      {isFocused && (
        <div
          ref={cursorRef}
          className={isTypingRef.current ? 'caret-breathing' : 'blinking'}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '2px', height: '20px',
            backgroundColor: primaryColor,
            transform,
            transition: 'transform 0.05s ease-out',
            boxShadow: isTypingRef.current
              ? `0 0 6px ${primaryColor}80, 0 0 12px ${primaryColor}40`
              : 'none',
          }}
        />
      )}
    </>
  );
});
Cursor.displayName = 'Cursor';

export default function InputArea({
  input,
  setInput,
  onSend,
  currentModel,
  onModelChange,
  isSending = false,
  onStop,
}: InputAreaProps) {
  const { showTools, setShowTools } = useUIStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // 自动调整 textarea 高度
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const newValue = textarea.value;
    setInput(newValue);
    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 144);
    textarea.style.height = newHeight + "px";
  }, [setInput]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <>
      {/* 输入区域 */}
      <div className="relative px-2.5 sm:px-4 pb-3 sm:pb-6">
        <div className="max-w-3xl mx-auto relative z-10">
          {/* 悬浮输入框 */}
          <div className="bg-white dark:bg-dark-card rounded-xl sm:rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
            {/* 工具栏 */}
            <div className="flex items-center gap-1 px-2.5 py-2 sm:px-4 sm:py-2.5">
              <button
                onClick={() => setShowTools(!showTools)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>

              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Paperclip className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>

              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Image className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>

              {/* 模型选择器 */}
              {onModelChange && (
                <ModelSelector
                  currentModel={currentModel || ''}
                  onModelChange={onModelChange}
                />
              )}

              <div className="flex-1" />

              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200">
                <Mic className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            {/* 文本输入区 */}
            <div className="relative flex items-start gap-2 px-2.5 pb-2.5 sm:px-4 sm:pb-3">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  className="w-full bg-transparent resize-none outline-none text-[14px] text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary min-h-[24px] max-h-36 leading-relaxed py-1.5 overflow-y-auto"
                  style={{ caretColor: 'transparent' }}
                  rows={1}
                />
                <Cursor textareaRef={textareaRef} content={input} />
              </div>

              {/* 发送/停止按钮 */}
              <button
                onClick={isSending ? onStop : onSend}
                disabled={!input.trim() && !isSending}
                className={`p-2 rounded-xl transition-all duration-200 active:scale-95 self-end shrink-0 flex items-center justify-center ${
                  isSending
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25"
                    : input.trim()
                    ? "bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-400 shadow-lg shadow-primary-500/25"
                    : "bg-light-border dark:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary cursor-not-allowed"
                }`}
              >
                {isSending ? (
                  <Square className="w-3.5 h-3.5" fill="currentColor" />
                ) : (
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
                )}
              </button>
            </div>
          </div>

          {/* 提示文本 */}
          <div className="hidden sm:flex items-center justify-center gap-2 mt-1.5">
            <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
              AI 可能产生错误，请核实重要信息
            </p>
            <span className="text-light-border dark:text-dark-border">·</span>
            <button className="text-[11px] text-primary-500 hover:underline">
              查看快捷键
            </button>
          </div>
        </div>
      </div>

      {/* 展开工具面板 */}
      {showTools && (
        <div className="tools-panel fixed bottom-16 sm:bottom-28 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 p-2 sm:p-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setShowTools(false)}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
          <div className="grid grid-cols-4 gap-1">
            {toolItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
              >
                <item.icon className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] text-light-text-primary dark:text-dark-text-primary">
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
