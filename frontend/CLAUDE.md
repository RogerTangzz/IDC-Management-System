CLAUDE.md — 智能开发助手规范 v2.1（RuoYi-Vue3 前端）

版本: 2.1.0
适用范围: RuoYi-Vue3 (Vue 3 + Element Plus + Vite) 前端项目
核心目标: 提供精准的架构决策、高质量的代码生成、智能的开发辅助


0. 快速决策树
0.1 功能开发决策流
新功能需求 → 评估影响域
├── 纯展示功能 → views/business/{module}/ + api/business/
├── 复用组件 → components/ + 可能的 directive/
├── 全局状态 → store/modules/ + api/business/
├── 权限相关 → permission.js + router/ + views/
└── 工具函数 → utils/business/ + 单元测试
0.2 代码放置决策（RuoYi规范强化）
代码类型判断：
├── HTTP请求 → MUST: src/api/business/{module}.js (函数导出)
├── 页面组件 → src/views/business/{module}/
├── 通用组件 → src/components/{category}/
├── 状态管理 → src/store/modules/{domain}.js
├── 业务工具 → src/utils/business/{service}.js
└── 静态资源 → src/assets/{type}/

1. 项目环境与依赖
1.1 环境要求（MUST）
json{
  "node": ">=18.0.0",
  "npm": ">=9.0.0",
  "vue": "^3.4.0",
  "element-plus": "^2.4.0",
  "vite": "^5.0.0",
  "axios": "^1.6.0"
}
1.2 环境变量规范
bash# .env.development
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_ENV=development
VITE_APP_BASE_API=/dev-api
VITE_BUILD_COMPRESS=none

# .env.production  
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_ENV=production
VITE_APP_BASE_API=https://api.domain.com
VITE_BUILD_COMPRESS=gzip

2. 目录结构与职责边界（RuoYi规范版）
2.1 标准目录结构
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
│   ├── DictTag/      # 字典标签
│   ├── Pagination/   # 分页组件
│   └── RightToolbar/ # 右侧工具栏
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
2.2 文件命名规范
javascript// 组件文件：PascalCase
UserProfile.vue
DataTable.vue

// JS模块：camelCase  
userApi.js
dateUtils.js

// 业务页面：小写
index.vue    // 列表页
create.vue   // 创建页
detail.vue   // 详情页

// 常量文件：kebab-case 或 camelCase
constants.js
dict-data.js

3. RuoYi规范API模板
3.1 API模块模板（函数导出）
javascript// src/api/business/{module}.js
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
3.2 列表页面模板（RuoYi规范）
vue<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['business:{module}:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:{module}:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:{module}:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:{module}:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="{module}List" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:{module}:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:{module}:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="{module}Ref" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="{Module}">
import { list{Module}, get{Module}, del{Module}, add{Module}, update{Module} } from "@/api/business/{module}";

const { proxy } = getCurrentInstance();

const {module}List = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined
  },
  rules: {
    name: [{ required: true, message: "名称不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询列表 */
function getList() {
  loading.value = true;
  list{Module}(queryParams.value).then(response => {
    {module}List.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    {module}Id: undefined,
    name: undefined
  };
  proxy.resetForm("{module}Ref");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.{module}Id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const {module}Id = row.{module}Id || ids.value[0];
  get{Module}({module}Id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["{module}Ref"].validate(valid => {
    if (valid) {
      if (form.value.{module}Id != undefined) {
        update{Module}(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        add{Module}(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const {module}Ids = row.{module}Id || ids.value;
  proxy.$modal.confirm('是否确认删除？').then(function() {
    return del{Module}({module}Ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/{module}/export', {
    ...queryParams.value
  }, `{module}_${new Date().getTime()}.xlsx`)
}

getList();
</script>

4. RuoYi组件使用规范
4.1 必须使用的RuoYi组件
javascript// 1. 消息提示 - 使用 proxy.$modal
proxy.$modal.msgSuccess("操作成功");
proxy.$modal.msgError("操作失败");
proxy.$modal.msgWarning("警告信息");
proxy.$modal.msgInfo("提示信息");

// 2. 确认框 - 使用 proxy.$modal.confirm
proxy.$modal.confirm('确认删除吗？').then(() => {
  // 确认操作
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
4.2 权限控制规范
javascript// 权限指令格式
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

5. 架构决策指南
5.1 状态管理决策树
javascript// 决策：数据应该放在哪里？
const stateDecisionTree = {
  '数据是否跨组件共享？': {
    是: {
      '是否涉及用户会话？': {
        是: 'store/modules/user.js',
        否: {
          '是否是全局配置？': {
            是: 'store/modules/app.js',
            否: {
              '是否是字典数据？': {
                是: 'store/modules/dict.js',
                否: '创建新的store模块'
              }
            }
          }
        }
      }
    },
    否: {
      '是否需要持久化？': {
        是: 'sessionStorage/localStorage + 组件state',
        否: '组件内部ref/reactive'
      }
    }
  }
}
5.2 API调用决策
javascript// 决策：如何组织API调用？
const apiCallPattern = {
  // 标准CRUD操作
  standard: {
    list: 'list{Module}',    // 列表查询
    get: 'get{Module}',      // 详情查询
    add: 'add{Module}',      // 新增
    update: 'update{Module}', // 修改
    del: 'del{Module}',      // 删除
    export: 'export{Module}'  // 导出
  },
  
  // 特殊业务操作
  business: {
    pattern: '{action}{Module}',
    examples: [
      'assignTicket',       // 指派工单
      'approveMainenance',  // 审批维保
      'generateTickets'     // 生成工单
    ]
  }
}

6. 错误处理与异常管理
6.1 统一错误处理（RuoYi规范）
javascript// src/utils/request.js 中已配置
service.interceptors.response.use(res => {
  const code = res.data.code || 200;
  const msg = res.data.msg || errorCode[code] || errorCode['default'];
  
  if (code === 401) {
    // 处理未授权
    MessageBox.confirm('登录状态已过期', '系统提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      store.dispatch('LogOut').then(() => {
        location.href = '/index';
      })
    })
  } else if (code === 500) {
    Message({ message: msg, type: 'error' })
    return Promise.reject(new Error(msg))
  } else if (code !== 200) {
    Notification.error({ title: msg })
    return Promise.reject('error')
  }
  return res.data;
}, error => {
  // 处理网络错误
  let { message } = error;
  if (message == "Network Error") {
    message = "后端接口连接异常";
  } else if (message.includes("timeout")) {
    message = "系统接口请求超时";
  } else if (message.includes("Request failed with status code")) {
    message = "系统接口" + message.substr(message.length - 3) + "异常";
  }
  Message({ message: message, type: 'error', duration: 5 * 1000 })
  return Promise.reject(error)
})
6.2 页面级错误处理
javascript// 在页面中处理特定错误
function handleSubmit() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      addModule(form.value).then(response => {
        proxy.$modal.msgSuccess("新增成功");
        open.value = false;
        getList();
      }).catch(error => {
        // 特定错误处理
        if (error.code === 'DUPLICATE_KEY') {
          proxy.$modal.msgError("数据已存在");
        }
      });
    }
  });
}

7. 性能优化规范
7.1 路由懒加载（RuoYi标准）
javascript// router/index.js
{
  path: '/business',
  component: Layout,
  hidden: false,
  redirect: 'noRedirect',
  alwaysShow: true,
  meta: { title: '业务管理', icon: 'monitor' },
  children: [
    {
      path: 'ticket',
      component: () => import('@/views/business/ticket/index'),
      name: 'Ticket',
      meta: { title: '工单管理', icon: 'edit' }
    },
    {
      path: 'inspection',
      component: () => import('@/views/business/inspection/index'),
      name: 'Inspection',
      meta: { title: '巡检管理', icon: 'search' }
    }
  ]
}
7.2 组件缓存策略
javascript// 使用 keep-alive 缓存列表页
<template>
  <keep-alive :include="cachedViews">
    <router-view :key="key" />
  </keep-alive>
</template>

<script setup>
const cachedViews = computed(() => {
  return ['TicketList', 'InspectionList', 'MaintenanceList']
})
</script>

8. 安全规范
8.1 输入验证（前端）
javascript// src/utils/validate.js
// 基础验证
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

// 业务验证
export function validPhone(str) {
  const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
  return reg.test(str)
}

// 表单规则中使用
const rules = {
  phone: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    { validator: validPhone, trigger: "blur" }
  ]
}
8.2 XSS防护
javascript// 使用 v-text 替代 v-html
<span v-text="content"></span>

// 必须使用 v-html 时进行过滤
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(dirtyHTML);

9. 测试规范
9.1 单元测试模板
javascript// tests/unit/views/business/ticket.spec.js
import { mount } from '@vue/test-utils'
import Ticket from '@/views/business/ticket/index.vue'

describe('Ticket Management', () => {
  it('renders properly', () => {
    const wrapper = mount(Ticket)
    expect(wrapper.exists()).toBe(true)
  })

  it('loads ticket list on mount', async () => {
    const wrapper = mount(Ticket)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.ticketList).toBeDefined()
  })
})

10. Git提交规范
10.1 提交类型
bashfeat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
perf: 性能优化
test: 测试相关
build: 构建相关
ci: CI配置
chore: 其他修改
10.2 提交示例
bash# 格式: <type>(<scope>): <subject>
feat(ticket): 添加工单批量指派功能
fix(inspection): 修复巡检异常检测逻辑
docs(readme): 更新部署文档
refactor(api): 统一API调用规范为RuoYi格式

11. 代码审查清单
markdown## RuoYi规范检查
- [ ] API使用函数导出而非对象
- [ ] 使用 proxy.$modal 而非 ElMessage
- [ ] 使用 proxy.resetForm 重置表单
- [ ] 权限标识符合 business:module:action 格式
- [ ] 使用 getCurrentInstance 获取 proxy

## 代码质量检查
- [ ] 无硬编码URL
- [ ] 有适当的错误处理
- [ ] 无console.log
- [ ] 敏感数据已脱敏

## 性能检查
- [ ] 路由使用懒加载
- [ ] 大列表有分页
- [ ] 图片有懒加载

12. 项目特定配置
12.1 IDC业务模块配置
javascript// 业务模块路径映射
const businessModules = {
  ticket: {
    path: '/business/ticket',
    api: '/api/business/ticket.js',
    views: '/views/business/ticket/'
  },
  inspection: {
    path: '/business/inspection',
    api: '/api/business/inspection.js',
    views: '/views/business/inspection/'
  },
  maintenance: {
    path: '/business/maintenance',
    api: '/api/business/maintenance.js',
    views: '/views/business/maintenance/'
  }
}

更新日志
v2.1.0 (2024-08)

更新：API模板改为RuoYi函数导出格式
新增：proxy.$modal使用规范
新增：getCurrentInstance使用说明
更新：权限标识规范化
新增：RuoYi组件使用指南
优化：目录结构适配business模块

v2.0.0 (2024-01)

初始RuoYi-Vue3规范



注意: 本文档为RuoYi-Vue3项目核心技术规范，业务实现请参考CLAUDE-IDC.md扩展文档。
维护: 保持与RuoYi框架同步更新，确保规范一致性。