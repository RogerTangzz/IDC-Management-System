<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">工单详情 - {{ form.ticketNo }}</span>
          <div class="header-buttons">
            <el-button link type="primary" icon="Refresh" @click="getDetail">刷新</el-button>
            <el-button link type="primary" icon="Close" @click="handleClose">关闭</el-button>
          </div>
        </div>
      </template>

      <!-- 基础信息 -->
      <el-descriptions :column="3" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">基础信息</span>
        </template>
        <el-descriptions-item label="工单编号">
          <span class="text-primary">{{ form.ticketNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="工单状态">
          <dict-tag :options="ticket_status" :value="form.status" />
        </el-descriptions-item>
        <el-descriptions-item label="最新动作">
          <dict-tag :options="ticket_action" :value="form.lastAction" />
        </el-descriptions-item>
        <el-descriptions-item label="最新状态时间">
          {{ parseTime(form.lastStatusTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <dict-tag :options="ticket_priority" :value="form.priority" />
        </el-descriptions-item>
        <el-descriptions-item label="工单标题" :span="3">
          {{ form.title }}
        </el-descriptions-item>
        <el-descriptions-item label="处理时限">
          <el-countdown v-if="form.status !== 'completed' && form.status !== 'closed'" :value="deadlineValue"
            format="HH:mm:ss" @finish="handleTimeout" />
          <span v-else>{{ parseTime(form.deadline) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="剩余时间">
          <el-tag :type="getTimeoutType()">{{ getRemainTime() }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="指派给">
          {{ form.assigneeName || '未指派' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 报修信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">报修信息</span>
        </template>
        <el-descriptions-item label="报修人">
          {{ form.reporterName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ form.reporterPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="报修时间">
          {{ parseTime(form.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="发现时间">
          {{ parseTime(form.discoveryTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 故障信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">故障信息</span>
        </template>
        <el-descriptions-item label="故障设备">
          {{ form.equipment }}
        </el-descriptions-item>
        <el-descriptions-item label="设备专业">
          <dict-tag :options="equipment_specialty" :value="form.specialty" />
        </el-descriptions-item>
        <el-descriptions-item label="设备位置" :span="2">
          {{ form.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">
          <div class="description-content">{{ form.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="应急处置" :span="2">
          <div class="description-content">{{ form.emergencyAction || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 处理信息 -->
      <el-descriptions :column="2" border class="margin-bottom" v-if="form.status !== 'pending'">
        <template #title>
          <span class="descriptions-title">处理信息</span>
        </template>
        <el-descriptions-item label="处理人">
          {{ form.assigneeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ parseTime(startTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理方法" :span="2">
          <div class="description-content">{{ form.solution || '处理中...' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" v-if="form.status === 'completed' || form.status === 'closed'">
          {{ parseTime(form.completionTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="处理耗时" v-if="form.status === 'completed' || form.status === 'closed'">
          {{ form.duration || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 附件信息 -->
      <el-descriptions :column="1" border class="margin-bottom" v-if="form.attachments">
        <template #title>
          <span class="descriptions-title">附件信息</span>
        </template>
        <el-descriptions-item label="附件列表">
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
          <span class="descriptions-title">操作日志</span>
        </template>
        <el-descriptions-item label="">
          <div class="log-filters">
            <el-select v-model="logFilters.action" placeholder="动作" clearable size="small" style="width:130px;margin-right:8px" @change="reloadLogs">
              <el-option v-for="opt in actionOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-date-picker v-model="logFilters.daterange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" size="small" value-format="YYYY-MM-DD HH:mm:ss" @change="reloadLogs" style="margin-right:8px" />
            <el-button size="small" icon="Refresh" @click="resetLogFilters">重置</el-button>
          </div>
          <el-timeline>
            <el-timeline-item v-for="(log, index) in logList" :key="index" :timestamp="parseTime(log.createTime)"
              placement="top" :type="getLogType(log.action)">
              <div class="log-content">
                <span class="log-user">{{ log.operatorName || log.userName || '-' }}</span>
                <span class="log-action">{{ actionLabel(log.action) }}<span v-if="log.oldStatus || log.newStatus">：{{ log.oldStatus || '-' }} → {{ log.newStatus || '-' }}</span></span>
                <div class="log-remark" v-if="log.remark">备注：{{ log.remark }}</div>
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
          v-if="form.status !== 'closed'">编辑</el-button>

        <el-button type="success" icon="User" @click="handleAssign" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'pending'">指派</el-button>

        <el-button type="warning" icon="VideoPlay" @click="handleStart" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'assigned'">开始处理</el-button>

        <el-button type="success" icon="CircleCheck" @click="handleComplete" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'processing'">完成工单</el-button>

        <el-button type="danger" icon="CircleClose" @click="handleCloseTicket" v-hasPermi="['business:ticket:edit']"
          v-if="form.status === 'completed'">关闭工单</el-button>
  <el-button type="warning" icon="RefreshLeft" @click="handleReopen" v-hasPermi="['business:ticket:reopen']" v-if="form.status === 'closed'">重新打开</el-button>

        <el-button type="info" icon="Printer" @click="handlePrint">打印</el-button>

        <el-button icon="Back" @click="handleClose">返回</el-button>
      </div>
    </el-card>

    <!-- 指派对话框 -->
    <el-dialog title="指派工单" v-model="assignOpen" width="500px" append-to-body>
      <el-form ref="assignRef" :model="assignForm" :rules="assignRules" label-width="80px">
        <el-form-item label="指派给" prop="assigneeId">
          <el-select v-model="assignForm.assigneeId" placeholder="请选择处理人员">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="assignForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssign">确 定</el-button>
          <el-button @click="assignOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 完成对话框 -->
    <el-dialog title="完成工单" v-model="completeOpen" width="600px" append-to-body>
      <el-form ref="completeRef" :model="completeForm" :rules="completeRules" label-width="100px">
        <el-form-item label="处理方法" prop="solution">
          <el-input v-model="completeForm.solution" type="textarea" :rows="4" placeholder="请输入处理方法" />
        </el-form-item>
        <el-form-item label="处理结果" prop="result">
          <el-radio-group v-model="completeForm.result">
            <el-radio label="resolved">已解决</el-radio>
            <el-radio label="temporary">临时处理</el-radio>
            <el-radio label="transferred">转其他部门</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="completeForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitComplete">确 定</el-button>
          <el-button @click="completeOpen = false">取 消</el-button>
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
// import { getTicket, updateTicket } from "@/api/business/ticket" // 后端集成后恢复
// import { listUser } from "@/api/system/user" // 当前使用本地 mock

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
  assigneeId: [{ required: true, message: "请选择处理人员", trigger: "change" }]
}
const completeRules = {
  solution: [{ required: true, message: "请输入处理方法", trigger: "blur" }],
  result: [{ required: true, message: "请选择处理结果", trigger: "change" }]
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
    return '已超时'
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}

/** 获取超时类型 */
function getTimeoutType() {
  const remain = getRemainTime()
  if (remain === '已超时') return 'danger'
  if (remain.includes('小时') && parseInt(remain) < 2) return 'warning'
  return 'success'
}

/** 超时处理 */
function handleTimeout() {
  proxy.$modal.msgWarning("工单已超时，请尽快处理")
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
    proxy.$modal.msgSuccess('指派成功')
    assignOpen.value = false
    getDetail()
  })
}

/** 开始处理 */
function handleStart() {
  proxy.$modal.confirm('确认开始处理该工单吗？').then(async () => {
    await request.post(`/business/ticket/start/${ticketId}`)
    proxy.$modal.msgSuccess('已开始处理')
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
    proxy.$modal.msgSuccess('工单已完成')
    completeOpen.value = false
    getDetail()
  })
}

/** 关闭工单 */
function handleCloseTicket() {
  proxy.$modal.confirm('确认关闭该工单吗？').then(async () => {
    await request.post(`/business/ticket/close/${ticketId}`)
    proxy.$modal.msgSuccess('工单已关闭')
    getDetail()
  }).catch(() => { })
}

/** 重新打开 */
function handleReopen(){
  proxy.$modal.confirm('确认重新打开该工单？').then(async ()=>{
    await reopenTicket(ticketId)
    proxy.$modal.msgSuccess('工单已重新打开')
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
