import { get, post, put, del } from '@/utils/request'

// 查询公告列表
/**
 * 公告列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<Notice>>>}
 */
export function listNotice(query) { return get('/system/notice/list', query) }

// 查询公告详细
/**
 * 公告详情
 * @param {number|string} noticeId
 * @returns {Promise<ApiResult<Notice>>}
 */
export function getNotice(noticeId) { return get('/system/notice/' + noticeId) }

// 新增公告
/**
 * 新增公告
 * @param {object} data
 */
export function addNotice(data) { return post('/system/notice', data) }

// 修改公告
/**
 * 修改公告
 * @param {object} data
 */
export function updateNotice(data) { return put('/system/notice', data) }

// 删除公告
/**
 * 删除公告
 * @param {number|string} noticeId
 */
export function delNotice(noticeId) { return del('/system/notice/' + noticeId) }