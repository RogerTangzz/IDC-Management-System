<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="t('monitor.job.field.jobName')" prop="jobName">
            <el-input v-model="queryParams.jobName" :placeholder="t('monitor.job.placeholder.inputJobName')" clearable style="width: 200px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('monitor.job.field.jobGroup')" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" :placeholder="t('monitor.job.placeholder.selectJobGroup')" clearable style="width: 200px">
               <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('monitor.job.placeholder.selectTaskStatus')" clearable style="width: 200px">
               <el-option v-for="dict in sys_job_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ t('action.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ t('action.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
               v-hasPermi="['monitor:job:add']">{{ t('action.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']">{{ t('action.edit') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['monitor:job:remove']">{{ t('action.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['monitor:job:export']">{{ t('action.export') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="info" plain icon="Operation" @click="handleJobLog"
               v-hasPermi="['monitor:job:query']">{{ t('monitor.job.action.log') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="t('monitor.job.field.jobId')" width="100" align="center" prop="jobId" />
         <el-table-column :label="t('monitor.job.field.jobName')" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.job.field.jobGroup')" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.job.field.invokeTarget')" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.job.field.cronExecutionExpression')" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column :label="t('common.status')" align="center">
            <template #default="scope">
               <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                  @change="handleStatusChange(scope.row)"></el-switch>
            </template>
         </el-table-column>
         <el-table-column :label="t('action.operate')" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip :content="t('action.edit')" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['monitor:job:edit']"></el-button>
               </el-tooltip>
               <el-tooltip :content="t('action.delete')" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['monitor:job:remove']"></el-button>
               </el-tooltip>
               <el-tooltip :content="t('monitor.job.action.executeOnce')" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)"
                     v-hasPermi="['monitor:job:changeStatus']"></el-button>
               </el-tooltip>
               <el-tooltip :content="t('monitor.job.action.jobDetail')" placement="top">
                  <el-button link type="primary" icon="View" @click="handleView(scope.row)"
                     v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
               <el-tooltip :content="t('monitor.job.action.scheduleLog')" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)"
                     v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 添加或修改定时任务对话框 -->
      <el-dialog :title="title" v-model="open" width="820px" append-to-body>
         <el-form ref="jobRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.jobName')" prop="jobName">
                     <el-input v-model="form.jobName" :placeholder="t('monitor.job.placeholder.inputJobName')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.jobGroupLabel')" prop="jobGroup">
                     <el-select v-model="form.jobGroup" :placeholder="t('monitor.job.placeholder.select')">
                        <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label"
                           :value="dict.value"></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget">
                     <template #label>
                        <span>
                           {{ t('monitor.job.field.invokeMethod') }}
                           <el-tooltip placement="top">
                              <template #content>
                                 <div style="white-space: pre-line">{{ t('monitor.job.tooltip.invokeMethodHelp') }}</div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" :placeholder="t('monitor.job.placeholder.inputInvokeTarget')" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.job.field.cronExpression')" prop="cronExpression">
                     <el-input v-model="form.cronExpression" :placeholder="t('monitor.job.placeholder.inputCronExpression')">
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              {{ t('monitor.job.action.generateExpression') }}
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.jobId !== undefined">
                  <el-form-item :label="t('common.status')">
                     <el-radio-group v-model="form.status">
                        <el-radio v-for="dict in sys_job_status" :key="dict.value" :value="dict.value">{{ dict.label
                           }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.misfirePolicy')" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button value="1">{{ t('monitor.job.misfirePolicy.executeImmediately') }}</el-radio-button>
                        <el-radio-button value="2">{{ t('monitor.job.misfirePolicy.executeOnce') }}</el-radio-button>
                        <el-radio-button value="3">{{ t('monitor.job.misfirePolicy.abandonExecution') }}</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.concurrent')" prop="concurrent">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button value="0">{{ t('monitor.job.concurrent.allow') }}</el-radio-button>
                        <el-radio-button value="1">{{ t('monitor.job.concurrent.forbid') }}</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">{{ t('action.confirm') }}</el-button>
               <el-button @click="cancel">{{ t('action.cancel') }}</el-button>
            </div>
         </template>
      </el-dialog>

      <el-dialog :title="t('monitor.job.dialog.cronGeneratorTitle')" v-model="openCron" append-to-body destroy-on-close>
         <crontab ref="crontabRef" @hide="openCron = false" @fill="crontabFill" :expression="expression"></crontab>
      </el-dialog>

      <!-- 任务日志详细 -->
      <el-dialog :title="t('monitor.job.dialog.taskDetail')" v-model="openView" width="700px" append-to-body>
         <el-form :model="form" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.jobId') + '：'">{{ form.jobId }}</el-form-item>
                  <el-form-item :label="t('monitor.job.field.jobName') + '：'">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.jobGroupLabel') + '：'">{{ jobGroupFormat(form) }}</el-form-item>
                  <el-form-item :label="t('common.createTime') + '：'">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.cronExpression') + '：'">{{ form.cronExpression }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.nextValidTime') + '：'">{{ parseTime(form.nextValidTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.job.field.invokeTargetMethod') + '：'">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('common.status') + '：'">
                     <div v-if="form.status == 0">{{ t('monitor.job.status.normal') }}</div>
                     <div v-else-if="form.status == 1">{{ t('monitor.job.status.paused') }}</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.concurrent') + '：'">
                     <div v-if="form.concurrent == 0">{{ t('monitor.job.concurrent.allow') }}</div>
                     <div v-else-if="form.concurrent == 1">{{ t('monitor.job.concurrent.forbid') }}</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.job.field.misfirePolicy') + '：'">
                     <div v-if="form.misfirePolicy == 0">{{ t('monitor.job.misfirePolicy.default') }}</div>
                     <div v-else-if="form.misfirePolicy == 1">{{ t('monitor.job.misfirePolicy.executeImmediately') }}</div>
                     <div v-else-if="form.misfirePolicy == 2">{{ t('monitor.job.misfirePolicy.executeOnce') }}</div>
                     <div v-else-if="form.misfirePolicy == 3">{{ t('monitor.job.misfirePolicy.abandonExecution') }}</div>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="openView = false">{{ t('action.close') }}</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Job">
import { useI18n } from 'vue-i18n'
import Crontab from '@/components/Crontab'
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job"

const { t } = useI18n()
const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_job_group, sys_job_status } = proxy.useDict("sys_job_group", "sys_job_status")

const jobList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const openView = ref(false)
const openCron = ref(false)
const expression = ref("")

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      jobName: undefined,
      jobGroup: undefined,
      status: undefined
   },
   rules: {
      jobName: [{ required: true, message: computed(() => t('monitor.job.validation.jobNameRequired')), trigger: "blur" }],
      invokeTarget: [{ required: true, message: computed(() => t('monitor.job.validation.invokeTargetRequired')), trigger: "blur" }],
      cronExpression: [{ required: true, message: computed(() => t('monitor.job.validation.cronExpressionRequired')), trigger: "change" }]
   }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询定时任务列表 */
function getList() {
   loading.value = true
   listJob(queryParams.value).then(response => {
      jobList.value = response.rows
      total.value = response.total
      loading.value = false
   })
}

/** 任务组名字典翻译 */
function jobGroupFormat(row, _column) {
   return proxy.selectDictLabel(sys_job_group.value, row.jobGroup)
}

/** 取消按钮 */
function cancel() {
   open.value = false
   reset()
}

/** 表单重置 */
function reset() {
   form.value = {
      jobId: undefined,
      jobName: undefined,
      jobGroup: undefined,
      invokeTarget: undefined,
      cronExpression: undefined,
      misfirePolicy: 1,
      concurrent: 1,
      status: "0"
   }
   proxy.resetForm("jobRef")
}

/** 搜索按钮操作 */
function handleQuery() {
   queryParams.value.pageNum = 1
   getList()
}

/** 重置按钮操作 */
function resetQuery() {
   proxy.resetForm("queryRef")
   handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.jobId)
   single.value = selection.length != 1
   multiple.value = !selection.length
}

// handleCommand 在此页面未被使用，已移除以减少无用代码

// 任务状态修改
function handleStatusChange(row) {
   let text = row.status === "0" ? t('action.enable') : t('action.disable')
   proxy.$modal.confirm(t('monitor.job.message.confirmStatusChange', { action: text, jobName: row.jobName })).then(function () {
      return changeJobStatus(row.jobId, row.status)
   }).then(() => {
      proxy.$modal.msgSuccess(t('monitor.job.message.statusChangeSuccess', { action: text }))
   }).catch(function () {
      row.status = row.status === "0" ? "1" : "0"
   })
}

/* 立即执行一次 */
function handleRun(row) {
   proxy.$modal.confirm(t('monitor.job.message.confirmExecute', { jobName: row.jobName })).then(function () {
      return runJob(row.jobId, row.jobGroup)
   }).then(() => {
      proxy.$modal.msgSuccess(t('monitor.job.message.executeSuccess'))
   })
      .catch(() => { })
}

/** 任务详细信息 */
function handleView(row) {
   getJob(row.jobId).then(res => {
      form.value = res.data
      openView.value = true
   })
}

/** cron表达式按钮操作 */
function handleShowCron() {
   expression.value = form.value.cronExpression
   openCron.value = true
}

/** 确定后回传值 */
function crontabFill(value) {
   form.value.cronExpression = value
}

/** 任务日志列表查询 */
function handleJobLog(row) {
   const jobId = row.jobId || 0
   router.push('/monitor/job-log/index/' + jobId)
}

/** 新增按钮操作 */
function handleAdd() {
   reset()
   open.value = true
   title.value = t('monitor.job.dialog.addTask')
}

/** 修改按钮操作 */
function handleUpdate(row) {
   reset()
   const jobId = row.jobId || ids.value
   getJob(jobId).then(res => {
      form.value = res.data
      open.value = true
      title.value = t('monitor.job.dialog.editTask')
   })
}

/** 提交按钮 */
function submitForm() {
   proxy.$refs["jobRef"].validate(valid => {
      if (valid) {
         if (form.value.jobId != undefined) {
            updateJob(form.value).then(() => {
               proxy.$modal.msgSuccess(t('common.success'))
               open.value = false
               getList()
            })
         } else {
            addJob(form.value).then(() => {
               proxy.$modal.msgSuccess(t('common.success'))
               open.value = false
               getList()
            })
         }
      }
   })
}

/** 删除按钮操作 */
function handleDelete(row) {
   const jobIds = row.jobId || ids.value
   proxy.$modal.confirm(t('monitor.job.message.confirmDelete', { jobIds })).then(function () {
      return delJob(jobIds)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('common.success'))
   }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
   proxy.download("monitor/job/export", {
      ...queryParams.value,
   }, `job_${new Date().getTime()}.xlsx`)
}

getList()
</script>
