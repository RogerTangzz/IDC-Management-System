export type QueryParams = {
  ticketNo?: string
  title?: string
  status?: string
  priority?: string
  pageNum?: number
  pageSize?: number
  [k: string]: any
}

export type RouteQuery = Record<string, any>
export type DateRange = [string, string] | []

export function buildListQuery(query: QueryParams = {}, dateRange: DateRange = []) {
  const out: Record<string, any> = {}
  const pick = (k: string) => {
    const v = (query as any)[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') out[k] = v
  }
  ;['ticketNo', 'title', 'status', 'priority'].forEach(pick)
  out.pageNum = Number(query.pageNum || 1)
  out.pageSize = Number(query.pageSize || 20)
  if (Array.isArray(dateRange) && dateRange.length === 2) {
    const [b, e] = dateRange
    if (b) out.beginTime = `${b} 00:00:00`
    if (e) out.endTime = `${e} 23:59:59`
  }
  return out
}

export interface NormalizeResult { queryParams: QueryParams; dateRange: DateRange }
export function normalizeQueryFromRoute(routeQuery: RouteQuery = {}): NormalizeResult {
  const qp: QueryParams = { pageNum: 1, pageSize: 20 }
  let dr: DateRange = []
  const getStr = (k: string) => (routeQuery[k] == null ? '' : String(routeQuery[k]).trim())
  // aliases
  const q = getStr('q') || getStr('kw') || getStr('keyword')
  const no = getStr('no')
  const stat = getStr('stat') || getStr('status')
  const pri = getStr('pri') || getStr('priority')
  if (q) qp.title = q
  if (no) qp.ticketNo = no
  if (stat) qp.status = stat
  if (pri) qp.priority = pri
  // mode presets
  const mode = getStr('mode')
  if (mode === 'overdue') qp.status = qp.status || 'overdue'
  if (mode === 'neardue') qp.status = qp.status || 'neardue'
  // date range
  const begin = getStr('begin') || getStr('start') || getStr('startDate')
  const end = getStr('end') || getStr('stop') || getStr('endDate')
  if (begin && end) dr = [begin, end]
  // paging
  const pn = Number(routeQuery.pageNum)
  const ps = Number(routeQuery.pageSize)
  if (!Number.isNaN(pn) && pn > 0) qp.pageNum = pn
  if (!Number.isNaN(ps) && ps > 0) qp.pageSize = ps
  return { queryParams: qp, dateRange: dr }
}

export function mapSortChange(input: { prop?: string; order?: string }) {
  const prop = input?.prop || ''
  const order = input?.order || ''
  const dir = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
  const allowed = new Set(['createTime', 'lastStatusTime'])
  const sortBy = allowed.has(prop) ? prop : ''
  return { sortBy, sortDir: dir }
}

// 将驼峰字段转为下划线，便于与后端排序字段对齐
export function toUnderScoreCase(s: string = ''): string {
  return String(s || '').replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function computeActionDisabled(
  row: any,
  selection: any[] = []
): { canEdit: boolean; canDelete: boolean; canAssign: boolean; canReopen: boolean } {
  const status = row?.status
  const isClosed = status === 'closed'
  const hasSel = Array.isArray(selection) && selection.length > 0
  return {
    canEdit: !isClosed,
    canDelete: !isClosed, // 单行删除：关闭不可删；批量删除由 hasSel 决定（交由视图）
    // 指派仅在有选择（批量或单行选中）时可用
    canAssign: hasSel,
    canReopen: isClosed
  }
}

export function formatPriorityLabel(priority?: string) {
  switch (priority) {
    case 'high':
      return { label: '高', type: 'danger' as const }
    case 'medium':
      return { label: '中', type: 'warning' as const }
    case 'low':
      return { label: '低', type: 'info' as const }
    default:
      return { label: '未知', type: 'info' as const }
  }
}

// 仅返回优先级的标签（供列表页显示文本）
export function getPriorityLabel(priority?: string) {
  return formatPriorityLabel(priority).label
}

// 仅返回优先级的 type（供标签样式使用）
export function getPriorityType(priority?: string) {
  return formatPriorityLabel(priority).type
}

export async function ensureSafeRequest<T>(
  fn: () => Promise<T>,
  onError?: (e: any) => void
): Promise<{ ok: true; value: T } | { ok: false; error: any }> {
  try {
    const value = await fn()
    return { ok: true, value }
  } catch (e) {
    try { onError?.(e) } catch {}
    return { ok: false, error: e }
  }
}

export function mergeSearchState<T extends object>(state: T, patch: Partial<T>, _debounceMs = 150) {
  const next = Object.assign({}, state, patch)
  return { nextState: next, shouldFetch: true }
}

// 构建导出参数：合并查询、日期区间，应用“仅本人”过滤及特殊模式
import { withMineOnly } from '@/utils/business/mineOnly'
export type SpecialMode = 'overdue' | 'neardue' | ''
export type ExportParamsOut = Record<string, any> & { beginTime?: string; endTime?: string; mode?: Exclude<SpecialMode, ''> }
export function buildExportParams(
  query: QueryParams = {},
  dateRange: DateRange = [],
  isAdmin: boolean = false,
  specialMode: SpecialMode = ''
): ExportParamsOut {
  let params: ExportParamsOut = { ...(query || {}) }
  if (Array.isArray(dateRange) && dateRange.length === 2) {
    const [b, e] = dateRange
    if (b) params.beginTime = `${b} 00:00:00`
    if (e) params.endTime = `${e} 23:59:59`
  }
  params = withMineOnly(params, isAdmin)
  if (specialMode === 'overdue' || specialMode === 'neardue') params.mode = specialMode
  return params
}
