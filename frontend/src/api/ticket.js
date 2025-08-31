// src/api/ticket.js
// 占位，后续替换为真实工单接口
import request from '@/utils/request'

export const ticketApi = {
    list(params) { return request({ url: '/business/ticket/list', method: 'get', params }) },
    get(id) { return request({ url: `/business/ticket/${id}`, method: 'get' }) },
    create(data) { return request({ url: '/business/ticket', method: 'post', data }) },
    update(data) { return request({ url: '/business/ticket', method: 'put', data }) },
    remove(id) { return request({ url: `/business/ticket/${id}`, method: 'delete' }) }
}

export const ticketTemplateApi = {
    list(params) { return request({ url: '/business/ticket/template/list', method: 'get', params }) }
}
