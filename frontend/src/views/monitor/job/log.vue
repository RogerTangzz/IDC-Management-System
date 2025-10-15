<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item :label="t('monitor.jobLog.field.jobName')" prop="jobName">
            <el-input v-model="queryParams.jobName" :placeholder="t('monitor.jobLog.placeholder.inputJobName')" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('monitor.jobLog.field.jobGroup')" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" :placeholder="t('monitor.jobLog.placeholder.selectJobGroup')" clearable style="width: 240px">
               <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('monitor.jobLog.field.executionStatus')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('monitor.jobLog.placeholder.selectExecutionStatus')" clearable style="width: 240px">
               <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('monitor.jobLog.field.executionTime')" style="width: 308px">
            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
               :start-placeholder="t('monitor.jobLog.placeholder.startDate')" :end-placeholder="t('monitor.jobLog.placeholder.endDate')"></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ t('action.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ t('action.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['monitor:job:remove']">{{ t('action.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleClean"
               v-hasPermi="['monitor:job:remove']">{{ t('action.clear') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['monitor:job:export']">{{ t('action.export') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">{{ t('action.close') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="t('monitor.jobLog.field.jobLogId')" width="80" align="center" prop="jobLogId" />
         <el-table-column :label="t('monitor.jobLog.field.jobName')" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.jobLog.field.jobGroup')" align="center" prop="jobGroup" :show-overflow-tooltip="true">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.jobLog.field.invokeTarget')" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.jobLog.field.jobMessage')" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.jobLog.field.executionStatus')" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.jobLog.field.executionTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('action.operate')" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row)"
                  v-hasPermi="['monitor:job:query']">{{ t('action.detail') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 调度日志详细 -->
      <el-dialog :title="t('monitor.jobLog.dialog.scheduleLogDetail')" v-model="open" width="700px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.jobLog.field.logId') + '：'">{{ form.jobLogId }}</el-form-item>
                  <el-form-item :label="t('monitor.jobLog.field.jobName') + '：'">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.jobLog.field.jobGroupLabel') + '：'">{{ form.jobGroup }}</el-form-item>
                  <el-form-item :label="t('monitor.jobLog.field.executionTime') + '：'">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.jobLog.field.invokeMethod') + '：'">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.jobLog.field.jobMessage') + '：'">{{ form.jobMessage }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.jobLog.field.executionStatus') + '：'">
                     <div v-if="form.status == 0">{{ t('monitor.jobLog.status.normal') }}</div>
                     <div v-else-if="form.status == 1">{{ t('monitor.jobLog.status.failed') }}</div>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.jobLog.field.exceptionInfo') + '：'" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="open = false">{{ t('action.close') }}</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="JobLog">
import { useI18n } from 'vue-i18n'
import { getJob } from "@/api/monitor/job"
import { listJobLog, delJobLog, cleanJobLog } from "@/api/monitor/jobLog"

const { t } = useI18n()
const { proxy } = getCurrentInstance()
const { sys_common_status, sys_job_group } = proxy.useDict("sys_common_status", "sys_job_group")

const jobLogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])
const route = useRoute()

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      dictName: undefined,
      dictType: undefined,
      status: undefined
   }
})

const { queryParams, form } = toRefs(data)

/** 查询调度日志列表 */
function getList() {
   loading.value = true
   listJobLog(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      jobLogList.value = response.rows
      total.value = response.total
      loading.value = false
   })
}

// 返回按钮
function handleClose() {
   const obj = { path: "/monitor/job" }
   proxy.$tab.closeOpenPage(obj)
}

/** 搜索按钮操作 */
function handleQuery() {
   queryParams.value.pageNum = 1
   getList()
}

/** 重置按钮操作 */
function resetQuery() {
   dateRange.value = []
   proxy.resetForm("queryRef")
   handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.jobLogId)
   multiple.value = !selection.length
}

/** 详细按钮操作 */
function handleView(row) { // row used to populate form
   open.value = true
   form.value = row
}

/** 删除按钮操作 */
function handleDelete(_row) {
   proxy.$modal.confirm(t('monitor.jobLog.message.confirmDelete', { jobLogIds: ids.value })).then(function () {
      return delJobLog(ids.value)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('common.success'))
   }).catch(() => { })
}

/** 清空按钮操作 */
function handleClean() {
   proxy.$modal.confirm(t('monitor.jobLog.message.confirmClean')).then(function () {
      return cleanJobLog()
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('monitor.jobLog.message.cleanSuccess'))
   }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
   proxy.download("monitor/jobLog/export", {
      ...queryParams.value,
   }, `job_log_${new Date().getTime()}.xlsx`)
}

(() => {
   const jobId = route.params && route.params.jobId
   if (jobId !== undefined && jobId != 0) {
      getJob(jobId).then(response => {
         queryParams.value.jobName = response.data.jobName
         queryParams.value.jobGroup = response.data.jobGroup
         getList()
      })
   } else {
      getList()
   }
})()
</script>
