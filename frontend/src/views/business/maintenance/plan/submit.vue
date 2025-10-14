<!-- src/views/maintenance/plan/submit.vue -->
<template>
  <div class="maintenance-plan-submit">
    <el-card>
      <template #header>
        {{ $t('business.maintenance.dialog.submitApprovalTitle') }}
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="$t('business.maintenance.field.title')">
          {{ plan.title }}
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.approverId')" prop="approverId">
          <el-select v-model="form.approverId" :placeholder="$t('business.maintenance.placeholder.selectApprover')">
            <el-option v-for="user in approverList" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.comment')" prop="comment">
          <el-input v-model="form.comment" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputComment')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ $t('business.maintenance.action.submit') }}
          </el-button>
          <el-button @click="handleCancel">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
// Mock API 占位，真实接口集成后替换
const maintenancePlanApi = {
  get: async (id) => ({ data: { planId: id, title: '示例维保计划' } }),
  submitApproval: async () => true
}

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
    { required: true, message: t('business.maintenance.validation.approverRequired'), trigger: 'change' }
  ]
}

// 模拟管理员列表
const approverList = ref([
  { id: 1, name: '管理员1' },
  { id: 2, name: '管理员2' }
])

// 加载计划信息
const loadPlan = async () => {
  const res = await maintenancePlanApi.get(route.params.id)
  plan.value = res.data
}

// 提交审核
const handleSubmit = async () => {
  await formRef.value?.validate()

  loading.value = true
  await maintenancePlanApi.submitApproval(route.params.id, form.approverId)
  ElMessage.success(t('business.maintenance.message.submitSuccess'))
  router.push('/maintenance/plan')
  loading.value = false
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