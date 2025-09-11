import { get, del } from '@/utils/request'

// 查询在线用户列表
/**
 * 在线用户列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<User>>>}
 */
export function list(query) { return get('/monitor/online/list', query) }

// 强退用户
/**
 * 强制下线
 * @param {string} tokenId
 */
export function forceLogout(tokenId) { return del('/monitor/online/' + tokenId) }
