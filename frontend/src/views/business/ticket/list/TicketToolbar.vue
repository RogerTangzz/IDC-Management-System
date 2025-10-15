<template>
  <el-row :gutter="10" class="mb8">
    <el-col :span="1.5">
      <el-button type="primary" plain icon="Plus" @click="emit('add')" v-hasPermi="['business:ticket:add']">
        {{ $t('business.ticket.action.add') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="success" plain icon="Edit" :disabled="single" @click="emit('update')" v-hasPermi="['business:ticket:edit']">
        {{ $t('action.edit') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="emit('delete')" v-hasPermi="['business:ticket:remove']">
        {{ $t('action.delete') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="info" plain icon="UserFilled" :disabled="multiple" @click="emit('batchAssign')" v-hasPermi="['business:ticket:assign']">
        {{ $t('business.ticket.action.batchAssign') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="warning" plain icon="Download" @click="emit('export')" v-hasPermi="['business:ticket:export']">
        {{ $t('action.export') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="danger" plain icon="Warning" @click="emit('overdue')">
        {{ $t('business.ticket.action.viewOverdue') }}
      </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="warning" plain icon="Clock" @click="emit('neardue')">
        {{ $t('business.ticket.action.viewNearDue') }}
      </el-button>
    </el-col>
    <right-toolbar v-model:showSearch="showSearchValue" @queryTable="emit('refresh')"></right-toolbar>
  </el-row>
</template>

<script setup name="TicketToolbar">
import { computed } from 'vue'

const props = defineProps({
  single: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:showSearch',
  'add',
  'update',
  'delete',
  'batchAssign',
  'export',
  'overdue',
  'neardue',
  'refresh'
])

const showSearchValue = computed({
  get: () => props.showSearch,
  set: (val) => emit('update:showSearch', val)
})
</script>
