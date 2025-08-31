import { get, post, put, del } from '@/utils/request'

// 查询定时任务调度列表
/**
 * 任务列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<Job>>>}
 */
export function listJob(query) { return get('/monitor/job/list', query) }

// 查询定时任务调度详细
/**
 * 任务详情
 * @param {number|string} jobId
 * @returns {Promise<ApiResult<Job>>}
 */
export function getJob(jobId) { return get('/monitor/job/' + jobId) }

// 新增定时任务调度
/**
 * 新增任务
 * @param {Partial<Job>} data
 */
export function addJob(data) { return post('/monitor/job', data) }

// 修改定时任务调度
/**
 * 修改任务
 * @param {Partial<Job>} data
 */
export function updateJob(data) { return put('/monitor/job', data) }

// 删除定时任务调度
/**
 * 删除任务
 * @param {number|string} jobId
 */
export function delJob(jobId) { return del('/monitor/job/' + jobId) }

// 任务状态修改
/**
 * 修改任务状态
 * @param {number|string} jobId
 * @param {string} status
 */
export function changeJobStatus(jobId, status) {
  const data = {
    jobId,
    status
  }
  return put('/monitor/job/changeStatus', data)
}


// 定时任务立即执行一次
/**
 * 立即执行一次
 * @param {number|string} jobId
 * @param {string} jobGroup
 */
export function runJob(jobId, jobGroup) {
  const data = {
    jobId,
    jobGroup
  }
  return put('/monitor/job/run', data)
}