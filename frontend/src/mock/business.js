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

// 工单详情
Mock.mock(/\/business\/ticket\/[0-9]+$/, 'get', (options) => {
  const id = options.url.split('/').pop()
  return {
    code: 200,
    msg: 'success',
    data: {
      ticketId: Number(id),
      ticketNo: 'TK' + id,
      title: '示例工单 ' + id,
      status: 'pending',
      priority: 'medium',
      equipment: '设备' + id,
      specialty: 'hvac',
      reporter: '张三',
      reporterPhone: '13800000000',
      createTime: Mock.Random.datetime(),
      discoveryTime: Mock.Random.datetime(),
      deadline: Mock.Random.datetime(),
      description: '这是一个用于演示的工单详情。',
      emergencyAction: '已断电',
      logs: [
        { createTime: Mock.Random.datetime(), userName: '系统', action: '创建工单', type: 'primary' },
        { createTime: Mock.Random.datetime(), userName: '张三', action: '提交描述', type: 'info' }
      ],
      attachments: [
        { name: '现场照片1.png', url: 'https://example.com/file1.png' }
      ]
    }
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

// 维保计划详情（避免 500 返回）
Mock.mock(/\/business\/maintenance\/[0-9]+$/, 'get', (options) => {
  const id = options.url.split('/').pop()
  return {
    code: 200,
    msg: 'success',
    data: {
      planId: Number(id),
      planNo: 'MP' + id,
      title: '示例维保计划 ' + id,
      floor: '1',
      version: 'V1.0',
      mopCategory: 'monthly',
      executionCycle: { frequency: 1, unit: '月' },
      approvalStatus: 'draft',
      executionStatus: 'pending',
      approverName: '王经理',
      executorName: '李四',
      mopName: '空调设备年度保养',
      mopPurpose: '保障空调系统稳定运行',
      tools: '扳手, 万用表',
      materials: '清洁剂',
      safety: '安全帽, 手套',
      specialTools: '压力测试仪',
      steps: '1. 断电\n2. 检查\n3. 清洁\n4. 恢复供电',
      inspectionResult: '-',
      remark: '示例数据',
      createTime: Mock.Random.datetime(),
      nextExecutionTime: Mock.Random.datetime(),
      approvalHistory: [
        { id: 1, time: Mock.Random.datetime(), operatorName: '张三', action: 'submit', comment: '提交审核' }
      ]
    }
  }
})