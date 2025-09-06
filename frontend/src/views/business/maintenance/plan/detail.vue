<template>
  <div class="app-container">
    <el-page-header @back="goBack" content="Maintenance Plan Detail" />

    <el-card class="mb16">
      <template #header>
        <div class="card-header">
          <span>Plan Info</span>
          <div class="actions">
            <el-button v-if="canReview" type="warning" size="small" @click="openApprove">Review</el-button>
            <el-button v-if="canStart" type="primary" size="small" @click="onStart">Start</el-button>
            <el-button v-if="canComplete" type="success" size="small" @click="openComplete">Complete</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="PlanNo">{{ plan?.planNo }}</el-descriptions-item>
        <el-descriptions-item label="Title">{{ plan?.title }}</el-descriptions-item>
        <el-descriptions-item label="Floor">{{ plan?.floor }}</el-descriptions-item>
        <el-descriptions-item label="Approval">
          <dict-tag :options="approval_status" :value="plan?.approvalStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="Execution">
          <dict-tag :options="execution_status" :value="plan?.executionStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="Owner">{{ plan?.responsibleName }}</el-descriptions-item>
        <el-descriptions-item label="Start">{{ parseTime(plan?.plannedStartDate) }}</el-descriptions-item>
        <el-descriptions-item label="End">{{ parseTime(plan?.plannedEndDate) }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="Array.isArray(plan?.attachments) && plan.attachments.length" class="mt12">
        <div class="section-title">Attachments</div>
        <el-space wrap>
          <a v-for="(att,idx) in plan.attachments" :key="idx" class="file-link" :href="att" target="_blank">File {{ idx + 1 }}</a>
        </el-space>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>Approval History</span></template>
          <div v-if="approvalError" class="error-tip">
            <el-alert type="error" title="Load failed" :closable="false" />
            <div><el-button link type="primary" @click="reloadApproval">Retry</el-button></div>
          </div>
          <div v-else-if="Array.isArray(approvalHistory) && approvalHistory.length">
            <el-timeline>
              <el-timeline-item v-for="(item, i) in approvalHistory" :key="i" :timestamp="parseTime(item.time)" :type="getApproveType(item)">
                <div>
                  <b>{{ formatApproveAction(item.action) }}</b>
                  <span v-if="item.operatorName"> - {{ item.operatorName }}</span>
                </div>
                <div v-if="item.nextAssigneeName">Next: {{ item.nextAssigneeName }}</div>
                <div v-if="item.comment">Remark: {{ item.comment }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="empty-tip">No approval records</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>Execution History</span></template>
          <div v-if="executionError" class="error-tip">
            <el-alert type="error" title="Load failed" :closable="false" />
            <div><el-button link type="primary" @click="reloadExecution">Retry</el-button></div>
          </div>
          <div v-else-if="Array.isArray(executionList) && executionList.length">
            <el-timeline>
              <el-timeline-item v-for="(item, i) in executionList" :key="i" :timestamp="parseTime(item.time)" :type="getExecType(item)">
                <div>
                  <b>{{ formatExecAction(item.action) }}</b>
                  <span v-if="item.operatorName"> - {{ item.operatorName }}</span>
                </div>
                <div v-if="item.result">Result: {{ item.result }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="empty-tip">No execution records</div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="Complete Execution" v-model="completeOpen" width="600px" append-to-body>
      <el-form :model="completeForm" label-width="80px">
        <el-form-item label="Result">
          <el-input v-model="completeForm.result" type="textarea" :rows="4" placeholder="Enter execution result" />
        </el-form-item>
        <el-form-item label="Attachments">
          <FileUpload v-model="completeForm.attachments" :limit="6" :file-size="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="completeOpen = false">Cancel</el-button>
          <el-button type="primary" @click="onComplete">Submit</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="Review Plan" v-model="approveOpen" width="520px" append-to-body>
      <el-form :model="approveForm" label-width="90px">
        <el-form-item label="Result">
          <el-radio-group v-model="approveForm.result">
            <el-radio-button label="approved">Approve</el-radio-button>
            <el-radio-button label="rejected">Reject</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Comment">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="Enter comment" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveOpen = false">Cancel</el-button>
          <el-button type="primary" @click="onSubmitApproval">Submit</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="MaintenancePlanDetail">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { withMineOnly } from '@/utils/business/mineOnly'
import { parseTime } from '@/utils/ruoyi'
import { getMaintenance, getPlanLogs, startExecution, completeExecution, approvePlan, rejectPlan } from '@/api/business/maintenance'
import FileUpload from '@/components/FileUpload/index.vue'

const { proxy } = getCurrentInstance() as any
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
  return a === 'submit' ? 'Submit' : a === 'approve' ? 'Approved' : a === 'reject' ? 'Rejected' : a
}
function getExecType(item:any){
  const map:any = { start: 'primary', complete: 'success' }
  return map[item?.action] || 'info'
}
function formatExecAction(a:string){
  return a === 'start' ? 'Start' : a === 'complete' ? 'Complete' : a
}

async function load(){
  try {
    const res = await getMaintenance(planId.value)
    plan.value = res?.data || res
  } catch (e) { proxy?.$modal?.msgError?.('Load failed') }
  try {
    approvalError.value = false
    const his = await getPlanLogs(planId.value, { type: 'approval' })
    approvalHistory.value = his?.data || his?.rows || []
  } catch { approvalHistory.value = []; approvalError.value = true }
  try {
    executionError.value = false
    const exe = await getPlanLogs(planId.value, { type: 'execution' })
    executionList.value = exe?.data || exe?.rows || []
  } catch { executionList.value = []; executionError.value = true }
}

async function reloadApproval(){
  try {
    approvalError.value = false
    const his = await getPlanLogs(planId.value, { type: 'approval' })
    approvalHistory.value = his?.data || his?.rows || []
  } catch { approvalError.value = true }
}

async function reloadExecution(){
  try {
    executionError.value = false
    const exe = await getPlanLogs(planId.value, { type: 'execution' })
    executionList.value = exe?.data || exe?.rows || []
  } catch { executionError.value = true }
}

async function onStart(){
  try {
    await proxy.$modal.confirm('Confirm start?')
    await startExecution(planId.value)
    proxy.$modal.msgSuccess('Started')
    await load()
  } catch { proxy?.$modal?.msgError?.('Start failed') }
}

function openComplete(){ completeOpen.value = true }

function openApprove(){ approveOpen.value = true }

async function onComplete(){
  try {
    const payload: any = { result: completeForm.value.result }
    if (completeForm.value.attachments) payload.attachments = completeForm.value.attachments
    await completeExecution(planId.value, payload)
    proxy.$modal.msgSuccess('Completed')
    completeOpen.value = false
    completeForm.value = { result: '', attachments: '' }
    await load()
  } catch { proxy?.$modal?.msgError?.('Submit failed') }
}

async function onSubmitApproval(){
  try {
    if (approveForm.value.result === 'approved') {
      await approvePlan(planId.value, approveForm.value.comment)
      proxy.$modal.msgSuccess('Approved')
    } else {
      await rejectPlan(planId.value, approveForm.value.comment)
      proxy.$modal.msgSuccess('Rejected')
    }
    approveOpen.value = false
    await load()
  } catch { proxy?.$modal?.msgError?.('Review failed') }
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.mt12 { margin-top: 12px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }
.file-link { display:inline-block; padding: 2px 4px; }
.section-title { font-weight: 600; margin: 8px 0; }
.empty-tip { color: var(--el-text-color-secondary, #909399); font-size: 13px; padding: 8px 0; }
.error-tip { color: #f56c6c; font-size: 13px; padding: 8px 0; }
</style>
