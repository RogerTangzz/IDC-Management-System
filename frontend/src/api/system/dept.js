import { get, post, put, del } from '@/utils/request'

// 查询部门列表
/**
 * 部门列表
 * @param {object} query
 * @returns {Promise<ApiResult<Dept[]>>}
 */
export function listDept(query) { return get('/system/dept/list', query) }

// 查询部门列表（排除节点）
/**
 * 排除指定节点后的部门列表
 * @param {number|string} deptId
 * @returns {Promise<ApiResult<Dept[]>>}
 */
export function listDeptExcludeChild(deptId) { return get('/system/dept/list/exclude/' + deptId) }

// 查询部门详细
/**
 * 部门详情
 * @param {number|string} deptId
 * @returns {Promise<ApiResult<Dept>>}
 */
export function getDept(deptId) { return get('/system/dept/' + deptId) }

// 新增部门
/**
 * 新增部门
 * @param {Partial<Dept>} data
 */
export function addDept(data) { return post('/system/dept', data) }

// 修改部门
/**
 * 修改部门
 * @param {Partial<Dept>} data
 */
export function updateDept(data) { return put('/system/dept', data) }

// 删除部门
/**
 * 删除部门
 * @param {number|string} deptId
 */
export function delDept(deptId) { return del('/system/dept/' + deptId) }