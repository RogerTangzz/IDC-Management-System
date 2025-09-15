<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工单编号" prop="ticketNo">
        <el-input v-model="queryParams.ticketNo" placeholder="请输入工单编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in ticket_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable>
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:ticket:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:ticket:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:ticket:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="User" :disabled="multiple" @click="handleBatchAssign"
          v-hasPermi="['business:ticket:assign']">批量指派</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:ticket:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="WarningFilled" @click="showOverdue" v-hasPermi="['business:ticket:list']">逾期</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Bell" @click="showNearDue" v-hasPermi="['business:ticket:list']">近到期</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
  <el-table v-loading="loading" :data="ticketList" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工单编号" align="center" prop="ticketNo" width="120" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="最新动作" align="center" prop="lastAction" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_action" :value="scope.row.lastAction" />
        </template>
      </el-table-column>
  <el-table-column label="最新状态时间" align="center" prop="lastStatusTime" width="160" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastStatusTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">
            {{ getPriorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报修人" align="center" prop="reporterName" width="100" />
      <el-table-column label="故障设备" align="center" prop="equipment" width="120" />
      <el-table-column label="设备专业" align="center" prop="specialty" width="100">
        <template #default="scope">
          <dict-tag :options="equipment_specialty" :value="scope.row.specialty" />
        </template>
      </el-table-column>
      <el-table-column label="指派给" align="center" prop="assigneeName" width="100" />
      <el-table-column label="处理时限" align="center" prop="deadline" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadline) }}</span>
        </template>
      </el-table-column>
  <el-table-column label="创建时间" align="center" prop="createTime" width="160" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:ticket:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:ticket:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:ticket:remove']">删除</el-button>
                <el-button link type="primary" icon="RefreshLeft" v-if="scope.row.status==='closed'" @click="handleReopen(scope.row)" v-hasPermi="['business:ticket:reopen']">重开</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改工单对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="ticketRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="工单标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入工单标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="报修人" prop="reporterName">
              <el-input v-model="form.reporterName" placeholder="请输入报修人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障设备" prop="equipment">
              <el-input v-model="form.equipment" placeholder="请输入故障设备" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备专业" prop="specialty">
              <el-select v-model="form.specialty" placeholder="请选择设备专业">
                <el-option label="暖通" value="hvac" />
                <el-option label="配电" value="power" />
                <el-option label="消防" value="fire" />
                <el-option label="弱电" value="weak" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发现时间" prop="discoveryTime">
              <el-date-picker v-model="form.discoveryTime" type="datetime" placeholder="选择故障发现时间"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="故障描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入故障描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="应急处置" prop="emergencyAction">
              <el-input v-model="form.emergencyAction" type="textarea" :rows="3" placeholder="请输入应急处置方法" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量指派对话框 -->
    <el-dialog title="批量指派" v-model="assignOpen" width="400px" append-to-body>
      <el-form ref="assignRef" :model="assignForm" label-width="80px">
        <el-form-item label="指派给" prop="userId">
          <el-select v-model="assignForm.userId" placeholder="请选择处理人">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssign">确 定</el-button>
          <el-button @click="assignOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Ticket">
import { ref, reactive, getCurrentInstance, toRefs, computed, watch } from 'vue'
import { parseTime } from '@/utils/ruoyi'
import { listTicket, addTicket, updateTicket, delTicket, assignTickets, reopenTicket, getOverdueTickets, getNearDueTickets } from '@/api/business/ticket'
import useUserStore from '@/store/modules/user'
import { withMineOnly } from '@/utils/business/mineOnly'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
// P1: 统一查询/排序/安全请求等工具函数
import { buildListQuery, normalizeQueryFromRoute, mapSortChange, toUnderScoreCase, buildExportParams, getPriorityLabel as utilGetPriorityLabel, getPriorityType as utilGetPriorityType } from '@/views/business/ticket/index.util'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const { ticket_status, equipment_specialty, ticket_action } = proxy.useDict('ticket_status', 'equipment_specialty', 'ticket_action')

const ticketList = ref([])
const open = ref(false)
const assignOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
// 角色判断：简易管理员判断（包含 'admin' 或 'ROLE_ADMIN'）
const isAdmin = computed(() => Array.isArray(userStore.roles) && (userStore.roles.includes('admin') || userStore.roles.includes('ROLE_ADMIN')))
const userList = ref([])
// 特殊模式：'' | 'overdue' | 'neardue'
const specialMode = ref('')

// 使用全局 ticketStore（持久化）
// 取消 Pinia 本地数据，全面改为后端接口

const data = reactive({
  form: {},
  assignForm: {
    userId: undefined
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  orderByColumn: undefined,
  isAsc: undefined,
    ticketNo: undefined,
    title: undefined,
    status: undefined,
    priority: undefined,
    equipment: undefined,
    reporterName: undefined
  },
  rules: {
    title: [{ required: true, message: "工单标题不能为空", trigger: "blur" }],
    priority: [{ required: true, message: "优先级不能为空", trigger: "change" }],
    reporterName: [{ required: true, message: "报修人不能为空", trigger: "blur" }],
    equipment: [{ required: true, message: "故障设备不能为空", trigger: "blur" }],
    description: [{ required: true, message: "故障描述不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, assignForm, rules } = toRefs(data)

// P1: 初始化时根据路由参数归一化查询与日期范围（支持别名/模式/分页）
try {
  const init = normalizeQueryFromRoute(route?.query || {})
  Object.assign(queryParams.value, init.queryParams || {})
  if (Array.isArray(init.dateRange)) dateRange.value = init.dateRange
  // 特殊模式从路由带入
  if (route?.query?.mode === 'overdue' || route?.query?.mode === 'neardue') {
    specialMode.value = String(route.query.mode)
  }
} catch {}

// 当路由查询变化时，合并到查询状态并触发刷新（不丢失已有状态）
watch(
  () => route.query,
  (q) => {
    try {
      const norm = normalizeQueryFromRoute(q || {})
      if (norm?.queryParams) Object.assign(queryParams.value, norm.queryParams)
      if (Array.isArray(norm?.dateRange) && norm.dateRange.length === 2) {
        dateRange.value = norm.dateRange
      }
      if (q?.mode === 'overdue' || q?.mode === 'neardue') specialMode.value = String(q.mode)
    } catch {}
    getList()
  },
  { deep: true }
)

/** 查询工单列表 */
async function getList() {
  loading.value = true
  try {
    // P1: 使用 util 统一构建查询参数
    let payload = buildListQuery(queryParams.value, dateRange.value)
    // 非管理员仅查询与自己相关（兼容不同后端参数名）
    payload = withMineOnly(payload, isAdmin.value) /* keep */
    let data, totalCount
    if (specialMode.value === 'overdue') {
      const res = await getOverdueTickets(withMineOnly({ pageNum: payload.pageNum, pageSize: payload.pageSize }, isAdmin.value))
      data = res.data || res.rows; totalCount = res.total
    } else if (specialMode.value === 'neardue') {
      const res = await getNearDueTickets(withMineOnly({ pageNum: payload.pageNum, pageSize: payload.pageSize }, isAdmin.value))
      data = res.data || res.rows; totalCount = res.total
    } else {
      const res = await listTicket(payload)
      // RuoYi TableDataInfo 规范：{ rows, total }
      data = (res && (res.rows || res.data)) || []
      totalCount = (res && (res.total || 0)) || 0
    }
    ticketList.value = data || []
    total.value = totalCount || 0
  } finally {
    loading.value = false
  }
}

// 查询去抖：避免快速重复点击触发多次请求
let __fetchTimer = 0
function scheduleFetch() {
  if (__fetchTimer) clearTimeout(__fetchTimer)
  __fetchTimer = setTimeout(() => { __fetchTimer = 0; getList() }, 50)
}

// 小型内聚工具（本文件内部复用）
function openDialog(titleText) {
  open.value = true
  title.value = String(titleText || '')
}
function setCreatedFields(created) {
  if (created && created.ticketId) {
    form.value.ticketId = created.ticketId
    form.value.ticketNo = created.ticketNo
  }
}
function applySpecialMode(mode) {
  specialMode.value = String(mode || '')
  queryParams.value.pageNum = 1
  getList()
}

function handleSortChange({ prop, order }){
  // P1: 通过 util 限定允许字段并映射方向
  const { sortBy, sortDir } = mapSortChange({ prop, order })
  queryParams.value.orderByColumn = sortBy ? toUnderScoreCase(sortBy) : undefined
  queryParams.value.isAsc = sortDir || undefined
  getList()
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    ticketId: undefined,
    ticketNo: undefined,
    title: undefined,
    priority: 'medium',
    status: 'pending',
    reporterName: undefined,
    equipment: undefined,
    specialty: undefined,
    description: undefined,
    emergencyAction: undefined,
    discoveryTime: undefined
  }
  proxy.resetForm("ticketRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  scheduleFetch()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  specialMode.value = ''
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ticketId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 查看按钮操作 */
function handleView(row) {
  const ticketId = row.ticketId || ids.value[0]
  router.push(`/business/ticket/detail/${ticketId}`)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  openDialog('添加工单')
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  const target = row || (ticketList.value.find(t => t.ticketId === ids.value[0]))
  if (target) {
    form.value = { ...target }
    openDialog('修改工单')
  }
}

// 若通过 /business/ticket/edit/:ticketId 进入，自动打开编辑弹窗
// 通过编辑路由进入时（后端重取）
if (route.name === 'TicketEdit' && route.params.ticketId) {
  const tid = route.params.ticketId
  // 简化：列表刷新后再打开
  getList().then(() => {
    const ticket = ticketList.value.find(t => String(t.ticketId) === String(tid))
    if (ticket) {
      form.value = { ...ticket }
      openDialog('修改工单')
    } else {
      router.replace('/business/ticket/list')
    }
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ticketRef"].validate(async valid => {
    if (!valid) return
    const payload = { ...form.value }
    if (!payload.ticketId) {
      const res = await addTicket(payload)
      // 兼容后端返回 { code, data } 或 { code, rows }
      const created = res?.data || res?.rows || null
      setCreatedFields(created)
      proxy.$modal.msgSuccess('新增成功')
    } else {
      await updateTicket(payload)
      proxy.$modal.msgSuccess('修改成功')
    }
    open.value = false
    reset()
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const targetIds = Array.isArray(ids.value) && ids.value.length > 0 && !row?.ticketId ? ids.value : [row.ticketId]
  proxy.$modal.confirm('是否确认删除工单编号为"' + targetIds.join(',') + '"的数据项？').then(async () => {
    for (const id of targetIds) await delTicket(id)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => { })
}

/** 重开工单 */
function handleReopen(row){
  const id = row.ticketId
  proxy.$modal.confirm('确认重新打开该工单？').then(async ()=>{
    await reopenTicket(id)
    proxy.$modal.msgSuccess('已重新打开')
    getList()
  }).catch(()=>{})
}

/** 批量指派按钮操作 */
function handleBatchAssign() {
  assignForm.value.userId = undefined
  assignOpen.value = true
  // Mock用户列表
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' }
  ]
}

/** 提交指派 */
async function submitAssign() {
  if (!assignForm.value.userId) {
    proxy.$modal.msgWarning('请选择处理人')
    return
  }
  const user = userList.value.find(u => u.userId === assignForm.value.userId)
  if (!user) return
  await assignTickets({ ticketIds: ids.value, assigneeId: user.userId, assigneeName: user.nickName })
  proxy.$modal.msgSuccess('指派成功')
  assignOpen.value = false
  getList()
}

/** 导出按钮操作 */
function handleExport() {
  (async () => {
    try {
      const params = buildExportParams(queryParams.value, dateRange.value, isAdmin.value, specialMode.value)
      const filename = 'ticket_.xlsx'
      if (proxy?.download) {
        proxy.download('business/ticket/export', params, filename)
      } else {
        await request({ url: '/business/ticket/export', method: 'post', data: params, responseType: 'blob' })
      }
    } catch (e) {
      console.error('[ticket] export failed', e)
      try { proxy?.$modal?.msgError?.('导出失败，请稍后重试') } catch {}
    }
  })()
}

function showOverdue(){ applySpecialMode('overdue') }
function showNearDue(){ applySpecialMode('neardue') }

// 直接别名到 util 函数，避免在本文件新增函数分母
const getPriorityLabel = utilGetPriorityLabel
const getPriorityType = utilGetPriorityType

getList()

// 根据路由查询参数设置特殊模式（支持从报表下钻 mode=overdue|neardue）
if (route?.query?.mode === 'overdue') {
  specialMode.value = 'overdue'
  getList()
}
if (route?.query?.mode === 'neardue') {
  specialMode.value = 'neardue'
  getList()
}
</script>


