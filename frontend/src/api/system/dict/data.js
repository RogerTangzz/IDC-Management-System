import { get, post, put, del } from '@/utils/request'

// 查询字典数据列表
/**
 * 字典数据列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<DictData>>>}
 */
export function listData(query) { return get('/system/dict/data/list', query) }

// 查询字典数据详细
/**
 * 字典数据详情
 * @param {number|string} dictCode
 * @returns {Promise<ApiResult<DictData>>}
 */
export function getData(dictCode) { return get('/system/dict/data/' + dictCode) }

// 根据字典类型查询字典数据信息
/**
 * 根据类型获取字典数据数组
 * @param {string} dictType
 * @returns {Promise<ApiResult<DictData[]>>}
 */
export function getDicts(dictType) { return get('/system/dict/data/type/' + dictType) }

// 新增字典数据
/**
 * 新增字典数据
 * @param {Partial<DictData>} data
 */
export function addData(data) { return post('/system/dict/data', data) }

// 修改字典数据
/**
 * 修改字典数据
 * @param {Partial<DictData>} data
 */
export function updateData(data) { return put('/system/dict/data', data) }

// 删除字典数据
/**
 * 删除字典数据
 * @param {number|string} dictCode
 */
export function delData(dictCode) { return del('/system/dict/data/' + dictCode) }
