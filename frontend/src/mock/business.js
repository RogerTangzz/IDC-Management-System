// src/mock/business.js
import Mock from 'mockjs'

// 完整的业务Mock
Mock.mock(/\/business\/ticket\/list/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    rows: Mock.mock({
      'list|10': [{
        'ticketId|+1': 1,
        'ticketNo': () => 'TK' + Mock.Random.datetime('yyyyMMddHHmmss'),
        'title': '@ctitle(5,10)',
        'status|1': ['pending', 'assigned', 'processing', 'completed'],
        'priority|1': ['low', 'medium', 'high'],
        'equipment': '@ctitle(3,6)',
        'reporter': '@cname',
        'assigneeName': '@cname',
        'createTime': '@datetime',
        'deadline': '@datetime'
      }]
    }).list,
    total: 50
  }
})

// 添加工单
Mock.mock(/\/business\/ticket$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  return {
    code: 200,
    msg: '添加成功',
    data: { ...body, ticketId: Mock.Random.id() }
  }
})