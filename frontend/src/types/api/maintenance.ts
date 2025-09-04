/**
 * 维保相关类型定义
 */

import type { ID, PageQuery } from './common'

// 维保计划状态枚举
export enum MaintenancePlanStatus {
  DRAFT = 'draft',             // 草稿
  PENDING_APPROVAL = 'pending_approval', // 待审批
  APPROVED = 'approved',       // 已审批
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed',     // 已完成
  CANCELLED = 'cancelled',     // 已取消
  REJECTED = 'rejected'        // 已驳回
}

// 维保类型枚举
export enum MaintenanceType {
  PREVENTIVE = 'preventive',   // 预防性维护
  CORRECTIVE = 'corrective',   // 纠正性维护
  PREDICTIVE = 'predictive',   // 预测性维护
  EMERGENCY = 'emergency'      // 紧急维护
}

// 维保周期枚举
export enum MaintenancePeriod {
  DAILY = 'daily',             // 每日
  WEEKLY = 'weekly',           // 每周
  MONTHLY = 'monthly',         // 每月
  QUARTERLY = 'quarterly',     // 每季度
  SEMI_ANNUAL = 'semi_annual', // 半年
  ANNUAL = 'annual',           // 每年
  ONE_TIME = 'one_time'        // 一次性
}

// 维保优先级
export enum MaintenancePriority {
  URGENT = 'urgent',           // 紧急
  HIGH = 'high',               // 高
  MEDIUM = 'medium',           // 中
  LOW = 'low'                  // 低
}

// 维保计划
export interface MaintenancePlan {
  id: ID
  planNo: string                     // 计划编号
  title: string                      // 计划标题
  type: MaintenanceType             // 维保类型
  period: MaintenancePeriod         // 维保周期
  priority: MaintenancePriority     // 优先级
  status: MaintenancePlanStatus     // 状态
  equipmentIds: ID[]                // 设备ID列表
  equipmentNames?: string[]         // 设备名称列表
  contractorId?: ID                 // 承包商ID
  contractorName?: string           // 承包商名称
  responsibleId: ID                 // 负责人ID
  responsibleName: string           // 负责人姓名
  plannedStartDate: string          // 计划开始日期
  plannedEndDate: string            // 计划结束日期
  actualStartDate?: string          // 实际开始日期
  actualEndDate?: string            // 实际结束日期
  estimatedCost?: number            // 预估成本
  actualCost?: number               // 实际成本
  workItems: MaintenanceWorkItem[]  // 工作项
  spareParts?: MaintenanceSparePart[] // 备件
  description?: string              // 描述
  precautions?: string              // 注意事项
  approvalRemark?: string           // 审批备注
  approverId?: ID                   // 审批人ID
  approverName?: string             // 审批人姓名
  approvalTime?: string             // 审批时间
  attachments?: string[]            // 附件
  createBy?: string                 // 创建人
  createTime?: string               // 创建时间
  updateBy?: string                 // 更新人
  updateTime?: string               // 更新时间
}

// 维保工作项
export interface MaintenanceWorkItem {
  id: ID
  itemNo: string                    // 工作项编号
  name: string                      // 工作项名称
  description: string               // 描述
  procedure?: string                // 操作规程
  standard?: string                 // 标准要求
  tools?: string                    // 所需工具
  estimatedHours?: number           // 预估工时
  actualHours?: number              // 实际工时
  technicianIds?: ID[]              // 技术员ID列表
  technicianNames?: string[]        // 技术员姓名列表
  isCompleted?: boolean             // 是否完成
  completedTime?: string            // 完成时间
  result?: string                   // 执行结果
  orderNo: number                   // 排序号
}

// 维保备件
export interface MaintenanceSparePart {
  id: ID
  partNo: string                    // 备件编号
  name: string                      // 备件名称
  specification?: string            // 规格型号
  unit: string                      // 单位
  plannedQuantity: number           // 计划数量
  actualQuantity?: number           // 实际数量
  unitPrice?: number                // 单价
  totalPrice?: number               // 总价
  supplier?: string                 // 供应商
  remark?: string                   // 备注
}

// 维保记录
export interface MaintenanceRecord {
  id: ID
  recordNo: string                  // 记录编号
  planId: ID                        // 计划ID
  planNo: string                    // 计划编号
  planTitle: string                 // 计划标题
  type: MaintenanceType            // 维保类型
  executorId: ID                   // 执行人ID
  executorName: string             // 执行人姓名
  startTime: string                // 开始时间
  endTime?: string                 // 结束时间
  duration?: number                // 耗时（小时）
  workItems: MaintenanceWorkResult[] // 工作结果
  sparePartsUsed?: MaintenanceSparePart[] // 使用的备件
  issues?: string                  // 发现的问题
  suggestions?: string             // 改进建议
  summary?: string                 // 维保总结
  photos?: string[]                // 照片
  attachments?: string[]           // 附件
  createTime?: string              // 创建时间
  updateTime?: string              // 更新时间
}

// 维保工作结果
export interface MaintenanceWorkResult {
  workItemId: ID                   // 工作项ID
  workItemName: string             // 工作项名称
  isCompleted: boolean             // 是否完成
  actualHours: number              // 实际工时
  result: string                   // 执行结果
  issues?: string                  // 发现的问题
  photos?: string[]                // 照片
}

// 维保计划查询参数
export interface MaintenancePlanQuery extends PageQuery {
  planNo?: string
  title?: string
  type?: MaintenanceType
  period?: MaintenancePeriod
  priority?: MaintenancePriority
  status?: MaintenancePlanStatus
  responsibleId?: ID
  contractorId?: ID
  beginTime?: string
  endTime?: string
}

// 维保记录查询参数
export interface MaintenanceRecordQuery extends PageQuery {
  recordNo?: string
  planId?: ID
  type?: MaintenanceType
  executorId?: ID
  beginTime?: string
  endTime?: string
}

// 创建维保计划参数
export interface MaintenancePlanCreateDto {
  title: string
  type: MaintenanceType
  period: MaintenancePeriod
  priority: MaintenancePriority
  equipmentIds: ID[]
  contractorId?: ID
  responsibleId: ID
  plannedStartDate: string
  plannedEndDate: string
  estimatedCost?: number
  workItems: Omit<MaintenanceWorkItem, 'id'>[]
  spareParts?: Omit<MaintenanceSparePart, 'id'>[]
  description?: string
  precautions?: string
  attachments?: string[]
}

// 更新维保计划参数
export interface MaintenancePlanUpdateDto extends Partial<MaintenancePlanCreateDto> {
  id: ID
  status?: MaintenancePlanStatus
}

// 审批维保计划参数
export interface MaintenancePlanApprovalDto {
  planId: ID
  approved: boolean
  remark?: string
}

// 提交维保记录参数
export interface MaintenanceRecordSubmitDto {
  planId: ID
  startTime: string
  endTime?: string
  workResults: MaintenanceWorkResult[]
  sparePartsUsed?: MaintenanceSparePart[]
  issues?: string
  suggestions?: string
  summary?: string
  photos?: string[]
  attachments?: string[]
}

// 维保统计
export interface MaintenanceStatistics {
  totalPlans: number
  pendingApproval: number
  inProgress: number
  completedThisMonth: number
  overdueCount: number
  totalCost: {
    estimated: number
    actual: number
  }
  completionRate: number
  avgCompletionTime: number
  upcomingPlans: Array<{
    id: ID
    planNo: string
    title: string
    plannedStartDate: string
    priority: MaintenancePriority
  }>
}

// 维保提醒
export interface MaintenanceReminder {
  id: ID
  planId: ID
  planNo: string
  planTitle: string
  type: 'upcoming' | 'overdue' | 'approval_pending'
  daysUntil?: number              // 距离开始天数
  daysOverdue?: number            // 逾期天数
  priority: MaintenancePriority
  responsibleId: ID
  responsibleName: string
  plannedStartDate: string
  plannedEndDate: string
}