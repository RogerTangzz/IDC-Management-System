<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
         <el-form-item :label="t('system.user.userName')" prop="userName">
            <el-input v-model="queryParams.userName" :placeholder="t('system.user.placeholder.userName')" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item :label="t('system.user.phonenumber')" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" :placeholder="t('system.user.placeholder.phonenumber')" clearable style="width: 240px"
               @keyup.enter="handleQuery" />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{ t('system.common.search') }}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{ t('system.common.reset') }}</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="openSelectUser"
               v-hasPermi="['system:role:add']">{{ t('system.role.authUser.addUser') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="CircleClose" :disabled="multiple" @click="cancelAuthUserAll"
               v-hasPermi="['system:role:remove']">{{ t('system.role.authUser.batchCancelAuth') }}</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">{{ t('system.role.authUser.close') }}</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column :label="t('system.user.userName')" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column :label="t('system.user.nickName')" prop="nickName" :show-overflow-tooltip="true" />
         <el-table-column :label="t('system.role.authUser.email')" prop="email" :show-overflow-tooltip="true" />
         <el-table-column :label="t('system.role.authUser.phone')" prop="phonenumber" :show-overflow-tooltip="true" />
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
         <el-table-column :label="t('system.common.operation')" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)"
                  v-hasPermi="['system:role:remove']">{{ t('system.role.authUser.cancelAuth') }}</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />
      <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
   </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser"
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/system/role"
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")
const { t } = useI18n()

const userList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const multiple = ref(true)
const total = ref(0)
const userIds = ref([])

const queryParams = reactive({
   pageNum: 1,
   pageSize: 10,
   roleId: route.params.roleId,
   userName: undefined,
   phonenumber: undefined,
})

/** 查询授权用户列表 */
function getList() {
   loading.value = true
   allocatedUserList(queryParams).then(response => {
      userList.value = response.rows
      total.value = response.total
      loading.value = false
   })
}

/** 返回按钮 */
function handleClose() {
   const obj = { path: "/system/role" }
   proxy.$tab.closeOpenPage(obj)
}

/** 搜索按钮操作 */
function handleQuery() {
   queryParams.pageNum = 1
   getList()
}

/** 重置按钮操作 */
function resetQuery() {
   proxy.resetForm("queryRef")
   handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
   userIds.value = selection.map(item => item.userId)
   multiple.value = !selection.length
}

/** 打开授权用户表弹窗 */
function openSelectUser() {
   proxy.$refs["selectRef"].show()
}

/** 取消授权按钮操作 */
function cancelAuthUser(_row) {
   proxy.$modal.confirm(t('system.role.authUser.message.confirmCancel', { userName: _row.userName })).then(function () {
      return authUserCancel({ userId: _row.userId, roleId: queryParams.roleId })
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('system.role.authUser.message.cancelSuccess'))
   }).catch(() => { })
}

/** 批量取消授权按钮操作 */
function cancelAuthUserAll() {
   const roleId = queryParams.roleId
   const uIds = userIds.value.join(",")
   proxy.$modal.confirm(t('system.role.authUser.message.confirmBatchCancel')).then(function () {
      return authUserCancelAll({ roleId: roleId, userIds: uIds })
   }).then(() => {
      getList()
      proxy.$modal.msgSuccess(t('system.role.authUser.message.cancelSuccess'))
   }).catch(() => { })
}

getList()
</script>
