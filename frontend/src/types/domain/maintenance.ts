export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type ExecutionStatus = 'idle' | 'executing' | 'completed'

export interface MaintenancePlan {
  planId: number
  title: string
  version: string
  floor?: string | number
  mopCategory?: string
  approvalStatus: ApprovalStatus
  executionStatus: ExecutionStatus
  lastStatusTime?: string
  lastAction?: string
  createdBy?: number
  createdTime?: string
  updateTime?: string
  ownerId?: number
  ownerName?: string
}

export interface ApprovalLog {
  id: number
  planId: number
  operatorId: number
  operatorName: string
  action: 'submit' | 'approve' | 'reject'
  remark?: string
  nextAssigneeId?: number
  nextAssigneeName?: string
  time: string
}

export interface ExecutionLog {
  executionId: number
  planId: number
  operatorId: number
  operatorName: string
  startTime: string
  completeTime?: string | null
  result?: string | null
  attachments?: string[]
}

