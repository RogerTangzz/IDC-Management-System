<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <!--部门数据-->
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="deptName" :placeholder="t('system.user.placeholder.deptName')" clearable prefix-icon="Search"
                style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }"
                :expand-on-click-node="false" :filter-node-method="filterNode" ref="deptTreeRef" node-key="id"
                highlight-current default-expand-all @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane>
        <!--用户数据-->
        <pane size="84">
          <el-col>
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
              <el-form-item :label="t('system.user.userName')" prop="userName">
                <el-input v-model="queryParams.userName" :placeholder="t('system.user.placeholder.userName')" clearable style="width: 240px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item :label="t('system.user.phonenumber')" prop="phonenumber">
                <el-input v-model="queryParams.phonenumber" :placeholder="t('system.user.placeholder.phonenumber')" clearable style="width: 240px"
                  @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item :label="t('system.common.status')" prop="status">
                <el-select v-model="queryParams.status" :placeholder="t('system.user.placeholder.status')" clearable style="width: 240px">
                  <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('system.common.createTime')" style="width: 308px">
                <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
                  :start-placeholder="t('system.common.startDate')" :end-placeholder="t('system.common.endDate')"></el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">{{ t('system.common.search') }}</el-button>
                <el-button icon="Refresh" @click="resetQuery">{{ t('system.common.reset') }}</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                  v-hasPermi="['system:user:add']">{{ t('system.common.add') }}</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                  v-hasPermi="['system:user:edit']">{{ t('system.common.edit') }}</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                  v-hasPermi="['system:user:remove']">{{ t('system.common.delete') }}</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" plain icon="Upload" @click="handleImport"
                  v-hasPermi="['system:user:import']">{{ t('system.common.import') }}</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                  v-hasPermi="['system:user:export']">{{ t('system.common.export') }}</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column :label="t('system.user.userId')" align="center" key="userId" prop="userId" v-if="columns.userId.visible" />
              <el-table-column :label="t('system.user.userName')" align="center" key="userName" prop="userName"
                v-if="columns.userName.visible" :show-overflow-tooltip="true" />
              <el-table-column :label="t('system.user.nickName')" align="center" key="nickName" prop="nickName"
                v-if="columns.nickName.visible" :show-overflow-tooltip="true" />
              <el-table-column :label="t('system.user.deptName')" align="center" key="deptName" prop="dept.deptName"
                v-if="columns.deptName.visible" :show-overflow-tooltip="true" />
              <el-table-column :label="t('system.user.phonenumber')" align="center" key="phonenumber" prop="phonenumber"
                v-if="columns.phonenumber.visible" width="120" />
              <el-table-column :label="t('system.common.status')" align="center" key="status" v-if="columns.status.visible">
                <template #default="scope">
                  <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                    @change="handleStatusChange(scope.row)"></el-switch>
                </template>
              </el-table-column>
              <el-table-column :label="t('system.common.createTime')" align="center" prop="createTime" v-if="columns.createTime.visible"
                width="160">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('system.common.operation')" align="center" width="150" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-tooltip :content="t('system.user.tooltip.edit')" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                      v-hasPermi="['system:user:edit']"></el-button>
                  </el-tooltip>
                  <el-tooltip :content="t('system.user.tooltip.delete')" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                      v-hasPermi="['system:user:remove']"></el-button>
                  </el-tooltip>
                  <el-tooltip :content="t('system.user.tooltip.resetPassword')" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)"
                      v-hasPermi="['system:user:resetPwd']"></el-button>
                  </el-tooltip>
                  <el-tooltip :content="t('system.user.tooltip.assignRole')" placement="top" v-if="scope.row.userId !== 1">
                    <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)"
                      v-hasPermi="['system:user:edit']"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize" @pagination="getList" />
          </el-col>
        </pane>
      </splitpanes>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('system.user.nickName')" prop="nickName">
              <el-input v-model="form.nickName" :placeholder="t('system.user.placeholder.nickName')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('system.user.dept')" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" :placeholder="t('system.user.placeholder.dept')"
                clearable check-strictly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('system.user.phonenumber')" prop="phonenumber">
              <el-input v-model="form.phonenumber" :placeholder="t('system.user.placeholder.phonenumber')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('system.user.email')" prop="email">
              <el-input v-model="form.email" :placeholder="t('system.user.placeholder.email')" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="t('system.user.userName')" prop="userName">
              <el-input v-model="form.userName" :placeholder="t('system.user.placeholder.userName')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="t('system.user.password')" prop="password">
              <el-input v-model="form.password" :placeholder="t('system.user.placeholder.password')" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('system.user.sex')">
              <el-select v-model="form.sex" :placeholder="t('system.user.placeholder.sex')">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('system.common.status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="t('system.user.post')">
              <el-select v-model="form.postIds" multiple :placeholder="t('system.user.placeholder.post')">
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId"
                  :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('system.user.role')">
              <el-select v-model="form.roleIds" multiple :placeholder="t('system.user.placeholder.role')">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                  :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="t('system.common.remark')">
              <el-input v-model="form.remark" type="textarea" :placeholder="t('system.common.inputRemark')"></el-input>
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

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :on-change="handleFileChange"
        :on-remove="handleFileRemove" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">{{ t('system.user.message.dragOrClick') }}<em>{{ t('system.user.message.clickUpload') }}</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />{{ t('system.user.message.updateExistingData') }}
            </div>
            <span>{{ t('system.user.message.fileFormatTip') }}</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline"
              @click="importTemplate">{{ t('system.user.message.downloadTemplate') }}</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">{{ t('system.common.submit') }}</el-button>
          <el-button @click="upload.open = false">{{ t('system.common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth"
import useAppStore from '@/store/modules/app'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user"
import { Splitpanes, Pane } from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import { useI18n } from 'vue-i18n'

const router = useRouter()
const appStore = useAppStore()
const { proxy } = getCurrentInstance()
const { t } = useI18n()
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex")

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const deptName = ref("")
const deptOptions = ref(undefined)
const enabledDeptOptions = ref(undefined)
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
})
// 列显隐信息
const columns = ref({
  userId: { label: t('system.user.userId'), visible: true },
  userName: { label: t('system.user.userName'), visible: true },
  nickName: { label: t('system.user.nickName'), visible: true },
  deptName: { label: t('system.user.deptName'), visible: true },
  phonenumber: { label: t('system.user.phonenumber'), visible: true },
  status: { label: t('system.common.status'), visible: true },
  createTime: { label: t('system.common.createTime'), visible: true }
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [{ required: true, message: t('system.user.validation.userNameRequired'), trigger: "blur" }, { min: 2, max: 20, message: t('system.user.validation.userNameLength'), trigger: "blur" }],
    nickName: [{ required: true, message: t('system.user.validation.nickNameRequired'), trigger: "blur" }],
    password: [{ required: true, message: t('system.user.validation.passwordRequired'), trigger: "blur" }, { min: 5, max: 20, message: t('system.user.validation.passwordLength'), trigger: "blur" }, { pattern: /^[^<>"'|\\]+$/, message: t('system.user.validation.passwordIllegal'), trigger: "blur" }],
    email: [{ type: "email", message: t('system.user.validation.emailFormat'), trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: t('system.user.validation.phonenumberFormat'), trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val)
})

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false
    userList.value = res.rows
    total.value = res.total
  })
}

/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data
    enabledDeptOptions.value = filterDisabledDept(JSON.parse(JSON.stringify(response.data)))
  })
}

/** 过滤禁用的部门 */
function filterDisabledDept(deptList) {
  return deptList.filter(dept => {
    if (dept.disabled) {
      return false
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children)
    }
    return true
  })
}

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
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
  queryParams.value.deptId = undefined
  proxy.$refs.deptTreeRef.setCurrentKey(null)
  handleQuery()
}

/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  proxy.$modal.confirm(t('system.user.message.confirmDelete', { userId: userIds })).then(function () {
    return delUser(userIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(t('system.user.message.deleteSuccess'))
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`)
}

/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === "0" ? t('system.user.message.enable') : t('system.user.message.disable')
  proxy.$modal.confirm(t('system.user.message.confirmStatus', { text: text, userName: row.userName })).then(function () {
    return changeUserStatus(row.userId, row.status)
  }).then(() => {
    proxy.$modal.msgSuccess(t('system.user.message.statusSuccess', { text: text }))
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
}

// 移除未使用的 handleCommand 以消除 lint 警告

/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId
  router.push("/system/user-auth/role/" + userId)
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt(t('system.user.message.resetPassword', { userName: row.userName }), t('system.user.message.confirmTitle'), {
    confirmButtonText: t('system.common.confirm'),
    cancelButtonText: t('system.common.cancel'),
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: t('system.user.message.passwordLengthError'),
    inputValidator: (value) => {
      // 允许除以下字符外: < > " ' | \
      if (/[<>"'|\\]/.test(value)) {
        return t('system.user.validation.passwordIllegal')
      }
    },
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(_response => {
      proxy.$modal.msgSuccess(t('system.user.message.resetPasswordSuccess', { password: value }))
    })
  }).catch(() => { })
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = t('system.user.importUser')
  upload.open = true
  upload.selectedFile = null
}

/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`)
}

/**文件上传中处理 */
const handleFileUploadProgress = (_event, _file, _fileList) => {
  upload.isUploading = true
}

/** 文件选择处理 */
const handleFileChange = (file, _fileList) => {
  upload.selectedFile = file
}

/** 文件删除处理 */
const handleFileRemove = (_file, _fileList) => {
  upload.selectedFile = null
}

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, _fileList) => {
  upload.open = false
  upload.isUploading = false
  proxy.$refs["uploadRef"].handleRemove(file)
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", t('system.user.message.importResult'), { dangerouslyUseHTMLString: true })
  getList()
}

/** 提交上传文件 */
function submitFileForm() {
  const file = upload.selectedFile
  if (!file || file.length === 0 || !file.name.toLowerCase().endsWith('.xls') && !file.name.toLowerCase().endsWith('.xlsx')) {
    proxy.$modal.msgError(t('system.user.message.selectFile'))
    return
  }
  proxy.$refs["uploadRef"].submit()
}

/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  proxy.resetForm("userRef")
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  getUser().then(response => {
    postOptions.value = response.posts
    roleOptions.value = response.roles
    open.value = true
    title.value = t('system.user.addUser')
    form.value.password = initPassword.value
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const userId = row.userId || ids.value
  getUser(userId).then(response => {
    form.value = response.data
    postOptions.value = response.posts
    roleOptions.value = response.roles
    form.value.postIds = response.postIds
    form.value.roleIds = response.roleIds
    open.value = true
    title.value = t('system.user.editUser')
    // 修正 ref 访问需加 .value
    form.value.password = ""
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(() => {
          proxy.$modal.msgSuccess(t('system.user.message.editSuccess'))
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then(() => {
          proxy.$modal.msgSuccess(t('system.user.message.addSuccess'))
          open.value = false
          getList()
        })
      }
    }
  })
}

onMounted(() => {
  getDeptTree()
  getList()
  proxy.getConfigKey("sys.user.initPassword").then(response => {
    initPassword.value = response.msg
  })
})
</script>
