/**
 * 蕾姆精心设计的网络设置页面
 * 丰富的前端交互 - 连接可视化、实时状态、动画效果
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
    <div className="flex-1 h-screen flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="网络"
        subtitle="代理和连接配置"
        actions={
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-2xl text-[15px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
              style={{ backgroundColor: colors.remBlue }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <RefreshCw className="w-4 h-4" />
              全部刷新
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* 网络状态概览 - 毛玻璃效果 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.remBlue }}
                >
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    连接状态
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    正常
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.emerald }}
                >
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    平均延迟
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    217ms
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                    proxyEnabled
                      ? "transition-transform duration-300 group-hover:scale-110"
                      : ""
                  }`}
                  style={{
                    backgroundColor: proxyEnabled ? colors.remBlue : "#f5f5f7",
                  }}
                >
                  <Shield
                    className={`w-6 h-6 ${
                      proxyEnabled
                        ? "text-white"
                        : "text-[#86868b] dark:text-[#8e8e93]"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-1">
                    代理状态
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {proxyEnabled ? "已启用" : "未启用"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 代理设置 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              代理设置
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 overflow-hidden">
              {/* 启用代理 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea] dark:border-[#3a3a3c]">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      proxyEnabled ? "" : ""
                    }`}
                    style={{
                      backgroundColor: proxyEnabled
                        ? colors.remBlue
                        : "#f5f5f7",
                    }}
                  >
                    <Shield
                      className={`w-6 h-6 ${
                        proxyEnabled
                          ? "text-white"
                          : "text-[#86868b] dark:text-[#8e8e93]"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      启用代理
                    </p>
                    <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                      通过代理服务器访问 AI 服务
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProxyEnabled(!proxyEnabled)}
                  className={`w-12 h-7 rounded-full relative transition-all duration-200 ${
                    proxyEnabled ? "" : "bg-[#86868b]/30"
                  }`}
                  style={{
                    backgroundColor: proxyEnabled ? colors.remBlue : undefined,
                  }}
                >
                  <span
                    className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      proxyEnabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* 服务器地址 */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-[#86868b] dark:text-[#8e8e93] mb-2 block">
                    服务器地址
                  </label>
                  <input
                    type="text"
                    placeholder="127.0.0.1"
                    className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-2 border-transparent focus:border-[#95C0EC] transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#86868b] dark:text-[#8e8e93] mb-2 block">
                    端口
                  </label>
                  <input
                    type="number"
                    placeholder="7890"
                    className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-xl text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-2 border-transparent focus:border-[#95C0EC] transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 服务状态 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 font-medium tracking-wide uppercase">
                服务状态
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="group relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onMouseEnter={() => setHoveredCard(service.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* 背景装饰 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                    style={{ backgroundColor: service.color }}
                  />

                  <div className="relative">
                    {/* 顶部信息 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-2xl transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: service.color }}
                        >
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-0.5">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                service.status === "connected"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } animate-pulse`}
                            />
                            <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                              {service.status === "connected"
                                ? "已连接"
                                : "未连接"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 统计数据 */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                        <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                          延迟
                        </p>
                        <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {service.latency}
                        </p>
                      </div>
                      <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                        <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                          区域
                        </p>
                        <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {service.region}
                        </p>
                      </div>
                      <div className="px-3 py-2.5 bg-[#f5f5f7] dark:bg-black rounded-xl">
                        <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                          可用性
                        </p>
                        <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {service.uptime}
                        </p>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <button
                      onClick={() => handleTest(service.id)}
                      disabled={testingService === service.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-[13px] font-medium active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ backgroundColor: colors.remBlue }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
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

                  {/* 悬停时显示的箭头 */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-2 bg-white dark:bg-[#2a2a2c] rounded-xl shadow-lg hover:scale-110 transition-transform duration-200">
                      <ArrowUpRight className="w-4 h-4 text-[#95C0EC]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 网络日志 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              最近活动
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 divide-y divide-[#e5e5ea] dark:divide-[#3a3a3c]">
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
                  className="flex items-center gap-4 px-5 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      log.status === "success"
                        ? "bg-emerald-500/10"
                        : log.status === "warning"
                        ? "bg-orange-500/10"
                        : "bg-[#95C0EC]/10"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        log.status === "success"
                          ? "text-emerald-500"
                          : log.status === "warning"
                          ? "text-orange-500"
                          : "text-[#95C0EC]"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {log.action}
                    </p>
                  </div>
                  <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93] whitespace-nowrap shrink-0">
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
