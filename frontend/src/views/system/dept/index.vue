<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="t('system.dept.deptName')" prop="deptName">
            <el-input v-model="queryParams.deptName" :placeholder="t('system.dept.placeholder.deptName')" clearable style="width: 200px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('system.common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('system.dept.placeholder.status')" clearable style="width: 200px">
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
               v-hasPermi="['system:dept:add']">{{ t('system.common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="toggleExpandAll">{{ t('system.common.expandCollapse') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-if="refreshTable" v-loading="loading" :data="deptList" row-key="deptId"
         :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
         <el-table-column prop="deptName" :label="t('system.dept.deptName')" width="260"></el-table-column>
         <el-table-column prop="orderNum" :label="t('system.dept.orderNum')" width="200"></el-table-column>
         <el-table-column prop="status" :label="t('system.common.status')" width="100">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.createTime')" align="center" prop="createTime" width="200">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.operation')" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:dept:edit']">{{ t('system.common.edit') }}</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)"
                  v-hasPermi="['system:dept:add']">{{ t('system.common.add') }}</el-button>
               <el-button v-if="scope.row.parentId != 0" link type="primary" icon="Delete"
                  @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">{{ t('system.common.delete') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 添加或修改部门对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
            <el-row>
               <el-col :span="24" v-if="form.parentId !== 0">
                  <el-form-item :label="t('system.dept.parentDept')" prop="parentId">
                     <el-tree-select v-model="form.parentId" :data="deptOptions"
                        :props="{ value: 'deptId', label: 'deptName', children: 'children' }" value-key="deptId"
                        :placeholder="t('system.dept.placeholder.parentDept')" check-strictly />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.deptName')" prop="deptName">
                     <el-input v-model="form.deptName" :placeholder="t('system.dept.placeholder.deptName')" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.orderNum')" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.leader')" prop="leader">
                     <el-input v-model="form.leader" :placeholder="t('system.dept.placeholder.leader')" maxlength="20" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.phone')" prop="phone">
                     <el-input v-model="form.phone" :placeholder="t('system.dept.placeholder.phone')" maxlength="11" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.email')" prop="email">
                     <el-input v-model="form.email" :placeholder="t('system.dept.placeholder.email')" maxlength="50" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item :label="t('system.dept.deptStatus')">
                     <el-radio-group v-model="form.status">
                        <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label
                           }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
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

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"
import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance()
const { t } = useI18n()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

const data = reactive({
   form: {},
   queryParams: {
      deptName: undefined,
      status: undefined
   },
   rules: {
      parentId: [{ required: true, message: t('system.dept.validation.parentDeptRequired'), trigger: "blur" }],
      deptName: [{ required: true, message: t('system.dept.validation.deptNameRequired'), trigger: "blur" }],
      orderNum: [{ required: true, message: t('system.dept.validation.orderNumRequired'), trigger: "blur" }],
      email: [{ type: "email", message: t('system.dept.validation.emailFormat'), trigger: ["blur", "change"] }],
      phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: t('system.dept.validation.phoneFormat'), trigger: "blur" }]
   },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList() {
   loading.value = true
   listDept(queryParams.value).then(response => {
      deptList.value = proxy.handleTree(response.data, "deptId")
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
      deptId: undefined,
      parentId: undefined,
      deptName: undefined,
      orderNum: 0,
      leader: undefined,
      phone: undefined,
      email: undefined,
      status: "0"
   }
   proxy.resetForm("deptRef")
}

/** 搜索按钮操作 */
function handleQuery() {
   getList()
}

/** 重置按钮操作 */
function resetQuery() {
   proxy.resetForm("queryRef")
   handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row) {
   reset()
   listDept().then(response => {
      deptOptions.value = proxy.handleTree(response.data, "deptId")
   })
   if (row != undefined) {
      form.value.parentId = row.deptId
   }
   open.value = true
   title.value = t('system.dept.addDept')
}

/** 展开/折叠操作 */
function toggleExpandAll() {
   refreshTable.value = false
   isExpandAll.value = !isExpandAll.value
   nextTick(() => {
      refreshTable.value = true
   })
}

/** 修改按钮操作 */
function handleUpdate(row) {
   reset()
   listDeptExcludeChild(row.deptId).then(_response => {
      deptOptions.value = proxy.handleTree(_response.data, "deptId")
   })
   getDept(row.deptId).then(_response => {
      form.value = _response.data
      open.value = true
      title.value = t('system.dept.editDept')
   })
}

/** 提交按钮 */
function submitForm() {
   proxy.$refs["deptRef"].validate(valid => {
      if (valid) {
         if (form.value.deptId != undefined) {
            updateDept(form.value).then(_response => {
               proxy.$modal.msgSuccess(t('system.dept.message.editSuccess'))
               open.value = false
               getList()
            })
         } else {
            addDept(form.value).then(_response => {
               proxy.$modal.msgSuccess(t('system.dept.message.addSuccess'))
               open.value = false
               getList()
            })
         }
      }
   })
}

/** 删除按钮操作 */
function handleDelete(row) {
   proxy.$modal.confirm(t('system.dept.message.confirmDelete', { deptName: row.deptName })).then(function () {
      return delDept(row.deptId)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('system.dept.message.deleteSuccess'))
   }).catch(() => { })
}

getList()
</script>
