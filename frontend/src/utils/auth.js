import Cookies from 'js-cookie'

/** Cookie 中存放的 Token 键名 */
const TokenKey = 'Admin-Token'

/** 获取 Token */
export function getToken() {
  return Cookies.get(TokenKey)
}

/** 设置 Token */
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

/** 删除 Token */
export function removeToken() {
  return Cookies.remove(TokenKey)
}
