/**
 * 工单API接口
 */

import request from '@/utils/request'
import type { 
  ApiResult, 
  PageResult, 
  PageQuery,
  BatchRequest,
  ExportQuery 
} from '@/types/api/common'
import type {
  Ticket,
  TicketQuery,
  TicketCreateDto,
  TicketUpdateDto,
  TicketAssignDto,
  TicketStatusChangeDto,
  TicketSummary,
  TicketAnalytics,
  TicketHistory,
  TicketEvaluation,
  TicketImportResult
} from '@/types/api/ticket'

/**
 * 查询工单列表
 */
export function listTicket(query: TicketQuery): Promise<PageResult<Ticket>> {
  return request({
    url: '/business/ticket/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询工单详细
 */
export function getTicket(ticketId: string | number): Promise<ApiResult<Ticket>> {
  return request({
    url: `/business/ticket/${ticketId}`,
    method: 'get'
  })
}

/**
 * 新增工单
 */
export function addTicket(data: TicketCreateDto): Promise<ApiResult<Ticket>> {
  return request({
    url: '/business/ticket',
    method: 'post',
    data: data
  })
}

/**
 * 修改工单
 */
export function updateTicket(data: TicketUpdateDto): Promise<ApiResult<any>> {
  return request({
    url: '/business/ticket',
    method: 'put',
    data: data
  })
}

/**
 * 删除工单
 */
export function delTicket(ticketId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}`,
    method: 'delete'
  })
}

/**
 * 批量删除工单
 */
export function delTickets(ticketIds: Array<string | number>): Promise<ApiResult<any>> {
  return request({
    url: '/business/ticket/batch',
    method: 'delete',
    data: { ids: ticketIds }
  })
}

/**
 * 导出工单
 */
export function exportTicket(query: ExportQuery): Promise<any> {
  return request({
    url: '/business/ticket/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 导入工单
 */
export function importTicket(file: File): Promise<ApiResult<TicketImportResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/business/ticket/import',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}

/**
 * 批量指派工单
 */
export function assignTickets(data: TicketAssignDto): Promise<ApiResult<any>> {
  return request({
    url: '/business/ticket/assign',
    method: 'post',
    data: data
  })
}

/**
 * 变更工单状态
 */
export function changeTicketStatus(data: TicketStatusChangeDto): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${data.id}/status`,
    method: 'put',
    data: data
  })
}

/**
 * 接受工单
 */
export function acceptTicket(ticketId: string | number): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/accept`,
    method: 'post'
  })
}

/**
 * 解决工单
 */
export function resolveTicket(ticketId: string | number, resolution: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/resolve`,
    method: 'post',
    data: { resolution }
  })
}

/**
 * 关闭工单
 */
export function closeTicket(ticketId: string | number, remark?: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/close`,
    method: 'post',
    data: { remark }
  })
}

/**
 * 重开工单
 */
export function reopenTicket(ticketId: string | number, reason: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/reopen`,
    method: 'post',
    data: { reason }
  })
}

/**
 * 取消工单
 */
export function cancelTicket(ticketId: string | number, reason: string): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/cancel`,
    method: 'post',
    data: { reason }
  })
}

/**
 * 升级工单
 */
export function escalateTicket(ticketId: string | number, level: number): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/escalate`,
    method: 'post',
    data: { level }
  })
}

/**
 * 查询工单历史记录
 */
export function getTicketHistory(ticketId: string | number): Promise<ApiResult<TicketHistory[]>> {
  return request({
    url: `/business/ticket/${ticketId}/history`,
    method: 'get'
  })
}

/**
 * 提交工单评价
 */
export function evaluateTicket(ticketId: string | number, evaluation: Omit<TicketEvaluation, 'id' | 'ticketId'>): Promise<ApiResult<any>> {
  return request({
    url: `/business/ticket/${ticketId}/evaluate`,
    method: 'post',
    data: evaluation
  })
}

/**
 * 获取工单统计摘要
 */
export function getTicketSummary(): Promise<ApiResult<TicketSummary>> {
  return request({
    url: '/business/ticket/summary',
    method: 'get'
  })
}

/**
 * 获取工单时长分析
 */
export function getTicketAnalytics(params?: { beginTime?: string; endTime?: string }): Promise<ApiResult<TicketAnalytics>> {
  return request({
    url: '/business/ticket/analytics',
    method: 'get',
    params
  })
}

/**
 * 获取我的工单
 */
export function getMyTickets(params: TicketQuery & { role: 'reporter' | 'assignee' }): Promise<PageResult<Ticket>> {
  return request({
    url: '/business/ticket/my',
    method: 'get',
    params
  })
}

/**
 * 获取待处理工单数量
 */
export function getPendingCount(): Promise<ApiResult<number>> {
  return request({
    url: '/business/ticket/pending/count',
    method: 'get'
  })
}

/**
 * 下载工单模板
 */
export function downloadTicketTemplate(): Promise<any> {
  return request({
    url: '/business/ticket/template/download',
    method: 'get',
    responseType: 'blob'
  })
}

// 兼容旧版API导出
export const ticketApi = {
  list: listTicket,
  get: getTicket,
  create: addTicket,
  update: updateTicket,
  remove: delTicket
}

export const ticketTemplateApi = {
  list: (params: PageQuery) => request({ url: '/business/ticket/template/list', method: 'get', params })
}