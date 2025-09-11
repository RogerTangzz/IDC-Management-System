<template>
  <el-tag 
    :type="getType(status)" 
    :effect="effect"
    size="small"
  >
    {{ getLabel(status) }}
  </el-tag>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true
  },
  effect: {
    type: String,
    default: 'light'
  }
})

const statusMap = {
  pending: { label: '待处理', type: 'warning' },
  processing: { label: '处理中', type: '' },
  completed: { label: '已完成', type: 'success' },
  closed: { label: '已关闭', type: 'info' },
  draft: { label: '草稿', type: 'info' },
  approved: { label: '已批准', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
  executing: { label: '执行中', type: 'primary' },
  cancelled: { label: '已取消', type: 'info' }
}

const getType = (status) => {
  return statusMap[status]?.type || 'info'
}

const getLabel = (status) => {
  return statusMap[status]?.label || status
}
</script>