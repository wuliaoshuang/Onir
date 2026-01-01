/** @type {import('tailwindcss').Config} */
export default {
  // 🎨 蕾姆的 Tailwind CSS 配置
  // 用于 Tailwind CSS IntelliSense 识别自定义类

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // 语义化颜色别名（告诉 IntelliSense 这些是有效的类名）
      colors: {
        // 亮色主题
        'light-page': '#f5f5f7',
        'light-card': '#ffffff',
        'light-text-primary': '#1d1d1f',
        'light-text-secondary': '#86868b',
        'light-text-tertiary': '#a1a1a6',
        'light-border': '#e5e5ea',

        // 深色主题
        'dark-page': '#000000',
        'dark-card': '#1c1c1e',
        'dark-text-primary': '#f5f5f7',
        'dark-text-secondary': '#8e8e93',
        'dark-text-tertiary': '#636366',
        'dark-border': '#3a3a3c',

        // 主题色
        'primary-400': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },

  plugins: [],
}
