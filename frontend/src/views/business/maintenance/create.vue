<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>{{ $t('business.maintenance.message.newPlan') }}</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <!-- 基础信息 -->
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.title')" prop="title">
              <el-input v-model="form.title" :placeholder="$t('business.maintenance.placeholder.inputTitle')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.floorNo')" prop="floor">
              <el-select v-model="form.floor" :placeholder="$t('business.maintenance.placeholder.selectFloor')">
                <el-option :label="$t('business.maintenance.floor.floor1')" value="1" />
                <el-option :label="$t('business.maintenance.floor.floor2')" value="2" />
                <el-option :label="$t('business.maintenance.floor.floor3')" value="3" />
                <el-option :label="$t('business.maintenance.floor.floor4')" value="4" />
                <el-option :label="$t('business.maintenance.floor.allFloors')" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.version')" prop="version">
              <el-input v-model="form.version" :placeholder="$t('business.maintenance.placeholder.versionExample')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.mopCategory')" prop="mopCategory">
              <el-select v-model="form.mopCategory" :placeholder="$t('business.maintenance.placeholder.selectCategory')">
                <el-option :label="$t('business.maintenance.category.daily')" value="daily" />
                <el-option :label="$t('business.maintenance.category.regular')" value="regular" />
                <el-option :label="$t('business.maintenance.category.monthly')" value="monthly" />
                <el-option :label="$t('business.maintenance.category.quarterly')" value="quarterly" />
                <el-option :label="$t('business.maintenance.category.annual')" value="annual" />
                <el-option :label="$t('business.maintenance.category.emergency')" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- MOP信息 -->
        <el-divider content-position="left">{{ $t('business.maintenance.message.mopInfo') }}</el-divider>

        <el-form-item :label="$t('business.maintenance.field.mopName')" prop="mopName">
          <el-input v-model="form.mopName" :placeholder="$t('business.maintenance.placeholder.inputMopName')" />
        </el-form-item>

        <el-form-item :label="$t('business.maintenance.field.mopPurpose')" prop="mopPurpose">
          <el-input v-model="form.mopPurpose" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputMopPurpose')" />
        </el-form-item>

        <!-- 执行周期 -->
        <el-divider content-position="left">{{ $t('business.maintenance.field.executionCycle') }}</el-divider>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.placeholder.frequency')" prop="executionFrequency">
              <el-input-number v-model="form.executionFrequency" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.placeholder.unit')" prop="executionUnit">
              <el-select v-model="form.executionUnit" :placeholder="$t('business.maintenance.placeholder.select')">
                <el-option :label="$t('business.maintenance.unit.monthly')" value="month" />
                <el-option :label="$t('business.maintenance.unit.quarterly')" value="quarter" />
                <el-option :label="$t('business.maintenance.unit.yearly')" value="year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.approverId')" prop="approverId">
              <el-select v-model="form.approverId" :placeholder="$t('business.maintenance.placeholder.selectApprover')">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.executorId')" prop="executorId">
              <el-select v-model="form.executorId" :placeholder="$t('business.maintenance.placeholder.selectExecutor')">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('business.maintenance.field.notifyUsers')" prop="notifyUsers">
          <el-select v-model="form.notifyUsers" multiple :placeholder="$t('business.maintenance.placeholder.selectNotifyUsers')">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>

        <!-- 工具材料 -->
        <el-divider content-position="left">{{ $t('business.maintenance.field.tools') }}</el-divider>

        <el-form-item :label="$t('business.maintenance.field.tools')" prop="tools">
          <el-input v-model="form.tools" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputTools')" />
        </el-form-item>

        <el-form-item :label="$t('business.maintenance.field.materials')" prop="materials">
          <el-input v-model="form.materials" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputMaterials')" />
        </el-form-item>

        <el-form-item :label="$t('business.maintenance.field.safety')" prop="safety">
          <el-input v-model="form.safety" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputSafety')" />
        </el-form-item>

        <el-form-item :label="$t('business.maintenance.field.specialTools')" prop="specialTools">
          <el-input v-model="form.specialTools" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputSpecialTools')" />
        </el-form-item>

        <!-- 执行步骤 -->
        <el-divider content-position="left">{{ $t('business.maintenance.field.steps') }}</el-divider>

        <el-form-item :label="$t('business.maintenance.field.steps')" prop="steps">
          <el-input v-model="form.steps" type="textarea" :rows="5" :placeholder="$t('business.maintenance.placeholder.inputTools')" />
        </el-form-item>

        <!-- 创建表格 -->
        <el-form-item :label="$t('business.maintenance.field.createTable')">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input v-model="tableRows" :placeholder="$t('business.maintenance.placeholder.rows')" />
            </el-col>
            <el-col :span="1" style="text-align: center">×</el-col>
            <el-col :span="4">
              <el-input v-model="tableCols" :placeholder="$t('business.maintenance.placeholder.columns')" />
            </el-col>
            <el-col :span="4">
              <el-button @click="generateTable">{{ $t('business.maintenance.action.generateTable') }}</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 生成的表格 -->
        <el-form-item v-if="tableData.length > 0">
          <el-table :data="tableData" border>
            <el-table-column v-for="(col, index) in tableCols" :key="index" :label="`${$t('business.maintenance.message.column')}${index + 1}`"
              :prop="`col${index}`">
              <template #default="scope">
                <el-input v-model="scope.row[`col${index}`]" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 其他信息 -->
        <el-divider content-position="left">{{ $t('business.maintenance.field.remark') }}</el-divider>

        <el-form-item :label="$t('business.maintenance.field.inspectionResult')" prop="inspectionResult">
          <el-input v-model="form.inspectionResult" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputInspectionResult')" />
        </el-form-item>

        <el-form-item :label="$t('business.maintenance.field.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputRemarkInfo')" />
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button type="primary" @click="handleSubmit">{{ $t('business.maintenance.action.submit') }}</el-button>
        <el-button type="success" @click="handleSubmitApproval">{{ $t('business.maintenance.action.submitApproval') }}</el-button>
        <el-button @click="handleCopyLast">{{ $t('business.maintenance.action.copyLast') }}</el-button>
        <el-button @click="handleCancel">{{ $t('business.maintenance.message.cancel') }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="MaintenanceCreate">
import { getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance()
const router = useRouter()
const { t } = useI18n()

const formRef = ref(null)
const tableRows = ref(6)
const tableCols = ref(7)
const tableData = ref([])
const approverList = ref([]) // 审批人下拉
const userList = ref([]) // 用户选择下拉

// 表单数据
const form = ref({
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
  remark: ''
})

// 验证规则
const rules = {
  title: [{ required: true, message: t('business.maintenance.validation.titleRequired'), trigger: 'blur' }],
  floor: [{ required: true, message: t('business.maintenance.validation.floorRequired'), trigger: 'change' }],
  mopCategory: [{ required: true, message: t('business.maintenance.validation.categoryRequired'), trigger: 'change' }],
  mopName: [{ required: true, message: t('business.maintenance.validation.mopNameRequired'), trigger: 'blur' }],
  approverId: [{ required: true, message: t('business.maintenance.validation.approverRequired'), trigger: 'change' }]
}

// 生成表格
function generateTable() {
  const rows = parseInt(tableRows.value) || 6
  const cols = parseInt(tableCols.value) || 7

  tableData.value = []
  for (let i = 0; i < rows; i++) {
    const row = {}
    for (let j = 0; j < cols; j++) {
      row[`col${j}`] = ''
    }
    tableData.value.push(row)
  }
}

// 复制上次计划
function handleCopyLast() {
  proxy.$modal.confirm(t('business.maintenance.message.confirmCopyLastPlan')).then(() => {
    // Mock数据
    form.value = {
      title: t('business.maintenance.message.copiedLastPlan'),
      floor: '1',
      version: 'V1.1',
      mopCategory: 'monthly',
      mopName: t('business.maintenance.message.copiedLastPlan'),
      mopPurpose: t('business.maintenance.message.copiedLastPlan'),
      executionFrequency: 1,
      executionUnit: 'month',
      approverId: 1,
      executorId: 2,
      notifyUsers: [1, 2],
      tools: t('business.maintenance.placeholder.inputTools'),
      materials: t('business.maintenance.placeholder.inputMaterials'),
      safety: t('business.maintenance.placeholder.inputSafety'),
      specialTools: t('business.maintenance.placeholder.inputSpecialTools'),
      steps: '1. ' + t('business.maintenance.field.steps') + '\n2. ' + t('business.maintenance.field.steps') + '\n3. ' + t('business.maintenance.field.steps'),
      inspectionResult: '',
      remark: `[${t('business.maintenance.message.copiedLastPlan')}，${proxy.parseTime(new Date())}]`
    }
    proxy.$modal.msgSuccess(t('business.maintenance.message.copySuccess'))
  })
}

// 保存
function handleSubmit() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess(t('business.maintenance.message.addSuccess'))
      router.push('/business/maintenance')
    }
  })
}

// 提交审核
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

// 取消
function handleCancel() {
  router.back()
}

// 获取审批人列表
function getApprovers() {
  // Mock数据
  approverList.value = [
    { userId: 1, nickName: '王经理' },
    { userId: 2, nickName: '李主管' },
    { userId: 3, nickName: '张总监' }
  ]
}

// 获取用户列表
function getUserList() {
  // Mock数据
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' },
    { userId: 4, nickName: '赵六' }
  ]
}

getApprovers()
getUserList()
</script>

<style lang="scss" scoped>
.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>