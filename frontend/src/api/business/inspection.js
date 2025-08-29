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
