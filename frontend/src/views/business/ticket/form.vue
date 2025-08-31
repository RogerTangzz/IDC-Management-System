<template>
  <div class="app-container">
    <el-form ref="ticketRef" :model="form" :rules="rules" label-width="120px">
      <!-- 基础信息 -->
      <el-row>
        <el-col :span="12">
          <el-form-item label="工单标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入工单标题" maxlength="100" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择优先级" @change="handlePriorityChange">
              <el-option v-for="dict in ticket_priority" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="报修人" prop="reporter">
            <el-input v-model="form.reporter" placeholder="请输入报修人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理时限">
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
          <el-form-item label="故障设备" prop="equipment">
            <el-input v-model="form.equipment" placeholder="请输入故障设备名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备专业" prop="specialty">
            <el-select v-model="form.specialty" placeholder="请选择设备专业">
              <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="故障描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述设备故障状况及位置" maxlength="500"
              show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="发现时间" prop="discoveryTime">
            <el-date-picker v-model="form.discoveryTime" type="datetime" placeholder="选择故障发现时间"
              format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :default-time="defaultTime" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指派给" prop="assigneeId">
            <el-select v-model="form.assigneeId" placeholder="请选择处理人员" clearable>
              <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="应急处置" prop="emergencyAction">
            <el-input v-model="form.emergencyAction" type="textarea" :rows="3" placeholder="请输入应急处置方法" maxlength="300"
              show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 使用工单模板 -->
      <el-row v-if="!ticketId">
        <el-col :span="24">
          <el-form-item label="选择模板">
            <el-select v-model="templateId" placeholder="可选择工单模板快速填充" clearable @change="handleTemplateChange">
              <el-option v-for="template in templateList" :key="template.templateId" :label="template.templateName"
                :value="template.templateId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 附件上传 -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="附件上传">
            <file-upload v-model="form.attachments" :limit="5" :fileSize="10"
              :fileType='["jpg", "jpeg", "png", "gif", "mp4", "avi"]' :isShowTip="true" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 通知设置 -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="通知设置">
            <el-checkbox v-model="form.notifyEngineer">通知专业工程师</el-checkbox>
            <el-checkbox v-model="form.notifySms">短信通知</el-checkbox>
            <el-checkbox v-model="form.notifyEmail">邮件通知</el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 按钮组 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="submitForm" v-hasPermi="['business:ticket:add']" v-if="!ticketId">确
        定</el-button>
      <el-button type="primary" @click="submitForm" v-hasPermi="['business:ticket:edit']" v-else>确 定</el-button>
    </div>
  </div>
</template>

<script setup name="TicketForm">
import { getCurrentInstance, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import { getTicket, addTicket, updateTicket } from "@/api/business/ticket" // 真实接口接入时启用
// import { listUser } from "@/api/system/user" // 当前使用本地 mock

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
    { required: true, message: '工单标题不能为空', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  reporter: [
    { required: true, message: '报修人不能为空', trigger: 'blur' }
  ],
  equipment: [
    { required: true, message: '故障设备不能为空', trigger: 'blur' }
  ],
  specialty: [
    { required: true, message: '请选择设备专业', trigger: 'change' }
  ],
  description: [
    { required: true, message: '故障描述不能为空', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  discoveryTime: [
    { required: true, message: '请选择发现时间', trigger: 'change' }
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
    high: '4小时',
    medium: '8小时',
    low: '24小时'
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

  proxy.$modal.confirm('是否使用该模板填充表单？').then(() => {
    // 获取模板数据并填充
    const template = templateList.value.find(t => t.templateId === templateId)
    if (template) {
      form.value.title = template.title
      form.value.priority = template.priority
      form.value.specialty = template.specialty
      form.value.description = template.description
      form.value.emergencyAction = template.emergencyAction

      proxy.$modal.msgSuccess("已应用模板")
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
    proxy.$modal.msgSuccess(form.value.ticketId ? "修改成功" : "新增成功")
    router.push('/business/ticket')
  })
}

/** 取消 */
function handleCancel() {
  proxy.$modal.confirm('确定要取消吗？未保存的数据将丢失').then(() => {
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