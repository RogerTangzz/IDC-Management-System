// src/api/business/inspection.js
import { get, post, put, del } from '@/utils/request'

/**
 * 查询巡检列表
 * @param {Object} query - { pageNum, pageSize, floor, status, keyword, ... }
 * @returns {Promise<ApiResult<PageResult<Inspection>>>}
 */
export function listInspection(query) { return get('/business/inspection/list', query) }

/**
 * 查询巡检详情
 * @param {number|string} inspectionId
 * @returns {Promise<ApiResult<Inspection>>}
 */
export function getInspection(inspectionId) { return get('/business/inspection/' + inspectionId) }

/**
 * 新增巡检记录
 * @param {Partial<Inspection>} data
 */
export function addInspection(data) { return post('/business/inspection', data) }

/**
 * 修改巡检记录
 * @param {Partial<Inspection>} data - 需包含 inspectionId 及要更新字段
 */
export function updateInspection(data) { return put('/business/inspection', data) }

/**
 * 删除巡检记录
 * @param {number|string} inspectionId
 */
export function delInspection(inspectionId) { return del('/business/inspection/' + inspectionId) }

/**
 * 删除巡检记录（别名）
 * @param {number|string} inspectionId
 */
export function deleteInspection(inspectionId) { return del('/business/inspection/' + inspectionId) }

/**
 * 导出巡检
 * @param {Object} query
 * @returns {Promise<Blob>}
 */
export function exportInspection(query) { return get('/business/inspection/export', query) }

/**
 * 获取最新巡检记录
 * @returns {Promise<ApiResult<Inspection>>}
 */
export function getLatestInspection() { return get('/business/inspection/latest') }

/**
 * 生成工单
 * @param {number|string} inspectionId
 * @param {InspectionItem[]} anomalies
 */
export function generateTickets(inspectionId, anomalies) { return post('/business/inspection/generateTickets', { inspectionId, anomalies }) }

/**
 * 复制巡检
 * @param {number|string} inspectionId
 */
export function copyInspection(inspectionId) { return post(`/business/inspection/${inspectionId}/copy`) }

/**
 * 复制上次巡检
 * @returns {Promise<ApiResult<Inspection>>}
 */
export function copyLastInspection() { return post('/business/inspection/copyLast') }

/**
 * 获取巡检统计
 * @param {Object} params
 * @returns {Promise<ApiResult<InspectionStatistics>>}
 */
export function getInspectionStatistics(params) { return get('/business/inspection/statistics', params) }

/**
 * 获取巡检操作历史
 * @param {number|string} inspectionId - 巡检ID
 * @param {Object} params - { type: 'all'|'operation'|'ticket' }
 * @returns {Promise<ApiResult<InspectionHistoryVO[]>>}
 */
export function getInspectionHistory(inspectionId, params = {}) {
  return get(`/business/inspection/${inspectionId}/history`, params)
}