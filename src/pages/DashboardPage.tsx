/**
 * 蕾姆精心设计的概览仪表盘页面
 * 蕾姆前端技能全开 - 丰富的交互、动画和数据可视化
 */
import { useNavigate } from "@tanstack/react-router";
import {
  Zap,
  MessageSquare,
  Database,
  Key,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";
import { useState, useEffect } from "react";

// 蕾姆定义的主题色
const colors = {
  remBlue: "#95C0EC", // 蕾姆蓝
  violet: "#A78BFA", // 紫罗兰
  emerald: "#34D399", // 翡翠绿
  sakura: "#FB7185", // 樱花粉
  amber: "#FBBF24", // 琥珀黄
};

// 统计卡片数据
const statCards = [
  {
    id: 1,
    title: "总对话数",
    value: "1,234",
    change: "+12%",
    icon: MessageSquare,
    color: colors.violet,
  },
  {
    id: 2,
    title: "API 调用",
    value: "45.2K",
    change: "+23%",
    icon: Zap,
    color: colors.remBlue,
  },
  {
    id: 3,
    title: "内存使用",
    value: "234 MB",
    change: "+8%",
    icon: Database,
    color: colors.emerald,
  },
  {
    id: 4,
    title: "活跃密钥",
    value: "5",
    change: "0%",
    icon: Key,
    color: colors.amber,
  },
];

// 快捷入口
const quickActions = [
  {
    id: 1,
    title: "新建对话",
    description: "开始一个新的 AI 对话",
    icon: MessageSquare,
    to: "/chat",
    color: colors.violet,
  },
  {
    id: 2,
    title: "添加供应商",
    description: "配置 AI 服务提供商",
    icon: Zap,
    to: "/providers",
    color: colors.remBlue,
  },
  {
    id: 3,
    title: "管理内存",
    description: "查看向量数据库",
    icon: Database,
    to: "/memory",
    color: colors.emerald,
  },
  {
    id: 4,
    title: "绑定密钥",
    description: "添加 API 密钥",
    icon: Key,
    to: "/keys",
    color: colors.amber,
  },
];

// 最近活动
const recentActivities = [
  {
    id: 1,
    action: '新建对话 "React 优化建议"',
    time: "5 分钟前",
    type: "chat",
  },
  { id: 2, action: "添加 OpenAI 供应商", time: "1 小时前", type: "provider" },
  { id: 3, action: "更新系统配置", time: "3 小时前", type: "settings" },
  { id: 4, action: "内存向量同步完成", time: "昨天", type: "memory" },
];

// 系统状态
const systemStatus = [
  {
    id: 1,
    name: "API 服务",
    status: "online",
    latency: "45ms",
    uptime: "99.9%",
  },
  {
    id: 2,
    name: "向量数据库",
    status: "online",
    latency: "12ms",
    uptime: "99.8%",
  },
  { id: 3, name: "缓存服务", status: "online", latency: "2ms", uptime: "100%" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);

  // 数字动画效果
  const [animatedValues, setAnimatedValues] = useState({
    conversations: 0,
    apiCalls: 0,
    memory: 0,
    keys: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues((prev) => ({
        conversations:
          prev.conversations >= 1234 ? 1234 : prev.conversations + 12,
        apiCalls: prev.apiCalls >= 45200 ? 45200 : prev.apiCalls + 452,
        memory: prev.memory >= 234 ? 234 : prev.memory + 3,
        keys: prev.keys >= 5 ? 5 : prev.keys + 1,
      }));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleTest = (serviceId: string) => {
    setTestingService(serviceId);
    setTimeout(() => setTestingService(null), 2000);
  };

  return (
    <div className="flex-1 h-screen flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="概览"
        subtitle="欢迎回来，主人"
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                系统正常
              </span>
            </div>
            <button className="flex items-center gap-2 text-[13px] text-[#95C0EC] hover:underline">
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* 统计卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="group relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* 背景装饰 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                    style={{ backgroundColor: card.color }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: card.color }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          card.change.startsWith("+")
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-[#86868b]/10 text-[#86868b]"
                        }`}
                      >
                        {card.change}
                        {card.change.startsWith("+") && (
                          <TrendingUp className="w-3 h-3" />
                        )}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                      {card.title}
                    </p>
                    <p className="text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {card.value}
                    </p>
                  </div>

                  {/* 悬停时显示的按钮 */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-2 bg-white dark:bg-[#2a2a2c] rounded-xl shadow-lg hover:scale-110 transition-transform duration-200">
                      <ArrowUpRight className="w-4 h-4 text-[#95C0EC]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 快捷操作和最近活动 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 快捷操作 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  快捷操作
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => navigate({ to: action.to as any })}
                      className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-4 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: action.color }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-0.5">
                            {action.title}
                          </p>
                          <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] truncate">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93] group-hover:text-[#95C0EC] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 最近活动 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  最近活动
                </h2>
                <button className="text-[13px] text-[#95C0EC] hover:underline">
                  查看全部
                </button>
              </div>
              <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">
                {recentActivities.map((activity, index) => {
                  const icons = {
                    chat: MessageSquare,
                    provider: Zap,
                    settings: Key,
                    memory: Database,
                  };
                  const Icon = icons[activity.type as keyof typeof icons];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${
                          index * 0.1
                        }s both`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                        style={{ backgroundColor: colors.remBlue }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93] whitespace-nowrap shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 系统状态 - 增强版 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                服务状态
              </h2>
              <button className="flex items-center gap-2 text-[13px] text-[#95C0EC] hover:underline">
                <RefreshCw className="w-4 h-4" />
                刷新状态
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemStatus.map((service, index) => (
                <div
                  key={service.id}
                  className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor:
                            service.status === "online"
                              ? colors.emerald
                              : colors.sakura,
                        }}
                      >
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {service.name}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              service.status === "online"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            } animate-pulse`}
                          />
                          <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                            {service.status === "online" ? "在线" : "离线"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="px-3 py-2 bg-[#f5f5f7] dark:bg-black rounded-xl">
                      <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                        延迟
                      </p>
                      <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {service.latency}
                      </p>
                    </div>
                    <div className="px-3 py-2 bg-[#f5f5f7] dark:bg-black rounded-xl">
                      <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                        可用性
                      </p>
                      <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {service.uptime}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTest(service.id)}
                    disabled={testingService === service.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-[13px] font-medium active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{ backgroundColor: colors.remBlue }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.8")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {testingService === service.id ? (
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
              ))}
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

export default DashboardPage;
