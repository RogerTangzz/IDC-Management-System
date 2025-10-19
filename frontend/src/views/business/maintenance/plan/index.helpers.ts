/**
 * 前端字段名 → 后端字段名映射表（用于排序）
 * 与后端 BizMaintenanceController 的白名单保持一致
 */
export const SORT_FIELD_MAP: Record<string, string> = {
  planNo: 'planId',
  title: 'title',
  version: 'version',
  approvalStatus: 'approvalStatus',
  executionStatus: 'executionStatus',
  lastExecutionTime: 'lastExecutionTime',
  nextExecutionTime: 'nextExecutionTime',
  createTime: 'createTime',
  updateTime: 'updateTime'
}

/**
 * Build payload for fetching plan logs (approval/execution history)
 */
export function buildHistoryPayload(params: {
  type?: 'approval' | 'execution'
  pageNum?: number
  pageSize?: number
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}) {
  const { type, pageNum = 1, pageSize = 100, orderByColumn = 'time', isAsc = 'asc' } = params

  return {
    type,
    pageNum,
    pageSize,
    orderByColumn,
    isAsc
  }
}

/**
 * 构建统一的查询参数（用于列表查询和导出）
 * 包含搜索条件、日期范围、分页、排序、数据权限等
 */
export function buildQueryPayload(params: {
  queryParams: any
  dateRange?: any[]
  isAdmin?: boolean
  forExport?: boolean
}) {
  const { queryParams, dateRange, isAdmin = false, forExport = false } = params

  // 复制查询参数，避免修改原对象
  let payload: any = { ...queryParams }

  // 添加日期范围
  if (Array.isArray(dateRange) && dateRange.length === 2) {
    payload.beginTime = `${dateRange[0]} 00:00:00`
    payload.endTime = `${dateRange[1]} 23:59:59`
  }

  // 应用数据权限（非管理员仅查看本人数据）
  if (!isAdmin) {
    payload.mineOnly = true
  }

  // 如果是导出，可能需要特殊处理
  if (forExport) {
    // 导出时移除分页参数（后端会处理）
    delete payload.pageNum
    delete payload.pageSize
  }

  return payload
}
