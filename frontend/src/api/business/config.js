// src/api/inspection/config.js
import { get, post, put, del } from '@/utils/request'

// 巡检项配置API
export const inspectionConfigApi = {
  // 获取配置列表
  /**
   * 巡检项配置列表
   * @param {string|number} floor
   * @returns {Promise<ApiResult<InspectionItem[]>>}
   */
  list(floor) {
    return get('/inspection/config/list', { floor })
  },

  // 获取单个配置
  /**
   * 配置详情
   * @param {number|string} id
   * @returns {Promise<ApiResult<InspectionItem>>}
   */
  get(id) {
    return get(`/inspection/config/${id}`)
  },

  // 创建配置
  /**
   * 创建巡检项配置
   * @param {Partial<InspectionItem>} data
   */
  create(data) {
    return post('/inspection/config', data)
  },

  // 更新配置
  /**
   * 更新巡检项配置
   * @param {number|string} id
   * @param {Partial<InspectionItem>} data
   */
  update(id, data) {
    return put(`/inspection/config/${id}`, data)
  },

  // 删除配置
  /**
   * 删除配置
   * @param {number|string} id
   */
  delete(id) {
    return del(`/inspection/config/${id}`)
  },

  // 批量更新排序
  /**
   * 批量更新排序
   * @param {Array<Pick<InspectionItem,'itemId'|'orderNum'>>} items
   */
  updateSort(items) {
    return put('/inspection/config/sort', items)
  },

  // 导出配置
  /**
   * 导出配置 (blob)
   * @param {string|number} floor
   * @returns {Promise<Blob>}
   */
  export(floor) {
    return get('/inspection/config/export', { floor }, { responseType: 'blob' })
  },

  // 导入配置
  /**
   * 导入配置
   * @param {File} file
   */
  import(file) {
    const formData = new FormData()
    formData.append('file', file)
    return post('/inspection/config/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  // 复制楼层配置
  /**
   * 复制楼层配置
   * @param {string|number} sourceFloor
   * @param {string|number} targetFloor
   */
  copyFloor(sourceFloor, targetFloor) {
    return post('/inspection/config/copy', { sourceFloor, targetFloor })
  },

  // 恢复默认配置
  /**
   * 恢复默认配置
   * @param {string|number} floor
   */
  restoreDefault(floor) {
    return post('/inspection/config/restore-default', { floor })
  }
}

// 巡检标准API
export const inspectionStandardApi = {
  // 获取行业标准
  /**
   * 行业标准集合
   * @returns {Promise<ApiResult<IndustryStandard[]>>}
   */
  getIndustryStandards() {
    return get('/inspection/standard/industry')
  },

  // 获取历史阈值
  /**
   * 历史阈值
   * @param {number|string} itemId
   * @returns {Promise<ApiResult<ThresholdHistoryRecord[]>>}
   */
  getHistoricalThresholds(itemId) {
    return get(`/inspection/standard/history/${itemId}`)
  }
}