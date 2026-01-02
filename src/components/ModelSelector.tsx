/**
 * 蕾姆精心重构的模型选择器组件
 * ✨ 修复了严重 bug：下拉菜单现在会智能检测边界，防止被切断
 * 🎯 蕾姆增强：支持模型启用/禁用状态显示
 *
 * 修复内容：
 * - ✅ 添加底部边界检测 - 空间不足时向上展开
 * - ✅ 添加 max-height 限制和内部滚动
 * - ✅ 防止菜单超出屏幕左右边界
 * - ✅ 支持显示禁用的模型（灰色、不可点击）
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, Cpu, ChevronUp, Lock, Brain } from 'lucide-react'
import { createPortal } from 'react-dom'
import { DeepSeek, OpenAI, Google, Anthropic, Azure } from '@lobehub/icons'
import { useApiKeyStore } from '../stores/apiKeyStore'

// 🎯 蕾姆：供应商 ID 到图标组件的映射
const ProviderIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  deepseek: DeepSeek,
  openai: OpenAI,
  google: Google,
  anthropic: Anthropic,
  azure: Azure,
}

interface ModelSelectorProps {
  currentModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
    width: number
    direction: 'down' | 'up'
  } | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 🎯 蕾姆：获取所有供应商信息和模型启用状态
  const providers = useApiKeyStore((state) => state.providers)
  const { getProviderEnabledModels, isModelEnabled } = useApiKeyStore()

  // 🎯 蕾姆：按供应商分组模型，区分启用和禁用
  const modelsByProvider = providers
    .filter(p => p.models && p.models.length > 0)
    .map(provider => {
      const allModels = provider.models || []
      const reasoningModels = provider.reasoningModels || []
      const enabledModels = getProviderEnabledModels(provider.id)
      return {
        providerId: provider.id,
        providerName: provider.name,
        providerColor: provider.color,
        allModels,
        reasoningModels,  // 🎯 蕾姆：推理模型列表
        enabledModels,
        // 禁用的模型（在所有模型中但不在启用列表中）
        disabledModels: allModels.filter(m => !enabledModels.includes(m)),
      }
    })

  // 获取所有启用的模型（用于检查是否有可用模型）
  const allEnabledModels = modelsByProvider.flatMap(p => p.enabledModels)

  // 🎯 蕾姆修复：智能计算下拉列表位置，包含边界检测
  const updateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const SPACING = 8 // 按钮和菜单之间的间距
    const MAX_HEIGHT = 280 // 菜单最大高度

    // 估算菜单高度
    const estimatedMenuHeight = Math.min(
      MAX_HEIGHT,
      80 + modelsByProvider.length * 50 // 标题 + 每个分组约 50px
    )

    // 检测底部空间
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // 决定展开方向
    let direction: 'down' | 'up' = 'down'
    let top = rect.bottom + SPACING

    if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
      // 底部空间不足，向上展开
      direction = 'up'
      top = rect.top - estimatedMenuHeight - SPACING
    }

    // 检测右边界 - 防止超出屏幕右侧
    let left = rect.left
    const menuWidth = 240 // 固定最小宽度
    if (left + menuWidth > viewportWidth - 8) {
      left = viewportWidth - menuWidth - 8
    }
    // 防止超出左边界
    if (left < 8) {
      left = 8
    }

    setDropdownPosition({
      top,
      left,
      width: rect.width,
      direction,
    })
  }, [modelsByProvider.length])

  // 打开下拉列表时计算位置
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
    }
  }, [isOpen, updateDropdownPosition])

  // 窗口滚动或调整大小时更新位置
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updateDropdownPosition()
      const handleResize = () => updateDropdownPosition()

      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isOpen, updateDropdownPosition])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node
        if (triggerRef.current && !triggerRef.current.contains(target) &&
            dropdownRef.current && !dropdownRef.current.contains(target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 如果没有可用模型，显示提示
  if (allEnabledModels.length === 0) {
    return (
      <button
        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
        title="暂无可用模型，请先配置 API Key"
      >
        <Cpu className="w-3.5 h-3.5 text-light-text-tertiary dark:text-dark-text-tertiary" />
      </button>
    )
  }

  // 显示当前模型名称（缩短长名称）
  const displayModel = currentModel || allEnabledModels[0]
  const shortName = displayModel

  // 找到当前模型所属的供应商颜色和图标
  const currentProvider = modelsByProvider.find(p => p.allModels.includes(displayModel))
  const currentColor = currentProvider?.providerColor
  const IconComponent = currentProvider ? ProviderIcons[currentProvider.providerId] : null

  return (
    <div className="relative">
      {/* 触发按钮 - 点击展开 */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group"
        title={`当前模型: ${displayModel}`}
      >
        {/* 🎯 蕾姆：使用 @lobehub/icons 的图标组件 */}
        {IconComponent ? (
          <div className="text-current" style={{ color: currentColor }}>
            <IconComponent size={16} />
          </div>
        ) : (
          <Cpu className="w-3.5 h-3.5 text-light-text-tertiary dark:text-dark-text-tertiary" />
        )}
        <span className="text-[11px] text-light-text-primary dark:text-dark-text-primary hidden sm:block">
          {shortName}
        </span>
      </button>

      {/* 下拉列表（Portal 渲染） */}
      {isOpen && dropdownPosition &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`
              fixed z-50
              bg-white/95 dark:bg-dark-card/95
              backdrop-blur-xl
              border border-light-border dark:border-dark-border
              rounded-lg shadow-2xl
              transition-all duration-200
              animate-in fade-in zoom-in-95
            `}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: '240px',
              maxHeight: '280px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 菜单标题 - 固定在顶部 */}
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2 shrink-0">
              <p className="text-[11px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                选择模型
              </p>
              {dropdownPosition.direction === 'up' && (
                <ChevronUp className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
              )}
            </div>

            {/* 可滚动的模型列表 */}
            <div className="overflow-y-auto overflow-x-hidden flex-1">
              {/* 按供应商分组的模型列表 */}
              {modelsByProvider.map((group, groupIndex) => {
                const GroupIcon = ProviderIcons[group.providerId]
                // 只有当有启用或禁用的模型时才显示该分组
                if (group.enabledModels.length === 0 && group.disabledModels.length === 0) {
                  return null
                }
                return (
                  <div key={group.providerId} className={groupIndex > 0 ? 'border-t border-black/5 dark:border-white/5' : ''}>
                    {/* 分组标题 */}
                    <div className="px-4 py-2 bg-black/5 dark:bg-white/5 flex items-center gap-2 sticky top-0 z-10 shrink-0">
                      {GroupIcon ? (
                        <div className="text-current" style={{ color: group.providerColor }}>
                          <GroupIcon size={16} />
                        </div>
                      ) : (
                        <span className="text-sm">🤖</span>
                      )}
                      <span className="text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        {group.providerName}
                      </span>
                    </div>

                    {/* 该供应商的启用模型列表 */}
                    {group.enabledModels.map((model) => {
                      const isSelected = displayModel === model
                      const isReasoning = group.reasoningModels.includes(model)
                      return (
                        <button
                          key={model}
                          onClick={() => {
                            onModelChange(model)
                            setIsOpen(false)
                          }}
                          className={`
                            w-full px-4 py-2.5
                            flex items-center justify-between
                            transition-all duration-150 shrink-0
                            ${isSelected
                              ? 'bg-primary-500/10 text-primary-500'
                              : 'text-light-text-primary dark:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                            }
                          `}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[13px]">{model}</span>
                            {/* 🎯 蕾姆：推理模型标识 */}
                            {isReasoning && (
                              <span
                                className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded flex items-center gap-1"
                                title="支持思考链推理"
                              >
                                <Brain className="w-3 h-3" />
                                思考链
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Check className="w-4 h-4 shrink-0" />
                            )}
                          </div>
                        </button>
                      )
                    })}

                    {/* 🎯 蕾姆：禁用的模型列表（灰色、不可点击） */}
                    {group.disabledModels.map((model) => (
                      <div
                        key={model}
                        className="w-full px-4 py-2.5 flex items-center justify-between opacity-50 cursor-not-allowed"
                        title="此模型已被禁用，请在供应商设置中启用"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[13px] text-light-text-tertiary dark:text-dark-text-tertiary">
                            {model}
                          </span>
                          <Lock className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* 空状态提示 */}
              {allEnabledModels.length === 0 && (
                <div className="px-4 py-4 text-center">
                  <p className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary">
                    暂无可用模型
                  </p>
                  <p className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                    请先配置 API Key 并启用模型
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      }
    </div>
  )
}
