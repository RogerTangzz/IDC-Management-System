<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入计划标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option label="1楼" value="1" />
          <el-option label="2楼" value="2" />
          <el-option label="3楼" value="3" />
          <el-option label="4楼" value="4" />
          <el-option label="全部楼层" value="all" />
        </el-select>
      </el-form-item>
      <el-form-item label="MOP类别" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" placeholder="请选择类别" clearable>
          <el-option v-for="dict in mop_category" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in approval_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in execution_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:maintenance:add']">新建计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="DocumentCopy" @click="handleCopyLast"
          v-hasPermi="['business:maintenance:add']">复制上次</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:maintenance:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:maintenance:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Upload" @click="triggerImport"
          v-hasPermi="['business:maintenance:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Download" @click="downloadTemplate"
          v-hasPermi="['business:maintenance:import']">模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Calendar" @click="handleCalendar">日历视图</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="maintenanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="计划编号" align="center" prop="planNo" width="120" />
      <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="楼层" align="center" prop="floor" width="80">
        <template #default="scope">
          <el-tag>{{ getFloorLabel(scope.row.floor) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="MOP类别" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <dict-tag :options="mop_category" :value="scope.row.mopCategory" />
        </template>
      </el-table-column>
      <el-table-column label="执行周期" align="center" prop="executionCycle" width="100" />
      <el-table-column label="审核状态" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <dict-tag :options="approval_status" :value="scope.row.approvalStatus" />
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <dict-tag :options="execution_status" :value="scope.row.executionStatus" />
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="approverName" width="100" />
      <el-table-column label="下次执行" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.nextExecutionTime">
            {{ parseTime(scope.row.nextExecutionTime, '{y}-{m}-{d} {h}:{i}') }}
            <el-tag v-if="isUpcoming(scope.row.nextExecutionTime)" type="warning" size="small">即将到期</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus !== 'approved'">修改</el-button>
          <el-button link type="success" icon="DocumentCopy" @click="handleCopy(scope.row)"
            v-hasPermi="['business:maintenance:add']">复制</el-button>
          <el-button link type="warning" icon="Promotion" @click="handleSubmit(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">提交</el-button>
          <el-button link type="success" icon="Select" @click="handleApprove(scope.row)" :loading="actioningId === scope.row.planId" :disabled="actioningId === scope.row.planId"
            v-hasPermi="['business:maintenance:approve']"
            v-if="scope.row.approvalStatus === 'pending' && canApprove">审核</el-button>
          <el-button link type="primary" icon="VideoPlay" @click="handleExecute(scope.row)" :loading="actioningId === scope.row.planId" :disabled="actioningId === scope.row.planId"
            v-hasPermi="['business:maintenance:execute']"
            v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'">执行</el-button>
          <el-button link type="warning" icon="Tickets" @click="handleGenerateTicket(scope.row)" :loading="actioningId === scope.row.planId" :disabled="actioningId === scope.row.planId"
            v-hasPermi="['business:maintenance:ticket']" v-if="scope.row.approvalStatus === 'approved'">生成工单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
    <!-- 隐藏文件选择器，用于导入 -->
    <input ref="importInput" type="file" accept=".xls,.xlsx" style="display:none" @change="onImportFileChange" />

    <!-- 导入结果弹窗 -->
    <el-dialog title="导入结果" v-model="importResultOpen" width="600px" append-to-body>
      <el-descriptions :column="3" border class="mb8">
        <el-descriptions-item label="总计">{{ importResult.total }}</el-descriptions-item>
        <el-descriptions-item label="成功">{{ importResult.success }}</el-descriptions-item>
        <el-descriptions-item label="失败">{{ importResult.failed }}</el-descriptions-item>
      </el-descriptions>
      <el-table v-if="(importResult.errors||[]).length" :data="importResult.errors" height="240">
        <el-table-column label="行号" prop="row" width="100" />
        <el-table-column label="错误信息" prop="message" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importResultOpen = false">关闭</el-button>
          <el-button type="warning" @click="exportImportErrors">导出失败明细</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提交审核对话框 -->
    <el-dialog title="提交审核" v-model="submitOpen" width="500px" append-to-body>
      <el-form ref="submitRef" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="submitForm.approverId" placeholder="请选择审核人">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForApproval">确 定</el-button>
          <el-button @click="submitOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="审核维保计划" v-model="approveOpen" width="500px" append-to-body>
      <el-form ref="approveRef" :model="approveForm" :rules="approveRules" label-width="80px">
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="comment">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApprovalResult">确 定</el-button>
          <el-button @click="approveOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="MaintenancePlan">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, computed } from 'vue'
import useUserStore from '@/store/modules/user'
import { withMineOnly } from '@/utils/business/mineOnly'
import { useRouter } from 'vue-router'
import {
  listMaintenance, delMaintenance, copyLastPlan, submitApproval, approvePlan, rejectPlan,
  generateTicket, startExecution, getApproverList, importMaintenance as importMaintenanceApi,
  downloadMaintenanceTemplate, downloadMaintenanceImportErrors
} from "@/api/business/maintenance";
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()
// 简易管理员判断（含 'admin' | 'ROLE_ADMIN'）
const isAdmin = computed(() => Array.isArray(userStore.roles) && (userStore.roles.includes('admin') || userStore.roles.includes('ROLE_ADMIN')))
const router = useRouter();

const maintenanceList = ref([]);
// 用于缓存计划列表的引用，供复制最后一次计划等操作
const planList = ref([]);
// removed unused open ref
const submitOpen = ref(false);
const approveOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
// removed unused title ref
const dateRange = ref([]);
const approverList = ref([]);
const canApprove = ref(false);
const importInput = ref(null);
const actioningId = ref(null);

// 字典数据
const { mop_category, approval_status, execution_status } = proxy.useDict('mop_category', 'approval_status', 'execution_status');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    floor: undefined,
    mopCategory: undefined,
    approvalStatus: undefined,
    executionStatus: undefined
  },
  submitForm: {
    planId: undefined,
    approverId: undefined,
    remark: ''
  },
  approveForm: {
    planId: undefined,
    result: 'approved',
    comment: ''
  }
});

const { queryParams, form: _form, submitForm, approveForm } = toRefs(data);

// 表单验证
const submitRules = {
  approverId: [{ required: true, message: "请选择审核人", trigger: "change" }]
};
const approveRules = {
  result: [{ required: true, message: "请选择审核结果", trigger: "change" }],
  comment: [{ required: true, message: "请输入审核意见", trigger: "blur" }]
};

/** 查询维保计划列表 */
function getList() {
  loading.value = true;
  let params = proxy.addDateRange(queryParams.value, dateRange.value);
  // 注入数据权限（非管理员仅本人数据），对齐工单列表策略
  params = withMineOnly(params, isAdmin.value) as any
  listMaintenance(params).then(response => {
    maintenanceList.value = response.rows;
    planList.value = [...response.rows];
    total.value = response.total;
  }).finally(() => {
    loading.value = false;
  });
}

/** 获取楼层标签 */
function getFloorLabel(floor) {
  const labels = {
    '1': '1楼',
    '2': '2楼',
    '3': '3楼',
    '4': '4楼',
    'all': '全部楼层'
  };
  return labels[floor] || floor;
}

/** 判断是否即将到期 */
function isUpcoming(time) {
  if (!time) return false;
  const now = new Date();
  const target = new Date(time);
  const diff = target - now;
  return diff > 0 && diff < 48 * 60 * 60 * 1000; // 48小时内
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.planId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  router.push('/business/maintenance/plan/form');
}

/** 复制上次计划 */
function handleCopyLast() {
  // 查找最后一次的计划
  if (planList.value.length > 0) {
    const lastPlan = planList.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0];
    router.push('/business/maintenance/plan/form?copy=' + lastPlan.planId);
  } else {
    proxy.$modal.msgWarning("暂无可复制的维保计划");
  }
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const planId = row.planId || ids.value[0];
  router.push('/business/maintenance/plan/form/' + planId);
}

/** 查看详情 */
function handleView(row) {
  router.push('/business/maintenance/plan/detail/' + row.planId);
}

/** 复制计划 */
function handleCopy(row) {
  proxy.$modal.confirm('是否复制该维保计划？').then(() => {
    return copyLastPlan(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("复制成功");
    getList();
  }).catch(() => { });
}

/** 提交审核 */
function handleSubmit(row) {
  getApproverList().then(_response => {
    approverList.value = _response.rows;
    submitForm.value.planId = row.planId;
    submitForm.value.approverId = undefined;
    submitForm.value.remark = '';
    submitOpen.value = true;
  });
}

/** 确认提交审核 */
function submitForApproval() {
  proxy.$refs["submitRef"].validate(valid => {
    if (valid) {
      submitApproval(submitForm.value.planId, submitForm.value.approverId).then(_response => {
        proxy.$modal.msgSuccess("提交成功");
        submitOpen.value = false;
        getList();
      });
    }
  });
}

/** 审核操作 */
function handleApprove(row) {
  actioningId.value = row.planId;
  approveForm.value.planId = row.planId;
  approveForm.value.result = 'approved';
  approveForm.value.comment = '';
  approveOpen.value = true;
  actioningId.value = null;
}

/** 提交审核结果 */
emplate>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入计划标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option label="1楼" value="1" />
          <el-option label="2楼" value="2" />
          <el-option label="3楼" value="3" />
          <el-option label="4楼" value="4" />
          <el-option label="全部楼层" value="all" />
        </el-select>
      </el-form-item>
      <el-form-item label="MOP类别" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" placeholder="请选择类别" clearable>
          <el-option v-for="dict in mop_category" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in approval_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in execution_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:maintenance:add']">新建计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="DocumentCopy" @click="handleCopyLast"
          v-hasPermi="['business:maintenance:add']">复制上次</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:maintenance:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:maintenance:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Upload" @click="triggerImport"
          v-hasPermi="['business:maintenance:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Download" @click="downloadTemplate"
          v-hasPermi="['business:maintenance:import']">模板下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Calendar" @click="handleCalendar">日历视图</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="maintenanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="计划编号" align="center" prop="planNo" width="120" />
      <el-table-column label="标题" align="left" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="楼层" align="center" prop="floor" width="80">
        <template #default="scope">
          <el-tag>{{ getFloorLabel(scope.row.floor) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="版本" align="center" prop="version" width="80" />
      <el-table-column label="MOP类别" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <dict-tag :options="mop_category" :value="scope.row.mopCategory" />
        </template>
      </el-table-column>
      <el-table-column label="执行周期" align="center" prop="executionCycle" width="100" />
      <el-table-column label="审核状态" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <dict-tag :options="approval_status" :value="scope.row.approvalStatus" />
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <dict-tag :options="execution_status" :value="scope.row.executionStatus" />
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="approverName" width="100" />
      <el-table-column label="下次执行" align="center" prop="nextExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.nextExecutionTime">
            {{ parseTime(scope.row.nextExecutionTime, '{y}-{m}-{d} {h}:{i}') }}
            <el-tag v-if="isUpcoming(scope.row.nextExecutionTime)" type="warning" size="small">即将到期</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus !== 'approved'">修改</el-button>
          <el-button link type="success" icon="DocumentCopy" @click="handleCopy(scope.row)"
            v-hasPermi="['business:maintenance:add']">复制</el-button>
          <el-button link type="warning" icon="Promotion" @click="handleSubmit(scope.row)"
            v-hasPermi="['business:maintenance:edit']" v-if="scope.row.approvalStatus === 'draft'">提交</el-button>
          <el-button link type="success" icon="Select" @click="handleApprove(scope.row)"
            v-hasPermi="['business:maintenance:approve']"
            v-if="scope.row.approvalStatus === 'pending' && canApprove">审核</el-button>
          <el-button link type="primary" icon="VideoPlay" @click="handleExecute(scope.row)"
            v-hasPermi="['business:maintenance:execute']"
            v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'">执行</el-button>
          <el-button link type="warning" icon="Tickets" @click="handleGenerateTicket(scope.row)"
            v-hasPermi="['business:maintenance:ticket']" v-if="scope.row.approvalStatus === 'approved'">生成工单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
    <!-- 隐藏文件选择器，用于导入 -->
    <input ref="importInput" type="file" accept=".xls,.xlsx" style="display:none" @change="onImportFileChange" />

    <!-- 导入结果弹窗 -->
    <el-dialog title="导入结果" v-model="importResultOpen" width="600px" append-to-body>
      <el-descriptions :column="3" border class="mb8">
        <el-descriptions-item label="总计">{{ importResult.total }}</el-descriptions-item>
        <el-descriptions-item label="成功">{{ importResult.success }}</el-descriptions-item>
        <el-descriptions-item label="失败">{{ importResult.failed }}</el-descriptions-item>
      </el-descriptions>
      <el-table v-if="(importResult.errors||[]).length" :data="importResult.errors" height="240">
        <el-table-column label="行号" prop="row" width="100" />
        <el-table-column label="错误信息" prop="message" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importResultOpen = false">关闭</el-button>
          <el-button type="warning" @click="exportImportErrors">导出失败明细</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提交审核对话框 -->
    <el-dialog title="提交审核" v-model="submitOpen" width="500px" append-to-body>
      <el-form ref="submitRef" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="submitForm.approverId" placeholder="请选择审核人">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForApproval">确 定</el-button>
          <el-button @click="submitOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="审核维保计划" v-model="approveOpen" width="500px" append-to-body>
      <el-form ref="approveRef" :model="approveForm" :rules="approveRules" label-width="80px">
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="comment">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApprovalResult">确 定</el-button>
          <el-button @click="approveOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="MaintenancePlan">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, computed } from 'vue'
import useUserStore from '@/store/modules/user'
import { withMineOnly } from '@/utils/business/mineOnly'
import { useRouter } from 'vue-router'
import {
  listMaintenance, delMaintenance, copyLastPlan, submitApproval, approvePlan, rejectPlan,
  generateTicket, startExecution, getApproverList, importMaintenance as importMaintenanceApi,
  downloadMaintenanceTemplate, downloadMaintenanceImportErrors
} from "@/api/business/maintenance";
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()
// 简易管理员判断（含 'admin' | 'ROLE_ADMIN'）
const isAdmin = computed(() => Array.isArray(userStore.roles) && (userStore.roles.includes('admin') || userStore.roles.includes('ROLE_ADMIN')))
const router = useRouter();

const maintenanceList = ref([]);
// 用于缓存计划列表的引用，供复制最后一次计划等操作
const planList = ref([]);
// removed unused open ref
const submitOpen = ref(false);
const approveOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
// removed unused title ref
const dateRange = ref([]);
const approverList = ref([]);
const canApprove = ref(false);
const importInput = ref(null);

// 字典数据
const { mop_category, approval_status, execution_status } = proxy.useDict('mop_category', 'approval_status', 'execution_status');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    floor: undefined,
    mopCategory: undefined,
    approvalStatus: undefined,
    executionStatus: undefined
  },
  submitForm: {
    planId: undefined,
    approverId: undefined,
    remark: ''
  },
  approveForm: {
    planId: undefined,
    result: 'approved',
    comment: ''
  }
});

const { queryParams, form: _form, submitForm, approveForm } = toRefs(data);

// 表单验证
const submitRules = {
  approverId: [{ required: true, message: "请选择审核人", trigger: "change" }]
};
const approveRules = {
  result: [{ required: true, message: "请选择审核结果", trigger: "change" }],
  comment: [{ required: true, message: "请输入审核意见", trigger: "blur" }]
};

/** 查询维保计划列表 */
function getList() {
  loading.value = true;
  let params = proxy.addDateRange(queryParams.value, dateRange.value);
  // 注入数据权限（非管理员仅本人数据），对齐工单列表策略
  params = withMineOnly(params, isAdmin.value) as any
  listMaintenance(params).then(response => {
    maintenanceList.value = response.rows;
    planList.value = [...response.rows];
    total.value = response.total;
  }).finally(() => {
    loading.value = false;
  });
}

/** 获取楼层标签 */
function getFloorLabel(floor) {
  const labels = {
    '1': '1楼',
    '2': '2楼',
    '3': '3楼',
    '4': '4楼',
    'all': '全部楼层'
  };
  return labels[floor] || floor;
}

/** 判断是否即将到期 */
function isUpcoming(time) {
  if (!time) return false;
  const now = new Date();
  const target = new Date(time);
  const diff = target - now;
  return diff > 0 && diff < 48 * 60 * 60 * 1000; // 48小时内
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.planId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  router.push('/business/maintenance/plan/form');
}

/** 复制上次计划 */
function handleCopyLast() {
  // 查找最后一次的计划
  if (planList.value.length > 0) {
    const lastPlan = planList.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0];
    router.push('/business/maintenance/plan/form?copy=' + lastPlan.planId);
  } else {
    proxy.$modal.msgWarning("暂无可复制的维保计划");
  }
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const planId = row.planId || ids.value[0];
  router.push('/business/maintenance/plan/form/' + planId);
}

/** 查看详情 */
function handleView(row) {
  router.push('/business/maintenance/plan/detail/' + row.planId);
}

/** 复制计划 */
function handleCopy(row) {
  proxy.$modal.confirm('是否复制该维保计划？').then(() => {
    return copyLastPlan(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("复制成功");
    getList();
  }).catch(() => { });
}

/** 提交审核 */
function handleSubmit(row) {
  getApproverList().then(_response => {
    approverList.value = _response.rows;
    submitForm.value.planId = row.planId;
    submitForm.value.approverId = undefined;
    submitForm.value.remark = '';
    submitOpen.value = true;
  });
}

/** 确认提交审核 */
function submitForApproval() {
  proxy.$refs["submitRef"].validate(valid => {
    if (valid) {
      submitApproval(submitForm.value.planId, submitForm.value.approverId).then(_response => {
        proxy.$modal.msgSuccess("提交成功");
        submitOpen.value = false;
        getList();
      });
    }
  });
}

/** 审核操作 */
function handleApprove(row) {
  approveForm.value.planId = row.planId;
  approveForm.value.result = 'approved';
  approveForm.value.comment = '';
  approveOpen.value = true;
}

/** 提交审核结果 */
function submitApprovalResult() {
  proxy.$refs["approveRef"].validate(valid => {
    if (valid) {
      actioningId.value = approveForm.value.planId;
      if (approveForm.value.result === 'approved') {
        approvePlan(approveForm.value.planId, approveForm.value.comment).then(() => {
          proxy.$modal.msgSuccess("审核通过");
          approveOpen.value = false;
          getList();
        }).finally(() => { actioningId.value = null });
      } else {
        rejectPlan(approveForm.value.planId, approveForm.value.comment).then(() => {
          proxy.$modal.msgSuccess("审核拒绝");
          approveOpen.value = false;
          getList();
        }).finally(() => { actioningId.value = null });
    }
  });
}    }
  }).finally(() => { actioningId.value = null });
    }
  });
}
/** 执行计划 */
function handleExecute(row) {
  loading.value = true
  actioningId.value = row.planId;
  proxy.$modal.confirm('确认开始执行该维保计划吗？').then(() => {
    actioningId.value = row.planId;
    return startExecution(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("已开始执行");
    getList();
  }).catch(() => { }).finally(() => { loading.value = false; actioningId.value = null })
}


/** 生成工单 */
function handleGenerateTicket(row) {
  loading.value = true
  actioningId.value = row.planId;
  proxy.$modal.confirm('确认生成维保工单吗？').then(() => {
    actioningId.value = row.planId;
    return generateTicket(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("工单生成成功");
    getList();
  }).catch(() => { }).finally(() => { loading.value = false; actioningId.value = null })
}


/** 删除按钮操作 */
function handleDelete(row) {
  const planIds = row.planId || ids.value;
  proxy.$modal.confirm('是否确认删除维保计划编号为"' + planIds + '"的数据项？').then(function () {
    return delMaintenance(planIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  let params: any = { ...queryParams.value }
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    params.beginTime = `${dateRange.value[0]} 00:00:00`
    params.endTime = `${dateRange.value[1]} 23:59:59`
  }
  params = withMineOnly(params, isAdmin.value)
  const filename = `maintenance_${Date.now()}.xlsx`
  if (proxy?.download) {
    proxy.download('business/maintenance/export', params, filename)
  }
}

/** 日历视图 */
function handleCalendar() {
  router.push('/business/maintenance/calendar');
}

// 初始化
// 导入：触发选择与上传
function triggerImport(){
  try { importInput.value && importInput.value.click && importInput.value.click() } catch {}
}
// 导入 + 校验结果弹窗
const importResultOpen = ref(false)
const importResult = ref({ total: 0, success: 0, failed: 0, errors: [] as Array<{ row?: number|string, message?: string }>, taskId: undefined as any })

async function onImportFileChange(e){
  const file = e?.target?.files && e.target.files[0]
  if (!file) return
  try {
    const res: any = await importMaintenanceApi(file)
    // 兼容多种返回结构：{ msg, data:{ total, success, failed, errors } } 或直接 { total,... }
    const data = (res?.data && (typeof res.data === 'object')) ? res.data : (res || {})
    importResult.value = {
      total: Number(data.total || data.count || 0),
      success: Number(data.success || data.successCount || 0),
      failed: Number(data.failed || data.failureCount || 0),
      errors: Array.isArray(data.errors) ? data.errors : (Array.isArray(data.failures) ? data.failures : []),
      taskId: data.taskId
    }
    importResultOpen.value = true
    getList()
  } catch (err) {
    proxy.$modal.msgError('导入失败')
  } finally {
    if (importInput.value) importInput.value.value = ''
  }
}

function downloadTemplate(){
  if (proxy?.download) {
    proxy.download('/business/maintenance/importTemplate', {}, 'maintenance_import_template.xlsx')
    return
  }
  // 兜底：直接发起请求并保存
  downloadMaintenanceTemplate().then((blob) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maintenance_import_template.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
  })
}

// 导出导入失败明细（若后端返回 taskId 则携带）
function exportImportErrors(){
  const taskId = (importResult.value as any)?.taskId
  if (proxy?.download) {
    const params = taskId ? { taskId } : {}
    proxy.download('/business/maintenance/importErrors', params, 'maintenance_import_errors.xlsx')
    return
  }
  // 兜底：使用 API 获取 blob
  downloadMaintenanceImportErrors(taskId).catch(() => {
    proxy?.$modal?.msgError?.('下载失败明细失败')
  })
}

onMounted(() => {
  getList();
  // 检查是否有审核权限
  canApprove.value = proxy.$auth.hasPermi('business:maintenance:approve');
});
</script>

<style lang="scss" scoped></style>

<!-- 结果弹窗模板（放在末尾以避免干扰） -->
<!-- <template>
  <el-dialog title="导入结果" v-model="importResultOpen" width="600px" append-to-body>
    <el-descriptions :column="3" border class="mb8">
      <el-descriptions-item label="总计">{{ importResult.total }}</el-descriptions-item>
      <el-descriptions-item label="成功">{{ importResult.success }}</el-descriptions-item>
      <el-descriptions-item label="失败">{{ importResult.failed }}</el-descriptions-item>
    </el-descriptions>
    <el-table v-if="(importResult.errors||[]).length" :data="importResult.errors" height="240">
      <el-table-column label="行号" prop="row" width="100" />
      <el-table-column label="错误信息" prop="message" />
        <template #footer>
      <div class=\"dialog-footer\">
        <el-button @click=\"importResultOpen = false\">关闭</el-button>
        <el-button type=\"warning\" @click=\"exportImportErrors\">导出失败明细</el-button>
      </div>
    </template>
  </el-dialog>
</template> -->

