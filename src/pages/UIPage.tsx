/**
 * 蕾姆精心设计的用户界面设置页面
 * 丰富的前端交互 - 主题预览、实时反馈、动画效果
 * ✨ 已集成全局主题状态管理
 */
import {
  User,
  Moon,
  Sun,
  Type,
  Palette,
  Monitor,
  Check,
  Sparkles,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";
import { Toggle } from "../components/ui/Toggle";
import { useThemeStore } from "../stores/themeStore";
import { useState } from "react";

// 主题色配置（本地定义，避免导入路径问题）
const ACCENT_COLORS = {
  'rem-blue': {
    id: 'rem-blue',
    name: '蕾姆蓝',
    value: '#95C0EC',
    hover: '#7aaddd',
    hoverDark: '#b0d4f0',
    light: 'oklch(0.95 0.03 250)',
    shadow: 'rgba(149, 192, 236, 0.3)',
  },
  'violet': {
    id: 'violet',
    name: '紫罗兰',
    value: '#A78BFA',
    hover: '#8B5CF6',
    hoverDark: '#C4B5FD',
    light: 'oklch(0.95 0.05 300)',
    shadow: 'rgba(167, 139, 250, 0.3)',
  },
  'emerald': {
    id: 'emerald',
    name: '翡翠绿',
    value: '#34D399',
    hover: '#10B981',
    hoverDark: '#6EE7B7',
    light: 'oklch(0.95 0.05 150)',
    shadow: 'rgba(52, 211, 153, 0.3)',
  },
  'sakura': {
    id: 'sakura',
    name: '樱花粉',
    value: '#FB7185',
    hover: '#F43F5E',
    hoverDark: '#FDA4AF',
    light: 'oklch(0.95 0.05 20)',
    shadow: 'rgba(251, 113, 133, 0.3)',
  },
  'amber': {
    id: 'amber',
    name: '琥珀黄',
    value: '#FBBF24',
    hover: '#F59E0B',
    hoverDark: '#FCD34D',
    light: 'oklch(0.95 0.05 85)',
    shadow: 'rgba(251, 191, 36, 0.3)',
  },
};

function UIPage() {
  // ✅ 从 themeStore 获取状态和操作
  const {
    mode,
    accentColor,
    fontSize,
    animations,
    highRefresh,
    setThemeMode,
    setAccentColor,
    setFontSize,
    setAnimations,
    setHighRefresh,
  } = useThemeStore();

  // ✅ 保留纯 UI 状态
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // ✅ 颜色 ID 到 Tailwind 类名的映射
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

  // 获取当前主题色的类名
  const colorClass = COLOR_CLASSES[accentColor] || COLOR_CLASSES['rem-blue'];

  const themes = [
    { id: "light", name: "浅色", icon: Sun, description: "明亮清爽的界面" },
    { id: "dark", name: "深色", icon: Moon, description: "护眼深色模式" },
    {
      id: "system",
      name: "跟随系统",
      icon: Monitor,
      description: "自动切换主题",
    },
  ];

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="用户界面"
        subtitle="个性化外观和体验"
        actions={<ThemeToggle />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto p-4 space-y-4">
          {/* 主题选择 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              主题模式
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 divide-[#e5e5ea] dark:divide-[#3a3a3c]">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setThemeMode(theme.id)}
                      onMouseEnter={() => setHoveredTheme(theme.id)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      className={`group relative p-4 text-left transition-all duration-200 ${
                        mode === theme.id
                          ? `${colorClass.bgLight}`
                          : "hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {/* 选中指示器 */}
                      {mode === theme.id && (
                        <div className="absolute top-3 right-3">
                          <div className={`w-4 h-4 rounded-full ${colorClass.bg} flex items-center justify-center`}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 ${
                          mode === theme.id
                            ? `${colorClass.bg} shadow-lg ${colorClass.shadow}`
                            : "bg-[#f5f5f7] dark:bg-black group-hover:scale-110"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            mode === theme.id
                              ? "text-white"
                              : "text-[#86868b] dark:text-[#8e8e93]"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-[13px] font-semibold mb-0.5 ${
                          mode === theme.id
                            ? `${colorClass.text}`
                            : "text-[#1d1d1f] dark:text-[#f5f5f7]"
                        }`}
                      >
                        {theme.name}
                      </h3>
                      <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 主题色选择 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              主题色
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex flex-wrap gap-3">
                {Object.values(ACCENT_COLORS).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setAccentColor(item.id)}
                    className="group flex flex-col items-center gap-2 transition-all duration-200"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-xl transition-all duration-200 ${
                          accentColor === item.id
                            ? `${colorClass.ring} ring-offset-2 scale-110 shadow-lg`
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: item.value }}
                      />
                      {accentColor === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        accentColor === item.id
                          ? `${colorClass.text}`
                          : "text-[#86868b] dark:text-[#8e8e93]"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 字体设置 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              字体设置
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                  <Type className={`w-5 h-5 ${colorClass.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    字体大小
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    调整全局文字大小
                  </p>
                </div>
                <div className={`px-3 py-1.5 ${colorClass.bgLight} rounded-lg`}>
                  <span className={`text-[13px] font-semibold ${colorClass.text}`}>
                    {fontSize}px
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setFontSize(newSize);
                }}
                className="w-full h-2 bg-[#f5f5f7] dark:bg-black rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <div className="flex justify-between text-[11px] text-[#86868b] dark:text-[#8e8e93] mt-2 px-1">
                <span>小 (12px)</span>
                <span>标准 (16px)</span>
                <span>大 (20px)</span>
              </div>
            </div>
          </div>

          {/* 界面特效 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              界面特效
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Sparkles className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      动画效果
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      启用界面过渡动画
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={animations}
                  onChange={setAnimations}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Monitor className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      高刷新率模式
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      优化高刷屏显示效果
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={highRefresh}
                  onChange={setHighRefresh}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加淡入动画样式 */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default UIPage;
