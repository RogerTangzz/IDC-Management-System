import { get, post, put, del, request } from '@/utils/request'

// 查询角色列表
/**
 * 查询角色列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<Role>>>}
 */
export function listRole(query) { return get('/system/role/list', query) }

// 查询角色详细
export function getRole(roleId) { return get('/system/role/' + roleId) }

// 新增角色
/**
 * 新增角色
 * @param {Partial<Role>} data
 * @returns {Promise<ApiResult<Role>>}
 */
export function addRole(data) { return post('/system/role', data) }

// 修改角色
export function updateRole(data) { return put('/system/role', data) }

// 角色数据权限
/**
 * 设置角色数据权限
 * @param {Partial<Role>} data
 * @returns {Promise<ApiResult<Role>>}
 */
export function dataScope(data) { return put('/system/role/dataScope', data) }

// 角色状态修改
/**
 * 角色状态修改
 * @param {number|string} roleId
 * @param {string|number} status
 * @returns {Promise<ApiResult<{rows?: Role[]; code?: number; msg?: string}>>}
 */
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return put('/system/role/changeStatus', data)
}

// 删除角色
/**
 * 删除角色
 * @param {number|string} roleId
 * @returns {Promise<ApiResult<string>>}
 */
export function delRole(roleId) { return del('/system/role/' + roleId) }

// 查询角色已授权用户列表
export function allocatedUserList(query) { return get('/system/role/authUser/allocatedList', query) }

// 查询角色未授权用户列表
/**
 * 未授权用户列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<User>>>}
 */
export function unallocatedUserList(query) { return get('/system/role/authUser/unallocatedList', query) }

// 取消用户授权角色
export function authUserCancel(data) { return put('/system/role/authUser/cancel', data) }

// 批量取消用户授权角色
/**
 * 批量取消授权
 * @param {object} data
 * @returns {Promise<ApiResult<string>>}
 */
export function authUserCancelAll(data) { return request({ url: '/system/role/authUser/cancelAll', method: 'put', params: data }) }

// 授权用户选择
export function authUserSelectAll(data) { return request({ url: '/system/role/authUser/selectAll', method: 'put', params: data }) }

// 根据角色ID查询部门树结构
/**
 * 根据角色ID查询部门树
 * @param {number|string} roleId
 * @returns {Promise<ApiResult<Dept[]>>}
 */
export function deptTreeSelect(roleId) { return get('/system/role/deptTree/' + roleId) }
