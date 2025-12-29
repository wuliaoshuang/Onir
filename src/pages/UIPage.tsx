/**
 * 蕾姆精心设计的用户界面设置页面
 * 桌面应用优化 - 适配 900x700 窗口
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
import { useState } from "react";

function UIPage() {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [selectedColor, setSelectedColor] = useState("#95C0EC");
  const [fontSize, setFontSize] = useState(14);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

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

  const accentColors = [
    { color: "#95C0EC", name: "蕾姆蓝" },
    { color: "#A78BFA", name: "紫罗兰" },
    { color: "#34D399", name: "翡翠绿" },
    { color: "#FB7185", name: "樱花粉" },
    { color: "#FBBF24", name: "琥珀黄" },
  ];

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="用户界面"
        subtitle="个性化外观和体验"
        actions={<ThemeToggle />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* 主题选择 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              主题模式
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 divide-x divide-[#e5e5ea] dark:divide-[#3a3a3c]">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      onMouseEnter={() => setHoveredTheme(theme.id)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      className={`group relative p-4 text-left transition-all duration-200 ${
                        selectedTheme === theme.id
                          ? "bg-[#95C0EC]/10"
                          : "hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      {/* 选中指示器 */}
                      {selectedTheme === theme.id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-4 h-4 rounded-full bg-[#95C0EC] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 ${
                          selectedTheme === theme.id
                            ? "bg-[#95C0EC] shadow-lg shadow-[#95C0EC]/30"
                            : "bg-[#f5f5f7] dark:bg-black group-hover:scale-110"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            selectedTheme === theme.id
                              ? "text-white"
                              : "text-[#86868b] dark:text-[#8e8e93]"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-[13px] font-semibold mb-0.5 ${
                          selectedTheme === theme.id
                            ? "text-[#95C0EC]"
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

          {/* 主题色选择 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              主题色
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex flex-wrap gap-3">
                {accentColors.map((item, index) => (
                  <button
                    key={item.color}
                    onClick={() => setSelectedColor(item.color)}
                    className="group flex flex-col items-center gap-1.5 transition-all duration-200"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-xl transition-all duration-200 ${
                          selectedColor === item.color
                            ? "ring-2 ring-offset-2 ring-[#95C0EC] scale-110 shadow-lg"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: item.color }}
                      />
                      {selectedColor === item.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        selectedColor === item.color
                          ? "text-[#95C0EC]"
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

          {/* 字体设置 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              字体设置
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                  <Type className="w-5 h-5 text-[#95c0ec]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    字体大小
                  </h3>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                    调整全局文字大小
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-[#95C0EC]/10 rounded-lg">
                  <span className="text-[13px] font-semibold text-[#95C0EC]">
                    {fontSize}px
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-[#f5f5f7] dark:bg-black rounded-lg appearance-none cursor-pointer accent-[#95C0EC]"
              />
              <div className="flex justify-between text-[10px] text-[#86868b] dark:text-[#8e8e93] mt-1.5 px-1">
                <span>小 (12px)</span>
                <span>标准 (14px)</span>
                <span>大 (20px)</span>
              </div>
            </div>
          </div>

          {/* 语言和地区 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              语言和地区
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Type className="w-5 h-5 text-[#95c0ec]" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      显示语言
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      简体中文
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#95C0EC]/10 text-[#95C0EC] rounded-md text-[11px] font-medium">
                    默认
                  </span>
                  <Palette className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93] group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            </div>
          </div>

          {/* 界面特效 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              界面特效
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#95c0ec]" />
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
                <button className="w-10 h-6 rounded-full bg-[#95C0EC] relative transition-all duration-200">
                  <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-4 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-[#95c0ec]" />
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
                <button className="w-10 h-6 rounded-full bg-[#95C0EC] relative transition-all duration-200">
                  <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-4 transition-transform" />
                </button>
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
