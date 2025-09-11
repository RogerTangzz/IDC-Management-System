<!-- src/views/maintenance/execution/index.vue -->
<template>
  <div class="maintenance-execution-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="queryParams.planName" placeholder="请输入计划名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="执行人" prop="executorName">
          <el-input v-model="queryParams.executorName" placeholder="请输入执行人" clearable />
        </el-form-item>
        <el-form-item label="执行状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable>
            <el-option label="执行中" value="executing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已中止" value="aborted" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" @change="handleDateChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>执行记录列表</span>
          <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="executionList" border stripe>
        <el-table-column label="执行编号" prop="executionNo" width="120" align="center" />
        <el-table-column label="计划名称" prop="planName" min-width="200" show-overflow-tooltip />
        <el-table-column label="执行人" prop="executorName" width="100" align="center" />
        <el-table-column label="开始时间" prop="startTime" width="160" align="center">
          <template #default="scope">
            {{ parseTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="完成时间" prop="endTime" width="160" align="center">
          <template #default="scope">
            {{ scope.row.endTime ? parseTime(scope.row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="耗时" prop="duration" width="100" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="执行状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行结果" prop="result" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.result" :type="scope.row.result === 'success' ? 'success' : 'danger'">
              {{ scope.row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">
              查看详情
            </el-button>
            <el-button v-if="scope.row.status === 'executing'" link type="success" size="small"
              @click="handleComplete(scope.row)">
              完成执行
            </el-button>
            <el-button v-if="scope.row.status === 'executing'" link type="danger" size="small"
              @click="handleAbort(scope.row)">
              中止执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 完成执行对话框 -->
    <el-dialog v-model="completeDialogVisible" title="完成执行" width="600px">
      <el-form ref="completeFormRef" :model="completeForm" :rules="completeRules" label-width="100px">
        <el-form-item label="执行结果" prop="result">
          <el-radio-group v-model="completeForm.result">
            <el-radio label="success">成功</el-radio>
            <el-radio label="failed">失败</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行说明" prop="description">
          <el-input v-model="completeForm.description" type="textarea" :rows="4" placeholder="请输入执行说明" />
        </el-form-item>
        <el-form-item label="发现问题" prop="issues">
          <el-input v-model="completeForm.issues" type="textarea" :rows="3" placeholder="如有问题请描述" />
        </el-form-item>
        <el-form-item label="处理措施" prop="actions">
          <el-input v-model="completeForm.actions" type="textarea" :rows="3" placeholder="采取的处理措施" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 移除未使用的 maintenancePlanApi 与 parseTime 引入

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
  result: [{ required: true, message: '请选择执行结果', trigger: 'change' }],
  description: [{ required: true, message: '请输入执行说明', trigger: 'blur' }]
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
  const map = { executing: '执行中', completed: '已完成', aborted: '已中止' }
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