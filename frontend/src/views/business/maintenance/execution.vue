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
      <el-form-item :label="$t('business.maintenance.field.executionStatus')" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" :placeholder="$t('business.maintenance.placeholder.selectStatus')" clearable>
          <el-option v-for="dict in execution_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.maintenance.field.planTime')">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" :range-separator="$t('business.maintenance.message.to')"
          :start-placeholder="$t('business.maintenance.placeholder.startDate')" :end-placeholder="$t('business.maintenance.placeholder.endDate')" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.maintenance.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.maintenance.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="VideoPlay" :disabled="multiple" @click="handleBatchExecute"
          v-hasPermi="['business:maintenance:execute']">{{ $t('business.maintenance.action.execute') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">{{ $t('business.maintenance.action.export') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Document" @click="handleReport">{{ $t('business.maintenance.action.generateTable') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="executionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('business.maintenance.field.planNo')" align="center" prop="executionNo" width="120" />
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
      <el-table-column :label="$t('business.maintenance.field.executorId')" align="center" prop="executorName" width="100" />
      <el-table-column :label="$t('business.maintenance.field.planTime')" align="center" prop="planExecutionTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.planExecutionTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.nextExecutionTime')" align="center" prop="actualExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.actualExecutionTime">
            {{ parseTime(scope.row.actualExecutionTime) }}
            <el-tag v-if="isDelayed(scope.row)" type="warning" size="small">{{ $t('business.maintenance.message.upcomingDue') }}</el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.executionStatus')" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <dict-tag :options="execution_status" :value="scope.row.executionStatus" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.field.executionResult')" align="center" prop="executionResult" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.executionResult === 'normal'" type="success">{{ $t('business.maintenance.priority.normal') }}</el-tag>
          <el-tag v-else-if="scope.row.executionResult === 'abnormal'" type="danger">{{ $t('business.maintenance.priority.urgent') }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.maintenance.message.operation')" align="center" class-name="small-padding fixed-width" width="220">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">{{ $t('business.maintenance.action.view') }}</el-button>
          <el-button v-if="scope.row.executionStatus === 'pending'" link type="success" icon="VideoPlay"
            @click="handleExecute(scope.row)" v-hasPermi="['business:maintenance:execute']">{{ $t('business.maintenance.action.execute') }}</el-button>
          <el-button v-if="scope.row.executionStatus === 'executing'" link type="warning" icon="Check"
            @click="handleComplete(scope.row)" v-hasPermi="['business:maintenance:execute']">{{ $t('business.maintenance.action.completeExecution') }}</el-button>
          <el-button v-if="scope.row.executionResult === 'abnormal'" link type="danger" icon="Tickets"
            @click="handleCreateTicket(scope.row)" v-hasPermi="['business:ticket:add']">{{ $t('business.maintenance.action.generateTicket') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 执行记录对话框 -->
    <el-dialog :title="dialogTitle" v-model="executeOpen" width="700px" append-to-body>
      <el-form ref="executeRef" :model="executeForm" :rules="executeRules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.executorId')" prop="executorId">
              <el-select v-model="executeForm.executorId" :placeholder="$t('business.maintenance.placeholder.selectExecutor')">
                <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.planTime')" prop="executionTime">
              <el-date-picker v-model="executeForm.executionTime" type="datetime" :placeholder="$t('business.maintenance.placeholder.select')"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('business.maintenance.field.executionResult')" prop="executionResult">
          <el-radio-group v-model="executeForm.executionResult">
            <el-radio label="normal">{{ $t('business.maintenance.priority.normal') }}</el-radio>
            <el-radio label="abnormal">{{ $t('business.maintenance.priority.urgent') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.comment')" v-if="executeForm.executionResult === 'abnormal'" prop="abnormalDescription">
          <el-input v-model="executeForm.abnormalDescription" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputComment')"
            maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.message.executionRecord')" prop="executionRecord">
          <el-input v-model="executeForm.executionRecord" type="textarea" :rows="4" :placeholder="$t('business.maintenance.placeholder.inputResult')"
            maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.attachments')">
          <image-upload v-model="executeForm.photos" :limit="6" />
        </el-form-item>
        <el-form-item :label="$t('business.maintenance.field.attachments')">
          <file-upload v-model="executeForm.attachments" :limit="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitExecute">{{ $t('business.maintenance.message.confirm') }}</el-button>
          <el-button @click="executeOpen = false">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog :title="$t('business.maintenance.message.executionRecord')" v-model="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('business.maintenance.field.planNo')">{{ currentRecord.executionNo }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.title')">{{ currentRecord.title }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.floor')">{{ getFloorLabel(currentRecord.floor) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.version')">{{ currentRecord.version }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.mopCategory')">
          <dict-tag :options="mop_category" :value="currentRecord.mopCategory" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executorId')">{{ currentRecord.executorName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.planTime')">{{ parseTime(currentRecord.planExecutionTime) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.nextExecutionTime')">
          {{ parseTime(currentRecord.actualExecutionTime) || $t('business.maintenance.message.noData') }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionStatus')">
          <dict-tag :options="execution_status" :value="currentRecord.executionStatus" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.executionResult')">
          <el-tag :type="currentRecord.executionResult === 'normal' ? 'success' : 'danger'">
            {{ currentRecord.executionResult === 'normal' ? $t('business.maintenance.priority.normal') : $t('business.maintenance.priority.urgent') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.message.executionRecord')" :span="2">{{ currentRecord.executionRecord }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.comment')" :span="2" v-if="currentRecord.abnormalDescription">
          <el-alert :title="currentRecord.abnormalDescription" type="warning" :closable="false" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.attachments')" :span="2" v-if="currentRecord.photos && currentRecord.photos.length > 0">
          <image-preview :src-list="currentRecord.photos" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.maintenance.field.attachments')" :span="2"
          v-if="currentRecord.attachments && currentRecord.attachments.length > 0">
          <div v-for="(file, index) in currentRecord.attachments" :key="index">
            <el-link type="primary" :href="file.url" target="_blank">{{ file.name }}</el-link>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行步骤检查清单 -->
      <el-divider content-position="left">{{ $t('business.maintenance.field.steps') }}</el-divider>
      <el-table :data="currentRecord.checkList" v-if="currentRecord.checkList">
        <el-table-column :label="$t('business.maintenance.message.importRowNo')" type="index" width="60" align="center" />
        <el-table-column :label="$t('business.maintenance.field.title')" prop="item" />
        <el-table-column :label="$t('business.maintenance.field.remark')" prop="standard" />
        <el-table-column :label="$t('business.maintenance.field.executionResult')" prop="result" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.result === 'pass' ? 'success' : 'danger'">
              {{ scope.row.result === 'pass' ? $t('business.maintenance.message.passed') : $t('business.maintenance.message.refused') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('business.maintenance.field.remark')" prop="remark" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">{{ $t('business.maintenance.action.close') }}</el-button>
          <el-button type="primary" @click="handlePrint">{{ $t('business.maintenance.action.print') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaintenanceExecution">
import { listExecution, getExecution, startExecution, completeExecution, createTicketFromExecution } from "@/api/business/maintenance";
import { listUser } from "@/api/system/user";
import ImageUpload from '@/components/ImageUpload';
import FileUpload from '@/components/FileUpload';
import ImagePreview from '@/components/ImagePreview';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance();
const router = useRouter();
const { t } = useI18n();

const executionList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const executeOpen = ref(false);
const detailOpen = ref(false);
const dialogTitle = ref("");
const currentRecord = ref({});
const userList = ref([]);

// 字典数据
const { mop_category, execution_status } = proxy.useDict('mop_category', 'execution_status');

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    floor: undefined,
    executionStatus: undefined
  },
  executeForm: {
    executionId: undefined,
    planId: undefined,
    executorId: undefined,
    executionTime: undefined,
    executionResult: 'normal',
    abnormalDescription: '',
    executionRecord: '',
    photos: [],
    attachments: []
  }
});

const { queryParams, executeForm } = toRefs(data);

// 表单验证
const executeRules = {
  executorId: [
    { required: true, message: t('business.maintenance.placeholder.selectExecutor'), trigger: "change" }
  ],
  executionTime: [
    { required: true, message: t('business.maintenance.placeholder.select'), trigger: "change" }
  ],
  executionResult: [
    { required: true, message: t('business.maintenance.placeholder.inputResult'), trigger: "change" }
  ],
  executionRecord: [
    { required: true, message: t('business.maintenance.placeholder.inputResult'), trigger: "blur" },
    { min: 10, max: 1000, message: t('business.maintenance.validation.commentLength'), trigger: "blur" }
  ],
  abnormalDescription: [
    { required: true, message: t('business.maintenance.placeholder.inputComment'), trigger: "blur" }
  ]
};

/** 查询执行列表 */
function getList() {
  loading.value = true;
  let params = proxy.addDateRange(queryParams.value, dateRange.value);
  listExecution(params).then(response => {
    executionList.value = response.rows;
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

/** 判断是否延期 */
function isDelayed(row) {
  if (!row.actualExecutionTime || !row.planExecutionTime) return false;
  return new Date(row.actualExecutionTime) > new Date(row.planExecutionTime);
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
  ids.value = selection.map(item => item.executionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 查看详情 */
function handleView(row) {
  getExecution(row.executionId).then(response => {
    currentRecord.value = response.data;
    detailOpen.value = true;
  });
}

/** 执行操作 */
function handleExecute(row) {
  reset();
  executeForm.value.planId = row.planId;
  executeForm.value.executionId = row.executionId;
  executeForm.value.executionTime = new Date();
  dialogTitle.value = t('business.maintenance.action.execute') + '：' + row.title;
  executeOpen.value = true;
}

/** 完成操作 */
function handleComplete(row) {
  reset();
  getExecution(row.executionId).then(_response => {
    executeForm.value = _response.data;
    dialogTitle.value = t('business.maintenance.action.completeExecution') + '：' + row.title;
    executeOpen.value = true;
  });
}

/** 批量执行 */
function handleBatchExecute() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning(t('business.maintenance.message.selectPlansFirst'));
    return;
  }
  proxy.$modal.confirm(t('business.maintenance.message.batchApprovePlans', { count: ids.value.length })).then(() => {
    // 批量执行逻辑
    proxy.$modal.msgSuccess(t('business.maintenance.message.executeSuccess'));
    getList();
  }).catch(() => { });
}

/** 提交执行记录 */
function submitExecute() {
  proxy.$refs["executeRef"].validate(valid => {
    if (valid) {
      if (executeForm.value.executionId) {
        // 完成执行
        completeExecution(executeForm.value).then(_response => {
          proxy.$modal.msgSuccess(t('business.maintenance.message.submitResultSuccess'));
          executeOpen.value = false;
          getList();
        });
      } else {
        // 开始执行
        startExecution(executeForm.value).then(_response => {
          proxy.$modal.msgSuccess(t('business.maintenance.message.executeSuccess'));
          executeOpen.value = false;
          getList();
        });
      }
    }
  });
}

/** 生成工单 */
function handleCreateTicket(row) {
  proxy.$modal.confirm(t('business.maintenance.message.confirmGenerateTicket')).then(() => {
    return createTicketFromExecution(row.executionId);
  }).then(() => {
    proxy.$modal.msgSuccess(t('business.maintenance.message.generateTicketSuccess'));
    router.push('/business/ticket');
  }).catch(() => { });
}

/** 生成报告 */
function handleReport() {
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  proxy.download('business/maintenance/execution/report', params, `execution_report_${new Date().getTime()}.pdf`);
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/maintenance/execution/export', {
    ...queryParams.value
  }, `execution_${new Date().getTime()}.xlsx`)
}

/** 打印 */
function handlePrint() {
  window.print();
}

/** 重置表单 */
function reset() {
  executeForm.value = {
    executionId: undefined,
    planId: undefined,
    executorId: undefined,
    executionTime: undefined,
    executionResult: 'normal',
    abnormalDescription: '',
    executionRecord: '',
    photos: [],
    attachments: []
  };
  proxy.resetForm("executeRef");
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