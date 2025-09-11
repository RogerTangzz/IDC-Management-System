import { get, del } from '@/utils/request'

// 查询操作日志列表
/**
 * 操作日志列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<OperLog>>>}
 */
export function list(query) { return get('/monitor/operlog/list', query) }

// 删除操作日志
/**
 * 删除操作日志
 * @param {number|string} operId
 */
export function delOperlog(operId) { return del('/monitor/operlog/' + operId) }

// 清空操作日志
/**
 * 清空操作日志
 */
export function cleanOperlog() { return del('/monitor/operlog/clean') }
