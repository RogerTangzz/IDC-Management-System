<template>
  <div class="inspection-config">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <div class="header-actions">
        <div class="left">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增检查项</el-button>
          <el-button icon="Download" @click="handleExport">导出配置</el-button>
          <el-button icon="CopyDocument" @click="handleCopyFloor">复制楼层配置</el-button>
          <el-button type="warning" icon="RefreshRight" @click="handleRestoreDefault">恢复默认</el-button>
        </div>
        <div class="right">
          <el-button type="info" icon="QuestionFilled" @click="showHelp">配置说明</el-button>
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
                <el-statistic title="检查项总数" :value="statistics.total" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="必检项" :value="statistics.required" value-style="color: #f56c6c" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="数值型" :value="statistics.number" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="布尔型" :value="statistics.boolean" />
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
            <el-table-column type="index" label="序号" width="60" align="center" />
            
            <el-table-column label="排序" width="80" align="center">
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

            <el-table-column prop="id" label="项目ID" width="150">
              <template #default="scope">
                <el-tag size="small">{{ scope.row.id }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="label" label="检查项目" min-width="300" show-overflow-tooltip />

            <el-table-column prop="type" label="数据类型" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'boolean' ? 'success' : 'primary'" size="small">
                  {{ scope.row.type === 'boolean' ? '布尔' : '数值' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="正常范围" width="150" align="center">
              <template #default="scope">
                <span v-if="scope.row.type === 'boolean'">
                  正常 = True
                </span>
                <span v-else>
                  {{ scope.row.min }}-{{ scope.row.max }} {{ scope.row.unit }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="异常优先级" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.label)" size="small">
                  {{ getPriorityLabel(scope.row.label) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="启用状态" width="80" align="center">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.enabled" 
                  @change="updateStatus(scope.row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="项目ID" prop="id">
          <el-input 
            v-model="form.id" 
            placeholder="如：oil_tank"
            :disabled="editMode"
          />
        </el-form-item>

        <el-form-item label="所属楼层" prop="floor">
          <el-select v-model="form.floor" placeholder="请选择楼层" :disabled="editMode">
            <el-option
              v-for="floor in FLOORS"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检查项目" prop="label">
          <el-input v-model="form.label" placeholder="请输入检查项目名称" />
        </el-form-item>

        <el-form-item label="数据类型" prop="type">
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio label="boolean">布尔型（正常/异常）</el-radio>
            <el-radio label="number">数值型（需要范围）</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.type === 'number'">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="最小值" prop="min">
                <el-input-number v-model="form.min" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大值" prop="max">
                <el-input-number v-model="form.max" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单位" prop="unit">
                <el-select v-model="form.unit" placeholder="请选择单位" allow-create filterable>
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

        <el-form-item label="排序" prop="seq">
          <el-input-number v-model="form.seq" :min="1" :max="999" />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 复制楼层配置对话框 -->
    <el-dialog title="复制楼层配置" v-model="copyDialogVisible" width="500px">
      <el-form :model="copyForm" label-width="100px">
        <el-form-item label="源楼层">
          <el-select v-model="copyForm.sourceFloor" placeholder="请选择源楼层">
            <el-option
              v-for="floor in FLOORS"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标楼层">
          <el-select v-model="copyForm.targetFloor" placeholder="请选择目标楼层">
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
          title="注意：复制操作将覆盖目标楼层的现有配置"
          type="warning"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="copyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCopy">确定复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { FLOORS, INSPECTION_ITEMS, getAnomalyPriority } from './constants'

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
  return editMode.value ? '编辑检查项' : '新增检查项'
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
    { required: true, message: '请输入项目ID', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择楼层', trigger: 'change' }
  ],
  label: [
    { required: true, message: '请输入检查项目名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  min: [
    { 
      validator: (rule, value, callback) => {
        if (form.value.type === 'number' && (value === undefined || value === '')) {
          callback(new Error('请输入最小值'))
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
          callback(new Error('请输入最大值'))
        } else if (form.value.type === 'number' && value <= form.value.min) {
          callback(new Error('最大值必须大于最小值'))
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
    `确定删除检查项"${row.label}"吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  const index = currentItems.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    currentItems.value.splice(index, 1)
  }
  ElMessage.success('删除成功')
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()
  
  if (editMode.value) {
    const index = currentItems.value.findIndex(item => item.id === form.value.id)
    if (index > -1) {
      currentItems.value[index] = { ...form.value }
    }
    ElMessage.success('更新成功')
  } else {
    currentItems.value.push({ ...form.value })
    ElMessage.success('新增成功')
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
  ElMessage.success(row.enabled ? '已启用' : '已禁用')
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
  ElMessage.success('导出成功')
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
    ElMessage.warning('请选择目标楼层')
    return
  }
  
  await ElMessageBox.confirm(
    '复制操作将覆盖目标楼层的现有配置，是否继续？',
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  configData[copyForm.value.targetFloor] = JSON.parse(JSON.stringify(configData[copyForm.value.sourceFloor]))
  ElMessage.success('复制成功')
  copyDialogVisible.value = false
  activeFloor.value = copyForm.value.targetFloor
}

// 恢复默认
const handleRestoreDefault = async () => {
  await ElMessageBox.confirm(
    '恢复默认配置将覆盖当前楼层的所有自定义配置，是否继续？',
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  
  loadConfig(activeFloor.value)
  ElMessage.success('已恢复默认配置')
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
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || '低'
}

// 获取项目数量
const getItemCount = (floor) => {
  return configData[floor]?.length || 0
}

// 显示帮助
const showHelp = () => {
  ElMessageBox.alert(
    `
    <h4>巡检配置说明</h4>
    <ul style="line-height: 1.8">
      <li><b>检查项目</b>：定义每个楼层需要检查的项目</li>
      <li><b>数据类型</b>：
        <ul style="margin-top: 5px">
          <li>布尔型：只有正常/异常两种状态</li>
          <li>数值型：需要记录具体数值，并设置正常范围</li>
        </ul>
      </li>
      <li><b>异常优先级</b>：系统根据关键词自动判定优先级
        <ul style="margin-top: 5px">
          <li>高优先级：氢气、消防、漏水、漏油、UPS等</li>
          <li>中优先级：温度、湿度、压力、电气间等</li>
          <li>低优先级：卫生、照明、噪音等</li>
        </ul>
      </li>
      <li><b>排序</b>：可以调整检查项的显示顺序</li>
    </ul>
    `,
    '配置说明',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '知道了'
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