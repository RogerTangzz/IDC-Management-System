<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <span>SLA 阈值设置</span>
      </template>
      <el-form :model="form" label-width="140px" :rules="rules" ref="formRef">
        <el-form-item label="启用SLA提醒" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="即将超时阈值(小时)" prop="warnBeforeHours">
          <el-input-number v-model="form.warnBeforeHours" :min="1" :max="72" />
        </el-form-item>
        <el-form-item label="低优先级处理时限(小时)" prop="lowHours">
          <el-input-number v-model="form.lowHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item label="中优先级处理时限(小时)" prop="mediumHours">
          <el-input-number v-model="form.mediumHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item label="高优先级处理时限(小时)" prop="highHours">
          <el-input-number v-model="form.highHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" v-hasPermi="['system:config:edit']">保存</el-button>
          <el-button @click="load">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="SlaSettings">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getSlaConfig, updateSlaConfig } from '@/api/system/sla'
const { proxy } = getCurrentInstance()

const formRef = ref(null)
const form = ref({ enabled: true, warnBeforeHours: 2, lowHours: 24, mediumHours: 8, highHours: 4 })
const rules = {
  warnBeforeHours: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
  lowHours: [{ required: true, message: '请输入低优先级时限', trigger: 'blur' }],
  mediumHours: [{ required: true, message: '请输入中优先级时限', trigger: 'blur' }],
  highHours: [{ required: true, message: '请输入高优先级时限', trigger: 'blur' }]
}

async function load(){
  const res = await getSlaConfig()
  if (res && res.data) form.value = { ...form.value, ...res.data }
}
function onSubmit(){
  proxy.$refs['formRef']?.validate(async valid => {
    if (!valid) return
    await updateSlaConfig(form.value)
    proxy.$modal.msgSuccess('保存成功')
    load()
  })
}

onMounted(load)
</script>

<style scoped>
</style>

