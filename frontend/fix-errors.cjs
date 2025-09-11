const fs = require('fs')
const path = require('path')

// 1. 创建StatusTag组件
const statusTagContent = `<template>
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
</script>`

// 创建目录和文件
const statusDir = path.join(__dirname, 'src/components/Status')
if (!fs.existsSync(statusDir)) {
  fs.mkdirSync(statusDir, { recursive: true })
}
fs.writeFileSync(path.join(statusDir, 'StatusTag.vue'), statusTagContent)
console.log('✅ StatusTag组件已创建')

// 2. 修复maintenance/index.vue的重复声明
const maintenanceFile = path.join(__dirname, 'src/views/business/maintenance/index.vue')
if (fs.existsSync(maintenanceFile)) {
  let content = fs.readFileSync(maintenanceFile, 'utf-8')
  content = content.replace(
    'submitApproval,',
    'submitApproval as submitApprovalApi,'
  )
  content = content.replace(
    'submitApproval(approvalForm.value.planId',
    'submitApprovalApi(approvalForm.value.planId'
  )
  fs.writeFileSync(maintenanceFile, content)
  console.log('✅ maintenance/index.vue已修复')
}

console.log('修复完成！请重启开发服务器')