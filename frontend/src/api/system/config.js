import { get, post, put, del } from '@/utils/request'

// 查询参数列表
/**
 * 配置参数列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<Config>>>}
 */
export function listConfig(query) { return get('/system/config/list', query) }

// 查询参数详细
/**
 * 参数详情
 * @param {number|string} configId
 * @returns {Promise<ApiResult<Config>>}
 */
export function getConfig(configId) { return get('/system/config/' + configId) }

// 根据参数键名查询参数值
/**
 * 根据 key 获取配置值
 * @param {string} configKey
 * @returns {Promise<ApiResult<string>>}
 */
export function getConfigKey(configKey) { return get('/system/config/configKey/' + configKey) }

// 新增参数配置
/**
 * 新增参数配置
 * @param {object} data
 */
export function addConfig(data) { return post('/system/config', data) }

// 修改参数配置
/**
 * 修改参数配置
 * @param {object} data
 */
export function updateConfig(data) { return put('/system/config', data) }

// 删除参数配置
/**
 * 删除参数配置
 * @param {number|string} configId
 */
export function delConfig(configId) { return del('/system/config/' + configId) }

// 刷新参数缓存
/**
 * 刷新配置缓存
 */
export function refreshCache() { return del('/system/config/refreshCache') }
