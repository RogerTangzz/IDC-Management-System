// src/api/business/maintenance.js
import { get, post, put, del } from '@/utils/request'

// 查询维保计划列表
/**
 * 维保计划列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<MaintenancePlan>>>}
 */
export function listMaintenance(query) { return get('/business/maintenance/list', query) }

// 查询维保计划详细
/**
 * 计划详情
 * @param {number|string} planId
 * @returns {Promise<ApiResult<MaintenancePlan>>}
 */
export function getMaintenance(planId) { return get('/business/maintenance/' + planId) }

// 新增维保计划
/**
 * 新增计划
 * @param {Partial<MaintenancePlan>} data
 */
export function addMaintenance(data) { return post('/business/maintenance', data) }

// 修改维保计划
/**
 * 修改计划
 * @param {Partial<MaintenancePlan>} data
 */
export function updateMaintenance(data) { return put('/business/maintenance', data) }

// 删除维保计划
/**
 * 删除计划
 * @param {number|string} planId
 */
export function delMaintenance(planId) { return del('/business/maintenance/' + planId) }

// 导出维保计划
/**
 * 导出计划 (blob)
 * @param {object} query
 * @returns {Promise<Blob>}
 */
export function exportMaintenance(query) { return get('/business/maintenance/export', query, { responseType: 'blob' }) }

// ========== 业务特定接口 ==========

// 复制上次计划
/**
 * 复制上次计划
 * @param {number|string} planId
 */
export function copyLastPlan(planId) { return post(`/business/maintenance/${planId}/copy`) }

// 获取最新计划（用于复制）
/**
 * 最新计划
 * @param {object} params
 * @returns {Promise<ApiResult<MaintenancePlan>>}
 */
export function getLatestPlan(params) { return get('/business/maintenance/latest', params) }

// 提交审核
/**
 * 提交审核
 * @param {number|string} planId
 * @param {number|string} approverId
 */
export function submitApproval(planId, approverId) { return post(`/business/maintenance/${planId}/submit`, { approverId }) }

// 审核通过
/**
 * 审核通过
 * @param {number|string} planId
 * @param {string} comment
 */
export function approvePlan(planId, comment) { return post(`/business/maintenance/${planId}/approve`, { comment }) }

// 审核拒绝
/**
 * 审核拒绝
 * @param {number|string} planId
 * @param {string} reason
 */
export function rejectPlan(planId, reason) { return post(`/business/maintenance/${planId}/reject`, { reason }) }

// 生成工单
/**
 * 生成工单
 * @param {number|string} planId
 */
export function generateTicket(planId) { return post(`/business/maintenance/${planId}/generateTicket`) }

// 开始执行
/**
 * 开始执行
 * @param {number|string} planId
 */
export function startExecution(planId) { return post(`/business/maintenance/${planId}/start`) }

// 完成执行
/**
 * 完成执行
 * @param {number|string} planId
 * @param {string} result
 */
export function completeExecution(planId, result) { return post(`/business/maintenance/${planId}/complete`, { result }) }

// 获取即将到期的计划
/**
 * 即将到期计划
 * @param {number} [hours=48]
 * @returns {Promise<ApiResult<MaintenancePlan[]>>}
 */
export function getUpcomingPlans(hours) { return get('/business/maintenance/upcoming', { hours: hours || 48 }) }

// 批量删除
/**
 * 批量删除计划
 * @param {(number|string)[]} planIds
 */
export function delMaintenanceBatch(planIds) { return del('/business/maintenance/batch/' + planIds) }

// 获取审核人列表
/**
 * 审核人列表
 * @returns {Promise<ApiResult<User[]>>}
 */
export function getApproverList() { return get('/business/maintenance/approvers') }

// 获取通知人员列表
/**
 * 通知人员列表
 * @returns {Promise<ApiResult<User[]>>}
 */
export function getNotifyUserList() { return get('/business/maintenance/notifyUsers') }

// 获取审核历史
/**
 * 审核历史
 * @param {number|string} planId
 * @returns {Promise<ApiResult<ApprovalRecord[]>>}
 */
export function getApprovalHistory(planId) { return get(`/business/maintenance/${planId}/history`) }

// 撤回审批
/**
 * 撤回审批
 * @param {number|string} planId
 */
export function revokeApproval(planId) { return post(`/business/maintenance/${planId}/revoke`) }

// 查询执行列表
/**
 * 执行列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<MaintenanceExecution>>>}
 */
export function listExecution(query) { return get('/business/maintenance/execution/list', query) }

// 查询执行详情
/**
 * 执行详情
 * @param {number|string} executionId
 * @returns {Promise<ApiResult<MaintenanceExecution>>}
 */
export function getExecution(executionId) { return get(`/business/maintenance/execution/${executionId}`) }

// 从执行记录生成工单
/**
 * 从执行记录生成工单
 * @param {number|string} executionId
 */
export function createTicketFromExecution(executionId) { return post(`/business/maintenance/execution/${executionId}/ticket`) }