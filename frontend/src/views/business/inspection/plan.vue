<template>
  <div class="inspection-plan">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item :label="$t('business.inspection.plan.planName')" prop="planName">
        <el-input v-model="queryParams.planName" :placeholder="$t('business.inspection.placeholder_plan.inputPlanName')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('business.inspection.plan.floor')" prop="floor">
        <el-select v-model="queryParams.floor" :placeholder="$t('business.inspection.placeholder_plan.selectFloor')" clearable>
          <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.inspection.plan.status')" prop="enabled">
        <el-select v-model="queryParams.enabled" :placeholder="$t('business.inspection.placeholder_plan.selectStatus')" clearable>
          <el-option :label="$t('business.inspection.plan.enabled')" :value="true" />
          <el-option :label="$t('business.inspection.plan.disabled')" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.inspection.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.inspection.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['inspection:plan:add']">{{ $t('business.inspection.plan.addPlan') }}</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column :label="$t('common.index')" type="index" width="55" align="center" />
      <el-table-column :label="$t('business.inspection.plan.planName')" align="center" prop="planName" />
      <el-table-column :label="$t('business.inspection.plan.floor')" align="center" prop="floor" width="80">
        <template #default="scope">
          {{ getFloorLabel(scope.row.floor) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.frequency')" align="center" prop="frequency" width="100">
        <template #default="scope">
          {{ getFrequencyLabel(scope.row.frequency) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.executionTime')" align="center" prop="executionTime" width="100">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.executionTime }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.executionDays')" align="center" prop="executionDays" width="180">
        <template #default="scope">
          {{ getExecutionDaysLabel(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.responsibleName')" align="center" prop="responsibleName" width="100" />
      <el-table-column :label="$t('business.inspection.plan.reminderTime')" align="center" prop="reminderTime" width="100">
        <template #default="scope">
          {{ getReminderLabel(scope.row.reminderTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.nextExecutionTime')" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.enabled">
            {{ parseTime(scope.row.nextExecutionTime) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.plan.status')" align="center" prop="enabled" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['inspection:plan:edit']">{{ $t('business.inspection.action.edit') }}</el-button>
          <el-button link type="primary" icon="Timer" @click="handleExecute(scope.row)"
            v-hasPermi="['inspection:execute']" :disabled="!scope.row.enabled">{{ $t('business.inspection.action.executePlan') }}</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['inspection:plan:delete']">{{ $t('business.inspection.action.delete') }}</el-button>
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
            <el-form-item :label="$t('business.inspection.plan.planName')" prop="planName">
              <el-input v-model="form.planName" :placeholder="$t('business.inspection.placeholder_plan.inputPlanName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.floor')" prop="floor">
              <el-select v-model="form.floor" :placeholder="$t('business.inspection.placeholder_plan.selectFloor')">
                <el-option v-for="floor in FLOORS" :key="floor.value" :label="t('business.inspection.plan.floorWithCount', { label: floor.label, count: floor.itemCount })"
                  :value="floor.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.frequency')" prop="frequency">
              <el-select v-model="form.frequency" :placeholder="$t('business.inspection.placeholder_plan.selectFrequency')" @change="handleFrequencyChange">
                <el-option :label="$t('business.inspection.plan.frequency_daily')" value="daily" />
                <el-option :label="$t('business.inspection.plan.frequency_weekly')" value="weekly" />
                <el-option :label="$t('business.inspection.plan.frequency_monthly')" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.executionTime')" prop="executionTime">
              <el-time-select v-model="form.executionTime" start="00:00" step="00:30" end="23:30"
                :placeholder="$t('business.inspection.placeholder_plan.selectExecutionTime')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item v-if="form.frequency === 'weekly'" :label="$t('business.inspection.plan.weekDays')" prop="weekDays">
              <el-checkbox-group v-model="form.weekDays">
                <el-checkbox label="1">{{ $t('business.inspection.plan.weekday_mon') }}</el-checkbox>
                <el-checkbox label="2">{{ $t('business.inspection.plan.weekday_tue') }}</el-checkbox>
                <el-checkbox label="3">{{ $t('business.inspection.plan.weekday_wed') }}</el-checkbox>
                <el-checkbox label="4">{{ $t('business.inspection.plan.weekday_thu') }}</el-checkbox>
                <el-checkbox label="5">{{ $t('business.inspection.plan.weekday_fri') }}</el-checkbox>
                <el-checkbox label="6">{{ $t('business.inspection.plan.weekday_sat') }}</el-checkbox>
                <el-checkbox label="0">{{ $t('business.inspection.plan.weekday_sun') }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item v-if="form.frequency === 'monthly'" :label="$t('business.inspection.plan.monthDays')" prop="monthDays">
              <el-checkbox-group v-model="form.monthDays">
                <el-checkbox v-for="day in 31" :key="day" :label="String(day)">
                  {{ day }}{{ $t('business.inspection.plan.day_suffix') }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.responsibleName')" prop="responsibleId">
              <el-select v-model="form.responsibleId" :placeholder="$t('business.inspection.placeholder_plan.selectResponsible')" filterable>
                <el-option v-for="user in userList" :key="user.id" :label="user.nickName" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.reminderTime')" prop="reminderTime">
              <el-select v-model="form.reminderTime" :placeholder="$t('business.inspection.placeholder_plan.selectReminderTime')">
                <el-option :label="$t('business.inspection.plan.reminder_none')" :value="0" />
                <el-option :label="$t('business.inspection.plan.reminder_15min')" :value="15" />
                <el-option :label="$t('business.inspection.plan.reminder_30min')" :value="30" />
                <el-option :label="$t('business.inspection.plan.reminder_1hour')" :value="60" />
                <el-option :label="$t('business.inspection.plan.reminder_2hour')" :value="120" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('business.inspection.plan.notifyUserIds')" prop="notifyUserIds">
              <el-select v-model="form.notifyUserIds" :placeholder="$t('business.inspection.placeholder_plan.selectNotifyUsers')" multiple filterable>
                <el-option v-for="user in userList" :key="user.id" :label="user.nickName" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('business.inspection.field.remark')" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('business.inspection.placeholder_plan.inputRemark')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.plan.enabled_field')" prop="enabled">
              <el-switch v-model="form.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="cancel">{{ $t('business.inspection.action.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('business.inspection.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// 修正导入路径，原 '@/api/inspection' 不存在
import { inspectionPlanApi } from '@/api/business'
import { FLOORS } from './constants'

const { t } = useI18n()
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
    { required: true, message: () => t('business.inspection.validation_plan.planNameRequired'), trigger: 'blur' }
  ],
  floor: [
    { required: true, message: () => t('business.inspection.validation_plan.floorRequired'), trigger: 'change' }
  ],
  frequency: [
    { required: true, message: () => t('business.inspection.validation_plan.frequencyRequired'), trigger: 'change' }
  ],
  executionTime: [
    { required: true, message: () => t('business.inspection.validation_plan.executionTimeRequired'), trigger: 'change' }
  ],
  responsibleId: [
    { required: true, message: () => t('business.inspection.validation_plan.responsibleIdRequired'), trigger: 'change' }
  ],
  weekDays: [
    {
      validator: (rule, value, callback) => {
        if (form.value.frequency === 'weekly' && (!value || value.length === 0)) {
          callback(new Error(t('business.inspection.validation_plan.weekDaysRequired')))
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
          callback(new Error(t('business.inspection.validation_plan.monthDaysRequired')))
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
  title.value = t('business.inspection.plan.addPlan')
}

// 修改
const handleUpdate = async (row) => {
  reset()
  const _id = row.id
  // 获取详情
  form.value = { ...row }
  open.value = true
  title.value = t('business.inspection.plan.editPlan')
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm(t('business.inspection.plan.confirmDelete'), t('business.inspection.plan.systemPrompt'), {
    confirmButtonText: t('business.inspection.action.confirm'),
    cancelButtonText: t('business.inspection.action.cancel'),
    type: 'warning'
  })

  await inspectionPlanApi.delete(row.id)
  ElMessage.success(t('business.inspection.message.deleteSuccess'))
  getList()
}

// 状态变更
const handleStatusChange = async (row) => {
  try {
    await inspectionPlanApi.toggle(row.id, row.enabled)
    ElMessage.success(row.enabled ? t('business.inspection.plan.enableSuccess') : t('business.inspection.plan.disableSuccess'))
  } catch {
    row.enabled = !row.enabled
  }
}

// 立即执行
const handleExecute = (row) => {
  ElMessageBox.confirm(t('business.inspection.plan.confirmExecute'), t('business.inspection.plan.systemPrompt'), {
    confirmButtonText: t('business.inspection.action.confirm'),
    cancelButtonText: t('business.inspection.action.cancel'),
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
    ElMessage.success(t('business.inspection.message.updateSuccess'))
  } else {
    await inspectionPlanApi.create(form.value)
    ElMessage.success(t('business.inspection.message.addSuccess'))
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
    daily: t('business.inspection.plan.frequency_daily'),
    weekly: t('business.inspection.plan.frequency_weekly'),
    monthly: t('business.inspection.plan.frequency_monthly')
  }
  return map[value] || value
}

// 获取提醒标签
const getReminderLabel = (value) => {
  if (value === 0) return t('business.inspection.plan.reminder_none')
  if (value < 60) return t('business.inspection.plan.minutesBefore', { minutes: value })
  return t('business.inspection.plan.hoursBefore', { hours: value / 60 })
}

// 获取执行日期标签
const getExecutionDaysLabel = (row) => {
  if (row.frequency === 'daily') {
    return t('business.inspection.plan.everyday')
  } else if (row.frequency === 'weekly') {
    const weekMap = {
      '0': t('business.inspection.plan.weekday_sun'),
      '1': t('business.inspection.plan.weekday_mon'),
      '2': t('business.inspection.plan.weekday_tue'),
      '3': t('business.inspection.plan.weekday_wed'),
      '4': t('business.inspection.plan.weekday_thu'),
      '5': t('business.inspection.plan.weekday_fri'),
      '6': t('business.inspection.plan.weekday_sat')
    }
    const days = (row.weekDays || []).map(d => weekMap[d]).join('、')
    return days || '-'
  } else if (row.frequency === 'monthly') {
    const days = (row.monthDays || []).map(d => `${d}${t('business.inspection.plan.day_suffix')}`).join('、')
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