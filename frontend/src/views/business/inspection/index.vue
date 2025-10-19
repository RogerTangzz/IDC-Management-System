<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item :label="$t('business.inspection.field.floor')" prop="floor">
        <el-select v-model="queryParams.floor" :placeholder="$t('business.inspection.placeholder.selectFloor')" clearable>
          <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.inspection.field.inspectorName')" prop="inspectorName">
        <el-input v-model="queryParams.inspectorName" :placeholder="$t('business.inspection.placeholder.inputInspector')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('business.inspection.field.inspectionDate')">
        <el-date-picker v-model="dateRange" type="daterange" :range-separator="$t('business.inspection.dateRange.to')" :start-placeholder="$t('business.inspection.placeholder.startDate')" :end-placeholder="$t('business.inspection.placeholder.endDate')" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item :label="$t('business.inspection.field.status')" prop="hasAnomaly">
        <el-select v-model="queryParams.hasAnomaly" :placeholder="$t('business.inspection.placeholder.selectStatus')" clearable>
          <el-option :label="$t('business.inspection.anomaly.hasAnomaly')" :value="1" />
          <el-option :label="$t('business.inspection.anomaly.noAnomaly')" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.inspection.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.inspection.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:inspection:add']">{{ $t('business.inspection.action.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="DocumentCopy" @click="handleCopyLast"
          v-hasPermi="['business:inspection:add']">{{ $t('business.inspection.action.copyLast') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:inspection:remove']">{{ $t('business.inspection.action.batchDelete') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:inspection:export']">{{ $t('business.inspection.action.export') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="DataAnalysis" @click="handleStatistics">{{ $t('business.inspection.action.statistics') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

   <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="inspectionList"
      @selection-change="handleSelectionChange"
      :row-class-name="rowClassName"
      @sort-change="handleSortChange"
      :default-sort="{ prop: 'inspectionDate', order: 'descending' }"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('business.inspection.field.inspectionNo')" align="center" prop="inspectionNo" width="120" />
      <el-table-column :label="$t('business.inspection.field.floor')" align="center" prop="floor" width="80" />
      <el-table-column :label="$t('business.inspection.field.inspectorName')" align="center" prop="inspectorName" width="100" />
      <el-table-column :label="$t('business.inspection.field.relayPerson')" align="center" prop="relayPerson" width="100" />
      <el-table-column :label="$t('business.inspection.field.inspectionDate')" align="center" prop="inspectionDate" width="110">
        <template #default="scope">
          {{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.field.progress')" align="center" prop="progress" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :width="70" :stroke-width="6"
            :color="scope.row.progress === 100 ? '#67c23a' : '#409eff'" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.field.anomalyCount')" align="center" prop="anomalyCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.anomalyCount > 0" type="danger">
            {{ $t('business.inspection.message.itemCount', { count: scope.row.anomalyCount }) }}
          </el-tag>
          <el-tag v-else type="success">{{ $t('business.inspection.message.noAnomalyFound') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.field.ticketCount')" align="center" prop="ticketCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.ticketCount > 0" type="warning">
            {{ scope.row.ticketCount }} {{ $t('business.inspection.message.ticketCountSuffix') }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.field.isCopied')" align="center" prop="isCopied" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.isCopied === 'Y'" type="info">{{ $t('business.inspection.message.copied') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.inspection.field.remark')" align="left" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('business.inspection.field.createTime')" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:inspection:query']">{{ $t('business.inspection.action.view') }}</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:inspection:edit']" v-if="scope.row.progress < 100">{{ $t('business.inspection.action.edit') }}</el-button>
          <el-button link type="success" icon="DocumentCopy" @click="handleCopy(scope.row)"
            v-hasPermi="['business:inspection:add']">{{ $t('business.inspection.action.copy') }}</el-button>
          <el-button link type="warning" icon="Tickets" @click="handleGenerateTickets(scope.row)"
            :loading="generatingInspectionId === scope.row.inspectionId"
            :disabled="generatingInspectionId === scope.row.inspectionId" v-hasPermi="['business:inspection:add']"
            v-if="scope.row.anomalyCount > 0 && scope.row.ticketCount === 0">{{ $t('business.inspection.action.generateTickets') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    	<!-- 统计弹窗 -->
    <el-dialog :title="$t('business.inspection.message.inspectionStatistics')" v-model="statisticsOpen" width="800px" append-to-body>
      <div class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic :title="$t('business.inspection.message.monthInspectionCount')" :value="statistics.monthCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('business.inspection.message.monthAnomalyCount')" :value="statistics.monthAnomalyCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('business.inspection.message.anomalyHandleRate')" :value="statistics.handleRate" suffix="%" />
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statisticsOpen = false">{{ $t('business.inspection.action.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Inspection">
import { listInspection, delInspection, getInspection, generateTickets } from '@/api/business/inspection';
import anomalyService from '@/utils/business/inspectionAnomaly.js'
import { FLOORS } from "./constants";
import { parseTime } from '@/utils/ruoyi'
import { useI18n } from 'vue-i18n'
import { withMineOnly } from '@/utils/business/mineOnly'
import { ref, reactive, toRefs, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'

const { t } = useI18n()
const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();


// 管理员权限判断
const isAdmin = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('ROLE_ADMIN')
});

const inspectionList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const statisticsOpen = ref(false);


// 当前正在生成工单的巡检ID(行内按钮loading禁用)
const generatingInspectionId = ref(null)
const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      floor: undefined,
      inspectorName: undefined,
      hasAnomaly: undefined,
      orderByColumn: undefined,
      isAsc: undefined
    },
  statistics: {
    monthCount: 0,
    monthAnomalyCount: 0,
    handleRate: 0
  }
});

const { queryParams, statistics } = toRefs(data);

	/** 查询巡检列表 */
function getList() {
  loading.value = true;

  // 构建基础查询参数(包含日期范围)
  let baseParams = proxy.addDateRange(queryParams.value, dateRange.value);

  // 应用 mineOnly 权限过滤:非管理员只能看到自己相关的巡检
  const finalParams = withMineOnly(baseParams, isAdmin.value);

  listInspection(finalParams).then(response => {
    inspectionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 表单参数重置
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
  ids.value = selection.map(item => item.inspectionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 排序变更操作 */
function handleSortChange({ prop, order }) {
  queryParams.value.orderByColumn = prop;
  queryParams.value.isAsc = order === 'ascending' ? 'asc' : (order === 'descending' ? 'desc' : undefined);
  getList();
}

/** 新增按钮操作 */
function handleAdd() {
  router.push('/business/inspection/create');
}

/** 复制上次巡检按钮操作 */
function handleCopyLast() {
// 查找最近完成的巡检记录
  const lastCompleted = inspectionList.value
    .filter(item => item.status === 'completed')
    .sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate))[0];

  if (lastCompleted) {
    router.push('/business/inspection/create?copy=' + lastCompleted.inspectionId);
  } else {
    proxy.$modal.msgWarning(t('business.inspection.message.noCompletedInspection'));
  }
}

/** 查看详情按钮操作 */
function handleView(row) {
  router.push('/business/inspection/detail/' + row.inspectionId);
}

/** 编辑按钮操作 */
function handleUpdate(row) {
  router.push('/business/inspection/edit/' + row.inspectionId);
}

/** 复制按钮操作 */
function handleCopy(row) {
  proxy.$modal.confirm(t('business.inspection.message.confirmCopy')).then(function () {
    router.push('/business/inspection/create?copy=' + row.inspectionId);
  }).catch(() => { });
}

/** 生成工单按钮操作(废弃方法) */
function handleGenerateTicketsObsolete(row) {
  proxy.$modal.confirm(t('business.inspection.message.confirmGenerateTickets', { count: row.anomalyCount })).then(function () {
    const __count = Number(row.anomalyCount || 0);
    const __anomalies = Array.isArray(row.anomalies) && row.anomalies.length
      ? row.anomalies
      : Array.from({ length: __count }).map((_, i) => ({ itemName: t('business.inspection.message.inspectionItem', { index: i + 1 }), value: '-', priority: 'low' }));
    return generateTickets(row.inspectionId, __anomalies);
  }).then((resp) => {
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    row.ticketCount = (row.ticketCount || 0) + n
    proxy.$modal.msgSuccess(t('business.inspection.message.generateTicketsSuccess', { count: n }))
  }).catch(() => { });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const inspectionIds = row?.inspectionId ?? ids.value;
  const payload = Array.isArray(inspectionIds) ? inspectionIds.join(',') : inspectionIds;
  proxy.$modal.confirm(t('business.inspection.message.confirmDelete', { id: inspectionIds })).then(function () {
    return delInspection(payload);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(t('business.inspection.message.deleteSuccess'));
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
// 构建基础参数(包含日期范围)
  const baseParams = proxy.addDateRange({ ...queryParams.value }, dateRange.value)

  // 应用 mineOnly 权限过滤:非管理员只能导出自己相关的巡检
  const finalParams = withMineOnly(baseParams, isAdmin.value)

  proxy.download('business/inspection/export', finalParams, `inspection_${new Date().getTime()}.xlsx`)
}

/** 统计分析按钮操作 */
function handleStatistics() {
// 模拟统计数据,实际应该从后端获取
  statistics.value = {
    monthCount: 45,
    monthAnomalyCount: 23,
    handleRate: 87.5
  };
  statisticsOpen.value = true;
}

// 工具函数:获取楼层标签
// 生成工单
async function handleGenerateTickets(row) {
  if (!row || !row.inspectionId) return
  const count = Number(row.anomalyCount || 0)
  if (count <= 0) { proxy.$modal.msgWarning(t('business.inspection.message.noAnomalyToGenerate')); return }
  try { await proxy.$modal.confirm(t('business.inspection.message.confirmGenerateTickets', { count })) } catch { return }
  let anomalies = []
  generatingInspectionId.value = row.inspectionId
  try {
    const detail = await getInspection(row.inspectionId)
    const data = detail?.data || row
    anomalies = anomalyService.detectAnomalies({ floor: data.floor, items: data.items })
  } catch (e) { console.warn(t('business.inspection.message.loadDetailFailed'), e) }
  if (!Array.isArray(anomalies) || anomalies.length === 0) {
    anomalies = Array.from({ length: count }).map((_, i) => ({ itemName: t('business.inspection.message.inspectionItem', { index: i + 1 }), value: '-', priority: 'low' }))
  }
  try {
    const resp = await generateTickets(row.inspectionId, anomalies)
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    proxy.$modal.msgSuccess(t('business.inspection.message.generateTicketsSuccess', { count: n }))
    if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
      try { await proxy.$modal.confirm(t('business.inspection.message.confirmViewTicket')); router.push('/business/ticket/detail/' + created[0].ticketId) }
      catch { router.push('/business/ticket/list') }
    } else { router.push('/business/ticket/list') }
  } catch (e) { console.error(e) } finally { generatingInspectionId.value = null }
}

/** 表格行样式(异常行高亮显示) */
function rowClassName({ row }) {
  if (row && Number(row.anomalyCount) > 0) return 'danger-row'
  if (row && Number(row.progress || 0) < 100) return 'warning-row'
  return ''
}

getList();
</script>

<style lang="scss" scoped>
:deep(.el-table .warning-row) {
  background: #fdf6ec;
}

:deep(.el-table .danger-row) {
  background: #fef0f0;
}

.statistics-content {
  padding: 20px 0;
}
</style>
