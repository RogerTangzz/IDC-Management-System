<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划标题" prop="title">
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
      <el-form-item label="执行状态" prop="executionStatus">
        <el-select v-model="queryParams.executionStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in execution_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="VideoPlay" :disabled="multiple" @click="handleBatchExecute"
          v-hasPermi="['business:maintenance:execute']">批量执行</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:maintenance:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Document" @click="handleReport">生成报告</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="executionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="执行编号" align="center" prop="executionNo" width="120" />
      <el-table-column label="计划标题" align="left" prop="title" :show-overflow-tooltip="true" />
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
      <el-table-column label="执行人" align="center" prop="executorName" width="100" />
      <el-table-column label="计划时间" align="center" prop="planExecutionTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.planExecutionTime) }}
        </template>
      </el-table-column>
      <el-table-column label="实际执行时间" align="center" prop="actualExecutionTime" width="160">
        <template #default="scope">
          <span v-if="scope.row.actualExecutionTime">
            {{ parseTime(scope.row.actualExecutionTime) }}
            <el-tag v-if="isDelayed(scope.row)" type="warning" size="small">延期</el-tag>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" prop="executionStatus" width="100">
        <template #default="scope">
          <dict-tag :options="execution_status" :value="scope.row.executionStatus" />
        </template>
      </el-table-column>
      <el-table-column label="执行结果" align="center" prop="executionResult" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.executionResult === 'normal'" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.executionResult === 'abnormal'" type="danger">异常</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:maintenance:query']">查看</el-button>
          <el-button v-if="scope.row.executionStatus === 'pending'" link type="success" icon="VideoPlay"
            @click="handleExecute(scope.row)" v-hasPermi="['business:maintenance:execute']">执行</el-button>
          <el-button v-if="scope.row.executionStatus === 'executing'" link type="warning" icon="Check"
            @click="handleComplete(scope.row)" v-hasPermi="['business:maintenance:execute']">完成</el-button>
          <el-button v-if="scope.row.executionResult === 'abnormal'" link type="danger" icon="Tickets"
            @click="handleCreateTicket(scope.row)" v-hasPermi="['business:ticket:add']">生成工单</el-button>
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
            <el-form-item label="执行人" prop="executorId">
              <el-select v-model="executeForm.executorId" placeholder="请选择执行人">
                <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行时间" prop="executionTime">
              <el-date-picker v-model="executeForm.executionTime" type="datetime" placeholder="选择执行时间"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="执行情况" prop="executionResult">
          <el-radio-group v-model="executeForm.executionResult">
            <el-radio label="normal">正常</el-radio>
            <el-radio label="abnormal">异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="异常描述" v-if="executeForm.executionResult === 'abnormal'" prop="abnormalDescription">
          <el-input v-model="executeForm.abnormalDescription" type="textarea" :rows="3" placeholder="请描述异常情况"
            maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="执行记录" prop="executionRecord">
          <el-input v-model="executeForm.executionRecord" type="textarea" :rows="4" placeholder="请输入执行记录"
            maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="现场照片">
          <image-upload v-model="executeForm.photos" :limit="6" />
        </el-form-item>
        <el-form-item label="附件">
          <file-upload v-model="executeForm.attachments" :limit="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitExecute">确 定</el-button>
          <el-button @click="executeOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="执行记录详情" v-model="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="执行编号">{{ currentRecord.executionNo }}</el-descriptions-item>
        <el-descriptions-item label="计划标题">{{ currentRecord.title }}</el-descriptions-item>
        <el-descriptions-item label="楼层">{{ getFloorLabel(currentRecord.floor) }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentRecord.version }}</el-descriptions-item>
        <el-descriptions-item label="MOP类别">
          <dict-tag :options="mop_category" :value="currentRecord.mopCategory" />
        </el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentRecord.executorName }}</el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ parseTime(currentRecord.planExecutionTime) }}</el-descriptions-item>
        <el-descriptions-item label="实际执行时间">
          {{ parseTime(currentRecord.actualExecutionTime) || '未执行' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <dict-tag :options="execution_status" :value="currentRecord.executionStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag :type="currentRecord.executionResult === 'normal' ? 'success' : 'danger'">
            {{ currentRecord.executionResult === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行记录" :span="2">{{ currentRecord.executionRecord }}</el-descriptions-item>
        <el-descriptions-item label="异常描述" :span="2" v-if="currentRecord.abnormalDescription">
          <el-alert :title="currentRecord.abnormalDescription" type="warning" :closable="false" />
        </el-descriptions-item>
        <el-descriptions-item label="现场照片" :span="2" v-if="currentRecord.photos && currentRecord.photos.length > 0">
          <image-preview :src-list="currentRecord.photos" />
        </el-descriptions-item>
        <el-descriptions-item label="附件" :span="2"
          v-if="currentRecord.attachments && currentRecord.attachments.length > 0">
          <div v-for="(file, index) in currentRecord.attachments" :key="index">
            <el-link type="primary" :href="file.url" target="_blank">{{ file.name }}</el-link>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 执行步骤检查清单 -->
      <el-divider content-position="left">执行步骤检查</el-divider>
      <el-table :data="currentRecord.checkList" v-if="currentRecord.checkList">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="检查项" prop="item" />
        <el-table-column label="标准" prop="standard" />
        <el-table-column label="结果" prop="result" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.result === 'pass' ? 'success' : 'danger'">
              {{ scope.row.result === 'pass' ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
          <el-button type="primary" @click="handlePrint">打 印</el-button>
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

const { proxy } = getCurrentInstance();
const router = useRouter();

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
    { required: true, message: "请选择执行人", trigger: "change" }
  ],
  executionTime: [
    { required: true, message: "请选择执行时间", trigger: "change" }
  ],
  executionResult: [
    { required: true, message: "请选择执行情况", trigger: "change" }
  ],
  executionRecord: [
    { required: true, message: "请输入执行记录", trigger: "blur" },
    { min: 10, max: 1000, message: "执行记录长度在 10 到 1000 个字符", trigger: "blur" }
  ],
  abnormalDescription: [
    { required: true, message: "请描述异常情况", trigger: "blur" }
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
    '1': '1楼',
    '2': '2楼',
    '3': '3楼',
    '4': '4楼',
    'all': '全部楼层'
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
  dialogTitle.value = `执行维保计划：${row.title}`;
  executeOpen.value = true;
}

/** 完成操作 */
function handleComplete(row) {
  reset();
  getExecution(row.executionId).then(_response => {
    executeForm.value = _response.data;
    dialogTitle.value = `完成维保计划：${row.title}`;
    executeOpen.value = true;
  });
}

/** 批量执行 */
function handleBatchExecute() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning("请先选择要执行的计划");
    return;
  }
  proxy.$modal.confirm(`确认批量执行 ${ids.value.length} 个维保计划吗？`).then(() => {
    // 批量执行逻辑
    proxy.$modal.msgSuccess("已开始批量执行");
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
          proxy.$modal.msgSuccess("执行记录已保存");
          executeOpen.value = false;
          getList();
        });
      } else {
        // 开始执行
        startExecution(executeForm.value).then(_response => {
          proxy.$modal.msgSuccess("已开始执行");
          executeOpen.value = false;
          getList();
        });
      }
    }
  });
}

/** 生成工单 */
function handleCreateTicket(row) {
  proxy.$modal.confirm('确认根据异常情况生成工单吗？').then(() => {
    return createTicketFromExecution(row.executionId);
  }).then(() => {
    proxy.$modal.msgSuccess("工单生成成功");
    router.push('/business/ticket');
  }).catch(() => { });
}

/** 生成报告 */
function handleReport() {
  const params = proxy.addDateRange(queryParams.value, dateRange.value);
  proxy.download('business/maintenance/execution/report', params, `维保执行报告_${new Date().getTime()}.pdf`);
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