// src/api/business/maintenance.js
import request from '@/utils/request'

// 查询维保计划列表
export function listMaintenance(query) {
  return request({
    url: '/business/maintenance/list',
    method: 'get',
    params: query
  })
}

// 查询维保计划详细
export function getMaintenance(planId) {
  return request({
    url: '/business/maintenance/' + planId,
    method: 'get'
  })
}

// 新增维保计划
export function addMaintenance(data) {
  return request({
    url: '/business/maintenance',
    method: 'post',
    data: data
  })
}

// 修改维保计划
export function updateMaintenance(data) {
  return request({
    url: '/business/maintenance',
    method: 'put',
    data: data
  })
}

// 删除维保计划
export function delMaintenance(planId) {
  return request({
    url: '/business/maintenance/' + planId,
    method: 'delete'
  })
}

// 导出维保计划
export function exportMaintenance(query) {
  return request({
    url: '/business/maintenance/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// ========== 业务特定接口 ==========

// 复制上次计划
export function copyLastPlan(planId) {
  return request({
    url: '/business/maintenance/' + planId + '/copy',
    method: 'post'
  })
}

// 获取最新计划（用于复制）
export function getLatestPlan(params) {
  return request({
    url: '/business/maintenance/latest',
    method: 'get',
    params: params
  })
}

// 提交审核
export function submitApproval(planId, approverId) {
  return request({
    url: '/business/maintenance/' + planId + '/submit',
    method: 'post',
    data: { approverId }
  })
}

// 审核通过
export function approvePlan(planId, comment) {
  return request({
    url: '/business/maintenance/' + planId + '/approve',
    method: 'post',
    data: { comment }
  })
}

// 审核拒绝
export function rejectPlan(planId, reason) {
  return request({
    url: '/business/maintenance/' + planId + '/reject',
    method: 'post',
    data: { reason }
  })
}

// 生成工单
export function generateTicket(planId) {
  return request({
    url: '/business/maintenance/' + planId + '/generateTicket',
    method: 'post'
  })
}

// 开始执行
export function startExecution(planId) {
  return request({
    url: '/business/maintenance/' + planId + '/start',
    method: 'post'
  })
}

// 完成执行
export function completeExecution(planId, result) {
  return request({
    url: '/business/maintenance/' + planId + '/complete',
    method: 'post',
    data: { result }
  })
}

// 获取即将到期的计划
export function getUpcomingPlans(hours) {
  return request({
    url: '/business/maintenance/upcoming',
    method: 'get',
    params: { hours: hours || 48 }
  })
}

// 批量删除
export function delMaintenanceBatch(planIds) {
  return request({
    url: '/business/maintenance/batch/' + planIds,
    method: 'delete'
  })
}

// 获取审核人列表
export function getApproverList() {
  return request({
    url: '/business/maintenance/approvers',
    method: 'get'
  })
}

// 获取通知人员列表
export function getNotifyUserList() {
  return request({
    url: '/business/maintenance/notifyUsers',
    method: 'get'
  })
}