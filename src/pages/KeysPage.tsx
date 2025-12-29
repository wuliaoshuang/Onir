/**
 * 蕾姆精心设计的密钥绑定页面
 * 桌面应用优化 - 适配 900x700 窗口
 */
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
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { ThemeToggle } from "../components/ThemeToggle";

// 蕾姆定义的主题色
const colors = {
  remBlue: "#95C0EC", // 蕾姆蓝
  violet: "#A78BFA", // 紫罗兰
  emerald: "#34D399", // 翡翠绿
  sakura: "#FB7185", // 樱花粉
  amber: "#FBBF24", // 琥珀黄
};

function KeysPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const keys = [
    {
      id: "1",
      name: "OpenAI API Key",
      key: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      status: "active",
      icon: "🤖",
      color: colors.emerald,
      lastUsed: "5 分钟前",
      description: "用于 GPT-4 和 GPT-3.5 模型",
    },
    {
      id: "2",
      name: "Anthropic API Key",
      key: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      status: "active",
      icon: "🧠",
      color: colors.violet,
      lastUsed: "2 小时前",
      description: "用于 Claude 3 系列模型",
    },
    {
      id: "3",
      name: "Azure OpenAI Key",
      key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      status: "expired",
      icon: "☁️",
      color: colors.amber,
      lastUsed: "3 天前",
      description: "Azure 托管的 OpenAI 服务",
    },
  ];

  const maskKey = (key: string) => {
    return key.slice(0, 12) + "..." + key.slice(-4);
  };

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    // 蕾姆提醒：这里需要实现删除逻辑
    console.log("Delete key:", id);
  };

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      <PageHeader
        title="密钥绑定"
        subtitle="管理 API 密钥和访问令牌"
        actions={
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-white rounded-xl text-[13px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
              style={{ backgroundColor: colors.remBlue }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus className="w-3.5 h-3.5" />
              添加密钥
            </button>
            <ThemeToggle />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* 安全提示卡片 - 桌面应用优化 */}
          <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4 border border-[#95C0EC]/20">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shrink-0"
                style={{ backgroundColor: colors.remBlue }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  安全提示
                </h3>
                <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  所有密钥都经过 AES-256 加密存储在本地。请勿与任何人分享您的
                  API 密钥，蕾姆会像保护主人的秘密一样保护它们！(鞠躬)
                </p>
              </div>
            </div>
          </div>

          {/* 密钥统计 - 桌面应用优化 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.emerald }}
                >
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    活跃密钥
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    2
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.amber }}
                >
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    已过期
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    1
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: colors.remBlue }}
                >
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] mb-0.5">
                    总密钥
                  </p>
                  <p className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    3
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 密钥列表 - 桌面应用优化 */}
          <div>
            <p className="text-[10px] text-[#86868b] dark:text-[#8e8e93] px-3 mb-1.5 font-medium tracking-wide uppercase">
              我的密钥
            </p>
            <div className="space-y-3">
              {keys.map((keyItem, index) => (
                <div
                  key={keyItem.id}
                  className="group relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4 overflow-hidden transition-all duration-300 hover:shadow-xl"
                  onMouseEnter={() => setHoveredKey(keyItem.id)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* 背景装饰 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                    style={{ backgroundColor: keyItem.color }}
                  />

                  <div className="relative">
                    {/* 顶部信息 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: keyItem.color }}
                        >
                          {keyItem.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                              {keyItem.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                keyItem.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {keyItem.status === "active" ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  已验证
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  已过期
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                            {keyItem.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(keyItem.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          hoveredKey === keyItem.id
                            ? "bg-red-500/10 hover:bg-red-500/20 opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>

                    {/* 密钥显示区域 */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f7] dark:bg-black rounded-lg mb-3">
                      <Key className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93] shrink-0" />
                      <span className="flex-1 font-mono text-[12px] text-[#86868b] dark:text-[#8e8e93] truncate">
                        {showKeys[keyItem.id]
                          ? keyItem.key
                          : maskKey(keyItem.key)}
                      </span>
                      <button
                        onClick={() =>
                          setShowKeys({
                            ...showKeys,
                            [keyItem.id]: !showKeys[keyItem.id],
                          })
                        }
                        className="p-1.5 hover:bg-white dark:hover:bg-[#3a3a3c] rounded-lg transition-all duration-200"
                      >
                        {showKeys[keyItem.id] ? (
                          <EyeOff className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(keyItem.key, keyItem.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-[#3a3a3c] rounded-lg transition-all duration-200"
                      >
                        {copiedId === keyItem.id ? (
                          <Check className="w-3.5 h-3.5 text-[#95C0EC]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#86868b] dark:text-[#8e8e93]" />
                        )}
                      </button>
                    </div>

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                        <Clock className="w-3.5 h-3.5" />
                        上次使用：{keyItem.lastUsed}
                      </div>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-[12px] font-medium active:scale-[0.97] transition-all duration-200 shadow-lg"
                        style={{ backgroundColor: colors.remBlue }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        测试连接
                      </button>
                    </div>
                  </div>

                  {/* 悬停时显示的箭头 */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-1.5 bg-white dark:bg-[#2a2a2c] rounded-lg shadow-lg hover:scale-110 transition-transform duration-200">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#95C0EC]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 添加新密钥提示 - 桌面应用优化 */}
          <div className="group bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-6 text-center border-2 border-dashed border-[#e5e5ea] dark:border-[#3a3a3c] hover:border-[#95C0EC]/50 dark:hover:border-[#95C0EC]/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] dark:bg-black flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-6 h-6 text-[#95C0EC]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              添加新的 API 密钥
            </h3>
            <p className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">
              支持的提供商：OpenAI、Anthropic、Azure OpenAI 等
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

export default KeysPage;
