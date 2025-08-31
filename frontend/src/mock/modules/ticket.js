// src/mock/modules/ticket.js
function generateTickets(size) {
  return Array.from({ length: Number(size) }, (_, i) => ({
    ticketId: i + 1,
    title: `Mock 工单 #${i + 1}`,
    status: 'open',
    priority: ['low', 'medium', 'high'][i % 3],
    createTime: new Date(Date.now() - i * 3600_000).toISOString()
  }))
}

export default [
  {
    url: '/business/ticket/list',
    method: 'get',
    response: ({ query }) => {
      const { pageSize = 10 } = query
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