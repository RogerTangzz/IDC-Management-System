/**
 * 维保API接口
 */

import request from '@/utils/request'
import type { 
  ApiResult, 
  PageResult,
  ExportQuery 
} from '@/types/api/common'
import type {
  MaintenancePlan,
  MaintenanceRecord,
  MaintenanceWorkResult,
  MaintenancePlanQuery,
  MaintenanceRecordQuery,
  MaintenancePlanCreateDto,
  MaintenancePlanUpdateDto,
  MaintenancePlanApprovalDto,
  MaintenanceRecordSubmitDto,
  MaintenanceStatistics,
  MaintenanceReminder
} from '@/types/api/maintenance'

/**
 * 查询维保计划列表
 */
export function listMaintenancePlan(query: MaintenancePlanQuery): Promise<PageResult<MaintenancePlan>> {
  return request({
    url: '/business/maintenance/plan/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询维保计划详细
 */
export function getMaintenancePlan(planId: string | number): Promise<ApiResult<MaintenancePlan>> {
  return request({
    url: `/business/maintenance/plan/${planId}`,
    method: 'get'
  })
}

/**
 * 新增维保计划
 */
export function addMaintenancePlan(data: MaintenancePlanCreateDto): Promise<ApiResult<MaintenancePlan>> {
  return request({
    url: '/business/maintenance/plan',
    method: 'post',
    data: data
  })
}

/**
 * 修改维保计划
 */
export function updateMaintenancePlan(data: MaintenancePlanUpdateDto): Promise<ApiResult<any>> {
  return request({
    url: '/business/maintenance/plan',
    method: 'put',
    data: data
  })
}

/**
 * 删除维保计划
 */
export function delMaintenancePlan(planId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${planId}`,
    method: 'delete'
  })
}

/**
 * 提交维保计划审批
 */
export function submitMaintenancePlanApproval(planId: string | number, approverId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${planId}/submit`,
    method: 'post',
    data: { approverId }
  })
}

/**
 * 审批维保计划
 */
export function approveMaintenancePlan(data: MaintenancePlanApprovalDto): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${data.planId}/approve`,
    method: 'post',
    data: {
      approved: data.approved,
      remark: data.remark
    }
  })
}

/**
 * 撤回维保计划
 */
export function withdrawMaintenancePlan(planId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${planId}/withdraw`,
    method: 'post'
  })
}

/**
 * 开始执行维保计划
 */
export function startMaintenancePlan(planId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${planId}/start`,
    method: 'post'
  })
}

/**
 * 完成维保计划
 */
export function completeMaintenancePlan(planId: string | number, summary?: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/plan/${planId}/complete`,
    method: 'post',
    data: { summary }
  })
}

/**
 * 查询维保记录列表
 */
export function listMaintenanceRecord(query: MaintenanceRecordQuery): Promise<PageResult<MaintenanceRecord>> {
  return request({
    url: '/business/maintenance/record/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询维保记录详细
 */
export function getMaintenanceRecord(recordId: string | number): Promise<ApiResult<MaintenanceRecord>> {
  return request({
    url: `/business/maintenance/record/${recordId}`,
    method: 'get'
  })
}

/**
 * 创建维保记录
 */
export function createMaintenanceRecord(data: MaintenanceRecordSubmitDto): Promise<ApiResult<MaintenanceRecord>> {
  return request({
    url: '/business/maintenance/record',
    method: 'post',
    data: data
  })
}

/**
 * 更新维保记录
 */
export function updateMaintenanceRecord(recordId: string | number, data: Partial<MaintenanceRecordSubmitDto>): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/record/${recordId}`,
    method: 'put',
    data: data
  })
}

/**
 * 提交工作项结果
 */
export function submitWorkItemResult(recordId: string | number, result: MaintenanceWorkResult): Promise<ApiResult<any>> {
  return request({
    url: `/business/maintenance/record/${recordId}/workItem`,
    method: 'post',
    data: result
  })
}

/**
 * 导出维保计划
 */
export function exportMaintenancePlan(query: ExportQuery): Promise<any> {
  return request({
    url: '/business/maintenance/plan/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 导出维保记录
 */
export function exportMaintenanceRecord(query: ExportQuery): Promise<any> {
  return request({
    url: '/business/maintenance/record/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 获取维保统计信息
 */
export function getMaintenanceStatistics(params?: { beginTime?: string; endTime?: string }): Promise<ApiResult<MaintenanceStatistics>> {
  return request({
    url: '/business/maintenance/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取维保提醒列表
 */
export function getMaintenanceReminders(): Promise<ApiResult<MaintenanceReminder[]>> {
  return request({
    url: '/business/maintenance/reminders',
    method: 'get'
  })
}

/**
 * 获取即将到期的维保计划
 */
export function getUpcomingMaintenancePlans(days: number = 7): Promise<ApiResult<MaintenancePlan[]>> {
  return request({
    url: '/business/maintenance/plan/upcoming',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取逾期的维保计划
 */
export function getOverdueMaintenancePlans(): Promise<ApiResult<MaintenancePlan[]>> {
  return request({
    url: '/business/maintenance/plan/overdue',
    method: 'get'
  })
}

/**
 * 下载维保报告
 */
export function downloadMaintenanceReport(recordId: string | number): Promise<any> {
  return request({
    url: `/business/maintenance/record/${recordId}/report`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 上传维保附件
 */
export function uploadMaintenanceAttachment(file: File): Promise<ApiResult<{ url: string; fileName: string }>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/business/maintenance/attachment/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}

/**
 * 复制维保计划
 */
export function copyMaintenancePlan(planId: string | number): Promise<ApiResult<MaintenancePlan>> {
  return request({
    url: `/business/maintenance/plan/${planId}/copy`,
    method: 'post'
  })
}

/**
 * 获取维保计划模板
 */
export function getMaintenancePlanTemplates(): Promise<ApiResult<MaintenancePlan[]>> {
  return request({
    url: '/business/maintenance/plan/templates',
    method: 'get'
  })
}

// 兼容旧版API
export const maintenancePlanApi = {
  list: listMaintenancePlan,
  get: getMaintenancePlan,
  add: addMaintenancePlan,
  update: updateMaintenancePlan,
  del: delMaintenancePlan,
  submitApproval: submitMaintenancePlanApproval,
  approve: approveMaintenancePlan
}