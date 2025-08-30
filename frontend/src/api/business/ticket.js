// src/api/business/ticket.js
import request from '@/utils/request'

/**
 * 工单列表
 * @param {Object} query - 支持分页与筛选，如 { pageNum, pageSize, status, priority, keyword }
 */
export function listTicket(query) {
  return request({
    url: '/business/ticket/list',
    method: 'get',
    params: query
  })
}

/**
 * 工单详情
 * @param {number|string} ticketId
 */
export function getTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'get'
  })
}

/**
 * 新增工单
 * @param {Object} data
 */
export function addTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'post',
    data
  })
}

/**
 * 修改工单（通用更新）
 * @param {Object} data - 需包含 ticketId，及要更新的字段
 */
export function updateTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'put',
    data
  })
}

/**
 * 删除工单
 * @param {number|string} ticketId
 */
export function delTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'delete'
  })
}

/**
 * （可选）获取逾期工单列表
 * 如果后端暂未提供 /business/ticket/overdue，可不调用此方法；
 * 前端也会在 ticketEscalation.js 里做本地逾期判断。
 */
export function getOverdueTickets(params) {
  return request({
    url: '/business/ticket/overdue',
    method: 'get',
    params
  })
}

// 在文件末尾添加缺失的函数
export function assignTickets(data) {
  return request({
    url: '/business/ticket/assign',
    method: 'post',
    data: data
  })
}

// 批量指派（为后续功能准备）
export function batchAssignTickets(ticketIds, assigneeId) {
  return request({
    url: '/business/ticket/batchAssign', 
    method: 'post',
    data: { ticketIds, assigneeId }
  })
}