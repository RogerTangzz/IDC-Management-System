基于当前项目进展，这是更新后的 **CLAUDE-IDC.md v2.2**（同步 TS 迁移与登录兼容策略）：

```markdown
# CLAUDE-IDC.md — IDC运维管理系统开发扩展规范 v2.2

版本: 2.2.0
基础规范: CLAUDE.md v2.3
适用项目: IDC运维管理系统（基于RuoYi-Vue3）
核心目标: 将业务逻辑精准映射到RuoYi规范的技术实现
更新日期: 2025-08-31

本版新增：Auth / Permission Store TypeScript 迁移、登录/用户信息接口兼容指引、Mock 启用策略、模块状态刷新、测试与类型治理路线。

---

## -1. 2.2 版本增量速览
| 范畴 | 更新 | 动作建议 |
|------|------|----------|
| 登录流程 | 兼容顶层 token 与 data.token | 后端统一后移除兼容分支 |
| 用户信息 | 兼容顶层 user/roles 与 data.user | 统一返回 data 包裹 |
| Store | user / permission 已迁移 TS | 新增 store 统一使用泛型 State 接口 |
| Mock 策略 | 暂集中导入；计划 env 控制 | 添加 VITE_ENABLE_MOCK 开关 |
| 模块状态 | ticket/inspection 核心可用 | maintenance 优先补齐导入/审批流 |
| 测试 | 基线覆盖 permission + 动态加载 | 新增 login / getInfo 断言 |
| 类型治理 | 暂有内联 DTO | 抽离到 src/types/api 与 domain |

---

## 0. 快速导航与开发状态

### 0.1 模块开发优先级与状态（刷新）
```javascript
const moduleStatus = {
  // P0 核心模块
  ticket: {
    priority: 'P0',
    api: '✅ 已转换为RuoYi规范 + 补充assignTickets',
    list: '✅ index.vue已完成',
    form: '⚠️ 编码问题已修复，待功能验证',
    detail: '⚠️ 编码问题已修复，待功能验证',
    template: '⏳ 待开发'
  },
  inspection: {
    priority: 'P0',
    api: '✅ 接口规范已定义 + generateTickets',
    create: '✅ create.vue 已完成',
    list: '✅ 列表渲染通过基本校验',
    detail: '⏳ 待开发',
    constants: '✅ 56项配置完整'
  },
  // P1 重要模块
  maintenance: {
    priority: 'P1',
    api: '✅ 已转换为RuoYi规范',
    list: '⚠️ 编码问题已修复，导入错误待修复',
    form: '⏳ 待修改',
    approval: '⏳ 待修改',
    execution: '⏳ 待修改'
  },
  asset: {
    priority: 'P1',
    api: '❌ 未开始',
    list: '❌ 未开始',
    form: '❌ 未开始'
  },
  // P2 支撑模块
  knowledge: { priority: 'P2', status: '❌ 未开始' },
  notification: { priority: 'P2', status: '❌ 未开始' },
  report: { priority: 'P2', status: '❌ 未开始' }
}
```

### 0.2 业务功能映射表（RuoYi规范）
| 业务模块 | 前端路由 | API前缀 | 实际位置 | 权限标识前缀 |
|---------|---------|---------|---------|-------------|
| 工单管理 | /business/ticket | /business/ticket | views/business/ticket | business:ticket: |
| 巡检管理 | /business/inspection | /business/inspection | views/business/inspection | business:inspection: |
| 维保计划 | /business/maintenance | /business/maintenance | views/business/maintenance | business:maintenance: |
| 资产管理 | /business/asset | /business/asset | views/business/asset | business:asset: |
| 知识库 | /business/knowledge | /business/knowledge | views/business/knowledge | business:knowledge: |

### 0.3 当前问题追踪（更新）
```javascript
const currentIssues = {
  resolved: [
    '✅ 文件编码问题 - 已转换为UTF-8',
    '✅ Controller冲突 - 已删除system包下的重复Controller',
    '✅ 路由配置 - 已修复并添加图标',
    '✅ 业务服务启动 - 三大服务正常运行'
  ],
  pending: [
    '⚠️ 维保模块导入错误 - maintenance import 仍需校验真实接口',
    '⚠️ 登录 / getInfo 后端结构未统一 (需统一 data 包裹)',
    '⏳ 后端业务 Controller & Service 待实现',
    '⏳ 数据库业务表 + 索引部署脚本待执行'
  ]
}
```

### 0.4 测试用例优先级 (新增)
```
P0: 登录(token 解析两种结构) / getInfo 顶层与 data 包裹 / 动态路由保留公共路由 / 权限过滤（含无权限路由）
P1: 工单指派 assignTickets 成功/失败 / 巡检生成工单 generateTickets
P2: 维保计划审批流（草稿→待审核→已批准→执行中→已完成）状态机正确性
```

## 1. 业务领域模型定义

### 1.0 类型与数据契约策略 (新增)
| 分类 | 存放目录 | 说明 |
|------|----------|------|
| 后端响应包装 | `types/api/common.ts` | ApiResult / PageResult |
| 认证相关 | `types/api/auth.ts` | LoginResp / extractToken |
| 领域实体 | `types/domain/*.ts` | Ticket / Inspection / MaintenancePlan |
| 复合表单 DTO | `types/dto/*.ts` | FilterForm / EditPayload |
| 临时兼容 | 不允许新建（集中迁移） | 逐步消除 inline interface |

### 1.1 核心实体关系
```javascript
// 实体关系图
const entityRelations = {
  User: {
    hasMany: ['Ticket', 'Inspection', 'MaintenancePlan'],
    belongsTo: ['Role', 'Dept']
  },
  Ticket: {
    belongsTo: ['User', 'Asset', 'Inspection'],
    hasMany: ['TicketLog', 'Attachment'],
    hasOne: ['TicketTemplate'],
    status: ['pending', 'assigned', 'processing', 'completed', 'closed']
  },
  Inspection: {
    belongsTo: ['User'],
    hasMany: ['InspectionItem', 'Ticket'], // 异常自动生成工单
    floors: {
      floor1: '22项',
      floor2: '18项',
      floor3: '13项',
      floor4: '3项',
      total: '56项'
    }
  },
  MaintenancePlan: {
    belongsTo: ['User'],
    hasMany: ['MaintenanceExecution', 'Notification'],
    status: ['draft', 'pending', 'approved', 'rejected', 'executing', 'completed']
  }
}
```

### 1.2 状态机定义
```javascript
// 工单状态流转
export const TICKET_STATUS = {
  PENDING: { value: 'pending', label: '待处理', color: 'warning', next: ['assigned'] },
  ASSIGNED: { value: 'assigned', label: '已指派', color: 'primary', next: ['processing'] },
  PROCESSING: { value: 'processing', label: '处理中', color: '', next: ['completed'] },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success', next: ['closed'] },
  CLOSED: { value: 'closed', label: '已关闭', color: 'info', next: [] }
}

// 维保计划审核状态
export const MAINTENANCE_STATUS = {
  DRAFT: { value: 'draft', label: '草稿', color: 'info', next: ['pending'] },
  PENDING: { value: 'pending', label: '待审核', color: 'warning', next: ['approved', 'rejected'] },
  APPROVED: { value: 'approved', label: '已批准', color: 'success', next: ['executing'] },
  REJECTED: { value: 'rejected', label: '已拒绝', color: 'danger', next: ['draft'] },
  EXECUTING: { value: 'executing', label: '执行中', color: 'primary', next: ['completed'] },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success', next: [] }
}
```

## 2. RuoYi规范API实现（完整版）

### 2.1 工单模块API（完整版）
```javascript
// src/api/business/ticket.js
import request from '@/utils/request'

// 标准CRUD
export function listTicket(query) {
  return request({
    url: '/business/ticket/list',
    method: 'get',
    params: query
  })
}

export function getTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'get'
  })
}

export function addTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'post',
    data: data
  })
}

export function updateTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'put',
    data: data
  })
}

export function delTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'delete'
  })
}

export function exportTicket(query) {
  return request({
    url: '/business/ticket/export',
    method: 'get',
    params: query
  })
}

// 特殊业务操作
export function assignTickets(data) {
  return request({
    url: '/business/ticket/assign',
    method: 'post',
    data: data
  })
}

export function changeTicketStatus(ticketId, status) {
  return request({
    url: '/business/ticket/' + ticketId + '/status',
    method: 'put',
    data: { status }
  })
}

export function getOverdueTickets() {
  return request({
    url: '/business/ticket/overdue',
    method: 'get'
  })
}

export function getTicketTemplate(templateId) {
  return request({
    url: '/business/ticket/template/' + templateId,
    method: 'get'
  })
}
```

### 2.2 巡检模块API（完整版）
```javascript
// src/api/business/inspection.js
import request from '@/utils/request'

// 标准CRUD
export function listInspection(query) {
  return request({
    url: '/business/inspection/list',
    method: 'get',
    params: query
  })
}

export function getInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId,
    method: 'get'
  })
}

export function addInspection(data) {
  return request({
    url: '/business/inspection',
    method: 'post',
    data: data
  })
}

export function updateInspection(data) {
  return request({
    url: '/business/inspection',
    method: 'put',
    data: data
  })
}

export function delInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId,
    method: 'delete'
  })
}

export function exportInspection(query) {
  return request({
    url: '/business/inspection/export',
    method: 'get',
    params: query
  })
}

// 特殊业务操作
export function getLatestInspection() {
  return request({
    url: '/business/inspection/latest',
    method: 'get'
  })
}

export function generateTickets(inspectionId, anomalies) {
  return request({
    url: '/business/inspection/generateTickets',
    method: 'post',
    data: { inspectionId, anomalies }
  })
}

export function copyInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId + '/copy',
    method: 'post'
  })
}

export function getInspectionStatistics(params) {
  return request({
    url: '/business/inspection/statistics',
    method: 'get',
    params: params
  })
}
```

### 2.3 维保模块API（完整版）
```javascript
// src/api/business/maintenance.js
import request from '@/utils/request'

// 标准CRUD
export function listMaintenance(query) {
  return request({
    url: '/business/maintenance/list',
    method: 'get',
    params: query
  })
}

export function getMaintenance(planId) {
  return request({
    url: '/business/maintenance/' + planId,
    method: 'get'
  })
}

export function addMaintenance(data) {
  return request({
    url: '/business/maintenance',
    method: 'post',
    data: data
  })
}

export function updateMaintenance(data) {
  return request({
    url: '/business/maintenance',
    method: 'put',
    data: data
  })
}

export function delMaintenance(planId) {
  return request({
    url: '/business/maintenance/' + planId,
    method: 'delete'
  })
}

export function exportMaintenance(query) {
  return request({
    url: '/business/maintenance/export',
    method: 'get',
    params: query
  })
}

// 特殊业务操作
export function getLatestPlan() {
  return request({
    url: '/business/maintenance/latest',
    method: 'get'
  })
}

export function copyLastPlan(planId) {
  return request({
    url: '/business/maintenance/' + planId + '/copy',
    method: 'post'
  })
}

export function submitApproval(planId, approverId) {
  return request({
    url: `/business/maintenance/${planId}/submit`,
    method: 'post',
    data: { approverId }
  })
}

export function approvePlan(planId, comment) {
  return request({
    url: `/business/maintenance/${planId}/approve`,
    method: 'post',
    data: { comment }
  })
}

export function rejectPlan(planId, comment) {
  return request({
    url: `/business/maintenance/${planId}/reject`,
    method: 'post',
    data: { comment }
  })
}

export function startExecution(planId) {
  return request({
    url: `/business/maintenance/${planId}/execute`,
    method: 'post'
  })
}

export function generateTicket(planId) {
  return request({
    url: `/business/maintenance/${planId}/ticket`,
    method: 'post'
  })
}

export function getApproverList() {
  return request({
    url: '/business/maintenance/approvers',
    method: 'get'
  })
}
```

### 2.4 登录 / 用户信息接口兼容说明 (新增)
```
现状：
- /login: { code, msg, token } 或 { code, msg, data: { token } }
- /getInfo: { code, msg, user, roles, permissions } 或 { code, msg, data: { user, roles, permissions } }

前端已在 user store 中做兼容：
- 登录：token = resp.token ?? resp.data?.token
- 用户信息：payload = resp.data?.user ? resp.data : resp

后端统一目标：均返回 data 包裹（计划 v2.3.1 之后移除兼容逻辑）
```

## 3. 巡检核心配置（56项完整配置）

[保持原有的56项配置不变]

## 4. 数据模型定义（增强版）

### 4.1 数据库表结构
[保持原有的表结构，添加索引优化]

```sql
-- 添加索引优化查询性能
ALTER TABLE `biz_ticket` ADD INDEX `idx_status` (`status`);
ALTER TABLE `biz_ticket` ADD INDEX `idx_assignee` (`assignee_id`);
ALTER TABLE `biz_ticket` ADD INDEX `idx_create_time` (`create_time`);

ALTER TABLE `biz_inspection` ADD INDEX `idx_inspection_date` (`inspection_date`);
ALTER TABLE `biz_inspection` ADD INDEX `idx_inspector` (`inspector_name`);

ALTER TABLE `biz_maintenance` ADD INDEX `idx_approval_status` (`approval_status`);
ALTER TABLE `biz_maintenance` ADD INDEX `idx_next_execution` (`next_execution_time`);
```

### 4.2 数据字典配置（完整版）
```javascript
const dictionaries = {
  // 工单状态
  'ticket_status': [
    { dictLabel: '待处理', dictValue: 'pending', dictSort: 1, cssClass: 'warning' },
    { dictLabel: '已指派', dictValue: 'assigned', dictSort: 2, cssClass: 'primary' },
    { dictLabel: '处理中', dictValue: 'processing', dictSort: 3, cssClass: 'info' },
    { dictLabel: '已完成', dictValue: 'completed', dictSort: 4, cssClass: 'success' },
    { dictLabel: '已关闭', dictValue: 'closed', dictSort: 5, cssClass: 'default' }
  ],
  // 工单优先级
  'ticket_priority': [
    { dictLabel: '紧急', dictValue: 'critical', dictSort: 1, cssClass: 'danger' },
    { dictLabel: '高', dictValue: 'high', dictSort: 2, cssClass: 'warning' },
    { dictLabel: '中', dictValue: 'medium', dictSort: 3, cssClass: 'primary' },
    { dictLabel: '低', dictValue: 'low', dictSort: 4, cssClass: 'info' }
  ],
  // 设备专业
  'equipment_specialty': [
    { dictLabel: '暖通', dictValue: 'hvac', dictSort: 1 },
    { dictLabel: '配电', dictValue: 'power', dictSort: 2 },
    { dictLabel: '消防', dictValue: 'fire', dictSort: 3 },
    { dictLabel: '弱电', dictValue: 'weak', dictSort: 4 },
    { dictLabel: 'UPS', dictValue: 'ups', dictSort: 5 },
    { dictLabel: '监控', dictValue: 'monitor', dictSort: 6 }
  ],
  // MOP类别
  'mop_category': [
    { dictLabel: '日常维护', dictValue: 'daily', dictSort: 1 },
    { dictLabel: '周期保养', dictValue: 'regular', dictSort: 2 },
    { dictLabel: '月度检修', dictValue: 'monthly', dictSort: 3 },
    { dictLabel: '季度检修', dictValue: 'quarterly', dictSort: 4 },
    { dictLabel: '年度检修', dictValue: 'annual', dictSort: 5 },
    { dictLabel: '应急维修', dictValue: 'emergency', dictSort: 6 }
  ],
  // 审批状态
  'approval_status': [
    { dictLabel: '草稿', dictValue: 'draft', dictSort: 1, cssClass: 'info' },
    { dictLabel: '待审核', dictValue: 'pending', dictSort: 2, cssClass: 'warning' },
    { dictLabel: '已批准', dictValue: 'approved', dictSort: 3, cssClass: 'success' },
    { dictLabel: '已拒绝', dictValue: 'rejected', dictSort: 4, cssClass: 'danger' }
  ],
  // 执行状态
  'execution_status': [
    { dictLabel: '待执行', dictValue: 'pending', dictSort: 1, cssClass: 'warning' },
    { dictLabel: '执行中', dictValue: 'executing', dictSort: 2, cssClass: 'primary' },
    { dictLabel: '已完成', dictValue: 'completed', dictSort: 3, cssClass: 'success' },
    { dictLabel: '已取消', dictValue: 'cancelled', dictSort: 4, cssClass: 'info' }
  ]
}
```

## 5. 业务服务实现（优化版）

### 5.1 服务管理器
```javascript
// src/utils/business/serviceManager.js
import TicketEscalationService from './ticketEscalation'
import InspectionAnomalyService from './inspectionAnomaly'
import MaintenanceReminderService from './maintenanceReminder'

class ServiceManager {
  constructor() {
    this.services = {
      ticketEscalation: TicketEscalationService,
      inspectionAnomaly: InspectionAnomalyService,
      maintenanceReminder: MaintenanceReminderService
    }
    this.running = new Set()
  }
  
  start(serviceName) {
    if (this.services[serviceName] && !this.running.has(serviceName)) {
      this.services[serviceName].start()
      this.running.add(serviceName)
      console.log(`[ServiceManager] ${serviceName} 服务已启动`)
    }
  }
  
  stop(serviceName) {
    if (this.services[serviceName] && this.running.has(serviceName)) {
      this.services[serviceName].stop()
      this.running.delete(serviceName)
      console.log(`[ServiceManager] ${serviceName} 服务已停止`)
    }
  }
  
  startAll() {
    Object.keys(this.services).forEach(name => this.start(name))
  }
  
  stopAll() {
    this.running.forEach(name => this.stop(name))
  }
  
  getStatus() {
    return {
      services: Object.keys(this.services),
      running: Array.from(this.running),
      stopped: Object.keys(this.services).filter(s => !this.running.has(s))
    }
  }
}

export default new ServiceManager()
```

### 5.2 服务测试策略 (新增)
| 服务 | 关键行为 | 测试点 |
|------|----------|--------|
| ticketEscalation | 逾期扫描 | 模拟不同优先级与时间边界 |
| inspectionAnomaly | 异常→工单生成 | 多异常合并生成次数 |
| maintenanceReminder | 即将到期提醒 | Cron 触发窗口正确性 |


[其他章节保持原有内容，根据需要更新状态]

## 7. 开发任务清单（更新版）

### 7.1 已完成任务
```javascript
const completedTasks = [
  {
    module: 'environment',
    task: '文件编码转换UTF-8',
    completedDate: '2024-08-30'
  },
  {
    module: 'backend',
    task: '删除重复Controller',
    completedDate: '2024-08-30'
  },
  {
    module: 'api',
    task: '补充缺失的API函数',
    completedDate: '2024-08-30'
  },
  {
    module: 'service',
    task: '业务服务启动验证',
    completedDate: '2024-08-30'
  }
]
```

### 7.2 待完成任务
```javascript
const pendingTasks = [
  {
    module: 'maintenance',
    task: '修复导入错误',
    priority: 'P0',
    assignee: 'frontend'
  },
  {
    module: 'auth',
    task: '统一 /login /getInfo 返回结构(data 包裹)',
    priority: 'P0',
    assignee: 'backend'
  },
  {
    module: 'backend',
    task: '实现业务 Controller 接口 (ticket/inspection/maintenance)',
    priority: 'P0',
    assignee: 'backend'
  },
  {
    module: 'database',
    task: '创建业务表',
    priority: 'P0',
    assignee: 'dba'
  },
  {
    module: 'dict',
    task: '配置字典数据',
    priority: 'P1',
    assignee: 'admin'
  }
]
```

## 8. 测试验证清单（增强版）

### 8.1 前端功能测试
```javascript
const frontendTests = {
  routing: [
  '✅ 路由加载正常',
  '✅ 菜单显示正确',
  '⏳ 权限控制验证（公共路由保留）'
  ],
  pages: [
    '✅ 工单列表页显示',
    '✅ 巡检列表页显示',
    '⚠️ 维保列表页导入错误',
    '⏳ 表单提交功能'
  ],
  services: [
    '✅ 工单升级服务运行',
    '✅ 维保提醒服务运行',
    '✅ 巡检异常检测加载'
  ]
}
```

### 8.2 后端接口测试
```javascript
const backendTests = {
  ticket: {
    list: '⏳ 待测试',
    create: '⏳ 待测试',
    update: '⏳ 待测试',
    delete: '⏳ 待测试',
    assign: '⏳ 待测试'
  },
  inspection: {
    list: '⏳ 待测试',
    create: '⏳ 待测试',
    generateTickets: '⏳ 待测试'
  },
  maintenance: {
    list: '⏳ 待测试',
    approval: '⏳ 待测试',
    execute: '⏳ 待测试'
  }
}
```

### 8.3 认证链路测试要点 (新增)
| 步骤 | 输入 | 期望 |
|------|------|------|
| login raw token | {code,token} | store.token 写入；setToken 调用一次 |
| login wrapped | {code,data:{token}} | 同上 |
| login missing | {code, msg} 无 token | 抛出 '登录响应缺少 token' |
| getInfo top-level | {user,roles} | roles/permissions 正确写入 |
| getInfo wrapped | {data:{user,roles}} | 同上 |
| getInfo missing user | {code, msg} | 抛出 '响应缺少 user 字段' |


## 9. 部署配置（生产环境）

### 9.1 环境变量
```bash
# .env.production
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_BASE_API=https://idc-api.company.com
VITE_WS_URL=wss://idc-ws.company.com
VITE_APP_VERSION=2.1.0
VITE_BUILD_COMPRESS=gzip
```

### 9.2 Docker部署配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
  
  backend:
    image: openjdk:11-jre
    volumes:
      - ./ruoyi-admin.jar:/app.jar
    command: java -jar /app.jar
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - DB_NAME=idc_db
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=idc_db
    volumes:
      - mysql_data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d

volumes:
  mysql_data:
```

## 更新日志
### v2.2.0 (2025-08-31)
- 新增：登录 / 用户信息响应兼容章节
- 新增：服务测试策略 / 认证链路测试要点
- 新增：类型与数据契约策略
- 更新：模块状态 & 待办清单
- 更新：问题追踪与优先级
- 调整：inspection 列表状态为通过基本校验

### v2.1.0 (2024-08-30)
- 解决：文件编码问题全部修复
- 解决：Controller冲突问题
- 新增：完整的API函数定义
- 新增：服务管理器实现
- 新增：Docker部署配置
- 优化：任务清单和测试清单
- 更新：模块开发状态

### v2.0.0 (2024-08)
- 全面适配RuoYi-Vue3规范
- API改为函数导出格式
- 更新所有路径为business模块
- 添加完整的56项巡检配置
- 更新权限标识格式

---

**注意**: 本文档为IDC运维管理系统专用扩展，必须配合CLAUDE.md v2.2主规范使用
**维护**: 实时跟踪开发进度，确保文档与代码同步
**下一步**: 修复维保模块导入错误，实现后端接口
```

这个v2.1版本反映了当前的实际开发状态，包括已解决的问题和待处理的任务，可以作为项目交接文档。