import { get, del } from '@/utils/request'

// 查询登录日志列表
/**
 * 登录日志列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<LoginInfo>>>}
 */
export function list(query) { return get('/monitor/logininfor/list', query) }

// 删除登录日志
/**
 * 删除登录日志
 * @param {number|string} infoId
 */
export function delLogininfor(infoId) { return del('/monitor/logininfor/' + infoId) }

// 解锁用户登录状态
/**
 * 解锁用户
 * @param {string} userName
 */
export function unlockLogininfor(userName) { return get('/monitor/logininfor/unlock/' + userName) }

// 清空登录日志
/**
 * 清空登录日志
 */
export function cleanLogininfor() { return del('/monitor/logininfor/clean') }
