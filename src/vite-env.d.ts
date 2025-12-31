/**
 * 蕾姆的 Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly VITE_DEV_SERVER_URL?: string
  // 可以在这里添加更多的环境变量类型定义
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
