/**
 * 巡检API接口
 */

import request from '@/utils/request'
import type { 
  ApiResult, 
  PageResult,
  ExportQuery 
} from '@/types/api/common'
import type {
  InspectionPlan,
  InspectionRecord,
  InspectionResult,
  InspectionAnomaly,
  InspectionQuery,
  InspectionPlanQuery,
  InspectionAnomalyQuery,
  InspectionRecordCreateDto,
  InspectionResultSubmitDto,
  GenerateTicketsDto,
  InspectionStatistics,
  InspectionCheckItem
} from '@/types/api/inspection'

/**
 * 查询巡检计划列表
 */
export function listInspectionPlan(query: InspectionPlanQuery): Promise<PageResult<InspectionPlan>> {
  return request({
    url: '/business/inspection/plan/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询巡检计划详细
 */
export function getInspectionPlan(planId: string | number): Promise<ApiResult<InspectionPlan>> {
  return request({
    url: `/business/inspection/plan/${planId}`,
    method: 'get'
  })
}

/**
 * 新增巡检计划
 */
export function addInspectionPlan(data: Omit<InspectionPlan, 'id'>): Promise<ApiResult<InspectionPlan>> {
  return request({
    url: '/business/inspection/plan',
    method: 'post',
    data: data
  })
}

/**
 * 修改巡检计划
 */
export function updateInspectionPlan(data: InspectionPlan): Promise<ApiResult<any>> {
  return request({
    url: '/business/inspection/plan',
    method: 'put',
    data: data
  })
}

/**
 * 删除巡检计划
 */
export function delInspectionPlan(planId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/inspection/plan/${planId}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用巡检计划
 */
export function changeInspectionPlanStatus(planId: string | number, enabled: boolean): Promise<ApiResult<any>> {
  return request({
    url: `/business/inspection/plan/${planId}/status`,
    method: 'put',
    data: { enabled }
  })
}

/**
 * 查询巡检记录列表
 */
export function listInspectionRecord(query: InspectionQuery): Promise<PageResult<InspectionRecord>> {
  return request({
    url: '/business/inspection/record/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询巡检记录详细
 */
export function getInspectionRecord(recordId: string | number): Promise<ApiResult<InspectionRecord>> {
  return request({
    url: `/business/inspection/record/${recordId}`,
    method: 'get'
  })
}

/**
 * 创建巡检记录
 */
export function createInspectionRecord(data: InspectionRecordCreateDto): Promise<ApiResult<InspectionRecord>> {
  return request({
    url: '/business/inspection/record',
    method: 'post',
    data: data
  })
}

/**
 * 开始巡检
 */
export function startInspection(recordId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/inspection/record/${recordId}/start`,
    method: 'post'
  })
}

/**
 * 完成巡检
 */
export function completeInspection(recordId: string | number, summary?: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/inspection/record/${recordId}/complete`,
    method: 'post',
    data: { summary }
  })
}

/**
 * 提交巡检结果
 */
export function submitInspectionResult(data: InspectionResultSubmitDto): Promise<ApiResult<any>> {
  return request({
    url: '/business/inspection/result',
    method: 'post',
    data: data
  })
}

/**
 * 批量提交巡检结果
 */
export function batchSubmitInspectionResults(results: InspectionResultSubmitDto[]): Promise<ApiResult<any>> {
  return request({
    url: '/business/inspection/result/batch',
    method: 'post',
    data: { results }
  })
}

/**
 * 查询巡检异常列表
 */
export function listInspectionAnomaly(query: InspectionAnomalyQuery): Promise<PageResult<InspectionAnomaly>> {
  return request({
    url: '/business/inspection/anomaly/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询巡检异常详细
 */
export function getInspectionAnomaly(anomalyId: string | number): Promise<ApiResult<InspectionAnomaly>> {
  return request({
    url: `/business/inspection/anomaly/${anomalyId}`,
    method: 'get'
  })
}

/**
 * 更新异常处理状态
 */
export function updateAnomalyStatus(anomalyId: string | number, status: string, result?: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/inspection/anomaly/${anomalyId}/status`,
    method: 'put',
    data: { status, result }
  })
}

/**
 * 批量生成工单
 */
export function generateTicketsFromAnomalies(data: GenerateTicketsDto): Promise<ApiResult<any>> {
  return request({
    url: '/business/inspection/generateTickets',
    method: 'post',
    data: data
  })
}

/**
 * 获取最新巡检记录
 */
export function getLatestInspection(): Promise<ApiResult<InspectionRecord>> {
  return request({
    url: '/business/inspection/latest',
    method: 'get'
  })
}

/**
 * 获取巡检检查项列表
 */
export function listInspectionCheckItems(params?: { category?: string; location?: string }): Promise<ApiResult<InspectionCheckItem[]>> {
  return request({
    url: '/business/inspection/checkItems',
    method: 'get',
    params
  })
}

/**
 * 导出巡检记录
 */
export function exportInspectionRecord(query: ExportQuery): Promise<any> {
  return request({
    url: '/business/inspection/record/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 导出巡检异常
 */
export function exportInspectionAnomaly(query: ExportQuery): Promise<any> {
  return request({
    url: '/business/inspection/anomaly/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 获取巡检统计信息
 */
export function getInspectionStatistics(params?: { beginTime?: string; endTime?: string }): Promise<ApiResult<InspectionStatistics>> {
  return request({
    url: '/business/inspection/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取待执行的巡检计划
 */
export function getPendingInspectionPlans(): Promise<ApiResult<InspectionPlan[]>> {
  return request({
    url: '/business/inspection/plan/pending',
    method: 'get'
  })
}

/**
 * 下载巡检报告
 */
export function downloadInspectionReport(recordId: string | number): Promise<any> {
  return request({
    url: `/business/inspection/record/${recordId}/report`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 上传巡检照片
 */
export function uploadInspectionPhoto(file: File): Promise<ApiResult<{ url: string; fileName: string }>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/business/inspection/photo/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}