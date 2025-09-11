// 基于环境变量决定 mineOnly 参数名，避免前后端不一致导致的数据权限失效
// VITE_API_MINE_ONLY_PARAM 未配置时默认使用 'mineOnly'

export function resolveMineOnlyKey(): string {
  const k = (import.meta as any)?.env?.VITE_API_MINE_ONLY_PARAM
  return typeof k === 'string' && k.trim() ? k.trim() : 'mineOnly'
}

/**
 * 为查询参数注入“仅本人数据”过滤参数。
 * - 非管理员 isAdmin=false 时注入
 * - 同时保留兼容字段：若自定义 key 非 'mineOnly'，则双写（mineOnly 与自定义 key 都写 true）
 */
export function withMineOnly<T extends Record<string, any>>(payload: T, isAdmin: boolean): T {
  if (isAdmin) return payload
  const key = resolveMineOnlyKey()
  const next: any = { ...payload }
  next[key] = true
  if (key !== 'mineOnly') next['mineOnly'] = true
  return next
}

