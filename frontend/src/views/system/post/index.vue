<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item :label="t('system.post.postCode')" prop="postCode">
            <el-input v-model="queryParams.postCode" :placeholder="t('system.post.placeholder.postCode')" clearable style="width: 200px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('system.post.postName')" prop="postName">
            <el-input v-model="queryParams.postName" :placeholder="t('system.post.placeholder.postName')" clearable style="width: 200px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('system.common.status')" prop="status">
            <el-select v-model="queryParams.status" :placeholder="t('system.post.placeholder.status')" clearable style="width: 200px">
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
               v-hasPermi="['system:post:add']">{{ t('system.common.add') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
               v-hasPermi="['system:post:edit']">{{ t('system.common.edit') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
               v-hasPermi="['system:post:remove']">{{ t('system.common.delete') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
               v-hasPermi="['system:post:export']">{{ t('system.common.export') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="t('system.post.postId')" align="center" prop="postId" />
         <el-table-column :label="t('system.post.postCode')" align="center" prop="postCode" />
         <el-table-column :label="t('system.post.postName')" align="center" prop="postName" />
         <el-table-column :label="t('system.post.postSort')" align="center" prop="postSort" />
         <el-table-column :label="t('system.common.status')" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.createTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column :label="t('system.common.operation')" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:post:edit']">{{ t('system.common.edit') }}</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  v-hasPermi="['system:post:remove']">{{ t('system.common.delete') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />

      <!-- 添加或修改岗位对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item :label="t('system.post.postName')" prop="postName">
               <el-input v-model="form.postName" :placeholder="t('system.post.placeholder.postName')" />
            </el-form-item>
            <el-form-item :label="t('system.post.postCode')" prop="postCode">
               <el-input v-model="form.postCode" :placeholder="t('system.post.placeholder.postCodeInput')" />
            </el-form-item>
            <el-form-item :label="t('system.post.postSort')" prop="postSort">
               <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item :label="t('system.post.postStatus')" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label
                     }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item :label="t('system.common.remark')" prop="remark">
               <el-input v-model="form.remark" type="textarea" :placeholder="t('system.common.inputRemark')" />
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

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post"
import { useI18n } from 'vue-i18n'

const { proxy } = getCurrentInstance()
const { t } = useI18n()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const postList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      postCode: undefined,
      postName: undefined,
      status: undefined
   },
   rules: {
      postName: [{ required: true, message: t('system.post.validation.postNameRequired'), trigger: "blur" }],
      postCode: [{ required: true, message: t('system.post.validation.postCodeRequired'), trigger: "blur" }],
      postSort: [{ required: true, message: t('system.post.validation.postSortRequired'), trigger: "blur" }],
   }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位列表 */
function getList() {
   loading.value = true
   listPost(queryParams.value).then(response => {
      postList.value = response.rows
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
      postId: undefined,
      postCode: undefined,
      postName: undefined,
      postSort: 0,
      status: "0",
      remark: undefined
   }
   proxy.resetForm("postRef")
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.postId)
   single.value = selection.length != 1
   multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
   reset()
   open.value = true
   title.value = t('system.post.addPost')
}

/** 修改按钮操作 */
function handleUpdate(row) {
   reset()
   const postId = row.postId || ids.value
   getPost(postId).then(_response => {
      form.value = _response.data
      open.value = true
      title.value = t('system.post.editPost')
   })
}

/** 提交按钮 */
function submitForm() {
   proxy.$refs["postRef"].validate(valid => {
      if (valid) {
         if (form.value.postId != undefined) {
            updatePost(form.value).then(_response => {
               proxy.$modal.msgSuccess(t('system.post.message.editSuccess'))
               open.value = false
               getList()
            })
         } else {
            addPost(form.value).then(_response => {
               proxy.$modal.msgSuccess(t('system.post.message.addSuccess'))
               open.value = false
               getList()
            })
         }
      }
   })
}

/** 删除按钮操作 */
function handleDelete(row) {
   const postIds = row.postId || ids.value
   proxy.$modal.confirm(t('system.post.message.confirmDelete', { postId: postIds })).then(function () {
      return delPost(postIds)
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('system.post.message.deleteSuccess'))
   }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
   proxy.download("system/post/export", {
      ...queryParams.value
   }, `post_${new Date().getTime()}.xlsx`)
}

getList()
</script>
