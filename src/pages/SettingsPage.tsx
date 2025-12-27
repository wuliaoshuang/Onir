/**
 * 蕾姆精心设计的设置页面
 */
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, User, Bell, Shield, Palette, Keyboard, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'

function SettingsPage() {
  const navigate = useNavigate()

  const settingsSections = [
    {
      icon: User,
      title: '账户',
      description: '管理您的账户信息和偏好',
      items: ['个人资料', '账户安全', '订阅计划'],
    },
    {
      icon: Bell,
      title: '通知',
      description: '自定义通知偏好',
      items: ['推送通知', '邮件通知', '声音设置'],
    },
    {
      icon: Palette,
      title: '外观',
      description: '个性化应用外观',
      items: ['主题设置', '字体大小', '语言'],
    },
    {
      icon: Keyboard,
      title: '快捷键',
      description: '查看和自定义快捷键',
      items: ['键盘快捷键', '命令面板'],
    },
    {
      icon: Shield,
      title: '隐私与安全',
      description: '控制您的数据和安全设置',
      items: ['数据管理', '隐私设置', '登录历史'],
    },
    {
      icon: Info,
      title: '关于',
      description: '应用信息和版本',
      items: ['版本信息', '更新日志', '反馈'],
    },
  ]

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black">
      {/* 顶部导航栏 */}
      <PageHeader
        title="设置"
        showMenuButton={false}
        actions={
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-[#86868b] dark:text-[#8e8e93]" />
          </button>
        }
      />

      {/* 设置内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 用户卡片 */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#95C0EC] to-[#7aaddd] flex items-center justify-center shadow-lg shadow-[#95C0EC]/30">
                <span className="text-2xl text-white font-semibold">U</span>
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  用户名
                </h2>
                <p className="text-[14px] text-[#86868b] dark:text-[#8e8e93]">
                  user@example.com
                </p>
              </div>
              <button className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded-xl text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/10 dark:hover:bg-white/15 transition-all duration-200">
                编辑
              </button>
            </div>
          </div>

          {/* 设置分组 */}
          <div className="space-y-4">
            {settingsSections.map((section) => (
              <div
                key={section.title}
                className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#95C0EC]/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-[#95C0EC]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                      {section.title}
                    </h3>
                    <p className="text-[13px] text-[#86868b] dark:text-[#8e8e93] mb-3">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          className="px-3 py-1.5 text-[13px] bg-black/5 dark:bg-white/5 rounded-lg text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部信息 */}
          <div className="mt-8 text-center">
            <p className="text-[12px] text-[#86868b] dark:text-[#636366]">
              Assistant v1.0.0 · Made with ❤️ by 蕾姆
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
