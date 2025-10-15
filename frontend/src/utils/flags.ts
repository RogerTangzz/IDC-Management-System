import type { EnvPreset } from '@/config/FlagRollouts'

/**
 * 获取当前环境预设
 * 可以通过环境变量 VITE_ENV 或 import.meta.env.MODE 来确定
 */
function getCurrentEnv(): EnvPreset {
  // 优先从 VITE_ENV 环境变量读取
  if (import.meta.env.VITE_ENV) {
    const env = String(import.meta.env.VITE_ENV).toLowerCase()
    if (env === 'production' || env === 'prod') return 'prod'
    if (env === 'staging' || env === 'stage') return 'stage'
    if (env === 'development' || env === 'dev') return 'dev'
  }

  // 从 MODE 推断
  const mode = String(import.meta.env.MODE || 'development').toLowerCase()
  if (mode === 'production') return 'prod'
  if (mode === 'staging') return 'stage'

  // 默认开发环境
  return 'dev'
}

/**
 * 当前环境预设（导出为 __env 以保持与现有代码的兼容性）
 */
export const __env: EnvPreset = getCurrentEnv()

/**
 * 判断是否为生产环境
 */
export const isProd = __env === 'prod'

/**
 * 判断是否为开发环境
 */
export const isDev = __env === 'dev'

/**
 * 判断是否为预发布环境
 */
export const isStage = __env === 'stage'

export default {
  __env,
  isProd,
  isDev,
  isStage,
  getCurrentEnv
}
