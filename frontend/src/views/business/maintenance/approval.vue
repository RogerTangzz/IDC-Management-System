<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item :label="$t('business.maintenance.field.title')" prop="title">
        <el-input v-model="queryParams.title" :placeholder="$t('business.maintenance.placeholder.inputTitle')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.floor')" prop="floor">
        <el-select v-model="queryParams.floor" :placeholder="$t('business.maintenance.placeholder.selectFloor')" clearable>
          <el-option :label="$t('business.maintenance.floor.floor1')" value="1" />
          <el-option :label="$t('business.maintenance.floor.floor2')" value="2" />
          <el-option :label="$t('business.maintenance.floor.floor3')" value="3" />
          <el-option :label="$t('business.maintenance.floor.floor4')" value="4" />
          <el-option :label="$t('business.maintenance.floor.allFloors')" value="all" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.mopCategory')" prop="mopCategory">
        <el-select v-model="queryParams.mopCategory" :placeholder="$t('business.maintenance.placeholder.selectCategory')" clearable>
          <el-option v-for="dict in mop_category" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.approvalStatus')" prop="approvalStatus">
        <el-select v-model="queryParams.approvalStatus" :placeholder="$t('business.maintenance.placeholder.selectStatus')" clearable>
          <el-option v-for="dict in approval_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.maintenance.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.maintenance.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" plain icon="Select" :disabled="multiple" @click="handleBatchApprove"
          v-hasPermi="['business:maintenance:approve']">{{ $t('business.maintenance.action.batchApprove') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="CloseBold" :disabled="multiple" @click="handleBatchReject"
          v-hasPermi="['business:maintenance:approve']">{{ $t('business.maintenance.action.batchReject') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="approvalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('business.maintenance.field.planNo')" align="center" prop="planNo" width="120" />
      <el-table-column :label="$t('business.maintenance.field.title')" align="left" prop="title" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('business.maintenance.field.floor')" align="center" prop="floor" width="80">
        <template #default="scope">
          <el-tag>{{ getFloorLabel(scope.row.floor) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.version')" align="center" prop="version" width="80" />
      <el-table-column :label="$t('business.maintenance.field.mopCategory')" align="center" prop="mopCategory" width="100">
        <template #default="scope">
          <dict-tag :options="mop_category" :value="scope.row.mopCategory" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.executionCycle')" align="center" prop="executionCycle" width="100" />
      <el-table-column :label="$t('business.maintenance.field.applicant')" align="center" prop="applicantName" width="100" />
      <el-table-column :label="$t('business.maintenance.field.submitTime')" align="center" prop="submitTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.submitTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.approvalStatus')" align="center" prop="approvalStatus" width="100">
        <template #default="scope">
          <dict-tag :options="approval_status" :value="scope.row.approvalStatus" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.priority')" align="center" prop="priority" width="80">
        <template #default="scope">
          <el-tag v-if="isUrgent(scope.row)" type="danger">{{ $t('business.maintenance.priority.urgent') }}</el-tag>
          <el-tag v-else type="info">{{ $t('business.maintenance.priority.normal') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.message.operation')" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">{{ $t('business.maintenance.action.view') }}</el-button>
          <el-button link type="success" icon="Select" @click="handleApprove(scope.row)"
            v-hasPermi="['business:maintenance:approve']" v-if="scope.row.approvalStatus === 'pending'">{{ $t('business.maintenance.action.pass') }}</el-button>
          <el-button link type="danger" icon="CloseBold" @click="handleReject(scope.row)"
            v-hasPermi="['business:maintenance:approve']" v-if="scope.row.approvalStatus === 'pending'">{{ $t('business.maintenance.action.reject') }}</el-button>
          <el-button link type="warning" icon="RefreshRight" @click="handleRevoke(scope.row)"
            v-hasPermi="['business:maintenance:approve']"
            v-if="scope.row.approvalStatus !== 'pending' && canRevoke(scope.row)">{{ $t('business.maintenance.action.revoke') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 查看详情对话框 -->
    <el-dialog :title="$t('business.maintenance.message.detailTitle')" v-model="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('business.maintenance.field.planNo')">{{ currentPlan.planNo }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.title')">{{ currentPlan.title }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.floor')">{{ getFloorLabel(currentPlan.floor) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.version')">{{ currentPlan.version }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopCategory')">
          <dict-tag :options="mop_category" :value="currentPlan.mopCategory" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionCycle')">{{ currentPlan.executionCycle }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.applicant')">{{ currentPlan.applicantName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.submitTime')">{{ parseTime(currentPlan.submitTime) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopName')" :span="2">{{ currentPlan.mopName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopPurpose')" :span="2">{{ currentPlan.mopPurpose }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.notifyUsers')" :span="2">
          <el-tag v-for="userId in currentPlan.notifyUsers" :key="userId" style="margin-right: 5px">
            {{ getUserName(userId) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.tools')" :span="2">{{ currentPlan.tools }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.materials')" :span="2">{{ currentPlan.materials }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.safety')" :span="2">{{ currentPlan.safety }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.specialTools')" :span="2">{{ currentPlan.specialTools }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.steps')" :span="2">
          <div v-html="currentPlan.steps"></div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.inspectionResult')" :span="2">{{ currentPlan.inspectionResult || $t('business.maintenance.status.pending') }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.remark')" :span="2">{{ currentPlan.remark }}</el-descriptions-item>
      </el-descriptions>

      <!-- 审批历史 -->
      <el-divider content-position="left">{{ $t('business.maintenance.message.approvalHistory') }}</el-divider>
      <el-timeline>
        <el-timeline-item v-for="(log, index) in approvalHistory" :key="index" :timestamp="parseTime(log.createTime)"
          placement="top" :type="getHistoryType(log.action)">
          <div>
            <span style="font-weight: bold">{{ log.userName }}</span>
            <span style="margin: 0 10px">{{ getActionLabel(log.action) }}</span>
            <el-tag :type="getHistoryType(log.action)" size="small">{{ getActionLabel(log.action) }}</el-tag>
          </div>
          <div v-if="log.comment" style="margin-top: 5px; color: #909399">
            {{ $t('business.maintenance.field.comment') }}：{{ log.comment }}
          </div>
        </el-timeline-item>
      </el-timeline>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">{{ $t('business.maintenance.action.close') }}</el-button>
          <el-button type="success" @click="handleApprove(currentPlan)" v-if="currentPlan.approvalStatus === 'pending'"
            v-hasPermi="['business:maintenance:approve']">{{ $t('business.maintenance.action.pass') }}</el-button>
          <el-button type="danger" @click="handleReject(currentPlan)" v-if="currentPlan.approvalStatus === 'pending'"
            v-hasPermi="['business:maintenance:approve']">{{ $t('business.maintenance.action.reject') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog :title="approvalTitle" v-model="approvalOpen" width="500px" append-to-body>
      <el-form ref="approvalRef" :model="approvalForm" :rules="approvalRules" label-width="80px">
        <el-form-item :label="$t('business.maintenance.field.result')" v-if="!isBatch">
          <el-radio-group v-model="approvalForm.result" :disabled="true">
            <el-radio label="approved">{{ $t('business.maintenance.action.pass') }}</el-radio>
            <el-radio label="rejected">{{ $t('business.maintenance.action.reject') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.comment')" prop="comment">
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputComment')" maxlength="200"
            show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.notifyMethod')" v-if="approvalForm.result === 'approved'">
          <el-checkbox-group v-model="approvalForm.notifyTypes">
            <el-checkbox label="system">{{ $t('business.maintenance.notifyType.system') }}</el-checkbox>
            <el-checkbox label="email">{{ $t('business.maintenance.notifyType.email') }}</el-checkbox>
            <el-checkbox label="sms">{{ $t('business.maintenance.notifyType.sms') }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitApproval">{{ $t('business.maintenance.message.confirm') }}</el-button>
          <el-button @click="approvalOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaintenanceApproval">
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { listMaintenance, approvePlan, rejectPlan, revokeApproval, getApprovalHistory } from "@/api/business/maintenance";
import { listUser } from "@/api/system/user";
import { parseTime } from '@/utils/ruoyi'

const { t } = useI18n()
const { proxy } = getCurrentInstance();

const approvalList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const detailOpen = ref(false);
const approvalOpen = ref(false);
const approvalTitle = ref("");
const currentPlan = ref({});
const approvalHistory = ref([]);
const userList = ref([]);
const isBatch = ref(false);

// 字典数据
const { mop_category, approval_status } = proxy.useDict('mop_category', 'approval_status');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    floor: undefined,
    mopCategory: undefined,
    approvalStatus: 'pending' // 默认显示待审批
  },
  approvalForm: {
    planIds: [],
    result: 'approved',
    comment: '',
    notifyTypes: ['system']
  }
});

const { queryParams, approvalForm } = toRefs(data);

// 表单验证
const approvalRules = {
  comment: [
    { required: true, message: t('business.maintenance.validation.commentRequired'), trigger: "blur" },
    { min: 5, max: 200, message: t('business.maintenance.validation.commentLength'), trigger: "blur" }
  ]
};

/** 查询待审批列表 */
function getList() {
  loading.value = true;
  listMaintenance(queryParams.value).then(response => {
    approvalList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取楼层标签 */
function getFloorLabel(floor) {
  const labels = {
    '1': t('business.maintenance.floor.floor1'),
    '2': t('business.maintenance.floor.floor2'),
    '3': t('business.maintenance.floor.floor3'),
    '4': t('business.maintenance.floor.floor4'),
    'all': t('business.maintenance.floor.allFloors')
  };
  return labels[floor] || floor;
}

/** 判断是否紧急 */
function isUrgent(row) {
  // 紧急维修或超过3天未审批
  if (row.mopCategory === 'emergency') return true;
  if (row.submitTime) {
    const days = Math.floor((new Date() - new Date(row.submitTime)) / (1000 * 60 * 60 * 24));
    return days > 3;
  }
  return false;
}

/** 判断是否可撤回 */
function canRevoke(row) {
  // 24小时内的审批可以撤回
  if (row.approvalTime) {
    const hours = Math.floor((new Date() - new Date(row.approvalTime)) / (1000 * 60 * 60));
    return hours < 24;
  }
  return false;
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.approvalStatus = 'pending';
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.planId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 查看详情 */
function handleView(row) {
  currentPlan.value = row;
  detailOpen.value = true;
  // 加载审批历史
  getApprovalHistory(row.planId).then(response => {
    approvalHistory.value = response.rows;
  });
}

/** 通过审批 */
function handleApprove(row) {
  isBatch.value = false;
  approvalForm.value = {
    planIds: [row.planId],
    result: 'approved',
    comment: t('business.maintenance.message.agreeToExecute'),
    notifyTypes: ['system']
  };
  approvalTitle.value = t('business.maintenance.message.approvePlan', { title: row.title });
  approvalOpen.value = true;
}

/** 拒绝审批 */
function handleReject(row) {
  isBatch.value = false;
  approvalForm.value = {
    planIds: [row.planId],
    result: 'rejected',
    comment: '',
    notifyTypes: ['system']
  };
  approvalTitle.value = t('business.maintenance.message.rejectPlan', { title: row.title });
  approvalOpen.value = true;
}

/** 批量通过 */
function handleBatchApprove() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning(t('business.maintenance.message.selectPlansFirst'));
    return;
  }
  isBatch.value = true;
  approvalForm.value = {
    planIds: ids.value,
    result: 'approved',
    comment: t('business.maintenance.message.batchApprovalPassed'),
    notifyTypes: ['system']
  };
  approvalTitle.value = t('business.maintenance.message.batchApprovePlans', { count: ids.value.length });
  approvalOpen.value = true;
}

/** 批量拒绝 */
function handleBatchReject() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning(t('business.maintenance.message.selectPlansFirst'));
    return;
  }
  isBatch.value = true;
  approvalForm.value = {
    planIds: ids.value,
    result: 'rejected',
    comment: '',
    notifyTypes: ['system']
  };
  approvalTitle.value = t('business.maintenance.message.batchRejectPlans', { count: ids.value.length });
  approvalOpen.value = true;
}

/** 撤回审批 */
function handleRevoke(row) {
  proxy.$modal.confirm(t('business.maintenance.message.confirmRevokeApproval')).then(() => {
    return revokeApproval(row.planId);
  }).then(() => {
    proxy.$modal.msgSuccess(t('business.maintenance.message.revokeSuccess'));
    getList();
  }).catch(() => { });
}

/** 提交审批 */
function submitApproval() {
  proxy.$refs["approvalRef"].validate(valid => {
    if (valid) {
      const isApprove = approvalForm.value.result === 'approved';
      const promise = isApprove
        ? approvePlan(approvalForm.value.planIds, approvalForm.value.comment, approvalForm.value.notifyTypes)
        : rejectPlan(approvalForm.value.planIds, approvalForm.value.comment);

      promise.then(_response => {
        proxy.$modal.msgSuccess(isApprove ? t('business.maintenance.message.approvalPassed') : t('business.maintenance.message.approvalRejected'));
        approvalOpen.value = false;
        detailOpen.value = false;
        getList();
      });
    }
  });
}

/** 获取用户名称 */
function getUserName(userId) {
  const user = userList.value.find(u => u.userId === userId);
  return user ? user.nickName : userId;
}

/** 获取操作标签 */
function getActionLabel(action) {
  const labels = {
    submit: t('business.maintenance.approveAction.submit'),
    approved: t('business.maintenance.approveAction.approve'),
    rejected: t('business.maintenance.approveAction.reject'),
    revoked: t('business.maintenance.action.revoke')
  };
  return labels[action] || action;
}

/** 获取历史类型 */
function getHistoryType(action) {
  const types = {
    submit: 'primary',
    approved: 'success',
    rejected: 'danger',
    revoked: 'warning'
  };
  return types[action] || 'info';
}

/** 获取用户列表 */
function getUserList() {
  listUser({ status: '0' }).then(response => {
    userList.value = response.rows;
  });
}

// 初始化
onMounted(() => {
  getList();
  getUserList();
});
</script>

<style lang="scss" scoped></style>
