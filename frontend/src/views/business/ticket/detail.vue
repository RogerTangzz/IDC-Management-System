<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">{{ $t('business.ticket.dialog.detailTitle') }} - {{ form.ticketNo }}</span>
          <div class="header-buttons">
            <el-button link type="primary" icon="Refresh" @click="getDetail">{{ $t('business.ticket.action.refresh') }}</el-button>
            <el-button link type="primary" icon="Close" @click="handleClose">{{ $t('business.ticket.action.close') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 基础信息 -->
      <el-descriptions :column="3" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.basicInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.ticket.field.ticketNo')">
          <span class="text-primary">{{ form.ticketNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.status')">
          <dict-tag :options="ticket_status" :value="form.status" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.latestAction')">
          <dict-tag :options="ticket_action" :value="form.lastAction" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.latestStatusTime')">
          {{ parseTime(form.lastStatusTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.priority')">
          <dict-tag :options="ticket_priority" :value="form.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.title')" :span="3">
          {{ form.title }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.deadline')">
          <el-countdown v-if="form.status !== 'completed' && form.status !== 'closed'" :value="deadlineValue"
            format="HH:mm:ss" @finish="handleTimeout" />
          <span v-else>{{ parseTime(form.deadline) }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.message.remainTime')">
          <el-tag :type="getTimeoutType()">{{ getRemainTime() }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.assigneeName')">
          {{ form.assigneeName || $t('business.ticket.message.unassigned') }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 报修信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.reportInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.ticket.field.reporterName')">
          {{ form.reporterName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.reporterPhone')">
          {{ form.reporterPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.createTime')">
          {{ parseTime(form.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.discoveryTime')">
          {{ parseTime(form.discoveryTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 故障信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.faultInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.ticket.field.equipment')">
          {{ form.equipment }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.specialty')">
          <dict-tag :options="equipment_specialty" :value="form.specialty" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.location')" :span="2">
          {{ form.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.description')" :span="2">
          <div class="description-content">{{ form.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.emergencyAction')" :span="2">
          <div class="description-content">{{ form.emergencyAction || $t('business.ticket.message.noFile') }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 处理信息 -->
      <el-descriptions :column="2" border class="margin-bottom" v-if="form.status !== 'pending'">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.processInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.ticket.field.assignee')">
          {{ form.assigneeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.startTime')">
          {{ parseTime(startTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.solution')" :span="2">
          <div class="description-content">{{ form.solution || $t('business.ticket.message.processing') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.completionTime')" v-if="form.status === 'completed' || form.status === 'closed'">
          {{ parseTime(form.completionTime) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.duration')" v-if="form.status === 'completed' || form.status === 'closed'">
          {{ form.duration || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 附件信息 -->
      <el-descriptions :column="1" border class="margin-bottom" v-if="form.attachments">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.attachmentInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.ticket.detail.attachmentList')">
          <div class="attachment-list">
            <div v-for="(file, index) in attachmentList" :key="index" class="attachment-item">
              <el-link :href="file.url" target="_blank" :underline="false">
                <el-icon>
                  <Document />
                </el-icon>
                {{ file.name }}
              </el-link>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作日志 -->
      <el-descriptions :column="1" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.ticket.detail.operationLog') }}</span>
        </template>
        <el-descriptions-item label="">
          <div class="log-filters">
            <el-select v-model="logFilters.action" :placeholder="$t('business.ticket.field.latestAction')" clearable size="small" style="width:130px;margin-right:8px" @change="reloadLogs">
              <el-option v-for="opt in actionOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-date-picker v-model="logFilters.daterange" type="datetimerange" range-separator="至" :start-placeholder="$t('business.ticket.field.startTime')" :end-placeholder="$t('business.ticket.report.endDate')" size="small" value-format="YYYY-MM-DD HH:mm:ss" @change="reloadLogs" style="margin-right:8px" />
            <el-button size="small" icon="Refresh" @click="resetLogFilters">{{ $t('business.ticket.action.reset') }}</el-button>
          </div>
          <el-timeline>
            <el-timeline-item v-for="(log, index) in logList" :key="index" :timestamp="parseTime(log.createTime)"
              placement="top" :type="getLogType(log.action)">
              <div class="log-content">
                <span class="log-user">{{ log.operatorName || log.userName || '-' }}</span>
                <span class="log-action">{{ actionLabel(log.action) }}<span v-if="log.oldStatus || log.newStatus">：{{ log.oldStatus || '-' }} → {{ log.newStatus || '-' }}</span></span>
                <div class="log-remark" v-if="log.remark">{{ $t('business.ticket.logAction.remark') }}：{{ log.remark }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <div class="log-pagination" v-if="logPagination.total > logPagination.pageSize">
            <el-pagination
              small
              background
              layout="prev, pager, next, sizes, total"
              :total="logPagination.total"
              :page-size="logPagination.pageSize"
              :current-page="logPagination.pageNum"
              @current-change="handleLogPageChange"
              @size-change="handleLogSizeChange"
              :page-sizes="[5,10,20,50]" />
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" icon="Edit" @click="handleEdit" v-hasPermi="['business:ticket:edit']"
          v-if="form.status !== 'closed'">{{ $t('business.ticket.action.edit') }}</el-button>

        <el-button type="success" icon="User" @click="handleAssign" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'pending'">{{ $t('business.ticket.action.assign') }}</el-button>

        <el-button type="warning" icon="VideoPlay" @click="handleStart" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'assigned'">{{ $t('business.ticket.action.start') }}</el-button>

        <el-button type="success" icon="CircleCheck" @click="handleComplete" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'processing'">{{ $t('business.ticket.action.complete') }}</el-button>

        <el-button type="danger" icon="CircleClose" @click="handleCloseTicket" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'completed'">{{ $t('business.ticket.action.closeTicket') }}</el-button>
  <el-button type="warning" icon="RefreshLeft" @click="handleReopen" v-hasPermi="['business:ticket:reopen']" v-if="form.status === 'closed'">{{ $t('business.ticket.action.reopen') }}</el-button>

        <el-button type="info" icon="Printer" @click="handlePrint">{{ $t('business.ticket.action.print') }}</el-button>

        <el-button icon="Back" @click="handleClose">{{ $t('business.ticket.action.back') }}</el-button>
      </div>
    </el-card>

    <!-- 指派对话框 -->
    <el-dialog :title="$t('business.ticket.dialog.assignTitle')" v-model="assignOpen" width="500px" append-to-body>
      <el-form ref="assignRef" :model="assignForm" :rules="assignRules" label-width="80px">
        <el-form-item :label="$t('business.ticket.field.assigneeName')" prop="assigneeId">
          <el-select v-model="assignForm.assigneeId" :placeholder="$t('business.ticket.placeholder.selectAssigneeShort')">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.ticket.field.remark')" prop="remark">
          <el-input v-model="assignForm.remark" type="textarea" :rows="3" :placeholder="$t('business.ticket.placeholder.inputRemark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssign">{{ $t('business.ticket.message.confirm') }}</el-button>
          <el-button @click="assignOpen = false">{{ $t('business.ticket.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 完成对话框 -->
    <el-dialog :title="$t('business.ticket.dialog.completeTitle')" v-model="completeOpen" width="600px" append-to-body>
      <el-form ref="completeRef" :model="completeForm" :rules="completeRules" label-width="100px">
        <el-form-item :label="$t('business.ticket.field.solution')" prop="solution">
          <el-input v-model="completeForm.solution" type="textarea" :rows="4" :placeholder="$t('business.ticket.placeholder.inputSolution')" />
        </el-form-item>
        <el-form-item :label="$t('business.ticket.field.result')" prop="result">
          <el-radio-group v-model="completeForm.result">
            <el-radio label="resolved">{{ $t('business.ticket.result.resolved') }}</el-radio>
            <el-radio label="temporary">{{ $t('business.ticket.result.temporary') }}</el-radio>
            <el-radio label="transferred">{{ $t('business.ticket.result.transferred') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('business.ticket.field.remark')" prop="remark">
          <el-input v-model="completeForm.remark" type="textarea" :rows="3" :placeholder="$t('business.ticket.placeholder.inputRemark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitComplete">{{ $t('business.ticket.message.confirm') }}</el-button>
          <el-button @click="completeOpen = false">{{ $t('business.ticket.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TicketDetail">
import { getCurrentInstance, ref, onMounted, computed } from 'vue'
import { getTicket, assignTickets, updateTicket } from '@/api/business/ticket'
import request from '@/utils/request'
import { reopenTicket } from '@/api/business/ticket'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { getTicket, updateTicket } from "@/api/business/ticket" // 后端集成后恢复
// import { listUser } from "@/api/system/user" // 当前使用本地 mock

const { t } = useI18n()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const ticketId = route.params.ticketId || route.params.id
const loading = ref(false)
const assignOpen = ref(false)
const completeOpen = ref(false)
const userList = ref([])
const logList = ref([])
const logPagination = ref({ pageNum:1, pageSize:10, total:0 })
const logFilters = ref({ action: '', daterange: [] })
const actionOptions = ref([])
const attachmentList = ref([])

// 字典数据
  const { ticket_status, ticket_priority, equipment_specialty, ticket_action } = proxy.useDict('ticket_status', 'ticket_priority', 'equipment_specialty', 'ticket_action')

onMounted(() => {
  // 动态字典填充动作选项（注意 ticket_action 是 ref）
  actionOptions.value = (ticket_action?.value || []).map(d => ({ value: d.value, label: d.label }))
})

// 表单数据
const form = ref({})
// 从日志推导的辅助显示字段
const startTime = ref('')
const assignForm = ref({
  assigneeId: undefined,
  remark: ''
})
const completeForm = ref({
  solution: '',
  result: 'resolved',
  remark: ''
})

// 验证规则
const assignRules = {
  assigneeId: [{ required: true, message: t("business.ticket.validation.assigneeRequired"), trigger: "change" }]
}
const completeRules = {
  solution: [{ required: true, message: t("business.ticket.validation.solutionRequired"), trigger: "blur" }],
  result: [{ required: true, message: t("business.ticket.validation.resultRequired"), trigger: "change" }]
}

/** 获取工单详情 */

async function getDetail() {
  if (!ticketId) return
  loading.value = true
  const { data } = await getTicket(ticketId)
  if (!data) { router.replace('/business/ticket/list'); return }
  form.value = { ...data }
  await loadLogs()
  attachmentList.value = []
  loading.value = false
}

/** 获取剩余时间 */
function getRemainTime() {
  if (!form.value.deadline || form.value.status === 'completed' || form.value.status === 'closed') {
    return '-'
  }
  const now = new Date()
  const deadline = new Date(form.value.deadline)
  const diff = deadline - now

  if (diff <= 0) {
    return t('business.ticket.message.timeoutStatus')
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}

/** 获取超时类型 */
function getTimeoutType() {
  const remain = getRemainTime()
  if (remain === t('business.ticket.message.timeoutStatus')) return 'danger'
  if (remain.includes('小时') && parseInt(remain) < 2) return 'warning'
  return 'success'
}

/** 超时处理 */
function handleTimeout() {
  proxy.$modal.msgWarning(t("business.ticket.message.timeout"))
}

/** 编辑 */
function handleEdit() {
  router.push(`/business/ticket/edit/${ticketId}?from=detail`)
}

/** 指派 */
function handleAssign() {
  assignForm.value = {
    assigneeId: undefined,
    remark: ''
  }
  assignOpen.value = true
  getUserList()
}

/** 提交指派 */
function submitAssign() {
  proxy.$refs["assignRef"].validate(async valid => {
    if (!valid) return
    const user = userList.value.find(u => u.userId === assignForm.value.assigneeId)
    if (!user) return
    await assignTickets({ ticketIds: [ticketId], assigneeId: user.userId, assigneeName: user.nickName })
    proxy.$modal.msgSuccess(t('business.ticket.message.assignSuccess'))
    assignOpen.value = false
    getDetail()
  })
}

/** 开始处理 */
function handleStart() {
  proxy.$modal.confirm(t('business.ticket.message.confirmStart')).then(async () => {
    await request.post(`/business/ticket/start/${ticketId}`)
    proxy.$modal.msgSuccess(t('business.ticket.message.startSuccess'))
    getDetail()
  }).catch(() => { })
}

/** 完成工单 */
function handleComplete() {
  completeForm.value = {
    solution: '',
    result: 'resolved',
    remark: ''
  }
  completeOpen.value = true
}

/** 提交完成 */
function submitComplete() {
  proxy.$refs["completeRef"].validate(async valid => {
    if (!valid) return
    await request.post('/business/ticket/complete', { ticketId, solution: completeForm.value.solution, result: completeForm.value.result })
    proxy.$modal.msgSuccess(t('business.ticket.message.completeSuccess'))
    completeOpen.value = false
    getDetail()
  })
}

/** 关闭工单 */
function handleCloseTicket() {
  proxy.$modal.confirm(t('business.ticket.message.confirmClose')).then(async () => {
    await request.post(`/business/ticket/close/${ticketId}`)
    proxy.$modal.msgSuccess(t('business.ticket.message.closeSuccess'))
    getDetail()
  }).catch(() => { })
}

/** 重新打开 */
function handleReopen(){
  proxy.$modal.confirm(t('business.ticket.message.confirmReopen')).then(async ()=>{
    await reopenTicket(ticketId)
    proxy.$modal.msgSuccess(t('business.ticket.message.reopenSuccess'))
    getDetail()
  }).catch(()=>{})
}

/** 打印 */
function handlePrint() {
  window.print()
}

/** 返回 */
function handleClose() {
  router.back()
}

/** 获取用户列表 */
function getUserList() {
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' }
  ]
}

onMounted(() => {
  getDetail()
  getUserList()
})

// 倒计时展示所需的毫秒时间戳
const deadlineValue = computed(() => {
  if (!form.value.deadline) return Date.now()
  if (typeof form.value.deadline === 'number') return form.value.deadline
  const d = new Date(String(form.value.deadline).replace(/-/g, '/'))
  const ts = d.getTime()
  return isNaN(ts) ? Date.now() : ts
})

// 日志加载与筛选
async function loadLogs(){
  const { pageNum, pageSize } = logPagination.value
  const params = { pageNum, pageSize }
  if (logFilters.value.action) params.action = logFilters.value.action
  if (logFilters.value.daterange && logFilters.value.daterange.length === 2) {
    params.beginTime = logFilters.value.daterange[0]
    params.endTime = logFilters.value.daterange[1]
  }
  const res = await request.get(`/business/ticket/${ticketId}/logs`, { params })
  const rows = res.rows || res.data || []
  logList.value = rows
  logPagination.value.total = res.total || 0
  // 推导开始时间（最近一次 start）
  const start = rows.find(r => r.action === 'start')
  startTime.value = start ? start.createTime : ''
}

function handleLogPageChange(p){ logPagination.value.pageNum = p; loadLogs() }
function handleLogSizeChange(s){ logPagination.value.pageSize = s; loadLogs() }
function resetLogFilters(){ logFilters.value = { action:'', daterange:[] }; logPagination.value.pageNum=1; loadLogs() }
function reloadLogs(){ logPagination.value.pageNum=1; loadLogs() }

function actionLabel(a){
  const item = (ticket_action?.value || []).find(d=>d.value===a)
  return item?item.label:a
}
function getLogType(a){
  switch(a){
    case 'create': return 'primary'
    case 'assign': return 'info'
    case 'start': return 'warning'
    case 'complete': return 'success'
    case 'close': return 'danger'
    case 'reopen': return 'warning'
    default: return ''
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: bold;
  }
}

.margin-bottom {
  margin-bottom: 20px;
}

.descriptions-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.description-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.text-primary {
  color: #409EFF;
  font-weight: bold;
}

.attachment-list {
  .attachment-item {
    margin-bottom: 5px;
  }
}

.log-content {
  .log-user {
    font-weight: bold;
    margin-right: 10px;
  }

  .log-remark {
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
  }
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

@media print {
  .action-buttons {
    display: none;
  }
}
</style>
