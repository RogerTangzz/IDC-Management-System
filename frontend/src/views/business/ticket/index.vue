<template>
  <div class="app-container">
    <!-- 搜索表单（组件化） -->
    <TicketSearch
      v-model="queryParams"
      v-model:dateRange="dateRange"
      v-model:showSearch="showSearch"
      :dicts="{ ticket_status, equipment_specialty }"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <!-- 操作工具栏（组件化） -->
    <TicketToolbar
      :single="single"
      :multiple="multiple"
      v-model:showSearch="showSearch"
      @add="handleAdd"
      @update="handleUpdate"
      @delete="handleDelete"
      @batchAssign="handleBatchAssign"
      @export="handleExport"
      @overdue="showOverdue"
      @neardue="showNearDue"
      @refresh="getList"
    />

    <!-- 数据表格（V2，通过 Flag 切换） -->
    <TicketTable
      v-if="useV2"
      :rows="ticketList"
      :loading="loading"
      :dicts="{ ticket_status, ticket_action, equipment_specialty }"
      :getPriorityLabel="getPriorityLabel"
      :getPriorityType="getPriorityType"
      @selectionChange="handleSelectionChange"
      @sortChange="handleSortChange"
      @view="handleView"
      @edit="handleUpdate"
      @delete="handleDelete"
      @reopen="handleReopen"
    />

    <!-- 数据表格（旧实现，保留软回滚） -->
  <el-table v-if="!useV2" v-loading="loading" :data="ticketList" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('business.ticket.field.ticketNo')" align="center" prop="ticketNo" width="120" />
      <el-table-column :label="$t('business.ticket.field.title')" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('business.ticket.field.status')" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.latestAction')" align="center" prop="lastAction" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_action" :value="scope.row.lastAction" />
        </template>
      </el-table-column>
  <el-table-column :label="$t('business.ticket.field.latestStatusTime')" align="center" prop="lastStatusTime" width="160" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastStatusTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.priority')" align="center" prop="priority" width="80">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">
            {{ getPriorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.reporterName')" align="center" prop="reporterName" width="100" />
      <el-table-column :label="$t('business.ticket.field.equipment')" align="center" prop="equipment" width="120" />
      <el-table-column :label="$t('business.ticket.field.specialty')" align="center" prop="specialty" width="100">
        <template #default="scope">
          <dict-tag :options="equipment_specialty" :value="scope.row.specialty" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.assignee')" align="center" prop="assigneeName" width="100" />
      <el-table-column :label="$t('business.ticket.field.timeLimit')" align="center" prop="deadline" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadline) }}</span>
        </template>
      </el-table-column>
  <el-table-column :label="$t('business.ticket.field.createTime')" align="center" prop="createTime" width="160" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('action.operate')" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:ticket:query']">{{ $t('action.view') }}</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:ticket:edit']">{{ $t('action.edit') }}</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:ticket:remove']">{{ $t('action.delete') }}</el-button>
                <el-button link type="primary" icon="RefreshLeft" v-if="scope.row.status==='closed'" @click="handleReopen(scope.row)" v-hasPermi="['business:ticket:reopen']">{{ $t('business.ticket.action.reopen') }}</el-button>
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
            <el-form-item :label="$t('business.ticket.field.title')" prop="title">
              <el-input v-model="form.title" :placeholder="$t('business.ticket.placeholder.inputTitle')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.priority')" prop="priority">
              <el-select v-model="form.priority" :placeholder="$t('business.ticket.placeholder.selectPriority')">
                <el-option :label="$t('business.ticket.priority.high')" value="high" />
                <el-option :label="$t('business.ticket.priority.medium')" value="medium" />
                <el-option :label="$t('business.ticket.priority.low')" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.reporterName')" prop="reporterName">
              <el-input v-model="form.reporterName" :placeholder="$t('business.ticket.placeholder.inputReporter')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.equipment')" prop="equipment">
              <el-input v-model="form.equipment" :placeholder="$t('business.ticket.placeholder.inputEquipment')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.specialty')" prop="specialty">
              <el-select v-model="form.specialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')">
                <el-option :label="$t('business.ticket.specialty.hvac')" value="hvac" />
                <el-option :label="$t('business.ticket.specialty.power')" value="power" />
                <el-option :label="$t('business.ticket.specialty.fire')" value="fire" />
                <el-option :label="$t('business.ticket.specialty.weak')" value="weak" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.discoveryTime')" prop="discoveryTime">
             <el-date-picker v-model="form.discoveryTime" type="datetime" :placeholder="$t('business.ticket.placeholder.selectDiscoveryTimeShort')"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('business.ticket.field.description')" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" :placeholder="$t('business.ticket.placeholder.inputDescription')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('business.ticket.field.emergencyAction')" prop="emergencyAction">
              <el-input v-model="form.emergencyAction" type="textarea" :rows="3" :placeholder="$t('business.ticket.placeholder.inputEmergencyAction')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('action.confirm') }}</el-button>
          <el-button @click="cancel">{{ $t('action.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量指派对话框 -->
    <el-dialog :title="$t('business.ticket.dialog.batchAssignTitle')" v-model="assignOpen" width="400px" append-to-body>
      <el-form ref="assignRef" :model="assignForm" label-width="80px">
        <el-form-item :label="$t('business.ticket.field.assignee')" prop="userId">
          <el-select v-model="assignForm.userId" :placeholder="$t('business.ticket.placeholder.selectAssigneeShort')">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssign">{{ $t('action.confirm') }}</el-button>
          <el-button @click="assignOpen = false">{{ $t('action.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Ticket">
import { ref, reactive, getCurrentInstance, toRefs, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseTime } from '@/utils/ruoyi'
import { listTicket, addTicket, updateTicket, delTicket, assignTickets, reopenTicket, getOverdueTickets, getNearDueTickets, getTicket } from '@/api/business/ticket'
import { listUser } from '@/api/system/user'
import useUserStore from '@/store/modules/user'
import { withMineOnly } from '@/utils/business/mineOnly'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
// P1: 统一查询/排序/安全请求等工具函数
import { normalizeQueryFromRoute, buildExportParams, getPriorityLabel as utilGetPriorityLabel, getPriorityType as utilGetPriorityType } from '@/views/business/ticket/index.util'
import { track } from '@/infra/telemetry'
import TicketSearch from './list/TicketSearch.vue'
import TicketToolbar from './list/TicketToolbar.vue'
import TicketTable from './list/TicketTable.vue'
import FeatureFlags from '@/config/FeatureFlags'
import useAppStore from '@/store/modules/app'
import { isFlagOn } from '@/config/FlagEvaluator'
import { __env } from '@/utils/flags'
import { useTicketList } from './useTicketList'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { t } = useI18n()
// 全局字典
const { ticket_status, equipment_specialty, ticket_action } = proxy.useDict('ticket_status', 'equipment_specialty', 'ticket_action')

const open = ref(false)
const assignOpen = ref(false)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref("")
// 角色判断：简易管理员判断（包含 'admin' 或 'ROLE_ADMIN'）
const isAdmin = computed(() => Array.isArray(userStore.roles) && (userStore.roles.includes('admin') || userStore.roles.includes('ROLE_ADMIN')))
const userList = ref([])
const assignableUsers = ref<any[]>([])
let assignLoadPromise: Promise<any[]> | null = null
// 统一列表逻辑到组合式（保持对外同名引用，以兼容现有用例）
const list = useTicketList({ listTicket, getOverdueTickets, getNearDueTickets, withMineOnly, isAdmin })
const ticketList = list.ticketList
const loading = list.loading
const total = list.total
const dateRange = list.dateRange
const specialMode = list.specialMode

// 按放量规则评估并监听 USE_TICKET_TEMPLATE_V2（用作 UI 切换/软回滚）
const useV2 = ref(false)
function evaluateV2() {
  try {
    const ctx = { userId: userStore.id, roles: userStore.roles }
    useV2.value = isFlagOn('USE_TICKET_TEMPLATE_V2', __env, ctx)
  } catch {
    useV2.value = FeatureFlags.isEnabled('USE_TICKET_TEMPLATE_V2')
  }
}
let offFlag = null
onMounted(() => { try { evaluateV2(); offFlag = FeatureFlags.onChange('USE_TICKET_TEMPLATE_V2', () => evaluateV2()) } catch {} })
onBeforeUnmount(() => { try { offFlag?.(); offFlag = null } catch {} })

// 使用全局 ticketStore（持久化）
// 取消 Pinia 本地数据，全面改为后端接口

const data = reactive({
  form: {},
  assignForm: {
    userId: undefined
  },
  rules: {
    title: [{ required: true, message: t('business.ticket.validation.titleRequired'), trigger: "blur" }],
    priority: [{ required: true, message: t('business.ticket.validation.priorityNotEmpty'), trigger: "change" }],
    reporterName: [{ required: true, message: t('business.ticket.validation.reporterRequired'), trigger: "blur" }],
    equipment: [{ required: true, message: t('business.ticket.validation.equipmentRequired'), trigger: "blur" }],
    description: [{ required: true, message: t('business.ticket.validation.descriptionRequired'), trigger: "blur" }]
  }
})

const { form, assignForm, rules } = toRefs(data)
const queryParams = list.queryParams

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
async function getList() { await list.getList() }

// 查询去抖：避免快速重复点击触发多次请求
let __fetchTimer = 0
function scheduleFetch() { list.scheduleFetch() }

// 小型内聚工具（本文件内部复用）
function openDialog(titleText) {
  open.value = true
  title.value = String(titleText || '')
  track('dialog_open', { scene: 'ticket_list', component: 'ticket_list/toolbar', action: titleText?.includes(t('business.ticket.action.add')) ? 'open_add' : 'open_update' })
}
function setCreatedFields(created) {
  if (created && created.ticketId) {
    form.value.ticketId = created.ticketId
    form.value.ticketNo = created.ticketNo
  }
}
function applySpecialMode(mode) {
  track('submit', { scene: 'ticket_list', component: 'ticket_list/toolbar', action: 'mode_change', mode: String(mode || '') })
  list.applySpecialMode(mode)
}

function handleSortChange({ prop, order }){
  const sortOrder = order === 'ascending' ? 'asc' : (order === 'descending' ? 'desc' : null)
  track('submit', { scene: 'ticket_list', component: 'ticket_list/table', action: 'sort_change', sortBy: prop || '', sortOrder })
  list.handleSortChange({ prop, order })
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
  track('submit', { scene: 'ticket_list', component: 'ticket_list/search', action: 'search', filtersSnapshot: { ...queryParams.value, dateRange: dateRange.value } })
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
  openDialog(t('business.ticket.dialog.addTitle'))
}

/** 修改按钮操作 */
function findTicketInList(ticketId) {
  if (ticketId == null) return null
  const idStr = String(ticketId)
  return ticketList.value.find(item => {
    const keys = [item?.ticketId, item?.id, item?.ticketNo]
    return keys.some(key => key != null && String(key) === idStr)
  }) || null
}

function resolveTicketForEdit(row) {
  const rowId = row?.ticketId ?? row?.id ?? row?.ticketNo
  if (rowId != null) {
    return findTicketInList(rowId) || row
  }
  if (Array.isArray(ids.value) && ids.value.length) {
    return findTicketInList(ids.value[0])
  }
  return null
}

function handleUpdate(row) {
  const target = resolveTicketForEdit(row)
  if (!target) {
    proxy?.$modal?.msgWarning?.(t('business.ticket.message.selectTicketFirst'))
    return
  }
  reset()
  form.value = { ...target }
  if (!form.value.ticketId) form.value.ticketId = target.ticketId ?? target.id ?? target.ticketNo
  openDialog(t('business.ticket.dialog.updateTitle'))
}
// 若通过 /business/ticket/edit/:ticketId 进入，自动打开编辑弹窗
if (route.name === 'TicketEdit' && route.params.ticketId) {
  const tid = route.params.ticketId

  const openEditDialog = (ticket: any) => {
    reset()
    form.value = { ...ticket }
    if (!form.value.ticketId) {
      form.value.ticketId = ticket.ticketId ?? ticket.id ?? ticket.ticketNo
    }
    openDialog(t('business.ticket.dialog.editTitle'))
    try {
      appStore.toggleSideBarHide(false)
      if (route.name === 'TicketEdit') {
        const nextQuery: Record<string, any> = { ...route.query }
        delete nextQuery.from
        nextQuery.editTicketId = String(form.value.ticketId ?? tid)
        router.replace({ path: '/business/ticket/list', query: nextQuery })
      }
    } catch {}
  }

  const loadTicketForEdit = async () => {
    try {
      await getList()
    } catch {
      // ignore list fetch failure, fallback to detail request
    }
    let ticket = resolveTicketForEdit({ ticketId: tid })
    if (!ticket) {
      try {
        const res: any = await getTicket(tid)
        if (Array.isArray(res?.rows)) {
          ticket = res.rows[0] ?? null
        }
        if (!ticket) {
          ticket = res?.data ?? res ?? null
        }
      } catch {
        ticket = null
      }
    }
    if (ticket) {
      openEditDialog(ticket)
    } else {
      router.replace('/business/ticket/list')
    }
  }

  loadTicketForEdit()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ticketRef"].validate(async valid => {
    if (!valid) { track('validate_false', { scene: 'ticket_list', component: 'ticket_list/form' }); return }
    const payload = { ...form.value }
    const t0 = Date.now()
    track('submit', { scene: 'ticket_list', component: 'ticket_list/form', action: payload.ticketId ? 'update' : 'add' })
    if (!payload.ticketId) {
      const res = await addTicket(payload)
      const created = res?.data || res?.rows || null
      setCreatedFields(created)
      proxy.$modal.msgSuccess(t('business.ticket.message.addSuccess'))
      track('success', { scene: 'ticket_list', action: 'add', durationMs: Math.max(0, Date.now() - t0) })
    } else {
      await updateTicket(payload)
      proxy.$modal.msgSuccess(t('business.ticket.message.updateSuccess'))
      track('success', { scene: 'ticket_list', action: 'update', durationMs: Math.max(0, Date.now() - t0) })
    }
    open.value = false
    reset()
    getList()
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const targetIds = Array.isArray(ids.value) && ids.value.length > 0 && !row?.ticketId ? ids.value : [row.ticketId]
  proxy.$modal.confirm(t('business.ticket.message.confirmDelete', { id: targetIds.join(',') })).then(async () => {
    for (const id of targetIds) await delTicket(id)
    proxy.$modal.msgSuccess(t('business.ticket.message.deleteSuccess'))
    getList()
  }).catch(() => { })
}

/** 重开工单 */
function handleReopen(row){
  const id = row.ticketId
  proxy.$modal.confirm(t('business.ticket.message.confirmReopen')).then(async ()=>{
    await reopenTicket(id)
    proxy.$modal.msgSuccess(t('business.ticket.message.reopenSuccess'))
    getList()
  }).catch(()=>{})
}

/** 批量指派按钮操作 */
async function loadAssignableUsers() {
  if (assignableUsers.value.length) return assignableUsers.value
  if (!assignLoadPromise) {
    assignLoadPromise = (async () => {
      try {
        const res: any = await listUser({ roleKey: 'auditor', pageNum: 1, pageSize: 100 })
        const rows = Array.isArray(res?.rows) ? res.rows : (Array.isArray(res?.data?.rows) ? res.data.rows : (res?.data ?? []))
        assignableUsers.value = rows.map((user: any) => ({
          userId: user.userId ?? user.id ?? user.userName ?? user.accountId,
          nickName: user.nickName ?? user.userName ?? user.name ?? user.realName ?? 'Unnamed'
        })).filter(u => u.userId)
      } catch {
        assignableUsers.value = []
      }
      const result = assignableUsers.value
      assignLoadPromise = null
      return result
    })()
  }
  return assignLoadPromise ?? Promise.resolve(assignableUsers.value)
}

async function handleBatchAssign() {
  assignForm.value.userId = undefined
  assignOpen.value = true
  const users = await loadAssignableUsers()
  userList.value = Array.isArray(users) ? users : []
}

/** 提交指派 */
async function submitAssign() {
  if (!assignForm.value.userId) {
    proxy.$modal.msgWarning(t('business.ticket.validation.assigneeRequired'))
    return
  }
  const user = userList.value.find(u => u.userId === assignForm.value.userId)
  if (!user) return
  await assignTickets({ ticketIds: ids.value, assigneeId: user.userId, assigneeName: user.nickName })
  proxy.$modal.msgSuccess(t('business.ticket.message.assignSuccess'))
  assignOpen.value = false
  getList()
}

/** 导出按钮操作 */
function handleExport() {
  (async () => {
    try {
      const t0 = Date.now()
      track('submit', { scene: 'ticket_list', component: 'ticket_list/toolbar', action: 'export' })
      const params = buildExportParams(queryParams.value, dateRange.value, isAdmin.value, specialMode.value)
      const filename = 'ticket_.xlsx'
      if (proxy?.download) {
        proxy.download('business/ticket/export', params, filename)
      } else {
        await request({ url: '/business/ticket/export', method: 'post', data: params, responseType: 'blob' })
      }
      track('success', { scene: 'ticket_list', action: 'export', durationMs: Math.max(0, Date.now() - t0) })
    } catch (e) {
      console.error('[ticket] export failed', e)
      try { proxy?.$modal?.msgError?.(t('business.ticket.message.exportFailed')) } catch {}
      track('error', { scene: 'ticket_list', action: 'export', errorCode: (e && (e.code || e.status)), errorMessage: String(e && (e.message || e)) })
    }
  })()
}

function showOverdue(){ applySpecialMode('overdue') }
function showNearDue(){ applySpecialMode('neardue') }

const getPriorityLabel = utilGetPriorityLabel
const getPriorityType = utilGetPriorityType

getList()

if (route?.query?.mode === 'overdue') {
  specialMode.value = 'overdue'
  getList()
}
if (route?.query?.mode === 'neardue') {
  specialMode.value = 'neardue'
  getList()
}
</script>


