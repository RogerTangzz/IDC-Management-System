// src/api/business/ticketTemplate.js
// 工单模板相关 API 占位实现，后端接口就绪后可替换
import { get, post, put, del } from '@/utils/request'

/**
 * 模板列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<NoticeTemplate>>>}
 */
export function listTemplate(query) { return get('/business/ticket/template/list', query) }

/**
 * 模板详情
 * @param {number|string} id
 * @returns {Promise<ApiResult<NoticeTemplate>>}
 */
export function getTemplate(id) { return get(`/business/ticket/template/${id}`) }

/**
 * 新增模板
 * @param {Partial<NoticeTemplate>} data
 */
export function addTemplate(data) { return post('/business/ticket/template', data) }

/**
 * 更新模板
 * @param {Partial<NoticeTemplate>} data
 */
export function updateTemplate(data) { return put('/business/ticket/template', data) }

/**
 * 删除模板
 * @param {number|string} id
 */
export function delTemplate(id) { return del(`/business/ticket/template/${id}`) }

/**
 * 修改模板状态
 * @param {number|string} id
 * @param {string} status
 */
export function changeTemplateStatus(id, status) { return put(`/business/ticket/template/${id}/status`, { status }) }
