<template>
  <el-form :model="modelValue" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
    <el-form-item :label="$t('business.ticket.field.keyword')" prop="keyword">
      <el-input v-model="modelValue.keyword" :placeholder="$t('business.ticket.placeholder.inputKeyword')" clearable style="width: 240px" @keyup.enter="handleSearch">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item :label="$t('business.ticket.field.status')" prop="status">
      <el-select v-model="modelValue.status" :placeholder="$t('business.ticket.placeholder.selectStatus')" clearable style="width: 140px">
        <el-option v-for="item in dicts.ticket_status" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('business.ticket.field.specialty')" prop="specialty">
      <el-select v-model="modelValue.specialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')" clearable style="width: 140px">
        <el-option v-for="item in dicts.equipment_specialty" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('business.ticket.field.createTime')">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :range-separator="$t('business.ticket.dateRange.to')"
        :start-placeholder="$t('business.ticket.placeholder.startDate')"
        :end-placeholder="$t('business.ticket.placeholder.endDate')"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="Search" @click="handleSearch">{{ $t('action.search') }}</el-button>
      <el-button icon="Refresh" @click="handleReset">{{ $t('action.reset') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup name="TicketSearch">
import { computed, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const queryRef = ref(null)

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  dateRange: {
    type: Array,
    default: () => []
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  dicts: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'update:dateRange', 'update:showSearch', 'search', 'reset'])

const dateRange = computed({
  get: () => props.dateRange,
  set: (val) => emit('update:dateRange', val)
})

function handleSearch() {
  emit('search')
}

function handleReset() {
  // 重置表单
  if (queryRef.value) {
    queryRef.value.resetFields()
  }
  emit('reset')
}

// 暴露 ref 供父组件使用
defineExpose({
  queryRef
})
</script>
