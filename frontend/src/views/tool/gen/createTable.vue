<template>
  <!-- 创建表 -->
  <el-dialog :title="t('tool.gen.dialog.create')" v-model="visible" width="800px" top="5vh" append-to-body>
    <span>{{ t('tool.gen.createSql.hint') }}</span>
    <el-input type="textarea" :rows="10" :placeholder="t('tool.gen.placeholder.inputSql')" v-model="content"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">{{ t('tool.gen.action.confirm') }}</el-button>
        <el-button @click="visible = false">{{ t('tool.gen.action.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { createTable } from "@/api/tool/gen"

const visible = ref(false)
const content = ref("")
const { proxy } = getCurrentInstance()
const { t } = useI18n()
const emit = defineEmits(["ok"])

/** 显示弹框 */
function show() {
  visible.value = true
}

/** 导入按钮操作 */
function handleImportTable() {
  if (content.value === "") {
    proxy.$modal.msgError(t('tool.gen.message.inputSql'))
    return
  }
  createTable({ sql: content.value }).then(res => {
    proxy.$modal.msgSuccess(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit("ok")
    }
  })
}

defineExpose({
  show,
})
</script>
