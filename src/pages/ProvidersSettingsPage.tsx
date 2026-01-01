/**
 * 蕾姆精心设计的供应商配置页面（左右布局版）
 * 左侧：AI 提供商列表（缩小版）
 * 右侧：选中供应商的配置表单
 * 使用主题系统的动态配色和字体
 */
import { useState, useEffect, useMemo } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Check,
  Shield,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  RefreshCw,
  List,
  ExternalLink,
  Zap,
  Settings,
} from "lucide-react";
import { OpenAI, DeepSeek, Google } from "@lobehub/icons";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";
import { useApiKeyStore } from "../stores/apiKeyStore";
import { useThemeStore } from "../stores/themeStore";
import { toast } from '../lib/toast';
import type { ProviderType } from '../types/apiKeys';
import { Toggle } from "../components/ui/Toggle/Toggle";
import { Button } from "../components/ui/Button";

// ========================================
// 主题色配置（本地定义，避免导入路径问题）
// ========================================
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

// ========================================
// 供应商图标组件映射
// ========================================
const ProviderIconComponent: Record<string, React.ComponentType<any>> = {
  deepseek: DeepSeek,
  openai: OpenAI,
  google: Google,
};

function getProviderIconComponent(providerId: string, size = 24, color: string = "#fff") {
  const Component = ProviderIconComponent[providerId];
  if (Component) {
    return <Component style={{ color: color ? color : "" }} size={size} className="dark:text-white" />;
  }
  return <DeepSeek style={{ color: color ? color : "" }} size={size} className="dark:text-white" />;
}

// ========================================
// 主组件
// ========================================
export default function ProvidersSettingsPage() {
  // ========================================
  // Store 连接
  // ========================================
  const {
    keys,
    providers,
    initialize,
    addKey,
    removeKey,
    updateKey,
    setDefaultKey,
    testConnection,
    testingKeyId,
    updateProviderModels,
  } = useApiKeyStore();

  const { accentColor, fontSize } = useThemeStore();

  // ========================================
  // 主题色类名映射
  // ========================================
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

  // ========================================
  // 本地状态
  // ========================================
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('deepseek');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 模型列表状态
  const [fetchingModels, setFetchingModels] = useState<Record<string, boolean>>({});
  const [keyModels, setKeyModels] = useState<Record<string, string[]>>({});
  const [enabledModels, setEnabledModels] = useState<Record<string, string[]>>({});

  // ========================================
  // 初始化
  // ========================================
  useEffect(() => {
    initialize();
  }, []);

  // 监听 providers 变化，同步模型列表
  useEffect(() => {
    if (providers.length === 0) return;

    const modelsMap: Record<string, string[]> = {};

    providers.forEach(provider => {
      if (provider.models && provider.models.length > 0) {
        modelsMap[provider.id] = provider.models;
      }
    });

    setKeyModels(prev => ({ ...prev, ...modelsMap }));

    // 如果某个供应商还没有启用模型配置，默认启用所有
    setEnabledModels(prev => {
      const updated = { ...prev };
      providers.forEach(provider => {
        if (provider.models && provider.models.length > 0 && !updated[provider.id]) {
          updated[provider.id] = provider.models;
        }
      });
      return updated;
    });
  }, [providers]);

  // ========================================
  // 计算属性
  // ========================================
  const currentProvider = useMemo(() => {
    return providers.find(p => p.id === selectedProvider);
  }, [providers, selectedProvider]);

  const currentKeys = useMemo(() => {
    return keys.filter(k => k.providerId === selectedProvider);
  }, [keys, selectedProvider]);

  const currentModels = useMemo(() => {
    return keyModels[selectedProvider] || [];
  }, [keyModels, selectedProvider]);

  // ========================================
  // 事件处理函数
  // ========================================

  /**
   * 获取密钥对应的可用模型列表
   */
  const fetchKeyModels = async (keyId: string, providerId: string) => {
    console.log('🧪 蕾姆：开始获取模型列表', { keyId, providerId });
    setFetchingModels(prev => ({ ...prev, [keyId]: true }));

    try {
      const { ModelFetcher } = await import('../services/modelFetcher');
      const key = keys.find(k => k.id === keyId);
      if (!key) {
        toast.error('密钥不存在');
        return;
      }

      console.log('📡 蕾姆：调用 API 获取模型...');
      const result = await ModelFetcher.fetchModels(providerId, key.keyValue);

      if (result.success) {
        await updateProviderModels(providerId, result.models);
        setKeyModels(prev => ({
          ...prev,
          [providerId]: result.models,
        }));

        // 自动启用新获取的模型
        setEnabledModels(prev => ({
          ...prev,
          [providerId]: result.models,
        }));

        toast.success(`获取成功！找到 ${result.models.length} 个可用模型`, {
          duration: 4000,
        });
        console.log('✅ 蕾姆：模型列表获取成功', result.models);
      } else {
        toast.error(`获取失败：${result.error || '未知错误'}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ 蕾姆：获取模型失败', error);
      toast.error(`获取失败：${(error as Error).message}`, {
        duration: 5000,
      });
    } finally {
      setFetchingModels(prev => ({ ...prev, [keyId]: false }));
      console.log('🏁 蕾姆：获取结束');
    }
  };

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingKeyId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingKeyId) return;

    setIsDeleting(true);
    try {
      await removeKey(deletingKeyId);
      setShowDeleteModal(false);
      setDeletingKeyId(null);
      toast.success('密钥已删除');
    } catch (error) {
      toast.error('删除失败：' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultKey(id);
  };

  const handleTest = async (id: string) => {
    const isValid = await testConnection(id);
    if (isValid) {
      toast.success('连接测试成功！');
    } else {
      toast.error('连接测试失败，请检查密钥');
    }
  };

  const handleAddKey = async () => {
    if (!newKeyValue.trim()) {
      setAddError('请输入 API Key');
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      await addKey(
        selectedProvider,
        newKeyValue.trim(),
        newKeyName.trim() || undefined
      );

      // 重置表单
      setNewKeyValue('');
      setNewKeyName('');
      setShowAddModal(false);

      toast.success('密钥添加成功！点击"刷新模型"按钮获取可用模型');
    } catch (error) {
      setAddError((error as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (!key) return;

    setEditingKeyId(keyId);
    setNewKeyValue(key.keyValue);
    setNewKeyName(key.name);
    setShowEditModal(true);
    setAddError(null);
  };

  const handleUpdateKey = async () => {
    if (!editingKeyId || !newKeyValue.trim()) {
      setAddError('请输入 API Key');
      return;
    }

    setIsEditing(true);
    setAddError(null);

    try {
      await updateKey(editingKeyId, {
        keyValue: newKeyValue.trim(),
        name: newKeyName.trim() || undefined,
      });

      // 重置表单
      setNewKeyValue('');
      setNewKeyName('');
      setEditingKeyId(null);
      setShowEditModal(false);

      toast.success('密钥更新成功');
    } catch (error) {
      setAddError((error as Error).message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleRefreshModels = async () => {
    const defaultKey = currentKeys.find(k => k.isDefault) || currentKeys[0];
    if (!defaultKey) {
      toast.warning('请先添加 API 密钥');
      return;
    }
    await fetchKeyModels(defaultKey.id, selectedProvider);
  };

  const handleToggleModel = (modelName: string) => {
    const providerEnabledModels = enabledModels[selectedProvider] || [];
    const isEnabled = providerEnabledModels.includes(modelName);

    if (isEnabled) {
      // 禁用模型
      setEnabledModels(prev => ({
        ...prev,
        [selectedProvider]: providerEnabledModels.filter(m => m !== modelName),
      }));
    } else {
      // 启用模型
      setEnabledModels(prev => ({
        ...prev,
        [selectedProvider]: [...providerEnabledModels, modelName],
      }));
    }
  };

  const handleConfigureModel = (modelName: string) => {
    toast.info(`配置模型：${modelName}（功能开发中）`);
  };

  // ========================================
  // 渲染
  // ========================================
  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-light-page dark:bg-dark-page overflow-hidden">
      {/* 页面头部 */}
      <PageHeader
        title="供应商配置"
        subtitle="管理 AI 服务提供商和密钥"
        actions={
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        }
      />

      {/* 主内容区 - 左右布局 */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-full mx-auto h-full p-4">
          <div className="flex gap-4 h-full">
            {/* ========================================
                左侧：供应商列表（卡片容器）
            ======================================== */}
            <div className="w-56 shrink-0">
              <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 h-full flex flex-col">
                {/* 供应商列表标题 */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-light-border dark:border-dark-border">
                  <Zap className={`w-4 h-4 ${colorClass.text}`} />
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium tracking-wide uppercase">
                    供应商
                  </p>
                </div>

                {/* 供应商卡片列表 - 可滚动 */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {providers.map((provider) => {
                    const providerKeys = keys.filter(k => k.providerId === provider.id);
                    const isProviderConfigured = providerKeys.length > 0;
                    const isSelected = selectedProvider === provider.id;

                    return (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id)}
                        className={`
                          w-full group relative bg-light-page dark:bg-dark-page rounded-lg p-3
                          transition-all duration-200 hover:shadow-lg
                          ${isSelected ? `${colorClass.bgLight} ${colorClass.ring} ring-1` : ''}
                        `}
                      >
                        {/* 背景装饰 */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"
                          style={{ backgroundColor: provider.color }}
                        />

                        {/* 内容 */}
                        <div className="relative flex items-center gap-2">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${provider.color}` }}
                          >
                            {getProviderIconComponent(provider.id, 18)}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className={`text-sm font-semibold truncate ${
                              isSelected ? `${colorClass.text}` : 'text-light-text-primary dark:text-dark-text-primary'
                            }`}>
                              {provider.name}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                isProviderConfigured
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {isProviderConfigured ? '已配置' : '未配置'}
                              </span>
                              <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
                                {providerKeys.length}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className={`w-4 h-4 rounded-full ${colorClass.bg} flex items-center justify-center shrink-0`}>
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================
                右侧：配置表单（大卡片容器）
            ======================================== */}
            <div className="flex-1 min-w-0">
              {currentProvider && (
                <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 h-full flex flex-col">
                  {/* 可滚动内容区 */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* 1. 供应商信息头部 */}
                    <div className="flex items-start gap-4 pb-5 border-b border-light-border dark:border-dark-border">
                      {/* 供应商图标 */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${currentProvider.color}` }}
                      >
                        {getProviderIconComponent(currentProvider.id, 28)}
                      </div>

                      {/* 供应商信息 */}
                      <div className="flex-1">
                        <h2 className="text-[20px] font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
                          {currentProvider.name}
                        </h2>
                        <p className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          高性能 AI 语言模型服务提供商
                        </p>
                        {currentProvider.baseUrl && (
                          <a
                            href={currentProvider.baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[12px] ${colorClass.text} hover:underline flex items-center gap-1`}
                          >
                            访问官网 <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* 状态徽章 */}
                      <div className={`px-3 py-1 rounded-full text-[12px] font-medium ${
                        currentKeys.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {currentKeys.length > 0 ? '已配置' : '未配置'}
                      </div>
                    </div>

                    {/* 2. API 密钥配置区 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                          API 密钥
                        </h3>
                        <Button
                          variant="primary"
                          size="md"
                          icon={Plus}
                          className={colorClass.bg}
                          onClick={() => setShowAddModal(true)}
                        >
                          添加密钥
                        </Button>
                      </div>

                      {/* 密钥卡片列表 */}
                      {currentKeys.length > 0 ? (
                        <div className="space-y-3">
                          {currentKeys.map((keyItem, index) => (
                            <div
                              key={keyItem.id}
                              className="group relative bg-light-page dark:bg-dark-page rounded-xl p-4 overflow-hidden transition-all duration-300 hover:shadow-lg"
                              onMouseEnter={() => setHoveredKey(keyItem.id)}
                              onMouseLeave={() => setHoveredKey(null)}
                              style={{
                                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                              }}
                            >
                              {/* 背景装饰 */}
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                                style={{ backgroundColor: currentProvider.color }}
                              />

                              <div className="relative"> 
                                {/* 顶部信息 */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                                      style={{ backgroundColor: currentProvider.color }}
                                    >
                                      <Key className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <h4 className="text-[14px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                                          {keyItem.name}
                                        </h4>
                                        {keyItem.isDefault && (
                                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${colorClass.bgLight} ${colorClass.text}`}>
                                            <Check className="w-2.5 h-2.5" />
                                            默认
                                          </span>
                                        )}
                                        <span
                                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                            keyItem.status === 'active'
                                              ? 'bg-emerald-500/10 text-emerald-500'
                                              : keyItem.status === 'error'
                                              ? 'bg-red-500/10 text-red-500'
                                              : 'bg-amber-500/10 text-amber-500'
                                          }`}
                                        >
                                          {keyItem.status === 'active' ? (
                                            <>
                                              <Check className="w-2.5 h-2.5" />
                                              已验证
                                            </>
                                          ) : keyItem.status === 'error' ? (
                                            <>
                                              <AlertCircle className="w-2.5 h-2.5" />
                                              错误
                                            </>
                                          ) : (
                                            <>
                                              <Clock className="w-2.5 h-2.5" />
                                              未验证
                                            </>
                                          )}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                                        {currentProvider.name} API Key
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="icon"
                                      icon={Settings}
                                      className={
                                        hoveredKey === keyItem.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      }
                                      onClick={() => handleEditKey(keyItem.id)}
                                    />
                                    <Button
                                      variant="icon"
                                      icon={Trash2}
                                      className={`${
                                        hoveredKey === keyItem.id
                                          ? 'bg-red-500/10 hover:bg-red-500/20 opacity-100'
                                          : 'opacity-0'
                                      } text-red-500`}
                                      onClick={() => handleDeleteClick(keyItem.id)}
                                    />
                                  </div>
                                </div>

                                {/* 密钥显示区域 */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-card rounded-lg mb-3">
                                  <Key className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary shrink-0" />
                                  <span className="flex-1 font-mono text-[12px] text-light-text-secondary dark:text-dark-text-secondary truncate">
                                    {showKeys[keyItem.id]
                                      ? keyItem.keyValue
                                      : keyItem.keyValue.slice(0, 12) + '...' + keyItem.keyValue.slice(-4)}
                                  </span>
                                  <Button
                                    variant="icon"
                                    icon={showKeys[keyItem.id] ? EyeOff : Eye}
                                    onClick={() =>
                                      setShowKeys({
                                        ...showKeys,
                                        [keyItem.id]: !showKeys[keyItem.id],
                                      })
                                    }
                                  />
                                  <Button
                                    variant="icon"
                                    icon={copiedId === keyItem.id ? Check : Copy}
                                    className={copiedId === keyItem.id ? colorClass.text : ''}
                                    onClick={() => handleCopy(keyItem.keyValue, keyItem.id)}
                                  />
                                </div>

                                {/* 底部操作 */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {!keyItem.isDefault && (
                                      <Button
                                        variant="ghost"
                                        size="xs"
                                        className={`text-light-text-secondary dark:text-dark-text-secondary hover:${colorClass.text}`}
                                        onClick={() => handleSetDefault(keyItem.id)}
                                      >
                                        设为默认
                                      </Button>
                                    )}
                                  </div>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    icon={Sparkles}
                                    loading={testingKeyId === keyItem.id}
                                    disabled={testingKeyId === keyItem.id}
                                    className={`${colorClass.bg} ${colorClass.shadow}`}
                                    onClick={() => handleTest(keyItem.id)}
                                  >
                                    {testingKeyId === keyItem.id ? '测试中' : '测试连接'}
                                  </Button>
                                </div>

                                {keyItem.errorMessage && (
                                  <div className="mt-2 text-[11px] text-red-500">
                                    {keyItem.errorMessage}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* 空状态 */
                        <div className="text-center py-12 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl">
                          <Shield className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3" />
                          <p className="text-[14px] text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            还没有配置 API 密钥
                          </p>
                          <p className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary">
                            点击上方"添加密钥"按钮开始配置
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 3. 模型列表区 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                          可用模型
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RefreshCw}
                          loading={fetchingModels[selectedProvider]}
                          disabled={fetchingModels[selectedProvider]}
                          onClick={handleRefreshModels}
                        >
                          {fetchingModels[selectedProvider] ? '获取中...' : '刷新模型'}
                        </Button>
                      </div>

                      {/* 模型列表 */}
                      {currentModels.length > 0 ? (
                        <div className="bg-light-page dark:bg-dark-page rounded-xl p-2 space-y-1">
                          {currentModels.map((model) => {
                            const isEnabled = (enabledModels[selectedProvider] || []).includes(model);
                            return (
                              <div
                                key={model}
                                className="group flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-dark-card rounded-lg hover:bg-white/80 dark:hover:bg-[#1c1c1e]/80 transition-all duration-200"
                              >
                                {/* 模型名称 */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] font-medium truncate ${
                                    isEnabled ? 'text-light-text-primary dark:text-dark-text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary'
                                  }`}>
                                    {model}
                                  </p>
                                </div>

                                {/* 配置按钮 */}
                                <Button
                                  variant="icon"
                                  icon={Settings}
                                  onClick={() => handleConfigureModel(model)}
                                />

                                {/* 启用开关 */}
                                <Toggle defaultChecked={ isEnabled } onChange={() => handleToggleModel(model)} size="sm" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl">
                          <List className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-3" />
                          <p className="text-[14px] text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            还没有获取模型列表
                          </p>
                          <p className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary">
                            点击"刷新模型"按钮获取可用模型列表
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          添加密钥弹窗
      ======================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-[330px]">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClass.bgLight} rounded-lg`}>
                  <Key className={`w-4 h-4 ${colorClass.text}`} />
                </div>
                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  添加 API 密钥
                </h2>
              </div>
              <Button
                variant="icon"
                icon={X}
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                  setNewKeyValue('');
                  setNewKeyName('');
                }}
              />
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4">
              {/* 供应商信息 */}
              <div className="p-3 bg-light-page dark:bg-dark-page rounded-lg">
                <div className="flex items-center gap-2">
                  {getProviderIconComponent(currentProvider?.id || 'deepseek', 20, '')}
                  <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {currentProvider?.name}
                  </span>
                </div>
              </div>

              {/* API Key 输入 */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder={currentProvider?.keyPrefix ? `例如: ${currentProvider.keyPrefix}...` : 'sk-...'}
                  className="w-full px-4 py-3 bg-light-page dark:bg-dark-page rounded-xl border-2 border-transparent focus:border-primary-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>

              {/* 可选名称 */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  名称（可选）
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="如：工作账号"
                  className="w-full px-4 py-3 bg-light-page dark:bg-dark-page rounded-xl border-2 border-transparent focus:border-primary-500 outline-none transition-all text-sm"
                />
              </div>

              {/* 错误提示 */}
              {addError && (
                <p className="text-sm text-red-500">{addError}</p>
              )}

              {/* 保存按钮 */}
              <Button
                variant="primary"
                size="md"
                display="full-width"
                loading={isAdding}
                disabled={!newKeyValue.trim() || isAdding}
                className={`${colorClass.bg} ${colorClass.shadow}`}
                onClick={handleAddKey}
              >
                {isAdding ? '添加中...' : '添加密钥'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          编辑密钥弹窗
      ======================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-[330px]">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${colorClass.bgLight} rounded-lg`}>
                  <Key className={`w-4 h-4 ${colorClass.text}`} />
                </div>
                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  编辑 API 密钥
                </h2>
              </div>
              <Button
                variant="icon"
                icon={X}
                onClick={() => {
                  setShowEditModal(false);
                  setAddError(null);
                  setNewKeyValue('');
                  setNewKeyName('');
                  setEditingKeyId(null);
                }}
              />
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4">
              {/* 供应商信息 */}
              <div className="p-3 bg-light-page dark:bg-dark-page rounded-lg">
                <div className="flex items-center gap-2">
                  {getProviderIconComponent(currentProvider?.id || 'deepseek', 20, "")}
                  <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    {currentProvider?.name}
                  </span>
                </div>
              </div>

              {/* API Key 输入 */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder={currentProvider?.keyPrefix ? `例如: ${currentProvider.keyPrefix}...` : 'sk-...'}
                  className="w-full px-4 py-3 bg-light-page dark:bg-dark-page rounded-xl border-2 border-transparent focus:border-primary-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>

              {/* 可选名称 */}
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  名称（可选）
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="如：工作账号"
                  className="w-full px-4 py-3 bg-light-page dark:bg-dark-page rounded-xl border-2 border-transparent focus:border-primary-500 outline-none transition-all text-sm"
                />
              </div>

              {/* 错误提示 */}
              {addError && (
                <p className="text-sm text-red-500">{addError}</p>
              )}

              {/* 保存按钮 */}
              <Button
                variant="primary"
                size="md"
                display="full-width"
                loading={isEditing}
                disabled={!newKeyValue.trim() || isEditing}
                className={`${colorClass.bg} ${colorClass.shadow}`}
                onClick={handleUpdateKey}
              >
                {isEditing ? '更新中...' : '保存修改'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          删除确认弹窗
      ======================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-[330px]">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  删除密钥
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingKeyId(null);
                }}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4">
              {/* 警告图标和提示 */}
              <div className="flex items-start gap-3">
                <div className="p-3 bg-red-500/10 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                    确定要删除这个密钥吗？
                  </p>
                  <p className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary">
                    此操作无法撤销，删除后该密钥将无法恢复。
                  </p>
                </div>
              </div>

              {/* 要删除的密钥信息 */}
              {deletingKeyId && (
                <div className="p-3 bg-light-page dark:bg-dark-page rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {keys.find(k => k.id === deletingKeyId)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-2 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  display="block"
                  disabled={isDeleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingKeyId(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  display="block"
                  loading={isDeleting}
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
