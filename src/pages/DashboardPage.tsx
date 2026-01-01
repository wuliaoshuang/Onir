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
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-light-page dark:bg-dark-page overflow-hidden">
      <PageHeader
        title="概览"
        subtitle="欢迎回来，主人"
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] text-light-text-secondary dark:text-dark-text-secondary">
                系统正常
              </span>
            </div>
            <button className="flex items-center gap-2 text-[13px] text-primary-500 hover:underline">
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto p-4 space-y-4">
          {/* 统计卡片网格 - 桌面应用优化 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="group relative bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* 背景装饰 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                    style={{ backgroundColor: card.color }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: card.color }}
                      >
                        <Icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                          card.change.startsWith("+")
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-[#86868b]/10 text-light-text-secondary"
                        }`}
                      >
                        {card.change}
                        {card.change.startsWith("+") && (
                          <TrendingUp className="w-2.5 h-2.5" />
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                      {card.title}
                    </p>
                    <p className="text-[20px] font-bold text-light-text-primary dark:text-dark-text-primary">
                      {card.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 快捷操作和最近活动 - 桌面应用优化 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 快捷操作 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                  快捷操作
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => navigate({ to: action.to as any })}
                      className="group bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 text-left hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: action.color }}
                        >
                          <Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-light-text-primary dark:text-dark-text-primary mb-0.5">
                            {action.title}
                          </p>
                          <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate">
                            {action.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 最近活动 - 桌面应用优化 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                  最近活动
                </h2>
                <button className="text-[12px] text-primary-500 hover:underline">
                  查看全部
                </button>
              </div>
              <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">
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
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${
                          index * 0.1
                        }s both`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md shrink-0"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-light-text-primary dark:text-dark-text-primary truncate">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 系统状态 - 桌面应用优化 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-light-text-primary dark:text-dark-text-primary">
                服务状态
              </h2>
              <button className="flex items-center gap-1.5 text-[12px] text-primary-500 hover:underline">
                <RefreshCw className="w-3.5 h-3.5" />
                刷新状态
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {systemStatus.map((service, index) => (
                <div
                  key={service.id}
                  className="group bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                        style={{
                          backgroundColor:
                            service.status === "online"
                              ? colors.emerald
                              : colors.sakura,
                        }}
                      >
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-light-text-primary dark:text-dark-text-primary">
                          {service.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-1 h-1 rounded-full ${
                              service.status === "online"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            } animate-pulse`}
                          />
                          <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                            {service.status === "online" ? "在线" : "离线"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="px-2 py-1.5 bg-light-page dark:bg-dark-page rounded-lg">
                      <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                        延迟
                      </p>
                      <p className="text-[12px] font-bold text-light-text-primary dark:text-dark-text-primary">
                        {service.latency}
                      </p>
                    </div>
                    <div className="px-2 py-1.5 bg-light-page dark:bg-dark-page rounded-lg">
                      <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                        可用性
                      </p>
                      <p className="text-[12px] font-bold text-light-text-primary dark:text-dark-text-primary">
                        {service.uptime}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTest(service.id)}
                    disabled={testingService === service.id}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-white rounded-lg text-[12px] font-medium active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.8")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {testingService === service.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        测试中
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
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
