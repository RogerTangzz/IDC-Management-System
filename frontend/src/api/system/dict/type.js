import { get, post, put, del } from '@/utils/request'

// 查询字典类型列表
/**
 * 字典类型列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<DictType>>>}
 */
export function listType(query) { return get('/system/dict/type/list', query) }

// 查询字典类型详细
/**
 * 字典类型详情
 * @param {number|string} dictId
 * @returns {Promise<ApiResult<DictType>>}
 */
export function getType(dictId) { return get('/system/dict/type/' + dictId) }

// 新增字典类型
/**
 * 新增字典类型
 * @param {Partial<DictType>} data
 */
export function addType(data) { return post('/system/dict/type', data) }

// 修改字典类型
/**
 * 修改字典类型
 * @param {Partial<DictType>} data
 */
export function updateType(data) { return put('/system/dict/type', data) }

// 删除字典类型
/**
 * 删除字典类型
 * @param {number|string} dictId
 */
export function delType(dictId) { return del('/system/dict/type/' + dictId) }

// 刷新字典缓存
/**
 * 刷新字典缓存
 */
export function refreshCache() { return del('/system/dict/type/refreshCache') }

// 获取字典选择框列表
/**
 * 获取字典下拉列表
 * @returns {Promise<ApiResult<DictType[]>>}
 */
export function optionselect() { return get('/system/dict/type/optionselect') }
