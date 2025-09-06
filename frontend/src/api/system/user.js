// 采用新的泛型请求封装（request / get / post / put / del）
import { request, get, post, put, del } from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
/**
 * 查询用户列表 (支持泛型指定行类型)
 * @template T
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<T>>>}
 */
export function listUser(query) {
  return get('/system/user/list', query)
}

// 查询用户详细
/**
 * 查询用户详情
 * @param {number|string} userId
 * @returns {Promise<ApiResult<User>>}
 */
export function getUser(userId) {
  return get('/system/user/' + parseStrEmpty(userId))
}

// 新增用户
export function addUser(data) {
  return post('/system/user', data)
}

// 修改用户
export function updateUser(data) {
  return put('/system/user', data)
}

// 删除用户
export function delUser(userId) {
  return del('/system/user/' + userId)
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return put('/system/user/resetPwd', data)
}

// 用户状态修改
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return put('/system/user/changeStatus', data)
}

// 查询用户个人信息
/**
 * 查询当前登录用户个人信息
 * @returns {Promise<ApiResult<User>>}
 */
export function getUserProfile() {
  return get('/system/user/profile')
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return put('/system/user/profile', data)
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return put('/system/user/profile/updatePwd', data)
}

// 用户头像上传
export function uploadAvatar(data) {
  return post('/system/user/profile/avatar', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}

// 查询授权角色
export function getAuthRole(userId) {
  return get('/system/user/authRole/' + userId)
}

// 保存授权角色
export function updateAuthRole(data) {
  // 原接口使用 params 传递（PUT + query），保持一致
  return request({ url: '/system/user/authRole', method: 'put', params: data })
}

// 查询部门下拉树结构
/**
 * 查询部门下拉树结构
 * @returns {Promise<ApiResult<Dept[]>>}
 */
export function deptTreeSelect() {
  return get('/system/user/deptTree')
}

export const userApi = {
  list(query) {
    return listUser(query)
  }
}
