/**
 * 最小可运行 API 桩：inspectionPlanApi
 * 后续接后端时，把 return 换成真实 request 即可
 */
export const inspectionPlanApi = {
  async listDueReminders(_params = {}) {
    // TODO: 接后端时改为真实请求：
    // return request({ url: '/inspection/plan/due', method: 'get', params })
    return { rows: [], total: 0 }
  }
}

// 可选：把已有的 config.js 一并 re-export 出去
export * from './config.js'
