import { get, del } from '@/utils/request'

// 查询缓存详细
/**
 * 缓存总体信息
 * @returns {Promise<ApiResult<CacheSummary>>}
 */
export function getCache() { return get('/monitor/cache') }

// 查询缓存名称列表
/**
 * 缓存名称列表
 * @returns {Promise<ApiResult<string[]>>}
 */
export function listCacheName() { return get('/monitor/cache/getNames') }

// 查询缓存键名列表
/**
 * 指定缓存下键列表
 * @param {string} cacheName
 * @returns {Promise<ApiResult<string[]>>}
 */
export function listCacheKey(cacheName) { return get('/monitor/cache/getKeys/' + cacheName) }

// 查询缓存内容
/**
 * 获取缓存值
 * @param {string} cacheName
 * @param {string} cacheKey
 * @returns {Promise<ApiResult<CacheEntry>>}
 */
export function getCacheValue(cacheName, cacheKey) { return get('/monitor/cache/getValue/' + cacheName + '/' + cacheKey) }

// 清理指定名称缓存
/**
 * 清除某个缓存分区
 * @param {string} cacheName
 */
export function clearCacheName(cacheName) { return del('/monitor/cache/clearCacheName/' + cacheName) }

// 清理指定键名缓存
/**
 * 清除某个键
 * @param {string} cacheKey
 */
export function clearCacheKey(cacheKey) { return del('/monitor/cache/clearCacheKey/' + cacheKey) }

// 清理全部缓存
/**
 * 清空全部缓存
 */
export function clearCacheAll() { return del('/monitor/cache/clearCacheAll') }
