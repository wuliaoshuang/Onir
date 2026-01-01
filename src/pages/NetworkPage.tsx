/**
 * 蕾姆精心设计的网络设置页面
 * 桌面应用优化 - 适配 900x700 窗口
 */
import {
  Globe,
  Server,
  ChevronRight,
  Activity,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { useState } from "react";

// 蕾姆定义的主题色
const colors = {
  remBlue: "#95C0EC", // 蕾姆蓝
  violet: "#A78BFA", // 紫罗兰
  emerald: "#34D399", // 翡翠绿
  sakura: "#FB7185", // 樱花粉
  amber: "#FBBF24", // 琥珀黄
};

function NetworkPage() {
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const services = [
    {
      id: "openai",
      name: "OpenAI API",
      status: "connected",
      latency: "245ms",
      icon: "🤖",
      color: colors.emerald,
      region: "美国西部",
      uptime: "99.9%",
    },
    {
      id: "anthropic",
      name: "Anthropic API",
      status: "connected",
      latency: "189ms",
      icon: "🧠",
      color: colors.violet,
      region: "美国东部",
      uptime: "99.8%",
    },
    {
      id: "vector",
      name: "向量数据库",
      status: "disconnected",
      latency: "-",
      icon: "🗄️",
      color: colors.sakura,
      region: "本地",
      uptime: "-",
    },
  ];

  const handleTest = (serviceId: string) => {
    setTestingService(serviceId);
    setTimeout(() => setTestingService(null), 2000);
  };

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-light-page dark:bg-dark-page overflow-hidden">
      <PageHeader
        title="网络"
        subtitle="代理和连接配置"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
            >
              全部刷新
            </Button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto p-4 space-y-4">
          {/* 网络状态概览 - 桌面应用优化 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="group bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                    连接状态
                  </p>
                  <p className="text-[18px] font-bold text-light-text-primary dark:text-dark-text-primary">
                    正常
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.emerald }}
                >
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                    平均延迟
                  </p>
                  <p className="text-[18px] font-bold text-light-text-primary dark:text-dark-text-primary">
                    217ms
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 ${
                    proxyEnabled
                      ? "transition-transform duration-300 group-hover:scale-110"
                      : ""
                  }`}
                  style={{
                    backgroundColor: proxyEnabled ? 'var(--primary)' : "#f5f5f7",
                  }}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      proxyEnabled
                        ? "text-white"
                        : "text-light-text-secondary dark:text-dark-text-secondary"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary mb-0.5">
                    代理状态
                  </p>
                  <p className="text-[18px] font-bold text-light-text-primary dark:text-dark-text-primary">
                    {proxyEnabled ? "已启用" : "未启用"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 代理设置 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 mb-1.5 font-medium tracking-wide uppercase">
              代理设置
            </p>
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              {/* 启用代理 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200`}
                    style={{
                      backgroundColor: proxyEnabled
                        ? 'var(--primary)'
                        : "#f5f5f7",
                    }}
                  >
                    <Shield
                      className={`w-5 h-5 ${
                        proxyEnabled
                          ? "text-white"
                          : "text-light-text-secondary dark:text-dark-text-secondary"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-light-text-primary dark:text-dark-text-primary">
                      启用代理
                    </p>
                    <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                      通过代理服务器访问 AI 服务
                    </p>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  checked={proxyEnabled}
                  onChange={setProxyEnabled}
                />
              </div>

              {/* 服务器地址 */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 block">
                    服务器地址
                  </label>
                  <input
                    type="text"
                    placeholder="127.0.0.1"
                    className="w-full px-3 py-2 bg-light-page dark:bg-dark-page rounded-lg text-[13px] text-light-text-primary dark:text-dark-text-primary outline-none border-2 border-transparent focus:border-primary-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5 block">
                    端口
                  </label>
                  <input
                    type="number"
                    placeholder="7890"
                    className="w-full px-3 py-2 bg-light-page dark:bg-dark-page rounded-lg text-[13px] text-light-text-primary dark:text-dark-text-primary outline-none border-2 border-transparent focus:border-primary-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 服务状态 - 桌面应用优化 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 font-medium tracking-wide uppercase">
                服务状态
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="group relative bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  onMouseEnter={() => setHoveredCard(service.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* 背景装饰 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                    style={{ backgroundColor: service.color }}
                  />

                  <div className="relative">
                    {/* 顶部信息 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-xl transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: service.color }}
                        >
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-light-text-primary dark:text-dark-text-primary mb-0.5">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                service.status === "connected"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } animate-pulse`}
                            />
                            <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">
                              {service.status === "connected"
                                ? "已连接"
                                : "未连接"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 统计数据 */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
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
                          区域
                        </p>
                        <p className="text-[12px] font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                          {service.region}
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

                    {/* 操作按钮 */}
                    <button
                      onClick={() => handleTest(service.id)}
                      disabled={testingService === service.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg text-[12px] font-medium active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ backgroundColor: 'var(--primary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
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

                  {/* 悬停时显示的箭头 */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-1.5 bg-white dark:bg-[#2a2a2c] rounded-lg shadow-lg hover:scale-110 transition-transform duration-200">
                      <ArrowUpRight className="w-3.5 h-3.5 text-primary-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 网络日志 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary px-3 mb-1.5 font-medium tracking-wide uppercase">
              最近活动
            </p>
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">
              {[
                {
                  action: "OpenAI API 连接成功",
                  time: "2 分钟前",
                  status: "success",
                },
                {
                  action: "Anthropic API 请求超时",
                  time: "15 分钟前",
                  status: "warning",
                },
                {
                  action: "向量数据库重新连接",
                  time: "1 小时前",
                  status: "info",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      log.status === "success"
                        ? "bg-emerald-500/10"
                        : log.status === "warning"
                        ? "bg-orange-500/10"
                        : "bg-primary-500/10"
                    }`}
                  >
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        log.status === "success"
                          ? "text-emerald-500"
                          : log.status === "warning"
                          ? "text-orange-500"
                          : "text-primary-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-light-text-primary dark:text-dark-text-primary">
                      {log.action}
                    </p>
                  </div>
                  <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap shrink-0">
                    {log.time}
                  </span>
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

export default NetworkPage;
