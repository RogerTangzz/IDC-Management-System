<template>
  <div class="app-container">
    <el-form ref="ticketRef" :model="form" :rules="rules" label-width="120px">
      <!-- 基础信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.title')" prop="title">
            <el-input v-model="form.title" :placeholder="$t('business.ticket.placeholder.inputTitle')" maxlength="100" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.priority')" prop="priority">
            <el-select v-model="form.priority" :placeholder="$t('business.ticket.placeholder.selectPriority')" @change="handlePriorityChange">
              <el-option v-for="dict in ticket_priority" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.reporter')" prop="reporter">
            <el-input v-model="form.reporter" :placeholder="$t('business.ticket.placeholder.inputReporterName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.timeLimit')">
            <el-input v-model="timeLimit" disabled>
              <template #append>
                <el-tag :type="getPriorityType(form.priority)">{{ getDeadline() }}</el-tag>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 故障信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.equipment')" prop="equipment">
            <el-input v-model="form.equipment" :placeholder="$t('business.ticket.placeholder.inputEquipmentName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.specialty')" prop="specialty">
            <el-select v-model="form.specialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')">
              <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('business.ticket.field.description')" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" :placeholder="$t('business.ticket.placeholder.inputDescriptionDetailedLocation')" maxlength="500"
              show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.discoveryTime')" prop="discoveryTime">
            <el-date-picker v-model="form.discoveryTime" type="datetime" :placeholder="$t('business.ticket.placeholder.selectDiscoveryTimeShort')"
              format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :default-time="defaultTime" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.assignee')" prop="assigneeId">
            <el-select v-model="form.assigneeId" :placeholder="$t('business.ticket.placeholder.selectAssignee')" clearable>
              <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('business.ticket.field.emergencyAction')" prop="emergencyAction">
            <el-input v-model="form.emergencyAction" type="textarea" :rows="3" :placeholder="$t('business.ticket.placeholder.inputEmergencyActionMethod')" maxlength="300"
              show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 使用工单模板 -->
      <el-row v-if="!ticketId">
        <el-col :span="24">
          <el-form-item :label="$t('business.ticket.field.templateSelect')">
            <el-select v-model="templateId" :placeholder="$t('business.ticket.placeholder.selectTemplateQuick')" clearable @change="handleTemplateChange">
              <el-option v-for="template in templateList" :key="template.templateId" :label="template.templateName"
                :value="template.templateId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 附件上传 -->
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('business.ticket.field.attachmentUpload')">
            <file-upload v-model="form.attachments" :limit="5" :fileSize="10"
              :fileType='["jpg", "jpeg", "png", "gif", "mp4", "avi"]' :isShowTip="true" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 通知设置 -->
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('business.ticket.field.notifySettings')">
            <el-checkbox v-model="form.notifyEngineer">{{ $t('business.ticket.message.notifyEngineer') }}</el-checkbox>
            <el-checkbox v-model="form.notifySms">{{ $t('business.ticket.message.smsNotify') }}</el-checkbox>
            <el-checkbox v-model="form.notifyEmail">{{ $t('business.ticket.message.emailNotify') }}</el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 按钮组 -->
    <div class="form-footer">
      <el-button @click="handleCancel">{{ $t('business.ticket.message.cancel') }}</el-button>
      <el-button type="primary" @click="submitForm" v-hasPermi="['business:ticket:add']" v-if="!ticketId">{{ $t('business.ticket.message.confirm') }}</el-button>
      <el-button type="primary" @click="submitForm" v-hasPermi="['business:ticket:edit']" v-else>{{ $t('business.ticket.message.confirm') }}</el-button>
    </div>
  </div>
</template>

<script setup name="TicketForm">
import { getCurrentInstance, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { getTicket, addTicket, updateTicket } from "@/api/business/ticket" // 真实接口接入时启用
// import { listUser } from "@/api/system/user" // 当前使用本地 mock

const { t } = useI18n()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

// 获取工单ID（编辑模式）
const ticketId = route.params && route.params.id

// 字典数据
const { ticket_priority, equipment_specialty } = proxy.useDict('ticket_priority', 'equipment_specialty')

// 表单数据
const form = ref({
  ticketId: undefined,
  ticketNo: undefined,
  title: '',
  priority: 'medium',
  status: 'pending',
  reporter: '',
  equipment: '',
  specialty: '',
  description: '',
  discoveryTime: '',
  deadline: '',
  assigneeId: undefined,
  emergencyAction: '',
  attachments: '',
  notifyEngineer: false,
  notifySms: false,
  notifyEmail: false
})

// 验证规则
const rules = {
  title: [
    { required: true, message: t('business.ticket.validation.titleRequired'), trigger: 'blur' },
    { min: 5, max: 100, message: t('business.ticket.validation.titleLength'), trigger: 'blur' }
  ],
  priority: [
    { required: true, message: t('business.ticket.validation.priorityRequired'), trigger: 'change' }
  ],
  reporter: [
    { required: true, message: t('business.ticket.validation.reporterRequired'), trigger: 'blur' }
  ],
  equipment: [
    { required: true, message: t('business.ticket.validation.equipmentNotEmpty'), trigger: 'blur' }
  ],
  specialty: [
    { required: true, message: t('business.ticket.validation.specialtyRequired'), trigger: 'change' }
  ],
  description: [
    { required: true, message: t('business.ticket.validation.descriptionRequired'), trigger: 'blur' },
    { min: 10, max: 500, message: t('business.ticket.validation.descriptionLength'), trigger: 'blur' }
  ],
  discoveryTime: [
    { required: true, message: t('business.ticket.validation.discoveryTimeRequired'), trigger: 'change' }
  ]
}

// 其他数据
const userList = ref([])
const templateList = ref([
  { templateId: 1, templateName: '空调漏水', title: '空调漏水处理', priority: 'low', specialty: 'hvac', description: '空调内机漏水', emergencyAction: '放置接水容器' },
  { templateId: 2, templateName: 'UPS故障', title: 'UPS电池故障', priority: 'high', specialty: 'power', description: 'UPS告警', emergencyAction: '检查UPS状态' },
  { templateId: 3, templateName: '温度告警', title: '机房温度过高', priority: 'high', specialty: 'hvac', description: '温度超标', emergencyAction: '开启备用空调' }
])
const templateId = ref(undefined)
const defaultTime = ref([new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)])

// 计算处理时限
const timeLimit = computed(() => {
  const limits = {
    high: t('business.ticket.message.timeLimit4h'),
    medium: t('business.ticket.message.timeLimit8h'),
    low: t('business.ticket.message.timeLimit24h')
  }
  return limits[form.value.priority] || ''
})

/** 获取处理截止时间 */
function getDeadline() {
  if (!form.value.discoveryTime) return ''

  const hours = {
    high: 4,
    medium: 8,
    low: 24
  }[form.value.priority] || 24

  const deadline = new Date(form.value.discoveryTime)
  deadline.setHours(deadline.getHours() + hours)

  return proxy.parseTime(deadline, '{y}-{m}-{d} {h}:{i}')
}

/** 获取优先级标签类型 */
function getPriorityType(priority) {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

/** 优先级变化处理 */
function handlePriorityChange(_val) {
  // 重新计算截止时间
  if (form.value.discoveryTime) {
    form.value.deadline = getDeadline()
  }
}

/** 选择模板 */
function handleTemplateChange(templateId) {
  if (!templateId) {
    return
  }

  proxy.$modal.confirm(t('business.ticket.message.confirmUseTemplate')).then(() => {
    // 获取模板数据并填充
    const template = templateList.value.find(t => t.templateId === templateId)
    if (template) {
      form.value.title = template.title
      form.value.priority = template.priority
      form.value.specialty = template.specialty
      form.value.description = template.description
      form.value.emergencyAction = template.emergencyAction

      proxy.$modal.msgSuccess(t('business.ticket.message.templateApplied'))
    }
  }).catch(() => {
    templateId.value = undefined
  })
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["ticketRef"].validate(valid => {
    if (!valid) return
    form.value.deadline = getDeadline()
    // Mock 分支：真实环境接入后调用接口
    proxy.$modal.msgSuccess(form.value.ticketId ? t('business.ticket.message.updateSuccess') : t('business.ticket.message.addSuccess'))
    router.push('/business/ticket')
  })
}

/** 取消 */
function handleCancel() {
  proxy.$modal.confirm(t('business.ticket.message.confirmCancel')).then(() => {
    router.push('/business/ticket')
  }).catch(() => { })
}

/** 获取用户列表 */
function getUserList() {
  // Mock数据
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' }
  ]
}

/** 获取工单详情 */
function getTicketInfo(id) {
  // Mock数据
  form.value = {
    ticketId: id,
    ticketNo: 'TK202501001',
    title: '空调漏水处理',
    priority: 'high',
    status: 'pending',
    reporter: '张三',
    equipment: '空调01',
    specialty: 'hvac',
    description: '空调内机漏水，地面有积水',
    discoveryTime: proxy.parseTime(new Date()),
    emergencyAction: '已放置接水容器'
  }
}

/** 初始化 */
onMounted(() => {
  getUserList()

  if (ticketId) {
    getTicketInfo(ticketId)
  } else {
    // 新建时设置默认值
    form.value.discoveryTime = proxy.parseTime(new Date())
  }
})
</script>

<style lang="scss" scoped>
.form-footer {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>