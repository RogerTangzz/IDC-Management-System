<template>
  <div class="u-slot-container">
    <!-- U位统计信息 -->
    <div class="u-slot-stats" v-if="stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-statistic title="总U位数" :value="stats.total_slots || 0" suffix="U" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="空闲" :value="stats.free_slots || 0" suffix="U" value-style="color: #67C23A;" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已占用" :value="stats.occupied_slots || 0" suffix="U" value-style="color: #F56C6C;" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="预留" :value="stats.reserved_slots || 0" suffix="U" value-style="color: #E6A23C;" />
        </el-col>
      </el-row>
    </div>

    <!-- U位可视化网格 -->
    <div class="u-slot-grid">
      <div
        v-for="slot in uSlots"
        :key="slot.slotId"
        class="u-slot-cell"
        :class="getSlotClass(slot)"
        @click="handleSlotClick(slot)"
        :title="getSlotTitle(slot)"
      >
        <div class="u-number">U{{ slot.uNumber }}</div>
        <div class="u-info" v-if="slot.status !== 'free'">
          <div class="device-name">{{ slot.deviceName || '-' }}</div>
          <div class="device-type">{{ slot.deviceType || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="u-slot-legend">
      <div class="legend-item">
        <span class="legend-color free"></span>
        <span>空闲</span>
      </div>
      <div class="legend-item">
        <span class="legend-color occupied"></span>
        <span>已占用</span>
      </div>
      <div class="legend-item">
        <span class="legend-color reserved"></span>
        <span>预留</span>
      </div>
      <div class="legend-item">
        <span class="legend-color disabled"></span>
        <span>禁用</span>
      </div>
      <div class="legend-item">
        <span class="legend-color selected"></span>
        <span>已选择</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  uSlots: {
    type: Array,
    default: () => []
  },
  stats: {
    type: Object,
    default: null
  },
  selectable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['slot-click', 'selection-change'])

const selectedSlots = ref(new Set())

const getSlotClass = (slot) => {
  const classes = ['status-' + slot.status]
  if (selectedSlots.value.has(slot.uNumber)) {
    classes.push('selected')
  }
  return classes.join(' ')
}

const getSlotTitle = (slot) => {
  let title = `U${slot.uNumber} - ${getStatusText(slot.status)}`
  if (slot.deviceName) {
    title += `\n设备: ${slot.deviceName}`
  }
  if (slot.deviceType) {
    title += `\n类型: ${slot.deviceType}`
  }
  if (slot.allocatedBy) {
    title += `\n分配人: ${slot.allocatedBy}`
  }
  return title
}

const getStatusText = (status) => {
  const statusMap = {
    'free': '空闲',
    'occupied': '已占用',
    'reserved': '预留',
    'disabled': '禁用'
  }
  return statusMap[status] || status
}

const handleSlotClick = (slot) => {
  emit('slot-click', slot)

  if (!props.selectable) return

  // 切换选择状态
  if (selectedSlots.value.has(slot.uNumber)) {
    selectedSlots.value.delete(slot.uNumber)
  } else {
    selectedSlots.value.add(slot.uNumber)
  }

  emit('selection-change', Array.from(selectedSlots.value))
}

// 清空选择
const clearSelection = () => {
  selectedSlots.value.clear()
  emit('selection-change', [])
}

// 获取选中的U位
const getSelectedSlots = () => {
  return props.uSlots.filter(slot => selectedSlots.value.has(slot.uNumber))
}

// 暴露方法给父组件
defineExpose({
  clearSelection,
  getSelectedSlots
})
</script>

<style scoped lang="scss">
.u-slot-container {
  width: 100%;
}

.u-slot-stats {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.u-slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.u-slot-cell {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 60px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .u-number {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 4px;
    text-align: center;
  }

  .u-info {
    font-size: 10px;
    color: #606266;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .device-name {
      font-weight: 500;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .device-type {
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// U位状态颜色
.u-slot-cell.status-free {
  background-color: #f0f9ff;
  border-color: #67C23A;

  .u-number {
    color: #67C23A;
  }
}

.u-slot-cell.status-occupied {
  background-color: #fef0f0;
  border-color: #F56C6C;

  .u-number {
    color: #F56C6C;
  }
}

.u-slot-cell.status-reserved {
  background-color: #fdf6ec;
  border-color: #E6A23C;

  .u-number {
    color: #E6A23C;
  }
}

.u-slot-cell.status-disabled {
  background-color: #f4f4f5;
  border-color: #909399;
  cursor: not-allowed;

  .u-number {
    color: #909399;
  }
}

.u-slot-cell.selected {
  border-color: #409EFF;
  border-width: 3px;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.u-slot-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #606266;

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      border: 2px solid;

      &.free {
        background-color: #f0f9ff;
        border-color: #67C23A;
      }

      &.occupied {
        background-color: #fef0f0;
        border-color: #F56C6C;
      }

      &.reserved {
        background-color: #fdf6ec;
        border-color: #E6A23C;
      }

      &.disabled {
        background-color: #f4f4f5;
        border-color: #909399;
      }

      &.selected {
        background-color: #fff;
        border-color: #409EFF;
        border-width: 3px;
      }
    }
  }
}
</style>
