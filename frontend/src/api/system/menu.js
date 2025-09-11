import { get, post, put, del } from '@/utils/request'

// 查询菜单列表
/**
 * 查询菜单列表
 * @param {object} query
 * @returns {Promise<ApiResult<Menu[]>>}
 */
export function listMenu(query) { return get('/system/menu/list', query) }

// 查询菜单详细
/**
 * 查询菜单详情
 * @param {number|string} menuId
 * @returns {Promise<ApiResult<Menu>>}
 */
export function getMenu(menuId) { return get('/system/menu/' + menuId) }

// 查询菜单下拉树结构
/**
 * 获取菜单树（当前用户权限过滤）
 * @returns {Promise<ApiResult<Menu[]>>}
 */
export function treeselect() { return get('/system/menu/treeselect') }

// 根据角色ID查询菜单下拉树结构
/**
 * 根据角色获取菜单树并标记选中
 * @param {number|string} roleId
 * @returns {Promise<ApiResult<{checkedKeys:(number|string)[],menus:Menu[]}>>}
 */
export function roleMenuTreeselect(roleId) { return get('/system/menu/roleMenuTreeselect/' + roleId) }

// 新增菜单
/**
 * 新增菜单
 * @param {Partial<Menu>} data
 */
export function addMenu(data) { return post('/system/menu', data) }

// 修改菜单
/**
 * 修改菜单
 * @param {Partial<Menu>} data
 */
export function updateMenu(data) { return put('/system/menu', data) }

// 删除菜单
/**
 * 删除菜单
 * @param {number|string} menuId
 */
export function delMenu(menuId) { return del('/system/menu/' + menuId) }