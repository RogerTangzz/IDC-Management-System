<!-- src/views/ticket/components/AssignDialog.vue 
     DEPRECATION-CANDIDATE: Not imported; index.vue/detail.vue embed their own dialogs.
     Keep for 1–2 weeks post-GA; remove if no usages emerge.
     See docs/重构文档/dead-code-candidates.md -->
<template>
  <el-dialog v-model="dialogVisible" title="工单指派" width="500px" append-to-body>
    <div v-if="ticketIds.length > 0" class="ticket-info">
      <el-alert :title="`您正在指派 ${ticketIds.length} 个工单`" type="info" :closable="false" />
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="margin-top: 20px">
      <el-form-item label="指派给" prop="assigneeId">
        <el-select v-model="form.assigneeId" placeholder="请选择工程师" filterable>
          <el-option v-for="user in engineerList" :key="user.id" :label="`${user.name} (${user.role})`"
            :value="user.id">
            <span style="float: left">{{ user.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ user.workload || 0 }} 个待处理
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="form.priority">
          <el-radio label="high">高优先级</el-radio>
          <el-radio label="medium">中优先级</el-radio>
          <el-radio label="low">低优先级</el-radio>
          <el-radio label="keep">保持原优先级</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="指派说明" prop="comment">
        <el-input v-model="form.comment" type="textarea" :rows="3" placeholder="请输入指派说明（可选）" />
      </el-form-item>

      <el-form-item label="通知方式" prop="notifyMethod">
        <el-checkbox-group v-model="form.notifyMethod">
          <el-checkbox label="system">系统通知</el-checkbox>
          <el-checkbox label="email">邮件通知</el-checkbox>
          <el-checkbox label="sms">短信通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="立即通知" prop="notifyNow">
        <el-switch v-model="form.notifyNow" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        确定指派
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { ticketApi } from '@/api/ticket'
import { userApi } from '@/api/system/user'

const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const ticketIds = ref([])
const engineerList = ref([])

const form = reactive({
  assigneeId: undefined,
  priority: 'keep',
  comment: '',
  notifyMethod: ['system'],
  notifyNow: true
})

const rules = {
  assigneeId: [
    { required: true, message: '请选择指派工程师', trigger: 'change' }
  ]
}

// 打开对话框
const open = async (ids) => {
  ticketIds.value = ids || []
  dialogVisible.value = true
  reset()
  await loadEngineerList()
}

// 加载工程师列表
const loadEngineerList = async () => {
  try {
    // 获取工程师列表
    const res = await userApi.list({ role: 'engineer' })
    engineerList.value = res.data || []

    // 获取每个工程师的工作量
    for (const engineer of engineerList.value) {
      const workloadRes = await ticketApi.getWorkload(engineer.id)
      engineer.workload = workloadRes.data || 0
    }
  } catch (error) {
    console.error('加载工程师列表失败:', error)
    engineerList.value = [
      { id: 1, name: '张三', role: '运维工程师', workload: 3 },
      { id: 2, name: '李四', role: '运维工程师', workload: 5 },
      { id: 3, name: '王五', role: '巡检员', workload: 2 }
    ]
  }
}

// 确认指派
const handleConfirm = async () => {
  await formRef.value?.validate()

  loading.value = true
  try {
    // 构建指派数据
    const assignData = {
      ticketIds: ticketIds.value,
      assigneeId: form.assigneeId,
      comment: form.comment,
      notifyMethod: form.notifyMethod,
      notifyNow: form.notifyNow
    }

    // 如果选择了修改优先级
    if (form.priority !== 'keep') {
      assignData.priority = form.priority
    }

    // 调用批量指派接口
    await ticketApi.batchAssign(assignData)

    ElMessage.success(`成功指派 ${ticketIds.value.length} 个工单`)
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('指派失败:', error)
    ElMessage.error('指派失败，请重试')
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  reset()
}

// 重置表单
const reset = () => {
  form.assigneeId = undefined
  form.priority = 'keep'
  form.comment = ''
  form.notifyMethod = ['system']
  form.notifyNow = true
  formRef.value?.resetFields()
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.ticket-info {
  margin-bottom: 20px;
}
</style>
