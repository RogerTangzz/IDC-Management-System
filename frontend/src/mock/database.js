// src/mock/database.js
class MockDatabase {
  constructor() {
    this.tickets = JSON.parse(localStorage.getItem('mock_tickets') || '[]')
  }
  
  saveTicket(ticket) {
    this.tickets.push(ticket)
    localStorage.setItem('mock_tickets', JSON.stringify(this.tickets))
    return ticket
  }
  
  getTickets(query) {
    // 支持分页、筛选
    return this.tickets.slice((query.pageNum - 1) * query.pageSize, query.pageNum * query.pageSize)
  }
}

export default new MockDatabase()