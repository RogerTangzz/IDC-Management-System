<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入计划标题"
          clearable
          @keyup.enter="handleQuery"
        />
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
          <el-option
            v-for="dict in mop_category"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in approval_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in execution_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:maintenance:add']"
        >新建计划</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="DocumentCopy"
          @click="handleCopyLast"
          v-hasPermi="['business:maintenance:add']"
        >复制上次</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:maintenance:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:maintenance:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:maintenance:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Calendar"
          @click="handleCalendar"
        >日历视图</el-button>
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
          <dict-tag :options="mop_category" :value="scope.row.mopCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="执行周期" align="center" prop="executionCycle" width="100" />
      <el-table-column label="审核状态" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <dict-tag :options="approval_status" :value="scope.row.approvalStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <dict-tag :options="execution_status" :value="scope.row.executionStatus"/>
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
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']"
          >查看</el-button>
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['business:maintenance:edit']"
            v-if="scope.row.approvalStatus !== 'approved'"
          >修改</el-button>
          <el-button
            link
            type="success"
            icon="DocumentCopy"
            @click="handleCopy(scope.row)"
            v-hasPermi="['business:maintenance:add']"
          >复制</el-button>
          <el-button
            link
            type="warning"
            icon="Promotion"
            @click="handleSubmit(scope.row)"
            v-hasPermi="['business:maintenance:edit']"
            v-if="scope.row.approvalStatus === 'draft'"
          >提交</el-button>
          <el-button
            link
            type="success"
            icon="Select"
            @click="handleApprove(scope.row)"
            v-hasPermi="['business:maintenance:approve']"
            v-if="scope.row.approvalStatus === 'pending' && canApprove"
          >审核</el-button>
          <el-button
            link
            type="primary"
            icon="VideoPlay"
            @click="handleExecute(scope.row)"
            v-hasPermi="['business:maintenance:execute']"
            v-if="scope.row.approvalStatus === 'approved' && scope.row.executionStatus === 'pending'"
          >执行</el-button>
          <el-button
            link
            type="warning"
            icon="Tickets"
            @click="handleGenerateTicket(scope.row)"
            v-hasPermi="['business:maintenance:ticket']"
            v-if="scope.row.approvalStatus === 'approved'"
          >生成工单</el-button>
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

    <!-- 提交审核对话框 -->
    <el-dialog title="提交审核" v-model="submitOpen" width="500px" append-to-body>
      <el-form ref="submitRef" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item label="审核人" prop="approverId">
          <el-select v-model="submitForm.approverId" placeholder="请选择审核人">
            <el-option
              v-for="user in approverList"
              :key="user.userId"
              :label="user.nickName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="submitForm.remark" type="textarea" :rows="3" placeholder="请输入备注"/>
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
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval">确 定</el-button>
          <el-button @click="approveOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaintenancePlan">
import { listMaintenance, getMaintenance, delMaintenance, addMaintenance, updateMaintenance, 
         copyLastPlan, getLatestPlan, submitApproval, approvePlan, rejectPlan, 
         generateTicket, startExecution, getApproverList } from "@/api/business/maintenance";

const { proxy } = getCurrentInstance();
const router = useRouter();

const maintenanceList = ref([]);
const open = ref(false);
const submitOpen = ref(false);
const approveOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const approverList = ref([]);
const canApprove = ref(false);

// 字典数据
const { mop_category, approval_status, execution_status } = proxy.useDict('mop_category', 'approval_status', 'execution_status');

const data = reactive({
  form: {},
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

const { queryParams, form, submitForm, approveForm } = toRefs(data);

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
  listMaintenance(params).then(response => {
    maintenanceList.value = response.rows;
    total.value = response.total;
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
  getLatestPlan().then(response => {
    if (response.data) {
      router.push('/business/maintenance/plan/form?copy=' + response.data.planId);
    } else {
      proxy.$modal.msgWarning("暂无可复制的维保计划");
    }
  });
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
  }).catch(() => {});
}

/** 提交审核 */
function handleSubmit(row) {
  getApproverList().then(response => {
    approverList.value = response.rows;
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
      submitApproval(submitForm.value.planId, submitForm.value.approverId).then(response => {
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
function submitApproval() {
  proxy.$refs["approveRef"].validate(valid => {
    if (valid) {
      if (approveForm.value.result === 'approved') {
        approvePlan(approveForm.value.planId, approveForm.value.comment).then(response => {
          proxy.$modal.msgSuccess("审核通过");
          approveOpen.value = false;
          getList();
        });
      } else {
        rejectPlan(approveForm.value.planId, approveForm.value.comment).then(response => {
          proxy.$modal.msgSuccess("审核拒绝");
          approveOpen.value = false;
          getList();
        });
      }
    }
  });
}

/** 执行计划 */
function handleExecute(row) {
  proxy.$modal.confirm('确认开始执行该维保计划吗？').then(() => {
    return startExecution(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("已开始执行");
    getList();
  }).catch(() => {});
}

/** 生成工单 */
function handleGenerateTicket(row) {
  proxy.$modal.confirm('确认生成维保工单吗？').then(() => {
    return generateTicket(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess("工单生成成功");
    getList();
  }).catch(() => {});
}

/** 删除按钮操作 */
function handleDelete(row) {
  const planIds = row.planId || ids.value;
  proxy.$modal.confirm('是否确认删除维保计划编号为"' + planIds + '"的数据项？').then(function() {
    return delMaintenance(planIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/maintenance/export', {
    ...queryParams.value
  }, `maintenance_${new Date().getTime()}.xlsx`)
}

/** 日历视图 */
function handleCalendar() {
  router.push('/business/maintenance/calendar');
}

// 初始化
onMounted(() => {
  getList();
  // 检查是否有审核权限
  canApprove.value = proxy.$auth.hasPermi('business:maintenance:approve');
});
</script>

<style lang="scss" scoped>
</style>