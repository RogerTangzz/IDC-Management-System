<template>
  <div>
    <el-dialog :title="t('tool.build.dialog.addOption')" v-model="open" width="800px" :close-on-click-modal="false" :modal-append-to-body="false"
      @open="onOpen" @close="onClose">
      <el-form ref="treeNodeForm" :model="formData" :rules="rules" label-width="100px">
        <el-col :span="24">
          <el-form-item :label="t('tool.build.options.optionName')" prop="label">
            <el-input v-model="formData.label" :placeholder="t('tool.build.options.optionNamePlaceholder')" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="t('tool.build.options.optionValue')" prop="value">
            <el-input v-model="formData.value" :placeholder="t('tool.build.options.optionValuePlaceholder')" clearable>
              <template #append>
                <el-select v-model="dataType" :style="{ width: '100px' }">
                  <el-option v-for="(item, index) in dataTypeOptions" :key="index" :label="item.label" :value="item.value"
                    :disabled="item.disabled" />
                </el-select>
              </template>

            </el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handelConfirm">{{ t('tool.gen.action.confirm') }}</el-button>
          <el-button @click="onClose">{{ t('tool.gen.action.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const open = defineModel()
const emit = defineEmits(['confirm'])
const formData = ref({
  label: undefined,
  value: undefined
})
const rules = computed(() => ({
  label: [
    {
      required: true,
      message: t('tool.build.options.optionNamePlaceholder'),
      trigger: 'blur'
    }
  ],
  value: [
    {
      required: true,
      message: t('tool.build.options.optionValuePlaceholder'),
      trigger: 'blur'
    }
  ]
}))
const dataType = ref('string')
const dataTypeOptions = computed(() => [
  {
    label: t('tool.build.options.dataTypeString'),
    value: 'string'
  },
  {
    label: t('tool.build.options.dataTypeNumber'),
    value: 'number'
  }
])
const id = ref(100)
const treeNodeForm = ref()

function onOpen() {
  formData.value = {
    label: undefined,
    value: undefined
  }
}

function onClose() {
  open.value = false
}

function handelConfirm() {
  treeNodeForm.value.validate(valid => {
    if (!valid) return
    if (dataType.value === 'number') {
      formData.value.value = parseFloat(formData.value.value)
    }
    formData.value.id = id.value++
    emit('commit', formData.value)
    onClose()
  })
}
</script>
