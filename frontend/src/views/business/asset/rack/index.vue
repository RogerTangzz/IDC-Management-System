<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="queryParams" class="mb8">
      <el-form-item label="机柜编号">
        <el-input v-model="queryParams.rackNo" placeholder="请输入机柜编号" clearable style="width:200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="楼层">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable style="width:160px">
          <el-option v-for="item in floorOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width:160px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="rackList"
      @sort-change="handleSortChange"
      :default-sort="{prop: 'createTime', order: 'descending'}"
    >
      <el-table-column label="机柜编号" prop="rackNo" width="140" sortable="custom" />
      <el-table-column label="机柜名称" prop="rackName" width="140" sortable="custom" />
      <el-table-column label="楼层" prop="floor" width="80" sortable="custom">
        <template #default="scope">{{ formatFloor(scope.row.floor) }}</template>
      </el-table-column>
      <el-table-column label="房间/区域" prop="room" width="100" sortable="custom" />
      <el-table-column label="总U数" prop="uCount" width="80" sortable="custom" />
      <el-table-column label="已用U数" prop="uUsed" width="90" />
      <el-table-column label="占用率" width="120">
        <template #default="scope">
          <el-progress
            :percentage="calculateOccupancy(scope.row.uUsed, scope.row.uCount)"
            :color="getOccupancyColor(scope.row.uUsed, scope.row.uCount)"
          />
        </template>
      </el-table-column>
      <el-table-column label="额定功率(kW)" prop="powerCapacity" width="120" />
      <el-table-column label="状态" prop="status" width="100" sortable="custom">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ formatStatus(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" sortable="custom" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button type="primary" link icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" append-to-body>
      <el-form ref="rackFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="机柜编号" prop="rackNo">
              <el-input v-model="form.rackNo" placeholder="请输入机柜编号" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机柜名称" prop="rackName">
              <el-input v-model="form.rackName" placeholder="请输入机柜名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-select v-model="form.floor" placeholder="请选择楼层" style="width: 100%">
                <el-option v-for="item in floorOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间/区域" prop="room">
              <el-input v-model="form.room" placeholder="请输入房间/区域" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="具体位置" prop="location">
              <el-input v-model="form.location" placeholder="请输入具体位置描述" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总U数" prop="uCount">
              <el-input-number v-model="form.uCount" :min="1" :max="100" placeholder="请输入总U数" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已用U数" prop="uUsed">
              <el-input-number v-model="form.uUsed" :min="0" :max="form.uCount || 100" placeholder="请输入已用U数" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="额定功率(kW)" prop="powerCapacity">
              <el-input-number v-model="form.powerCapacity" :min="0" :precision="2" placeholder="请输入额定功率" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网络端口数" prop="networkPorts">
              <el-input-number v-model="form.networkPorts" :min="0" placeholder="请输入网络端口数" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="500" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RackList">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { listRacks, addRack, updateRack, delRack } from '@/api/business/asset'
import { download } from '@/utils/request'
import request from '@/utils/request'

const { proxy } = getCurrentInstance()

// 数据列表
const rackList = ref([])
const total = ref(0)
const loading = ref(false)

// 查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  rackNo: undefined,
  floor: undefined,
  status: undefined,
  orderByColumn: 'createTime',
  isAsc: 'desc'
})

// 字典选项
const floorOptions = ref([])
const statusOptions = ref([])

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const rackFormRef = ref(null)
const form = reactive({
  rackId: undefined,
  rackNo: '',
  rackName: '',
  floor: undefined,
  room: '',
  location: '',
  uCount: 42,
  uUsed: 0,
  powerCapacity: undefined,
  networkPorts: 0,
  status: 'active',
  remark: ''
})

// 表单验证规则
const rules = {
  rackNo: [
    { required: true, message: '机柜编号不能为空', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  rackName: [
    { required: true, message: '机柜名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  uCount: [
    { required: true, message: '总U数不能为空', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '总U数范围 1-100', trigger: 'blur' }
  ],
  uUsed: [
    { type: 'number', min: 0, message: '已用U数不能为负数', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value > form.uCount) {
          callback(new Error('已用U数不能超过总U数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/** 查询机柜列表 */
async function getList() {
  loading.value = true
  try {
    const response = await listRacks(queryParams.value)
    rackList.value = response.rows || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取机柜列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    rackNo: undefined,
    floor: undefined,
    status: undefined,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  }
  getList()
}

/** 排序变化处理 */
function handleSortChange({ prop, order }) {
  queryParams.value.orderByColumn = prop
  queryParams.value.isAsc = order === 'ascending' ? 'asc' : 'desc'
  getList()
}

/** 新增按钮操作 */
function handleAdd() {
  resetForm()
  dialogTitle.value = '添加机柜'
  dialogVisible.value = true
}

/** 修改按钮操作 */
function handleEdit(row) {
  resetForm()
  Object.assign(form, row)
  dialogTitle.value = '修改机柜'
  dialogVisible.value = true
}

/** 提交按钮 */
async function submitForm() {
  if (!rackFormRef.value) return

  await rackFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (form.rackId) {
        await updateRack(form)
        proxy.$modal.msgSuccess('修改成功')
      } else {
        await addRack(form)
        proxy.$modal.msgSuccess('新增成功')
      }
      dialogVisible.value = false
      await getList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  })
}

/** 删除按钮操作 */
async function handleDelete(row) {
  proxy.$modal.confirm(`是否确认删除机柜编号为"${row.rackNo}"的数据项？`).then(async () => {
    try {
      await delRack(row.rackId)
      proxy.$modal.msgSuccess('删除成功')
      await getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.$modal.confirm('是否确认导出所有机柜数据？').then(() => {
    proxy.$modal.loading('正在导出数据，请稍候...')
    return download('/business/asset/rack/export', {
      ...queryParams.value
    }, `asset_rack_${new Date().getTime()}.xlsx`)
  }).catch(() => {})
}

/** 重置表单 */
function resetForm() {
  Object.assign(form, {
    rackId: undefined,
    rackNo: '',
    rackName: '',
    floor: undefined,
    room: '',
    location: '',
    uCount: 42,
    uUsed: 0,
    powerCapacity: undefined,
    networkPorts: 0,
    status: 'active',
    remark: ''
  })
  rackFormRef.value?.resetFields()
}

/** 计算占用率 */
function calculateOccupancy(used, total) {
  if (!total || total === 0) return 0
  return Math.round((used / total) * 100)
}

/** 获取占用率颜色 */
function getOccupancyColor(used, total) {
  const percentage = calculateOccupancy(used, total)
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

/** 格式化楼层显示 */
function formatFloor(floor) {
  const item = floorOptions.value.find(f => f.value === floor)
  return item ? item.label : floor
}

/** 格式化状态显示 */
function formatStatus(status) {
  const item = statusOptions.value.find(s => s.value === status)
  return item ? item.label : status
}

/** 获取状态标签类型 */
function getStatusType(status) {
  const typeMap = {
    'active': 'success',
    'disabled': 'warning',
    'retired': 'info'
  }
  return typeMap[status] || 'info'
}

/** 加载字典数据 */
async function loadDicts() {
  try {
    // 加载楼层字典
    const floorRes = await request.get('/system/dict/data/type/idc_floor')
    if (floorRes.code === 200) {
      floorOptions.value = (floorRes.data || []).map(item => ({
        label: item.dictLabel,
        value: item.dictValue
      }))
    }

    // 加载状态字典
    const statusRes = await request.get('/system/dict/data/type/asset_rack_status')
    if (statusRes.code === 200) {
      statusOptions.value = (statusRes.data || []).map(item => ({
        label: item.dictLabel,
        value: item.dictValue
      }))
    }
  } catch (error) {
    console.error('加载字典数据失败:', error)
    // 兜底数据
    floorOptions.value = [
      { label: '一楼', value: '1F' },
      { label: '二楼', value: '2F' },
      { label: '三楼', value: '3F' },
      { label: '四楼', value: '4F' }
    ]
    statusOptions.value = [
      { label: '在用', value: 'active' },
      { label: '停用', value: 'disabled' },
      { label: '退役', value: 'retired' }
    ]
  }
}

/** 初始化 */
onMounted(async () => {
  await loadDicts()
  await getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
