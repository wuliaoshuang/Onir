/**
 * 蕾姆精心设计的语言选择器组件
 * 提供优雅的语言切换体验
 */
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocaleStore } from '../stores/localeStore';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../i18n/config';
import { createPortal } from 'react-dom';

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLocaleStore();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 计算下拉列表位置
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // 打开下拉列表时计算位置
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  // 窗口滚动或调整大小时更新位置
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  // 点击外部关闭下拉列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES[language];

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
        title={t('languageSelector.changeLanguage')}
      >
        <Globe className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
        <span className="text-[13px] text-light-text-primary dark:text-dark-text-primary">
          {currentLang?.flag} {currentLang?.nativeName}
        </span>
      </button>

      {/* 下拉列表（Portal 渲染） */}
      {isOpen && dropdownPosition &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`
              fixed z-[9999]
              bg-white/95 dark:bg-dark-card/95
              backdrop-blur-xl
              border border-light-border dark:border-dark-border
              rounded-lg shadow-2xl
              py-2
              transition-all duration-200
            `}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 200)}px`,
            }}
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => {
              const isSelected = language === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2.5
                    flex items-center justify-between
                    transition-all duration-150
                    ${isSelected
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{info.flag}</span>
                    <span className="text-[13px]">{info.nativeName}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )
      }
    </div>
  );
}
