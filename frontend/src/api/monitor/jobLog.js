import { get, del } from '@/utils/request'

// 查询调度日志列表
/**
 * 调度日志列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<JobLog>>>}
 */
export function listJobLog(query) { return get('/monitor/jobLog/list', query) }

// 删除调度日志
/**
 * 删除调度日志
 * @param {number|string} jobLogId
 */
export function delJobLog(jobLogId) { return del('/monitor/jobLog/' + jobLogId) }

// 清空调度日志
/**
 * 清空调度日志
 */
export function cleanJobLog() { return del('/monitor/jobLog/clean') }
