<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划名称" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入计划名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option label="全部楼层" value="" />
          <el-option label="1楼" value="1" />
          <el-option label="2楼" value="2" />
          <el-option label="3楼" value="3" />
          <el-option label="4楼" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="MOP类别" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" placeholder="请选择类别" clearable>
          <el-option label="全部" value="" />
          <el-option label="日常维护" value="daily" />
          <el-option label="定期保养" value="regular" />
          <el-option label="月度检修" value="monthly" />
          <el-option label="季度检修" value="quarterly" />
          <el-option label="年度检修" value="annual" />
          <el-option label="应急维修" value="emergency" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" placeholder="请选择状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="pending" />
          <el-option label="已批准" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" placeholder="请选择状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="待执行" value="pending" />
          <el-option label="执行中" value="executing" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围" prop="dateRange">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:maintenance:add']">新建维保计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="CopyDocument" @click="handleCopyLast"
          v-hasPermi="['business:maintenance:add']">复制上次计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="maintenanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="planId" width="80" />
      <el-table-column label="标题" align="center" prop="title" min-width="200" show-overflow-tooltip />
      <el-table-column label="楼层" align="center" prop="floor" width="80">
        <template #default="scope">
          <el-tag>{{ scope.row.floor === 5 ? '全部' : scope.row.floor + '楼' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="MOP类别" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <dict-tag :options="mop_category" :value="scope.row.mopCategory" />
        </template>
      </el-table-column>
      <el-table-column label="执行周期" align="center" prop="executionCycle" width="100" />
      <el-table-column label="审核状态" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <el-tag :type="getApprovalStatusType(scope.row.approvalStatus)" disable-transitions>
            {{ getApprovalStatusLabel(scope.row.approvalStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <el-tag :type="getExecutionStatusType(scope.row.executionStatus)" disable-transitions>
            {{ getExecutionStatusLabel(scope.row.executionStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="approverName" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下次执行时间" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.nextExecutionTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">编辑</el-button>
          <el-button link type="success" icon="Check" @click="handleSubmitApproval(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">提交审核</el-button>
          <el-button link type="warning" icon="Document" @click="handleGenerateTicket(scope.row)"
            v-hasPermi="['business:maintenance:edit']"
            v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'">生成工单</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:maintenance:remove']" v-if="scope.row.approvalStatus === 'draft'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 提交审核对话框 -->
    <el-dialog v-model="approvalDialog" title="提交审核" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="approvalForm.approverId" placeholder="请选择审核人">
            <el-option v-for="item in approverList" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="approvalForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialog = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Maintenance">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import {
  listMaintenance,
  delMaintenance,
  submitApproval as submitApprovalApi,
  getApproverList,
  copyLastPlan,
  generateTicket
} from '@/api/business/maintenance'

const { proxy } = getCurrentInstance()
const router = useRouter()

// 数据定义
const loading = ref(false)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const maintenanceList = ref([])
const dateRange = ref([])
const approvalDialog = ref(false)
const approverList = ref([])

// 字典数据
const { mop_category } = proxy.useDict('mop_category')

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  floor: undefined,
  mopCategory: undefined,
  approvalStatus: undefined,
  executionStatus: undefined
})

// 审核表单
const approvalForm = ref({
  planId: undefined,
  approverId: undefined,
  remark: undefined
})

// 审核表单校验规则
const approvalRules = {
  approverId: [
    { required: true, message: "请选择审核人", trigger: "change" }
  ]
}

// 获取列表
function getList() {
  loading.value = true
  listMaintenance(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    maintenanceList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置搜索
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.planId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增
function handleAdd() {
  router.push('/business/maintenance/create')
}

// 复制上次计划
function handleCopyLast() {
  proxy.$modal.confirm('是否复制上次维保计划？').then(() => {
    // 获取最新的计划
    listMaintenance({ pageNum: 1, pageSize: 1 }).then(response => {
      if (response.rows && response.rows.length > 0) {
        const lastPlan = response.rows[0]
        copyLastPlan(lastPlan.planId).then(() => {
          proxy.$modal.msgSuccess("复制成功")
          getList()
        })
      } else {
        proxy.$modal.msgWarning("没有可复制的计划")
      }
    })
  })
}

// 查看详情
function handleView(row) {
  router.push('/business/maintenance/detail/' + row.planId)
}

// 修改
function handleUpdate(row) {
  router.push('/business/maintenance/edit/' + row.planId)
}

// 提交审核
function handleSubmitApproval(row) {
  approvalForm.value = {
    planId: row.planId,
    approverId: undefined,
    remark: undefined
  }
  // 获取审核人列表
  getApproverList().then(response => {
    approverList.value = response.data
    approvalDialog.value = true
  })
}

// 确认提交审核
function submitApproval() {
  proxy.$refs["approvalRef"].validate(valid => {
    if (valid) {
      submitApprovalApi(approvalForm.value.planId, approvalForm.value.approverId).then(() => {
        proxy.$modal.msgSuccess("提交审核成功")
        approvalDialog.value = false
        getList()
      })
    }
  })
}

// 生成工单
function handleGenerateTicket(row) {
  proxy.$modal.confirm('确认生成工单吗？').then(() => {
    generateTicket(row.planId).then(() => {
      proxy.$modal.msgSuccess("工单生成成功")
      getList()
    })
  })
}

// 删除
function handleDelete(row) {
  const planIds = row.planId || ids.value
  proxy.$modal.confirm('是否确认删除维保计划编号为"' + planIds + '"的数据项？').then(() => {
    return delMaintenance(planIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  })
}

// 导出
function handleExport() {
  proxy.download('business/maintenance/export', {
    ...queryParams.value
  }, `maintenance_${new Date().getTime()}.xlsx`)
}

// 获取审核状态类型
function getApprovalStatusType(status) {
  const statusMap = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取审核状态标签
function getApprovalStatusLabel(status) {
  const statusMap = {
    'draft': '草稿',
    'pending': '待审核',
    'approved': '已批准',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

// 获取执行状态类型
function getExecutionStatusType(status) {
  const statusMap = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取执行状态标签
function getExecutionStatusLabel(status) {
  const statusMap = {
    'pending': '待执行',
    'executing': '执行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>