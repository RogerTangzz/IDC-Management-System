<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">维保计划详情 - {{ form.planNo }}</span>
          <div class="header-buttons">
            <el-button link type="primary" icon="Refresh" @click="getDetail">刷新</el-button>
            <el-button link type="primary" icon="Close" @click="handleClose">关闭</el-button>
          </div>
        </div>
      </template>

      <!-- 基础信息 -->
      <el-descriptions :column="3" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">基础信息</span>
        </template>
        <el-descriptions-item label="计划编号">
          <span class="text-primary">{{ form.planNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="计划标题" :span="2">
          {{ form.title }}
        </el-descriptions-item>
        <el-descriptions-item label="楼层">
          {{ getFloorLabel(form.floor) }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号">
          {{ form.version }}
        </el-descriptions-item>
        <el-descriptions-item label="MOP类别">
          <dict-tag :options="mop_category" :value="form.mopCategory" />
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getApprovalType(form.approvalStatus)">
            {{ getApprovalLabel(form.approvalStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getExecutionType(form.executionStatus)">
            {{ getExecutionLabel(form.executionStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(form.createTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- MOP信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">MOP信息</span>
        </template>
        <el-descriptions-item label="MOP名称" :span="2">
          {{ form.mopName }}
        </el-descriptions-item>
        <el-descriptions-item label="MOP目的" :span="2">
          <div class="description-content">{{ form.mopPurpose }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="执行周期">
          {{ form.executionFrequency }} {{ getUnitLabel(form.executionUnit) }}
        </el-descriptions-item>
        <el-descriptions-item label="下次执行时间">
          {{ parseTime(form.nextExecutionTime) || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 人员信息 -->
      <el-descriptions :column="2" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">人员信息</span>
        </template>
        <el-descriptions-item label="审核人">
          {{ form.approverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行审核人">
          {{ form.executorName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ form.applicantName || form.createBy }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ parseTime(form.submitTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通知人员" :span="2">
          <el-tag v-for="user in notifyUserList" :key="user" size="small" style="margin-right: 5px">
            {{ user }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 工具材料 -->
      <el-descriptions :column="1" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">工具材料</span>
        </template>
        <el-descriptions-item label="工具仪表">
          <div class="description-content">{{ form.tools || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="材料">
          <div class="description-content">{{ form.materials || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="安全(PPE)">
          <div class="description-content">{{ form.safety || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="特殊工具">
          <div class="description-content">{{ form.specialTools || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行步骤 -->
      <el-descriptions :column="1" border class="margin-bottom">
        <template #title>
          <span class="descriptions-title">执行步骤</span>
        </template>
        <el-descriptions-item>
          <div class="steps-content" v-html="formatSteps(form.steps)"></div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审核信息 -->
      <el-descriptions :column="2" border class="margin-bottom" v-if="form.approvalStatus !== 'draft'">
        <template #title>
          <span class="descriptions-title">审核信息</span>
        </template>
        <el-descriptions-item label="审核时间">
          {{ parseTime(form.approvalTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getApprovalType(form.approvalStatus)">
            {{ getApprovalLabel(form.approvalStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          <div class="description-content">{{ form.approvalComment || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行记录 -->
      <el-descriptions :column="1" border class="margin-bottom" v-if="executionList.length > 0">
        <template #title>
          <span class="descriptions-title">执行记录</span>
        </template>
        <el-descriptions-item>
          <el-table :data="executionList" border>
            <el-table-column prop="executionNo" label="执行编号" width="150" />
            <el-table-column prop="executorName" label="执行人" width="100" />
            <el-table-column prop="actualExecutionTime" label="执行时间" width="180">
              <template #default="scope">
                {{ parseTime(scope.row.actualExecutionTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="executionResult" label="执行结果" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.executionResult === 'normal' ? 'success' : 'danger'">
                  {{ scope.row.executionResult === 'normal' ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executionRecord" label="执行记录" min-width="200" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="viewExecution(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" icon="Edit" @click="handleEdit" v-hasPermi="['business:maintenance:edit']"
          v-if="form.approvalStatus === 'draft'">编辑</el-button>

        <el-button type="success" icon="Select" @click="handleSubmitApproval" v-hasPermi="['business:maintenance:edit']"
          v-if="form.approvalStatus === 'draft'">提交审核</el-button>

        <el-button type="success" icon="CircleCheck" @click="handleApprove"
          v-hasPermi="['business:maintenance:approve']"
          v-if="form.approvalStatus === 'pending' && canApprove">审核通过</el-button>

        <el-button type="danger" icon="CircleClose" @click="handleReject" v-hasPermi="['business:maintenance:approve']"
          v-if="form.approvalStatus === 'pending' && canApprove">审核拒绝</el-button>

        <el-button type="warning" icon="VideoPlay" @click="handleExecute" v-hasPermi="['business:maintenance:execute']"
          v-if="form.approvalStatus === 'approved' && form.executionStatus === 'pending'">开始执行</el-button>

        <el-button type="primary" icon="Ticket" @click="handleGenerateTicket" v-hasPermi="['business:maintenance:edit']"
          v-if="form.executionStatus === 'executing'">生成工单</el-button>

        <el-button type="info" icon="CopyDocument" @click="handleCopy">复制计划</el-button>

        <el-button type="info" icon="Printer" @click="handlePrint">打印</el-button>

        <el-button icon="Back" @click="handleClose">返回</el-button>
      </div>
    </el-card>

    <!-- 提交审核对话框 -->
    <el-dialog title="提交审核" v-model="submitOpen" width="500px" append-to-body>
      <el-form ref="submitRef" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="submitForm.approverId" placeholder="请选择审核人">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="3" placeholder="请输入说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval">确 定</el-button>
          <el-button @click="submitOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="approvalTitle" v-model="approvalOpen" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item label="审核意见" prop="comment">
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApprovalAction">确 定</el-button>
          <el-button @click="approvalOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaintenanceDetail">
import { getCurrentInstance, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const planId = route.params && route.params.id
const loading = ref(false)
const submitOpen = ref(false)
const approvalOpen = ref(false)
const approvalType = ref('')
const approverList = ref([])
const executionList = ref([])
const notifyUserList = ref([])

// 字典数据
const { mop_category } = proxy.useDict('mop_category')

// 表单数据
const form = ref({})
const submitForm = ref({
  approverId: undefined,
  remark: ''
})
const approvalForm = ref({
  comment: ''
})

// 验证规则
const submitRules = {
  approverId: [{ required: true, message: "请选择审核人", trigger: "change" }]
}
const approvalRules = {
  comment: [{ required: true, message: "请输入审核意见", trigger: "blur" }]
}

// 计算属性
const canApprove = computed(() => {
  // 判断当前用户是否为审核人
  return true // Mock
})

const approvalTitle = computed(() => {
  return approvalType.value === 'approve' ? '审核通过' : '审核拒绝'
})

/** 获取详情 */
function getDetail() {
  loading.value = true
  // Mock数据
  form.value = {
    planId: planId,
    planNo: 'MP202501001',
    title: '月度维保计划',
    floor: '1',
    version: 'V1.0',
    mopCategory: 'monthly',
    mopName: '月度设备检修',
    mopPurpose: '确保设备正常运行，预防故障发生',
    executionFrequency: 1,
    executionUnit: 'month',
    approverName: '王经理',
    executorName: '李主管',
    applicantName: '张三',
    approvalStatus: 'draft',
    executionStatus: 'pending',
    tools: '万用表、螺丝刀、扳手',
    materials: '润滑油、清洁剂',
    safety: '安全帽、手套、护目镜',
    specialTools: '专用检测仪',
    steps: '1. 检查设备外观\n2. 测试运行状态\n3. 记录数据\n4. 清洁保养\n5. 更换耗材',
    createTime: new Date(),
    nextExecutionTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  notifyUserList.value = ['张三', '李四', '王五']

  executionList.value = []

  loading.value = false
}

/** 获取楼层标签 */
function getFloorLabel(floor) {
  const floorMap = {
    '1': '1楼',
    '2': '2楼',
    '3': '3楼',
    '4': '4楼',
    'all': '全部楼层'
  }
  return floorMap[floor] || floor
}

/** 获取单位标签 */
function getUnitLabel(unit) {
  const unitMap = {
    'month': '次/月',
    'quarter': '次/季',
    'year': '次/年'
  }
  return unitMap[unit] || unit
}

/** 获取审核状态类型 */
function getApprovalType(status) {
  const typeMap = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

/** 获取审核状态标签 */
function getApprovalLabel(status) {
  const labelMap = {
    'draft': '草稿',
    'pending': '待审核',
    'approved': '已批准',
    'rejected': '已拒绝'
  }
  return labelMap[status] || status
}

/** 获取执行状态类型 */
function getExecutionType(status) {
  const typeMap = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

/** 获取执行状态标签 */
function getExecutionLabel(status) {
  const labelMap = {
    'pending': '待执行',
    'executing': '执行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return labelMap[status] || status
}

/** 格式化步骤 */
function formatSteps(steps) {
  if (!steps) return ''
  return steps.replace(/\n/g, '<br>')
}

/** 编辑 */
function handleEdit() {
  router.push('/business/maintenance/edit/' + planId)
}

/** 提交审核 */
function handleSubmitApproval() {
  submitForm.value = {
    approverId: undefined,
    remark: ''
  }
  submitOpen.value = true
  getApprovers()
}

/** 确认提交审核 */
function submitApproval() {
  proxy.$refs["submitRef"].validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess("提交成功")
      submitOpen.value = false
      form.value.approvalStatus = 'pending'
      getDetail()
    }
  })
}

/** 审核通过 */
function handleApprove() {
  approvalType.value = 'approve'
  approvalForm.value.comment = ''
  approvalOpen.value = true
}

/** 审核拒绝 */
function handleReject() {
  approvalType.value = 'reject'
  approvalForm.value.comment = ''
  approvalOpen.value = true
}

/** 提交审核操作 */
function submitApprovalAction() {
  proxy.$refs["approvalRef"].validate(valid => {
    if (valid) {
      const msg = approvalType.value === 'approve' ? '审核通过' : '审核拒绝'
      proxy.$modal.msgSuccess(msg)
      approvalOpen.value = false
      form.value.approvalStatus = approvalType.value === 'approve' ? 'approved' : 'rejected'
      getDetail()
    }
  })
}

/** 开始执行 */
function handleExecute() {
  proxy.$modal.confirm('确认开始执行该维保计划？').then(() => {
    proxy.$modal.msgSuccess("已开始执行")
    form.value.executionStatus = 'executing'
    getDetail()
  })
}

/** 生成工单 */
function handleGenerateTicket() {
  proxy.$modal.confirm('确认生成维保工单？').then(() => {
    proxy.$modal.msgSuccess("工单生成成功")
  })
}

/** 复制计划 */
function handleCopy() {
  proxy.$modal.confirm('确认复制该维保计划？').then(() => {
    proxy.$modal.msgSuccess("复制成功")
    router.push('/business/maintenance/create')
  })
}

/** 查看执行记录 */
function viewExecution(row) {
  proxy.$modal.msgInfo("查看执行记录：" + row.executionNo)
}

/** 打印 */
function handlePrint() {
  window.print()
}

/** 返回 */
function handleClose() {
  router.back()
}

/** 获取审批人列表 */
function getApprovers() {
  approverList.value = [
    { userId: 1, nickName: '王经理' },
    { userId: 2, nickName: '李主管' },
    { userId: 3, nickName: '张总监' }
  ]
}

getDetail()
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: bold;
  }
}

.margin-bottom {
  margin-bottom: 20px;
}

.descriptions-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.description-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.steps-content {
  line-height: 1.8;
}

.text-primary {
  color: #409EFF;
  font-weight: bold;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

@media print {
  .action-buttons {
    display: none;
  }
}
</style>