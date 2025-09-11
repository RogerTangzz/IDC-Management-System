<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <el-card class="mb20">
      <template #header>
        <span>巡检基本信息</span>
        <el-button v-if="!inspectionId" type="info" style="float: right" @click="handleCopyLast">复制上次巡检</el-button>
      </template>

      <el-form ref="inspectionRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="巡检日期" prop="inspectionDate">
              <el-date-picker v-model="form.inspectionDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检人员" prop="inspectorName">
              <el-input v-model="form.inspectorName" placeholder="请输入巡检人员" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="接力人员">
              <el-input v-model="form.relayPerson" placeholder="接力人员（可选）" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 巡检进度 -->
    <el-card class="mb20">
      <div class="progress-info">
        <span>巡检进度：</span>
        <el-progress :percentage="progress" :status="progress === 100 ? 'success' : ''" style="width: 400px" />
        <span class="ml10">{{ completedCount }}/{{ totalCount }}项</span>
      </div>
    </el-card>

    <!-- 巡检项目 -->
    <el-card>
      <template #header>
        <span>巡检项目</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="1楼（22项）" name="floor1">
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
                    <el-radio :label="true">正常</el-radio>
                    <el-radio :label="false">异常</el-radio>
                  </el-radio-group>
                  <el-input-number v-else-if="item.type === 'number'" v-model="form.items.floor1[item.id]"
                    :min="item.min" :max="item.max" :precision="2" :controls-position="'right'" />
                  <span v-if="item.type === 'number'" class="ml10">{{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="2楼（18项）" name="floor2">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor2" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-input">
                  <el-radio-group v-model="form.items.floor2[item.id]">
                    <el-radio :label="true">正常</el-radio>
                    <el-radio :label="false">异常</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="3楼（13项）" name="floor3">
          <div class="inspection-items">
            <div v-for="(item, index) in INSPECTION_ITEMS.floor3" :key="item.id" class="inspection-item">
              <div class="item-index">{{ index + 1 }}</div>
              <div class="item-content">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-input">
                  <el-radio-group v-model="form.items.floor3[item.id]">
                    <el-radio :label="true">正常</el-radio>
                    <el-radio :label="false">异常</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="4楼（3项）" name="floor4">
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
                    <el-radio :label="true">正常</el-radio>
                    <el-radio :label="false">异常</el-radio>
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
        <span>现场照片</span>
      </template>
      <image-upload v-model="form.photos" :limit="6" />
    </el-card>

    <!-- 操作按钮 -->
    <div class="mt20 text-center">
      <el-button type="primary" @click="handleSubmit">保存并检查异常</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>

    <!-- 异常确认对话框 -->
    <el-dialog title="检测到异常项" v-model="anomalyDialogVisible" width="600px">
      <el-alert :title="`发现 ${anomalies.length} 个异常项`" type="warning" :closable="false" />
      <el-table :data="anomalies" class="mt10">
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="itemName" label="检查项" />
        <el-table-column prop="value" label="异常值" width="100" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-checkbox v-model="autoGenerateTickets">自动生成工单</el-checkbox>
        <el-button @click="anomalyDialogVisible = false">跳过</el-button>
        <el-button type="primary" @click="confirmAnomalies">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InspectionCreate">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { INSPECTION_ITEMS, anomalyDetectionRules, anomalyPriorityRules } from './constants'
import { addInspection, updateInspection, getInspection, getLatestInspection, generateTickets } from '@/api/business/inspection'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

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
    { required: true, message: '请选择巡检日期', trigger: 'change' }
  ],
  inspectorName: [
    { required: true, message: '请输入巡检人员', trigger: 'blur' }
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
      form.value.remark = `[复制自巡检#${response.data.inspectionNo}]`
      proxy.$modal.msgSuccess('已复制上次巡检记录')
    } else {
      proxy.$modal.msgWarning('没有找到上次巡检记录')
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
          floor: floor.replace('floor', '') + '楼',
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
    proxy.$modal.msgSuccess(inspectionId.value ? '修改成功' : '新增成功')
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
        proxy.$modal.msgError('未获取到巡检ID，无法生成工单')
        return
      }
      generateTickets(inspectionId.value, anomalies.value).then(response => {
        const created = (response && (response.data || response.rows)) || []
        const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
        proxy.$modal.msgSuccess(`已生成 ${n} 个工单`)
        if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
          proxy.$modal.confirm('是否前往第一张工单详情？').then(() => {
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
