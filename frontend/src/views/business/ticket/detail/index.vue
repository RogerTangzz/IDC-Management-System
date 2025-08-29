<template>
  <div class="ticket-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>工单详情</span>
          <el-button type="primary" text @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回列表
          </el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="工单编号">
          <el-tag>{{ ticketData.ticketNo }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(ticketData.status)">
            {{ getStatusLabel(ticketData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">
          {{ ticketData.title }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(ticketData.priority)">
            {{ getPriorityLabel(ticketData.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理时限">
          <span v-if="ticketData.deadline">
            {{ parseTime(ticketData.deadline) }}
            <el-tag v-if="isOverdue" type="danger" size="small" style="margin-left: 10px">已超时</el-tag>
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="报修人">
          {{ ticketData.reporterName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ ticketData.reporterPhone }}
        </el-descriptions-item>
        <el-descriptions-item label="故障设备">
          {{ ticketData.equipmentName }}
        </el-descriptions-item>
        <el-descriptions-item label="设备专业">
          {{ ticketData.equipmentSpecialty }}
        </el-descriptions-item>
        <el-descriptions-item label="设备位置" :span="2">
          {{ ticketData.location }}
        </el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">
          <div v-html="ticketData.description"></div>
        </el-descriptions-item>
        <el-descriptions-item label="应急处置" :span="2">
          {{ ticketData.emergencyMeasure }}
        </el-descriptions-item>
        <el-descriptions-item label="处理方案" :span="2">
          {{ ticketData.solution }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(ticketData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(ticketData.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 附件列表 -->
      <div class="attachment-section" v-if="ticketData.attachments && ticketData.attachments.length">
        <h4>附件文件</h4>
        <div class="attachment-list">
          <div v-for="file in ticketData.attachments" :key="file.id" class="attachment-item">
            <el-icon><Document /></el-icon>
            <span>{{ file.name }}</span>
            <el-button type="primary" text @click="downloadFile(file)">下载</el-button>
          </div>
        </div>
      </div>

      <!-- 操作历史 -->
      <div class="history-section" v-if="ticketData.history && ticketData.history.length">
        <h4>操作历史</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in ticketData.history"
            :key="index"
            :timestamp="parseTime(item.time)"
            placement="top"
            :type="item.type"
          >
            {{ item.action }} - {{ item.operator }}
            <div v-if="item.comment" class="history-comment">备注：{{ item.comment }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="!isReadonly">
        <el-button type="primary" @click="handleEdit">编辑工单</el-button>
        <el-button type="success" @click="handleProcess" v-if="canProcess">开始处理</el-button>
        <el-button type="warning" @click="handleComplete" v-if="canComplete">完成工单</el-button>
        <el-button type="danger" @click="handleClose" v-if="canClose">关闭工单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Document } from '@element-plus/icons-vue'
import { parseTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const ticketData = ref({})

// 计算属性
const isOverdue = computed(() => {
  if (!ticketData.value.deadline) return false
  return new Date(ticketData.value.deadline) < new Date()
})

const isReadonly = computed(() => {
  return ticketData.value.status === 'closed'
})

const canProcess = computed(() => {
  return ticketData.value.status === 'assigned'
})

const canComplete = computed(() => {
  return ticketData.value.status === 'processing'
})

const canClose = computed(() => {
  return ticketData.value.status === 'completed'
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    assigned: 'info',
    processing: '',
    completed: 'success',
    closed: 'info'
  }
  return types[status] || ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    assigned: '已指派',
    processing: '处理中',
    completed: '已完成',
    closed: '已关闭'
  }
  return labels[status] || status
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || ''
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

// 加载工单详情
const loadTicketDetail = async () => {
  loading.value = true
  try {
    // 模拟数据，实际应调用API
    ticketData.value = {
      id: route.params.id,
      ticketNo: 'TK202501001',
      title: '2楼UPS电源告警',
      status: 'processing',
      priority: 'high',
      deadline: '2025-01-17 18:00:00',
      reporterName: '张三',
      reporterPhone: '13800138000',
      equipmentName: 'UPS-2F-001',
      equipmentSpecialty: '配电',
      location: '2楼配电室',
      description: 'UPS电源出现异常告警，电池电压偏低',
      emergencyMeasure: '已切换到旁路供电，暂不影响正常使用',
      solution: '正在安排工程师现场检查',
      createTime: '2025-01-16 14:05:00',
      updateTime: '2025-01-16 15:30:00',
      attachments: [
        { id: 1, name: '故障现场照片.jpg' },
        { id: 2, name: 'UPS告警日志.txt' }
      ],
      history: [
        { time: '2025-01-16 14:05:00', action: '创建工单', operator: '张三', type: 'primary' },
        { time: '2025-01-16 14:10:00', action: '指派给李四', operator: '系统管理员', type: 'warning' },
        { time: '2025-01-16 14:30:00', action: '开始处理', operator: '李四', type: 'success', comment: '已到达现场' }
      ]
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/ticket')
}

// 编辑工单
const handleEdit = () => {
  router.push(`/ticket/edit/${route.params.id}`)
}

// 开始处理
const handleProcess = async () => {
  await ElMessageBox.confirm('确认开始处理此工单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  })
  
  // 调用API更新状态
  ElMessage.success('已开始处理')
  ticketData.value.status = 'processing'
}

// 完成工单
const handleComplete = async () => {
  await ElMessageBox.confirm('确认完成此工单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('工单已完成')
  ticketData.value.status = 'completed'
}

// 关闭工单
const handleClose = async () => {
  await ElMessageBox.confirm('确认关闭此工单？关闭后将无法修改', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  ElMessage.success('工单已关闭')
  ticketData.value.status = 'closed'
}

// 下载文件
const downloadFile = (file) => {
  ElMessage.info(`下载文件: ${file.name}`)
}

// 初始化
onMounted(() => {
  loadTicketDetail()
})
</script>

<style lang="scss" scoped>
.ticket-detail {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .attachment-section,
  .history-section {
    margin-top: 30px;
    
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .attachment-list {
    .attachment-item {
      display: flex;
      align-items: center;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 10px;
      
      .el-icon {
        margin-right: 10px;
        font-size: 20px;
      }
      
      span {
        flex: 1;
      }
    }
  }
  
  .history-comment {
    margin-top: 5px;
    color: #909399;
    font-size: 14px;
  }
  
  .action-buttons {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    text-align: center;
    
    .el-button {
      margin: 0 10px;
    }
  }
}
</style>