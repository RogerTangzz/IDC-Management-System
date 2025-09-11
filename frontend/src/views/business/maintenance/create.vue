<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>新建维保计划</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <!-- 基础信息 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="计划标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入计划标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层编号" prop="floor">
              <el-select v-model="form.floor" placeholder="请选择楼层">
                <el-option label="1楼" value="1" />
                <el-option label="2楼" value="2" />
                <el-option label="3楼" value="3" />
                <el-option label="4楼" value="4" />
                <el-option label="全部楼层" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="默认V1.0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="MOP类别" prop="mopCategory">
              <el-select v-model="form.mopCategory" placeholder="请选择MOP类别">
                <el-option label="日常维护" value="daily" />
                <el-option label="定期保养" value="regular" />
                <el-option label="月度检修" value="monthly" />
                <el-option label="季度检修" value="quarterly" />
                <el-option label="年度检修" value="annual" />
                <el-option label="应急维修" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- MOP信息 -->
        <el-divider content-position="left">MOP信息</el-divider>

        <el-form-item label="MOP名称" prop="mopName">
          <el-input v-model="form.mopName" placeholder="请输入MOP名称" />
        </el-form-item>

        <el-form-item label="MOP目的" prop="mopPurpose">
          <el-input v-model="form.mopPurpose" type="textarea" :rows="3" placeholder="请输入MOP目的" />
        </el-form-item>

        <!-- 执行周期 -->
        <el-divider content-position="left">执行周期</el-divider>

        <el-row>
          <el-col :span="12">
            <el-form-item label="执行频次" prop="executionFrequency">
              <el-input-number v-model="form.executionFrequency" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="频次单位" prop="executionUnit">
              <el-select v-model="form.executionUnit" placeholder="请选择单位">
                <el-option label="次/月" value="month" />
                <el-option label="次/季" value="quarter" />
                <el-option label="次/年" value="year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="审核人" prop="approverId">
              <el-select v-model="form.approverId" placeholder="请选择审核人">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行审核人" prop="executorId">
              <el-select v-model="form.executorId" placeholder="请选择执行审核人">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="通知人员" prop="notifyUsers">
          <el-select v-model="form.notifyUsers" multiple placeholder="请选择通知人员">
            <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>

        <!-- 工具材料 -->
        <el-divider content-position="left">工具材料</el-divider>

        <el-form-item label="工具仪表" prop="tools">
          <el-input v-model="form.tools" type="textarea" :rows="2" placeholder="请输入所需工具仪表" />
        </el-form-item>

        <el-form-item label="材料" prop="materials">
          <el-input v-model="form.materials" type="textarea" :rows="2" placeholder="请输入所需材料" />
        </el-form-item>

        <el-form-item label="安全(PPE)" prop="safety">
          <el-input v-model="form.safety" type="textarea" :rows="2" placeholder="请输入个人防护装备要求" />
        </el-form-item>

        <el-form-item label="特殊工具" prop="specialTools">
          <el-input v-model="form.specialTools" type="textarea" :rows="2" placeholder="请输入所需特殊工具或配件" />
        </el-form-item>

        <!-- 执行步骤 -->
        <el-divider content-position="left">执行步骤</el-divider>

        <el-form-item label="步骤内容" prop="steps">
          <el-input v-model="form.steps" type="textarea" :rows="5" placeholder="请输入执行步骤" />
        </el-form-item>

        <!-- 创建表格 -->
        <el-form-item label="创建表格">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input v-model="tableRows" placeholder="行数" />
            </el-col>
            <el-col :span="1" style="text-align: center">×</el-col>
            <el-col :span="4">
              <el-input v-model="tableCols" placeholder="列数" />
            </el-col>
            <el-col :span="4">
              <el-button @click="generateTable">生成表格</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 生成的表格 -->
        <el-form-item v-if="tableData.length > 0">
          <el-table :data="tableData" border>
            <el-table-column v-for="(col, index) in tableCols" :key="index" :label="`列${index + 1}`"
              :prop="`col${index}`">
              <template #default="scope">
                <el-input v-model="scope.row[`col${index}`]" />
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 其他信息 -->
        <el-divider content-position="left">其他信息</el-divider>

        <el-form-item label="巡检结果" prop="inspectionResult">
          <el-input v-model="form.inspectionResult" type="textarea" :rows="3" placeholder="请输入巡检结果" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button type="primary" @click="handleSubmit">保 存</el-button>
        <el-button type="success" @click="handleSubmitApproval">提交审核</el-button>
        <el-button @click="handleCopyLast">复制上次计划</el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="MaintenanceCreate">
import { getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const formRef = ref(null)
const tableRows = ref(6)
const tableCols = ref(7)
const tableData = ref([])
const approverList = ref([]) // 审批人下拉
const userList = ref([]) // 用户选择下拉

// 表单数据
const form = ref({
  title: '',
  floor: '',
  version: 'V1.0',
  mopCategory: '',
  mopName: '',
  mopPurpose: '',
  executionFrequency: 1,
  executionUnit: 'month',
  approverId: undefined,
  executorId: undefined,
  notifyUsers: [],
  tools: '',
  materials: '',
  safety: '',
  specialTools: '',
  steps: '',
  inspectionResult: '',
  remark: ''
})

// 验证规则
const rules = {
  title: [{ required: true, message: '请输入计划标题', trigger: 'blur' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  mopCategory: [{ required: true, message: '请选择MOP类别', trigger: 'change' }],
  mopName: [{ required: true, message: '请输入MOP名称', trigger: 'blur' }],
  approverId: [{ required: true, message: '请选择审核人', trigger: 'change' }]
}

// 生成表格
function generateTable() {
  const rows = parseInt(tableRows.value) || 6
  const cols = parseInt(tableCols.value) || 7

  tableData.value = []
  for (let i = 0; i < rows; i++) {
    const row = {}
    for (let j = 0; j < cols; j++) {
      row[`col${j}`] = ''
    }
    tableData.value.push(row)
  }
}

// 复制上次计划
function handleCopyLast() {
  proxy.$modal.confirm('是否复制上次维保计划？').then(() => {
    // Mock数据
    form.value = {
      title: '月度维保计划(复制)',
      floor: '1',
      version: 'V1.1',
      mopCategory: 'monthly',
      mopName: '月度设备检修',
      mopPurpose: '确保设备正常运行',
      executionFrequency: 1,
      executionUnit: 'month',
      approverId: 1,
      executorId: 2,
      notifyUsers: [1, 2],
      tools: '万用表、螺丝刀、扳手',
      materials: '润滑油、清洁剂',
      safety: '安全帽、手套、护目镜',
      specialTools: '专用检测仪',
      steps: '1. 检查设备外观\n2. 测试运行状态\n3. 记录数据',
      inspectionResult: '',
      remark: `[复制自计划#1，复制时间：${proxy.parseTime(new Date())}]`
    }
    proxy.$modal.msgSuccess('复制成功')
  })
}

// 保存
function handleSubmit() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('保存成功')
      router.push('/business/maintenance')
    }
  })
}

// 提交审核
function handleSubmitApproval() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      proxy.$modal.confirm('确认提交审核？').then(() => {
        proxy.$modal.msgSuccess('提交成功，等待审核')
        router.push('/business/maintenance')
      })
    }
  })
}

// 取消
function handleCancel() {
  router.back()
}

// 获取审批人列表
function getApprovers() {
  // Mock数据
  approverList.value = [
    { userId: 1, nickName: '王经理' },
    { userId: 2, nickName: '李主管' },
    { userId: 3, nickName: '张总监' }
  ]
}

// 获取用户列表
function getUserList() {
  // Mock数据
  userList.value = [
    { userId: 1, nickName: '张三' },
    { userId: 2, nickName: '李四' },
    { userId: 3, nickName: '王五' },
    { userId: 4, nickName: '赵六' }
  ]
}

getApprovers()
getUserList()
</script>

<style lang="scss" scoped>
.form-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}
</style>