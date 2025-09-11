/**
 * 路径匹配器 - 简单支持 * 与 ** 通配
 * @param {string} pattern 匹配模式（支持 * 与 **）
 * @param {string} path 待检测路径
 * @returns {boolean} 是否匹配
 */
export function isPathMatch(pattern, path) {
  const regexPattern = pattern.replace(/\//g, '\\/').replace(/\*\*/g, '.*').replace(/\*/g, '[^\\/]*')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

/**
 * 判断字符串是否为空/undefined/null
 * @param {string | null | undefined} value 值
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value == null || value == "" || value == undefined || value == "undefined") {
    return true
  }
  return false
}

/**
 * 检测是否以 http/https 开头
 * @param {string} url 
 * @returns {boolean}
 */
export function isHttp(url) {
  return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断是否外链 (http/https/mailto/tel)
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 校验用户名（限定 admin / editor）
 * @param {string} str
 * @returns {boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * 校验 URL 合法性
 * @param {string} url
 * @returns {boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/** 判断是否全小写 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/** 判断是否全大写 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/** 判断是否全字母 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * 校验邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function validEmail(email) {
  // eslint-disable-next-line no-useless-escape
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/** 判断是否字符串 */
export function isString(str) {
  return typeof str === 'string' || str instanceof String
}

/** 判断是否数组 (兼容旧浏览器) */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}
