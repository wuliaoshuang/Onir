/**
 * 蕾姆精心设计的内存管理页面
 * 桌面应用优化 - 适配 900x700 窗口
 */
import {
  Database,
  Search,
  Filter,
  FileText,
  Code,
  Brain,
  HardDrive,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Upload,
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

function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const memoryStats = [
    {
      id: "1",
      name: "对话历史",
      count: "1.2K",
      size: "45.2 MB",
      icon: MessageSquare,
      trend: "+12%",
      description: "所有对话记录的向量索引",
      color: colors.violet,
      lastSync: "5 分钟前",
    },
    {
      id: "2",
      name: "文档索引",
      count: "856",
      size: "128.5 MB",
      icon: FileText,
      trend: "+23%",
      description: "上传文档的语义搜索索引",
      color: colors.remBlue,
      lastSync: "1 小时前",
    },
    {
      id: "3",
      name: "代码片段",
      count: "234",
      size: "12.8 MB",
      icon: Code,
      trend: "+8%",
      description: "常用代码片段的知识库",
      color: colors.emerald,
      lastSync: "30 分钟前",
    },
    {
      id: "4",
      name: "知识库",
      count: "89",
      size: "234.1 MB",
      icon: Brain,
      trend: "+5%",
      description: "自定义知识库和笔记",
      color: colors.amber,
      lastSync: "2 小时前",
    },
  ];

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="内存"
        subtitle="管理向量数据库"
        actions={
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-white rounded-xl text-[13px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
              style={{ backgroundColor: colors.remBlue }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Database className="w-3.5 h-3.5" />
              同步数据
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* 存储概览 - 桌面应用优化 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.remBlue }}
                >
                  <HardDrive className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    总存储
                  </p>
                  <p className="text-[16px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    420.6
                    <span className="text-[11px] font-medium text-[#86868b] dark:text-[#8e8e93]">
                      {" "}
                      MB
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.violet }}
                >
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    总条目
                  </p>
                  <p className="text-[16px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    2,379
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.emerald }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    增长率
                  </p>
                  <p className="text-[16px] font-bold text-emerald-500">+18%</p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.remBlue }}
                >
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    搜索次数
                  </p>
                  <p className="text-[16px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    8.5K
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 搜索框 - 桌面应用优化 */}
          <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#86868b] dark:text-[#8e8e93]" />
              <input
                type="text"
                placeholder="搜索内存集合、向量、文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] dark:placeholder-[#8e8e93]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-2 py-1 bg-[#86868b]/10 hover:bg-[#86868b]/20 rounded-lg text-[11px] text-[#86868b] dark:text-[#8e8e93] transition-all duration-200"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* 内存集合列表 - 桌面应用优化 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                内存集合
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-[12px] text-[#95C0EC] hover:underline">
                  <Filter className="w-3.5 h-3.5" />
                  筛选
                </button>
                <button className="flex items-center gap-1 text-[12px] text-[#95C0EC] hover:underline">
                  <RefreshCw className="w-3.5 h-3.5" />
                  刷新
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {memoryStats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="group relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* 背景装饰 */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                      style={{ backgroundColor: item.color }}
                    />

                    <div className="relative">
                      {/* 顶部信息 */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-0.5">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* 统计数据 */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="px-2 py-1.5 bg-[#f5f5f7] dark:bg-black rounded-lg">
                          <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            条目
                          </p>
                          <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {item.count}
                          </p>
                        </div>
                        <div className="px-2 py-1.5 bg-[#f5f5f7] dark:bg-black rounded-lg">
                          <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            大小
                          </p>
                          <p className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {item.size}
                          </p>
                        </div>
                        <div className="px-2 py-1.5 bg-[#f5f5f7] dark:bg-black rounded-lg">
                          <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                            增长
                          </p>
                          <div className="flex items-center gap-0.5">
                            <p className="text-[13px] font-bold text-emerald-500">
                              {item.trend}
                            </p>
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                        </div>
                      </div>

                      {/* 底部操作 */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#e5e5ea] dark:border-[#3a3a3c]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                          <RefreshCw className="w-3.5 h-3.5" />
                          上次：{item.lastSync}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 hover:bg-[#f5f5f7] dark:hover:bg-black rounded-lg transition-all duration-200">
                            <Search className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
                          </button>
                          <button
                            className="flex items-center gap-1.5 px-2 py-1 text-white rounded-lg text-[12px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
                            style={{ backgroundColor: colors.remBlue }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <Sparkles className="w-3 h-3" />
                            管理
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 悬停时显示的箭头 */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button className="p-1.5 bg-white dark:bg-[#2a2a2c] rounded-lg shadow-lg hover:scale-110 transition-transform duration-200">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#95C0EC]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 上传新数据卡片 - 桌面应用优化 */}
          <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-6 text-center border-2 border-dashed border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-[#95C0EC]/50 dark:hover:border-[#95C0EC]/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] dark:bg-black flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-6 h-6 text-[#95C0EC]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              上传新数据
            </h3>
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">
              支持的格式：TXT、MD、PDF、JSON、CSV
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

export default MemoryPage;
