/**
 * 蕾姆精心设计的通用设置页面
 * 完全模仿用户界面页面的布局风格
 */
import {
  Settings as SettingsIcon,
  Zap,
  Globe,
  Power,
  Minimize2,
  Eye,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { useApiKeyStore } from "../stores/apiKeyStore";
import { useThemeStore } from "../stores/themeStore";
import { useLocaleStore } from "../stores/localeStore";
import { LanguageSelector } from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// 主题色配置（本地定义）
const ACCENT_COLORS = {
  'rem-blue': {
    id: 'rem-blue',
    name: '蕾姆蓝',
    value: '#95C0EC',
  },
  'violet': {
    id: 'violet',
    name: '紫罗兰',
    value: '#A78BFA',
  },
  'emerald': {
    id: 'emerald',
    name: '翡翠绿',
    value: '#34D399',
  },
  'sakura': {
    id: 'sakura',
    name: '樱花粉',
    value: '#FB7185',
  },
  'amber': {
    id: 'amber',
    name: '琥珀黄',
    value: '#FBBF24',
  },
};

type ThemeColorId = keyof typeof ACCENT_COLORS;

export default function GeneralSettingsPage() {
  const { t } = useTranslation();
  const { accentColor } = useThemeStore();
  const { providers, initialize } = useApiKeyStore();

  // 初始化数据加载
  useEffect(() => {
    initialize();
  }, []);

  // 工具模型状态
  const [utilityModel, setUtilityModel] = useState('deepseek-chat');
  const [testingSpeed, setTestingSpeed] = useState(false);
  const [speedResult, setSpeedResult] = useState<number | null>(null);

  // 自定义下拉列表状态
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 开关状态
  const [startupLaunch, setStartupLaunch] = useState(false);
  const [startupMinimized, setStartupMinimized] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [closeToTray, setCloseToTray] = useState(true);
  const [autoHideOnBlur, setAutoHideOnBlur] = useState(false);

  // 获取所有启用的模型列表（按供应商分组）
  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, {
      providerName: string;
      providerColor: string;
      models: string[];
    }> = {};

    providers.forEach(provider => {
      if (provider.models && provider.models.length > 0) {
        grouped[provider.id] = {
          providerName: provider.name,
          providerColor: provider.color,
          models: provider.models,
        };
      }
    });

    return grouped;
  }, [providers]);

  // 获取所有模型（用于查找当前选中的模型信息）
  const allModels = useMemo(() => {
    const models: Array<{ model: string; provider: string; providerName: string }> = [];

    Object.entries(modelsByProvider).forEach(([providerId, data]) => {
      data.models.forEach(model => {
        models.push({
          model,
          provider: providerId,
          providerName: data.providerName,
        });
      });
    });

    return models;
  }, [modelsByProvider]);

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
    if (isDropdownOpen) {
      updateDropdownPosition();
    }
  }, [isDropdownOpen]);

  // 窗口滚动或调整大小时更新位置
  useEffect(() => {
    if (isDropdownOpen) {
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isDropdownOpen]);

  // 点击外部关闭下拉列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 测试模型速度
  const handleTestSpeed = async () => {
    setTestingSpeed(true);
    setSpeedResult(null);

    const startTime = Date.now();

    try {
      // 这里应该调用实际的 API 测试
      // 暂时模拟测试延迟
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      const endTime = Date.now();
      const latency = endTime - startTime;
      setSpeedResult(latency);
    } catch (error) {
      console.error('测试速度失败:', error);
    } finally {
      setTestingSpeed(false);
    }
  };

  // 主题色类名映射
  const COLOR_CLASSES: Record<string, {
    bg: string
    text: string
    bgLight: string
    ring: string
    shadow: string
  }> = {
    'rem-blue': {
      bg: 'bg-rem-blue-500',
      text: 'text-rem-blue-500',
      bgLight: 'bg-rem-blue-500/10',
      ring: 'ring-rem-blue-500',
      shadow: 'shadow-rem-blue-shadow',
    },
    'violet': {
      bg: 'bg-violet-500',
      text: 'text-violet-500',
      bgLight: 'bg-violet-500/10',
      ring: 'ring-violet-500',
      shadow: 'shadow-violet-shadow',
    },
    'emerald': {
      bg: 'bg-emerald-500',
      text: 'text-emerald-500',
      bgLight: 'bg-emerald-500/10',
      ring: 'ring-emerald-500',
      shadow: 'shadow-emerald-shadow',
    },
    'sakura': {
      bg: 'bg-sakura-500',
      text: 'text-sakura-500',
      bgLight: 'bg-sakura-500/10',
      ring: 'ring-sakura-500',
      shadow: 'shadow-sakura-shadow',
    },
    'amber': {
      bg: 'bg-amber-500',
      text: 'text-amber-500',
      bgLight: 'bg-amber-500/10',
      ring: 'ring-amber-500',
      shadow: 'shadow-amber-shadow',
    },
  };

  const colorClass = COLOR_CLASSES[accentColor] || COLOR_CLASSES['rem-blue'];

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      {/* 页面头部 */}
      <PageHeader
        title={t('generalSettings.title')}
        subtitle={t('generalSettings.subtitle')}
        actions={<ThemeToggle />}
      />

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto p-4 space-y-4">
          {/* 工具模型 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              {t('generalSettings.utilityModel.sectionTitle')}
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                  <Zap className={`w-5 h-5 ${colorClass.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t('generalSettings.utilityModel.cardTitle')}
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    {t('generalSettings.utilityModel.description')}
                  </p>
                </div>
              </div>

              {/* 自定义下拉列表 + 测试按钮 */}
              <div className="flex items-center gap-3">
                {/* 自定义下拉列表 */}
                <div className="flex-1 relative">
                  {/* 下拉触发器 */}
                  <button
                    ref={triggerRef}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                      w-full px-4 py-3 pr-10
                      bg-[#f5f5f7] dark:bg-black
                      border-2 ${isDropdownOpen ? colorClass.ring : 'border-[#e5e5ea] dark:border-[#3a3a3c]'}
                      rounded-lg
                      text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]
                      focus:outline-none transition-all duration-200
                      flex items-center justify-between
                      ${Object.keys(modelsByProvider).length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#d1d1d6] dark:hover:bg-[#2a2a2c]'}
                    `}
                    disabled={Object.keys(modelsByProvider).length === 0}
                  >
                    <span>
                      {utilityModel
                        ? allModels.find(m => m.model === utilityModel)?.model || t('generalSettings.utilityModel.selectPlaceholder')
                        : t('generalSettings.utilityModel.selectPlaceholder')
                      }
                    </span>
                    {isDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                    )}
                  </button>
                </div>

                {/* Portal 渲染的下拉内容 */}
                {isDropdownOpen && dropdownPosition && Object.keys(modelsByProvider).length > 0 &&
                  createPortal(
                    <div
                      ref={dropdownRef}
                      className={`
                        fixed z-[9999]
                        bg-white/95 dark:bg-[#1c1c1e]/95
                        backdrop-blur-xl
                        border border-[#e5e5ea] dark:border-[#3a3a3c]
                        rounded-lg shadow-2xl
                        max-h-[300px] overflow-y-auto
                        transition-all duration-200
                      `}
                      style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                      }}
                    >
                      {Object.entries(modelsByProvider).map(([providerId, data]) => (
                        <div key={providerId} className="border-b border-[#e5e5ea] dark:border-[#3a3a3c] last:border-b-0">
                          {/* 分组标题 */}
                          <div
                            className="px-4 py-2 bg-[#f5f5f7] dark:bg-black sticky top-0"
                            style={{ borderBottom: `1px solid ${data.providerColor}20` }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: data.providerColor }}
                              />
                              <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#8e8e93]">
                                {data.providerName}
                              </span>
                            </div>
                          </div>

                          {/* 分组内的模型列表 */}
                          {data.models.map((model) => {
                            const isSelected = utilityModel === model;
                            return (
                              <button
                                key={model}
                                onClick={() => {
                                  setUtilityModel(model);
                                  setIsDropdownOpen(false);
                                  setSpeedResult(null); // 清除之前的测试结果
                                }}
                                className={`
                                  w-full px-4 py-2.5 text-left
                                  transition-all duration-150
                                  flex items-center justify-between
                                  ${isSelected
                                    ? `${colorClass.bgLight} ${colorClass.text}`
                                    : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5'
                                  }
                                `}
                              >
                                <span className="text-[13px]">{model}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>,
                    document.body
                  )
                }

                {/* 测试速度按钮 */}
                <Button
                  variant="primary"
                  size="md"
                  icon={Zap}
                  loading={testingSpeed}
                  disabled={testingSpeed || !utilityModel}
                  className={colorClass.bg + ' h-[44px]'}
                  onClick={handleTestSpeed}
                >
                  {testingSpeed
                    ? t('generalSettings.utilityModel.testing')
                    : t('generalSettings.utilityModel.testButton')
                  }
                </Button>
              </div>

              {/* 测试结果 */}
              {speedResult !== null && (
                <div className={`
                  mt-3 px-4 py-3 rounded-lg
                  ${speedResult < 1000
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : speedResult < 2000
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }
                `}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">
                      {t('generalSettings.utilityModel.responseTime')}：
                    </span>
                    <span className="text-[13px] font-semibold">
                      {speedResult} ms
                      {speedResult < 1000 && t('generalSettings.utilityModel.fast')}
                      {speedResult >= 1000 && speedResult < 2000 && t('generalSettings.utilityModel.medium')}
                      {speedResult >= 2000 && t('generalSettings.utilityModel.slow')}
                    </span>
                  </div>
                </div>
              )}

              {/* 当前选择提示 */}
              {utilityModel && (
                <div className="mt-3 px-4 py-2 bg-[#f5f5f7] dark:bg-black rounded-lg">
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    {t('generalSettings.utilityModel.currentSelection', { modelName: utilityModel })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 语言 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              {t('generalSettings.language.sectionTitle')}
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Globe className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.language.displayName')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.language.current')}
                    </p>
                  </div>
                </div>
                {/* 集成语言选择器 */}
                <LanguageSelector />
              </button>
            </div>
          </div>

          {/* 启动设置 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              {t('generalSettings.startup.sectionTitle')}
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              {/* 开机启动 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Power className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.startup.launchOnStartup')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.startup.launchOnStartupDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={startupLaunch}
                  onChange={setStartupLaunch}
                />
              </div>

              {/* 启动时最小化 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Minimize2 className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.startup.minimizeOnLaunch')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.startup.minimizeOnLaunchDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={startupMinimized}
                  onChange={setStartupMinimized}
                />
              </div>
            </div>
          </div>

          {/* 窗口行为 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              {t('generalSettings.window.sectionTitle')}
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              {/* 最小化到系统托盘 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Minimize2 className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.window.minimizeToTray')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.window.minimizeToTrayDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={minimizeToTray}
                  onChange={setMinimizeToTray}
                />
              </div>

              {/* 关闭到系统托盘 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Power className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.window.closeToTray')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.window.closeToTrayDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={closeToTray}
                  onChange={setCloseToTray}
                />
              </div>
            </div>
          </div>

          {/* 快速对话 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              {t('generalSettings.quickChat.sectionTitle')}
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              {/* 失焦时自动隐藏 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Eye className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {t('generalSettings.quickChat.autoHideOnBlur')}
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      {t('generalSettings.quickChat.autoHideOnBlurDesc')}
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={autoHideOnBlur}
                  onChange={setAutoHideOnBlur}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
