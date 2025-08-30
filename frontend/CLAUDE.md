基于当前规范文档，以下是完整更新版的 **CLAUDE.md v2.2**：

```markdown
# CLAUDE.md — 智能开发助手规范 v2.2（RuoYi-Vue3 前端）

版本: 2.2.0
适用范围: RuoYi-Vue3 (Vue 3 + Element Plus + Vite) 前端项目
核心目标: 提供精准的架构决策、高质量的代码生成、智能的开发辅助
更新日期: 2024-08-30

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

## 更新日志

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