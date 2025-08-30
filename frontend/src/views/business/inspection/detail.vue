<template>
  <div class="app-container">
    <!-- 头部信息卡片 -->
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-left">
          <el-button link type="primary" icon="Back" @click="handleClose">返回列表</el-button>
        </div>
        <div class="header-center">
          <h2>巡检详情 - {{ form.inspectionNo }}</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="Printer" @click="handlePrint">打印</el-button>
          <el-button type="success" icon="Download" @click="handleExport">导出报告</el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="info-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="descriptions-title">基本信息</span>
          <div>
            <el-tag v-if="form.isCopied === 'Y'" type="info">复制</el-tag>
            <el-tag v-if="form.anomalyCount > 0" type="danger">
              异常：{{ form.anomalyCount }}项
            </el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="巡检编号">
          <span class="text-primary">{{ form.inspectionNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="巡检楼层">
          <dict-tag :options="floor_dict" :value="form.floor"/>
        </el-descriptions-item>
        <el-descriptions-item label="巡检日期">
          {{ parseTime(form.inspectionDate, '{y}-{m}-{d}') }}
        </el-descriptions-item>
        <el-descriptions-item label="巡检人员">
          {{ form.inspectorName }}
        </el-descriptions-item>
        <el-descriptions-item label="接力人员">
          {{ form.relayPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="完成进度">
          <el-progress 
            :percentage="form.progress" 
            :status="form.progress === 100 ? 'success' : ''"
          />
        </el-descriptions-item>
        <el-descriptions-item label="检查项目">
          {{ completedItems }}/{{ totalItems }}项
        </el-descriptions-item>
        <el-descriptions-item label="生成工单">
          <el-link 
            v-if="form.ticketCount > 0"
            type="primary" 
            @click="viewTickets"
          >
            {{ form.ticketCount }}个
          </el-link>
          <span v-else>0个</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(form.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">
          {{ form.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 巡检项目结果 -->
    <el-card class="items-card">
      <template #header>
        <div class="card-header">
          <span class="descriptions-title">巡检项目结果</span>
          <el-radio-group v-model="filterType" @change="handleFilterChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="anomaly">异常</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="6">
          <el-statistic title="总检查项" :value="statistics.total">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="正常项" :value="statistics.normal" value-style="color: #67c23a">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="异常项" :value="statistics.anomaly" value-style="color: #f56c6c">
            <template #suffix>项</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="异常率" :value="statistics.anomalyRate" :precision="1">
            <template #suffix>%</template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 项目列表 -->
      <el-table 
        :data="filteredItems" 
        stripe
        :row-class-name="getRowClassName"
        class="items-table"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="检查项目" prop="label" min-width="300" show-overflow-tooltip />
        <el-table-column label="类型" prop="type" width="80" align="center">
          <template #default="scope">
            <el-tag size="small" type="info">
              {{ scope.row.type === 'boolean' ? '状态' : '数值' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检查结果" prop="value" width="150" align="center">
          <template #default="scope">
            <div v-if="scope.row.type === 'boolean'">
              <el-tag v-if="scope.row.value === true" type="success">正常</el-tag>
              <el-tag v-else-if="scope.row.value === false" type="danger">异常</el-tag>
              <el-tag v-else type="info">未检查</el-tag>
            </div>
            <div v-else>
              <span v-if="scope.row.value !== null && scope.row.value !== undefined">
                {{ scope.row.value }} {{ scope.row.unit }}
              </span>
              <el-tag v-else type="info" size="small">未填写</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="正常范围" prop="range" width="150" align="center">
          <template #default="scope">
            <span v-if="scope.row.type === 'boolean'">正常</span>
            <span v-else-if="scope.row.min !== undefined">
              {{ scope.row.min }}-{{ scope.row.max }} {{ scope.row.unit }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isAnomaly" type="danger" effect="dark">异常</el-tag>
            <el-tag v-else-if="scope.row.value !== null && scope.row.value !== undefined" type="success">正常</el-tag>
            <el-tag v-else type="info">未检查</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生成工单" width="120" align="center">
          <template #default="scope">
            <el-link 
              v-if="scope.row.ticketNo" 
              type="primary"
              @click="viewTicketDetail(scope.row.ticketId)"
            >
              {{ scope.row.ticketNo }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 异常项汇总 -->
    <el-card class="anomaly-card" v-if="anomalyItems.length > 0">
      <template #header>
        <span class="descriptions-title">异常项汇总</span>
      </template>
      <el-alert
        title="发现以下异常项，请及时处理"
        type="warning"
        :closable="false"
        show-icon
      />
      <div class="anomaly-list">
        <div v-for="(item, index) in anomalyItems" :key="index" class="anomaly-item">
          <div class="anomaly-header">
            <span class="anomaly-index">{{ index + 1 }}</span>
            <span class="anomaly-title">{{ item.label }}</span>
            <dict-tag :options="ticket_priority" :value="item.priority"/>
          </div>
          <div class="anomaly-content">
            <el-row>
              <el-col :span="8">
                <span class="label">异常值：</span>
                <span class="value danger">{{ formatValue(item) }}</span>
              </el-col>
              <el-col :span="8">
                <span class="label">正常范围：</span>
                <span class="value">{{ formatRange(item) }}</span>
              </el-col>
              <el-col :span="8">
                <span class="label">工单状态：</span>
                <span class="value">
                  <el-link 
                    v-if="item.ticketNo" 
                    type="primary"
                    @click="viewTicketDetail(item.ticketId)"
                  >
                    {{ item.ticketNo }}
                  </el-link>
                  <el-button
                    v-else
                    link
                    type="primary"
                    size="small"
                    @click="generateTicket(item)"
                  >
                    生成工单
                  </el-button>
                </span>
              </el-col>
            </el-row>
            <div class="suggestion">
              <span class="label">处理建议：</span>
              {{ getHandlingSuggestion(item) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="InspectionDetail">
import { getCurrentInstance, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getInspection, generateTickets } from "@/api/business/inspection"
import { addTicket } from "@/api/business/ticket"
import { FLOORS, INSPECTION_ITEMS } from "./constants"

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const inspectionId = route.params && route.params.id
const loading = ref(false)
const filterType = ref('all')
const form = ref({})
const inspectionItems = ref([])

// 字典数据
const { ticket_status, ticket_priority, equipment_specialty } = proxy.useDict('ticket_status', 'ticket_priority', 'equipment_specialty')

// 楼层字典
const floor_dict = FLOORS.map(f => ({ label: f.label, value: f.value }))

// 统计数据
const totalItems = computed(() => {
  const floorItems = INSPECTION_ITEMS[form.value.floor]
  return floorItems ? floorItems.length : 0
})

const completedItems = computed(() => {
  return inspectionItems.value.filter(item => item.value !== null && item.value !== undefined).length
})

const statistics = computed(() => {
  const total = inspectionItems.value.length
  const normal = inspectionItems.value.filter(item => !item.isAnomaly && item.value !== null).length
  const anomaly = inspectionItems.value.filter(item => item.isAnomaly).length
  const anomalyRate = total > 0 ? (anomaly / total) * 100 : 0
  
  return { total, normal, anomaly, anomalyRate }
})

// 过滤后的项目
const filteredItems = computed(() => {
  if (filterType.value === 'normal') {
    return inspectionItems.value.filter(item => !item.isAnomaly && item.value !== null)
  }
  if (filterType.value === 'anomaly') {
    return inspectionItems.value.filter(item => item.isAnomaly)
  }
  return inspectionItems.value
})

// 异常项
const anomalyItems = computed(() => {
  return inspectionItems.value.filter(item => item.isAnomaly)
})

/** 获取巡检详情 */
function getDetail() {
  loading.value = true
  // Mock数据
  setTimeout(() => {
    form.value = {
      inspectionId: inspectionId,
      inspectionNo: 'INS202501001',
      floor: 'floor1',
      inspectionDate: new Date(),
      inspectorName: '张三',
      relayPerson: '李四',
      progress: 100,
      anomalyCount: 2,
      ticketCount: 1,
      createTime: new Date(),
      remark: '例行巡检'
    }
    
    // Mock巡检项目数据
    inspectionItems.value = [
      { id: 'oil_tank', label: '地埋油罐及蓄冷罐是否正常', type: 'boolean', value: true, isAnomaly: false },
      { id: 'electric_room', label: '南侧电气间环境设施是否正常', type: 'boolean', value: false, isAnomaly: true, priority: 'medium' },
      { id: 'pump_pressure', label: '冷冻泵回水压力', type: 'number', value: 0.5, unit: 'MPa', min: 0.3, max: 0.6, isAnomaly: false }
    ]
    
    loading.value = false
  }, 500)
}

/** 格式化值 */
function formatValue(item) {
  if (item.type === 'boolean') {
    return item.value ? '正常' : '异常'
  }
  return `${item.value} ${item.unit || ''}`
}

/** 格式化范围 */
function formatRange(item) {
  if (item.type === 'boolean') {
    return '正常'
  }
  if (item.min !== undefined) {
    return `${item.min}-${item.max} ${item.unit || ''}`
  }
  return '-'
}

/** 获取处理建议 */
function getHandlingSuggestion(item) {
  return '请尽快前往现场检查并处理'
}

/** 获取行样式 */
function getRowClassName({ row }) {
  if (row.isAnomaly) {
    return 'anomaly-row'
  }
  if (row.value === null || row.value === undefined) {
    return 'unchecked-row'
  }
  return ''
}

/** 筛选变化 */
function handleFilterChange() {
  // 筛选逻辑已通过computed属性处理
}

/** 生成单个工单 */
function generateTicket(item) {
  proxy.$modal.msgSuccess("工单生成成功")
}

/** 查看工单列表 */
function viewTickets() {
  router.push('/business/ticket')
}

/** 查看工单详情 */
function viewTicketDetail(id) {
  router.push('/business/ticket/detail/' + id)
}

/** 打印 */
function handlePrint() {
  window.print()
}

/** 导出报告 */
function handleExport() {
  proxy.$modal.msgSuccess("导出功能待实现")
}

/** 返回 */
function handleClose() {
  router.back()
}

getDetail()
</script>

<style lang="scss" scoped>
.header-card {
  margin-bottom: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-center h2 {
      margin: 0;
      font-size: 18px;
    }
  }
}

.info-card,
.items-card,
.anomaly-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.descriptions-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.text-primary {
  color: #409EFF;
  font-weight: bold;
}

.statistics-row {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.items-table {
  :deep(.anomaly-row) {
    background-color: #fef0f0;
  }
  
  :deep(.unchecked-row) {
    background-color: #f5f5f5;
  }
}

.anomaly-list {
  margin-top: 20px;
  
  .anomaly-item {
    padding: 15px;
    margin-bottom: 15px;
    background: #fff7e6;
    border: 1px solid #ffd666;
    border-radius: 4px;
    
    .anomaly-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      .anomaly-index {
        width: 30px;
        height: 30px;
        background: #ff4d4f;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 10px;
      }
      
      .anomaly-title {
        flex: 1;
        font-weight: bold;
        font-size: 14px;
      }
    }
    
    .anomaly-content {
      margin-left: 40px;
      
      .label {
        color: #909399;
        margin-right: 5px;
      }
      
      .value {
        font-weight: 500;
        
        &.danger {
          color: #f56c6c;
        }
      }
      
      .suggestion {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #dcdfe6;
        color: #606266;
      }
    }
  }
}

@media print {
  .header-card .header-right {
    display: none;
  }
  
  .el-radio-group {
    display: none;
  }
}
</style>