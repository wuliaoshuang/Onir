/**
 * 蕾姆精心重构的供应商表单模态框
 * ✨ 已迁移到新的 Dialog 系统，使用 Portal + Focus Trap
 *
 * 用于添加和编辑自定义供应商
 */

import { useState, useEffect } from 'react'
import { OpenAI, Anthropic, Azure, DeepSeek } from '@lobehub/icons'
import type { Provider } from '../types/apiKeys'
import { FormInput, FormTextarea, FormCheckbox } from './ui/Form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogClose,
} from './ui/Dialog'

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
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  provider?: Provider // 如果提供，则为编辑模式
  onSubmit: (data: Omit<Provider, 'id' | 'stats' | 'status' | 'isBuiltIn'>) => void
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
  open,
  onOpenChange,
  title,
  provider,
  onSubmit,
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

  // 当 provider 变化时重置表单
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        icon: provider.icon,
        color: provider.color,
        baseUrl: provider.baseUrl,
        requiresEndpoint: provider.requiresEndpoint,
        keyPrefix: provider.keyPrefix,
        models: provider.models.join(', '),
      })
    } else {
      setFormData({
        name: '',
        icon: 'DeepSeek',
        color: '#95C0EC',
        requiresEndpoint: false,
        keyPrefix: 'sk-',
        models: '',
      })
    }
    setErrors({})
  }, [provider, open])

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

    // 提交成功后关闭对话框
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" onClose={handleClose}>
        {/* ========================================
            模态框头部
        ======================================== */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* ========================================
            表单内容
        ======================================== */}
        <DialogBody className="space-y-5">
          {/* 供应商名称 */}
          <FormInput
            label="供应商名称"
            required
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="如: OpenAI"
            error={errors.name}
          />

          {/* 图标选择 */}
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
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
                        : 'bg-light-page dark:bg-dark-page border-light-border dark:border-dark-border hover:border-primary-500/50'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary mt-1.5">
              选择一个图标样式来代表此供应商
            </p>
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
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
          <FormInput
            label="API 基础 URL（可选）"
            type="url"
            value={formData.baseUrl || ''}
            onChange={(value) => setFormData({ ...formData, baseUrl: value || undefined })}
            placeholder="如: https://api.openai.com"
            helperText="用于兼容 OpenAI API 的第三方服务"
          />

          {/* 需要额外 Endpoint */}
          <FormCheckbox
            checked={formData.requiresEndpoint}
            onChange={(checked) => setFormData({ ...formData, requiresEndpoint: checked })}
            label="需要额外配置 Endpoint（如 Azure OpenAI）"
          />

          {/* 密钥前缀 */}
          <FormInput
            label="密钥前缀"
            required
            value={formData.keyPrefix}
            onChange={(value) => setFormData({ ...formData, keyPrefix: value })}
            placeholder="如: sk-"
            error={errors.keyPrefix}
          />

          {/* 支持的模型 */}
          <FormTextarea
            label="支持的模型"
            required
            value={formData.models}
            onChange={(value) => setFormData({ ...formData, models: value })}
            placeholder="如: gpt-4, gpt-3.5-turbo, claude-3-opus"
            rows={3}
            error={errors.models}
            helperText="用逗号分隔多个模型名称"
          />

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <DialogClose asChild>
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-light-page dark:bg-dark-page text-light-text-primary dark:text-dark-text-primary rounded-xl hover:bg-light-hover dark:hover:bg-white/5 transition-all font-medium"
              >
                取消
              </button>
            </DialogClose>

            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-black text-primary-500 rounded-xl font-semibold border-2 border-primary-500 hover:bg-primary-500 hover:text-white active:scale-[0.97] transition-all duration-200 shadow-lg"
            >
              {provider ? '保存修改' : '添加供应商'}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
