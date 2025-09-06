import type { MaintenancePlan, ApprovalLog, ExecutionLog } from '@/types/domain/maintenance'

export interface PageResult<T> {
  total: number
  rows: T[]
}

export interface ApiResult<T = any> {
  code: number
  msg?: string
  data?: T
  rows?: T[]
  total?: number
}

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: Array<{ row?: number; message?: string }>
  taskId?: string
}

export type MaintenancePlanList = PageResult<MaintenancePlan>
export type ApprovalLogs = PageResult<ApprovalLog>
export type ExecutionLogs = PageResult<ExecutionLog>

