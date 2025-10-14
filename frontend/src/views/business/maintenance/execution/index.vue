<!-- src/views/maintenance/execution/index.vue -->
<template>
  <div class="maintenance-execution-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item :label="$t('business.maintenance.field.title')" prop="planName">
          <el-input v-model="queryParams.planName" :placeholder="$t('business.maintenance.placeholder.inputTitle')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.executorId')" prop="executorName">
          <el-input v-model="queryParams.executorName" :placeholder="$t('business.maintenance.placeholder.selectExecutor')" clearable />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.executionStatus')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('business.maintenance.message.all')" clearable>
            <el-option :label="$t('business.maintenance.status.executing')" value="executing" />
            <el-option :label="$t('business.maintenance.status.completed')" value="completed" />
            <el-option :label="$t('business.maintenance.message.noData')" value="aborted" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.planTime')">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" :range-separator="$t('business.maintenance.message.to')"
            :start-placeholder="$t('business.maintenance.placeholder.startDate')" :end-placeholder="$t('business.maintenance.placeholder.endDate')" @change="handleDateChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.maintenance.action.search') }}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{ $t('business.maintenance.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('business.maintenance.message.executionRecord') }}</span>
          <el-button type="warning" icon="Download" @click="handleExport">{{ $t('business.maintenance.action.export') }}</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="executionList" border stripe>
        <el-table-column :label="$t('business.maintenance.field.planNo')" prop="executionNo" width="120" align="center" />
        <el-table-column :label="$t('business.maintenance.field.title')" prop="planName" min-width="200" show-overflow-tooltip />
        <el-table-column :label="$t('business.maintenance.field.executorId')" prop="executorName" width="100" align="center" />
        <el-table-column :label="$t('business.maintenance.field.planTime')" prop="startTime" width="160" align="center">
          <template #default="scope">
            {{ parseTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.field.nextExecutionTime')" prop="endTime" width="160" align="center">
          <template #default="scope">
            {{ scope.row.endTime ? parseTime(scope.row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.field.remark')" prop="duration" width="100" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.field.executionStatus')" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.field.executionResult')" prop="result" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.result" :type="scope.row.result === 'success' ? 'success' : 'danger'">
              {{ scope.row.result === 'success' ? $t('business.maintenance.message.importSuccess') : $t('business.maintenance.message.importFailed') }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.message.operation')" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">
              {{ $t('business.maintenance.action.detail') }}
            </el-button>
            <el-button v-if="scope.row.status === 'executing'" link type="success" size="small"
              @click="handleComplete(scope.row)">
              {{ $t('business.maintenance.action.completeExecution') }}
            </el-button>
            <el-button v-if="scope.row.status === 'executing'" link type="danger" size="small"
              @click="handleAbort(scope.row)">
              {{ $t('business.maintenance.action.close') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 完成执行对话框 -->
    <el-dialog v-model="completeDialogVisible" :title="$t('business.maintenance.action.completeExecution')" width="600px">
      <el-form ref="completeFormRef" :model="completeForm" :rules="completeRules" label-width="100px">
        <el-form-item :label="$t('business.maintenance.field.executionResult')" prop="result">
          <el-radio-group v-model="completeForm.result">
            <el-radio label="success">{{ $t('business.maintenance.message.importSuccess') }}</el-radio>
            <el-radio label="failed">{{ $t('business.maintenance.message.importFailed') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.comment')" prop="description">
          <el-input v-model="completeForm.description" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.remark')" prop="issues">
          <el-input v-model="completeForm.issues" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.remark')" prop="actions">
          <el-input v-model="completeForm.actions" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
        <el-button type="primary" @click="submitComplete">{{ $t('business.maintenance.message.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
// 移除未使用的 maintenancePlanApi 与 parseTime 引入

const { t } = useI18n()

// 状态
const loading = ref(false)
const executionList = ref([])
const total = ref(0)
const dateRange = ref([])
const completeDialogVisible = ref(false)
const currentExecution = ref(null)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planName: '',
  executorName: '',
  status: '',
  startTime: '',
  endTime: ''
})

// 完成表单
const completeFormRef = ref()
const completeForm = reactive({
  result: 'success',
  description: '',
  issues: '',
  actions: ''
})

const completeRules = {
  result: [{ required: true, message: t('business.maintenance.placeholder.inputResult'), trigger: 'change' }],
  description: [{ required: true, message: t('business.maintenance.placeholder.inputComment'), trigger: 'blur' }]
}

// 模拟数据
const mockData = [
  {
    id: 1,
    executionNo: 'EX202501001',
    planName: '1楼暖通系统月度保养',
    executorName: '张三',
    startTime: new Date('2025-01-15 09:00:00'),
    endTime: new Date('2025-01-15 11:30:00'),
    duration: 150, // 分钟
    status: 'completed',
    result: 'success'
  },
  {
    id: 2,
    executionNo: 'EX202501002',
    planName: '配电柜季度检修',
    executorName: '李四',
    startTime: new Date('2025-01-16 14:00:00'),
    endTime: null,
    duration: 0,
    status: 'executing',
    result: null
  }
]

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      executionList.value = mockData
      total.value = mockData.length
      loading.value = false
    }, 500)
  } catch {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.planName = ''
  queryParams.executorName = ''
  queryParams.status = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = []
  handleQuery()
}

// 日期变更
const handleDateChange = (value) => {
  if (value) {
    queryParams.startTime = value[0]
    queryParams.endTime = value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
}

// 查看详情
const handleDetail = (row) => {
  ElMessage.info('查看执行详情：' + row.executionNo)
}

// 完成执行
const handleComplete = (row) => {
  currentExecution.value = row
  completeForm.result = 'success'
  completeForm.description = ''
  completeForm.issues = ''
  completeForm.actions = ''
  completeDialogVisible.value = true
}

// 提交完成
const submitComplete = async () => {
  await completeFormRef.value?.validate()

  try {
    // await maintenancePlanApi.completeExecution(currentExecution.value.id, completeForm)
    ElMessage.success('执行完成')
    completeDialogVisible.value = false
    getList()
  } catch {
    // 完成执行失败
  }
}

// 中止执行
const handleAbort = async (_row) => {
  await ElMessageBox.confirm('确定中止此次执行？', '警告', { type: 'warning' })

  try {
    // await maintenancePlanApi.abortExecution(row.id)
    ElMessage.success('已中止执行')
    getList()
  } catch {
    // 中止失败
  }
}

// 导出
const handleExport = async () => {
  await ElMessageBox.confirm('确定导出执行记录？', '确认', { type: 'info' })

  try {
    // const res = await maintenancePlanApi.exportExecution(queryParams)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    executing: t('business.maintenance.status.executing'),
    completed: t('business.maintenance.status.completed'),
    aborted: t('business.maintenance.message.noData')
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { executing: '', completed: 'success', aborted: 'danger' }
  return map[status] || ''
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.maintenance-execution-list {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>