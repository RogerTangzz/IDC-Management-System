// src/api/business/inspection.js
import request from '@/utils/request'

/**
 * 查询巡检列表
 * @param {Object} query - { pageNum, pageSize, floor, status, keyword, ... }
 */
export function listInspection(query) {
  return request({
    url: '/business/inspection/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询巡检详情
 * @param {number|string} inspectionId
 */
export function getInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId,
    method: 'get'
  })
}

/**
 * 新增巡检记录
 * @param {Object} data
 */
export function addInspection(data) {
  return request({
    url: '/business/inspection',
    method: 'post',
    data
  })
}

/**
 * 修改巡检记录
 * @param {Object} data - 需包含 inspectionId 及要更新字段
 */
export function updateInspection(data) {
  return request({
    url: '/business/inspection',
    method: 'put',
    data
  })
}

/**
 * 删除巡检记录
 * @param {number|string} inspectionId
 */
export function delInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId,
    method: 'delete'
  })
}

/**
 * 导出巡检
 * @param {Object} query
 */
export function exportInspection(query) {
  return request({
    url: '/business/inspection/export',
    method: 'get',
    params: query
  })
}

/**
 * 获取最新巡检记录
 */
export function getLatestInspection() {
  return request({
    url: '/business/inspection/latest',
    method: 'get'
  })
}

/**
 * 生成工单
 * @param {number|string} inspectionId
 * @param {Array} anomalies
 */
export function generateTickets(inspectionId, anomalies) {
  return request({
    url: '/business/inspection/generateTickets',
    method: 'post',
    data: { inspectionId, anomalies }
  })
}

/**
 * 复制巡检
 * @param {number|string} inspectionId
 */
export function copyInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId + '/copy',
    method: 'post'
  })
}

/**
 * 复制上次巡检
 */
export function copyLastInspection() {
  return request({
    url: '/business/inspection/copyLast',
    method: 'post'
  })
}

/**
 * 获取巡检统计
 * @param {Object} params
 */
export function getInspectionStatistics(params) {
  return request({
    url: '/business/inspection/statistics',
    method: 'get',
    params: params
  })
}