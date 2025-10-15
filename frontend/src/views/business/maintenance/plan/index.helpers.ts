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
