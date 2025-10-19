<template>
  <div class="app-container">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <div class="header-actions">
        <el-button icon="Back" @click="handleBack">{{ $t('business.inspection.action.backToList') }}</el-button>
        <div class="actions-right">
          <el-button type="primary" icon="Edit" @click="handleEdit" v-hasPermi="['business:inspection:edit']">
            {{ $t('business.inspection.action.edit') }}
          </el-button>
          <el-button icon="DocumentCopy" @click="handleCopy">{{ $t('business.inspection.action.copy') }}</el-button>
          <el-button v-if="isAdmin" type="danger" icon="Delete" @click="handleDelete" v-hasPermi="['business:inspection:remove']">
            {{ $t('business.inspection.action.delete') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="mb20" v-loading="loading">
      <template #header>
        <span class="card-title">{{ $t('business.inspection.message.basicInfo') }}</span>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item :label="$t('business.inspection.field.inspectionNo')">
          {{ form.inspectionNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.field.inspectionDate')">
          {{ form.inspectionDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.field.inspectorName')">
          {{ form.inspectorName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.field.relayPerson')">
          {{ form.relayPerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.message.completionProgress')">
          <el-progress :percentage="form.progress || 0" :status="form.progress === 100 ? 'success' : ''" style="width: 200px" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.message.anomalyCount')">
          <el-tag :type="form.anomalyCount > 0 ? 'danger' : 'success'">
            {{ form.anomalyCount || 0 }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.inspection.field.remark')" :span="3">
          {{ form.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 巡检项详情 - 楼层Tab（只读模式） -->
    <el-card class="mb20" v-loading="loading">
      <template #header>
        <span class="card-title">{{ $t('business.inspection.message.inspectionItems') }}</span>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="floor in floors" :key="floor.name" :label="floor.label" :name="floor.name">
          <div class="inspection-items-readonly">
            <div v-for="(item, index) in floor.items" :key="item.id" class="inspection-item-readonly">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-value">
                  <template v-if="item.type === 'boolean'">
                    <el-tag :type="formItems[floor.name]?.[item.id] === true ? 'success' : 'danger'">
                      {{ formItems[floor.name]?.[item.id] === true ? $t('business.inspection.message.normal') :
                         formItems[floor.name]?.[item.id] === false ? $t('business.inspection.message.abnormal') : '-' }}
                    </el-tag>
                  </template>
                  <template v-else-if="item.type === 'number'">
                    <span>{{ formItems[floor.name]?.[item.id] ?? '-' }} {{ item.unit || '' }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 现场照片 -->
    <el-card class="mb20" v-if="photos.length > 0">
      <template #header>
        <span class="card-title">{{ $t('business.inspection.message.onSitePhotos') }}</span>
      </template>
      <div class="photos-grid">
        <el-image
          v-for="(photo, index) in photos"
          :key="index"
          :src="photo"
          :preview-src-list="photos"
          :initial-index="index"
          fit="cover"
          class="photo-item"
        />
      </div>
    </el-card>

    <!-- 异常项汇总 -->
    <el-card class="mb20" v-if="anomalyItems.length > 0">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ $t('business.inspection.message.anomalySummary') }}</span>
          <el-button type="primary" icon="Document" @click="handleGenerateTickets" :loading="generating">
            {{ $t('business.inspection.action.generateTickets') }}
          </el-button>
        </div>
      </template>
      <div class="anomaly-list">
        <el-checkbox-group v-model="selectedAnomalyIds">
          <div v-for="(item, index) in anomalyItems" :key="item.id" class="anomaly-item">
            <div class="anomaly-header">
              <el-checkbox :label="item.id" style="margin-right: 10px" />
              <span class="anomaly-index">{{ index + 1 }}</span>
              <span class="anomaly-title">{{ item.label || item.itemName }}</span>
              <el-tag :type="getPriorityType(item.priority)" size="small">
                {{ $t('business.inspection.priority.' + (item.priority || 'low')) }}
              </el-tag>
            </div>
          </div>
        </el-checkbox-group>
      </div>
    </el-card>

    <!-- 操作历史 -->
    <el-card v-loading="historyLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ $t('business.inspection.message.operationHistory') }}</span>
          <el-radio-group v-model="historyType" size="small">
            <el-radio-button label="all">{{ $t('business.inspection.history.all') }}</el-radio-button>
            <el-radio-button label="operation">{{ $t('business.inspection.history.operation') }}</el-radio-button>
            <el-radio-button label="ticket">{{ $t('business.inspection.history.ticket') }}</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-timeline v-if="history.length > 0">
        <el-timeline-item
          v-for="log in history"
          :key="log.id"
          :timestamp="log.time"
          :type="getTimelineType(log.action)"
        >
          <div class="timeline-content">
            <el-tag :type="getActionTagType(log.action)">{{ getActionText(log.action) }}</el-tag>
            <span class="ml10">{{ log.operatorName }}</span>
          </div>
          <div v-if="log.detail" class="timeline-detail">{{ log.detail }}</div>
          <el-link
            v-if="log.action === 'generate_ticket' && log.relatedId"
            :href="`#/business/ticket/detail/${log.relatedId}`"
            type="primary"
          >
            {{ $t('business.inspection.action.viewTicket') }}
          </el-link>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else :description="$t('business.inspection.message.noHistory')" />
    </el-card>
  </div>
</template>

<script setup name="InspectionDetail">
import { ref, computed, getCurrentInstance, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useUserStore from '@/store/modules/user'
import { getInspection, getInspectionHistory, generateTickets, deleteInspection } from '@/api/business/inspection'
import { INSPECTION_ITEMS } from './constants'

const { t } = useI18n()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 基本数据
const loading = ref(false)
const historyLoading = ref(false)
const generating = ref(false)
const form = ref({})
const formItems = ref({ floor1: {}, floor2: {}, floor3: {}, floor4: {} })
const activeTab = ref('floor1')
const history = ref([])
const historyType = ref('all')
const selectedAnomalyIds = ref([])

// 管理员判断
const isAdmin = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('ROLE_ADMIN')
})

// 楼层数据
const floors = computed(() => [
  { name: 'floor1', label: t('business.inspection.message.floorLabelWithCount', { floor: 1, count: 22 }), items: INSPECTION_ITEMS.floor1 },
  { name: 'floor2', label: t('business.inspection.message.floorLabelWithCount', { floor: 2, count: 18 }), items: INSPECTION_ITEMS.floor2 },
  { name: 'floor3', label: t('business.inspection.message.floorLabelWithCount', { floor: 3, count: 13 }), items: INSPECTION_ITEMS.floor3 },
  { name: 'floor4', label: t('business.inspection.message.floorLabelWithCount', { floor: 4, count: 3 }), items: INSPECTION_ITEMS.floor4 }
])

// 照片列表
const photos = computed(() => {
  if (!form.value.photos) return []
  if (Array.isArray(form.value.photos)) return form.value.photos
  try {
    return JSON.parse(form.value.photos)
  } catch {
    return []
  }
})

// 异常项列表
const anomalyItems = computed(() => {
  const anomalies = []
  Object.keys(formItems.value).forEach(floorName => {
    const floorData = formItems.value[floorName]
    const floorItems = INSPECTION_ITEMS[floorName] || []

    floorItems.forEach(item => {
      const value = floorData[item.id]
      if (value === false || (item.type === 'number' && isAnomalyValue(item, value))) {
        anomalies.push({
          id: `${floorName}_${item.id}`,
          floor: floorName,
          itemId: item.id,
          itemName: item.label,
          label: item.label,
          value: value,
          priority: determinePriority(item.label)
        })
      }
    })
  })
  return anomalies
})

// 加载巡检详情
async function loadInspectionDetail() {
  const inspectionId = route.params.inspectionId || route.params.id
  if (!inspectionId) {
    proxy.$modal.msgError(t('business.inspection.message.invalidInspectionId'))
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await getInspection(inspectionId)
    const data = res?.data || res
    form.value = data || {}

    // 解析items
    if (data.items) {
      if (typeof data.items === 'string') {
        try {
          formItems.value = JSON.parse(data.items)
        } catch {
          formItems.value = { floor1: {}, floor2: {}, floor3: {}, floor4: {} }
        }
      } else if (typeof data.items === 'object') {
        formItems.value = data.items
      }
    }
  } catch (error) {
    console.error('Failed to load inspection detail:', error)
    proxy.$modal.msgError(t('business.inspection.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 加载操作历史
async function loadHistory() {
  const inspectionId = route.params.inspectionId || route.params.id
  if (!inspectionId) return

  historyLoading.value = true
  try {
    const res = await getInspectionHistory(inspectionId, { type: historyType.value })
    history.value = res.data || []
  } catch (error) {
    console.error('Failed to load history:', error)
    proxy.$modal.msgError(t('business.inspection.message.historyLoadFailed'))
  } finally {
    historyLoading.value = false
  }
}

// 监听历史类型切换
watch(historyType, () => {
  loadHistory()
})

// 判断是否为异常值
function isAnomalyValue(item, value) {
  // 这里可以添加数值型异常判断逻辑
  return false
}

// 确定优先级
function determinePriority(itemName) {
  const highPriorityKeywords = ['UPS', '电源', '温度', '湿度', '消防']
  const mediumPriorityKeywords = ['空调', '照明', '通风']

  if (highPriorityKeywords.some(k => itemName.includes(k))) return 'high'
  if (mediumPriorityKeywords.some(k => itemName.includes(k))) return 'medium'
  return 'low'
}

// 获取动作文本
function getActionText(action) {
  const map = {
    'create': t('business.inspection.history.create'),
    'update': t('business.inspection.history.update'),
    'copy': t('business.inspection.history.copy'),
    'generate_ticket': t('business.inspection.history.generate_ticket'),
    'delete': t('business.inspection.history.delete')
  }
  return map[action] || action
}

// 获取动作标签类型
function getActionTagType(action) {
  const map = {
    'create': 'success',
    'update': 'primary',
    'copy': 'info',
    'generate_ticket': 'warning',
    'delete': 'danger'
  }
  return map[action] || ''
}

// 获取时间线类型
function getTimelineType(action) {
  const map = {
    'create': 'success',
    'update': 'primary',
    'copy': 'info',
    'generate_ticket': 'warning',
    'delete': 'danger'
  }
  return map[action] || 'primary'
}

// 获取优先级类型
function getPriorityType(priority) {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

// 操作处理函数
function handleBack() {
  router.push('/business/inspection')
}

function handleEdit() {
  const inspectionId = route.params.inspectionId || route.params.id
  router.push(`/business/inspection/edit/${inspectionId}`)
}

function handleCopy() {
  const inspectionId = route.params.inspectionId || route.params.id
  router.push(`/business/inspection/create?copy=${inspectionId}`)
}

async function handleDelete() {
  try {
    await proxy.$modal.confirm(t('business.inspection.message.confirmDelete'))
    const inspectionId = route.params.inspectionId || route.params.id
    await deleteInspection(inspectionId)
    proxy.$modal.msgSuccess(t('business.inspection.message.deleteSuccess'))
    router.push('/business/inspection')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete:', error)
    }
  }
}

async function handleGenerateTickets() {
  if (selectedAnomalyIds.value.length === 0) {
    proxy.$modal.msgWarning(t('business.inspection.message.selectAnomalyFirst'))
    return
  }

  try {
    await proxy.$modal.confirm(t('business.inspection.message.confirmGenerateTicketsForAnomaly'))
    generating.value = true

    const inspectionId = route.params.inspectionId || route.params.id
    const anomaliesToGenerate = anomalyItems.value.filter(item =>
      selectedAnomalyIds.value.includes(item.id)
    )

    const res = await generateTickets(inspectionId, anomaliesToGenerate)
    const created = res.data || []

    proxy.$modal.msgSuccess(t('business.inspection.message.generateTicketsSuccess2', { count: created.length }))
    selectedAnomalyIds.value = []

    // 重新加载历史
    await loadHistory()

    // 询问是否跳转到工单
    if (created.length > 0) {
      try {
        await proxy.$modal.confirm(t('business.inspection.message.confirmViewTicket'))
        router.push(`/business/ticket/detail/${created[0].ticketId}`)
      } catch {
        // 用户取消，不跳转
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to generate tickets:', error)
    }
  } finally {
    generating.value = false
  }
}

// 初始化
onMounted(() => {
  loadInspectionDetail()
  loadHistory()
})

// 暴露给测试
defineExpose({ form, formItems, history, loadInspectionDetail, loadHistory })
</script>

<style scoped lang="scss">
.header-card {
  margin-bottom: 20px;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .actions-right {
      display: flex;
      gap: 10px;
    }
  }
}

.mb20 {
  margin-bottom: 20px;
}

.ml10 {
  margin-left: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 只读巡检项样式
.inspection-items-readonly {
  .inspection-item-readonly {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #ebeef5;

    &:hover {
      background-color: #f5f7fa;
    }

    .item-index {
      width: 40px;
      height: 40px;
      background-color: #909399;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 20px;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-label {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }

      .item-value {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

// 照片网格
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;

  .photo-item {
    width: 100%;
    height: 150px;
    border-radius: 4px;
    cursor: pointer;
  }
}

// 异常项列表
.anomaly-list {
  .anomaly-item {
    padding: 12px;
    margin-bottom: 10px;
    background: #fff7e6;
    border: 1px solid #ffd666;
    border-radius: 4px;

    .anomaly-header {
      display: flex;
      align-items: center;
      gap: 10px;

      .anomaly-index {
        width: 24px;
        height: 24px;
        background: #ff4d4f;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
      }

      .anomaly-title {
        flex: 1;
        font-weight: 500;
      }
    }
  }
}

// 时间线内容
.timeline-content {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.timeline-detail {
  color: #909399;
  font-size: 13px;
  margin-bottom: 5px;
}
</style>
