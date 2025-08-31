// src/api/maintenance/plan.js
// 占位 API，避免构建因缺少文件失败，后续可替换为真实实现
import request from '@/utils/request'

export const maintenancePlanApi = {
    list(params) {
        return request({ url: '/business/maintenance/plan/list', method: 'get', params })
    },
    get(id) {
        return request({ url: `/business/maintenance/plan/${id}`, method: 'get' })
    },
    create(data) {
        return request({ url: '/business/maintenance/plan', method: 'post', data })
    },
    update(data) {
        return request({ url: '/business/maintenance/plan', method: 'put', data })
    },
    remove(id) {
        return request({ url: `/business/maintenance/plan/${id}`, method: 'delete' })
    }
}
