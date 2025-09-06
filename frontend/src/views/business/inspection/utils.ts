export interface AnomalyLike {
  itemId?: string | number
  [key: string]: any
}

/**
 * 过滤出选中的异常项（按 itemId 匹配，去重 ids）
 */
export function filterByIds<T extends AnomalyLike>(anomalies: T[], ids: Array<string | number>): T[] {
  if (!Array.isArray(anomalies) || anomalies.length === 0) return []
  const set = new Set((ids || []).map(String))
  if (set.size === 0) return []
  return anomalies.filter(a => set.has(String(a.itemId)))
}

