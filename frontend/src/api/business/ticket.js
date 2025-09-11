// src/api/business/ticket.js
import { get, post, put, del } from '@/utils/request'

/**
 * 工单列表
 * @param {Object} query - 支持分页与筛选，如 { pageNum, pageSize, status, priority, keyword }
 * @returns {Promise<ApiResult<PageResult<Ticket>>>}
 */
export function listTicket(query) { return get('/business/ticket/list', query) }

/**
 * 工单详情
 * @param {number|string} ticketId
 * @returns {Promise<ApiResult<Ticket>>}
 */
export function getTicket(ticketId) { return get('/business/ticket/' + ticketId) }

/**
 * 新增工单
 * @param {Partial<Ticket>} data
 */
export function addTicket(data) { return post('/business/ticket', data) }

/**
 * 修改工单（通用更新）
 * @param {Partial<Ticket>} data - 需包含 ticketId
 */
export function updateTicket(data) { return put('/business/ticket', data) }

/**
 * 删除工单
 * @param {number|string} ticketId
 */
export function delTicket(ticketId) { return del('/business/ticket/' + ticketId) }

/**
 * （可选）获取逾期工单列表
 * @param {object} params
 * @returns {Promise<ApiResult<PageResult<Ticket>>>}
 */
export function getOverdueTickets(params) { return get('/business/ticket/overdue', params) }

// 在文件末尾添加缺失的函数
/**
 * 指派单个/多个工单
 * @param {{ ticketIds: (number|string)[]; assigneeId: number|string }} data
 */
export function assignTickets(data) { return post('/business/ticket/assign', data) }

// 批量指派（为后续功能准备）
/**
 * 批量指派
 * @param {(number|string)[]} ticketIds
 * @param {number|string} assigneeId
 */
export function batchAssignTickets(ticketIds, assigneeId) { return post('/business/ticket/batchAssign', { ticketIds, assigneeId }) }

/** 重新打开工单 */
export function reopenTicket(ticketId){ return post(`/business/ticket/reopen/${ticketId}`) }

/** 工单简易汇总报表 */
export function ticketSummary(){ return get('/business/ticket/report/summary') }

/** 工单高级分析 */
export function ticketAnalytics(params){ return get('/business/ticket/report/analytics', params) }

/** 近到期工单分页列表 */
export function getNearDueTickets(params){ return get('/business/ticket/nearDue', params) }
