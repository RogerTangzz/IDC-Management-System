<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px" append-to-body :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" :disabled="mode === 'view'" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工单标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入工单标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择优先级">
              <el-option v-for="item in Object.values(TICKET_PRIORITY)" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="使用模板" prop="templateId" v-if="mode === 'create'">
            <el-select v-model="form.templateId" placeholder="选择模板（可选）" clearable @change="handleTemplateChange">
              <el-option v-for="item in templates" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理时限" prop="deadline">
            <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择处理时限" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="故障描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述故障情况" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="报修人" prop="reporterName">
            <el-input v-model="form.reporterName" placeholder="请输入报修人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="reporterPhone">
            <el-input v-model="form.reporterPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="故障设备" prop="equipmentName">
            <el-input v-model="form.equipmentName" placeholder="请输入故障设备名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备专业" prop="equipmentSpecialty">
            <el-select v-model="form.equipmentSpecialty" placeholder="请选择设备专业">
              <el-option v-for="item in EQUIPMENT_SPECIALTY" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="设备位置" prop="location">
        <el-input v-model="form.location" placeholder="请输入设备位置（如：1楼机房）" />
      </el-form-item>

      <el-form-item label="故障时间" prop="faultTime">
        <el-date-picker v-model="form.faultTime" type="datetime" placeholder="选择故障发现时间"
          value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>

      <el-form-item label="应急处置" prop="emergencyMeasure">
        <el-input v-model="form.emergencyMeasure" type="textarea" :rows="3" placeholder="请描述应急处置方法" />
      </el-form-item>

      <el-form-item label="附件" prop="attachments">
        <el-upload :action="uploadUrl" :headers="uploadHeaders" :file-list="fileList" :on-success="handleUploadSuccess"
          :on-remove="handleRemove" :before-upload="beforeUpload" multiple :limit="5">
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">支持jpg/png/pdf文件，单个文件不超过10MB</div>
          </template>
          <!-- src/views/ticket/components/TicketForm.vue -->

        </el-upload>
      </el-form-item>

      <el-form-item label="通知工程师" prop="notifyEngineer">
        <el-switch v-model="form.notifyEngineer" />
      </el-form-item>
    </el-form>


  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ticketApi, ticketTemplateApi } from '@/api/ticket'
import { TICKET_PRIORITY, EQUIPMENT_SPECIALTY } from '../constants'
import { getToken } from '@/utils/auth'

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
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入故障描述', trigger: 'blur' }
  ],
  reporterName: [
    { required: true, message: '请输入报修人姓名', trigger: 'blur' }
  ],
  reporterPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  equipmentName: [
    { required: true, message: '请输入故障设备名称', trigger: 'blur' }
  ],
  equipmentSpecialty: [
    { required: true, message: '请选择设备专业', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入设备位置', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  const titles = {
    create: '新建工单',
    edit: '修改工单',
    view: '工单详情'
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
    ElMessage.error('上传文件大小不能超过 10MB!')
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
      ElMessage.success('修改成功')
    } else {
      await ticketApi.create(form)
      ElMessage.success('新建成功')
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