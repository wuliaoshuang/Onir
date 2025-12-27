/**
 * 蕾姆精心设计的供应商管理页面
 * 丰富的前端交互 - 卡片布局、状态可视化、动画效果
 * 使用 @lobehub/icons 专业 AI 模型图标
 */
import { useState } from "react";
import {
  Zap,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { OpenAI, Anthropic, Azure, type IconType } from "@lobehub/icons";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";

// 蕾姆定义的供应商类型
interface Provider {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  icon: any;
  iconType: "component" | "emoji";
  color: string;
  models: string[];
  stats: {
    calls: string;
    success: string;
    latency: string;
    trend: string;
  };
  description: string;
  uptime: string;
  region: string;
}

// 蕾姆定义的主题色
const colors = {
  remBlue: "#95C0EC", // 蕾姆蓝
  violet: "#A78BFA", // 紫罗兰
  emerald: "#34D399", // 翡翠绿
  sakura: "#FB7185", // 樱花粉
  amber: "#FBBF24", // 琥珀黄
};

function ProvidersPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const providers: Provider[] = [
    {
      id: "1",
      name: "OpenAI",
      status: "active",
      icon: () => <OpenAI size={35} className="text-black dark:text-white" />,
      iconType: "component",
      color: "#f5f5f7",
      models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
      stats: {
        calls: "12.4K",
        success: "99.8%",
        latency: "245ms",
        trend: "+12%",
      },
      description: "领先的 AI 语言模型提供商",
      uptime: "99.9%",
      region: "美国西部",
    },
    {
      id: "2",
      name: "Anthropic",
      status: "active",
      icon: Anthropic,
      iconType: "component",
      color: colors.violet,
      models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
      stats: {
        calls: "8.2K",
        success: "99.9%",
        latency: "189ms",
        trend: "+23%",
      },
      description: "专注于 AI 安全的先驱",
      uptime: "99.8%",
      region: "美国东部",
    },
    {
      id: "3",
      name: "Azure OpenAI",
      status: "inactive",
      icon: Azure,
      iconType: "component",
      color: colors.amber,
      models: ["gpt-4", "gpt-35-turbo"],
      stats: { calls: "0", success: "-", latency: "-", trend: "0%" },
      description: "企业级 Azure 托管服务",
      uptime: "-",
      region: "全球",
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === "active") return CheckCircle;
    if (status === "error") return XCircle;
    return Clock;
  };

  const handleTest = (providerId: string) => {
    setTestingProvider(providerId);
    setTimeout(() => setTestingProvider(null), 2000);
  };

  return (
    <div className="flex-1 h-screen flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="供应商"
        subtitle="管理 AI 服务提供商"
        actions={
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-2xl text-[15px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
              style={{ backgroundColor: colors.remBlue }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus className="w-4 h-4" />
              添加供应商
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* 统计概览 - 毛玻璃效果 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#f5f5f7] dark:bg-black">
                  <CheckCircle className="w-6 h-6 text-[#95c0ec]" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    活跃供应商
                  </p>
                  <p className="text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    2
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#f5f5f7] dark:bg-black">
                  <Activity className="w-6 h-6 text-[#95c0ec]" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    总调用次数
                  </p>
                  <p className="text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    20.6K
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#f5f5f7] dark:bg-black">
                  <TrendingUp className="w-6 h-6 text-[#95c0ec]" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    成功率
                  </p>
                  <p className="text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    99.8%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 供应商列表 - 增强版卡片 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                供应商列表
              </h2>
              <button className="flex items-center gap-2 text-[13px] text-[#95C0EC] hover:underline">
                <RefreshCw className="w-4 h-4" />
                刷新状态
              </button>
            </div>
            <div className="space-y-4">
              {providers.map((provider, index) => {
                const StatusIcon = getStatusIcon(provider.status);
                return (
                  <div
                    key={provider.id}
                    className="group relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    onMouseEnter={() => setHoveredCard(provider.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* 背景装饰 */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                      style={{ backgroundColor: provider.color }}
                    />

                    <div className="relative">
                      {/* 顶部信息 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-[#f5f5f7] dark:bg-black">
                            {provider.iconType === "component" ? (
                              <provider.icon size={32} />
                            ) : (
                              <span className="text-2xl">{provider.icon}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                                {provider.name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-medium ${
                                  provider.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : provider.status === "error"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-[#86868b]/10 text-[#86868b]"
                                }`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {provider.status === "active"
                                  ? "活跃"
                                  : provider.status === "error"
                                  ? "错误"
                                  : "未激活"}
                              </span>
                            </div>
                            <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-[#f5f5f7] dark:hover:bg-black rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100">
                          <Settings className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
                        </button>
                      </div>

                      {/* 统计数据 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            调用
                          </p>
                          <p className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {provider.stats.calls}
                          </p>
                        </div>
                        <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            成功率
                          </p>
                          <p className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {provider.stats.success}
                          </p>
                        </div>
                        <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            延迟
                          </p>
                          <p className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {provider.stats.latency}
                          </p>
                        </div>
                        <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            趋势
                          </p>
                          <div className="flex items-center gap-1">
                            <p
                              className={`text-[15px] font-bold ${
                                provider.stats.trend.startsWith("+")
                                  ? "text-emerald-500"
                                  : "text-[#86868b]"
                              }`}
                            >
                              {provider.stats.trend}
                            </p>
                            {provider.stats.trend.startsWith("+") && (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 可用模型 */}
                      <div className="mb-4">
                        <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-2 uppercase tracking-wide">
                          可用模型 ({provider.models.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provider.models.map((model) => (
                            <span
                              key={model}
                              className="px-3 py-1.5 bg-[#f5f5f7] dark:bg-black rounded-lg text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium hover:bg-[#95C0EC]/10 dark:hover:bg-[#95C0EC]/20 hover:text-[#95C0EC] transition-all duration-200 cursor-default"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 底部操作 */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#e5e5ea] dark:border-[#3a3a3c]">
                        <div className="flex items-center gap-4 text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                          <span>可用性: {provider.uptime}</span>
                          <span>区域: {provider.region}</span>
                        </div>
                        <button
                          onClick={() => handleTest(provider.id)}
                          disabled={
                            testingProvider === provider.id ||
                            provider.status !== "active"
                          }
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-[13px] font-medium active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          style={{ backgroundColor: colors.remBlue }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "0.8")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                        >
                          {testingProvider === provider.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              测试中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              测试连接
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 悬停时显示的箭头 */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button className="p-2 bg-white dark:bg-[#2a2a2c] rounded-xl shadow-lg hover:scale-110 transition-transform duration-200">
                        <ArrowUpRight className="w-4 h-4 text-[#95C0EC]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 添加新供应商卡片 */}
          <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-8 text-center border-2 border-dashed border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-[#95C0EC]/50 dark:hover:border-[#95C0EC]/30 transition-all duration-200 cursor-pointer hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] dark:bg-black flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8 text-[#95C0EC]" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              添加新的供应商
            </h3>
            <p className="text-[15px] text-[#86868b] dark:text-[#8e8e93]">
              支持的提供商：OpenAI、Anthropic、Azure OpenAI、Google 等
            </p>
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

export default ProvidersPage;
