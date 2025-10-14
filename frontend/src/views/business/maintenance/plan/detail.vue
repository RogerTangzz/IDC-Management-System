<template>
  <div class="app-container">
    <el-page-header @back="goBack" :content="$t('business.maintenance.message.detailTitle')" />

    <el-card class="mb16">
      <template #header>
        <div class="card-header">
          <span>{{ $t('business.maintenance.message.planInfo') }}</span>
          <div class="actions">
            <el-button v-if="canReview" type="warning" size="small" @click="openApprove">{{ $t('business.maintenance.action.initiateReview') }}</el-button>
            <el-button v-if="canStart" type="primary" size="small" @click="onStart">{{ $t('business.maintenance.action.startExecution') }}</el-button>
            <el-button v-if="canComplete" type="success" size="small" @click="openComplete">{{ $t('business.maintenance.action.completeExecution') }}</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item :label="$t('business.maintenance.field.planNo')">{{ plan?.planNo }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.title')">{{ plan?.title }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.floor')">{{ plan?.floor }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.approvalStatus')">
          <dict-tag :options="approval_status" :value="plan?.approvalStatus" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionStatus')">
          <dict-tag :options="execution_status" :value="plan?.executionStatus" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.responsibleName')">{{ plan?.responsibleName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.itemCount')" v-if="itemCount !== undefined">{{ itemCount }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.plannedStartDate')">{{ displayPlannedStart }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.plannedEndDate')">{{ displayPlannedEnd }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="Array.isArray(plan?.attachments) && plan.attachments.length" class="mt12">
        <div class="section-title">{{ $t('business.maintenance.message.attachment') }}</div>
        <el-space wrap>
          <a v-for="(att, idx) in plan.attachments" :key="idx" class="file-link" :href="att" target="_blank">{{ $t('business.maintenance.message.attachment') }} {{ idx + 1 }}</a>
        </el-space>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>{{ $t('business.maintenance.message.approvalHistory') }}</span></template>
          <div v-if="approvalError" class="error-tip">
            <el-alert type="error" :title="$t('business.maintenance.message.loadFailed')" :closable="false" />
            <div><el-button link type="primary" @click="reloadApproval">{{ $t('business.maintenance.action.retry') }}</el-button></div>
          </div>
          <div v-else-if="Array.isArray(approvalHistory) && approvalHistory.length">
            <el-timeline>
              <el-timeline-item v-for="(item, i) in approvalHistory" :key="i" :timestamp="parseTime(item.time)" :type="getApproveType(item)">
                <div>
                  <b>{{ formatApproveAction(item.action) }}</b>
                  <span v-if="item.operatorName"> - {{ item.operatorName }}</span>
                </div>
                <div v-if="item.nextAssigneeName">{{ $t('business.maintenance.message.nextStep') }}{{ item.nextAssigneeName }}</div>
                <div v-if="item.comment">{{ $t('business.maintenance.message.noteLabel') }}{{ item.comment }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="empty-tip">{{ $t('business.maintenance.message.noApprovalRecord') }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>{{ $t('business.maintenance.message.executionRecord') }}</span></template>
          <div v-if="executionError" class="error-tip">
            <el-alert type="error" :title="$t('business.maintenance.message.loadFailed')" :closable="false" />
            <div><el-button link type="primary" @click="reloadExecution">{{ $t('business.maintenance.action.retry') }}</el-button></div>
          </div>
          <div v-else-if="Array.isArray(executionList) && executionList.length">
            <el-timeline>
              <el-timeline-item v-for="(item, i) in executionList" :key="i" :timestamp="parseTime(item.time)" :type="getExecType(item)">
                <div>
                  <b>{{ formatExecAction(item.action) }}</b>
                  <span v-if="item.operatorName"> - {{ item.operatorName }}</span>
                </div>
                <div v-if="item.result">{{ $t('business.maintenance.message.resultLabel') }}{{ item.result }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="empty-tip">{{ $t('business.maintenance.message.noExecutionRecord') }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部操作区（抽取为统一组件，与工单样式对齐） -->
    <DetailFooter
      :can-edit="canEdit"
      :can-print="true"
      :can-back="true"
      @edit="handleEdit"
      @print="handlePrint"
      @back="goBack"
    >
      <template #left>
        <div v-if="isAdmin" class="include-logs">
          <el-switch v-model="includeLogs" :active-text="$t('business.maintenance.message.includeLogs')" :inactive-text="$t('business.maintenance.message.includeLogs')" />
        </div>
      </template>
    </DetailFooter>

    <!-- 打印区域（仅打印时可见） -->
    <div class="print-area">
      <PlanPrint :plan="plan" :approvalHistory="approvalHistory" :executionList="executionList" :includeLogs="isAdmin && includeLogs" />
    </div>

    <el-dialog :title="$t('business.maintenance.dialog.completeTitle')" v-model="completeOpen" width="600px" append-to-body>
      <el-form :model="completeForm" label-width="80px">
        <el-form-item :label="$t('business.maintenance.field.executionResult')">
          <el-input v-model="completeForm.result" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputResult')" />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.attachments')">
          <FileUpload v-model="completeForm.attachments" :limit="6" :file-size="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="completeOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
          <el-button type="primary" @click="onComplete">{{ $t('business.maintenance.message.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="$t('business.maintenance.dialog.approveTitle')" v-model="approveOpen" width="520px" append-to-body>
      <el-form :model="approveForm" label-width="90px">
        <el-form-item :label="$t('business.maintenance.field.result')">
          <el-radio-group v-model="approveForm.result">
            <el-radio-button label="approved">{{ $t('business.maintenance.message.passed') }}</el-radio-button>
            <el-radio-button label="rejected">{{ $t('business.maintenance.message.refuse') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.comment')">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
          <el-button type="primary" @click="onSubmitApproval">{{ $t('business.maintenance.message.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="MaintenancePlanDetail">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/store/modules/user'
import { parseTime } from '@/utils/ruoyi'
import { getMaintenance, getPlanLogs, startExecution, completeExecution, approvePlan, rejectPlan } from '@/api/business/maintenance'
import PlanPrint from './components/PlanPrint.vue'
import DetailFooter from '@/components/DetailFooter.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import { buildHistoryPayload } from './index.helpers'

const { proxy } = getCurrentInstance() as any
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isAdmin = computed(() => Array.isArray(userStore.roles) && (userStore.roles.includes('admin') || userStore.roles.includes('ROLE_ADMIN')))
const { approval_status, execution_status } = proxy.useDict('approval_status', 'execution_status')

const planId = computed(() => Number((route.params as any).planId))
const plan = ref<any>(null)
const approvalHistory = ref<any[]>([])
const executionList = ref<any[]>([])
const approvalError = ref(false)
const executionError = ref(false)

const canReview = computed(() => plan.value && plan.value.approvalStatus === 'pending')
const canStart = computed(() => plan.value && plan.value.approvalStatus === 'approved' && plan.value.executionStatus === 'pending')
const canComplete = computed(() => plan.value && plan.value.executionStatus === 'executing')
const canEdit = computed(() => proxy?.$auth?.hasPermi?.('business:maintenance:edit'))
const includeLogs = ref(true)
const itemCount = computed<number | undefined>(() => {
  const p: any = plan.value
  if (!p) return undefined
  if (typeof p.itemCount === 'number') return p.itemCount
  if (Array.isArray(p.workItems)) return p.workItems.length
  return undefined
})
const displayPlannedStart = computed(() => formatPlanTimeline(plan.value, 'start'))
const displayPlannedEnd = computed(() => formatPlanTimeline(plan.value, 'end'))

const completeOpen = ref(false)
const completeForm = ref<{ result: string; attachments?: string | any[] }>({ result: '', attachments: '' })

const approveOpen = ref(false)
const approveForm = ref<{ result: 'approved' | 'rejected'; comment: string }>({ result: 'approved', comment: '' })

function goBack(){ router.back() }

function getApproveType(item:any){
  const map:any = { submit: 'info', approve: 'success', reject: 'danger' }
  return map[item?.action] || 'primary'
}
function formatApproveAction(a:string){
  if (a === 'submit') return t('business.maintenance.approveAction.submit')
  if (a === 'approve') return t('business.maintenance.approveAction.approve')
  if (a === 'reject') return t('business.maintenance.approveAction.reject')
  return a
}
function getExecType(item:any){
  const map:any = { start: 'primary', complete: 'success' }
  return map[item?.action] || 'info'
}
function formatExecAction(a:string){
  if (a === 'start') return t('business.maintenance.execAction.start')
  if (a === 'complete') return t('business.maintenance.execAction.complete')
  return a
}

async function load(){
  try {
    const res = await getMaintenance(planId.value)
    plan.value = res?.data || res
  } catch (e) { proxy?.$modal?.msgError?.(t('business.maintenance.message.loadDetailFailed')) }
  try {
    approvalError.value = false
      const his = await getPlanLogs(planId.value, buildHistoryPayload({ type: 'approval', pageSize: 200, orderByColumn: 'time', isAsc: 'asc' }))
    approvalHistory.value = his?.data || his?.rows || []
  } catch { approvalHistory.value = []; approvalError.value = true }
  try {
    executionError.value = false
      const exe = await getPlanLogs(planId.value, buildHistoryPayload({ type: 'execution', pageSize: 200, orderByColumn: 'time', isAsc: 'asc' }))
    executionList.value = exe?.data || exe?.rows || []
  } catch { executionList.value = []; executionError.value = true }
}

async function reloadApproval(){
  try {
    approvalError.value = false
    const his = await getPlanLogs(planId.value, buildHistoryPayload({ type: 'approval', pageSize: 200, orderByColumn: 'time', isAsc: 'asc' }))
    approvalHistory.value = his?.data || his?.rows || []
  } catch { approvalError.value = true }
}

async function reloadExecution(){
  try {
    executionError.value = false
    const exe = await getPlanLogs(planId.value, buildHistoryPayload({ type: 'execution', pageSize: 200, orderByColumn: 'time', isAsc: 'asc' }))
    executionList.value = exe?.data || exe?.rows || []
  } catch { executionError.value = true }
}

async function onStart(){
  try {
    await proxy.$modal.confirm(t('business.maintenance.message.confirmStartExecution'))
    await startExecution(planId.value)
    proxy.$modal.msgSuccess(t('business.maintenance.message.startExecutionSuccess'))
    await load()
  } catch { proxy?.$modal?.msgError?.(t('business.maintenance.message.startExecutionFailed')) }
}

function openComplete(){ completeOpen.value = true }

function openApprove(){ approveOpen.value = true }

async function onComplete(){
  try {
    const payload: any = { result: completeForm.value.result }
    if (completeForm.value.attachments) payload.attachments = completeForm.value.attachments
    await completeExecution(planId.value, payload)
    proxy.$modal.msgSuccess(t('business.maintenance.message.submitResultSuccess'))
    completeOpen.value = false
    completeForm.value = { result: '', attachments: '' }
    await load()
  } catch { proxy?.$modal?.msgError?.(t('business.maintenance.message.submitResultFailed')) }
}

async function onSubmitApproval(){
  try {
    if (approveForm.value.result === 'approved') {
      await approvePlan(planId.value, approveForm.value.comment)
      proxy.$modal.msgSuccess(t('business.maintenance.message.approved'))
    } else {
      await rejectPlan(planId.value, approveForm.value.comment)
      proxy.$modal.msgSuccess(t('business.maintenance.message.rejected'))
    }
    approveOpen.value = false
    await load()
  } catch { proxy?.$modal?.msgError?.(t('business.maintenance.message.approvalFailed')) }
}

onMounted(load)

// 底部操作：编辑/打印/返回
function handleEdit(){
  try { router.push(`/business/maintenance/plan/form/${planId.value}`) } catch {}
}
function handlePrint(){
  try { window.print() } catch { proxy?.$modal?.msgError?.(t('business.maintenance.message.printFailed')) }
}

function formatPlanTimeline(data: any, mode: 'start' | 'end'): string {
  if (!data) return ''
  if (mode === 'start') {
    const candidate = data.plannedStartDate || data.nextExecutionTime || data.lastExecutionTime || data.createTime
    return candidate ? parseTime(candidate) : ''
  }
  const candidate = data.plannedEndDate || data.plannedStartDate || data.nextExecutionTime || data.createTime
  return candidate ? parseTime(candidate) : ''
}
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.mt12 { margin-top: 12px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }
.file-link { display:inline-block; padding: 2px 4px; }
.section-title { font-weight: 600; margin: 8px 0; }
.empty-tip { color: var(--el-text-color-secondary, #909399); font-size: 13px; padding: 8px 0; }
.error-tip { color: #f56c6c; font-size: 13px; padding: 8px 0; }

/* 底部操作区样式：居中、间距 */
.include-logs { display: flex; align-items: center; margin-right: 12px; }

/* 打印区域：仅打印时显示，屏幕隐藏 */
.print-area { display: none; }
@media print {
  /* 打印时仅显示打印区域 */
  .app-container > *:not(.print-area) { display: none !important; }
  .print-area { display: block !important; }
}
</style>

