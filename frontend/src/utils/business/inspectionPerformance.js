/**
 * 巡检模块性能优化工具函数
 */

/**
 * 防抖函数 - 用于优化历史记录加载、搜索等操作
 * @param {Function} fn - 需要防抖的函数
 * @param {Number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数 - 用于优化滚动、resize 等高频事件
 * @param {Function} fn - 需要节流的函数
 * @param {Number} interval - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 延迟执行 - 用于优化页面加载性能
 * @param {Number} ms - 延迟毫秒数
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 批量数据加载优化 - 分批加载大量数据
 * @param {Array} dataArray - 数据数组
 * @param {Number} batchSize - 每批大小
 * @param {Function} processCallback - 处理回调函数
 * @param {Number} interval - 批次间隔（毫秒）
 */
export async function loadInBatches(dataArray, batchSize = 10, processCallback, interval = 50) {
  const total = dataArray.length
  for (let i = 0; i < total; i += batchSize) {
    const batch = dataArray.slice(i, i + batchSize)
    await processCallback(batch, i, total)
    if (i + batchSize < total) {
      await delay(interval)
    }
  }
}

/**
 * 计算巡检进度 - 优化版本，避免重复计算
 * @param {Object} items - 巡检项数据
 * @param {Array} floors - 楼层配置
 * @returns {Object} { completedCount, totalCount, progress }
 */
export function calculateProgress(items, floors) {
  if (!items || typeof items !== 'object') {
    return { completedCount: 0, totalCount: 0, progress: 0 }
  }

  let completedCount = 0
  let totalCount = 0

  floors.forEach(floor => {
    const floorItems = items[floor.name] || {}
    floor.items.forEach(() => {
      totalCount++
    })
    Object.values(floorItems).forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        completedCount++
      }
    })
  })

  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return { completedCount, totalCount, progress }
}

/**
 * 缓存包装器 - 为函数添加内存缓存
 * @param {Function} fn - 需要缓存的函数
 * @param {Function} keyGenerator - 缓存键生成函数
 * @param {Number} ttl - 过期时间（毫秒），0 表示永不过期
 * @returns {Function} 带缓存的函数
 */
export function withCache(fn, keyGenerator = (...args) => JSON.stringify(args), ttl = 0) {
  const cache = new Map()

  return async function (...args) {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    // 检查缓存是否有效
    if (cached && (ttl === 0 || Date.now() - cached.timestamp < ttl)) {
      return cached.data
    }

    // 执行函数并缓存结果
    const result = await fn.apply(this, args)
    cache.set(key, {
      data: result,
      timestamp: Date.now()
    })

    return result
  }
}

/**
 * 图片预加载 - 优化照片展示性能
 * @param {Array<String>} imageUrls - 图片 URL 数组
 * @returns {Promise<Array>} 加载结果数组
 */
export function preloadImages(imageUrls) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return Promise.resolve([])
  }

  const promises = imageUrls.map(url => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ url, success: true })
      img.onerror = () => resolve({ url, success: false })
      img.src = url
    })
  })

  return Promise.all(promises)
}

/**
 * 深度克隆 - 优化版本，支持循环引用检测
 * @param {any} obj - 需要克隆的对象
 * @param {WeakMap} hash - 循环引用哈希表
 * @returns {any} 克隆后的对象
 */
export function deepClone(obj, hash = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj)
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const cloneArr = []
    hash.set(obj, cloneArr)
    obj.forEach((item, index) => {
      cloneArr[index] = deepClone(item, hash)
    })
    return cloneArr
  }

  // 处理对象
  const cloneObj = {}
  hash.set(obj, cloneObj)
  Object.keys(obj).forEach(key => {
    cloneObj[key] = deepClone(obj[key], hash)
  })

  return cloneObj
}

/**
 * 本地存储封装 - 带过期时间
 * @param {String} key - 存储键
 * @param {any} value - 存储值
 * @param {Number} expireMs - 过期时间（毫秒）
 */
export function setLocalStorage(key, value, expireMs = 0) {
  try {
    const item = {
      value,
      timestamp: Date.now(),
      expire: expireMs > 0 ? Date.now() + expireMs : 0
    }
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error('LocalStorage set error:', error)
  }
}

/**
 * 获取本地存储 - 自动检查过期
 * @param {String} key - 存储键
 * @returns {any} 存储值，过期或不存在返回 null
 */
export function getLocalStorage(key) {
  try {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    const item = JSON.parse(itemStr)

    // 检查是否过期
    if (item.expire > 0 && Date.now() > item.expire) {
      localStorage.removeItem(key)
      return null
    }

    return item.value
  } catch (error) {
    console.error('LocalStorage get error:', error)
    return null
  }
}

/**
 * 检测异常项 - 优化版本
 * @param {Object} items - 巡检项数据
 * @param {Object} detectionRules - 检测规则
 * @returns {Array} 异常项数组
 */
export function detectAnomaliesOptimized(items, detectionRules) {
  const anomalies = []

  if (!items || typeof items !== 'object') {
    return anomalies
  }

  Object.keys(items).forEach(floor => {
    const floorItems = items[floor]
    if (!floorItems || typeof floorItems !== 'object') return

    Object.keys(floorItems).forEach(itemId => {
      const value = floorItems[itemId]
      if (value === undefined || value === null) return

      // 布尔类型异常检测
      if (typeof value === 'boolean' && detectionRules.boolean) {
        if (detectionRules.boolean(value)) {
          anomalies.push({ floor, itemId, value, type: 'boolean' })
        }
      }

      // 数值类型异常检测
      if (typeof value === 'number' && detectionRules.number && detectionRules.number[itemId]) {
        if (detectionRules.number[itemId](value)) {
          anomalies.push({ floor, itemId, value, type: 'number' })
        }
      }
    })
  })

  return anomalies
}
