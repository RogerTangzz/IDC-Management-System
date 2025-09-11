import { get } from '@/utils/request'

// 获取服务信息
/**
 * 服务监控信息
 * @returns {Promise<ApiResult<ServerStatus>>}
 */
export function getServer() { return get('/monitor/server') }