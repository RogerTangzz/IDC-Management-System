<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item :label="$t('business.maintenance.field.title')" prop="title">
        <el-input v-model="queryParams.title" :placeholder="$t('business.maintenance.placeholder.inputTitleShort')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.floor')" prop="floor">
        <el-select v-model="queryParams.floor" :placeholder="$t('business.maintenance.placeholder.selectFloor')" clearable">
          <el-option :label="$t('business.maintenance.message.all')" value="" />
          <el-option :label="$t('business.maintenance.floor.floor1')" value="1" />
          <el-option :label="$t('business.maintenance.floor.floor2')" value="2" />
          <el-option :label="$t('business.maintenance.floor.floor3')" value="3" />
          <el-option :label="$t('business.maintenance.floor.floor4')" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.mopCategory')" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" :placeholder="$t('business.maintenance.placeholder.selectCategory')" clearable>
          <el-option :label="$t('business.maintenance.message.all')" value="" />
          <el-option :label="$t('business.maintenance.category.daily')" value="daily" />
          <el-option :label="$t('business.maintenance.category.regular')" value="regular" />
          <el-option :label="$t('business.maintenance.category.monthly')" value="monthly" />
          <el-option :label="$t('business.maintenance.category.quarterly')" value="quarterly" />
          <el-option :label="$t('business.maintenance.category.annual')" value="annual" />
          <el-option :label="$t('business.maintenance.category.emergency')" value="emergency" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.approvalStatus')" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" :placeholder="$t('business.maintenance.placeholder.selectStatus')" clearable>
          <el-option :label="$t('business.maintenance.message.all')" value="" />
          <el-option :label="$t('business.maintenance.status.draft')" value="draft" />
          <el-option :label="$t('business.maintenance.status.pending')" value="pending" />
          <el-option :label="$t('business.maintenance.status.approved')" value="approved" />
          <el-option :label="$t('business.maintenance.status.rejected')" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.executionStatus')" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" :placeholder="$t('business.maintenance.placeholder.selectStatus')" clearable>
          <el-option :label="$t('business.maintenance.message.all')" value="" />
          <el-option :label="$t('business.maintenance.status.pending')" value="pending" />
          <el-option :label="$t('business.maintenance.status.executing')" value="executing" />
          <el-option :label="$t('business.maintenance.status.completed')" value="completed" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.timeRange')" prop="dateRange">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          :start-placeholder="$t('business.maintenance.placeholder.startDate')" :end-placeholder="$t('business.maintenance.placeholder.endDate')" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.maintenance.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.maintenance.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:maintenance:add']">{{ $t('business.maintenance.action.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="CopyDocument" @click="handleCopyLast"
          v-hasPermi="['business:maintenance:add']">{{ $t('business.maintenance.action.copyLast') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">{{ $t('business.maintenance.action.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="maintenanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="planId" width="80" />
      <el-table-column :label="$t('business.maintenance.field.title')" align="center" prop="title" min-width="200" show-overflow-tooltip />
      <el-table-column :label="$t('business.maintenance.field.floor')" align="center" prop="floor" width="80">
        <template #default="scope">
          <el-tag>{{ scope.row.floor === 5 ? $t('business.maintenance.message.all') : scope.row.floor + $t('business.maintenance.message.floorSuffix') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.version')" align="center" prop="version" width="80" />
      <el-table-column :label="$t('business.maintenance.field.mopCategory')" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <dict-tag :options="mop_category" :value="scope.row.mopCategory" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.executionCycle')" align="center" prop="executionCycle" width="100" />
      <el-table-column :label="$t('business.maintenance.field.approvalStatus')" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <el-tag :type="getApprovalStatusType(scope.row.approvalStatus)" disable-transitions>
            {{ getApprovalStatusLabel(scope.row.approvalStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.executionStatus')" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <el-tag :type="getExecutionStatusType(scope.row.executionStatus)" disable-transitions>
            {{ getExecutionStatusLabel(scope.row.executionStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.approverName')" align="center" prop="approverName" width="100" />
      <el-table-column :label="$t('business.maintenance.field.createTime')" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.nextExecutionTime')" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.nextExecutionTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.message.operation')" align="center" class-name="small-padding fixed-width" width="240" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">{{ $t('business.maintenance.action.detail') }}</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">{{ $t('business.maintenance.action.edit') }}</el-button>
          <el-button link type="success" icon="Check" @click="handleSubmitApproval(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">{{ $t('business.maintenance.action.submitApproval') }}</el-button>
          <el-button link type="warning" icon="Document" @click="handleGenerateTicket(scope.row)"
            v-hasPermi="['business:maintenance:edit']"
            v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'">{{ $t('business.maintenance.action.generateTicket') }}</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:maintenance:remove']" v-if="scope.row.approvalStatus === 'draft'">{{ $t('business.maintenance.action.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 提交审核对话框 -->
    <el-dialog v-model="approvalDialog" :title="$t('business.maintenance.dialog.submitApprovalTitle')" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item :label="$t('business.maintenance.field.approverId')" prop="approverId">
          <el-select v-model="approvalForm.approverId" :placeholder="$t('business.maintenance.placeholder.selectApprover')">
            <el-option v-for="item in approverList" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.remark')" prop="remark">
          <el-input v-model="approvalForm.remark" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputRemark')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialog = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
          <el-button type="primary" @click="submitApproval">{{ $t('business.maintenance.message.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Maintenance">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  listMaintenance,
  delMaintenance,
  submitApproval as submitApprovalApi,
  getApproverList,
  copyLastPlan,
  generateTicket
} from '@/api/business/maintenance'

const { t } = useI18n()
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
    { required: true, message: t('business.maintenance.validation.approverRequired'), trigger: "change" }
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
  proxy.$modal.confirm(t('business.maintenance.message.confirmCopyLastPlan')).then(() => {
    // 获取最新的计划
    listMaintenance({ pageNum: 1, pageSize: 1 }).then(response => {
      if (response.rows && response.rows.length > 0) {
        const lastPlan = response.rows[0]
        copyLastPlan(lastPlan.planId).then(() => {
          proxy.$modal.msgSuccess(t('business.maintenance.message.copySuccess'))
          getList()
        })
      } else {
        proxy.$modal.msgWarning(t('business.maintenance.message.noPlanToCopyWarning'))
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
        proxy.$modal.msgSuccess(t('business.maintenance.message.submitSuccess'))
        approvalDialog.value = false
        getList()
      })
    }
  })
}

// 生成工单
function handleGenerateTicket(row) {
  proxy.$modal.confirm(t('business.maintenance.message.confirmGenerateTicket')).then(() => {
    generateTicket(row.planId).then(() => {
      proxy.$modal.msgSuccess(t('business.maintenance.message.generateTicketSuccess'))
      getList()
    })
  })
}

// 删除
function handleDelete(row) {
  const planIds = row.planId || ids.value
  proxy.$modal.confirm(t('business.maintenance.message.confirmDelete', { id: planIds })).then(() => {
    return delMaintenance(planIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(t('business.maintenance.message.deleteSuccess'))
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
  return t(`business.maintenance.status.${status}`) || status
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
  return t(`business.maintenance.status.${status}`) || status
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
