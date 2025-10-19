<template>
  <div class="print-content">
    <div class="print-header">
      <h1>{{ $t('business.maintenance.print.maintenancePlan') }}</h1>
    </div>

    <div class="print-section">
      <h2>{{ $t('business.maintenance.message.planInfo') }}</h2>
      <table class="info-table">
        <tr>
          <th>{{ $t('business.maintenance.field.planNo') }}</th>
          <td>{{ plan?.planNo }}</td>
          <th>{{ $t('business.maintenance.field.title') }}</th>
          <td>{{ plan?.title }}</td>
        </tr>
        <tr>
          <th>{{ $t('business.maintenance.field.floor') }}</th>
          <td>{{ plan?.floor }}</td>
          <th>{{ $t('business.maintenance.field.responsibleName') }}</th>
          <td>{{ plan?.responsibleName }}</td>
        </tr>
        <tr>
          <th>{{ $t('business.maintenance.field.approvalStatus') }}</th>
          <td>{{ formatApprovalStatus(plan?.approvalStatus) }}</td>
          <th>{{ $t('business.maintenance.field.executionStatus') }}</th>
          <td>{{ formatExecutionStatus(plan?.executionStatus) }}</td>
        </tr>
        <tr>
          <th>{{ $t('business.maintenance.field.plannedStartDate') }}</th>
          <td>{{ parseTime(plan?.plannedStartDate) }}</td>
          <th>{{ $t('business.maintenance.field.plannedEndDate') }}</th>
          <td>{{ parseTime(plan?.plannedEndDate) }}</td>
        </tr>
        <tr>
          <th>{{ $t('business.maintenance.field.itemCount') }}</th>
          <td>{{ plan?.itemCount || 0 }}</td>
          <th>{{ $t('business.maintenance.field.mopCategory') }}</th>
          <td>{{ plan?.mopCategory || '-' }}</td>
        </tr>
      </table>
    </div>

    <div v-if="includeLogs && Array.isArray(approvalHistory) && approvalHistory.length" class="print-section">
      <h2>{{ $t('business.maintenance.message.approvalHistory') }}</h2>
      <table class="history-table">
        <thead>
          <tr>
            <th>{{ $t('business.maintenance.print.time') }}</th>
            <th>{{ $t('business.maintenance.print.action') }}</th>
            <th>{{ $t('business.maintenance.print.operator') }}</th>
            <th>{{ $t('business.maintenance.field.comment') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in approvalHistory" :key="i">
            <td>{{ parseTime(item.time) }}</td>
            <td>{{ formatApproveAction(item.action) }}</td>
            <td>{{ item.operatorName }}</td>
            <td>{{ item.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="includeLogs && Array.isArray(executionList) && executionList.length" class="print-section">
      <h2>{{ $t('business.maintenance.message.executionRecord') }}</h2>
      <table class="history-table">
        <thead>
          <tr>
            <th>{{ $t('business.maintenance.print.time') }}</th>
            <th>{{ $t('business.maintenance.print.action') }}</th>
            <th>{{ $t('business.maintenance.print.operator') }}</th>
            <th>{{ $t('business.maintenance.field.result') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in executionList" :key="i">
            <td>{{ parseTime(item.time) }}</td>
            <td>{{ formatExecAction(item.action) }}</td>
            <td>{{ item.operatorName }}</td>
            <td>{{ item.result || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="print-footer">
      <p>{{ $t('business.maintenance.print.printTime') }}: {{ parseTime(new Date()) }}</p>
    </div>
  </div>
</template>

<script setup name="PlanPrint">
import { parseTime } from '@/utils/ruoyi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  plan: {
    type: Object,
    default: () => null
  },
  approvalHistory: {
    type: Array,
    default: () => []
  },
  executionList: {
    type: Array,
    default: () => []
  },
  includeLogs: {
    type: Boolean,
    default: true
  }
})

function formatApprovalStatus(status) {
  const map = {
    'pending': t('business.maintenance.status.pending'),
    'approved': t('business.maintenance.status.approved'),
    'rejected': t('business.maintenance.status.rejected')
  }
  return map[status] || status || '-'
}

function formatExecutionStatus(status) {
  const map = {
    'pending': t('business.maintenance.status.pending'),
    'executing': t('business.maintenance.status.executing'),
    'completed': t('business.maintenance.status.completed')
  }
  return map[status] || status || '-'
}

function formatApproveAction(a) {
  if (a === 'submit') return t('business.maintenance.approveAction.submit')
  if (a === 'approve') return t('business.maintenance.approveAction.approve')
  if (a === 'reject') return t('business.maintenance.approveAction.reject')
  return a
}

function formatExecAction(a) {
  if (a === 'start') return t('business.maintenance.execAction.start')
  if (a === 'complete') return t('business.maintenance.execAction.complete')
  return a
}
</script>

<style scoped>
.print-content {
  padding: 20px;
  font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
  color: #000;
  background: #fff;
}

.print-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.print-header h1 {
  font-size: 24px;
  margin: 0;
  font-weight: bold;
}

.print-section {
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.print-section h2 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid #666;
  padding-bottom: 5px;
}

.info-table, .history-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.info-table th, .info-table td,
.history-table th, .history-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: left;
}

.info-table th, .history-table th {
  background-color: #f0f0f0;
  font-weight: bold;
  width: 25%;
}

.history-table th {
  width: auto;
}

.print-footer {
  margin-top: 30px;
  text-align: right;
  font-size: 12px;
  color: #666;
}

/* 打印样式 */
@media print {
  .print-content {
    padding: 0;
  }

  .print-section {
    page-break-inside: avoid;
  }
}
</style>
