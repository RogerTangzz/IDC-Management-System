/**
 * 工单相关类型定义
 */

import type { ID, PageQuery } from './common'

// 工单状态枚举
export enum TicketStatus {
  PENDING = 'pending',          // 待处理
  IN_PROGRESS = 'in_progress',  // 处理中
  RESOLVED = 'resolved',        // 已解决
  CLOSED = 'closed',           // 已关闭
  CANCELLED = 'cancelled'       // 已取消
}

// 工单优先级枚举
export enum TicketPriority {
  HIGH = 'high',       // 高
  MEDIUM = 'medium',   // 中
  LOW = 'low'         // 低
}

// 工单动作枚举
export enum TicketAction {
  CREATE = 'create',       // 创建
  ASSIGN = 'assign',       // 指派
  ACCEPT = 'accept',       // 接受
  PROCESS = 'process',     // 处理
  RESOLVE = 'resolve',     // 解决
  CLOSE = 'close',        // 关闭
  REOPEN = 'reopen',      // 重开
  CANCEL = 'cancel',      // 取消
  ESCALATE = 'escalate'   // 升级
}

// 工单实体
export interface Ticket {
  id: ID
  ticketNo: string                // 工单编号
  title: string                    // 标题
  description?: string             // 描述
  status: TicketStatus            // 状态
  priority: TicketPriority        // 优先级
  category?: string               // 分类
  specialty?: string              // 设备专业
  equipment?: string              // 故障设备
  location?: string               // 位置
  reporter: string                // 报修人
  reporterPhone?: string          // 报修人电话
  assigneeId?: ID                 // 指派人ID
  assigneeName?: string           // 指派人姓名
  lastAction?: TicketAction       // 最新动作
  lastStatusTime?: string         // 最新状态时间
  deadline?: string               // 处理时限
  escalationLevel?: number        // 升级级别
  escalationTime?: string         // 升级时间
  resolution?: string             // 解决方案
  attachments?: string[]          // 附件
  createBy?: string               // 创建人
  createTime?: string             // 创建时间
  updateBy?: string               // 更新人
  updateTime?: string             // 更新时间
  remark?: string                 // 备注
}

// 工单查询参数
export interface TicketQuery extends PageQuery {
  ticketNo?: string
  title?: string
  status?: TicketStatus | string
  priority?: TicketPriority | string
  category?: string
  specialty?: string
  reporter?: string
  assigneeId?: ID
  beginTime?: string
  endTime?: string
}

// 工单创建参数
export interface TicketCreateDto {
  title: string
  description?: string
  priority: TicketPriority
  category?: string
  specialty?: string
  equipment?: string
  location?: string
  reporter: string
  reporterPhone?: string
  assigneeId?: ID
  deadline?: string
  attachments?: string[]
  remark?: string
}

// 工单更新参数
export interface TicketUpdateDto extends Partial<TicketCreateDto> {
  id: ID
  status?: TicketStatus
  resolution?: string
}

// 工单指派参数
export interface TicketAssignDto {
  ids: ID[]
  assigneeId: ID
  remark?: string
}

// 工单状态变更参数
export interface TicketStatusChangeDto {
  id: ID
  status: TicketStatus
  resolution?: string
  remark?: string
}

// 工单统计
export interface TicketSummary {
  byStatus: Record<TicketStatus, number>
  byPriority: Record<TicketPriority, number>
  todayNew: number
  todayCompleted: number
  overdue: number
  total: number
}

// 工单时长分析
export interface TicketAnalytics {
  duration: {
    lt1h: number        // 小于1小时
    bt1to4h: number     // 1-4小时
    bt4to8h: number     // 4-8小时
    bt8to24h: number    // 8-24小时
    ge24h: number       // 大于24小时
    total: number
  }
  sla: {
    withDeadline: number     // 有时限的工单数
    timeoutCount: number     // 超时数量
    ontimeCompleted: number  // 按时完成数量
    timeoutRate: number      // 超时率
  }
}

// 工单历史记录
export interface TicketHistory {
  id: ID
  ticketId: ID
  action: TicketAction
  fromStatus?: TicketStatus
  toStatus?: TicketStatus
  operatorId: ID
  operatorName: string
  operateTime: string
  remark?: string
}

// 工单评价
export interface TicketEvaluation {
  id: ID
  ticketId: ID
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  evaluatorId: ID
  evaluatorName: string
  evaluateTime: string
}

// 批量工单导入结果
export interface TicketImportResult {
  total: number
  success: number
  failed: number
  errors: Array<{
    row: number
    message: string
  }>
}