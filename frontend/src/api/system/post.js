import { get, post, put, del } from '@/utils/request'

// 查询岗位列表
/**
 * 岗位列表
 * @param {object} query
 * @returns {Promise<ApiResult<PageResult<Post>>>}
 */
export function listPost(query) { return get('/system/post/list', query) }

// 查询岗位详细
/**
 * 岗位详情
 * @param {number|string} postId
 * @returns {Promise<ApiResult<Post>>}
 */
export function getPost(postId) { return get('/system/post/' + postId) }

// 新增岗位
/**
 * 新增岗位
 * @param {Partial<Post>} data
 */
export function addPost(data) { return post('/system/post', data) }

// 修改岗位
/**
 * 修改岗位
 * @param {Partial<Post>} data
 */
export function updatePost(data) { return put('/system/post', data) }

// 删除岗位
/**
 * 删除岗位
 * @param {number|string} postId
 */
export function delPost(postId) { return del('/system/post/' + postId) }
