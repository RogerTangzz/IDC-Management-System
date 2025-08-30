// src/mock/modules/ticket.js
export default [
  {
    url: '/business/ticket/list',
    method: 'get',
    response: ({ query }) => {
      const { pageNum = 1, pageSize = 10 } = query
      return {
        code: 200,
        rows: generateTickets(pageSize),
        total: 100
      }
    }
  },
  // CRUD完整Mock
  {
    url: '/business/ticket/assign',
    method: 'post',
    response: () => ({ code: 200, msg: '指派成功' })
  }
]