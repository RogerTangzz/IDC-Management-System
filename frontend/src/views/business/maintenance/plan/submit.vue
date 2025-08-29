<!-- src/views/maintenance/plan/submit.vue -->
<template>
  <div class="maintenance-plan-submit">
    <el-card>
      <template #header>
        提交维保计划审核
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="计划名称">
          {{ plan.title }}
        </el-form-item>
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="form.approverId" placeholder="请选择审核人">
            <el-option
              v-for="user in approverList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提交说明" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入提交说明"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            提交审核
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { maintenancePlanApi } from '@/api/maintenance/plan'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const plan = ref({})
const formRef = ref()

const form = reactive({
  approverId: null,
  comment: ''
})

const rules = {
  approverId: [
    { required: true, message: '请选择审核人', trigger: 'change' }
  ]
}

// 模拟管理员列表
const approverList = ref([
  { id: 1, name: '管理员1' },
  { id: 2, name: '管理员2' }
])

// 加载计划信息
const loadPlan = async () => {
  try {
    const res = await maintenancePlanApi.get(route.params.id)
    plan.value = res.data
  } catch (error) {
    ElMessage.error('加载计划信息失败')
    router.back()
  }
}

// 提交审核
const handleSubmit = async () => {
  await formRef.value?.validate()
  
  loading.value = true
  try {
    await maintenancePlanApi.submitApproval(route.params.id, form.approverId)
    ElMessage.success('提交审核成功')
    router.push('/maintenance/plan')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadPlan()
})
</script>

<style scoped lang="scss">
.maintenance-plan-submit {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>