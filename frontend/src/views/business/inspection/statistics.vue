<template>
  <div class="inspection-statistics">
    <!-- 时间范围选择 -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item :label="$t('business.inspection.statistics.statisticTime')">
          <el-date-picker v-model="dateRange" type="daterange" :range-separator="$t('business.inspection.statistics.rangeSeparator')" :start-placeholder="$t('business.inspection.statistics.startDate')"
            :end-placeholder="$t('business.inspection.statistics.endDate')" @change="handleDateChange" />
        </el-form-item>
        <el-form-item :label="$t('business.inspection.statistics.floor')">
          <el-select v-model="selectedFloor" :placeholder="$t('business.inspection.statistics.allFloors')" clearable @change="handleFloorChange">
            <el-option :label="$t('business.inspection.statistics.allFloors')" value="" />
            <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Refresh" @click="refreshData">{{ $t('business.inspection.statistics.refreshData') }}</el-button>
          <el-button icon="Download" @click="exportReport">{{ $t('business.inspection.statistics.exportReport') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关键指标 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <el-statistic :title="$t('business.inspection.statistics.totalInspections')" :value="statistics.total">
            <template #suffix>{{ $t('business.inspection.statistics.times') }}</template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>{{ $t('business.inspection.statistics.comparedToPrevious') }}</span>
              <span class="green">
                <el-icon>
                  <CaretTop />
                </el-icon>
                12%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <el-statistic :title="$t('business.inspection.statistics.completionRate')" :value="statistics.completionRate" :precision="1">
            <template #suffix>%</template>
          </el-statistic>
          <el-progress :percentage="statistics.completionRate" :show-text="false" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <el-statistic :title="$t('business.inspection.statistics.anomalyCount')" :value="statistics.anomalyCount" value-style="color: #cf1322">
            <template #suffix>{{ $t('business.inspection.statistics.items') }}</template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>{{ $t('business.inspection.statistics.generateTickets') }}</span>
              <span class="red">{{ statistics.ticketCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card>
          <el-statistic :title="$t('business.inspection.statistics.avgDuration')" :value="statistics.avgDuration" :precision="1">
            <template #suffix>{{ $t('business.inspection.statistics.minutes') }}</template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>{{ $t('business.inspection.statistics.comparedToPrevious') }}</span>
              <span class="green">
                <el-icon>
                  <CaretBottom />
                </el-icon>
                8%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <!-- 巡检完成趋势 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>{{ $t('business.inspection.statistics.inspectionTrend') }}</span>
              <el-radio-group v-model="trendType" size="small" @change="updateTrendChart">
                <el-radio-button label="day">{{ $t('business.inspection.statistics.day') }}</el-radio-button>
                <el-radio-button label="week">{{ $t('business.inspection.statistics.week') }}</el-radio-button>
                <el-radio-button label="month">{{ $t('business.inspection.statistics.month') }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div id="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 各楼层巡检对比 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span>{{ $t('business.inspection.statistics.floorComparison') }}</span>
          </template>
          <div id="floorChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 异常项TOP10 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span>{{ $t('business.inspection.statistics.anomalyTop10') }}</span>
          </template>
          <div id="anomalyChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 巡检人员工作量 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span>{{ $t('business.inspection.statistics.workload') }}</span>
          </template>
          <div id="workloadChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 异常处理时效分析 -->
    <el-card class="table-card">
      <template #header>
        <span>{{ $t('business.inspection.statistics.anomalyAnalysis') }}</span>
      </template>
      <el-table :data="anomalyAnalysis" stripe>
        <el-table-column prop="floor" :label="$t('business.inspection.statistics.floorLabel')" width="80">
          <template #default="scope">
            {{ getFloorLabel(scope.row.floor) }}
          </template>
        </el-table-column>
        <el-table-column prop="itemName" :label="$t('business.inspection.statistics.itemName')" show-overflow-tooltip />
        <el-table-column prop="count" :label="$t('business.inspection.statistics.anomalyTimes')" width="90" align="center">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.count }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgTime" :label="$t('business.inspection.statistics.avgHandleTime')" width="120" align="center">
          <template #default="scope">
            {{ scope.row.avgTime }}{{ $t('business.inspection.statistics.hours') }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="$t('business.inspection.statistics.priorityLabel')" width="80" align="center">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ getPriorityLabel(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suggestion" :label="$t('business.inspection.statistics.suggestion')" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 巡检完成率排行 -->
    <el-card class="table-card">
      <template #header>
        <span>{{ $t('business.inspection.statistics.completionRanking') }}</span>
      </template>
      <el-table :data="completionRanking" stripe>
        <el-table-column type="index" :label="$t('business.inspection.statistics.rank')" width="60" align="center" />
        <el-table-column prop="name" :label="$t('business.inspection.statistics.inspector')" width="120" />
        <el-table-column prop="total" :label="$t('business.inspection.statistics.inspectionTimes')" width="90" align="center" />
        <el-table-column prop="completed" :label="$t('business.inspection.statistics.completedTimes')" width="90" align="center" />
        <el-table-column prop="completionRate" :label="$t('business.inspection.statistics.completionRateLabel')" width="100" align="center">
          <template #default="scope">
            <el-progress :percentage="scope.row.completionRate" :text-inside="true" :stroke-width="18"
              :status="getProgressStatus(scope.row.completionRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="avgDuration" :label="$t('business.inspection.statistics.avgDurationLabel')" width="100" align="center">
          <template #default="scope">
            {{ scope.row.avgDuration }}{{ $t('business.inspection.statistics.minutes') }}
          </template>
        </el-table-column>
        <el-table-column prop="anomalyFoundRate" :label="$t('business.inspection.statistics.anomalyFoundRate')" width="110" align="center">
          <template #default="scope">
            {{ scope.row.anomalyFoundRate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { FLOORS } from './constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 数据状态
const dateRange = ref([
  new Date(new Date().setDate(new Date().getDate() - 30)),
  new Date()
])
const selectedFloor = ref('')
const trendType = ref('day')

// 统计数据
const statistics = reactive({
  total: 156,
  completionRate: 95.6,
  anomalyCount: 42,
  ticketCount: 38,
  avgDuration: 45.2
})

// 异常分析数据
const anomalyAnalysis = ref([
  {
    floor: 'floor1',
    itemName: '地埋油罐及蓄冷罐是否正常',
    count: 8,
    avgTime: 2.5,
    priority: 'high',
    suggestion: '建议增加日常维护频次，定期检查管道连接'
  },
  {
    floor: 'floor2',
    itemName: '冷却塔是否正常',
    count: 6,
    avgTime: 4.2,
    priority: 'medium',
    suggestion: '建议每月清洗冷却塔，检查风扇运行状态'
  },
  {
    floor: 'floor3',
    itemName: 'UPS设备运行状态',
    count: 5,
    avgTime: 1.8,
    priority: 'high',
    suggestion: '建议定期进行UPS电池测试和维护'
  }
])

// 完成率排行数据
const completionRanking = ref([
  {
    name: '张三',
    total: 28,
    completed: 28,
    completionRate: 100,
    avgDuration: 42,
    anomalyFoundRate: 15
  },
  {
    name: '李四',
    total: 25,
    completed: 24,
    completionRate: 96,
    avgDuration: 48,
    anomalyFoundRate: 12
  },
  {
    name: '王五',
    total: 22,
    completed: 20,
    completionRate: 91,
    avgDuration: 52,
    anomalyFoundRate: 18
  },
  {
    name: '赵六',
    total: 20,
    completed: 17,
    completionRate: 85,
    avgDuration: 55,
    anomalyFoundRate: 10
  }
])

// 图表实例
let trendChart = null
let floorChart = null
let anomalyChart = null
let workloadChart = null

// 快捷时间选项 (shortcuts text is handled by element-plus internally based on locale)

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(document.getElementById('trendChart'))
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: [t('business.inspection.statistics.inspectionCount'), t('business.inspection.statistics.anomalyCountLabel')]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: generateDateLabels(trendType.value)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: t('business.inspection.statistics.inspectionCount'),
        type: 'line',
        smooth: true,
        data: [12, 15, 13, 18, 20, 17, 19],
        itemStyle: { color: '#409eff' }
      },
      {
        name: t('business.inspection.statistics.anomalyCountLabel'),
        type: 'line',
        smooth: true,
        data: [2, 3, 1, 4, 2, 3, 2],
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化楼层对比图
const initFloorChart = () => {
  floorChart = echarts.init(document.getElementById('floorChart'))
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: [t('business.inspection.statistics.inspectionCount'), t('business.inspection.statistics.anomalyTimes'), t('business.inspection.statistics.completionRateShort')]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [t('business.inspection.statistics.floor1'), t('business.inspection.statistics.floor2'), t('business.inspection.statistics.floor3'), t('business.inspection.statistics.floor4')]
    },
    yAxis: [
      {
        type: 'value',
        name: t('business.inspection.statistics.countLabel')
      },
      {
        type: 'value',
        name: t('business.inspection.statistics.completionRateShort'),
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: t('business.inspection.statistics.inspectionCount'),
        type: 'bar',
        data: [45, 38, 32, 28],
        itemStyle: { color: '#409eff' }
      },
      {
        name: t('business.inspection.statistics.anomalyTimes'),
        type: 'bar',
        data: [12, 8, 6, 5],
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: t('business.inspection.statistics.completionRateShort'),
        type: 'line',
        yAxisIndex: 1,
        data: [95, 92, 88, 90],
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  floorChart.setOption(option)
}

// 初始化异常TOP图
const initAnomalyChart = () => {
  anomalyChart = echarts.init(document.getElementById('anomalyChart'))
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: [
        t('business.inspection.statistics.tempExceed'),
        t('business.inspection.statistics.coolingTowerFault'),
        t('business.inspection.statistics.upsAlarm'),
        t('business.inspection.statistics.leakDetection'),
        t('business.inspection.statistics.fireEquipmentAnomaly'),
        t('business.inspection.statistics.generatorFault'),
        t('business.inspection.statistics.powerDistributionAnomaly'),
        t('business.inspection.statistics.humidityExceed'),
        t('business.inspection.statistics.accessControlAnomaly'),
        t('business.inspection.statistics.lightingFault')
      ].reverse()
    },
    series: [{
      name: t('business.inspection.statistics.anomalyTimes'),
      type: 'bar',
      data: [2, 3, 3, 4, 5, 6, 7, 8, 10, 12].reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#fccb05' },
          { offset: 1, color: '#f5804d' }
        ])
      },
      label: {
        show: true,
        position: 'right'
      }
    }]
  }
  anomalyChart.setOption(option)
}

// 初始化工作量图
const initWorkloadChart = () => {
  workloadChart = echarts.init(document.getElementById('workloadChart'))
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [{
      name: t('business.inspection.statistics.inspectionWorkload'),
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 28, name: t('business.inspection.statistics.zhang') },
        { value: 25, name: t('business.inspection.statistics.li') },
        { value: 22, name: t('business.inspection.statistics.wang') },
        { value: 20, name: t('business.inspection.statistics.zhao') },
        { value: 15, name: t('business.inspection.statistics.others') }
      ]
    }]
  }
  workloadChart.setOption(option)
}

// 生成日期标签
const generateDateLabels = (type) => {
  const labels = []
  const count = type === 'day' ? 7 : type === 'week' ? 4 : 12

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date()
    if (type === 'day') {
      date.setDate(date.getDate() - i)
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    } else if (type === 'week') {
      date.setDate(date.getDate() - i * 7)
      labels.push(t('business.inspection.statistics.weekLabel', { week: count - i }))
    } else {
      date.setMonth(date.getMonth() - i)
      labels.push(t('business.inspection.statistics.monthLabel', { month: date.getMonth() + 1 }))
    }
  }
  return labels
}

// 日期变化处理
const handleDateChange = () => {
  refreshData()
}

// 楼层变化处理
const handleFloorChange = () => {
  refreshData()
}

// 更新趋势图
const updateTrendChart = () => {
  if (trendChart) {
    trendChart.setOption({
      xAxis: {
        data: generateDateLabels(trendType.value)
      }
    })
  }
}

// 刷新数据
const refreshData = () => {
  ElMessage.success(t('business.inspection.statistics.dataRefreshed'))
  // 重新加载图表数据
  if (trendChart) trendChart.resize()
  if (floorChart) floorChart.resize()
  if (anomalyChart) anomalyChart.resize()
  if (workloadChart) workloadChart.resize()
}

// 导出报表
const exportReport = () => {
  ElMessage.success(t('business.inspection.statistics.generatingReport'))
  // 导出逻辑
}

// 获取楼层标签
const getFloorLabel = (value) => {
  const floor = FLOORS.find(f => f.value === value)
  return floor ? floor.label : value
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority) => {
  return t(`business.inspection.priority.${priority}`) || priority
}

// 获取进度条状态
const getProgressStatus = (percentage) => {
  if (percentage >= 95) return 'success'
  if (percentage >= 80) return ''
  if (percentage >= 60) return 'warning'
  return 'exception'
}

// 窗口大小变化处理
const handleResize = () => {
  if (trendChart) trendChart.resize()
  if (floorChart) floorChart.resize()
  if (anomalyChart) anomalyChart.resize()
  if (workloadChart) workloadChart.resize()
}

// 初始化
onMounted(async () => {
  await nextTick()
  initTrendChart()
  initFloorChart()
  initAnomalyChart()
  initWorkloadChart()

  window.addEventListener('resize', handleResize)
})

// 清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (floorChart) {
    floorChart.dispose()
    floorChart = null
  }
  if (anomalyChart) {
    anomalyChart.dispose()
    anomalyChart = null
  }
  if (workloadChart) {
    workloadChart.dispose()
    workloadChart = null
  }
})
</script>

<style lang="scss" scoped>
.inspection-statistics {
  padding: 20px;

  .filter-card {
    margin-bottom: 20px;
  }

  .statistics-cards {
    margin-bottom: 20px;

    .el-card {
      margin-bottom: 20px;
    }

    .statistic-footer {
      margin-top: 10px;

      .footer-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;

        .green {
          color: #67c23a;
          display: flex;
          align-items: center;
        }

        .red {
          color: #f56c6c;
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 350px;
    }
  }

  .table-card {
    margin-bottom: 20px;
  }
}
</style>