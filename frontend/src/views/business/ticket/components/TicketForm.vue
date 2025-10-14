<!-- DEPRECATION-CANDIDATE: Not referenced by current routes/views.
     Keep for 1–2 weeks post-GA; remove if no usages emerge.
     See docs/重构文档/dead-code-candidates.md -->
<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px" append-to-body :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" :disabled="mode === 'view'" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.title')" prop="title">
            <el-input v-model="form.title" :placeholder="$t('business.ticket.placeholder.inputTitle')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.priority')" prop="priority">
            <el-select v-model="form.priority" :placeholder="$t('business.ticket.placeholder.selectPriority')">
              <el-option v-for="item in Object.values(TICKET_PRIORITY)" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.templateId')" prop="templateId" v-if="mode === 'create'">
            <el-select v-model="form.templateId" :placeholder="$t('business.ticket.placeholder.selectTemplate')" clearable @change="handleTemplateChange">
              <el-option v-for="item in templates" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.deadline')" prop="deadline">
            <el-date-picker v-model="form.deadline" type="datetime" :placeholder="$t('business.ticket.placeholder.selectDeadline')" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="$t('business.ticket.field.description')" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" :placeholder="$t('business.ticket.placeholder.inputDescription')" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.reporterName')" prop="reporterName">
            <el-input v-model="form.reporterName" :placeholder="$t('business.ticket.placeholder.inputReporterName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.reporterPhone')" prop="reporterPhone">
            <el-input v-model="form.reporterPhone" :placeholder="$t('business.ticket.placeholder.inputReporterPhone')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.equipment')" prop="equipmentName">
            <el-input v-model="form.equipmentName" :placeholder="$t('business.ticket.placeholder.inputEquipmentName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('business.ticket.field.specialty')" prop="equipmentSpecialty">
            <el-select v-model="form.equipmentSpecialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')">
              <el-option v-for="item in EQUIPMENT_SPECIALTY" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="$t('business.ticket.field.location')" prop="location">
        <el-input v-model="form.location" :placeholder="$t('business.ticket.placeholder.inputLocation')" />
      </el-form-item>

      <el-form-item :label="$t('business.ticket.field.discoveryTime')" prop="faultTime">
        <el-date-picker v-model="form.faultTime" type="datetime" :placeholder="$t('business.ticket.placeholder.selectDiscoveryTimeShort')"
          value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>

      <el-form-item :label="$t('business.ticket.field.emergencyAction')" prop="emergencyMeasure">
        <el-input v-model="form.emergencyMeasure" type="textarea" :rows="3" :placeholder="$t('business.ticket.placeholder.inputEmergencyActionMethod')" />
      </el-form-item>

      <el-form-item :label="$t('business.ticket.field.attachments')" prop="attachments">
        <el-upload :action="uploadUrl" :headers="uploadHeaders" :file-list="fileList" :on-success="handleUploadSuccess"
          :on-remove="handleRemove" :before-upload="beforeUpload" multiple :limit="5">
          <el-button type="primary">{{ $t('business.ticket.field.attachmentUpload') }}</el-button>
          <template #tip>
            <div class="el-upload__tip">{{ $t('business.ticket.message.uploadTip') }}</div>
          </template>
          <!-- src/views/ticket/components/TicketForm.vue -->

        </el-upload>
      </el-form-item>

      <el-form-item :label="$t('business.ticket.message.notifyEngineer')" prop="notifyEngineer">
        <el-switch v-model="form.notifyEngineer" />
      </el-form-item>
    </el-form>


  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { ticketApi, ticketTemplateApi } from '@/api/ticket'
import { TICKET_PRIORITY, EQUIPMENT_SPECIALTY } from '../constants'
import { getToken } from '@/utils/auth'

const { t } = useI18n()

const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const mode = ref('create') // create, edit, view
const loading = ref(false)
const formRef = ref()
const templates = ref([])
const fileList = ref([])

const form = reactive({
  id: undefined,
  title: '',
  priority: 'medium',
  templateId: undefined,
  description: '',
  reporterName: '',
  reporterPhone: '',
  equipmentName: '',
  equipmentSpecialty: undefined,
  location: '',
  faultTime: undefined,
  emergencyMeasure: '',
  attachments: [],
  notifyEngineer: false,
  deadline: undefined
})

const rules = {
  title: [
    { required: true, message: () => t('business.ticket.validation.titleRequired'), trigger: 'blur' },
    { min: 5, max: 100, message: () => t('business.ticket.validation.titleLength'), trigger: 'blur' }
  ],
  priority: [
    { required: true, message: () => t('business.ticket.validation.priorityRequired'), trigger: 'change' }
  ],
  description: [
    { required: true, message: () => t('business.ticket.validation.descriptionRequired'), trigger: 'blur' }
  ],
  reporterName: [
    { required: true, message: () => t('business.ticket.validation.reporterRequired'), trigger: 'blur' }
  ],
  reporterPhone: [
    { required: true, message: () => t('business.ticket.validation.reporterPhoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: () => t('business.ticket.validation.reporterPhoneFormat'), trigger: 'blur' }
  ],
  equipmentName: [
    { required: true, message: () => t('business.ticket.validation.equipmentRequired'), trigger: 'blur' }
  ],
  equipmentSpecialty: [
    { required: true, message: () => t('business.ticket.validation.specialtyRequired'), trigger: 'change' }
  ],
  location: [
    { required: true, message: () => t('business.ticket.validation.locationRequired'), trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  const titles = {
    create: t('business.ticket.dialog.addTitle'),
    edit: t('business.ticket.dialog.updateTitle'),
    view: t('business.ticket.dialog.detailTitle')
  }
  return titles[mode.value]
})

const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_APP_BASE_API}/common/upload`
})

const uploadHeaders = computed(() => {
  return {
    Authorization: 'Bearer ' + getToken()
  }
})

// 监听优先级变化，自动计算处理时限
watch(() => form.priority, (val) => {
  if (val) {
    const priority = TICKET_PRIORITY[val.toUpperCase()]
    if (priority) {
      const deadline = new Date()
      deadline.setHours(deadline.getHours() + priority.limit)
      form.deadline = deadline
    }
  }
})

// 打开对话框
const open = async (id, openMode = 'create') => {
  dialogVisible.value = true
  mode.value = openMode
  reset()

  // 加载模板列表
  if (mode.value === 'create') {
    try {
      const res = await ticketTemplateApi.list()
      templates.value = res.data || []
    } catch {
      templates.value = []
    }
  }

  // 加载工单详情
  if (id) {
    loading.value = true
    try {
      const res = await ticketApi.get(id)
      Object.assign(form, res.data)
      fileList.value = res.data.attachments || []
    } finally {
      loading.value = false
    }
  }
}

// 选择模板
const handleTemplateChange = async (templateId) => {
  if (!templateId) return

  const res = await ticketTemplateApi.get(templateId)
  const template = res.data

  // 填充模板数据
  form.title = template.title
  form.priority = template.priority
  form.description = template.description
  form.equipmentSpecialty = template.equipmentSpecialty
  form.emergencyMeasure = template.emergencyMeasure
}

// 文件上传成功
const handleUploadSuccess = (_response, file) => {
  if (_response.code === 200) {
    form.attachments.push({
      name: file.name,
      url: _response.data.url
    })
  }
}

// 文件移除
const handleRemove = (file) => {
  const index = form.attachments.findIndex(item => item.url === file.url)
  if (index !== -1) {
    form.attachments.splice(index, 1)
  }
}

// 上传前校验
const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error(t('business.ticket.message.uploadSizeLimit'))
    return false
  }
  return true
}

// 提交表单
const _submitForm = async () => {
  await formRef.value?.validate()

  loading.value = true
  try {
    if (form.id) {
      await ticketApi.update(form.id, form)
      ElMessage.success(t('business.ticket.message.updateSuccess'))
    } else {
      await ticketApi.create(form)
      ElMessage.success(t('business.ticket.message.addSuccess'))
    }

    dialogVisible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}

// 取消
const _cancel = () => {
  dialogVisible.value = false
  reset()
}

// 重置表单
const reset = () => {
  form.id = undefined
  form.title = ''
  form.priority = 'medium'
  form.templateId = undefined
  form.description = ''
  form.reporterName = ''
  form.reporterPhone = ''
  form.equipmentName = ''
  form.equipmentSpecialty = undefined
  form.location = ''
  form.faultTime = undefined
  form.emergencyMeasure = ''
  form.attachments = []
  form.notifyEngineer = false
  form.deadline = undefined
  fileList.value = []
  formRef.value?.resetFields()
}

defineExpose({
  open
})
</script>
