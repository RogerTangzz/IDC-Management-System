/**
 * 巡检相关类型定义
 */

import type { ID, PageQuery } from './common'
import type { TicketPriority } from './ticket'

// 巡检状态枚举
export enum InspectionStatus {
  PLANNED = 'planned',       // 已计划
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'     // 已取消
}

// 巡检类型枚举
export enum InspectionType {
  ROUTINE = 'routine',       // 例行巡检
  SPECIAL = 'special',       // 专项巡检
  EMERGENCY = 'emergency'    // 应急巡检
}

// 巡检周期枚举
export enum InspectionPeriod {
  DAILY = 'daily',           // 每日
  WEEKLY = 'weekly',         // 每周
  MONTHLY = 'monthly',       // 每月
  QUARTERLY = 'quarterly',   // 每季度
  YEARLY = 'yearly',         // 每年
  CUSTOM = 'custom'          // 自定义
}

// 异常严重程度
export enum AnomalySeverity {
  CRITICAL = 'critical',     // 严重
  MAJOR = 'major',          // 重要
  MINOR = 'minor',          // 次要
  WARNING = 'warning'        // 警告
}

// 巡检计划
export interface InspectionPlan {
  id: ID
  planNo: string                    // 计划编号
  name: string                      // 计划名称
  type: InspectionType             // 巡检类型
  period: InspectionPeriod         // 巡检周期
  cronExpression?: string          // cron表达式（自定义周期）
  startDate: string                // 开始日期
  endDate?: string                 // 结束日期
  executorId: ID                   // 执行人ID
  executorName: string             // 执行人姓名
  description?: string             // 描述
  checkItems: InspectionCheckItem[] // 检查项
  enabled: boolean                 // 是否启用
  lastExecuteTime?: string         // 上次执行时间
  nextExecuteTime?: string         // 下次执行时间
  createTime?: string              // 创建时间
  updateTime?: string              // 更新时间
}

// 巡检检查项
export interface InspectionCheckItem {
  id: ID
  itemNo: string                   // 检查项编号
  name: string                     // 检查项名称
  category: string                 // 分类
  location: string                 // 位置
  equipment?: string               // 设备
  checkContent: string             // 检查内容
  checkStandard: string            // 检查标准
  normalRange?: string             // 正常范围
  unit?: string                    // 单位
  orderNo: number                  // 排序号
}

// 巡检记录
export interface InspectionRecord {
  id: ID
  recordNo: string                 // 记录编号
  planId?: ID                      // 计划ID
  planName?: string                // 计划名称
  type: InspectionType            // 巡检类型
  status: InspectionStatus        // 状态
  executorId: ID                  // 执行人ID
  executorName: string            // 执行人姓名
  startTime: string               // 开始时间
  endTime?: string                // 结束时间
  duration?: number               // 耗时（分钟）
  checkResults: InspectionResult[] // 检查结果
  anomalies: InspectionAnomaly[]  // 异常记录
  summary?: string                // 巡检总结
  attachments?: string[]          // 附件
  createTime?: string             // 创建时间
  updateTime?: string             // 更新时间
}

// 巡检结果
export interface InspectionResult {
  id: ID
  recordId: ID                    // 记录ID
  checkItemId: ID                 // 检查项ID
  checkItemName: string           // 检查项名称
  isNormal: boolean               // 是否正常
  actualValue?: string            // 实际值
  description?: string            // 描述
  photos?: string[]               // 照片
  checkTime: string               // 检查时间
}

// 巡检异常
export interface InspectionAnomaly {
  id: ID
  recordId: ID                    // 记录ID
  checkItemId: ID                 // 检查项ID
  checkItemName: string           // 检查项名称
  location: string                // 位置
  equipment?: string              // 设备
  severity: AnomalySeverity       // 严重程度
  description: string             // 异常描述
  suggestedAction?: string        // 建议措施
  photos?: string[]               // 照片
  ticketGenerated?: boolean       // 是否已生成工单
  ticketId?: ID                   // 工单ID
  ticketNo?: string               // 工单编号
  discoveryTime: string           // 发现时间
  handleStatus?: string           // 处理状态
  handleTime?: string             // 处理时间
  handler?: string                // 处理人
  handleResult?: string           // 处理结果
}

// 巡检查询参数
export interface InspectionQuery extends PageQuery {
  recordNo?: string
  planId?: ID
  type?: InspectionType
  status?: InspectionStatus
  executorId?: ID
  beginTime?: string
  endTime?: string
}

// 巡检计划查询参数
export interface InspectionPlanQuery extends PageQuery {
  planNo?: string
  name?: string
  type?: InspectionType
  period?: InspectionPeriod
  executorId?: ID
  enabled?: boolean
}

// 巡检异常查询参数
export interface InspectionAnomalyQuery extends PageQuery {
  recordId?: ID
  severity?: AnomalySeverity
  location?: string
  equipment?: string
  ticketGenerated?: boolean
  beginTime?: string
  endTime?: string
}

// 创建巡检记录参数
export interface InspectionRecordCreateDto {
  planId?: ID
  type: InspectionType
  executorId: ID
  checkItems?: ID[]
}

// 提交巡检结果参数
export interface InspectionResultSubmitDto {
  recordId: ID
  checkItemId: ID
  isNormal: boolean
  actualValue?: string
  description?: string
  photos?: string[]
  anomaly?: {
    severity: AnomalySeverity
    description: string
    suggestedAction?: string
    photos?: string[]
  }
}

// 批量生成工单参数
export interface GenerateTicketsDto {
  recordId: ID
  anomalyIds: ID[]
  priority?: TicketPriority
  assigneeId?: ID
  deadline?: string
}

// 巡检统计
export interface InspectionStatistics {
  totalPlans: number
  activePlans: number
  completedToday: number
  pendingToday: number
  anomalyCount: {
    critical: number
    major: number
    minor: number
    warning: number
    total: number
  }
  completionRate: number
  avgDuration: number
}