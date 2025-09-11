// src/mock/store.js
// Mock数据存储，使用localStorage实现持久化

class MockStore {
  constructor() {
    // 初始化时从localStorage读取数据
    this.loadFromStorage()
    
    // 如果没有数据，使用默认数据
    if (!this.tickets || this.tickets.length === 0) {
      this.tickets = [
        {
          ticketId: 1,
          ticketNo: 'TK202501001',
          title: '空调漏水处理',
          status: 'pending',
          priority: 'high',
          equipment: '空调01',
          reporter: '张三',
          assigneeName: null,
          specialty: 'hvac',
          location: '2楼机房',
          description: '空调内机漏水，地面有积水',
          createTime: '2024-01-20 10:00:00',
          deadline: '2024-01-21 10:00:00'
        },
        {
          ticketId: 2,
          ticketNo: 'TK202501002',
          title: 'UPS电池更换',
          status: 'processing',
          priority: 'medium',
          equipment: 'UPS-A',
          reporter: '王五',
          assigneeName: '赵六',
          specialty: 'power',
          location: '1楼配电室',
          description: 'UPS电池告警，需要更换',
          createTime: '2024-01-20 11:00:00',
          deadline: '2024-01-21 11:00:00'
        },
        {
          ticketId: 3,
          ticketNo: 'TK202501003',
          title: '消防系统检测',
          status: 'completed',
          priority: 'low',
          equipment: '烟感器',
          reporter: '李四',
          assigneeName: '钱七',
          specialty: 'fire',
          location: '3楼办公区',
          description: '烟感器误报，需要检查',
          createTime: '2024-01-19 09:00:00',
          deadline: '2024-01-20 09:00:00'
        }
      ]
      this.nextId = 4
      this.saveToStorage()
    }
    
    // 初始化其他数据
    this.inspections = this.inspections || []
    this.maintenances = this.maintenances || []
    this.nextInspectionId = this.nextInspectionId || 1
    this.nextMaintenanceId = this.nextMaintenanceId || 1
  }

  // 从localStorage加载数据
  loadFromStorage() {
    try {
      const data = localStorage.getItem('mockStore')
      if (data) {
        const parsed = JSON.parse(data)
        Object.assign(this, parsed)
      }
    } catch (error) {
      console.warn('加载Mock数据失败:', error)
    }
  }

  // 保存到localStorage
  saveToStorage() {
    try {
      const data = {
        tickets: this.tickets,
        nextId: this.nextId,
        inspections: this.inspections,
        nextInspectionId: this.nextInspectionId,
        maintenances: this.maintenances,
        nextMaintenanceId: this.nextMaintenanceId
      }
      localStorage.setItem('mockStore', JSON.stringify(data))
    } catch (error) {
      console.warn('保存Mock数据失败:', error)
    }
  }

  // ========== 工单相关方法 ==========
  
  // 获取工单列表（支持查询参数）
  getTickets(query = {}) {
    let result = [...this.tickets]
    
    // 应用过滤条件
    if (query.ticketNo) {
      result = result.filter(t => t.ticketNo.includes(query.ticketNo))
    }
    if (query.title) {
      result = result.filter(t => t.title.includes(query.title))
    }
    if (query.status) {
      result = result.filter(t => t.status === query.status)
    }
    if (query.priority) {
      result = result.filter(t => t.priority === query.priority)
    }
    
    // 分页
    const pageNum = query.pageNum || 1
    const pageSize = query.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    
    return {
      rows: result.slice(start, end),
      total: result.length
    }
  }

  // 获取单个工单
  getTicket(ticketId) {
    return this.tickets.find(t => t.ticketId === parseInt(ticketId))
  }

  // 添加工单
  addTicket(data) {
    const newTicket = {
      ...data,
      ticketId: this.nextId++,
      ticketNo: 'TK' + Date.now(),
      status: data.status || 'pending',
      createTime: new Date().toLocaleString(),
      deadline: new Date(Date.now() + 24*60*60*1000).toLocaleString()
    }
    this.tickets.push(newTicket)
    this.saveToStorage()
    return newTicket
  }

  // 更新工单
  updateTicket(data) {
    const index = this.tickets.findIndex(t => t.ticketId === data.ticketId)
    if (index > -1) {
      this.tickets[index] = { ...this.tickets[index], ...data }
      this.saveToStorage()
      return this.tickets[index]
    }
    return null
  }

  // 删除工单
  deleteTicket(ticketId) {
    const index = this.tickets.findIndex(t => t.ticketId === parseInt(ticketId))
    if (index > -1) {
      this.tickets.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  // 批量指派
  assignTickets(ticketIds, userId, userName) {
    ticketIds.forEach(id => {
      const ticket = this.tickets.find(t => t.ticketId === id)
      if (ticket) {
        ticket.assigneeId = userId
        ticket.assigneeName = userName
        ticket.status = 'assigned'
      }
    })
    this.saveToStorage()
    return true
  }

  // ========== 巡检相关方法 ==========
  
  // 获取巡检列表
  getInspections(query = {}) {
    let result = [...this.inspections]
    
    const pageNum = query.pageNum || 1
    const pageSize = query.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    
    return {
      rows: result.slice(start, end),
      total: result.length
    }
  }

  // 添加巡检
  addInspection(data) {
    const newInspection = {
      ...data,
      inspectionId: this.nextInspectionId++,
      inspectionNo: 'INS' + Date.now(),
      createTime: new Date().toLocaleString()
    }
    this.inspections.push(newInspection)
    this.saveToStorage()
    return newInspection
  }

  // ========== 维保相关方法 ==========
  
  // 获取维保列表
  getMaintenances(query = {}) {
    let result = [...this.maintenances]
    
    const pageNum = query.pageNum || 1
    const pageSize = query.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    
    return {
      rows: result.slice(start, end),
      total: result.length
    }
  }

  // 添加维保计划
  addMaintenance(data) {
    const newMaintenance = {
      ...data,
      planId: this.nextMaintenanceId++,
      planNo: 'MP' + Date.now(),
      createTime: new Date().toLocaleString()
    }
    this.maintenances.push(newMaintenance)
    this.saveToStorage()
    return newMaintenance
  }

  // 清空所有数据（开发调试用）
  clearAll() {
    this.tickets = []
    this.inspections = []
    this.maintenances = []
    this.nextId = 1
    this.nextInspectionId = 1
    this.nextMaintenanceId = 1
    localStorage.removeItem('mockStore')
  }

  // 重置为默认数据
  reset() {
    this.clearAll()
    this.constructor.call(this)
  }
}

// 创建单例实例
const mockStore = new MockStore()

// 开发环境下暴露到全局，方便调试
if (import.meta.env.DEV) {
  window.$mockStore = mockStore
  console.log('Mock Store 已初始化，可通过 window.$mockStore 访问')
}

export default mockStore