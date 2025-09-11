<template>
  <div class="inspection-plan">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="计划名称" prop="planName">
        <el-input v-model="queryParams.planName" placeholder="请输入计划名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="enabled">
        <el-select v-model="queryParams.enabled" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
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
          v-hasPermi="['inspection:plan:add']">新建计划</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="计划名称" align="center" prop="planName" />
      <el-table-column label="楼层" align="center" prop="floor" width="80">
        <template #default="scope">
          {{ getFloorLabel(scope.row.floor) }}
        </template>
      </el-table-column>
      <el-table-column label="执行频率" align="center" prop="frequency" width="100">
        <template #default="scope">
          {{ getFrequencyLabel(scope.row.frequency) }}
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center" prop="executionTime" width="100">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.executionTime }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行日期" align="center" prop="executionDays" width="180">
        <template #default="scope">
          {{ getExecutionDaysLabel(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="负责人" align="center" prop="responsibleName" width="100" />
      <el-table-column label="提醒时间" align="center" prop="reminderTime" width="100">
        <template #default="scope">
          {{ getReminderLabel(scope.row.reminderTime) }}
        </template>
      </el-table-column>
      <el-table-column label="下次执行" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.enabled">
            {{ parseTime(scope.row.nextExecutionTime) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="enabled" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['inspection:plan:edit']">修改</el-button>
          <el-button link type="primary" icon="Timer" @click="handleExecute(scope.row)"
            v-hasPermi="['inspection:execute']" :disabled="!scope.row.enabled">立即执行</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['inspection:plan:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="planName">
              <el-input v-model="form.planName" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡检楼层" prop="floor">
              <el-select v-model="form.floor" placeholder="请选择楼层">
                <el-option v-for="floor in FLOORS" :key="floor.value" :label="`${floor.label} (${floor.itemCount}项)`"
                  :value="floor.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行频率" prop="frequency">
              <el-select v-model="form.frequency" placeholder="请选择执行频率" @change="handleFrequencyChange">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行时间" prop="executionTime">
              <el-time-select v-model="form.executionTime" start="00:00" step="00:30" end="23:30"
                placeholder="选择执行时间" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item v-if="form.frequency === 'weekly'" label="执行星期" prop="weekDays">
              <el-checkbox-group v-model="form.weekDays">
                <el-checkbox label="1">周一</el-checkbox>
                <el-checkbox label="2">周二</el-checkbox>
                <el-checkbox label="3">周三</el-checkbox>
                <el-checkbox label="4">周四</el-checkbox>
                <el-checkbox label="5">周五</el-checkbox>
                <el-checkbox label="6">周六</el-checkbox>
                <el-checkbox label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item v-if="form.frequency === 'monthly'" label="执行日期" prop="monthDays">
              <el-checkbox-group v-model="form.monthDays">
                <el-checkbox v-for="day in 31" :key="day" :label="String(day)">
                  {{ day }}号
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsibleId">
              <el-select v-model="form.responsibleId" placeholder="请选择负责人" filterable>
                <el-option v-for="user in userList" :key="user.id" :label="user.nickName" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提前提醒" prop="reminderTime">
              <el-select v-model="form.reminderTime" placeholder="请选择提醒时间">
                <el-option label="不提醒" :value="0" />
                <el-option label="15分钟前" :value="15" />
                <el-option label="30分钟前" :value="30" />
                <el-option label="1小时前" :value="60" />
                <el-option label="2小时前" :value="120" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="通知人员" prop="notifyUserIds">
              <el-select v-model="form.notifyUserIds" placeholder="请选择通知人员" multiple filterable>
                <el-option v-for="user in userList" :key="user.id" :label="user.nickName" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用状态" prop="enabled">
              <el-switch v-model="form.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
// 修正导入路径，原 '@/api/inspection' 不存在
import { inspectionPlanApi } from '@/api/business'
import { FLOORS } from './constants'

const router = useRouter()
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const open = ref(false)
const title = ref('')
const queryRef = ref()
const formRef = ref()
const userList = ref([]) // 负责人/用户下拉数据

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planName: undefined,
  floor: undefined,
  enabled: undefined
})

// 表单数据
const form = ref({
  id: undefined,
  planName: '',
  floor: undefined,
  frequency: 'daily',
  executionTime: '09:00',
  weekDays: [],
  monthDays: [],
  responsibleId: undefined,
  reminderTime: 30,
  notifyUserIds: [],
  remark: '',
  enabled: true
})

// 表单验证规则
const rules = {
  planName: [
    { required: true, message: '计划名称不能为空', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择巡检楼层', trigger: 'change' }
  ],
  frequency: [
    { required: true, message: '请选择执行频率', trigger: 'change' }
  ],
  executionTime: [
    { required: true, message: '请选择执行时间', trigger: 'change' }
  ],
  responsibleId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  weekDays: [
    {
      validator: (rule, value, callback) => {
        if (form.value.frequency === 'weekly' && (!value || value.length === 0)) {
          callback(new Error('请选择执行星期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  monthDays: [
    {
      validator: (rule, value, callback) => {
        if (form.value.frequency === 'monthly' && (!value || value.length === 0)) {
          callback(new Error('请选择执行日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟数据
    dataList.value = [
      {
        id: 1,
        planName: '1楼每日巡检',
        floor: 'floor1',
        frequency: 'daily',
        executionTime: '09:00',
        responsibleName: '张三',
        reminderTime: 30,
        nextExecutionTime: new Date(),
        enabled: true
      }
    ]
    total.value = 1
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryRef.value?.resetFields()
  handleQuery()
}

// 新增
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '新建巡检计划'
}

// 修改
const handleUpdate = async (row) => {
  reset()
  const _id = row.id
  // 获取详情
  form.value = { ...row }
  open.value = true
  title.value = '修改巡检计划'
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm('是否确认删除该巡检计划？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await inspectionPlanApi.delete(row.id)
  ElMessage.success('删除成功')
  getList()
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    await inspectionPlanApi.toggle(row.id, row.enabled)
    ElMessage.success(row.enabled ? '启用成功' : '停用成功')
  } catch {
    row.enabled = !row.enabled
  }
}

// 立即执行
const handleExecute = (row) => {
  ElMessageBox.confirm('是否立即执行该巡检计划？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.push(`/inspection/create?floor=${row.floor}`)
  })
}

// 频率变更
const handleFrequencyChange = () => {
  form.value.weekDays = []
  form.value.monthDays = []
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()

  if (form.value.id) {
    await inspectionPlanApi.update(form.value.id, form.value)
    ElMessage.success('修改成功')
  } else {
    await inspectionPlanApi.create(form.value)
    ElMessage.success('新增成功')
  }

  open.value = false
  getList()
}

// 取消
const cancel = () => {
  open.value = false
  reset()
}

// 重置表单
const reset = () => {
  form.value = {
    id: undefined,
    planName: '',
    floor: undefined,
    frequency: 'daily',
    executionTime: '09:00',
    weekDays: [],
    monthDays: [],
    responsibleId: undefined,
    reminderTime: 30,
    notifyUserIds: [],
    remark: '',
    enabled: true
  }
  formRef.value?.resetFields()
}

// 获取楼层标签
const getFloorLabel = (value) => {
  const floor = FLOORS.find(f => f.value === value)
  return floor ? floor.label : value
}

// 获取频率标签
const getFrequencyLabel = (value) => {
  const map = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return map[value] || value
}

// 获取提醒标签
const getReminderLabel = (value) => {
  if (value === 0) return '不提醒'
  if (value < 60) return `${value}分钟前`
  return `${value / 60}小时前`
}

// 获取执行日期标签
const getExecutionDaysLabel = (row) => {
  if (row.frequency === 'daily') {
    return '每天'
  } else if (row.frequency === 'weekly') {
    const weekMap = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六' }
    const days = (row.weekDays || []).map(d => `周${weekMap[d]}`).join('、')
    return days || '-'
  } else if (row.frequency === 'monthly') {
    const days = (row.monthDays || []).map(d => `${d}号`).join('、')
    return days || '-'
  }
  return '-'
}

// 初始化
onMounted(async () => {
  getList()
  // 加载用户列表
  // const res = await listUser()
  // userList.value = res.rows

  // 模拟数据
  userList.value = [
    { id: 1, nickName: '张三' },
    { id: 2, nickName: '李四' },
    { id: 3, nickName: '王五' }
  ]
})
</script>

<style lang="scss" scoped>
.inspection-plan {
  padding: 20px;
}
</style>