import Mock from 'mockjs'
import mockStore from './store'

// 设置延迟
Mock.setup({
  timeout: '200-600'
})

// 登录接口
Mock.mock('/dev-api/login', 'post', () => {
  console.log('Mock拦截：登录请求')
  return {
    code: 200,
    msg: '登录成功',
    token: 'mock-token-' + Date.now()
  }
})

// 获取用户信息
Mock.mock('/dev-api/getInfo', 'get', () => {
  console.log('Mock拦截：获取用户信息')
  return {
    code: 200,
    msg: '操作成功',
    user: {
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      avatar: '',
      roles: ['admin'],
      permissions: ['*:*:*']
    },
    roles: ['admin'],
    permissions: ['*:*:*']
  }
})

// 获取路由
Mock.mock('/dev-api/getRouters', 'get', () => {
  console.log('Mock拦截：获取路由')
  return {
    code: 200,
    msg: '操作成功',
    data: [
      {
        name: 'Business',
        path: '/business',
        hidden: false,
        redirect: '/business/ticket/list',
        component: 'Layout',
        alwaysShow: true,
        meta: { title: '业务管理', icon: 'monitor', noCache: false },
        children: [
          {
            name: 'Ticket',
            path: 'ticket',
            hidden: false,
            component: 'ParentView',
            meta: { title: '工单管理', icon: 'edit', noCache: false },
            children: [
              {
                name: 'TicketList',
                path: 'list',
                hidden: false,
                component: 'business/ticket/index',
                meta: { title: '工单列表', icon: 'edit', noCache: false }
              },
              {
                name: 'TicketDetail',
                path: 'detail/:ticketId',
                hidden: true,
                component: 'business/ticket/detail',
                meta: { title: '工单详情', icon: 'view', noCache: true, activeMenu: '/business/ticket/list' }
              },
              {
                name: 'TicketEdit',
                path: 'edit/:ticketId',
                hidden: true,
                component: 'business/ticket/index',
                meta: { title: '编辑工单', icon: 'edit', noCache: true, activeMenu: '/business/ticket/list' }
              }
            ]
          },
          {
            name: 'Inspection',
            path: 'inspection',
            hidden: false,
            component: 'business/inspection/index',
            meta: { title: '巡检管理', icon: 'list', noCache: false }
          },
          {
            name: 'InspectionCreate',
            path: 'inspection/create',
            hidden: true,
            component: 'business/inspection/create',
            meta: { title: '开始巡检', icon: 'form', noCache: true }
          },
          {
            name: 'InspectionEdit',
            path: 'inspection/edit/:inspectionId',
            hidden: true,
            component: 'business/inspection/edit',
            meta: { title: '继续巡检', icon: 'form', noCache: true }
          },
          {
            name: 'InspectionDetail',
            path: 'inspection/detail/:inspectionId',
            hidden: true,
            component: 'business/inspection/detail',
            meta: { title: '巡检详情', icon: 'view', noCache: true }
          },
          {
            name: 'Maintenance',
            path: 'maintenance',
            hidden: false,
            component: 'business/maintenance/plan/index',
            meta: { title: '维保管理', icon: 'tool', noCache: false }
          },
          {
            name: 'MaintenancePlanForm',
            path: 'maintenance/plan/form/:planId?',
            hidden: true,
            component: 'business/maintenance/plan/form',
            meta: { title: '维保计划表单', icon: 'form', noCache: true }
          },
          {
            name: 'MaintenancePlanDetail',
            path: 'maintenance/plan/detail/:planId',
            hidden: true,
            component: 'business/maintenance/plan/detail',
            meta: { title: '维保计划详情', icon: 'view', noCache: true }
          }
        ]
      }
    ]
  }
})

// 退出登录
Mock.mock('/dev-api/logout', 'post', () => {
  console.log('Mock拦截：退出登录')
  return {
    code: 200,
    msg: '退出成功'
  }
})

// ==================== 业务接口 ====================

// 辅助函数：解析URL参数
function parseQuery(url) {
  const query = {}
  const queryStr = url.split('?')[1]
  if (queryStr) {
    queryStr.split('&').forEach(param => {
      const [key, value] = param.split('=')
      query[key] = decodeURIComponent(value)
    })
  }
  return query
}

// 辅助函数：提取ID
function extractId(url) {
  const match = url.match(/\/(\d+)/)
  return match ? parseInt(match[1]) : null
}

// 工单列表
Mock.mock(RegExp('/dev-api/business/ticket/list.*'), 'get', (options) => {
  console.log('Mock拦截：工单列表')
  const query = parseQuery(options.url)
  const result = mockStore.getTickets(query)
  return {
    code: 200,
    msg: 'success',
    ...result
  }
})

// 获取单个工单
Mock.mock(RegExp('/dev-api/business/ticket/\\d+'), 'get', (options) => {
  const id = extractId(options.url)
  const ticket = mockStore.getTicket(id)
  return {
    code: 200,
    data: ticket || {
      ticketId: id,
      ticketNo: 'TK202501001',
      title: '空调漏水处理',
      description: '2楼机房空调内机漏水，需要紧急处理',
      status: 'pending',
      priority: 'high',
      equipment: '空调01',
      reporter: '张三',
      assigneeName: null,
      specialty: 'hvac'
    }
  }
})

// 新增工单
Mock.mock('/dev-api/business/ticket', 'post', (options) => {
  const data = JSON.parse(options.body)
  const newTicket = mockStore.addTicket(data)
  return {
    code: 200,
    msg: '新增成功',
    data: newTicket
  }
})

// 修改工单
Mock.mock('/dev-api/business/ticket', 'put', (options) => {
  const data = JSON.parse(options.body)
  const updatedTicket = mockStore.updateTicket(data)
  return {
    code: 200,
    msg: '修改成功',
    data: updatedTicket
  }
})

// 删除工单
Mock.mock(RegExp('/dev-api/business/ticket/\\d+'), 'delete', (options) => {
  const id = extractId(options.url)
  mockStore.deleteTicket(id)
  return {
    code: 200,
    msg: '删除成功'
  }
})

// 批量指派工单
Mock.mock('/dev-api/business/ticket/assign', 'post', (options) => {
  const { ticketIds, assigneeId } = JSON.parse(options.body)
  const userMap = {
    1: '张三',
    2: '李四',
    3: '王五'
  }
  mockStore.assignTickets(ticketIds, assigneeId, userMap[assigneeId] || '未知')
  return {
    code: 200,
    msg: '指派成功'
  }
})

// 巡检列表
Mock.mock(RegExp('/dev-api/business/inspection/list.*'), 'get', (options) => {
  console.log('Mock拦截：巡检列表')
  const query = parseQuery(options.url)
  const result = mockStore.getInspections(query)
  return {
    code: 200,
    msg: 'success',
    rows: result.rows.length > 0 ? result.rows : [
      {
        inspectionId: 1,
        inspectionNo: 'INS202501001',
        inspectionDate: '2024-01-20',
        floor: '1楼',
        inspectorName: '张三',
        relayPerson: '李四',
        anomalyCount: 2,
        ticketCount: 1,
        status: 'completed',
        createTime: '2024-01-20 08:00:00'
      }
    ],
    total: result.total || 1
  }
})

// 维保列表
Mock.mock(RegExp('/dev-api/business/maintenance/list.*'), 'get', (options) => {
  console.log('Mock拦截：维保列表')
  const query = parseQuery(options.url)
  const result = mockStore.getMaintenances(query)
  return {
    code: 200,
    msg: 'success',
    rows: result.rows.length > 0 ? result.rows : [
      {
        planId: 1,
        planNo: 'MP202501001',
        title: '月度维保计划',
        floor: '1',
        version: 'V1.0',
        mopCategory: 'monthly',
        approvalStatus: 'draft',
        executionStatus: 'pending',
        approverName: '王经理',
        createTime: '2024-01-15 10:00:00',
        nextExecutionTime: '2024-02-01 10:00:00'
      }
    ],
    total: result.total || 1
  }
})

// 维保计划详情（如果 business.js 中未覆盖）
Mock.mock(/\/dev-api\/business\/maintenance\/[0-9]+$/, 'get', (options) => {
  const id = options.url.split('/').pop()
  return {
    code: 200,
    msg: 'success',
    data: {
      planId: Number(id),
      planNo: 'MP' + id,
      title: 'Mock维保计划 ' + id,
      floor: '1',
      version: 'V1.0',
      mopCategory: 'monthly',
      executionCycle: { frequency: 1, unit: '月' },
      approvalStatus: 'draft',
      executionStatus: 'pending',
      approverName: '王经理',
      executorName: '李四',
      mopName: '设备巡检与保养',
      mopPurpose: '保持设备良好状态',
      tools: '扳手, 万用表',
      materials: '清洁剂',
      safety: '安全帽',
      specialTools: '压力表',
      steps: '1. 断电检查\n2. 拆检\n3. 清洁润滑\n4. 复位测试',
      inspectionResult: '-',
      remark: 'Mock 数据',
      createTime: '2024-01-15 10:00:00',
      nextExecutionTime: '2024-02-01 10:00:00',
      approvalHistory: [
        { id: 1, time: '2024-01-15 10:05:00', operatorName: '张三', action: 'submit', comment: '提交审核' }
      ]
    }
  }
})

// 审核人列表
Mock.mock('/dev-api/business/maintenance/approvers', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { userId: 1, userName: 'approver1', nickName: '审批1' },
      { userId: 2, userName: 'approver2', nickName: '审批2' }
    ]
  }
})

// 通知人列表
Mock.mock('/dev-api/business/maintenance/notifyUsers', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { userId: 3, userName: 'notify1', nickName: '通知1' },
      { userId: 4, userName: 'notify2', nickName: '通知2' }
    ]
  }
})

// 用户列表
Mock.mock(RegExp('/dev-api/system/user/list.*'), 'get', () => {
  return {
    code: 200,
    rows: [
      { userId: 1, nickName: '张三', userName: 'zhangsan' },
      { userId: 2, nickName: '李四', userName: 'lisi' },
      { userId: 3, nickName: '王五', userName: 'wangwu' }
    ],
    total: 3
  }
})

// 字典数据
Mock.mock(RegExp('/dev-api/system/dict/data/type/.*'), 'get', (options) => {
  const type = options.url.split('/').pop()
  const dictMap = {
    'ticket_status': [
      { dictLabel: '待处理', dictValue: 'pending', cssClass: 'warning' },
      { dictLabel: '已指派', dictValue: 'assigned', cssClass: 'primary' },
      { dictLabel: '处理中', dictValue: 'processing', cssClass: 'info' },
      { dictLabel: '已完成', dictValue: 'completed', cssClass: 'success' },
      { dictLabel: '已关闭', dictValue: 'closed', cssClass: 'default' }
    ],
    'ticket_priority': [
      { dictLabel: '高', dictValue: 'high', cssClass: 'danger' },
      { dictLabel: '中', dictValue: 'medium', cssClass: 'warning' },
      { dictLabel: '低', dictValue: 'low', cssClass: 'info' }
    ],
    'equipment_specialty': [
      { dictLabel: '暖通', dictValue: 'hvac' },
      { dictLabel: '配电', dictValue: 'power' },
      { dictLabel: '消防', dictValue: 'fire' },
      { dictLabel: '弱电', dictValue: 'weak' }
    ],
    'mop_category': [
      { dictLabel: '日常维护', dictValue: 'daily' },
      { dictLabel: '定期保养', dictValue: 'regular' },
      { dictLabel: '月度检修', dictValue: 'monthly' },
      { dictLabel: '季度检修', dictValue: 'quarterly' },
      { dictLabel: '年度检修', dictValue: 'annual' }
    ]
  }
  
  return {
    code: 200,
    data: dictMap[type] || []
  }
})

console.log('✅ Mock服务已启动，数据持久化已启用')
console.log('💡 提示：可使用 window.$mockStore 访问Mock数据存储')