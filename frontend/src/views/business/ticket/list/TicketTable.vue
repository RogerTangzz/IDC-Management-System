<template>
  <el-table
    v-loading="loading"
    :data="rows"
    @selection-change="emit('selectionChange', $event)"
    @sort-change="emit('sortChange', $event)"
  >
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column :label="$t('business.ticket.field.ticketNo')" align="center" prop="ticketNo" width="120" />
    <el-table-column :label="$t('business.ticket.field.title')" align="center" prop="title" :show-overflow-tooltip="true" />
    <el-table-column :label="$t('business.ticket.field.status')" align="center" prop="status" width="100">
      <template #default="scope">
        <dict-tag :options="dicts.ticket_status" :value="scope.row.status" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.latestAction')" align="center" prop="lastAction" width="100">
      <template #default="scope">
        <dict-tag :options="dicts.ticket_action" :value="scope.row.lastAction" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.latestStatusTime')" align="center" prop="lastStatusTime" width="160" sortable="custom">
      <template #default="scope">
        <span>{{ parseTime(scope.row.lastStatusTime) }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.priority')" align="center" prop="priority" width="80">
      <template #default="scope">
        <el-tag :type="getPriorityType(scope.row.priority)">
          {{ getPriorityLabel(scope.row.priority) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.reporterName')" align="center" prop="reporterName" width="100" />
    <el-table-column :label="$t('business.ticket.field.equipment')" align="center" prop="equipment" width="120" />
    <el-table-column :label="$t('business.ticket.field.specialty')" align="center" prop="specialty" width="100">
      <template #default="scope">
        <dict-tag :options="dicts.equipment_specialty" :value="scope.row.specialty" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.assignee')" align="center" prop="assigneeName" width="100" />
    <el-table-column :label="$t('business.ticket.field.timeLimit')" align="center" prop="deadline" width="160">
      <template #default="scope">
        <span>{{ parseTime(scope.row.deadline) }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('business.ticket.field.createTime')" align="center" prop="createTime" width="160" sortable="custom">
      <template #default="scope">
        <span>{{ parseTime(scope.row.createTime) }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="$t('action.operate')" align="center" class-name="small-padding fixed-width" width="240">
      <template #default="scope">
        <el-button link type="primary" icon="View" @click="emit('view', scope.row)"
          v-hasPermi="['business:ticket:query']">{{ $t('action.view') }}</el-button>
        <el-button link type="primary" icon="Edit" @click="emit('edit', scope.row)"
          v-hasPermi="['business:ticket:edit']">{{ $t('action.edit') }}</el-button>
        <el-button link type="primary" icon="Delete" @click="emit('delete', scope.row)"
          v-hasPermi="['business:ticket:remove']">{{ $t('action.delete') }}</el-button>
        <el-button link type="primary" icon="RefreshLeft" v-if="scope.row.status==='closed'" @click="emit('reopen', scope.row)"
          v-hasPermi="['business:ticket:reopen']">{{ $t('business.ticket.action.reopen') }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup name="TicketTable">
import { parseTime } from '@/utils/ruoyi'

defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  dicts: {
    type: Object,
    default: () => ({})
  },
  getPriorityLabel: {
    type: Function,
    required: true
  },
  getPriorityType: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['selectionChange', 'sortChange', 'view', 'edit', 'delete', 'reopen'])
</script>
