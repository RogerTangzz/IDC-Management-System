<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工单编号" prop="ticketNo">
        <el-input v-model="queryParams.ticketNo" placeholder="请输入工单编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in ticket_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable>
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:ticket:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:ticket:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:ticket:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="User" :disabled="multiple" @click="handleBatchAssign"
          v-hasPermi="['business:ticket:assign']">批量指派</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:ticket:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="ticketList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工单编号" align="center" prop="ticketNo" width="120" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template #default="scope">
          <el-tag
            :type="scope.row.priority === 'high' ? 'danger' : scope.row.priority === 'medium' ? 'warning' : 'info'">
            {{ getPriorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报修人" align="center" prop="reporter" width="100" />
      <el-table-column label="故障设备" align="center" prop="equipment" width="120" />
      <el-table-column label="设备专业" align="center" prop="specialty" width="100">
        <template #default="scope">
          <dict-tag :options="equipment_specialty" :value="scope.row.specialty" />
        </template>
      </el-table-column>
      <el-table-column label="指派给" align="center" prop="assigneeName" width="100" />
      <el-table-column label="处理时限" align="center" prop="deadline" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadline) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:ticket:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:ticket:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:ticket:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改工单对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="ticketRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="工单标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入工单标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="报修人" prop="reporter">
              <el-input v-model="form.reporter" placeholder="请输入报修人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障设备" prop="equipment">
              <el-input v-model="form.equipment" placeholder="请输入故障设备" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="设备专业" prop="specialty">
              <el-select v-model="form.specialty" placeholder="请选择设备专业">
                <el-option label="暖通" value="hvac" />
                <el-option label="配电" value="power" />
                <el-option label="消防" value="fire" />
                <el-option label="弱电" value="weak" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发现时间" prop="discoveryTime">
              <el-date-picker v-model="form.discoveryTime" type="datetime" placeholder="选择故障发现时间"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="故障描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入故障描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="应急处置" prop="emergencyAction">
              <el-input v-model="form.emergencyAction" type="textarea" :rows="3" placeholder="请输入应急处置方法" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量指派对话框 -->
    <el-dialog title="批量指派" v-model="assignOpen" width="400px" append-to-body>
      <el-form ref="assignRef" :model="assignForm" label-width="80px">
        <el-form-item label="指派给" prop="userId">
          <el-select v-model="assignForm.userId" placeholder="请选择处理人">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAssign">确 定</el-button>
          <el-button @click="assignOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Ticket">
import { ref, reactive, getCurrentInstance, toRefs, computed } from 'vue'
import { parseTime } from '@/utils/ruoyi'
// import { listTicket, getTicket, delTicket, addTicket, updateTicket, assignTickets } from "@/api/business/ticket" // 后端集成后启用
// import { listUser } from "@/api/system/user" // 当前使用本地 mock 数据
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const { ticket_status, equipment_specialty } = proxy.useDict('ticket_status', 'equipment_specialty')

const ticketList = ref([])
const open = ref(false)
const assignOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const userList = ref([])

// 使用全局 ticketStore（持久化）
import { useTicketStore } from '@/store/modules/ticket'
const ticketStore = useTicketStore()
ticketStore.ensureSeed()

const data = reactive({
  form: {},
  assignForm: {
    userId: undefined
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ticketNo: undefined,
    title: undefined,
    status: undefined,
    priority: undefined,
    equipment: undefined,
    reporter: undefined
  },
  rules: {
    title: [{ required: true, message: "工单标题不能为空", trigger: "blur" }],
    priority: [{ required: true, message: "优先级不能为空", trigger: "change" }],
    reporter: [{ required: true, message: "报修人不能为空", trigger: "blur" }],
    equipment: [{ required: true, message: "故障设备不能为空", trigger: "blur" }],
    description: [{ required: true, message: "故障描述不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, assignForm, rules } = toRefs(data)

/** 查询工单列表 */
function getList() {
  loading.value = true

  // 使用Mock数据并应用过滤
  setTimeout(() => {
  let filteredData = [...ticketStore.tickets]

    // 应用搜索过滤
    if (queryParams.value.ticketNo) {
      filteredData = filteredData.filter(item =>
        item.ticketNo.toLowerCase().includes(queryParams.value.ticketNo.toLowerCase())
      )
    }
    if (queryParams.value.title) {
      filteredData = filteredData.filter(item =>
        item.title.includes(queryParams.value.title)
      )
    }
    if (queryParams.value.status) {
      filteredData = filteredData.filter(item =>
        item.status === queryParams.value.status
      )
    }
    if (queryParams.value.priority) {
      filteredData = filteredData.filter(item =>
        item.priority === queryParams.value.priority
      )
    }

    ticketList.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 300)
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    ticketId: undefined,
    ticketNo: undefined,
    title: undefined,
    priority: 'medium',
    status: 'pending',
    reporter: undefined,
    equipment: undefined,
    specialty: undefined,
    description: undefined,
    emergencyAction: undefined,
    discoveryTime: undefined
  }
  proxy.resetForm("ticketRef")
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ticketId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 查看按钮操作 */
function handleView(row) {
  const ticketId = row.ticketId || ids.value[0]
  router.push(`/business/ticket/detail/${ticketId}`)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加工单"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const ticketId = row.ticketId || ids.value[0]
  const ticket = ticketStore.getById(ticketId)
  if (ticket) {
    form.value = { ...ticket }
    open.value = true
    title.value = "修改工单"
  }
}

// 若通过 /business/ticket/edit/:ticketId 进入，自动打开编辑弹窗
if (route.name === 'TicketEdit' && route.params.ticketId) {
  const tid = Number(route.params.ticketId)
  const ticket = ticketStore.getById(tid)
  if (ticket) {
    form.value = { ...ticket }
    open.value = true
    title.value = '修改工单'
  } else {
    // 找不到则回列表
    router.replace('/business/ticket/list')
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ticketRef"].validate(valid => {
    if (valid) {
      if (form.value.ticketId != undefined) {
        // 修改
  ticketStore.update(form.value)
        proxy.$modal.msgSuccess("修改成功")
      } else {
  const newTicket = ticketStore.add({
          ...form.value,
          status: 'pending',
          createTime: parseTime(new Date()),
          deadline: parseTime(new Date(Date.now() + 24 * 60 * 60 * 1000))
  })
        proxy.$modal.msgSuccess("新增成功")
      }
      open.value = false
      getList()
      // 若来源为详情页，保存后跳回详情
      if (route.query.from === 'detail' && form.value.ticketId) {
        router.replace(`/business/ticket/detail/${form.value.ticketId}`)
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const targetIds = Array.isArray(ids.value) && ids.value.length > 0 && !row?.ticketId ? ids.value : [row.ticketId]
  proxy.$modal.confirm('是否确认删除工单编号为"' + targetIds.join(',') + '"的数据项？').then(function () {
    ticketStore.remove(targetIds)
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 批量指派按钮操作 */
function handleBatchAssign() {
  assignForm.value.userId = undefined
  assignOpen.value = true
  // Mock用户列表
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' }
  ]
}

/** 提交指派 */
function submitAssign() {
  if (!assignForm.value.userId) {
    proxy.$modal.msgWarning("请选择处理人")
    return
  }
  const user = userList.value.find(u => u.userId === assignForm.value.userId)
  ids.value.forEach(id => {
    const ticket = ticketStore.getById(id)
    if (ticket) {
      ticketStore.update({ ...ticket, assigneeName: user.nickName, status: 'assigned' })
    }
  })
  proxy.$modal.msgSuccess("指派成功")
  assignOpen.value = false
  getList()
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.msgSuccess("导出功能待实现")
}

/** 获取优先级标签 */
function getPriorityLabel(priority) {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

getList()
</script>