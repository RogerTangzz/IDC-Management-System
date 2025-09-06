# DC/IDC 管理系统 Agent 配置文档

## Agent 身份定位

你是一个专业的全栈开发助手，精通基于 RuoYi-Vue3 框架的 DC/IDC（数据中心/互联网数据中心）管理系统开发。你的专长包括业务逻辑实现、TypeScript 迁移、API 开发以及系统集成。

### 核心能力
- **前端技术栈**：Vue3、TypeScript、Element Plus、Vite、Pinia
- **后端技术栈**：Spring Boot、MyBatis、RESTful API
- **数据库**：MySQL 8.0、Redis 6.x
- **业务领域**：数据中心运维、维保管理、资产管理、巡检管理
- **代码质量**：测试策略、性能优化、安全最佳实践

## 系统架构理解

### 系统概述
```yaml
系统名称: DC/IDC运维管理系统
性能要求:
  并发用户: 30+
  页面加载: <3秒
  系统可用率: 99.9%
  
巡检规模:
  楼层数: 4层
  巡检项: 56项
  覆盖范围: 暖通、配电、消防、弱电、UPS、监控
```

### 技术架构
```yaml
前端技术栈:
  框架: Vue 3.4+ (Composition API)
  语言: TypeScript (迁移中，已完成794行类型定义)
  UI库: Element Plus 2.4+
  构建: Vite 5.0+
  状态管理: Pinia
  路由: Vue Router 4.x
  HTTP: Axios 1.6+

后端技术栈:
  框架: RuoYi-Boot (Spring Boot)
  API: RESTful
  认证: JWT Bearer Token
  数据库: MySQL 8.0
  缓存: Redis 6.x
  容器化: Docker
```

### 功能模块架构
```
系统模块:
├── 维保计划 (Maintenance)
│   ├── 计划管理
│   ├── 审批流程
│   └── 执行跟踪
├── 故障工单 (Ticket)
│   ├── 工单生命周期
│   ├── SLA管理
│   └── 自动派单
├── 巡检管理 (Inspection)
│   ├── 巡检计划
│   ├── 56项检查项
│   └── 异常生成工单
├── 资产管理 (Asset)
│   ├── 机柜管理
│   ├── 设备台账
│   └── 到期提醒
├── 知识库 (Knowledge)
│   ├── 文档管理
│   └── 版本控制
├── 审批中心 (Approval)
│   ├── 多级审批
│   └── 权限代理
├── 统计分析 (Statistics)
│   ├── 运维报表
│   └── KPI分析
└── 通知中心 (Notification)
    ├── 多渠道推送
    └── 消息订阅
```

### 角色权限矩阵
| 角色 | 维保计划 | 工单管理 | 巡检管理 | 资产管理 | 知识库 | 系统设置 |
|------|----------|----------|----------|----------|---------|----------|
| 超级管理员 | 增删改查 | 增删改查 | 增删改查 | 增删改查 | 增删改查 | 完全权限 |
| 管理层 | 增删改查 | 增删改查 | 增删改查 | 增删改查 | 增删改查 | 无 |
| 运维工程师 | 查看/执行 | 增删改查 | 增改查 | 增删改查 | 增改查 | 无 |
| 巡检员 | 查看 | 增查 | 增改查 | 无 | 查看 | 无 |

## 代码生成模板

### 前端页面组件模板
```vue
<!-- views/business/module/index.vue -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.ticket_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:module:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="dict.ticket_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:module:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:module:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="ModuleName">
import { getCurrentInstance } from 'vue'
import { listModule, getModule, addModule, updateModule, delModule } from '@/api/business/module'

const { proxy } = getCurrentInstance()
const { dict } = proxy.useDict('ticket_status', 'ticket_priority')

// 数据状态
const dataList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: undefined,
  title: undefined
})

/** 查询列表 */
function getList() {
  loading.value = true
  listModule(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
  }).finally(() => {
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push('/business/module/create')
}

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$router.push('/business/module/edit/' + row.id)
}

/** 删除按钮操作 */
async function handleDelete(row) {
  await proxy.$modal.confirm('确认删除该条记录吗？')
  await delModule(row.id)
  proxy.$modal.msgSuccess("删除成功")
  getList()
}

// 页面加载
onMounted(() => {
  getList()
})
</script>
```

### API 接口模板
```javascript
// src/api/business/module.js
import request from '@/utils/request'

// 查询列表
export function listModule(query) {
  return request({
    url: '/business/module/list',
    method: 'get',
    params: query
  })
}

// 查询详细
export function getModule(id) {
  return request({
    url: '/business/module/' + id,
    method: 'get'
  })
}

// 新增
export function addModule(data) {
  return request({
    url: '/business/module',
    method: 'post',
    data: data
  })
}

// 修改
export function updateModule(data) {
  return request({
    url: '/business/module',
    method: 'put',
    data: data
  })
}

// 删除
export function delModule(id) {
  return request({
    url: '/business/module/' + id,
    method: 'delete'
  })
}

// 导出
export function exportModule(query) {
  return request({
    url: '/business/module/export',
    method: 'get',
    params: query
  })
}
```

## TypeScript 迁移指南

### 迁移优先级和进度
```
✅ 已完成（第一阶段）:
1. 类型定义体系: src/types/api/* (794行)
2. 核心工具: utils/request.ts, store/modules/user.ts
3. 业务API: ticket.ts, inspection.ts, maintenance.ts

⏳ 进行中（第二阶段）:
4. Store模块: 采用Composition API重构
5. 业务工具函数: utils/business/*.ts

📋 计划中:
6. 通用组件: components/**/*.vue
7. 页面组件: views/business/**/*.vue
```

### 类型定义规范
```typescript
// src/types/api/common.ts
export interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T = any> {
  total: number
  rows: T[]
  code?: number
  msg?: string
}

// src/types/api/ticket.ts
export interface Ticket {
  id: number
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  assigneeId?: number
  reporterId: number
  createTime: string
  updateTime: string
  deadline: string
  lastStatusTime?: string
  lastAction?: string
}

export enum TicketStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned', 
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',      // 48小时
  MEDIUM = 'medium', // 24小时
  HIGH = 'high',    // 12小时
  URGENT = 'urgent'  // 2小时
}
```

## 业务逻辑实现

### 工单状态机
```javascript
// 工单状态流转规则
const ticketStateMachine = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'pending', 'cancelled'],
  completed: ['closed', 'in_progress'],
  closed: ['in_progress'], // 可重新开启
  cancelled: []
}

// 验证状态转换
function canTransition(fromStatus, toStatus) {
  const allowedTransitions = ticketStateMachine[fromStatus] || []
  return allowedTransitions.includes(toStatus)
}
```

### 工单自动升级逻辑
```javascript
// utils/business/ticketEscalation.js
class TicketEscalationService {
  // SLA时限配置（小时）
  static SLA_HOURS = {
    low: 48,
    medium: 24,
    high: 12,
    urgent: 2
  }

  // 升级规则
  static ESCALATION_RULES = {
    low: { afterHours: 48, nextPriority: 'medium' },
    medium: { afterHours: 24, nextPriority: 'high' },
    high: { afterHours: 12, nextPriority: 'urgent' },
    urgent: { afterHours: null, nextPriority: null }
  }

  // 检查并升级逾期工单
  async checkAndEscalate() {
    const overdueTickets = await getOverdueTickets()
    
    for (const ticket of overdueTickets) {
      const hoursOverdue = this.calculateOverdueHours(ticket)
      const rule = this.ESCALATION_RULES[ticket.priority]
      
      if (rule && hoursOverdue > rule.afterHours) {
        await this.escalateTicket(ticket, rule.nextPriority)
      }
    }
  }
}
```

### 巡检异常处理
```javascript
// utils/business/inspectionAnomaly.js
class InspectionAnomalyService {
  // 异常严重度判定
  static getSeverity(item, value) {
    const rules = {
      '油箱间柴油气体浓度': {
        field: 'gasConcentration',
        critical: v => v > 1000,
        warning: v => v > 500
      },
      '冷冻泵回水压力': {
        field: 'returnPressure',
        critical: v => v > 1.5 || v < 0.2,
        warning: v => v > 1.2 || v < 0.4
      },
      '配电室温度': {
        field: 'temperature',
        critical: v => v > 40 || v < 5,
        warning: v => v > 35 || v < 10
      }
    }
    
    const rule = rules[item]
    if (!rule) return 'normal'
    
    if (rule.critical(value)) return 'critical'
    if (rule.warning(value)) return 'warning'
    return 'normal'
  }

  // 异常自动生成工单
  async generateTicketsFromAnomalies(inspectionId, anomalies) {
    const tickets = []
    
    for (const anomaly of anomalies) {
      const severity = this.getSeverity(anomaly.item, anomaly.value)
      
      if (severity !== 'normal') {
        const ticket = {
          title: `[巡检异常] ${anomaly.floor} - ${anomaly.item}`,
          description: `巡检发现异常：${anomaly.description}`,
          priority: severity === 'critical' ? 'high' : 'medium',
          category: this.getCategoryByItem(anomaly.item),
          sourceType: 'inspection',
          sourceId: inspectionId
        }
        
        tickets.push(ticket)
      }
    }
    
    return await batchCreateTickets(tickets)
  }
}
```

## 数据库设计规范

### 表结构设计
```sql
-- 工单表
CREATE TABLE `biz_ticket` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '工单ID',
  `ticket_no` varchar(50) NOT NULL COMMENT '工单编号',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `description` text COMMENT '描述',
  `priority` varchar(20) NOT NULL COMMENT '优先级',
  `status` varchar(20) NOT NULL COMMENT '状态',
  `assignee_id` bigint COMMENT '指派给',
  `reporter_id` bigint NOT NULL COMMENT '报告人',
  `category` varchar(50) COMMENT '类别',
  `equipment_specialty` varchar(50) COMMENT '设备专业',
  `deadline` datetime COMMENT 'SLA截止时间',
  `last_status_time` datetime COMMENT '最近状态变更时间',
  `last_action` varchar(50) COMMENT '最近动作',
  `resolution_notes` text COMMENT '解决方案',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_no` (`ticket_no`),
  KEY `idx_status` (`status`),
  KEY `idx_assignee` (`assignee_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_deadline` (`deadline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- 巡检记录表
CREATE TABLE `biz_inspection` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '巡检ID',
  `inspection_no` varchar(50) NOT NULL COMMENT '巡检编号',
  `inspection_date` date NOT NULL COMMENT '巡检日期',
  `floor` varchar(20) NOT NULL COMMENT '楼层',
  `inspector_id` bigint NOT NULL COMMENT '巡检员ID',
  `inspector_name` varchar(50) NOT NULL COMMENT '巡检员姓名',
  `relay_person_id` bigint COMMENT '接力人员ID',
  `total_items` int DEFAULT 0 COMMENT '检查项总数',
  `completed_items` int DEFAULT 0 COMMENT '完成项数',
  `anomaly_count` int DEFAULT 0 COMMENT '异常项数',
  `status` varchar(20) NOT NULL COMMENT '状态',
  `start_time` datetime COMMENT '开始时间',
  `end_time` datetime COMMENT '结束时间',
  `is_copied` tinyint DEFAULT 0 COMMENT '是否复制',
  `copied_from_id` bigint COMMENT '复制来源ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inspection_no` (`inspection_no`),
  KEY `idx_inspection_date` (`inspection_date`),
  KEY `idx_inspector` (`inspector_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='巡检记录表';

-- 维保计划表
CREATE TABLE `biz_maintenance` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '维保ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `floor` varchar(20) COMMENT '楼层',
  `version` varchar(20) DEFAULT 'V1.0' COMMENT '版本',
  `mop_category` varchar(50) NOT NULL COMMENT 'MOP类别',
  `frequency_num` int NOT NULL COMMENT '执行频次数字',
  `frequency_unit` varchar(20) NOT NULL COMMENT '执行频次单位',
  `approver_id` bigint COMMENT '审核人ID',
  `approval_status` varchar(20) DEFAULT 'draft' COMMENT '审批状态',
  `execution_status` varchar(20) DEFAULT 'pending' COMMENT '执行状态',
  `next_execution_time` datetime COMMENT '下次执行时间',
  `mop_name` varchar(100) NOT NULL COMMENT 'MOP名称',
  `mop_purpose` text COMMENT 'MOP目的',
  `notify_users` text COMMENT '通知人员ID列表',
  `tools` text COMMENT '工具仪表',
  `materials` text COMMENT '材料',
  `safety_ppe` text COMMENT '安全PPE',
  `special_tools` text COMMENT '特殊工具',
  `steps_content` longtext COMMENT '步骤内容',
  `result` text COMMENT '执行结果',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_approval_status` (`approval_status`),
  KEY `idx_next_execution` (`next_execution_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维保计划表';
```

### 索引优化策略
```sql
-- 性能优化索引
-- 复合索引用于常见查询
CREATE INDEX idx_ticket_status_priority_created 
ON biz_ticket(status, priority, create_time DESC);

-- 覆盖索引用于统计查询
CREATE INDEX idx_ticket_stats
ON biz_ticket(status, priority, assignee_id, create_time);

-- 部分索引减少索引大小
CREATE INDEX idx_active_tickets
ON biz_ticket(assignee_id, deadline)
WHERE status IN ('pending', 'assigned', 'in_progress');
```

## 测试策略

### 单元测试示例
```javascript
// tests/unit/ticket.spec.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketList from '@/views/business/ticket/index.vue'

describe('TicketList', () => {
  it('应该正确加载工单列表', async () => {
    const wrapper = mount(TicketList)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.el-table').exists()).toBe(true)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('应该正确处理状态筛选', async () => {
    const wrapper = mount(TicketList)
    
    // 设置筛选条件
    wrapper.vm.queryParams.status = 'pending'
    await wrapper.vm.handleQuery()
    
    // 验证API调用
    expect(wrapper.vm.dataList).toBeDefined()
  })
})
```

### 测试覆盖率要求
- **基线要求**: 60% 行覆盖率
- **关键模块**: 80% 覆盖率（工单、巡检、维保）
- **业务逻辑**: 100% 分支覆盖

## 性能优化建议

### 前端优化
```javascript
// 1. 路由懒加载
const routes = [
  {
    path: '/business/ticket',
    component: () => import(/* webpackChunkName: "ticket" */ '@/views/business/ticket/index.vue')
  }
]

// 2. 列表虚拟滚动
import VirtualList from '@tanstack/vue-virtual'

// 3. 防抖搜索
import { debounce } from 'lodash-es'
const search = debounce((query) => {
  getList(query)
}, 300)

// 4. 图片懒加载
<el-image lazy :src="url" />
```

### 后端优化
```java
// 1. 分页查询优化
@Query(value = "SELECT * FROM biz_ticket WHERE status = :status LIMIT :limit OFFSET :offset",
       nativeQuery = true)
Page<Ticket> findByStatus(@Param("status") String status, Pageable pageable);

// 2. 批量操作
@Modifying
@Query("UPDATE Ticket t SET t.status = :status WHERE t.id IN :ids")
int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("status") String status);

// 3. 缓存策略
@Cacheable(value = "tickets", key = "#id")
public Ticket findById(Long id) {
    return ticketMapper.selectById(id);
}
```

## 常用命令速查

### 开发命令
```bash
# 前端开发
npm run dev           # 启动开发服务器
npm run build:prod    # 生产环境构建
npm run preview       # 预览生产构建

# 代码质量
npm run lint          # ESLint检查
npm run lint:fix      # 自动修复
npm run type-check    # TypeScript检查

# 测试
npm run test:unit     # 单元测试
npm run test:e2e      # 端到端测试
npm run coverage      # 覆盖率报告

# 后端开发
mvn spring-boot:run   # 启动后端
mvn clean package     # 打包
mvn test             # 运行测试
```

### Docker 部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    volumes:
      - ./dist:/usr/share/nginx/html
    ports:
      - "80:80"
  
  backend:
    image: openjdk:11
    volumes:
      - ./ruoyi-admin.jar:/app.jar
    command: java -jar /app.jar
    ports:
      - "8080:8080"
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root123
      - MYSQL_DATABASE=ry_dc
    volumes:
      - ./sql:/docker-entrypoint-initdb.d
  
  redis:
    image: redis:6-alpine
```

## Agent 使用示例

### 创建新模块
```
Agent，帮我创建一个设备管理模块，需要：
- 设备的CRUD操作
- 设备类型：暖通/配电/消防/弱电
- 生命周期管理：采购/入库/使用/维修/报废
- 关联工单和维保计划
- TypeScript类型定义
```

### 修复问题
```
Agent，工单列表页面加载慢，请帮我优化：
- 实现虚拟滚动
- 添加合适的数据库索引
- 实现Redis缓存
- 添加防抖搜索
```

### TypeScript 迁移
```
Agent，将维保模块迁移到TypeScript：
- 转换为Composition API
- 定义MaintenancePlan类型
- API调用类型安全
- 添加错误处理
```

## 故障排查指南

### 常见问题
1. **TypeScript错误**：检查 tsconfig.json 配置
2. **API 404错误**：验证 vite.config.js 代理配置
3. **权限拒绝**：清除缓存并重新获取权限
4. **构建失败**：检查Node版本（需要16+）
5. **数据库连接**：验证连接字符串和凭据

### 日志位置
- 前端日志：浏览器控制台
- 后端日志：logs/sys-*.log
- SQL日志：logs/sql.log
- 错误日志：logs/error.log

## 更新记录

### v2.4.0 (2025-01-02)
- ✅ TypeScript迁移第一阶段完成
- ✅ 794行类型定义完成
- ✅ 核心API TypeScript化
- ✅ Store模块使用Composition API

### v2.3.0 (2024-12-30)
- ✅ 添加工单状态持久化
- ✅ 实现工单重新开启功能
- ✅ 添加统计报表API
- ✅ 首页看板数据集成

---

**注意事项**：
- 本配置基于RuoYi-Vue3框架
- 遵循企业级开发规范
- 重视代码质量和测试覆盖率
- 持续进行TypeScript迁移

---

## 2025-09 增量能力（P0→P1推进）

### 数据权限参数对齐（mineOnly 别名）
- 新增工具：`frontend/src/utils/business/mineOnly.ts`
  - `VITE_API_MINE_ONLY_PARAM` 用于声明后端实际参数名（默认 `mineOnly`）。
  - `withMineOnly(payload, isAdmin)`：非管理员自动注入该参数；若后端使用别名（例如 `selfOnly`），函数会“双写”（同时写 `mineOnly=true`）以便灰度兼容。
- 接入点：工单列表普通/nearDue/overdue 查询均调用 `withMineOnly` 注入参数，仅非管理员生效。
- 验证：在 `.env.*` 配置 `VITE_API_MINE_ONLY_PARAM=selfOnly` 后抓包查看请求参数；管理员角色不带该参数。

### 报表下钻（SLA 饼图 → 列表）
- 位置：`frontend/src/views/business/ticket/report.vue`
- 行为：点击 SLA 饼图分段下钻至工单列表。
  - 第 0 扇区（有时限）→ `/business/ticket/list?mode=neardue`
  - 第 1 扇区（超时数量）→ `/business/ticket/list?mode=overdue`
- 列表自动识别 `mode` 并查询对应数据。

### 维保导入与失败明细导出
- API：`frontend/src/api/business/maintenance.js`
  - `importMaintenance(file)`：上传 Excel。
  - `downloadMaintenanceTemplate()`：模板下载（Blob）。
  - `downloadMaintenanceImportErrors(taskId?)`：导入失败明细导出（Blob）。
- UI：`frontend/src/views/business/maintenance/plan/index.vue`
  - 工具栏新增“导入/模板下载”。
  - 导入完成后展示汇总弹窗（总计/成功/失败与行级错误）；提供“导出失败明细”按钮。
- 建议后端返回导入结构 `{ total, success, failed, errors:[{row,message}] }`；前端已做别名兼容。

### 巡检详情（detail.vue）稳定化
- 文件：`frontend/src/views/business/inspection/detail.vue`
- 能力：
  - 仅生成选中异常；生成前确认；生成后“是否查看”二次确认（确认跳详情，取消回列表）。
  - 小按钮与顶部按钮具备 loading/disabled；单测环境下通过 DOM 属性兜底确保可感知。
  - 对外暴露：`form`、`inspectionItems`、`selectedAnomalyIds`、`generateSelectedTickets`、`generateTicketsByIds`（用于单测）。

### 测试桩与用例稳定化
- 全局测试桩：`frontend/src/__tests__/setup.ts`
  - 注册 Element Plus 常用组件桩与 `v-loading` 指令；`el-button` 禁用/恢复遵循属性存在性语义。
  - mock `src/layout/index.vue` 避免 vitest 解析 Sidebar 目录问题。
- 用例：为异步链路增加微任务/渲染等待，避免偶发时序误判。

---

## ���������ã�mineOnly �������룩
- ������VITE_API_MINE_ONLY_PARAM
  - ���ã�ָ����ˡ����������ݡ���ʵ��������δ����ʱĬ�� mineOnly��
  - ���飺�����ʹ�ñ������� selfOnly������ .env.* ���øñ�����ǰ�˻ᡰ˫д���ԻҶȼ��ݣ�ͬʱ���� mineOnly=true����

ʾ����.env.development / .env.production����
`
# ��������
VITE_APP_ENV = 'development'
VITE_APP_BASE_API = '/dev-api'
VITE_USE_MOCK = false

# ����Ȩ�޲������������Ϊ selfOnly ���Ϊ selfOnly��
VITE_API_MINE_ONLY_PARAM = mineOnly
`

��֤���裺
- �ǹ���Ա�������б�/����/�������б�ץ��Ӧ�� mineOnly=true �����õı���������
- ����Ա�������ò�����
- �� .env.* �� VITE_API_MINE_ONLY_PARAM=selfOnly ������ǰ�ˣ�ץ��Ӧͬʱ���� selfOnly=true �� mineOnly=true���Ҷ��ڣ���

---

## �������꣨����ͼ/��ͼռλ��

˵����SLA ��ͼ������굽�����б����������ѯģʽ�Ķ�Ӧ��ϵΪ��
- ���� index=0����ʱ�ޣ�nearDue ģʽ���� ��ת /business/ticket/list?mode=neardue
- ���� index=1����ʱ������overdue ģʽ���� ��ת /business/ticket/list?mode=overdue

����ͼ��ռλ����
`
[����ҳ(SLA��ͼ)] --�������0/1--> [·����ת /business/ticket/list?mode=...] --�б�ʶ��mode--> [�����Ӧ��ѯ]
`

��ͼռλ��
- docs/assets/report_sla_pie.png��ռλ��
- docs/assets/ticket_list_mode_neardue.png��ռλ��
- docs/assets/ticket_list_mode_overdue.png��ռλ��

### �����ڿھ������Ӽ���
- ��·�ɻ򵼳�����Я�� mode=neardue ʱ�����֧�ַ���/Сʱ���ȴ��ڣ�
  - warnBeforeMinutes�����ȣ�
  - warnBeforeHours�����ף�δ����Ĭ�� 2 Сʱ��
- ʾ����
  - ������/business/ticket/export?mode=neardue&warnBeforeMinutes=45
  - �б���/business/ticket/list?mode=neardue����ѡʵ�ַ��Ӽ�������
- �б��ӿڽ����ڲ�ѯ��֧�� warnBeforeMinutes��ʾ����/business/ticket/list?mode=neardue&warnBeforeMinutes=45��
- ������ר�ýӿڣ�/business/ticket/nearDue?warnBeforeMinutes=45 ֧�ַ��Ӽ����ڣ��Ҷ����Լ��� hours/warnBeforeHours����
