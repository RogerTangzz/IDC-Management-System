<template>
  <div class="inspection-config">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <div class="header-actions">
        <div class="left">
          <el-button type="primary" icon="Plus" @click="handleAdd">{{ $t('business.inspection.config.addItem') }}</el-button>
          <el-button icon="Download" @click="handleExport">{{ $t('business.inspection.config.exportConfig') }}</el-button>
          <el-button icon="CopyDocument" @click="handleCopyFloor">{{ $t('business.inspection.config.copyFloor') }}</el-button>
          <el-button type="warning" icon="RefreshRight" @click="handleRestoreDefault">{{ $t('business.inspection.config.restoreDefault') }}</el-button>
        </div>
        <div class="right">
          <el-button type="info" icon="QuestionFilled" @click="showHelp">{{ $t('business.inspection.config.configHelp') }}</el-button>
        </div>
      </div>
    </el-card>

    <!-- 楼层标签页 -->
    <el-card>
      <el-tabs v-model="activeFloor" @tab-change="handleFloorChange">
        <el-tab-pane 
          v-for="floor in FLOORS" 
          :key="floor.value"
          :name="floor.value"
        >
          <template #label>
            <span>
              {{ floor.label }}
              <el-badge :value="getItemCount(floor.value)" class="item-badge" />
            </span>
          </template>

          <!-- 统计信息 -->
          <div class="statistics-bar">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic :title="$t('business.inspection.config.totalItems')" :value="statistics.total" />
              </el-col>
              <el-col :span="6">
                <el-statistic :title="$t('business.inspection.config.requiredItems')" :value="statistics.required" value-style="color: #f56c6c" />
              </el-col>
              <el-col :span="6">
                <el-statistic :title="$t('business.inspection.config.numberType')" :value="statistics.number" />
              </el-col>
              <el-col :span="6">
                <el-statistic :title="$t('business.inspection.config.booleanType')" :value="statistics.boolean" />
              </el-col>
            </el-row>
          </div>

          <!-- 检查项表格 -->
          <el-table
            :data="currentItems"
            v-loading="loading"
            row-key="id"
            stripe
          >
            <el-table-column type="index" :label="$t('business.inspection.config.indexColumn')" width="60" align="center" />

            <el-table-column :label="$t('business.inspection.config.sortColumn')" width="80" align="center">
              <template #default="scope">
                <div class="sort-buttons">
                  <el-button 
                    link 
                    size="small"
                    :disabled="scope.$index === 0"
                    @click="moveUp(scope.$index)"
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button 
                    link 
                    size="small"
                    :disabled="scope.$index === currentItems.length - 1"
                    @click="moveDown(scope.$index)"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="id" :label="$t('business.inspection.config.itemId')" width="150">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.id }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="label" :label="$t('business.inspection.config.itemName')" min-width="300" show-overflow-tooltip />

            <el-table-column prop="type" :label="$t('business.inspection.config.dataType')" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'boolean' ? 'success' : 'primary'" size="small">
                  {{ scope.row.type === 'boolean' ? $t('business.inspection.config.boolean') : $t('business.inspection.config.number') }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column :label="$t('business.inspection.config.normalRange')" width="150" align="center">
              <template #default="scope">
                <span v-if="scope.row.type === 'boolean'">
                  {{ $t('business.inspection.config.normalEquals') }}
                </span>
                <span v-else>
                  {{ scope.row.min }}-{{ scope.row.max }} {{ scope.row.unit }}
                </span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('business.inspection.config.anomalyPriority')" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.label)" size="small">
                  {{ getPriorityLabel(scope.row.label) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column :label="$t('business.inspection.config.enableStatus')" width="80" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enabled"
                  @change="updateStatus(scope.row)"
                />
              </template>
            </el-table-column>

            <el-table-column :label="$t('business.inspection.config.operation')" width="120" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEdit(scope.row)">{{ $t('business.inspection.config.edit') }}</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(scope.row)">{{ $t('business.inspection.config.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('business.inspection.config.itemIdLabel')" prop="id">
          <el-input
            v-model="form.id"
            :placeholder="$t('business.inspection.config.itemIdPlaceholder')"
            :disabled="editMode"
          />
        </el-form-item>

        <el-form-item :label="$t('business.inspection.config.belongingFloor')" prop="floor">
          <el-select v-model="form.floor" :placeholder="$t('business.inspection.config.selectFloor')" :disabled="editMode">
            <el-option
              v-for="floor in FLOORS"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('business.inspection.config.itemNameLabel')" prop="label">
          <el-input v-model="form.label" :placeholder="$t('business.inspection.config.itemNamePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('business.inspection.config.dataTypeLabel')" prop="type">
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio label="boolean">{{ $t('business.inspection.config.booleanTypeLabel') }}</el-radio>
            <el-radio label="number">{{ $t('business.inspection.config.numberTypeLabel') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.type === 'number'">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="$t('business.inspection.config.minValue')" prop="min">
                <el-input-number v-model="form.min" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('business.inspection.config.maxValue')" prop="max">
                <el-input-number v-model="form.max" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('business.inspection.config.unit')" prop="unit">
                <el-select v-model="form.unit" :placeholder="$t('business.inspection.config.selectUnit')" allow-create filterable>
                  <el-option label="°C" value="°C" />
                  <el-option label="%" value="%" />
                  <el-option label="MPa" value="MPa" />
                  <el-option label="ppm" value="ppm" />
                  <el-option label="V" value="V" />
                  <el-option label="A" value="A" />
                  <el-option label="kW" value="kW" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item :label="$t('business.inspection.config.sequence')" prop="seq">
          <el-input-number v-model="form.seq" :min="1" :max="999" />
        </el-form-item>

        <el-form-item :label="$t('business.inspection.config.enableStatusLabel')">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('business.inspection.config.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('business.inspection.config.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 复制楼层配置对话框 -->
    <el-dialog :title="$t('business.inspection.config.copyFloorConfig')" v-model="copyDialogVisible" width="500px">
      <el-form :model="copyForm" label-width="100px">
        <el-form-item :label="$t('business.inspection.config.sourceFloor')">
          <el-select v-model="copyForm.sourceFloor" :placeholder="$t('business.inspection.config.selectSourceFloor')">
            <el-option
              v-for="floor in FLOORS"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('business.inspection.config.targetFloor')">
          <el-select v-model="copyForm.targetFloor" :placeholder="$t('business.inspection.config.selectTargetFloor')">
            <el-option
              v-for="floor in FLOORS"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
              :disabled="floor.value === copyForm.sourceFloor"
            />
          </el-select>
        </el-form-item>
        <el-alert
          :title="$t('business.inspection.config.copyWarning')"
          type="warning"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="copyDialogVisible = false">{{ $t('business.inspection.config.cancel') }}</el-button>
        <el-button type="primary" @click="confirmCopy">{{ $t('business.inspection.config.confirmCopyBtn') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { FLOORS, INSPECTION_ITEMS, getAnomalyPriority } from './constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 状态
const loading = ref(false)
const activeFloor = ref('floor1')
const dialogVisible = ref(false)
const copyDialogVisible = ref(false)
const editMode = ref(false)
const formRef = ref()

// 数据 - 使用现有的 INSPECTION_ITEMS
const configData = reactive({
  floor1: [],
  floor2: [],
  floor3: [],
  floor4: []
})

// 当前楼层的配置项
const currentItems = computed(() => {
  return configData[activeFloor.value] || []
})

// 统计信息
const statistics = computed(() => {
  const items = currentItems.value
  return {
    total: items.length,
    required: items.length, // 现在全部都是必检项
    number: items.filter(item => item.type === 'number').length,
    boolean: items.filter(item => item.type === 'boolean').length
  }
})

// 对话框标题
const dialogTitle = computed(() => {
  return editMode.value ? t('business.inspection.config.dialogTitleEdit') : t('business.inspection.config.dialogTitleAdd')
})

// 表单数据
const form = ref({
  id: '',
  floor: 'floor1',
  label: '',
  type: 'boolean',
  min: 0,
  max: 100,
  unit: '',
  seq: 1,
  enabled: true
})

// 复制表单
const copyForm = ref({
  sourceFloor: '',
  targetFloor: ''
})

// 验证规则
const rules = {
  id: [
    { required: true, message: t('business.inspection.config.validationItemIdRequired'), trigger: 'blur' }
  ],
  floor: [
    { required: true, message: t('business.inspection.config.validationFloorRequired'), trigger: 'change' }
  ],
  label: [
    { required: true, message: t('business.inspection.config.validationItemNameRequired'), trigger: 'blur' }
  ],
  type: [
    { required: true, message: t('business.inspection.config.validationDataTypeRequired'), trigger: 'change' }
  ],
  min: [
    {
      validator: (rule, value, callback) => {
        if (form.value.type === 'number' && (value === undefined || value === '')) {
          callback(new Error(t('business.inspection.config.validationMinValueRequired')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  max: [
    {
      validator: (rule, value, callback) => {
        if (form.value.type === 'number' && (value === undefined || value === '')) {
          callback(new Error(t('business.inspection.config.validationMaxValueRequired')))
        } else if (form.value.type === 'number' && value <= form.value.min) {
          callback(new Error(t('business.inspection.config.validationMaxGreaterThanMin')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 加载配置 - 从现有常量加载
const loadConfig = (floor) => {
  loading.value = true
  try {
    // 从 INSPECTION_ITEMS 常量加载配置
    const items = INSPECTION_ITEMS[floor] || []
    configData[floor] = items.map(item => ({
      ...item,
      enabled: true // 默认全部启用
    }))
  } finally {
    loading.value = false
  }
}

// 切换楼层
const handleFloorChange = () => {
  loadConfig(activeFloor.value)
}

// 新增
const handleAdd = () => {
  editMode.value = false
  form.value = {
    id: '',
    floor: activeFloor.value,
    label: '',
    type: 'boolean',
    min: 0,
    max: 100,
    unit: '',
    seq: currentItems.value.length + 1,
    enabled: true
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  editMode.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  await ElMessageBox.confirm(
    t('business.inspection.config.deleteConfirm', { label: row.label }),
    t('business.inspection.config.systemPrompt'),
    {
      confirmButtonText: t('business.inspection.config.confirmBtn'),
      cancelButtonText: t('business.inspection.config.cancelBtn'),
      type: 'warning'
    }
  )

  const index = currentItems.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    currentItems.value.splice(index, 1)
  }
  ElMessage.success(t('business.inspection.config.deleteSuccess'))
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()

  if (editMode.value) {
    const index = currentItems.value.findIndex(item => item.id === form.value.id)
    if (index > -1) {
      currentItems.value[index] = { ...form.value }
    }
    ElMessage.success(t('business.inspection.config.updateSuccess'))
  } else {
    currentItems.value.push({ ...form.value })
    ElMessage.success(t('business.inspection.config.addSuccess'))
  }

  dialogVisible.value = false
}

// 类型变更
const handleTypeChange = () => {
  if (form.value.type === 'boolean') {
    form.value.min = undefined
    form.value.max = undefined
    form.value.unit = ''
  } else {
    form.value.min = 0
    form.value.max = 100
  }
}

// 更新启用状态
const updateStatus = (row) => {
  ElMessage.success(row.enabled ? t('business.inspection.config.enabled') : t('business.inspection.config.disabled'))
}

// 上移
const moveUp = (index) => {
  if (index === 0) return
  const items = [...currentItems.value]
  ;[items[index], items[index - 1]] = [items[index - 1], items[index]]
  ;[items[index].seq, items[index - 1].seq] = [items[index - 1].seq, items[index].seq]
  configData[activeFloor.value] = items
}

// 下移
const moveDown = (index) => {
  const items = [...currentItems.value]
  if (index === items.length - 1) return
  ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
  ;[items[index].seq, items[index + 1].seq] = [items[index + 1].seq, items[index].seq]
  configData[activeFloor.value] = items
}

// 导出配置
const handleExport = () => {
  const data = currentItems.value
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `巡检配置_${FLOORS.find(f => f.value === activeFloor.value)?.label}_${new Date().getTime()}.json`
  link.click()
  ElMessage.success(t('business.inspection.config.exportSuccess'))
}

// 复制楼层配置
const handleCopyFloor = () => {
  copyForm.value = {
    sourceFloor: activeFloor.value,
    targetFloor: ''
  }
  copyDialogVisible.value = true
}

// 确认复制
const confirmCopy = async () => {
  if (!copyForm.value.targetFloor) {
    ElMessage.warning(t('business.inspection.config.selectTargetFloorWarning'))
    return
  }

  await ElMessageBox.confirm(
    t('business.inspection.config.copyConfirm'),
    t('business.inspection.config.systemPrompt'),
    {
      confirmButtonText: t('business.inspection.config.confirmBtn'),
      cancelButtonText: t('business.inspection.config.cancelBtn'),
      type: 'warning'
    }
  )

  configData[copyForm.value.targetFloor] = JSON.parse(JSON.stringify(configData[copyForm.value.sourceFloor]))
  ElMessage.success(t('business.inspection.config.copySuccess'))
  copyDialogVisible.value = false
  activeFloor.value = copyForm.value.targetFloor
}

// 恢复默认
const handleRestoreDefault = async () => {
  await ElMessageBox.confirm(
    t('business.inspection.config.restoreConfirm'),
    t('business.inspection.config.systemPrompt'),
    {
      confirmButtonText: t('business.inspection.config.confirmBtn'),
      cancelButtonText: t('business.inspection.config.cancelBtn'),
      type: 'warning'
    }
  )

  loadConfig(activeFloor.value)
  ElMessage.success(t('business.inspection.config.restoreSuccess'))
}

// 获取优先级类型
const getPriorityType = (label) => {
  const priority = getAnomalyPriority(label)
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (label) => {
  const priority = getAnomalyPriority(label)
  return t(`business.inspection.priority.${priority}`) || t('business.inspection.priority.low')
}

// 获取项目数量
const getItemCount = (floor) => {
  return configData[floor]?.length || 0
}

// 显示帮助
const showHelp = () => {
  ElMessageBox.alert(
    t('business.inspection.config.helpContent'),
    t('business.inspection.config.helpTitle'),
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: t('business.inspection.config.helpConfirm')
    }
  )
}

// 初始化
onMounted(() => {
  loadConfig(activeFloor.value)
})
</script>

<style lang="scss" scoped>
.inspection-config {
  padding: 20px;
  
  .header-card {
    margin-bottom: 20px;
    
    .header-actions {
      display: flex;
      justify-content: space-between;
      
      .left {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
  }
  
  .item-badge {
    margin-left: 5px;
    
    :deep(.el-badge__content) {
      background-color: #909399;
    }
  }
  
  .statistics-bar {
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
  }
  
  .sort-buttons {
    display: flex;
    gap: 5px;
    align-items: center;
    
    .el-button {
      padding: 0;
    }
  }
}
</style>