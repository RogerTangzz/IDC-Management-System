<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="t('system.dict.dictName')" prop="dictType">
            <el-select v-model="queryParams.dictType" style="width: 200px">
               <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName"
                  :value="item.dictType" />
            </el-select>
         </el-form-item>
         <el-form-item :label="t('system.dict.dictLabel')" prop="dictLabel">
            <el-input v-model="queryParams.dictLabel" :placeholder="t('system.dict.placeholder.dictLabel')" clearable style="width: 200px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('system.common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('system.dict.dataStatus')" clearable style="width: 200px">
               <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ t('system.common.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ t('system.common.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
               v-hasPermi="['system:dict:add']">{{ t('system.common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['system:dict:edit']">{{ t('system.common.edit') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['system:dict:remove']">{{ t('system.common.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['system:dict:export']">{{ t('system.common.export') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">{{ t('system.common.close') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="t('system.dict.dictCode')" align="center" prop="dictCode" />
         <el-table-column :label="t('system.dict.dictLabel')" align="center" prop="dictLabel">
            <template #default="scope">
               <span
                  v-if="(scope.row.listClass == '' || scope.row.listClass == 'default') && (scope.row.cssClass == '' || scope.row.cssClass == null)">{{
                     scope.row.dictLabel }}</span>
               <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass"
                  :class="scope.row.cssClass">{{ scope.row.dictLabel }}</el-tag>
            </template>
         </el-table-column>
         <el-table-column :label="t('system.dict.dictValue')" align="center" prop="dictValue" />
         <el-table-column :label="t('system.dict.dictSort')" align="center" prop="dictSort" />
         <el-table-column :label="t('system.common.status')" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column :label="t('system.common.createTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.operation')" align="center" width="160" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:dict:edit']">{{ t('system.common.edit') }}</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['system:dict:remove']">{{ t('system.common.delete') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="dataRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item :label="t('system.dict.dictType')">
               <el-input v-model="form.dictType" :disabled="true" />
            </el-form-item>
            <el-form-item :label="t('system.dict.dataLabel')" prop="dictLabel">
               <el-input v-model="form.dictLabel" :placeholder="t('system.dict.placeholder.dictLabel')" />
            </el-form-item>
            <el-form-item :label="t('system.dict.dataValue')" prop="dictValue">
               <el-input v-model="form.dictValue" :placeholder="t('system.dict.placeholder.dictValue')" />
            </el-form-item>
            <el-form-item :label="t('system.dict.cssClass')" prop="cssClass">
               <el-input v-model="form.cssClass" :placeholder="t('system.dict.placeholder.cssClass')" />
            </el-form-item>
            <el-form-item :label="t('system.dict.displaySort')" prop="dictSort">
               <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item :label="t('system.dict.displayStyle')" prop="listClass">
               <el-select v-model="form.listClass">
                  <el-option v-for="item in listClassOptions" :key="item.value"
                     :label="item.label + '(' + item.value + ')'" :value="item.value"></el-option>
               </el-select>
            </el-form-item>
            <el-form-item :label="t('system.common.status')" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label
                     }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item :label="t('system.common.remark')" prop="remark">
               <el-input v-model="form.remark" type="textarea" :placeholder="t('system.common.inputRemark')"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">{{ t('system.common.submit') }}</el-button>
               <el-button @click="cancel">{{ t('system.common.cancel') }}</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Data">
import useDictStore from '@/store/modules/dict'
import { optionselect as getDictOptionselect, getType } from "@/api/system/dict/type"
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data"
import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance()
const { t } = useI18n()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const dataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const defaultDictType = ref("")
const typeOptions = ref([])
const route = useRoute()
// 数据标签回显样式
const listClassOptions = ref([
   { value: "default", label: t('system.dict.listClassOption.default') },
   { value: "primary", label: t('system.dict.listClassOption.primary') },
   { value: "success", label: t('system.dict.listClassOption.success') },
   { value: "info", label: t('system.dict.listClassOption.info') },
   { value: "warning", label: t('system.dict.listClassOption.warning') },
   { value: "danger", label: t('system.dict.listClassOption.danger') }
])

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      dictType: undefined,
      dictLabel: undefined,
      status: undefined
   },
   rules: {
      dictLabel: [{ required: true, message: t('system.dict.validation.dataLabelRequired'), trigger: "blur" }],
      dictValue: [{ required: true, message: t('system.dict.validation.dataValueRequired'), trigger: "blur" }],
      dictSort: [{ required: true, message: t('system.dict.validation.dataSortRequired'), trigger: "blur" }]
   }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询字典类型详细 */
function getTypes(dictId) {
   getType(dictId).then(response => {
      queryParams.value.dictType = response.data.dictType
      defaultDictType.value = response.data.dictType
      getList()
   })
}

/** 查询字典类型列表 */
function getTypeList() {
   getDictOptionselect().then(response => {
      typeOptions.value = response.data
   })
}

/** 查询字典数据列表 */
function getList() {
   loading.value = true
   listData(queryParams.value).then(response => {
      dataList.value = response.rows
      total.value = response.total
      loading.value = false
   })
}

/** 取消按钮 */
function cancel() {
   open.value = false
   reset()
}

/** 表单重置 */
function reset() {
   form.value = {
      dictCode: undefined,
      dictLabel: undefined,
      dictValue: undefined,
      cssClass: undefined,
      listClass: "default",
      dictSort: 0,
      status: "0",
      remark: undefined
   }
   proxy.resetForm("dataRef")
}

/** 搜索按钮操作 */
function handleQuery() {
   queryParams.value.pageNum = 1
   getList()
}

/** 返回按钮操作 */
function handleClose() {
   const obj = { path: "/system/dict" }
   proxy.$tab.closeOpenPage(obj)
}

/** 重置按钮操作 */
function resetQuery() {
   proxy.resetForm("queryRef")
   queryParams.value.dictType = defaultDictType.value
   handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
   reset()
   open.value = true
   title.value = t('system.dict.addData')
   form.value.dictType = queryParams.value.dictType
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.dictCode)
   single.value = selection.length != 1
   multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate(row) {
   reset()
   const dictCode = row.dictCode || ids.value
   getData(dictCode).then(_response => {
      form.value = _response.data
      open.value = true
      title.value = t('system.dict.editData')
   })
}

/** 提交按钮 */
function submitForm() {
   proxy.$refs["dataRef"].validate(valid => {
      if (valid) {
         if (form.value.dictCode != undefined) {
            updateData(form.value).then(_response => {
               useDictStore().removeDict(queryParams.value.dictType)
               proxy.$modal.msgSuccess(t('system.dict.message.editSuccess'))
               open.value = false
               getList()
            })
         } else {
            addData(form.value).then(_response => {
               useDictStore().removeDict(queryParams.value.dictType)
               proxy.$modal.msgSuccess(t('system.dict.message.addSuccess'))
               open.value = false
               getList()
            })
         }
      }
   })
}

/** 删除按钮操作 */
function handleDelete(row) {
   const dictCodes = row.dictCode || ids.value
   proxy.$modal.confirm(t('system.dict.message.confirmDeleteData', { dictCode: dictCodes })).then(function () {
      return delData(dictCodes)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('system.dict.message.deleteSuccess'))
      useDictStore().removeDict(queryParams.value.dictType)
   }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
   proxy.download("system/dict/data/export", {
      ...queryParams.value
   }, `dict_data_${new Date().getTime()}.xlsx`)
}

getTypes(route.params && route.params.dictId)
getTypeList()
</script>
