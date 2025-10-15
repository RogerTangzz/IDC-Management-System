<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>{{ t('business.maintenance.message.editPlan') }}</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <!-- 基础信息 -->
        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.planNo')">
              <el-input v-model="form.planNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.planTitle')" prop="title">
              <el-input v-model="form.title" :placeholder="t('business.maintenance.placeholder.inputPlanTitle')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.floorNo')" prop="floor">
              <el-select v-model="form.floor" :placeholder="t('business.maintenance.placeholder.selectFloor')">
                <el-option :label="t('business.maintenance.floor.floor1')" value="1" />
                <el-option :label="t('business.maintenance.floor.floor2')" value="2" />
                <el-option :label="t('business.maintenance.floor.floor3')" value="3" />
                <el-option :label="t('business.maintenance.floor.floor4')" value="4" />
                <el-option :label="t('business.maintenance.floor.allFloors')" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.versionNo')" prop="version">
              <el-input v-model="form.version" :placeholder="t('business.maintenance.placeholder.defaultVersion')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.mopCategory')" prop="mopCategory">
              <el-select v-model="form.mopCategory" :placeholder="t('business.maintenance.placeholder.selectMopCategory')">
                <el-option :label="t('business.maintenance.category.daily')" value="daily" />
                <el-option :label="t('business.maintenance.category.regular')" value="regular" />
                <el-option :label="t('business.maintenance.category.monthly')" value="monthly" />
                <el-option :label="t('business.maintenance.category.quarterly')" value="quarterly" />
                <el-option :label="t('business.maintenance.category.annual')" value="annual" />
                <el-option :label="t('business.maintenance.category.emergency')" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.approvalStatus')">
              <el-tag :type="getApprovalType(form.approvalStatus)">
                {{ getApprovalLabel(form.approvalStatus) }}
              </el-tag>
              <el-tag v-if="form.executionStatus" :type="getExecutionType(form.executionStatus)"
                style="margin-left: 10px">
                {{ getExecutionLabel(form.executionStatus) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- MOP信息 -->
        <el-divider content-position="left">{{ t('business.maintenance.section.mopInfo') }}</el-divider>

        <el-form-item :label="t('business.maintenance.label.mopName')" prop="mopName">
          <el-input v-model="form.mopName" :placeholder="t('business.maintenance.placeholder.inputMopName')" />
        </el-form-item>

        <el-form-item :label="t('business.maintenance.label.mopPurpose')" prop="mopPurpose">
          <el-input v-model="form.mopPurpose" type="textarea" :rows="3" :placeholder="t('business.maintenance.placeholder.inputMopPurpose')" />
        </el-form-item>

        <!-- 执行周期 -->
        <el-divider content-position="left">{{ t('business.maintenance.section.executionCycle') }}</el-divider>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.executionFrequency')" prop="executionFrequency">
              <el-input-number v-model="form.executionFrequency" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.frequencyUnit')" prop="executionUnit">
              <el-select v-model="form.executionUnit" :placeholder="t('business.maintenance.placeholder.selectUnit')">
                <el-option :label="t('business.maintenance.unit.monthly')" value="month" />
                <el-option :label="t('business.maintenance.unit.quarterly')" value="quarter" />
                <el-option :label="t('business.maintenance.unit.yearly')" value="year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.approver')" prop="approverId">
              <el-select v-model="form.approverId" :placeholder="t('business.maintenance.placeholder.selectApprover')" :disabled="form.approvalStatus !== 'draft'">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('business.maintenance.label.executionApprover')" prop="executorId">
              <el-select v-model="form.executorId" :placeholder="t('business.maintenance.placeholder.selectExecutionApprover')">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="t('business.maintenance.label.notifyPersonnel')" prop="notifyUsers">
          <el-select v-model="form.notifyUsers" multiple :placeholder="t('business.maintenance.placeholder.selectNotifyPersonnel')">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>

        <!-- 工具材料 -->
        <el-divider content-position="left">{{ t('business.maintenance.section.toolsAndMaterials') }}</el-divider>

        <el-form-item :label="t('business.maintenance.label.toolsAndInstruments')" prop="tools">
          <el-input v-model="form.tools" type="textarea" :rows="2" :placeholder="t('business.maintenance.placeholder.inputRequiredTools')" />
        </el-form-item>

        <el-form-item :label="t('business.maintenance.label.materials')" prop="materials">
          <el-input v-model="form.materials" type="textarea" :rows="2" :placeholder="t('business.maintenance.placeholder.inputRequiredMaterials')" />
        </el-form-item>

        <el-form-item :label="t('business.maintenance.label.safetyPPE')" prop="safety">
          <el-input v-model="form.safety" type="textarea" :rows="2" :placeholder="t('business.maintenance.placeholder.inputPPERequirements')" />
        </el-form-item>

        <el-form-item :label="t('business.maintenance.label.specialTools')" prop="specialTools">
          <el-input v-model="form.specialTools" type="textarea" :rows="2" :placeholder="t('business.maintenance.placeholder.inputSpecialTools')" />
        </el-form-item>

        <!-- 执行步骤 -->
        <el-divider content-position="left">{{ t('business.maintenance.section.executionSteps') }}</el-divider>

        <el-form-item :label="t('business.maintenance.label.stepContent')" prop="steps">
          <div class="steps-editor">
            <el-button type="primary" size="small" @click="addStep" style="margin-bottom: 10px">{{ t('business.maintenance.button.addStep') }}</el-button>
            <draggable v-model="stepsList" item-key="id" handle=".handle">
              <template #item="{ element, index }">
                <div class="step-item">
                  <el-icon class="handle">
                    <Rank />
                  </el-icon>
                  <span class="step-number">{{ index + 1 }}.</span>
                  <el-input v-model="element.content" :placeholder="t('business.maintenance.placeholder.inputStepContent')" style="flex: 1" />
                  <el-button type="danger" size="small" icon="Delete" @click="removeStep(index)" />
                </div>
              </template>
            </draggable>
          </div>
        </el-form-item>

        <!-- 表格编辑 -->
        <el-form-item :label="t('business.maintenance.section.checkTable')" v-if="tableData.length > 0">
          <el-table :data="tableData" border>
            <el-table-column v-for="(col, index) in tableCols" :key="index"
              :label="tableHeaders[index] || `${t('business.maintenance.message.column')}${index + 1}`" :prop="`col${index}`">
              <template #header>
                <el-input v-model="tableHeaders[index]" :placeholder="t('business.maintenance.placeholder.columnTitle')" size="small" />
              </template>
              <template #default="scope">
                <el-input v-model="scope.row[`col${index}`]" />
              </template>
            </el-table-column>
            <el-table-column :label="t('business.maintenance.label.operation')" width="80" fixed="right">
              <template #default="scope">
                <el-button type="danger" size="small" icon="Delete" @click="removeTableRow(scope.$index)" />
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" size="small" @click="addTableRow" style="margin-top: 10px">{{ t('business.maintenance.button.addRow') }}</el-button>
        </el-form-item>

        <el-form-item :label="t('business.maintenance.section.createTable')" v-else>
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input v-model="tableRows" :placeholder="t('business.maintenance.placeholder.rows')" />
            </el-col>
            <el-col :span="1" style="text-align: center">{{ t('business.maintenance.input.multiplySign') }}</el-col>
            <el-col :span="4">
              <el-input v-model="tableCols" :placeholder="t('business.maintenance.placeholder.columns')" />
            </el-col>
            <el-col :span="4">
              <el-button @click="generateTable">{{ t('business.maintenance.button.generateTable') }}</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 其他信息 -->
        <el-divider content-position="left">{{ t('business.maintenance.section.otherInfo') }}</el-divider>

        <el-form-item :label="t('business.maintenance.label.inspectionResult')" prop="inspectionResult">
          <el-input v-model="form.inspectionResult" type="textarea" :rows="3" :placeholder="t('business.maintenance.placeholder.inputInspectionResult')" />
        </el-form-item>

        <el-form-item :label="t('business.maintenance.label.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="t('business.maintenance.placeholder.inputRemark')" />
        </el-form-item>

        <!-- 审核记录 -->
        <el-divider content-position="left"
          v-if="form.approvalHistory && form.approvalHistory.length > 0">{{ t('business.maintenance.section.approvalRecords') }}</el-divider>

        <el-timeline v-if="form.approvalHistory && form.approvalHistory.length > 0">
          <el-timeline-item v-for="(record, index) in form.approvalHistory" :key="index"
            :timestamp="parseTime(record.time)" placement="top"
            :type="record.action === 'approved' ? 'success' : record.action === 'rejected' ? 'danger' : 'primary'">
            <div>
              <strong>{{ record.userName }}</strong> {{ getActionLabel(record.action) }}
              <div v-if="record.comment" style="margin-top: 5px; color: #909399">
                {{ record.comment }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button @click="handleCancel">{{ t('business.maintenance.button.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" v-if="form.approvalStatus === 'draft'">{{ t('business.maintenance.button.save') }}</el-button>
        <el-button type="success" @click="handleSubmitApproval" v-if="form.approvalStatus === 'draft'">{{ t('business.maintenance.button.submitApproval') }}</el-button>
        <el-button type="warning" @click="handleRevise" v-if="form.approvalStatus === 'rejected'">{{ t('business.maintenance.button.reviseAndResubmit') }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="MaintenanceEdit">
import { getCurrentInstance, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// NOTE: 真实接口集成后再按需恢复下列 API 引入
// import { getMaintenance, updateMaintenance, submitApproval, getApproverList } from '@/api/business/maintenance'
// import { listUser } from '@/api/system/user'
import { parseTime } from '@/utils/ruoyi'
import draggable from 'vuedraggable'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const planId = route.params && route.params.id
const formRef = ref(null)
const approverList = ref([])
const userList = ref([])
const stepsList = ref([])
const tableRows = ref(6)
const tableCols = ref(7)
const tableData = ref([])
const tableHeaders = ref([])

// 表单数据
const form = ref({
  planId: undefined,
  planNo: '',
  title: '',
  floor: '',
  version: 'V1.0',
  mopCategory: '',
  mopName: '',
  mopPurpose: '',
  executionFrequency: 1,
  executionUnit: 'month',
  approverId: undefined,
  executorId: undefined,
  notifyUsers: [],
  tools: '',
  materials: '',
  safety: '',
  specialTools: '',
  steps: '',
  inspectionResult: '',
  remark: '',
  approvalStatus: 'draft',
  executionStatus: 'pending',
  approvalHistory: []
})

// 验证规则
const rules = {
  title: [{ required: true, message: t('business.maintenance.validation.titleRequired'), trigger: 'blur' }],
  floor: [{ required: true, message: t('business.maintenance.validation.floorRequired'), trigger: 'change' }],
  mopCategory: [{ required: true, message: t('business.maintenance.validation.categoryRequired'), trigger: 'change' }],
  mopName: [{ required: true, message: t('business.maintenance.validation.mopNameRequired'), trigger: 'blur' }],
  approverId: [{ required: true, message: t('business.maintenance.validation.approverRequired'), trigger: 'change' }]
}

/** 获取计划详情 */
function getPlanDetail() {
  // Mock数据
  form.value = {
    planId: planId,
    planNo: 'MP202501001',
    title: '月度维保计划',
    floor: '1',
    version: 'V1.0',
    mopCategory: 'monthly',
    mopName: '月度设备检修',
    mopPurpose: '确保设备正常运行',
    executionFrequency: 1,
    executionUnit: 'month',
    approverId: 1,
    executorId: 2,
    notifyUsers: [1, 2],
    tools: '万用表、螺丝刀、扳手',
    materials: '润滑油、清洁剂',
    safety: '安全帽、手套、护目镜',
    specialTools: '专用检测仪',
    steps: '1. 检查设备外观\n2. 测试运行状态\n3. 记录数据',
    inspectionResult: '',
    remark: '',
    approvalStatus: 'draft',
    executionStatus: 'pending',
    approvalHistory: []
  }

  // 转换步骤为列表
  if (form.value.steps) {
    stepsList.value = form.value.steps.split('\n').map((step, index) => ({
      id: index + 1,
      content: step.replace(/^\d+\.\s*/, '')
    }))
  }
}

/** 添加步骤 */
function addStep() {
  stepsList.value.push({
    id: Date.now(),
    content: ''
  })
}

/** 删除步骤 */
function removeStep(index) {
  stepsList.value.splice(index, 1)
}

/** 生成表格 */
function generateTable() {
  const rows = parseInt(tableRows.value) || 6
  const cols = parseInt(tableCols.value) || 7

  tableData.value = []
  tableHeaders.value = new Array(cols).fill('')

  for (let i = 0; i < rows; i++) {
    const row = {}
    for (let j = 0; j < cols; j++) {
      row[`col${j}`] = ''
    }
    tableData.value.push(row)
  }
}

/** 添加表格行 */
function addTableRow() {
  const row = {}
  for (let j = 0; j < tableCols.value; j++) {
    row[`col${j}`] = ''
  }
  tableData.value.push(row)
}

/** 删除表格行 */
function removeTableRow(index) {
  tableData.value.splice(index, 1)
}

/** 获取审批状态类型 */
function getApprovalType(status) {
  const map = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return map[status] || 'info'
}

/** 获取审批状态标签 */
function getApprovalLabel(status) {
  const map = {
    'draft': t('business.maintenance.status.draft'),
    'pending': t('business.maintenance.status.pending'),
    'approved': t('business.maintenance.status.approved'),
    'rejected': t('business.maintenance.status.rejected')
  }
  return map[status] || status
}

/** 获取执行状态类型 */
function getExecutionType(status) {
  const map = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return map[status] || 'info'
}

/** 获取执行状态标签 */
function getExecutionLabel(status) {
  const map = {
    'pending': t('business.maintenance.status.pending'),
    'executing': t('business.maintenance.status.executing'),
    'completed': t('business.maintenance.status.completed'),
    'cancelled': t('business.maintenance.message.noData')
  }
  return map[status] || status
}

/** 获取操作标签 */
function getActionLabel(action) {
  const map = {
    'created': t('business.maintenance.action.add'),
    'submitted': t('business.maintenance.action.submitApproval'),
    'approved': t('business.maintenance.action.pass'),
    'rejected': t('business.maintenance.action.reject'),
    'revised': t('business.maintenance.action.retry')
  }
  return map[action] || action
}

/** 保存 */
function handleSave() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      // 转换步骤为字符串
      form.value.steps = stepsList.value.map((step, index) =>
        `${index + 1}. ${step.content}`
      ).join('\n')

      proxy.$modal.msgSuccess(t('business.maintenance.message.updateSuccess'))
      router.push('/business/maintenance')
    }
  })
}

/** 提交审核 */
function handleSubmitApproval() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      proxy.$modal.confirm(t('business.maintenance.message.confirmCancel')).then(() => {
        proxy.$modal.msgSuccess(t('business.maintenance.message.submitSuccess'))
        router.push('/business/maintenance')
      })
    }
  })
}

/** 修改重提 */
function handleRevise() {
  form.value.approvalStatus = 'draft'
  proxy.$modal.msgSuccess(t('business.maintenance.status.draft'))
}

/** 取消 */
function handleCancel() {
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

/** 获取用户列表 */
function getUserList() {
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' },
    { userId: 4, nickName: '赵六' }
  ]
}

onMounted(() => {
  getApprovers()
  getUserList()
  getPlanDetail()
})
</script>

<style lang="scss" scoped>
.steps-editor {
  .step-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .handle {
      cursor: move;
      margin-right: 10px;
      color: #909399;
    }

    .step-number {
      margin-right: 10px;
      font-weight: bold;
      color: #606266;
    }
  }
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>