<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">{{ $t('business.maintenance.message.detailTitle') }} - {{ form.planNo }}</span>
          <div class="header-buttons">
            <el-button link type="primary" icon="Refresh" @click="getDetail">{{ $t('business.maintenance.action.reset') }}</el-button>
            <el-button link type="primary" icon="Close" @click="handleClose">{{ $t('business.maintenance.action.close') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 基础信息 -->
      <el-descriptions :column="3" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.message.planInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.maintenance.field.planNo')">
          <span class="text-primary">{{ form.planNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.title')" :span="2">
          {{ form.title }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.floor')">
          {{ getFloorLabel(form.floor) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.version')">
          {{ form.version }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopCategory')">
          <dict-tag :options="mop_category" :value="form.mopCategory" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.approvalStatus')">
          <el-tag :type="getApprovalType(form.approvalStatus)">
            {{ getApprovalLabel(form.approvalStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionStatus')">
          <el-tag :type="getExecutionType(form.executionStatus)">
            {{ getExecutionLabel(form.executionStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.createTime')">
          {{ parseTime(form.createTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- MOP信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.message.mopInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.maintenance.field.mopName')" :span="2">
          {{ form.mopName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopPurpose')" :span="2">
          <div class="description-content">{{ form.mopPurpose }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionCycle')">
          {{ form.executionFrequency }} {{ getUnitLabel(form.executionUnit) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.nextExecutionTime')">
          {{ parseTime(form.nextExecutionTime) || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 人员信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.message.executionInfo') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.maintenance.field.approverName')">
          {{ form.approverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executorId')">
          {{ form.executorName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.applicant')">
          {{ form.applicantName || form.createBy }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.submitTime')">
          {{ parseTime(form.submitTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.notifyUsers')" :span="2">
          <el-tag v-for="user in notifyUserList" :key="user" size="small" style="margin-right: 5px">
            {{ user }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 工具材料 -->
      <el-descriptions :column="1" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.field.tools') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.maintenance.field.tools')">
          <div class="description-content">{{ form.tools || $t('business.maintenance.message.noData') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.materials')">
          <div class="description-content">{{ form.materials || $t('business.maintenance.message.noData') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.safety')">
          <div class="description-content">{{ form.safety || $t('business.maintenance.message.noData') }}</div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.specialTools')">
          <div class="description-content">{{ form.specialTools || $t('business.maintenance.message.noData') }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行步骤 -->
      <el-descriptions :column="1" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.field.steps') }}</span>
        </template>
        <el-descriptions-item>
          <div class="steps-content" v-html="formatSteps(form.steps)"></div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审核信息 -->
      <el-descriptions :column="2" border class="margin-bottom" v-if="form.approvalStatus !== 'draft'">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.message.approvalHistory') }}</span>
        </template>
        <el-descriptions-item :label="$t('business.maintenance.field.submitTime')">
          {{ parseTime(form.approvalTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.approvalStatus')">
          <el-tag :type="getApprovalType(form.approvalStatus)">
            {{ getApprovalLabel(form.approvalStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.comment')" :span="2">
          <div class="description-content">{{ form.approvalComment || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行记录 -->
      <el-descriptions :column="1" border class="margin-bottom" v-if="executionList.length > 0">
        <template #title>
          <span class="descriptions-title">{{ $t('business.maintenance.message.executionRecord') }}</span>
        </template>
        <el-descriptions-item>
          <el-table :data="executionList" border>
            <el-table-column prop="executionNo" :label="$t('business.maintenance.field.planNo')" width="150" />
            <el-table-column prop="executorName" :label="$t('business.maintenance.field.executorId')" width="100" />
            <el-table-column prop="actualExecutionTime" :label="$t('business.maintenance.field.planTime')" width="180">
              <template #default="scope">
                {{ parseTime(scope.row.actualExecutionTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="executionResult" :label="$t('business.maintenance.field.executionResult')" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.executionResult === 'normal' ? 'success' : 'danger'">
                  {{ scope.row.executionResult === 'normal' ? $t('business.maintenance.priority.normal') : $t('business.maintenance.priority.urgent') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executionRecord" :label="$t('business.maintenance.message.executionRecord')" min-width="200" />
            <el-table-column :label="$t('business.maintenance.message.operation')" width="100" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="viewExecution(scope.row)">{{ $t('business.maintenance.action.view') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" icon="Edit" @click="handleEdit" v-hasPermi="['business:maintenance:edit']"
          v-if="form.approvalStatus === 'draft'">{{ $t('business.maintenance.action.edit') }}</el-button>

        <el-button type="success" icon="Select" @click="handleSubmitApproval" v-hasPermi="['business:maintenance:edit']"
          v-if="form.approvalStatus === 'draft'">{{ $t('business.maintenance.action.submitApproval') }}</el-button>

        <el-button type="success" icon="CircleCheck" @click="handleApprove"
          v-hasPermi="['business:maintenance:approve']"
          v-if="form.approvalStatus === 'pending' && canApprove">{{ $t('business.maintenance.action.pass') }}</el-button>

        <el-button type="danger" icon="CircleClose" @click="handleReject" v-hasPermi="['business:maintenance:approve']"
          v-if="form.approvalStatus === 'pending' && canApprove">{{ $t('business.maintenance.action.reject') }}</el-button>

        <el-button type="warning" icon="VideoPlay" @click="handleExecute" v-hasPermi="['business:maintenance:execute']"
          v-if="form.approvalStatus === 'approved' && form.executionStatus === 'pending'">{{ $t('business.maintenance.action.startExecution') }}</el-button>

        <el-button type="primary" icon="Ticket" @click="handleGenerateTicket" v-hasPermi="['business:maintenance:edit']"
          v-if="form.executionStatus === 'executing'">{{ $t('business.maintenance.action.generateTicket') }}</el-button>

        <el-button type="info" icon="CopyDocument" @click="handleCopy">{{ $t('business.maintenance.action.copy') }}</el-button>

        <el-button type="info" icon="Printer" @click="handlePrint">{{ $t('business.maintenance.action.print') }}</el-button>

        <el-button icon="Back" @click="handleClose">{{ $t('business.maintenance.action.back') }}</el-button>
      </div>
    </el-card>

    <!-- 提交审核对话框 -->
    <el-dialog :title="$t('business.maintenance.dialog.submitApprovalTitle')" v-model="submitOpen" width="500px" append-to-body>
      <el-form ref="submitRef" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item :label="$t('business.maintenance.field.approverId')" prop="approverId">
          <el-select v-model="submitForm.approverId" :placeholder="$t('business.maintenance.placeholder.selectApprover')">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.remark')" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputRemark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval">{{ $t('business.maintenance.message.confirm') }}</el-button>
          <el-button @click="submitOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="approvalTitle" v-model="approvalOpen" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item :label="$t('business.maintenance.field.comment')" prop="comment">
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApprovalAction">{{ $t('business.maintenance.message.confirm') }}</el-button>
          <el-button @click="approvalOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaintenanceDetail">
import { getCurrentInstance, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const planId = route.params && route.params.id
const loading = ref(false)
const submitOpen = ref(false)
const approvalOpen = ref(false)
const approvalType = ref('')
const approverList = ref([])
const executionList = ref([])
const notifyUserList = ref([])

// 字典数据
const { mop_category } = proxy.useDict('mop_category')

// 表单数据
const form = ref({})
const submitForm = ref({
  approverId: undefined,
  remark: ''
})
const approvalForm = ref({
  comment: ''
})

// 验证规则
const submitRules = {
  approverId: [{ required: true, message: t('business.maintenance.validation.approverRequired'), trigger: "change" }]
}
const approvalRules = {
  comment: [{ required: true, message: t('business.maintenance.validation.commentRequired'), trigger: "blur" }]
}

// 计算属性
const canApprove = computed(() => {
  // 判断当前用户是否为审核人
  return true // Mock
})

const approvalTitle = computed(() => {
  return approvalType.value === 'approve' ? t('business.maintenance.message.passed') : t('business.maintenance.message.refused')
})

/** 获取详情 */
function getDetail() {
  loading.value = true
  // Mock数据
  form.value = {
    planId: planId,
    planNo: 'MP202501001',
    title: '月度维保计划',
    floor: '1',
    version: 'V1.0',
    mopCategory: 'monthly',
    mopName: '月度设备检修',
    mopPurpose: '确保设备正常运行，预防故障发生',
    executionFrequency: 1,
    executionUnit: 'month',
    approverName: '王经理',
    executorName: '李主管',
    applicantName: '张三',
    approvalStatus: 'draft',
    executionStatus: 'pending',
    tools: '万用表、螺丝刀、扳手',
    materials: '润滑油、清洁剂',
    safety: '安全帽、手套、护目镜',
    specialTools: '专用检测仪',
    steps: '1. 检查设备外观\n2. 测试运行状态\n3. 记录数据\n4. 清洁保养\n5. 更换耗材',
    createTime: new Date(),
    nextExecutionTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  notifyUserList.value = ['张三', '李四', '王五']

  executionList.value = []

  loading.value = false
}

/** 获取楼层标签 */
function getFloorLabel(floor) {
  const floorMap = {
    '1': t('business.maintenance.floor.floor1'),
    '2': t('business.maintenance.floor.floor2'),
    '3': t('business.maintenance.floor.floor3'),
    '4': t('business.maintenance.floor.floor4'),
    'all': t('business.maintenance.floor.allFloors')
  }
  return floorMap[floor] || floor
}

/** 获取单位标签 */
function getUnitLabel(unit) {
  const unitMap = {
    'month': t('business.maintenance.unit.monthly'),
    'quarter': t('business.maintenance.unit.quarterly'),
    'year': t('business.maintenance.unit.yearly')
  }
  return unitMap[unit] || unit
}

/** 获取审核状态类型 */
function getApprovalType(status) {
  const typeMap = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

/** 获取审核状态标签 */
function getApprovalLabel(status) {
  const labelMap = {
    'draft': t('business.maintenance.status.draft'),
    'pending': t('business.maintenance.status.pending'),
    'approved': t('business.maintenance.status.approved'),
    'rejected': t('business.maintenance.status.rejected')
  }
  return labelMap[status] || status
}

/** 获取执行状态类型 */
function getExecutionType(status) {
  const typeMap = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

/** 获取执行状态标签 */
function getExecutionLabel(status) {
  const labelMap = {
    'pending': t('business.maintenance.status.pending'),
    'executing': t('business.maintenance.status.executing'),
    'completed': t('business.maintenance.status.completed'),
    'cancelled': t('business.maintenance.message.noData')
  }
  return labelMap[status] || status
}

/** 格式化步骤 */
function formatSteps(steps) {
  if (!steps) return ''
  return steps.replace(/\n/g, '<br>')
}

/** 编辑 */
function handleEdit() {
  router.push('/business/maintenance/edit/' + planId)
}

/** 提交审核 */
function handleSubmitApproval() {
  submitForm.value = {
    approverId: undefined,
    remark: ''
  }
  submitOpen.value = true
  getApprovers()
}

/** 确认提交审核 */
function submitApproval() {
  proxy.$refs["submitRef"].validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess(t('business.maintenance.message.submitSuccess'))
      submitOpen.value = false
      form.value.approvalStatus = 'pending'
      getDetail()
    }
  })
}

/** 审核通过 */
function handleApprove() {
  approvalType.value = 'approve'
  approvalForm.value.comment = ''
  approvalOpen.value = true
}

/** 审核拒绝 */
function handleReject() {
  approvalType.value = 'reject'
  approvalForm.value.comment = ''
  approvalOpen.value = true
}

/** 提交审核操作 */
function submitApprovalAction() {
  proxy.$refs["approvalRef"].validate(valid => {
    if (valid) {
      const msg = approvalType.value === 'approve' ? t('business.maintenance.message.passed') : t('business.maintenance.message.refused')
      proxy.$modal.msgSuccess(msg)
      approvalOpen.value = false
      form.value.approvalStatus = approvalType.value === 'approve' ? 'approved' : 'rejected'
      getDetail()
    }
  })
}

/** 开始执行 */
function handleExecute() {
  proxy.$modal.confirm(t('business.maintenance.message.confirmExecute')).then(() => {
    proxy.$modal.msgSuccess(t('business.maintenance.message.executeSuccess'))
    form.value.executionStatus = 'executing'
    getDetail()
  })
}

/** 生成工单 */
function handleGenerateTicket() {
  proxy.$modal.confirm(t('business.maintenance.message.confirmGenerateTicket')).then(() => {
    proxy.$modal.msgSuccess(t('business.maintenance.message.generateTicketSuccess'))
  })
}

/** 复制计划 */
function handleCopy() {
  proxy.$modal.confirm(t('business.maintenance.message.confirmCopyPlan')).then(() => {
    proxy.$modal.msgSuccess(t('business.maintenance.message.copySuccess'))
    router.push('/business/maintenance/create')
  })
}

/** 查看执行记录 */
function viewExecution(row) {
  proxy.$modal.msgInfo(t('business.maintenance.action.view') + "：" + row.executionNo)
}

/** 打印 */
function handlePrint() {
  window.print()
}

/** 返回 */
function handleClose() {
  router.back()
}

/** 获取审批人列表 */
function getApprovers() {
  approverList.value = [
    { userId: 1, nickName: '王经理' },
    { userId: 2, nickName: '李主管' },
    { userId: 3, nickName: '张总监' }
  ]
}

getDetail()
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

.steps-content {
  line-height: 1.8;
}

.text-primary {
  color: #409EFF;
  font-weight: bold;
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