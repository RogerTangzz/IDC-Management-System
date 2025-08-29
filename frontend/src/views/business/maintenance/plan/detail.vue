<!-- src/views/maintenance/plan/detail.vue -->
<template>
  <div class="maintenance-plan-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="header-wrapper">
          <span>维保计划详情</span>
          <div class="actions">
            <el-button 
              v-if="plan.approvalStatus === 'draft'"
              type="primary" 
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button @click="handleBack">返回</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划标题" :span="2">
          {{ plan.title }}
        </el-descriptions-item>
        <el-descriptions-item label="楼层">
          {{ plan.floor }}
        </el-descriptions-item>
        <el-descriptions-item label="版本">
          {{ plan.version }}
        </el-descriptions-item>
        <el-descriptions-item label="MOP类别">
          <el-tag :type="getMOPCategoryType(plan.mopCategory)">
            {{ getMOPCategoryLabel(plan.mopCategory) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行周期">
          {{ plan.executionCycle?.frequency }}{{ plan.executionCycle?.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <StatusTag module="maintenance" :status="plan.approvalStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getExecutionStatusType(plan.executionStatus)">
            {{ getExecutionStatusLabel(plan.executionStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核人">
          {{ plan.approverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行审核人">
          {{ plan.executorName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="MOP名称" :span="2">
          {{ plan.mopName }}
        </el-descriptions-item>
        <el-descriptions-item label="MOP目的" :span="2">
          {{ plan.mopPurpose }}
        </el-descriptions-item>
        <el-descriptions-item label="工具仪表" :span="2">
          {{ plan.tools || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="材料" :span="2">
          {{ plan.materials || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="安全PPE" :span="2">
          {{ plan.safety || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="特殊工具" :span="2">
          {{ plan.specialTools || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="步骤内容" :span="2">
          <div v-html="plan.steps" class="steps-content"></div>
        </el-descriptions-item>
        <el-descriptions-item label="巡检结果" :span="2">
          {{ plan.inspectionResult || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ plan.remark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(plan.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="下次执行时间">
          {{ plan.nextExecutionTime ? parseTime(plan.nextExecutionTime) : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审批历史 -->
      <div class="approval-history" v-if="plan.approvalHistory?.length">
        <el-divider content-position="left">审批历史</el-divider>
        <el-timeline>
          <el-timeline-item 
            v-for="item in plan.approvalHistory" 
            :key="item.id"
            :timestamp="parseTime(item.time)"
            :type="getApprovalType(item.action)"
          >
            {{ item.operatorName }} {{ getApprovalAction(item.action) }}
            <span v-if="item.comment">：{{ item.comment }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { maintenancePlanApi } from '@/api/maintenance/plan'
import StatusTag from '@/components/Status/StatusTag.vue'
import { parseTime } from '@/utils'
import { getDictLabel } from '@/constants/dict'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const plan = ref({})

// 加载详情
const loadDetail = async () => {
  loading.value = true
  try {
    const res = await maintenancePlanApi.get(route.params.id)
    plan.value = res.data
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = () => {
  router.push(`/maintenance/plan/edit/${plan.value.id}`)
}

// 返回
const handleBack = () => {
  router.back()
}

// 工具函数
const getMOPCategoryLabel = (value) => getDictLabel('MOP_CATEGORY', value)
const getMOPCategoryType = (value) => {
  const map = { daily: 'success', regular: '', annual: 'warning', emergency: 'danger' }
  return map[value] || ''
}

const getExecutionStatusLabel = (value) => {
  const map = { pending: '待执行', executing: '执行中', completed: '已完成' }
  return map[value] || value
}
const getExecutionStatusType = (value) => {
  const map = { pending: 'warning', executing: '', completed: 'success' }
  return map[value] || ''
}

const getApprovalType = (action) => {
  const map = { submit: 'primary', approve: 'success', reject: 'danger' }
  return map[action] || ''
}

const getApprovalAction = (action) => {
  const map = { submit: '提交审核', approve: '审核通过', reject: '审核拒绝' }
  return map[action] || action
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped lang="scss">
.maintenance-plan-detail {
  padding: 20px;

  .header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .steps-content {
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .approval-history {
    margin-top: 20px;
  }
}
</style>