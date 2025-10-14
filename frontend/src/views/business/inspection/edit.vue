<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>{{ $t('business.inspection.action.edit') }}</span>
      </template>

      <el-form ref="inspectionRef" :model="form" :rules="rules" label-width="120px">
        <!-- 基础信息 -->
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.inspectionNo')">
              <el-input v-model="form.inspectionNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.inspectionDate')" prop="inspectionDate">
              <el-date-picker v-model="form.inspectionDate" type="date" :placeholder="$t('business.inspection.placeholder.selectDate')" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.floor')" prop="floor">
              <el-select v-model="form.floor" :placeholder="$t('business.inspection.placeholder.selectFloor')" @change="handleFloorChange">
                <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.inspectorName')" prop="inspectorName">
              <el-input v-model="form.inspectorName" :placeholder="$t('business.inspection.placeholder.inputInspector')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.relayPerson')">
              <el-select v-model="form.relayPersonId" :placeholder="$t('business.inspection.placeholder.inputRelayPerson')" clearable>
                <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.inspection.field.status')">
              <el-tag :type="getStatusType()">{{ getStatusLabel() }}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 巡检项目 -->
        <el-divider content-position="left">{{ $t('business.inspection.message.inspectionItems') }}</el-divider>

        <div class="inspection-progress">
          <el-progress :percentage="progress" :status="progressStatus">
            <span>{{ $t('business.inspection.message.completedCount', { completed: completedCount, total: totalCount }) }}</span>
          </el-progress>
        </div>

        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane v-for="category in categories" :key="category.value" :label="category.label"
            :name="category.value">
            <el-form-item v-for="item in getCategoryItems(category.value)" :key="item.id" :label="item.label"
              :prop="`items.${item.id}`">
              <!-- 布尔类型 -->
              <template v-if="item.type === 'boolean'">
                <el-radio-group v-model="formItems[item.id]" @change="handleItemChange(item)">
                  <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                  <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
                  <el-radio :label="null">{{ $t('business.inspection.message.notChecked') }}</el-radio>
                </el-radio-group>
                <el-tag v-if="formItems[item.id] === false" type="danger" style="margin-left: 10px">
                  {{ $t('business.inspection.message.needHandle') }}
                </el-tag>
              </template>

              <!-- 数值类型 -->
              <template v-else-if="item.type === 'number'">
                <el-input-number v-model="formItems[item.id]" :min="0" :precision="2" :placeholder="$t('business.inspection.placeholder.inputValue', { label: item.label })"
                  @change="handleItemChange(item)" />
                <span style="margin-left: 10px">{{ item.unit }}</span>
                <span v-if="item.min !== undefined" style="margin-left: 10px; color: #909399;">
                  ({{ $t('business.inspection.message.normalRange') }}: {{ item.min }}-{{ item.max }} {{ item.unit }})
                </span>
                <el-tag v-if="checkAnomaly(item, formItems[item.id])" type="danger" style="margin-left: 10px">
                  {{ $t('business.inspection.message.outOfRange') }}
                </el-tag>
              </template>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <!-- 异常项汇总 -->
        <el-divider content-position="left" v-if="anomalyItems.length > 0">
          {{ $t('business.inspection.message.anomalySummary') }}
          <el-tag type="danger" style="margin-left: 10px">{{ $t('business.inspection.message.itemCount', { count: anomalyItems.length }) }}</el-tag>
        </el-divider>

        <el-alert v-if="anomalyItems.length > 0" :title="$t('business.inspection.message.anomalyDetected')" type="warning"
          :description="$t('business.inspection.message.anomalyFoundCanGenerateTickets', { count: anomalyItems.length })" show-icon :closable="false" />

        <div v-if="anomalyItems.length > 0" class="anomaly-summary">
          <el-checkbox-group v-model="selectedAnomalies">
            <div v-for="item in anomalyItems" :key="item.id" class="anomaly-item">
              <el-checkbox :label="item.id">
                <span class="anomaly-label">{{ item.label }}</span>
                <el-tag size="small" :type="getPriorityType(item.priority)">
                  {{ getPriorityLabel(item.priority) }}
                </el-tag>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <!-- 其他信息 -->
        <el-divider content-position="left">{{ $t('business.inspection.message.otherInfo') }}</el-divider>

        <el-form-item :label="$t('business.inspection.field.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('business.inspection.placeholder.inputComment')" maxlength="500"
            show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('business.inspection.message.onSitePhotos')">
          <image-upload v-model="form.photos" :limit="5" :fileSize="10" :fileType='["jpg", "jpeg", "png", "gif"]'
            :isShowTip="true" />
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button @click="handleCancel">{{ $t('business.inspection.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">{{ $t('business.inspection.action.save') }}</el-button>
        <el-button type="success" @click="handleSaveAndGenerate" :loading="loading" v-if="anomalyItems.length > 0">
          {{ $t('business.inspection.action.saveAndGenerateTickets') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="InspectionEdit">
import { getCurrentInstance, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { FLOORS, INSPECTION_ITEMS, anomalyDetectionRules, anomalyPriorityRules } from './constants'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 路由参数名称与定义保持一致：:inspectionId
const inspectionId = route.params && route.params.inspectionId
const loading = ref(false)
const activeTab = ref('basic')
const userList = ref([])
const selectedAnomalies = ref([])

// 表单数据
const form = ref({
  inspectionId: undefined,
  inspectionNo: '',
  inspectionDate: '',
  floor: '',
  inspectorName: '',
  relayPersonId: undefined,
  remark: '',
  photos: []
})

const formItems = ref({})

// 验证规则
const rules = {
  inspectionDate: [
    { required: true, message: t('business.inspection.validation.inspectionDateRequired'), trigger: 'change' }
  ],
  floor: [
    { required: true, message: t('business.inspection.validation.floorRequired'), trigger: 'change' }
  ],
  inspectorName: [
    { required: true, message: t('business.inspection.validation.inspectorNameRequired'), trigger: 'blur' }
  ]
}

// 当前楼层的巡检项目
const currentItems = computed(() => {
  return INSPECTION_ITEMS[form.value.floor] || []
})

// 分类
const categories = computed(() => {
  const cats = [{ value: 'basic', label: '基础设施' }]
  if (form.value.floor === 'floor1') {
    cats.push({ value: 'pump', label: '水泵系统' })
    cats.push({ value: 'cold', label: '冷冻系统' })
  }
  return cats
})

// 统计信息
const totalCount = computed(() => currentItems.value.length)

const completedCount = computed(() => {
  return Object.keys(formItems.value).filter(key =>
    formItems.value[key] !== null && formItems.value[key] !== undefined
  ).length
})

const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const progressStatus = computed(() => {
  if (progress.value === 100) return 'success'
  if (progress.value >= 80) return ''
  if (progress.value >= 50) return 'warning'
  return 'exception'
})

// 异常项（复用统一规则）
const anomalyItems = computed(() => {
  const items = []
  currentItems.value.forEach(item => {
    const value = formItems.value[item.id]
    if (value === null || value === undefined) return
    let isAnomaly = false
    if (item.type === 'boolean') {
      isAnomaly = anomalyDetectionRules.boolean(value)
    } else if (item.type === 'number' && anomalyDetectionRules.number[item.id]) {
      isAnomaly = anomalyDetectionRules.number[item.id](value)
    }
    if (isAnomaly) {
      items.push({
        ...item,
        value,
        priority: determinePriority(item.label)
      })
    }
  })
  return items
})

import { getInspection, updateInspection, generateTickets } from '@/api/business/inspection'

function parseItems(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return {} }
  }
  return raw
}

function parsePhotos(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

/** 获取巡检详情（真实接口） */
function getInspectionDetail() {
  if (!inspectionId) return
  loading.value = true
  getInspection(inspectionId).then(res => {
    if (res.data) {
      const data = res.data
      form.value = {
        inspectionId: data.inspectionId,
        inspectionNo: data.inspectionNo,
        inspectionDate: data.inspectionDate,
        floor: data.floor || 'floor1',
        inspectorName: data.inspectorName,
        relayPersonId: data.relayPersonId,
        remark: data.remark || '',
  photos: parsePhotos(data.photos)
      }
      formItems.value = parseItems(data.items)
    }
  }).finally(() => { loading.value = false })
}

/** 获取分类项目 */
function getCategoryItems(category) {
  if (category === 'basic') {
    return currentItems.value.slice(0, 10)
  }
  if (category === 'pump') {
    return currentItems.value.slice(10, 15)
  }
  if (category === 'cold') {
    return currentItems.value.slice(15)
  }
  return []
}

// 统一优先级判定（使用 constants 中的关键词映射）
function determinePriority(label) {
  for (const [priority, keywords] of Object.entries(anomalyPriorityRules)) {
    if (keywords.some(k => label.includes(k))) return priority
  }
  return 'low'
}

/** 获取优先级类型 */
function getPriorityType(priority) {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

/** 获取优先级标签 */
function getPriorityLabel(priority) {
  return t('business.inspection.priority.' + priority)
}

/** 获取状态类型 */
function getStatusType() {
  if (progress.value === 100) return 'success'
  if (progress.value > 0) return 'warning'
  return 'info'
}

/** 获取状态标签 */
function getStatusLabel() {
  if (progress.value === 100) return t('business.inspection.status.completed')
  if (progress.value > 0) return t('business.inspection.status.inProgress')
  return t('business.inspection.status.pending')
}

/** 楼层变化 */
function handleFloorChange() {
  // 清空项目数据
  formItems.value = {}
  selectedAnomalies.value = []
}

function handleItemChange(_item) {
  // 可在此触发实时保存或统计
}

function checkAnomaly(item, value) {
  if (value === null || value === undefined) return false
  if (item.type === 'boolean') return anomalyDetectionRules.boolean(value)
  if (item.type === 'number' && anomalyDetectionRules.number[item.id]) {
    return anomalyDetectionRules.number[item.id](value)
  }
  return false
}

/** 禁用日期 */
function disabledDate(time) {
  return time.getTime() > Date.now()
}

/** 保存 */
function handleSave() {
  proxy.$refs.inspectionRef.validate(valid => {
    if (valid) {
      loading.value = true
      const _data = {
        ...form.value,
  items: JSON.stringify(formItems.value || {}),
  photos: JSON.stringify(form.value.photos || []),
        anomalyCount: anomalyItems.value.length
      }
      updateInspection(_data).then(() => {
        proxy.$modal.msgSuccess(t('business.inspection.message.saveSuccess'))
        router.push('/business/inspection')
      }).finally(() => { loading.value = false })
    }
  })
}

/** 保存并生成工单 */
async function handleSaveAndGenerate() {
  if (selectedAnomalies.value.length === 0) {
    proxy.$modal.msgWarning(t('business.inspection.message.selectAnomalyFirst'))
    return
  }
  const data = {
    ...form.value,
    items: JSON.stringify(formItems.value || {}),
    photos: JSON.stringify(form.value.photos || []),
    anomalyCount: anomalyItems.value.length
  }
  try {
    await updateInspection(data)
    const selected = anomalyItems.value.filter(it => selectedAnomalies.value.includes(it.id))
    const anomalies = selected.map(it => ({ itemName: it.label, value: it.value, priority: determinePriority(it.label) || 'low' }))
    const resp = await generateTickets(form.value.inspectionId || inspectionId, anomalies)
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    proxy.$modal.msgSuccess(t('business.inspection.message.generateTicketsSuccess2', { count: n }))
    if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
      try { await proxy.$modal.confirm(t('business.inspection.message.confirmCancelInspection')); router.push('/business/ticket/detail/' + created[0].ticketId) }
      catch { router.push('/business/ticket/list') }
    } else {
      router.push('/business/ticket/list')
    }
  } catch (e) {
    console.error(e)
    proxy.$modal.msgError(t('business.inspection.message.generateFailed'))
  }
}

/** 取消 */
function handleCancel() {
  proxy.$modal.confirm(t('business.inspection.message.confirmCancelEdit')).then(() => {
    router.push('/business/inspection')
  }).catch(() => { })
}

/** 获取用户列表 */
// getUserList 仅返回 mock 数据，如后续接入接口再恢复
function getUserList() {
  userList.value = []
}

onMounted(() => {
  getUserList()
  getInspectionDetail()
})

// 将需要在模板中使用但 script setup 内未直接引用的函数显式声明（避免生产构建 tree-shake）
// checkAnomaly 已在模板使用，确保其未被摇树优化移除
</script>

<style lang="scss" scoped>
.inspection-progress {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.anomaly-summary {
  margin-top: 15px;
  padding: 15px;
  background: #fff7e6;
  border: 1px solid #ffd666;
  border-radius: 4px;

  .anomaly-item {
    margin-bottom: 10px;

    .anomaly-label {
      margin: 0 10px;
    }
  }
}

.form-footer {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>
