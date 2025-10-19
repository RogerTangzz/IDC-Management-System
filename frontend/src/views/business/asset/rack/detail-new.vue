<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <el-page-header @back="$router.back()" :content="`机柜详情 - ${rackInfo.rackNo || ''}`" class="mb-4">
      <template #extra>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </el-page-header>

    <!-- 第一行：基本信息 + 容量信息 -->
    <el-row :gutter="20" class="mb-4">
      <!-- 基本信息卡片 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>基本信息</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="机柜编号">{{ rackInfo.rackNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="机柜名称">{{ rackInfo.rackName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="楼层">{{ rackInfo.floor || '-' }}</el-descriptions-item>
            <el-descriptions-item label="房间/区域">{{ rackInfo.room || '-' }}</el-descriptions-item>
            <el-descriptions-item label="具体位置">{{ rackInfo.location || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(rackInfo.status)">{{ rackInfo.status || '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ rackInfo.createTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ rackInfo.updateTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 容量信息卡片（含ECharts饼图） -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>容量信息</span></template>
          <el-row :gutter="20" class="mb-3">
            <el-col :span="8">
              <el-statistic title="总U数" :value="rackInfo.uCount || 0" suffix="U" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="已用U数" :value="uSlotStats.occupied_slots || 0" suffix="U" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="剩余U数" :value="uSlotStats.free_slots || 0" suffix="U" />
            </el-col>
          </el-row>
          <!-- ECharts 饼图 -->
          <div ref="chartContainer" style="height: 200px; margin-top: 20px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：电力信息 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span>电力与网络</span></template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="额定功率">{{ rackInfo.powerCapacity || '-' }} kW</el-descriptions-item>
            <el-descriptions-item label="网络端口数">{{ rackInfo.networkPorts || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ rackInfo.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：U位操作 + U位可视化 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="10">
        <el-card shadow="never">
          <template #header><span>U位操作</span></template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="分配U位" name="allocate">
              <el-form :model="allocateForm" label-width="100px">
                <el-form-item label="起始U位"><el-input-number v-model="allocateForm.startU" :min="1" :max="100" /></el-form-item>
                <el-form-item label="占用U数"><el-input-number v-model="allocateForm.uCount" :min="1" :max="42" /></el-form-item>
                <el-form-item label="设备名称"><el-input v-model="allocateForm.deviceName" placeholder="请输入设备名称" /></el-form-item>
                <el-form-item label="设备类型"><el-input v-model="allocateForm.deviceType" placeholder="请输入设备类型" /></el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleAllocate" :loading="loading">分配</el-button>
                  <el-button @click="handleCheckConflict">检查冲突</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="释放U位" name="release">
              <el-form :model="releaseForm" label-width="100px">
                <el-form-item label="起始U位"><el-input-number v-model="releaseForm.startU" :min="1" :max="100" /></el-form-item>
                <el-form-item label="释放U数"><el-input-number v-model="releaseForm.uCount" :min="1" :max="42" /></el-form-item>
                <el-form-item><el-button type="warning" @click="handleRelease" :loading="loading">释放</el-button></el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between">
              <span>U位分布</span>
              <el-button size="small" @click="loadAll" :loading="loading">刷新</el-button>
            </div>
          </template>
          <USlotVisualization :u-slots="uSlotsList" :stats="uSlotStats" @slot-click="handleSlotClick" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第四行：变更历史 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between">
              <span>变更历史</span>
              <el-button size="small" @click="loadRackLogs" :loading="loading">刷新</el-button>
            </div>
          </template>
          <el-timeline v-if="rackLogs.length > 0">
            <el-timeline-item
              v-for="log in rackLogs"
              :key="log.logId"
              :timestamp="log.operationTime"
              placement="top"
            >
              <el-card>
                <h4>{{ log.operationDesc }}</h4>
                <p>操作人：{{ log.operator || '系统' }}</p>
                <el-tag v-if="log.operationType === 'CREATE'" type="success">新增</el-tag>
                <el-tag v-else-if="log.operationType === 'UPDATE'" type="warning">修改</el-tag>
                <el-tag v-else-if="log.operationType === 'DELETE'" type="danger">删除</el-tag>
                <el-tag v-else-if="log.operationType === 'U_ALLOCATE'" type="primary">U位分配</el-tag>
                <el-tag v-else-if="log.operationType === 'U_RELEASE'" type="info">U位释放</el-tag>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无变更记录" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import USlotVisualization from './components/USlotVisualization.vue'
import { getRack, getUSlotsByRackId, getUSlotStats, checkUSlotConflict, allocateUSlots, releaseUSlots, getRackLogs } from '@/api/business/asset'

const route = useRoute()
const router = useRouter()
const rackId = route.params.rackId

// 数据状态
const loading = ref(false)
const rackInfo = ref({})
const uSlotsList = ref([])
const uSlotStats = ref({})
const activeTab = ref('allocate')
const allocateForm = ref({ startU: 1, uCount: 1, deviceName: '', deviceType: '' })
const releaseForm = ref({ startU: 1, uCount: 1 })
const chartContainer = ref(null)
const rackLogs = ref([])
let chartInstance = null

// 加载机柜详情
const loadRackInfo = async () => {
  try {
    const res = await getRack(rackId)
    rackInfo.value = res.data || {}
  } catch (e) {
    ElMessage.error('加载机柜信息失败: ' + e.message)
  }
}

// 加载U位数据
const loadUSlots = async () => {
  try {
    const [a, b] = await Promise.all([getUSlotsByRackId(rackId), getUSlotStats(rackId)])
    uSlotsList.value = a.data || []
    uSlotStats.value = b.data || {}
    // 更新图表
    await nextTick()
    initChart()
  } catch (e) {
    ElMessage.error('加载U位数据失败: ' + e.message)
  }
}

// 加载所有数据
const loadAll = async () => {
  loading.value = true
  try {
    await Promise.all([loadRackInfo(), loadUSlots()])
  } finally {
    loading.value = false
  }
}

// 初始化ECharts饼图
const initChart = () => {
  if (!chartContainer.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value)
  }

  const occupied = uSlotStats.value.occupied_slots || 0
  const free = uSlotStats.value.free_slots || 0
  const total = uSlotStats.value.total_slots || 0
  const usageRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}U ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: `${usageRate}%\n占用率`,
        fontSize: 20,
        fontWeight: 'bold'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 24,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: occupied, name: '已占用', itemStyle: { color: '#f56c6c' } },
        { value: free, name: '空闲', itemStyle: { color: '#67c23a' } }
      ]
    }]
  }

  chartInstance.setOption(option)
}

// 检查冲突
const handleCheckConflict = async () => {
  if (!allocateForm.value.startU || !allocateForm.value.uCount) {
    return ElMessage.warning('请填写起始U位和占用U数')
  }
  try {
    const res = await checkUSlotConflict({
      rackId,
      startU: allocateForm.value.startU,
      uCount: allocateForm.value.uCount
    })
    ElMessage[res.data.hasConflict ? 'warning' : 'success'](res.data.message)
  } catch (e) {
    ElMessage.error('检查失败: ' + e.message)
  }
}

// 分配U位
const handleAllocate = async () => {
  if (!allocateForm.value.deviceName) {
    return ElMessage.warning('请填写设备名称')
  }
  try {
    loading.value = true
    await allocateUSlots({ rackId, ...allocateForm.value })
    ElMessage.success('分配成功')
    allocateForm.value = { startU: 1, uCount: 1, deviceName: '', deviceType: '' }
    await loadUSlots()
  } catch (e) {
    ElMessage.error('分配失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

// 释放U位
const handleRelease = async () => {
  if (!releaseForm.value.startU || !releaseForm.value.uCount) {
    return ElMessage.warning('请填写起始U位和释放U数')
  }
  try {
    loading.value = true
    await releaseUSlots({ rackId, ...releaseForm.value })
    ElMessage.success('释放成功')
    releaseForm.value = { startU: 1, uCount: 1 }
    await loadUSlots()
  } catch (e) {
    ElMessage.error('释放失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

// U位点击处理
const handleSlotClick = (slot) => {
  const statusMap = { 'free': '空闲', 'occupied': '已占用', 'reserved': '预留', 'disabled': '禁用' }
  const statusText = statusMap[slot.status] || slot.status
  let content = `<p><strong>U${slot.uNumber}</strong> - ${statusText}</p>`
  if (slot.deviceName) {
    content += `<p>设备: ${slot.deviceName}</p>`
  }
  if (slot.deviceType) {
    content += `<p>类型: ${slot.deviceType}</p>`
  }
  ElMessageBox.alert(content, 'U位详情', { dangerouslyUseHTMLString: true })
}

// 编辑机柜
const handleEdit = () => {
  router.push(`/business/asset/rack/edit/${rackId}`)
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'active': 'success',
    'inactive': 'info',
    'maintenance': 'warning',
    'disabled': 'danger'
  }
  return map[status] || 'info'
}

// 加载变更历史
const loadRackLogs = async () => {
  try {
    const res = await getRackLogs(rackId)
    rackLogs.value = res.data || []
  } catch (e) {
    ElMessage.error('加载变更历史失败: ' + e.message)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadAll()
  loadRackLogs()
})
</script>

<style scoped>
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
</style>
