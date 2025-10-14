<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <span>{{ $t('business.settings.sla.title') }}</span>
      </template>
      <el-form :model="form" label-width="140px" :rules="rules" ref="formRef">
        <el-form-item :label="$t('business.settings.sla.field.enabled')" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item :label="$t('business.settings.sla.field.warnBeforeHours')" prop="warnBeforeHours">
          <el-input-number v-model="form.warnBeforeHours" :min="1" :max="72" />
        </el-form-item>
        <el-form-item :label="$t('business.settings.sla.field.lowHours')" prop="lowHours">
          <el-input-number v-model="form.lowHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item :label="$t('business.settings.sla.field.mediumHours')" prop="mediumHours">
          <el-input-number v-model="form.mediumHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item :label="$t('business.settings.sla.field.highHours')" prop="highHours">
          <el-input-number v-model="form.highHours" :min="1" :max="168" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" v-hasPermi="['system:config:edit']">{{ $t('business.settings.sla.action.save') }}</el-button>
          <el-button @click="load">{{ $t('business.settings.sla.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="SlaSettings">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSlaConfig, updateSlaConfig } from '@/api/system/sla'

const { t } = useI18n()
const { proxy } = getCurrentInstance()

const formRef = ref(null)
const form = ref({ enabled: true, warnBeforeHours: 2, lowHours: 24, mediumHours: 8, highHours: 4 })
const rules = {
  warnBeforeHours: [{ required: true, message: () => t('business.settings.sla.validation.warnBeforeHoursRequired'), trigger: 'blur' }],
  lowHours: [{ required: true, message: () => t('business.settings.sla.validation.lowHoursRequired'), trigger: 'blur' }],
  mediumHours: [{ required: true, message: () => t('business.settings.sla.validation.mediumHoursRequired'), trigger: 'blur' }],
  highHours: [{ required: true, message: () => t('business.settings.sla.validation.highHoursRequired'), trigger: 'blur' }]
}

async function load(){
  const res = await getSlaConfig()
  if (res && res.data) form.value = { ...form.value, ...res.data }
}
function onSubmit(){
  proxy.$refs['formRef']?.validate(async valid => {
    if (!valid) return
    await updateSlaConfig(form.value)
    proxy.$modal.msgSuccess(t('business.settings.sla.message.saveSuccess'))
    load()
  })
}

onMounted(load)
</script>

<style scoped>
</style>

