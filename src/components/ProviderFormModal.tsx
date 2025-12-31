/**
 * 蕾姆精心设计的供应商表单模态框
 * 用于添加和编辑自定义供应商
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { OpenAI, Anthropic, Azure, DeepSeek } from '@lobehub/icons'
import type { Provider } from '../types/apiKeys'

// ========================================
// 表单数据接口
// ========================================
interface ProviderFormData {
  name: string
  icon: string
  color: string
  baseUrl?: string
  requiresEndpoint: boolean
  keyPrefix: string
  models: string // 逗号分隔的字符串
}

// ========================================
// 组件 Props
// ========================================
interface ProviderFormModalProps {
  title: string
  provider?: Provider // 如果提供，则为编辑模式
  onSubmit: (data: Omit<Provider, 'id' | 'stats' | 'status' | 'isBuiltIn'>) => void
  onClose: () => void
}

// ========================================
// 预设选项
// ========================================
// 蕾姆更新：使用 @lobehub/icons 的图标选项
const ICON_OPTIONS = [
  { value: 'DeepSeek', label: 'DeepSeek 风格', component: DeepSeek },
  { value: 'OpenAI', label: 'OpenAI 风格', component: OpenAI },
  { value: 'Anthropic', label: 'Anthropic 风格', component: Anthropic },
  { value: 'Azure', label: 'Azure 风格', component: Azure },
]

const COLOR_OPTIONS = [
  '#95C0EC', // 蕾姆蓝
  '#A78BFA', // 紫罗兰
  '#34D399', // 翡翠绿
  '#FB7185', // 樱花粉
  '#FBBF24', // 琥珀黄
  '#60A5FA', // 天空蓝
  '#F87171', // 珊瑚红
  '#818CF8', // 靛青
  '#2DD4BF', // 青绿
  '#FB923C', // 橙色
]

// ========================================
// 主组件
// ========================================
export default function ProviderFormModal({
  title,
  provider,
  onSubmit,
  onClose
}: ProviderFormModalProps) {
  // 初始化表单数据
  const [formData, setFormData] = useState<ProviderFormData>(() => {
    if (provider) {
      return {
        name: provider.name,
        icon: provider.icon,
        color: provider.color,
        baseUrl: provider.baseUrl,
        requiresEndpoint: provider.requiresEndpoint,
        keyPrefix: provider.keyPrefix,
        models: provider.models.join(', '),
      }
    }

    // 默认值
    return {
      name: '',
      icon: 'DeepSeek', // 蕾姆更新：默认使用 DeepSeek 图标
      color: '#95C0EC', // 蕾姆蓝作为默认色
      requiresEndpoint: false,
      keyPrefix: 'sk-',
      models: '',
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 蕾姆的表单验证逻辑
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 验证供应商名称
    if (!formData.name.trim()) {
      newErrors.name = '供应商名称不能为空'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '供应商名称至少需要 2 个字符'
    }

    // 验证密钥前缀
    if (!formData.keyPrefix.trim()) {
      newErrors.keyPrefix = '密钥前缀不能为空'
    }

    // 验证模型列表
    if (!formData.models.trim()) {
      newErrors.models = '至少需要一个模型'
    } else {
      // 检查是否有有效模型
      const modelList = formData.models
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0)

      if (modelList.length === 0) {
        newErrors.models = '至少需要一个有效的模型'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交处理
  const handleSubmit = () => {
    if (!validate()) return

    // 解析模型列表
    const modelList = formData.models
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0)

    onSubmit({
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      baseUrl: formData.baseUrl?.trim() || undefined,
      requiresEndpoint: formData.requiresEndpoint,
      keyPrefix: formData.keyPrefix.trim(),
      models: modelList,
    })
  }

  // 禁用背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl w-full min-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================
            模态框头部
        ======================================== */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#e5e5ea] dark:border-[#3a3a3c] bg-white dark:bg-[#1c1c1e] z-10">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f5f5f7] dark:hover:bg-black rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        </div>

        {/* ========================================
            表单内容
        ======================================== */}
        <div className="p-6 space-y-5">
          {/* 供应商名称 */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              供应商名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如: OpenAI"
              className={`w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl border-2 transition-all ${
                errors.name
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50'
                  : 'border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/50'
              } text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#8e8e93]`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* 图标选择 */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              图标样式
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.component
                const isSelected = formData.icon === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: option.value })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-primary-500/10 border-primary-500'
                        : 'bg-[#f5f5f7] dark:bg-black border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-primary-500/50'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93] mt-1.5">
              选择一个图标样式来代表此供应商
            </p>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              主题色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all hover:scale-105 ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* API 基础 URL（可选） */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              API 基础 URL（可选）
            </label>
            <input
              type="url"
              value={formData.baseUrl || ''}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="如: https://api.openai.com"
              className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#8e8e93]"
            />
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93] mt-1.5">
              用于兼容 OpenAI API 的第三方服务
            </p>
          </div>

          {/* 需要额外 Endpoint */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl">
            <input
              type="checkbox"
              id="requiresEndpoint"
              checked={formData.requiresEndpoint}
              onChange={(e) => setFormData({ ...formData, requiresEndpoint: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-[#e5e5ea] dark:border-[#3a3a3c] text-primary-500 focus:ring-2 focus:ring-primary-500/50"
            />
            <label
              htmlFor="requiresEndpoint"
              className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer"
            >
              需要额外配置 Endpoint（如 Azure OpenAI）
            </label>
          </div>

          {/* 密钥前缀 */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              密钥前缀 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.keyPrefix}
              onChange={(e) => setFormData({ ...formData, keyPrefix: e.target.value })}
              placeholder="如: sk-"
              className={`w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl border-2 transition-all ${
                errors.keyPrefix
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50'
                  : 'border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/50'
              } text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#8e8e93]`}
            />
            {errors.keyPrefix && (
              <p className="text-red-500 text-sm mt-1.5">{errors.keyPrefix}</p>
            )}
          </div>

          {/* 支持的模型 */}
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              支持的模型 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.models}
              onChange={(e) => setFormData({ ...formData, models: e.target.value })}
              placeholder="如: gpt-4, gpt-3.5-turbo, claude-3-opus"
              rows={3}
              className={`w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl border-2 resize-none transition-all ${
                errors.models
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50'
                  : 'border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/50'
              } text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#8e8e93]`}
            />
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93] mt-1.5">
              用逗号分隔多个模型名称
            </p>
            {errors.models && (
              <p className="text-red-500 text-sm mt-1.5">{errors.models}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-black text-primary-500 rounded-xl font-semibold border-2 border-primary-500 hover:bg-primary-500 hover:text-white active:scale-[0.97] transition-all duration-200 shadow-lg"
          >
            {provider ? '保存修改' : '添加供应商'}
          </button>
        </div>
      </div>
    </div>
  )
}
