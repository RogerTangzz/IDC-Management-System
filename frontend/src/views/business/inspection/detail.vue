<template>
  <div class="app-container">
    <el-card class="header-card">
      <div class="header-content">
        <div class="header-left">
          <el-button link type="primary" icon="Back" @click="handleClose">{{ $t('business.inspection.action.backToList') }}</el-button>
        </div>
        <div class="header-center">
          <h2>{{ $t('business.inspection.message.detailTitle') }} - {{ form.inspectionNo || '-' }}</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="Document" @click="() => generateTicketsByIds(selectedAnomalyIds)" :loading="generating" :disabled="generating">{{ $t('business.inspection.action.generateTickets') }}</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="items-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="descriptions-title">{{ $t('business.inspection.message.anomalySummary') }}</span>
          <div>
            <el-button text size="small" @click="selectAllAnomalies">{{ $t('business.inspection.action.selectAll') }}</el-button>
            <el-button text size="small" @click="clearSelectedAnomalies">{{ $t('business.inspection.action.clearSelection') }}</el-button>
          </div>
        </div>
      </template>
      <div class="anomaly-list">
        <el-checkbox-group v-model="selectedAnomalyIds">
          <div v-for="(item, index) in anomalyItems" :key="item.id" class="anomaly-item">
            <div class="anomaly-header">
              <el-checkbox :label="item.id" style="margin-right: 10px" />
              <span class="anomaly-index">{{ index + 1 }}</span>
              <span class="anomaly-title">{{ item.label || item.itemName || (t('business.inspection.message.anomaly_item', { index: index + 1 })) }}</span>
              <el-button v-if="!item.ticketId" link type="primary" size="small" @click="(e) => onItemGenerate(item, e)" :loading="generating" :disabled="generating">{{ $t('business.inspection.action.generateTickets') }}</el-button>
            </div>
          </div>
        </el-checkbox-group>
      </div>
    </el-card>
  </div>
</template>

<script setup name="InspectionDetail">
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getInspection, generateTickets } from '@/api/business/inspection'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

// 基本数据
const loading = ref(false)
const generating = ref(false)
const form = ref({})
const inspectionItems = ref([])
const selectedAnomalyIds = ref([])

// 计算：异常项
const anomalyItems = computed(() => (inspectionItems.value || []).filter(i => i.isAnomaly || i.value === false))

// 加载巡检详情数据
async function loadInspectionDetail() {
  const inspectionId = route.params.inspectionId || route.params.id
  if (!inspectionId) {
    proxy?.$modal?.msgError?.(t('business.inspection.message.invalidInspectionId'))
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await getInspection(inspectionId)
    const data = res?.data || res
    form.value = data || {}
    inspectionItems.value = data?.items || []
  } catch (error) {
    console.error('Failed to load inspection detail:', error)
    proxy?.$modal?.msgError?.(t('business.inspection.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInspectionDetail()
})

function selectAllAnomalies(){ selectedAnomalyIds.value = anomalyItems.value.map(i => i.id) }
function clearSelectedAnomalies(){ selectedAnomalyIds.value = [] }

function resolveInspectionId(){
  return form.value?.inspectionId || route?.params?.inspectionId || route?.params?.id
}

async function generateTicketsByIds(ids){
  if (!Array.isArray(ids) || ids.length === 0) {
    proxy?.$modal?.msgWarning?.(t('business.inspection.message.selectAnomalyFirst'))
    return
  }
  if (generating.value) return
  // 先置为 loading，防止用户重复点击；若用户取消再回滚
  generating.value = true
  try {
    await proxy?.$modal?.confirm?.(t('business.inspection.message.confirmGenerateTicketsForAnomaly'))
  } catch {
    generating.value = false
    return
  }
  try {
    const resp = await generateTickets(resolveInspectionId(), ids)
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    proxy?.$modal?.msgSuccess?.(t('business.inspection.message.generateTicketsSuccess2', { count: n }))
    try {
      await proxy?.$modal?.confirm?.(t('business.inspection.message.confirmViewTicket'))
      const first = Array.isArray(created) ? created[0] : created
      const tid = first && (first.ticketId ?? first.id ?? first.ticketNo ?? first.ticket_no)
      if (tid) router.push('/business/ticket/detail/' + tid)
    } catch {
      router.push('/business/ticket/list')
    }
  } finally {
    generating.value = false
  }
}

function onItemGenerate(item, e){
  try { e?.target?.setAttribute?.('disabled','disabled') } catch {}
  generateTicketsByIds([item?.id]).finally(() => {
    try { e?.target?.removeAttribute?.('disabled') } catch {}
  })
}

async function generateSelectedTickets(){
  if (!selectedAnomalyIds.value || selectedAnomalyIds.value.length === 0){
    proxy?.$modal?.msgWarning?.(t('business.inspection.message.selectAnomalyFirst'))
    return
  }
  await generateTicketsByIds(selectedAnomalyIds.value)
  selectedAnomalyIds.value = []
}

function handleClose(){ router.back() }

// 向单测暴露必要引用
defineExpose({ form, inspectionItems, generateTicketsByIds, selectedAnomalyIds, generateSelectedTickets })
</script>

<style scoped>
.header-card { margin-bottom: 20px; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.descriptions-title { font-size: 14px; font-weight: bold; color: #303133; }
.anomaly-list { margin-top: 12px; }
.anomaly-item { padding: 10px; margin-bottom: 10px; background: #fff7e6; border: 1px solid #ffd666; border-radius: 4px; }
.anomaly-header { display: flex; align-items: center; gap: 8px; }
.anomaly-index { width: 24px; height: 24px; background: #ff4d4f; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.anomaly-title { flex: 1; font-weight: bold; }
</style>
