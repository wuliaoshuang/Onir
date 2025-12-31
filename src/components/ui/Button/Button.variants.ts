/**
 * 蕾姆精心设计的 Button 变体系统
 *
 * 使用 CVA (class-variance-authority) 管理所有按钮样式
 * 确保样式一致性和可维护性
 */

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Button 变体定义
 *
 * 设计原则：
 * 1. 映射现有代码中的样式模式
 * 2. 使用 Tailwind CSS 4.0 主题变量
 * 3. 支持亮色/深色模式
 * 4. 统一动画和交互效果
 */
export const buttonVariants = cva(
  // ===== 基础样式（所有按钮共有） =====
  [
    'inline-flex',                    // 行内弹性布局
    'items-center',                   // 垂直居中
    'justify-center',                 // 水平居中
    'gap-2',                          // 元素间距
    'font-medium',                    // 字体粗细
    'transition-all',                 // 过渡所有属性
    'duration-200',                   // 过渡时长 200ms
    'active:scale-[0.97]',            // 按下缩放效果
    'disabled:opacity-50',            // 禁用半透明
    'disabled:cursor-not-allowed',    // 禁用鼠标样式
    'focus-visible:outline-none',     // 移除默认轮廓
    'focus-visible:ring-2',           // 聚焦环宽度
    'focus-visible:ring-primary-500', // 聚焦环颜色（主题色）
    'focus-visible:ring-offset-2',    // 聚焦环偏移
  ],
  {
    variants: {
      // ===== 视觉变体 =====
      variant: {
        /**
         * Primary Button - 主操作按钮
         * 样式来源：App.jsx:573-576, MainSidebar.tsx:127-135
         */
        primary: [
          'bg-primary-500',                    // 主题色背景
          'text-white',                        // 白色文字
          'hover:bg-primary-600',              // 悬停深色
          'dark:hover:bg-primary-600',         // 深色模式悬停
          'shadow-lg',                         // 大阴影
          'shadow-primary-500/25',             // 主题色阴影
          'hover:shadow-xl',                   // 悬停更大阴影
          'hover:shadow-primary-500/30',       // 悬停阴影加强
        ],

        /**
         * Secondary Button - 次要操作按钮
         * 样式来源：DeleteConfirmModal.tsx:115-121
         */
        secondary: [
          'bg-[#f5f5f7]',                      // 亮灰色背景
          'dark:bg-[#1c1c1e]',                 // 深色模式背景
          'text-[#1d1d1f]',                    // 深灰色文字
          'dark:text-[#f5f5f7]',               // 深色模式文字
          'hover:bg-[#e5e5ea]',                // 悬停背景
          'dark:hover:bg-[#2a2a2c]',           // 深色模式悬停
        ],

        /**
         * Danger Button - 危险操作按钮
         * 样式来源：DeleteConfirmModal.tsx:125-133
         */
        danger: [
          'bg-red-500',                        // 红色背景
          'text-white',                        // 白色文字
          'hover:bg-red-600',                  // 悬停深红色
          'shadow-lg',                         // 大阴影
          'shadow-red-500/25',                 // 红色阴影
          'hover:shadow-xl',                   // 悬停更大阴影
          'hover:shadow-red-500/30',           // 悬停阴影加强
        ],

        /**
         * Ghost Button - 幽灵按钮（透明背景）
         * 样式来源：InputArea.tsx:81-96, MainSidebar.tsx:97-103
         */
        ghost: [
          'hover:bg-black/5',                  // 悬停黑色半透明
          'dark:hover:bg-white/10',            // 深色模式悬停白色
          'text-[#1d1d1f]',                    // 深灰色文字
          'dark:text-[#f5f5f7]',               // 深色模式文字
        ],

        /**
         * Icon Button - 图标按钮
         * 样式来源：MainSidebar.tsx:51-74, InputArea.tsx:81-96
         */
        icon: [
          'p-2',                               // 内边距
          'hover:bg-black/5',                  // 悬停背景
          'dark:hover:bg-white/10',            // 深色模式悬停
          'rounded-lg',                        // 圆角
          'text-[#86868b]',                    // 灰色图标
          'dark:text-[#8e8e93]',               // 深色模式图标
          'hover:text-primary-500',            // 悬停主题色
        ],
      },

      // ===== 尺寸变体 =====
      size: {
        /**
         * 超小尺寸 - 用于紧凑空间
         */
        xs: [
          'px-2',              // 水平内边距 8px
          'py-1',              // 垂直内边距 4px
          'text-[11px]',       // 字体大小 11px
          'gap-1',             // 间距 4px
        ],
        /**
         * 小尺寸 - 用于次要操作
         */
        sm: [
          'px-3',              // 水平内边距 12px
          'py-1.5',            // 垂直内边距 6px
          'text-[12px]',       // 字体大小 12px
          'gap-1.5',           // 间距 6px
        ],
        /**
         * 中等尺寸（默认）- 最常用的尺寸
         */
        md: [
          'px-4',              // 水平内边距 16px
          'py-2.5',            // 垂直内边距 10px
          'text-[13px]',       // 字体大小 13px
          'gap-2',             // 间距 8px
        ],
        /**
         * 大尺寸 - 用于重要操作
         */
        lg: [
          'px-5',              // 水平内边距 20px
          'py-3',              // 垂直内边距 12px
          'text-[14px]',       // 字体大小 14px
          'gap-2',             // 间距 8px
        ],
        /**
         * 超大尺寸 - 用于特别强调的操作
         */
        xl: [
          'px-6',              // 水平内边距 24px
          'py-3.5',            // 垂直内边距 14px
          'text-[15px]',       // 字体大小 15px
          'gap-2.5',           // 间距 10px
        ],
      },

      // ===== 显示模式 =====
      display: {
        /**
         * 行内显示（默认）
         */
        inline: [
          'w-auto',           // 自动宽度
        ],
        /**
         * 块级显示（响应式）
         * 小屏幕全宽，大屏幕自动宽度
         */
        block: [
          'w-full',           // 全宽
          'sm:w-auto',        // 小屏幕及以上自动宽度
        ],
        /**
         * 始终全宽
         */
        'full-width': [
          'w-full',           // 始终全宽
        ],
      },

      // ===== 形状（圆角） =====
      shape: {
        none: ['rounded-none'],           // 无圆角
        sm: ['rounded-lg'],               // 小圆角 (0.5rem)
        md: ['rounded-xl'],               // 中圆角 (0.75rem)
        lg: ['rounded-xl'],               // 大圆角 (1rem)
        xl: ['rounded-2xl'],              // 超大圆角 (1.5rem)
        '2xl': ['rounded-3xl'],           // 特大圆角 (2rem)
        full: ['rounded-full'],           // 完全圆形
      },

      // ===== 加载状态 =====
      loading: {
        true: [
          'cursor-wait',       // 等待鼠标样式
          'relative',          // 相对定位（用于定位loading spinner）
        ],
        false: [],
      },
    },

    // ===== 复合变体 =====
    compoundVariants: [
      /**
       * Icon button 特殊处理
       * 不同尺寸下调整内边距
       */
      {
        variant: 'icon',
        size: 'sm',
        class: ['p-1.5'],           // 小尺寸图标按钮减少内边距
      },
      {
        variant: 'icon',
        size: 'lg',
        class: ['p-2.5'],           // 大尺寸图标按钮增加内边距
      },
      /**
       * Primary 按钮特殊形状
       */
      {
        variant: 'primary',
        shape: 'full',
        class: ['rounded-full'],    // 完全圆形的主按钮
      },
    ],

    // ===== 默认变体 =====
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      display: 'inline',
      shape: 'lg',
      loading: false,
    },
  }
)

/**
 * 从 CVA 提取的变体 Props 类型
 * 用于类型推断和自动补全
 */
export type ButtonVariants = VariantProps<typeof buttonVariants>
