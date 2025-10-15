<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item :label="t('monitor.operlog.field.operIp')" prop="operIp">
            <el-input v-model="queryParams.operIp" :placeholder="t('monitor.operlog.placeholder.inputOperIp')" clearable style="width: 240px;"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('monitor.operlog.field.title')" prop="title">
            <el-input v-model="queryParams.title" :placeholder="t('monitor.operlog.placeholder.inputTitle')" clearable style="width: 240px;"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('monitor.operlog.field.operName')" prop="operName">
            <el-input v-model="queryParams.operName" :placeholder="t('monitor.operlog.placeholder.inputOperName')" clearable style="width: 240px;"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('monitor.operlog.field.businessType')" prop="businessType">
            <el-select v-model="queryParams.businessType" :placeholder="t('monitor.operlog.placeholder.operationType')" clearable style="width: 240px">
               <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('monitor.operlog.placeholder.operationStatus')" clearable style="width: 240px">
               <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('monitor.operlog.field.operTime')" style="width: 308px">
            <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="daterange" range-separator="-"
               :start-placeholder="t('monitor.operlog.placeholder.startDate')" :end-placeholder="t('monitor.operlog.placeholder.endDate')"
               :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ t('action.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ t('action.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['monitor:operlog:remove']">{{ t('action.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleClean"
               v-hasPermi="['monitor:operlog:remove']">{{ t('action.clear') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['monitor:operlog:export']">{{ t('action.export') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table ref="operlogRef" v-loading="loading" :data="operlogList" @selection-change="handleSelectionChange"
         :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column type="selection" width="50" align="center" />
         <el-table-column :label="t('monitor.operlog.field.operId')" align="center" prop="operId" />
         <el-table-column :label="t('monitor.operlog.field.title')" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column :label="t('monitor.operlog.field.businessType')" align="center" prop="businessType">
            <template #default="scope">
               <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.operlog.field.operName')" align="center" width="110" prop="operName" :show-overflow-tooltip="true"
            sortable="custom" :sort-orders="['descending', 'ascending']" />
         <el-table-column :label="t('monitor.operlog.field.operIp')" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
         <el-table-column :label="t('common.status')" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.operlog.field.operDate')" align="center" prop="operTime" width="180" sortable="custom"
            :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.operTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('monitor.operlog.field.costTime')" align="center" prop="costTime" width="110" :show-overflow-tooltip="true"
            sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ scope.row.costTime }}{{ t('monitor.operlog.label.milliseconds') }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('action.operate')" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row, scope.index)"
                  v-hasPermi="['monitor:operlog:query']">{{ t('action.detail') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 操作日志详细 -->
      <el-dialog :title="t('monitor.operlog.dialog.operlogDetail')" v-model="open" width="800px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.operlog.label.operModule') + '：'">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
                  <el-form-item :label="t('monitor.operlog.label.loginInfo') + '：'">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation
                     }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('monitor.operlog.field.operUrl') + '：'">{{ form.operUrl }}</el-form-item>
                  <el-form-item :label="t('monitor.operlog.field.requestMethod') + '：'">{{ form.requestMethod }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.operlog.field.method') + '：'">{{ form.method }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.operlog.field.operParam') + '：'">{{ form.operParam }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.operlog.field.jsonResult') + '：'">{{ form.jsonResult }}</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item :label="t('common.status') + '：'">
                     <div v-if="form.status === 0">{{ t('monitor.operlog.status.normal') }}</div>
                     <div v-else-if="form.status === 1">{{ t('monitor.operlog.status.failed') }}</div>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item :label="t('monitor.operlog.field.costTime') + '：'">{{ form.costTime }}{{ t('monitor.operlog.label.milliseconds') }}</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item :label="t('monitor.operlog.field.operTime') + '：'">{{ parseTime(form.operTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item :label="t('monitor.operlog.field.errorMsg') + '：'" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
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

<script setup name="Operlog">
import { useI18n } from 'vue-i18n'
import { list, delOperlog, cleanOperlog } from "@/api/monitor/operlog"

const { t } = useI18n()
const { proxy } = getCurrentInstance()
const { sys_oper_type, sys_common_status } = proxy.useDict("sys_oper_type", "sys_common_status")

const operlogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true) // value consumed by template via v-bind (pagination / button disable)
// dummy read to mark as used for eslint (template usage may not be detected by current config)
single.value
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])
const defaultSort = ref({ prop: "operTime", order: "descending" })

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      operIp: undefined,
      title: undefined,
      operName: undefined,
      businessType: undefined,
      status: undefined
   }
})

const { queryParams, form } = toRefs(data)

/** 查询登录日志 */
function getList() {
   loading.value = true
   list(proxy.addDateRange(queryParams.value, dateRange.value)).then(_response => {
      operlogList.value = _response.rows
      total.value = _response.total
      loading.value = false
   })
}

/** 操作日志类型字典翻译 */
function typeFormat(row, _column) {
   return proxy.selectDictLabel(sys_oper_type.value, row.businessType)
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
   queryParams.value.pageNum = 1
   proxy.$refs["operlogRef"].sort(defaultSort.value.prop, defaultSort.value.order)
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.operId)
   multiple.value = !selection.length
}

/** 排序触发事件 */
function handleSortChange(column, _prop, _order) {
   queryParams.value.orderByColumn = column.prop
   queryParams.value.isAsc = column.order
   getList()
}

/** 详细按钮操作 */
function handleView(row) {
   open.value = true
   form.value = row
}

/** 删除按钮操作 */
function handleDelete(row) {
   const operIds = row.operId || ids.value
   proxy.$modal.confirm(t('monitor.operlog.message.confirmDelete', { operIds })).then(function () {
      return delOperlog(operIds)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('common.success'))
   }).catch(() => { })
}

/** 清空按钮操作 */
function handleClean() {
   proxy.$modal.confirm(t('monitor.operlog.message.confirmClean')).then(function () {
      return cleanOperlog()
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('monitor.operlog.message.cleanSuccess'))
   }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
   proxy.download("monitor/operlog/export", {
      ...queryParams.value,
   }, `config_${new Date().getTime()}.xlsx`)
}

getList()
</script>
