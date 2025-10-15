<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item :label="t('tool.gen.field.tableName')" prop="tableName">
          <el-input :placeholder="t('tool.gen.placeholder.tableName')" v-model="info.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="t('tool.gen.field.tableComment')" prop="tableComment">
          <el-input :placeholder="t('tool.gen.placeholder.tableComment')" v-model="info.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="t('tool.gen.field.className')" prop="className">
          <el-input :placeholder="t('tool.gen.placeholder.className')" v-model="info.className" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="t('tool.gen.field.functionAuthor')" prop="functionAuthor">
          <el-input :placeholder="t('tool.gen.placeholder.functionAuthor')" v-model="info.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="t('tool.gen.field.remark')" prop="remark">
          <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
const { t } = useI18n()

defineProps({
  info: {
    type: Object,
    default: null
  }
})

// 表单校验
const rules = ref({
  tableName: [{ required: true, message: t('tool.gen.validation.tableName'), trigger: "blur" }],
  tableComment: [{ required: true, message: t('tool.gen.validation.tableComment'), trigger: "blur" }],
  className: [{ required: true, message: t('tool.gen.validation.className'), trigger: "blur" }],
  functionAuthor: [{ required: true, message: t('tool.gen.validation.functionAuthor'), trigger: "blur" }]
})
</script>
