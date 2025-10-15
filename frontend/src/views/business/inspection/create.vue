<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <el-card class="mb20">
      <template #header>
        <span>{{ $t('business.inspection.message.basicInfo') }}</span>
        <el-button v-if="!inspectionId" type="info" style="float: right" @click="handleCopyLast">{{ $t('business.inspection.action.copyLast') }}</el-button>
      </template>

      <el-form ref="inspectionRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item :label="$t('business.inspection.field.inspectionDate')" prop="inspectionDate">
              <el-date-picker v-model="form.inspectionDate" type="date" :placeholder="$t('business.inspection.placeholder.selectDate')" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('business.inspection.field.inspectorName')" prop="inspectorName">
              <el-input v-model="form.inspectorName" :placeholder="$t('business.inspection.placeholder.inputInspector')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('business.inspection.field.relayPerson')">
              <el-input v-model="form.relayPerson" :placeholder="$t('business.inspection.placeholder.inputRelayPerson')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('business.inspection.field.remark')">
              <el-input v-model="form.remark" type="textarea" :placeholder="$t('business.inspection.placeholder.inputRemark')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 巡检进度 -->
    <el-card class="mb20">
      <div class="progress-info">
        <span>{{ $t('business.inspection.message.inspectionProgress') }}：</span>
        <el-progress :percentage="progress" :status="progress === 100 ? 'success' : ''" style="width: 400px" />
        <span class="ml10">{{ $t('business.inspection.message.completedCount', { completed: completedCount, total: totalCount }) }}</span>
      </div>
    </el-card>

    <!-- 巡检项目 -->
    <el-card>
      <template #header>
        <span>{{ $t('business.inspection.message.inspectionItems') }}</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane :label="$t('business.inspection.message.floorLabelWithCount', { floor: 1, count: 22 })" name="floor1">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor1" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">
                  {{ item.label }}
                  <el-tag v-if="item.type === 'number'" size="small" type="info">
                    {{ item.unit }}
                  </el-tag>
                </div>
                <div class="item-input">
                  <el-radio-group v-if="item.type === 'boolean'" v-model="form.items.floor1[item.id]">
                    <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                    <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
                  </el-radio-group>
                  <el-input-number v-else-if="item.type === 'number'" v-model="form.items.floor1[item.id]"
                    :min="item.min" :max="item.max" :precision="2" :controls-position="'right'" />
                  <span v-if="item.type === 'number'" class="ml10">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('business.inspection.message.floorLabelWithCount', { floor: 2, count: 18 })" name="floor2">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor2" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-input">
                  <el-radio-group v-model="form.items.floor2[item.id]">
                    <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                    <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('business.inspection.message.floorLabelWithCount', { floor: 3, count: 13 })" name="floor3">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor3" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-input">
                  <el-radio-group v-model="form.items.floor3[item.id]">
                    <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                    <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('business.inspection.message.floorLabelWithCount', { floor: 4, count: 3 })" name="floor4">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor4" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">
                  {{ item.label }}
                  <el-tag v-if="item.type === 'number'" size="small" type="info">
                    {{ item.unit }}
                  </el-tag>
                </div>
                <div class="item-input">
                  <el-radio-group v-if="item.type === 'boolean'" v-model="form.items.floor4[item.id]">
                    <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                    <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
                  </el-radio-group>
                  <el-input-number v-else-if="item.type === 'number'" v-model="form.items.floor4[item.id]"
                    :min="item.min" :max="item.max" :precision="0" />
                  <span v-if="item.type === 'number'" class="ml10">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 现场照片 -->
    <el-card class="mt20">
      <template #header>
        <span>{{ $t('business.inspection.message.onSitePhotos') }}</span>
      </template>
      <image-upload v-model="form.photos" :limit="6" />
    </el-card>

    <!-- 操作按钮 -->
    <div class="mt20 text-center">
      <el-button type="primary" @click="handleSubmit">{{ $t('business.inspection.action.saveAndCheck') }}</el-button>
      <el-button @click="handleCancel">{{ $t('business.inspection.action.cancel') }}</el-button>
    </div>

    <!-- 异常确认对话框 -->
    <el-dialog :title="$t('business.inspection.message.anomalyDetected')" v-model="anomalyDialogVisible" width="600px">
      <el-alert :title="$t('business.inspection.message.anomalyFoundCount', { count: anomalies.length })" type="warning" :closable="false" />
      <el-table :data="anomalies" class="mt10">
        <el-table-column prop="floor" :label="$t('business.inspection.field.floor')" width="80" />
        <el-table-column prop="itemName" :label="$t('business.inspection.field.itemName')" />
        <el-table-column prop="value" :label="$t('business.inspection.field.value')" width="100" />
        <el-table-column prop="priority" :label="$t('business.inspection.field.priority')" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ $t('business.inspection.priority.' + scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-checkbox v-model="autoGenerateTickets">{{ $t('business.inspection.message.autoGenerateTickets') }}</el-checkbox>
        <el-button @click="anomalyDialogVisible = false">{{ $t('business.inspection.action.skip') }}</el-button>
        <el-button type="primary" @click="confirmAnomalies">{{ $t('business.inspection.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InspectionCreate">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { INSPECTION_ITEMS, anomalyDetectionRules, anomalyPriorityRules } from './constants'
import { addInspection, updateInspection, getInspection, getLatestInspection, generateTickets } from '@/api/business/inspection'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 数据定义
const inspectionId = ref(route.params.id)
const activeTab = ref('floor1')
const anomalyDialogVisible = ref(false)
const anomalies = ref([])
const autoGenerateTickets = ref(true)

// 表单数据
const form = ref({
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: '',
  relayPerson: '',
  remark: '',
  items: {
    floor1: {},
    floor2: {},
    floor3: {},
    floor4: {}
  },
  photos: []
})

// 验证规则
const rules = {
  inspectionDate: [
    { required: true, message: t('business.inspection.validation.inspectionDateRequired'), trigger: 'change' }
  ],
  inspectorName: [
    { required: true, message: t('business.inspection.validation.inspectorNameRequired'), trigger: 'blur' }
  ]
}

// 计算属性
const totalCount = computed(() => {
  return Object.values(INSPECTION_ITEMS).reduce((sum, items) => sum + items.length, 0)
})

const completedCount = computed(() => {
  let count = 0
  Object.keys(form.value.items).forEach(floor => {
    Object.values(form.value.items[floor]).forEach(value => {
      if (value !== undefined && value !== null && value !== '') count++
    })
  })
  return count
})

const progress = computed(() => {
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 解析/初始化 items 结构
function normalizeItems(raw) {
  const blank = { floor1: {}, floor2: {}, floor3: {}, floor4: {} }
  if (!raw) return blank
  if (typeof raw === 'string') {
    try { const obj = JSON.parse(raw); return { ...blank, ...obj } } catch { return blank }
  }
  // 若已是对象合并补全缺失楼层
  return { ...blank, ...raw }
}

// 解析照片字段（后端为 String 存 JSON）
function parsePhotos(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

// 复制上次巡检
function handleCopyLast() {
  getLatestInspection().then(response => {
    if (response.data) {
      form.value.items = normalizeItems(response.data.items)
      form.value.remark = `[${t('business.inspection.message.copiedFrom')}#${response.data.inspectionNo}]`
      proxy.$modal.msgSuccess(t('business.inspection.message.copySuccess'))
    } else {
      proxy.$modal.msgWarning(t('business.inspection.message.noLastInspection'))
    }
  })
}

// 检测异常
function detectAnomalies() {
  const detectedAnomalies = []

  Object.keys(INSPECTION_ITEMS).forEach(floor => {
    const items = INSPECTION_ITEMS[floor]
    const values = form.value.items[floor]

    items.forEach(item => {
      const value = values[item.id]
      if (value === undefined || value === null) return

      let isAnomaly = false
      if (item.type === 'boolean') {
        isAnomaly = anomalyDetectionRules.boolean(value)
      } else if (item.type === 'number' && anomalyDetectionRules.number[item.id]) {
        isAnomaly = anomalyDetectionRules.number[item.id](value)
      }

      if (isAnomaly) {
        detectedAnomalies.push({
          floor: t('business.inspection.message.floorLabel', { floor: floor.replace('floor', '') }),
          itemId: item.id,
          itemName: item.label,
          value: value,
          priority: determinePriority(item.label)
        })
      }
    })
  })

  return detectedAnomalies
}

// 确定优先级
function determinePriority(itemName) {
  for (const [priority, keywords] of Object.entries(anomalyPriorityRules)) {
    if (keywords.some(keyword => itemName.includes(keyword))) {
      return priority
    }
  }
  return 'low'
}

// 提交表单
function handleSubmit() {
  proxy.$refs.inspectionRef.validate(valid => {
    if (valid) {
      // 检测异常
      anomalies.value = detectAnomalies()

      if (anomalies.value.length > 0) {
        anomalyDialogVisible.value = true
      } else {
        saveInspection()
      }
    }
  })
}

// 保存巡检
function saveInspection() {
  const data = {
    ...form.value,
    items: JSON.stringify(form.value.items || {}), // 序列化为后端 String
    photos: JSON.stringify(form.value.photos || []), // 序列化照片
    anomalyCount: anomalies.value.length,
    progress: progress.value
  }

  const action = inspectionId.value ? updateInspection : addInspection
  return action(data).then((res) => {
    // 新增场景拿到生成的 ID，供后续生成工单使用
    if (!inspectionId.value && res?.data?.inspectionId) {
      inspectionId.value = res.data.inspectionId
    }
    proxy.$modal.msgSuccess(inspectionId.value ? t('business.inspection.message.updateSuccess') : t('business.inspection.message.addSuccess'))
    return res
  })
}

// 确认异常处理
function confirmAnomalies() {
  const needTickets = autoGenerateTickets.value && anomalies.value.length > 0
  anomalyDialogVisible.value = false
  // 先保存，获取或更新 inspectionId，再生成工单
  saveInspection().then(() => {
    if (needTickets) {
      if (!inspectionId.value) {
        proxy.$modal.msgError(t('business.inspection.message.noInspectionIdForTicket'))
        return
      }
      generateTickets(inspectionId.value, anomalies.value).then(response => {
        const created = (response && (response.data || response.rows)) || []
        const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
        proxy.$modal.msgSuccess(t('business.inspection.message.generateTicketsSuccess2', { count: n }))
        if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
          proxy.$modal.confirm(t('business.inspection.message.confirmCancelInspection')).then(() => {
            router.push('/business/ticket/detail/' + created[0].ticketId)
          }).catch(() => {
            router.push('/business/ticket/list')
          })
        } else {
          router.push('/business/ticket/list')
        }
      })
    } else {
      router.push('/business/inspection')
    }
  })
}

// 取消
function handleCancel() {
  router.back()
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

// 初始化
onMounted(() => {
  if (inspectionId.value) {
    getInspection(inspectionId.value).then(response => {
      if (response.data) {
        // 拆分 items
        const { items, ...rest } = response.data
  form.value = { ...form.value, ...rest, items: normalizeItems(items), photos: parsePhotos(rest.photos) }
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.mb20 {
  margin-bottom: 20px;
}

.mt20 {
  margin-top: 20px;
}

.mt10 {
  margin-top: 10px;
}

.ml10 {
  margin-left: 10px;
}

.text-center {
  text-align: center;
}

.progress-info {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.inspection-items {
  .inspection-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #ebeef5;

    &:hover {
      background-color: #f5f7fa;
    }

    .item-index {
      width: 40px;
      height: 40px;
      background-color: #409eff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 20px;
    }

    .item-content {
      flex: 1;

      .item-label {
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 500;
      }

      .item-input {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
