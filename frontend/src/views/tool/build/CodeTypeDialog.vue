<template>
  <el-dialog v-model="open" width="500px" :title="title" @open="onOpen" @close="onClose">
    <el-form ref="codeTypeForm" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="t('tool.build.dialog.generateType')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button v-for="(item, index) in typeOptions" :key="index" :label="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="showFileName" :label="t('tool.build.dialog.fileName')" prop="fileName">
        <el-input v-model="formData.fileName" :placeholder="t('tool.build.dialog.fileNamePlaceholder')" clearable />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="onClose">{{ t('tool.gen.action.cancel') }}</el-button>
      <el-button type="primary" @click="handelConfirm">{{ t('tool.gen.action.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = defineModel()
const props = defineProps({
  title: String,
  showFileName: Boolean
})
const emit = defineEmits(['confirm'])
const formData = ref({
  fileName: undefined,
  type: 'file'
})
const codeTypeForm = ref()
const rules = computed(() => ({
  fileName: [{
    required: true,
    message: t('tool.build.dialog.fileNamePlaceholder'),
    trigger: 'blur'
  }],
  type: [{
    required: true,
    message: t('tool.build.validation.generateTypeRequired'),
    trigger: 'change'
  }]
}))
const typeOptions = computed(() => [
  {
    label: t('tool.build.dialog.generateTypePage'),
    value: 'file'
  },
  {
    label: t('tool.build.dialog.generateTypeDialog'),
    value: 'dialog'
  }
])
function onOpen() {
  if (props.showFileName) {
    formData.value.fileName = `${+new Date()}.vue`
  }
}
function onClose() {
  open.value = false
}
function handelConfirm() {
  codeTypeForm.value.validate(valid => {
    if (!valid) return
    emit('confirm', { ...formData.value })
    onClose()
  })
}
</script>