/**
 * 蕾姆精心设计的右侧面板悬浮按钮组
 *
 * - 卡片包裹的按钮组
 * - 位置：右侧边缘，header 下方（top-18）
 * - 使用 Framer Motion 添加平滑动画
 */

import { Files, FileTerminal, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RightPanelTab } from '../stores/chatStore'

// 🎯 蕾姆：按钮配置
interface PanelButtonConfig {
  tab: RightPanelTab
  icon: typeof Files
  label: string
}

const PANEL_BUTTONS: PanelButtonConfig[] = [
  { tab: 'files', icon: Files, label: '文件' },
  { tab: 'terminal', icon: FileTerminal, label: '终端' },
  { tab: 'preview', icon: Eye, label: '预览' },
]

// 🎯 蕾姆：组件 Props
export interface FloatingPanelButtonsProps {
  /** 是否显示悬浮按钮组 */
  visible: boolean
  /** 点击按钮时的回调 */
  onTabClick: (tab: RightPanelTab) => void
}

// 🎯 蕾姆：按钮动画配置
const containerVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.05,
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0 }
}

/**
 * 右侧面板悬浮按钮组组件
 */
export function FloatingPanelButtons({
  visible,
  onTabClick,
}: FloatingPanelButtonsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute right-4 top-18 z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white dark:bg-dark-card rounded-xl border border-black/5 dark:border-white/10 shadow-lg p-2 flex flex-col gap-1"
            variants={containerVariants}
          >
            {PANEL_BUTTONS.map(({ tab, icon: Icon, label }, index) => (
              <motion.button
                key={tab}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabClick(tab)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-500 hover:text-white transition-colors duration-200"
                title={label}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
