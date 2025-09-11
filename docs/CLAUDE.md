基于当前规范文档，以下是更新后的 **CLAUDE.md v2.3**（新增 TypeScript 迁移与测试基线策略）：

```markdown
# CLAUDE.md — 智能开发助手规范 v2.0（对齐 IDC 业务规范）

版本: 2.0.0（对齐 IDC 系统开发功能业务逻辑与规范 V2.0）
适用范围: RuoYi-Vue3 (Vue 3 + Element Plus + Vite) 前端项目
核心目标: 与 IDC 业务规范保持一致，提供可落地的前端架构与实现准则
更新日期: 2025-09-04

本版要点（与 V2.0 对齐）：
- 工单模块：持久化 last_action/last_status_time、reopen 流程、统计报表（summary/analytics）、逾期与“即将超时” nearDue 指标、与巡检联动生成工单
- SLA：支持前端首页“即将超时/已逾期”卡片展示，与后端配置 `idc.sla.warnBeforeHours` 对齐
- 列表/详情：前端字段与后端一致（`reporterName/assigneeName/completionTime`），排序参数兼容 RuoYi（字段下划线、方向 asc/desc）
- 报表与下钻：报表图表（处理时长柱状 + SLA 饼图）已接入；列表支持 nearDue/overdue 模式切换
- 消息中心：顶部未读角标与消息中心页（未读、单条/全部已读）已接入，权限 `business:message:list/read`
- 渐进式 TypeScript：以业务闭环为先，API/Store 优先迁移，其余组件与视图逐步迁移

---

## -1. 版本 2.0 摘要（快速阅读）

### 🎯 与 IDC 业务规范一致的关键点
| 模块 | 状态 | 完成度 | 说明 |
|------|------|--------|------|
| 工单 last*/reopen | ✅ 完成 | 100% | 列表支持 last_status_time 排序、详情展示 last_action |
| 统计 summary/analytics | ✅ 完成 | 100% | 首页 todayNew/todayCompleted/nearDue/overdue 卡片 |
| 逾期/近到期入口 | ✅ 完成 | 100% | 列表按钮切换 nearDue/overdue 模式，分页/重置兼容 |
| 巡检联动生成工单 | ✅ 完成 | 100% | 生成时写 last_action 并记日志 |
| 字典 | ✅ 完成 | 100% | ticket_action 增加 sla_warn/sla_overdue |
| TypeScript 迁移 | ⏳ 进行中 | 40% | 先迁 API/Store；页面逐步推进 |

### 📊 实施策略
- 以业务闭环优先，逐步迁移 TypeScript（API → Store → 组件 → 视图）
- 所有与后端交互的字段命名以后端为准（避免 `reporter`/`reporterName` 不一致）
- 列表排序适配 RuoYi：`prop` 驼峰转下划线、`order` ↦ `asc/desc`

### 🔄 从旧版迁移注意点
| 主题 | 旧版 | 2.0 | 说明 |
|------|-----|-----|------|
| reporter 字段 | reporter | reporterName | 与后端一致 |
| 处理时间字段 | startTime/completeTime | startTime(推导)/completionTime | start 从日志推导，complete 对齐后端 |
| 排序参数 | 直接透传 | 下划线+asc/desc | 适配 RuoYi 后端分页插件 |

---

## 0. 快速决策树

### 0.1 功能开发决策流
```
新功能需求 → 评估影响域
├── 纯展示功能 → views/business/{module}/ + api/business/
├── 复用组件 → components/ + 可能的 directive/
├── 全局状态 → store/modules/ + api/business/
├── 权限相关 → permission.js + router/ + views/
└── 工具函数 → utils/business/ + 单元测试
```

### 0.2 代码放置决策（RuoYi规范强化）
```
代码类型判断：
├── HTTP请求 → MUST: src/api/business/{module}.js (函数导出)
├── 页面组件 → src/views/business/{module}/
├── 通用组件 → src/components/{category}/
├── 状态管理 → src/store/modules/{domain}.js
├── 业务工具 → src/utils/business/{service}.js
└── 静态资源 → src/assets/{type}/
```

### 0.3 TypeScript 迁移优先级（业务优先）
```
优先迁移：
1. 类型定义体系：src/types/api/*（ApiResult/PageResult/业务实体/DTO）
2. API 层：src/api/business/*（返回值带类型）
3. Store：用户/权限/工单（组合式 API）
4. 工具函数：utils/request、业务辅助工具
5. 视图复用组件 → 最后迁移页面视图
```

迁移策略：
1. “最小可闭环”：每次只迁一个可独立编译区块（如单个 store + 其依赖类型）。
2. JS 同名透传：保留原 JS 文件 → `export * from './xxx.ts'`（或默认导出透传）确保第三方/旧路径不破坏。
3. 类型声明集中：新建 `src/types/` 子目录：`api/`、`domain/`、`dto/`、`shim/`；逐步拆分临时内联接口。
4. 避免“全局 any”污染：仅在过渡期用 `// TODO: refine type` 注记，不使用 `declare module '*';` 粗暴兜底。
5. 提交前执行：`npx tsc --noEmit` + lint + vitest。

反模式（禁止）：
- 大批量同时迁移视图 + store + api → 难以定位回归。
- 为压制错误加 `as any` / `@ts-ignore` 大面积覆盖。
- 在视图中定义后端返回结构（应放入 types/api/）。

## 1. 项目环境与依赖

### 1.1 环境要求（MUST）
```json
{
  "node": ">=18.0.0",
  "npm": ">=9.0.0",
  "vue": "^3.4.0",
  "element-plus": "^2.4.0",
  "vite": "^5.0.0",
  "axios": "^1.6.0"
}
```

### 1.3 TypeScript 类型定义体系（对齐 V2.0）

#### 1.3.1 类型文件组织结构
```
src/types/
├── api/                    # API相关类型（794行）
│   ├── common.ts          # 通用类型：ApiResult, PageResult, 枚举等（136行）
│   ├── auth.ts            # 认证相关类型（12行）  
│   ├── ticket.ts          # 工单类型：实体、DTO、枚举（179行）
│   ├── inspection.ts      # 巡检类型：计划、记录、异常（212行）
│   └── maintenance.ts     # 维保类型：计划、记录、统计（255行）
├── domain/                # 领域模型（规划中）
├── dto/                   # 数据传输对象（规划中）
└── shim/                  # 第三方库类型声明（按需）
```

#### 1.3.2 核心类型约定
```typescript
// 1. 通用响应格式
export interface ApiResult<T = any> {
  code: number
  msg: string  
  data: T
}

// 2. 分页响应格式
export interface PageResult<T = any> {
  total: number
  rows: T[]
  code?: number
  msg?: string
}

// 3. 枚举优于字符串常量
export type TicketStatus = 'pending'|'assigned'|'processing'|'completed'|'closed'

// 4. DTO模式分离
export interface TicketCreateDto {
  title: string
  priority: 'low'|'medium'|'high'|'urgent'
  // 创建时需要的字段
}

export interface TicketUpdateDto extends Partial<TicketCreateDto> {
  id: ID
  // 更新时可选字段 + 必需ID
}
```

#### 1.3.3 类型导入规范
```typescript
// ✅ 正确：使用type导入类型
import type { Ticket, TicketQuery } from '@/types/api/ticket'
import { listTicket } from '@/api/ticket'

// ❌ 错误：混合导入
import { Ticket, listTicket } from '@/api/ticket'

// ✅ API函数统一返回Promise包装的类型
async function fetchTickets(query: TicketQuery): Promise<PageResult<Ticket>>
```

### 1.2 环境变量规范
```bash
# .env.development
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_ENV=development
VITE_APP_BASE_API=/dev-api
VITE_BUILD_COMPRESS=none

# .env.production  
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_ENV=production
VITE_APP_BASE_API=https://api.domain.com
VITE_BUILD_COMPRESS=gzip
```

### 1.3 TS 配置关键点（v2.3 新增）
```jsonc
// tsconfig.json 关键字段
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler", // 适配 Vite
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "useDefineForClassFields": true,
    "strict": true,
    "baseUrl": "./src",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

说明：暂不启用 `skipLibCheck: false` 强化阶段；完成 80% 迁移后再收紧。

## 2. 目录结构与职责边界（RuoYi规范版）

### 2.1 标准目录结构
```
src/
├── api/              # HTTP接口层 - 所有后端交互
│   ├── system/       # 系统管理接口（RuoYi自带）
│   ├── monitor/      # 监控接口（RuoYi自带）
│   └── business/     # 业务接口（IDC项目专用）
│       ├── ticket.js
│       ├── inspection.js
│       └── maintenance.js
├── assets/           # 静态资源
│   ├── styles/       # 全局样式
│   ├── icons/        # SVG图标
│   └── images/       # 图片资源
├── components/       # 通用组件
│   ├── Editor/       # 富文本编辑器
│   ├── FileUpload/   # 文件上传
│   ├── ImageUpload/  # 图片上传
│   ├── ImagePreview/ # 图片预览
│   ├── DictTag/      # 字典标签
│   ├── Pagination/   # 分页组件
│   ├── RightToolbar/ # 右侧工具栏
│   └── Status/       # 状态标签
│       └── StatusTag.vue
├── directive/        # 自定义指令
│   ├── permission/   # 权限指令
│   │   ├── hasPermi.js
│   │   └── hasRole.js
│   └── index.js
├── layout/           # 布局组件
│   ├── index.vue
│   └── components/
├── plugins/          # 插件配置
│   ├── auth.js       # 认证插件
│   ├── cache.js      # 缓存插件
│   ├── modal.js      # 模态框插件
│   └── tab.js        # 标签页插件
├── router/           # 路由配置
│   └── index.js
├── store/            # 状态管理
│   ├── index.js
│   └── modules/
│       ├── user.js   # 用户/会话
│       ├── app.js    # 应用配置
│       ├── permission.js # 权限
│       └── dict.js   # 字典数据
├── utils/            # 工具函数
│   ├── request.js    # axios封装
│   ├── auth.js       # token管理
│   ├── cache.js      # 缓存管理
│   ├── validate.js   # 验证函数
│   ├── ruoyi.js      # RuoYi工具函数
│   └── business/     # 业务工具函数
│       ├── ticketEscalation.js
│       ├── inspectionAnomaly.js
│       └── maintenanceReminder.js
├── views/            # 页面组件
│   ├── system/       # 系统管理（RuoYi自带）
│   ├── monitor/      # 系统监控（RuoYi自带）
│   └── business/     # 业务模块（IDC项目）
│       ├── ticket/
│       ├── inspection/
│       └── maintenance/
├── permission.js     # 全局路由守卫
└── main.js          # 应用入口
```

### 2.2 文件命名规范
```javascript
// 组件文件：PascalCase
UserProfile.vue
DataTable.vue

// JS模块：camelCase  
userApi.js
dateUtils.js

// 业务页面：小写
index.vue    // 列表页
create.vue   // 创建页
detail.vue   // 详情页
form.vue     // 表单页

// 常量文件：kebab-case 或 camelCase
constants.js
dict-data.js
```

### 2.3 类型目录建议（v2.3 新增）
```
src/types/
  api/          # 后端接口响应/请求 DTO
  domain/       # 领域模型（Ticket, Inspection 等）
  dto/          # 视图层组合/表单 DTO
  shim/         # 第三方库缺失声明（逐步减少）
  index.d.ts    # 汇总导出（可选）
```

## 3. RuoYi规范API模板

### 3.1 API模块模板（函数导出）- 标准CRUD
```javascript
// src/api/business/{module}.js
import request from '@/utils/request'

// 查询列表
export function list{Module}(query) {
  return request({
    url: '/business/{module}/list',
    method: 'get',
    params: query
  })
}

// 查询详细
export function get{Module}({module}Id) {
  return request({
    url: '/business/{module}/' + {module}Id,
    method: 'get'
  })
}

// 新增
export function add{Module}(data) {
  return request({
    url: '/business/{module}',
    method: 'post',
    data: data
  })
}

// 修改
export function update{Module}(data) {
  return request({
    url: '/business/{module}',
    method: 'put',
    data: data
  })
}

// 删除
export function del{Module}({module}Id) {
  return request({
    url: '/business/{module}/' + {module}Id,
    method: 'delete'
  })
}

// 导出
export function export{Module}(query) {
  return request({
    url: '/business/{module}/export',
    method: 'get',
    params: query
  })
}
```

### 3.2 特殊业务API模板
```javascript
// 批量操作
export function batchUpdate{Module}(data) {
  return request({
    url: '/business/{module}/batch',
    method: 'put',
    data: data
  })
}

// 状态变更
export function change{Module}Status({module}Id, status) {
  return request({
    url: `/business/{module}/${module}Id/status`,
    method: 'put',
    data: { status }
  })
}

// 文件上传
export function upload{Module}File(formData) {
  return request({
    url: '/business/{module}/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  })
}

// 数据导入
export function import{Module}(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/business/{module}/import',
    method: 'post',
    data: formData
  })
}
```

### 3.3 实际业务API示例
```javascript
// src/api/business/ticket.js - 工单特殊操作
export function assignTickets(data) {
  return request({
    url: '/business/ticket/assign',
    method: 'post',
    data: data
  })
}

// src/api/business/inspection.js - 巡检特殊操作
export function generateTickets(inspectionId, anomalies) {
  return request({
    url: '/business/inspection/generateTickets',
    method: 'post',
    data: { inspectionId, anomalies }
  })
}

export function getLatestInspection() {
  return request({
    url: '/business/inspection/latest',
    method: 'get'
  })
}

// src/api/business/maintenance.js - 维保特殊操作
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
```

### 3.4 API 类型模式（v2.3 新增）
```ts
// src/types/api/common.ts
export interface ApiResult<T = any> { code: number; msg: string; data: T }
export interface PageResult<T = any> { code?: number; msg?: string; total: number; rows: T[] }

// 登录返回兼容：
export type LoginRaw = { code: number; msg: string; token?: string; data?: { token: string } }
export function extractToken(resp: LoginRaw): string | undefined {
  return resp.token ?? resp.data?.token
}
// v2.3.1 建议：工单统计返回类型（后续创建 src/types/api/ticketReport.ts）
export interface TicketSummary {
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  todayNew: number
  todayCompleted: number
  overdue: number
}
export interface TicketAnalytics {
  duration: { lt1h: number; bt1to4h: number; bt4to8h: number; bt8to24h: number; ge24h: number; total: number }
  sla: { withDeadline: number; timeoutCount: number; ontimeCompleted: number; timeoutRate: number }
}
```

## 4. RuoYi组件使用规范

### 4.1 必须使用的RuoYi组件
```javascript
// 1. 消息提示 - 使用 proxy.$modal
proxy.$modal.msgSuccess("操作成功");
proxy.$modal.msgError("操作失败");
proxy.$modal.msgWarning("警告信息");
proxy.$modal.msgInfo("提示信息");

// 2. 确认框 - 使用 proxy.$modal.confirm
proxy.$modal.confirm('确认删除吗？').then(() => {
  // 确认操作
}).catch(() => {
  // 取消操作
});

// 3. 字典数据 - 使用 proxy.useDict
const { dict_type } = proxy.useDict('dict_type');

// 4. 文件下载 - 使用 proxy.download
proxy.download('url', params, filename);

// 5. 时间格式化 - 使用 parseTime
import { parseTime } from '@/utils/ruoyi';
parseTime(date, '{y}-{m}-{d}');

// 6. 表单重置 - 使用 proxy.resetForm
proxy.resetForm("formRef");

// 7. 日期范围 - 使用 proxy.addDateRange
proxy.addDateRange(queryParams.value, dateRange.value);
```

### 4.2 权限控制规范
```javascript
// 权限指令格式
v-hasPermi="['business:module:action']"

// 权限标识规范
const permissionPattern = {
  format: 'business:{module}:{action}',
  actions: ['list', 'query', 'add', 'edit', 'remove', 'export', 'import'],
  examples: [
    'business:ticket:list',      // 列表权限
    'business:ticket:add',       // 新增权限
    'business:ticket:edit',      // 修改权限
    'business:ticket:remove',    // 删除权限
    'business:inspection:export' // 导出权限
  ]
}

// 程序化权限检查
if (proxy.$auth.hasPermi('business:ticket:edit')) {
  // 有权限时的操作
}
```

## 5. 错误处理规范

### 5.1 API错误处理
```javascript
// 标准错误处理模式
function handleOperation() {
  operationApi(params)
    .then(response => {
      proxy.$modal.msgSuccess("操作成功");
      // 成功逻辑
    })
    .catch(error => {
      // 自动显示错误消息（request.js已处理）
      console.error('操作失败:', error);
    });
}

// 自定义错误处理
function handleCustomError() {
  operationApi(params)
    .then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess("操作成功");
      } else {
        proxy.$modal.msgError(response.msg || "操作失败");
      }
    })
    .catch(error => {
      // 特定错误处理
      if (error.response?.status === 403) {
        proxy.$modal.msgError("权限不足");
      }
    });
}
```

### 5.2 表单验证错误
```javascript
// 统一表单验证
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      // 提交逻辑
    } else {
      proxy.$modal.msgError("请填写完整信息");
      return false;
    }
  });
}
```

### 5.3 登录/鉴权响应兼容指引（v2.3 新增）
背景：历史接口 `/login` 返回 `{code,msg,token}`；新规范统一 `{code,msg,data:{token}}`；`/getInfo` 可能顶层直接返回 `user` 字段。

前端策略：
```ts
// user store 登录处理
const raw = await login(...)
const token = raw.token ?? raw.data?.token
if (!token) throw new Error('登录响应缺少 token')

// getInfo 处理
const info = await getInfo()
const payload = info.data?.user ? info.data : info // 兼容顶层
```

迁移完成后：后端统一改造 `/login` → data 包裹；前端移除兼容分支并增加一条版本迁移记录。

## 6. 业务服务集成

### 6.1 业务服务注册
```javascript
// src/utils/business/index.js
import TicketEscalationService from './ticketEscalation'
import InspectionAnomalyService from './inspectionAnomaly'
import MaintenanceReminderService from './maintenanceReminder'

export const businessServices = {
  ticketEscalation: TicketEscalationService,
  inspectionAnomaly: InspectionAnomalyService,
  maintenanceReminder: MaintenanceReminderService
}

// 开发模式下暴露到全局
if (import.meta.env.DEV) {
  window.$services = businessServices
}
```

### 6.2 服务生命周期管理
```javascript
// 在主页面启动服务
onMounted(() => {
  businessServices.ticketEscalation.start()
  businessServices.maintenanceReminder.start()
})

// 页面销毁时停止服务
onUnmounted(() => {
  businessServices.ticketEscalation.stop()
  businessServices.maintenanceReminder.stop()
})
```

## 7. 开发调试工具

### 7.1 控制台工具
```javascript
// 开发模式下可用的全局工具
window.$services           // 业务服务访问
window.$services.ticketEscalation.checkAndEscalate()  // 手动触发检查
window.$services.maintenanceReminder.checkPlans()     // 手动检查维保

// Vue DevTools 辅助
$vm.proxy.$modal          // 访问消息组件
$vm.proxy.$router         // 访问路由
```

### 7.2 日志规范
```javascript
// 统一日志格式
console.log('[模块名称] 操作描述', data)
console.error('[模块名称] 错误描述', error)

// 示例
console.log('[TicketEscalation] 服务已启动，间隔(ms)：', interval)
console.error('[InspectionAPI] 生成工单失败', error)
```

### 7.3 调试辅助变量（v2.3 新增）
| 变量 | 说明 | 清理策略 |
|------|------|----------|
| window.__lastLoginResponse | 最近一次 login 成功/失败原始响应 | 上线前移除 |
| window.__lastLoginError | 最近一次 login 抛出的错误对象 | 上线前移除 |

## 8. 性能优化建议

### 8.1 组件优化
- 使用 `v-show` 替代 `v-if` 用于频繁切换
- 大列表使用虚拟滚动
- 图片使用懒加载
- 合理使用 `keep-alive` 缓存

### 8.2 API优化
- 批量操作替代循环单个请求
- 使用防抖/节流控制请求频率
- 合理设置缓存策略
- 避免重复请求

## 9. 常见问题解决

### 9.1 编码问题
```python
# 批量转换文件编码为UTF-8
import chardet
import codecs

def convert_to_utf8(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
        encoding = result['encoding']
    
    if encoding.lower() != 'utf-8':
        with codecs.open(file_path, 'r', encoding=encoding) as f:
            content = f.read()
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
```

### 9.2 路由问题
- 确保动态路由正确加载
- 检查权限配置
- 验证组件路径

### 9.3 API导出问题
- 使用函数导出而非对象导出
- 确保导入导出名称一致
- 检查路径是否正确

### 9.4 Mock 与真实后端切换（v2.3 新增）
现状：`import '../mock'` 位于 `utils/request.ts` 顶部 → 所有请求被 MockJS 拦截。

改进计划：
1. 新增环境变量：`VITE_ENABLE_MOCK=true|false`
2. 条件导入：
```ts
// request.ts
if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
  import('../mock')
}
```
3. 生产构建：`.env.production` 设为 `false`。
4. 测试：单元测试默认关闭 Mock，只在需要时局部 mock。

风险提示：Mock 与真实接口字段差异会导致隐藏型 runtime bug，应逐步收敛至共享类型定义（在 `types/api/` 里复用）。

### 10. 覆盖率与质量控制策略（v2.3 新增）
前端测试 & 覆盖率体系：
1. 全局基线：在 `vitest.config.js` 设定 lines/functions/statements 60%，branches 50%。
2. Diff Gate：PR 中执行 `npm run coverage:diff`，所有变更文件行覆盖率需 >= 80%，否则 CI 失败。
3. 分组统计：`npm run coverage:groups` 输出 business-services / permission / store / components / other 各组覆盖率；核心组（business-services, permission）目标 80%+。
4. 升级节奏：连续 10 次合并的移动平均达到阈值后提升基线（例：60→65→70）。
5. 约束：禁止无断言或与被测实现重复逻辑的“装饰性”测试；新增逻辑必须包含至少一个失败/异常分支断言。
6. 后端：已在父 POM 引入 JaCoCo，`mvn verify` 生成 `target/site/jacoco` 报告，后续可接 Codecov/Sonar 汇总前后端。
7. 后续拓展：可添加 nightly Mutation（Stryker）仅针对高价值模块；在脚本中增加 per-group 阈值自动 fail。

辅助脚本：
- `frontend/scripts/coverage-diff.js`：解析 lcov.info 与 git diff 计算变更文件覆盖率。
- `frontend/scripts/coverage-groups.js`：分类聚合覆盖率输出。
- README.md：对外公开策略、徽章与升级流程。

推荐优先补测模块：
- `utils/business/ticketEscalation.js` 逾期升级边界与错误处理。
- `utils/business/inspectionAnomaly.js` 严重度分级与批量工单失败分支。
- 路由权限过滤（permission / 动态路由合并）。


## 更新日志

### v2.4.0 (2025-09-02) 🎯 TypeScript迁移第一阶段完成
- ✅ **类型定义体系建立**：完成794行完整类型定义，覆盖工单/巡检/维保三大业务模块
- ✅ **API层全面TypeScript化**：ticket.ts, inspection.ts, maintenance.ts完整实现
- ✅ **Store模块现代化改造**：ticket Store采用Composition API，增强类型推断  
- ✅ **JS透传兼容策略**：保持向后兼容，平滑过渡
- ✅ **类型检查通过**：npm run type-check零错误，构建正常
- 📊 **代码统计**：+2199行新增，-70行删除，核心数据流100%类型保护
- 📚 **文档完善**：新增TYPESCRIPT-MIGRATION.md迁移指南
- 🔄 **下阶段计划**：组件Props/Emit类型定义，视图组件逐步迁移

### v2.3.0 (2025-08-31)
### v2.3.1 (2025-09-01)
- 新增：TicketSummary / TicketAnalytics 类型定义建议
- 新增：reopen 操作前端占位（需要权限 business:ticket:reopen）
- 新增：统计接口调用缓存策略（首页 10s 软缓存；列表可即时刷新）
- 补充：调用统计 API 时避免魔法字段，统一解构 byStatus/byPriority
- 待办：图表组件（SLA 饼图 / 时长柱状）与 types/api/ticketReport.ts 落地
- 新增：TypeScript 迁移优先级与过渡模式（JS 透传策略）
- 新增：登录 + getInfo 响应兼容方案与统一化指引
- 新增：API 类型模式（ApiResult / PageResult / extractToken）
- 新增：Mock 可配置化步骤与风险说明
- 新增：调试辅助变量规范与清理策略
- 新增：TS 配置关键点与类型目录建议
- 强化：覆盖率门禁与最小测试基线说明
- 强化：错误处理章节补充登录兼容 5.3

### v2.2.0 (2024-08-30)
- 新增：特殊业务API模板
- 新增：实际业务API示例
- 新增：错误处理规范
- 新增：业务服务集成
- 新增：开发调试工具
- 新增：常见问题解决方案
- 优化：目录结构说明

### v2.1.0 (2024-08)
- 更新：API模板改为RuoYi函数导出格式
- 新增：proxy.$modal使用规范
- 新增：getCurrentInstance使用说明
- 更新：权限标识规范化
- 新增：RuoYi组件使用指南
- 优化：目录结构适配business模块

### v2.0.0 (2024-01)
- 初始RuoYi-Vue3规范

---

## 2.3.1 增量补丁（2025-09-06）

### 数据权限参数对齐（mineOnly 别名）
- 新增环境变量 `VITE_API_MINE_ONLY_PARAM` 用于声明后端实际参数名，默认 `mineOnly`。
- 前端通过工具 `withMineOnly(payload, isAdmin)` 注入；若使用别名将“双写”（同时写 `mineOnly=true`）以便灰度过渡。
- 应用范围：工单列表普通/nearDue/overdue 查询，仅非管理员生效。

### 报表下钻
- SLA 饼图点击分段下钻：0=有时限（nearDue）、1=超时（overdue）。
- 列表读取 `route.query.mode` 自动切换并查询。

### 维保导入与模板/失败导出
- API：`importMaintenance`、`downloadMaintenanceTemplate`、`downloadMaintenanceImportErrors`。
- UI：导入弹窗展示总计/成功/失败与错误明细；支持一键导出失败 Excel。

### 巡检详情稳定化
- 生成前确认 + 生成后“是否查看”确认；小按钮/顶部按钮 loading/disabled 一致。
- 暴露测试引用：`form`、`inspectionItems`、`selectedAnomalyIds`、`generateSelectedTickets`、`generateTicketsByIds`。

### 测试策略补充
- 全局测试桩：Element Plus 组件与 `v-loading` 指令；`el-button` 禁用态按属性存在性处理。
- 异步断言前增加微任务/渲染等待，降低 flaky.

**注意**: 本文档为RuoYi-Vue3项目核心技术规范，业务实现请参考CLAUDE-IDC.md扩展文档。
**维护**: 保持与RuoYi框架同步更新，确保规范一致性。
```

这个v2.2版本包含了所有当前遇到的问题解决方案和最佳实践，可以作为项目的完整技术规范文档。

## 2025-09-06 增量（前端规范与协作）

- 交互与状态
  - 生成类动作统一接入 `loading/disabled`，并将 `generating`/`generatingInspectionId` 的置位放在二次确认之后，取消时不出现短暂 loading。
  - 列表与详情的跳转逻辑保持一致：优先询问是否前往首张工单详情，取消则回列表。
- API 契约
  - `generateTickets(inspectionId, anomalies)` 的 `anomalies` 为“异常对象数组”，前端需先 `detectAnomalies` 再按选中项过滤，不可直接上送 id。
  - 路由路径与菜单同源：工单列表统一 `/business/ticket/list`。
- 测试与质量门禁
  - 新增四类用例覆盖过滤/空选择/集成/按钮态；PR 需包含相应断言或说明。
  - `npm run test:run`、`npm run type-check` 作为最低门禁。
- 文案与编码
  - 文案单位（“项/个/率”）与筛选项中文保持一致。
  - 禁止批量编码转换；仅对具体乱码片段手工修复。新文件统一 UTF‑8。
- 提交与回滚
  - 提交信息需包含模块与影响范围（如：Inspection: add selected-only ticket generation）。
  - 涉及交互的提交尽量附上简短 GIF 或测试用例。

## 2.3.2 增量（2025-09-06，Stage A 收尾）
- 工单导出：新增 POST /business/ticket/export；前端列表导出实现（携带筛选/时间/排序/下钻/数据权限），失败兜底与 JSON 错误体提示覆盖单测。
- 报表下钻：SLA 饼图 0→
eardue、1→overdue，列表识别 mode 自动查询（含集成用例）。
- 数据权限：VITE_API_MINE_ONLY_PARAM 别名参数（默认 mineOnly），灰度期双写；后端统一以 selfOnly 收敛（控制层与 Mapper 双重保障）。
- 近到期分钟口径：
  - 列表：GET /business/ticket/list?mode=neardue[&warnBeforeMinutes|warnBeforeHours]
  - 专用：GET /business/ticket/nearDue?warnBeforeMinutes=30
  - 优先 minutes，其次 hours，默认 2 小时。
- 白名单排序：控制层校验 orderByColumn→注入 params.orderBy，Mapper 安全拼接。
- 文档：新增 docs/backend-contracts/ticket-export.md；README/agent/CLAUDE-IDC 对齐。
## 2025-09-06 Update (Stage B · M2)

- Maintenance Detail UX
  - Add Review dialog (approve/reject + comment); refresh timeline after submit
  - Keep Start/Complete flow; Complete supports attachments via `FileUpload`
  - Unify timelines via `getPlanLogs(planId, { type: 'approval'|'execution' })`
  - Empty-state and error-with-retry for both timelines (English placeholders)
- API Mapping (frontend/src/api/business/maintenance.js)
  - `getPlanLogs(planId, { type })` for timelines
  - `getApprovalHistory` now passes `type=approval` (optional; unified path preferred)
  - Keep compatibility with existing endpoints, no breaking changes
- Testing (Vitest)
  - Add `maintenance.detail.flow.test.ts` (start/complete + attachments)
  - Add `maintenance.detail.approve.test.ts` (approve/reject with comment)
  - Reuse global Element Plus stubs in `src/__tests__/setup.ts`
- Contract & Safety
  - Backend adds `GET /business/maintenance/execution/list` (planId filter, data-permission)
  - Maintenance list supports sort whitelist + mineOnly/selfOnly alias (controller + mapper guard)
- Encoding Policy (unchanged)
  - Do not perform batch re-encoding; only fix visible garbled slices manually
  - New files use UTF-8
