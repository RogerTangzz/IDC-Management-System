基于当前规范文档，以下是更新后的 **CLAUDE.md v2.3**（新增 TypeScript 迁移与测试基线策略）：

```markdown
# CLAUDE.md — 智能开发助手规范 v2.3（RuoYi-Vue3 前端）

版本: 2.3.0
适用范围: RuoYi-Vue3 (Vue 3 + Element Plus + Vite) 前端项目
核心目标: 提供精准的架构决策、高质量的代码生成、智能的开发辅助
更新日期: 2025-08-31

本版新增：TypeScript 渐进式迁移规范、Mock/真实后端双通道策略、登录响应非统一结构兼容指引、Vitest 基线与覆盖率门禁、动态路由与权限过滤回归测试要点。

> 若与旧版有差异，以本版本约定为准；CLAUDE-IDC.md 为业务扩展规范，需配合阅读。

---

## -1. 版本 2.3 增量摘要（快速阅读）
| 主题 | 变更 | 要求 |
|------|------|------|
| TypeScript 迁移 | 统一使用 `ESNext` + `moduleResolution: Bundler`，禁止 NodeNext | 新增文件默认 .ts / .d.ts |
| Store 转换 | JS store 采用“同名 .ts + legacy .js 透传”过渡 | 保持导入路径不变 |
| Mock 策略 | `import '../mock'` 集中于 `utils/request.ts`，计划引入 `VITE_ENABLE_MOCK` 开关 | 生产禁用 mock |
| 登录兼容 | 支持 `{code,msg,token}` 与 `{code,msg,data:{token}}` / 顶层 user 信息 | 新接口尽量统一成 data 包裹 |
| getInfo 兼容 | 兼容顶层 `{user,roles,permissions}` 与 data 包裹 | 编写新接口：保持 data 包裹一致 |
| 权限过滤 | 允许无 roles/permissions 的公共路由保留 | 测试覆盖公共路由存在性 |
| 测试基线 | Vitest + jsdom；Pinia / 组件关键 mock | 新增模块需≥1正向+1异常用例 |
| 覆盖率 | 初始总线阈值：lines 60 / branches 50；差异文件≥80% | CI Gate（规划中） |
| 调试标记 | 登录流程保留 `window.__lastLoginResponse` / `__lastLoginError` | 禁止生产泄露敏感信息（后续移除） |

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

### 0.3 TypeScript 迁移优先级
```
优先级层级：
1. 基础核心：utils/request.ts, store/modules/permission.ts, store/modules/user.ts
2. 路由定义：router/*.ts 与业务模块 route meta
3. 业务 API：src/api/** （统一导出函数 + 类型）
4. 领域工具：utils/business/**
5. 视图复用组件：components/** （逐步引入 props/emit 类型）
6. 页面视图：views/** （低频改动末尾迁移）
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

### v2.3.0 (2025-08-31)
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

**注意**: 本文档为RuoYi-Vue3项目核心技术规范，业务实现请参考CLAUDE-IDC.md扩展文档。
**维护**: 保持与RuoYi框架同步更新，确保规范一致性。
```

这个v2.2版本包含了所有当前遇到的问题解决方案和最佳实践，可以作为项目的完整技术规范文档。