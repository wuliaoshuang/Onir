/**
 * 蕾姆精心设计的工作目录设置页面
 * 管理应用的工作目录和临时目录设置
 */
import {
  Folder,
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  Info,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { useThemeStore } from "../stores/themeStore";
import { useState } from "react";

// 主题色类名映射（复用自 GeneralSettingsPage）
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

export default function WorkspacePage() {
  const { accentColor } = useThemeStore();
  const colorClass = COLOR_CLASSES[accentColor] || COLOR_CLASSES['rem-blue'];

  // 工作目录状态
  const [workspaces, setWorkspaces] = useState<string[]>([
    '/Users/shuang/Documents/projects/workspace-alpha',
    '/Users/shuang/Documents/projects/workspace-beta',
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState('/Users/shuang/Library/Application Support/alma/workspaces/default');
  const [useTempDir, setUseTempDir] = useState(false);

  // 添加新工作目录
  const handleAddWorkspace = () => {
    // TODO: 实现目录选择对话框
    console.log('蕾姆：打开目录选择对话框');
  };

  // 删除工作目录
  const handleDeleteWorkspace = (workspace: string) => {
    setWorkspaces(workspaces.filter(w => w !== workspace));
  };

  // 在 Finder 中显示
  const handleShowInFinder = (path: string) => {
    console.log('蕾姆：在 Finder 中显示', path);
    // TODO: 实现打开 Finder 的功能
  };

  return (
    <div className="flex-1 h-svh flex flex-col min-w-0 bg-[#f5f5f7] dark:bg-black overflow-hidden">
      {/* 页面头部 */}
      <PageHeader
        title="工作目录"
        subtitle="管理新对话的默认工作位置"
      />

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto p-4 space-y-4">
          {/* 说明卡片 */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                  关于工作目录
                </h3>
                <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] leading-relaxed">
                  新对话将自动使用此目录，而不是创建临时目录。您可以为不同项目设置不同的工作目录。
                </p>
              </div>
            </div>
          </div>

          {/* 当前工作目录 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              当前工作目录
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <Folder className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      默认工作目录
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      新对话将在此目录中创建
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => console.log('蕾姆：编辑工作目录')}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FolderOpen}
                    onClick={() => handleShowInFinder(currentWorkspace)}
                  >
                    打开
                  </Button>
                </div>
              </div>

              {/* 路径显示 */}
              <div className="px-4 py-3 bg-[#f5f5f7] dark:bg-black rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Folder className={`w-4 h-4 flex-shrink-0 ${colorClass.text}`} />
                    <p className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono truncate">
                      {currentWorkspace}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded font-medium flex-shrink-0 ml-2">
                    Default
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 所有工作目录 */}
          {workspaces.length > 0 && (
            <div>
              <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
                所有工作目录 ({workspaces.length})
              </p>
              <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
                {workspaces.map((workspace, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/10 transition-all ${
                      index !== workspaces.length - 1 ? 'border-b border-[#e5e5ea] dark:border-[#3a3a3c]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center flex-shrink-0">
                        <Folder className={`w-5 h-5 ${colorClass.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono truncate">
                          {workspace}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FolderOpen}
                        onClick={() => handleShowInFinder(workspace)}
                      >
                        打开
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => console.log('蕾姆：编辑工作目录', workspace)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteWorkspace(workspace)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 添加工作目录按钮 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              添加新目录
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 p-4">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                className="w-full"
                onClick={handleAddWorkspace}
              >
                添加工作目录
              </Button>
              <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] text-center mt-3">
                点击按钮选择一个文件夹作为工作目录
              </p>
            </div>
          </div>

          {/* 临时目录设置 */}
          <div>
            <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93] px-4 mb-2 font-medium tracking-wide uppercase">
              临时目录
            </p>
            <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] dark:bg-black flex items-center justify-center">
                    <FolderOpen className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      使用临时目录
                    </h3>
                    <p className="text-[11px] text-[#86868b] dark:text-[#8e8e93]">
                      新对话将创建临时目录，关闭对话后自动清理
                    </p>
                  </div>
                </div>
                {/* TODO: 替换为 Toggle 组件 */}
                <button
                  onClick={() => setUseTempDir(!useTempDir)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-200
                    ${useTempDir ? 'bg-primary-500' : 'bg-[#e5e5ea] dark:bg-[#3a3a3c]'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200
                      ${useTempDir ? 'translate-x-5.5' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
