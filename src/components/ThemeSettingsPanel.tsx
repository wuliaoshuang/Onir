/**
 * 蕾姆精心设计的主题设置面板
 * 提供完整的个性化外观和体验配置
 */

import React, { useState } from 'react'
import { Monitor, Moon, Sun, Palette, Type, Zap, Sparkles } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { Toggle } from './ui/Toggle'
import { ACCENT_COLORS, THEME_MODES, FONT_SIZE_MIN, FONT_SIZE_MAX } from '../config/theme'

export function ThemeSettingsPanel() {
  // 从 themeStore 获取状态和操作
  const {
    mode,
    accentColor,
    fontSize,
    animations,
    highRefresh,
    setThemeMode,
    setAccentColor,
    setFontSize,
    toggleAnimations,
    toggleHighRefresh,
  } = useThemeStore()

  // 本地状态：用于字体大小滑块的实时预览
  const [tempFontSize, setTempFontSize] = useState(fontSize)

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-page-enter">
      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 mb-4">
          <Palette className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-[--text-primary]">个性化外观</h2>
        <p className="text-sm text-[--text-secondary] mt-2">调整界面风格，打造专属体验</p>
      </div>

      {/* 1. 主题模式选择 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-5 h-5 text-[--text-secondary]" />
          <h3 className="text-base font-semibold text-[--text-primary]">主题模式</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEME_MODES.map((themeMode) => {
            const isActive = mode === themeMode.id
            return (
              <button
                key={themeMode.id}
                onClick={() => setThemeMode(themeMode.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                  border-2 transition-all duration-200
                  ${isActive
                    ? 'border-[--primary] bg-[--primary-light] shadow-[--primary-shadow]'
                    : 'border-[--border] bg-[--bg-card] hover:border-[--primary]/50'
                  }
                `}
              >
                {/* 图标 */}
                <div className="relative">
                  {themeMode.icon === 'sun' && (
                    <Sun className={`w-6 h-6 ${isActive ? 'text-amber-500' : 'text-[--text-secondary]'}`} />
                  )}
                  {themeMode.icon === 'moon' && (
                    <Moon className={`w-6 h-6 ${isActive ? 'text-primary-500' : 'text-[--text-secondary]'}`} />
                  )}
                  {themeMode.icon === 'monitor' && (
                    <Monitor className={`w-6 h-6 ${isActive ? 'text-emerald-500' : 'text-[--text-secondary]'}`} />
                  )}
                  {/* 选中标记 */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[--primary] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                {/* 名称和描述 */}
                <div className="text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-[--primary]' : 'text-[--text-primary]'}`}>
                    {themeMode.name}
                  </div>
                  <div className="text-xs text-[--text-secondary] mt-0.5">{themeMode.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. 主题色选择 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-[--text-secondary]" />
          <h3 className="text-base font-semibold text-[--text-primary]">主题颜色</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {Object.values(ACCENT_COLORS).map((color) => {
            const isActive = accentColor === color.id
            return (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className={`
                  relative group flex flex-col items-center gap-2 p-3 rounded-xl
                  border-2 transition-all duration-200
                  ${isActive
                    ? 'border-[--primary] shadow-[--primary-shadow] scale-105'
                    : 'border-[--border] hover:border-[--primary]/50 hover:scale-102'
                  }
                `}
                style={isActive ? {
                  borderColor: color.value,
                  boxShadow: color.shadow
                } : {}}
              >
                {/* 颜色预览圆 */}
                <div
                  className={`
                    w-12 h-12 rounded-full transition-all duration-200
                    ${isActive ? 'ring-4 ring-offset-2' : 'ring-0'}
                  `}
                  style={{
                    backgroundColor: color.value,
                    ringColor: color.value,
                    '--tw-ring-offset-color': 'var(--bg-card)',
                  } as React.CSSProperties}
                />
                {/* 颜色名称 */}
                <div className={`text-xs font-medium ${isActive ? 'text-[--primary]' : 'text-[--text-secondary]'}`}>
                  {color.name}
                </div>
                {/* 选中标记 */}
                {isActive && (
                  <div className="absolute top-1 right-1">
                    <Sparkles className="w-4 h-4 text-[--primary]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* 3. 字体大小调节 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-[--text-secondary]" />
            <h3 className="text-base font-semibold text-[--text-primary]">字体大小</h3>
          </div>
          <span className="text-sm font-medium text-[--primary]">{tempFontSize}px</span>
        </div>
        <div className="px-2">
          <input
            type="range"
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            value={tempFontSize}
            onChange={(e) => {
              const newSize = Number(e.target.value)
              setTempFontSize(newSize)
              setFontSize(newSize)
            }}
            className="
              w-full h-2 rounded-full appearance-none cursor-pointer
              bg-[--border] outline-none
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[--primary]
              [&::-webkit-slider-thumb]:shadow-[--primary-shadow]
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-110
            "
          />
          <div className="flex justify-between text-xs text-[--text-secondary] mt-2 px-1">
            <span>小 (12px)</span>
            <span>标准 (14px)</span>
            <span>大 (20px)</span>
          </div>
        </div>
        {/* 字体大小预览 */}
        <div className="p-4 rounded-xl bg-[--bg-card] border border-[--border]">
          <p style={{ fontSize: `${tempFontSize}px` }} className="text-[--text-primary] leading-relaxed">
            这是一段示例文字，用于预览字体大小效果。蕾姆希望您能看到清晰的文字大小调整~
          </p>
        </div>
      </section>

      {/* 4. 动画效果开关 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-card] border border-[--border]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Zap className={`w-5 h-5 text-amber-500 ${!animations ? 'opacity-40' : ''}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-[--text-primary]">动画效果</div>
              <div className="text-xs text-[--text-secondary]">页面过渡和交互动画</div>
            </div>
          </div>
          {/* 切换开关 */}
          <Toggle
            size="md"
            checked={animations}
            onChange={toggleAnimations}
          />
        </div>
      </section>

      {/* 5. 高刷新率模式开关 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-card] border border-[--border]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Sparkles className={`w-5 h-5 text-emerald-500 ${!highRefresh ? 'opacity-40' : ''}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-[--text-primary]">高刷新率模式</div>
              <div className="text-xs text-[--text-secondary]">120Hz+ 显示器优化</div>
            </div>
          </div>
          {/* 切换开关 */}
          <Toggle
            size="md"
            checked={highRefresh}
            onChange={toggleHighRefresh}
          />
        </div>
      </section>

      {/* 提示信息 */}
      <div className="mt-8 p-4 rounded-xl bg-[--primary-light] border border-[--primary]/20">
        <p className="text-sm text-[--text-primary] text-center">
          ✨ 所有设置会自动保存，下次打开应用时依然保留
        </p>
      </div>
    </div>
  )
}
