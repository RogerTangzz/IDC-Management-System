// src/api/inspection/config.js
import request from '@/utils/request'

// 巡检项配置API
export const inspectionConfigApi = {
  // 获取配置列表
  list(floor) {
    return request({
      url: '/inspection/config/list',
      method: 'get',
      params: { floor }
    })
  },

  // 获取单个配置
  get(id) {
    return request({
      url: `/inspection/config/${id}`,
      method: 'get'
    })
  },

  // 创建配置
  create(data) {
    return request({
      url: '/inspection/config',
      method: 'post',
      data
    })
  },

  // 更新配置
  update(id, data) {
    return request({
      url: `/inspection/config/${id}`,
      method: 'put',
      data
    })
  },

  // 删除配置
  delete(id) {
    return request({
      url: `/inspection/config/${id}`,
      method: 'delete'
    })
  },

  // 批量更新排序
  updateSort(items) {
    return request({
      url: '/inspection/config/sort',
      method: 'put',
      data: items
    })
  },

  // 导出配置
  export(floor) {
    return request({
      url: '/inspection/config/export',
      method: 'get',
      params: { floor },
      responseType: 'blob'
    })
  },

  // 导入配置
  import(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      url: '/inspection/config/import',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 复制楼层配置
  copyFloor(sourceFloor, targetFloor) {
    return request({
      url: '/inspection/config/copy',
      method: 'post',
      data: { sourceFloor, targetFloor }
    })
  },

  // 恢复默认配置
  restoreDefault(floor) {
    return request({
      url: '/inspection/config/restore-default',
      method: 'post',
      data: { floor }
    })
  }
}

// 巡检标准API
export const inspectionStandardApi = {
  // 获取行业标准
  getIndustryStandards() {
    return request({
      url: '/inspection/standard/industry',
      method: 'get'
    })
  },

  // 获取历史阈值
  getHistoricalThresholds(itemId) {
    return request({
      url: `/inspection/standard/history/${itemId}`,
      method: 'get'
    })
  }
}