import Mock from 'mockjs'
import mockStore from './store'

// é€šè¿‡ç�¯å¢ƒå�˜é‡�æ�§åˆ¶ mock æ˜¯å�¦å�¯ç”¨ï¼ˆé»˜è®¤å�¯ç”¨ï¼‰
// åœ¨ .env.development.local ä¸­è®¾ç½® VITE_USE_MOCK=false å�¯å…³é—­
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
if (!useMock) {
  console.log('[Mock] å·²ç¦�ç”¨ (VITE_USE_MOCK=false)')
} else {

// è®¾ç½®å»¶è¿Ÿ
Mock.setup({
  timeout: '200-600'
})

// ç™»å½•æ�¥å�£
Mock.mock('/dev-api/login', 'post', () => {
  console.log('Mockæ‹¦æˆªï¼šç™»å½•è¯·æ±‚')
  return {
    code: 200,
    msg: 'ç™»å½•æˆ�åŠŸ',
    token: 'mock-token-' + Date.now()
  }
})

// è�·å�–ç”¨æˆ·ä¿¡æ�¯
Mock.mock('/dev-api/getInfo', 'get', () => {
  console.log('Mockæ‹¦æˆªï¼šè�·å�–ç”¨æˆ·ä¿¡æ�¯')
  return {
    code: 200,
    msg: 'æ“�ä½œæˆ�åŠŸ',
    user: {
      userId: 1,
      userName: 'admin',
      nickName: 'ç®¡ç�†å‘˜',
      avatar: '',
      roles: ['admin'],
      permissions: ['*:*:*']
    },
    roles: ['admin'],
    permissions: ['*:*:*']
  }
})

// è�·å�–è·¯ç”±
Mock.mock('/dev-api/getRouters', 'get', () => {
  console.log('Mockæ‹¦æˆªï¼šè�·å�–è·¯ç”±')
  return {
    code: 200,
    msg: 'æ“�ä½œæˆ�åŠŸ',
    data: [
      {
        name: 'Business',
        path: '/business',
        hidden: false,
        redirect: '/business/ticket/list',
        component: 'Layout',
        alwaysShow: true,
        meta: { title: 'ä¸šåŠ¡ç®¡ç�†', icon: 'monitor', noCache: false },
        children: [
          {
            name: 'Ticket',
            path: 'ticket',
            hidden: false,
            component: 'ParentView',
            meta: { title: 'å·¥å�•ç®¡ç�†', icon: 'edit', noCache: false },
            children: [
              {
                name: 'TicketList',
                path: 'list',
                hidden: false,
                component: 'business/ticket/index',
                meta: { title: 'å·¥å�•åˆ—è¡¨', icon: 'edit', noCache: false }
              },
              {
                name: 'TicketDetail',
                path: 'detail/:ticketId',
                hidden: true,
                component: 'business/ticket/detail',
                meta: { title: 'å·¥å�•è¯¦æƒ…', icon: 'view', noCache: true, activeMenu: '/business/ticket/list' }
              },
              {
                name: 'TicketEdit',
                path: 'edit/:ticketId',
                hidden: true,
                component: 'business/ticket/index',
                meta: { title: 'ç¼–è¾‘å·¥å�•', icon: 'edit', noCache: true, activeMenu: '/business/ticket/list' }
              }
            ]
          },
          {
            name: 'Inspection',
            path: 'inspection',
            hidden: false,
            component: 'business/inspection/index',
            meta: { title: 'å·¡æ£€ç®¡ç�†', icon: 'list', noCache: false }
          },
          {
            name: 'InspectionCreate',
            path: 'inspection/create',
            hidden: true,
            component: 'business/inspection/create',
            meta: { title: 'å¼€å§‹å·¡æ£€', icon: 'form', noCache: true }
          },
          {
            name: 'InspectionEdit',
            path: 'inspection/edit/:inspectionId',
            hidden: true,
            component: 'business/inspection/edit',
            meta: { title: 'ç»§ç»­å·¡æ£€', icon: 'form', noCache: true }
          },
          {
            name: 'InspectionDetail',
            path: 'inspection/detail/:inspectionId',
            hidden: true,
            component: 'business/inspection/detail',
            meta: { title: 'å·¡æ£€è¯¦æƒ…', icon: 'view', noCache: true }
          },
          {
            name: 'Maintenance',
            path: 'maintenance',
            hidden: false,
            component: 'business/maintenance/plan/index',
            meta: { title: 'ç»´ä¿�ç®¡ç�†', icon: 'tool', noCache: false }
          },
          {
            name: 'MaintenancePlanForm',
            path: 'maintenance/plan/form/:planId?',
            hidden: true,
            component: 'business/maintenance/plan/form',
            meta: { title: 'ç»´ä¿�è®¡åˆ’è¡¨å�•', icon: 'form', noCache: true }
          },
          {
            name: 'MaintenancePlanDetail',
            path: 'maintenance/plan/detail/:planId',
            hidden: true,
            component: 'business/maintenance/plan/detail',
            meta: { title: 'ç»´ä¿�è®¡åˆ’è¯¦æƒ…', icon: 'view', noCache: true }
          }
        ]
      }
    ]
  }
})

// é€€å‡ºç™»å½•
Mock.mock('/dev-api/logout', 'post', () => {
  console.log('Mockæ‹¦æˆªï¼šé€€å‡ºç™»å½•')
  return {
    code: 200,
    msg: 'é€€å‡ºæˆ�åŠŸ'
  }
})

// ==================== ä¸šåŠ¡æ�¥å�£ ====================

// è¾…åŠ©å‡½æ•°ï¼šè§£æ��URLå�‚æ•°
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

// è¾…åŠ©å‡½æ•°ï¼šæ��å�–ID
function extractId(url) {
  const match = url.match(/\/(\d+)/)
  return match ? parseInt(match[1]) : null
}

// å·¥å�•åˆ—è¡¨
Mock.mock(RegExp('/dev-api/business/ticket/list.*'), 'get', (options) => {
  console.log('Mockæ‹¦æˆªï¼šå·¥å�•åˆ—è¡¨')
  const query = parseQuery(options.url)
  const result = mockStore.getTickets(query)
  return {
    code: 200,
    msg: 'success',
    ...result
  }
})

// è�·å�–å�•ä¸ªå·¥å�•
Mock.mock(RegExp('/dev-api/business/ticket/\\d+'), 'get', (options) => {
  const id = extractId(options.url)
  const ticket = mockStore.getTicket(id)
  return {
    code: 200,
    data: ticket || {
      ticketId: id,
      ticketNo: 'TK202501001',
      title: 'ç©ºè°ƒæ¼�æ°´å¤„ç�†',
      description: '2æ¥¼æœºæˆ¿ç©ºè°ƒå†…æœºæ¼�æ°´ï¼Œéœ€è¦�ç´§æ€¥å¤„ç�†',
      status: 'pending',
      priority: 'high',
      equipment: 'ç©ºè°ƒ01',
      reporter: 'å¼ ä¸‰',
      assigneeName: null,
      specialty: 'hvac'
    }
  }
})

// æ–°å¢�å·¥å�•
Mock.mock('/dev-api/business/ticket', 'post', (options) => {
  const data = JSON.parse(options.body)
  const newTicket = mockStore.addTicket(data)
  return {
    code: 200,
    msg: 'æ–°å¢�æˆ�åŠŸ',
    data: newTicket
  }
})

// ä¿®æ”¹å·¥å�•
Mock.mock('/dev-api/business/ticket', 'put', (options) => {
  const data = JSON.parse(options.body)
  const updatedTicket = mockStore.updateTicket(data)
  return {
    code: 200,
    msg: 'ä¿®æ”¹æˆ�åŠŸ',
    data: updatedTicket
  }
})

// åˆ é™¤å·¥å�•
Mock.mock(RegExp('/dev-api/business/ticket/\\d+'), 'delete', (options) => {
  const id = extractId(options.url)
  mockStore.deleteTicket(id)
  return {
    code: 200,
    msg: 'åˆ é™¤æˆ�åŠŸ'
  }
})

// æ‰¹é‡�æŒ‡æ´¾å·¥å�•
Mock.mock('/dev-api/business/ticket/assign', 'post', (options) => {
  const { ticketIds, assigneeId } = JSON.parse(options.body)
  const userMap = {
    1: 'å¼ ä¸‰',
    2: 'æ��å››',
    3: 'ç�‹äº”'
  }
  mockStore.assignTickets(ticketIds, assigneeId, userMap[assigneeId] || 'æœªçŸ¥')
  return {
    code: 200,
    msg: 'æŒ‡æ´¾æˆ�åŠŸ'
  }
})

// å·¡æ£€åˆ—è¡¨
Mock.mock(RegExp('/dev-api/business/inspection/list.*'), 'get', (options) => {
  console.log('Mockæ‹¦æˆªï¼šå·¡æ£€åˆ—è¡¨')
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
        floor: '1æ¥¼',
        inspectorName: 'å¼ ä¸‰',
        relayPerson: 'æ��å››',
        anomalyCount: 2,
        ticketCount: 1,
        status: 'completed',
        createTime: '2024-01-20 08:00:00'
      }
    ],
    total: result.total || 1
  }
})

// ç»´ä¿�åˆ—è¡¨
Mock.mock(RegExp('/dev-api/business/maintenance/list.*'), 'get', (options) => {
  console.log('Mockæ‹¦æˆªï¼šç»´ä¿�åˆ—è¡¨')
  const query = parseQuery(options.url)
  const result = mockStore.getMaintenances(query)
  return {
    code: 200,
    msg: 'success',
    rows: result.rows.length > 0 ? result.rows : [
      {
        planId: 1,
        planNo: 'MP202501001',
        title: 'æœˆåº¦ç»´ä¿�è®¡åˆ’',
        floor: '1',
        version: 'V1.0',
        mopCategory: 'monthly',
        approvalStatus: 'draft',
        executionStatus: 'pending',
        approverName: 'ç�‹ç»�ç�†',
        createTime: '2024-01-15 10:00:00',
        nextExecutionTime: '2024-02-01 10:00:00'
      }
    ],
    total: result.total || 1
  }
})

// ç»´ä¿�è®¡åˆ’è¯¦æƒ…ï¼ˆå¦‚æ�œ business.js ä¸­æœªè¦†ç›–ï¼‰
Mock.mock(/\/dev-api\/business\/maintenance\/[0-9]+$/, 'get', (options) => {
  const id = options.url.split('/').pop()
  return {
    code: 200,
    msg: 'success',
    data: {
      planId: Number(id),
      planNo: 'MP' + id,
      title: 'Mockç»´ä¿�è®¡åˆ’ ' + id,
      floor: '1',
      version: 'V1.0',
      mopCategory: 'monthly',
      executionCycle: { frequency: 1, unit: 'æœˆ' },
      approvalStatus: 'draft',
      executionStatus: 'pending',
      approverName: 'ç�‹ç»�ç�†',
      executorName: 'æ��å››',
      mopName: 'è®¾å¤‡å·¡æ£€ä¸�ä¿�å…»',
      mopPurpose: 'ä¿�æŒ�è®¾å¤‡è‰¯å¥½çŠ¶æ€�',
      tools: 'æ‰³æ‰‹, ä¸‡ç”¨è¡¨',
      materials: 'æ¸…æ´�å‰‚',
      safety: 'å®‰å…¨å¸½',
      specialTools: 'å�‹åŠ›è¡¨',
      steps: '1. æ–­ç”µæ£€æŸ¥\n2. æ‹†æ£€\n3. æ¸…æ´�æ¶¦æ»‘\n4. å¤�ä½�æµ‹è¯•',
      inspectionResult: '-',
      remark: 'Mock æ•°æ�®',
      createTime: '2024-01-15 10:00:00',
      nextExecutionTime: '2024-02-01 10:00:00',
      approvalHistory: [
        { id: 1, time: '2024-01-15 10:05:00', operatorName: 'å¼ ä¸‰', action: 'submit', comment: 'æ��äº¤å®¡æ ¸' }
      ]
    }
  }
})

// å®¡æ ¸äººåˆ—è¡¨
Mock.mock('/dev-api/business/maintenance/approvers', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { userId: 1, userName: 'approver1', nickName: 'å®¡æ‰¹1' },
      { userId: 2, userName: 'approver2', nickName: 'å®¡æ‰¹2' }
    ]
  }
})

// é€šçŸ¥äººåˆ—è¡¨
Mock.mock('/dev-api/business/maintenance/notifyUsers', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { userId: 3, userName: 'notify1', nickName: 'é€šçŸ¥1' },
      { userId: 4, userName: 'notify2', nickName: 'é€šçŸ¥2' }
    ]
  }
})

// ç”¨æˆ·åˆ—è¡¨
Mock.mock(RegExp('/dev-api/system/user/list.*'), 'get', () => {
  return {
    code: 200,
    rows: [
      { userId: 1, nickName: 'å¼ ä¸‰', userName: 'zhangsan' },
      { userId: 2, nickName: 'æ��å››', userName: 'lisi' },
      { userId: 3, nickName: 'ç�‹äº”', userName: 'wangwu' }
    ],
    total: 3
  }
})

// å­—å…¸æ•°æ�®
Mock.mock(RegExp('/dev-api/system/dict/data/type/.*'), 'get', (options) => {
  const type = options.url.split('/').pop()
  const dictMap = {
    'ticket_status': [
      { dictLabel: 'å¾…å¤„ç�†', dictValue: 'pending', cssClass: 'warning' },
      { dictLabel: 'å·²æŒ‡æ´¾', dictValue: 'assigned', cssClass: 'primary' },
      { dictLabel: 'å¤„ç�†ä¸­', dictValue: 'processing', cssClass: 'info' },
      { dictLabel: 'å·²å®Œæˆ�', dictValue: 'completed', cssClass: 'success' },
      { dictLabel: 'å·²å…³é—­', dictValue: 'closed', cssClass: 'default' }
    ],
    'ticket_priority': [
      { dictLabel: 'é«˜', dictValue: 'high', cssClass: 'danger' },
      { dictLabel: 'ä¸­', dictValue: 'medium', cssClass: 'warning' },
      { dictLabel: 'ä½�', dictValue: 'low', cssClass: 'info' }
    ],
    'equipment_specialty': [
      { dictLabel: 'æš–é€š', dictValue: 'hvac' },
      { dictLabel: 'é…�ç”µ', dictValue: 'power' },
      { dictLabel: 'æ¶ˆé˜²', dictValue: 'fire' },
      { dictLabel: 'å¼±ç”µ', dictValue: 'weak' }
    ],
    'mop_category': [
      { dictLabel: 'æ—¥å¸¸ç»´æŠ¤', dictValue: 'daily' },
      { dictLabel: 'å®šæœŸä¿�å…»', dictValue: 'regular' },
      { dictLabel: 'æœˆåº¦æ£€ä¿®', dictValue: 'monthly' },
      { dictLabel: 'å­£åº¦æ£€ä¿®', dictValue: 'quarterly' },
      { dictLabel: 'å¹´åº¦æ£€ä¿®', dictValue: 'annual' }
    ]
  }
  
  return {
    code: 200,
    data: dictMap[type] || []
  }
})

console.log('âœ… Mockæœ�åŠ¡å·²å�¯åŠ¨ï¼Œæ•°æ�®æŒ�ä¹…åŒ–å·²å�¯ç”¨')
console.log('ğŸ’¡ æ��ç¤ºï¼šå�¯ä½¿ç”¨ window.$mockStore è®¿é—®Mockæ•°æ�®å­˜å‚¨')
}