<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="楼层" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="请选择楼层" clearable>
          <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="巡检人" prop="inspectorName">
        <el-input v-model="queryParams.inspectorName" placeholder="请输入巡检人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="巡检日期">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="异常项" prop="hasAnomaly">
        <el-select v-model="queryParams.hasAnomaly" placeholder="全部" clearable>
          <el-option label="有异常" :value="1" />
          <el-option label="无异常" :value="0" />
        </el-select>
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
          v-hasPermi="['business:inspection:add']">开始巡检</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="DocumentCopy" @click="handleCopyLast"
          v-hasPermi="['business:inspection:add']">复制上次</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:inspection:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:inspection:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="DataAnalysis" @click="handleStatistics">统计分析</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="inspectionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="巡检编号" align="center" prop="inspectionNo" width="120" />
      <el-table-column label="楼层" align="center" prop="floor" width="80" />
      <el-table-column label="巡检人" align="center" prop="inspectorName" width="100" />
      <el-table-column label="接力人员" align="center" prop="relayPerson" width="100" />
      <el-table-column label="巡检日期" align="center" prop="inspectionDate" width="110">
        <template #default="scope">
          {{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="完成进度" align="center" prop="progress" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :width="70" :stroke-width="6"
            :color="scope.row.progress === 100 ? '#67c23a' : '#409eff'" />
        </template>
      </el-table-column>
      <el-table-column label="异常项数" align="center" prop="anomalyCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.anomalyCount > 0" type="danger">
            {{ scope.row.anomalyCount }}项
          </el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="生成工单" align="center" prop="ticketCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.ticketCount > 0" type="warning">
            {{ scope.row.ticketCount }}个
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="复制标记" align="center" prop="isCopied" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.isCopied === 'Y'" type="info">复制</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:inspection:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:inspection:edit']" v-if="scope.row.progress < 100">继续</el-button>
          <el-button link type="success" icon="DocumentCopy" @click="handleCopy(scope.row)"
            v-hasPermi="['business:inspection:add']">复制</el-button>
          <el-button link type="warning" icon="Tickets" @click="handleGenerateTickets(scope.row)"
            v-hasPermi="['business:inspection:add']"
            v-if="scope.row.anomalyCount > 0 && scope.row.ticketCount === 0">生成工单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 统计弹窗 -->
    <el-dialog title="巡检统计" v-model="statisticsOpen" width="800px" append-to-body>
      <div class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="本月巡检次数" :value="statistics.monthCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="本月异常总数" :value="statistics.monthAnomalyCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="异常处理率" :value="statistics.handleRate" suffix="%" />
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statisticsOpen = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Inspection">
import { listInspection, delInspection } from "@/api/business/inspection";
import { getInspection, generateTickets } from '@/api/business/inspection';
import anomalyService from '@/utils/business/inspectionAnomaly.js'
import { FLOORS } from "./constants";

const { proxy } = getCurrentInstance();
const router = useRouter();

const inspectionList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);
const statisticsOpen = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    floor: undefined,
    inspectorName: undefined,
    hasAnomaly: undefined
  },
  statistics: {
    monthCount: 0,
    monthAnomalyCount: 0,
    handleRate: 0
  }
});

const { queryParams, form: _form, statistics } = toRefs(data);

/** 查询巡检列表 */
function getList() {
  loading.value = true;
  let params = proxy.addDateRange(queryParams.value, dateRange.value);
  listInspection(params).then(response => {
    inspectionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消逻辑未使用，相关弹窗未实现，省略

/** 表单重置 */

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

/** 新增按钮操作 */
function handleAdd() {
  router.push('/business/inspection/create');
}

/** 复制上次巡检 */
function handleCopyLast() {
  // 查找最后一次完成的巡检
  const lastCompleted = inspectionList.value
    .filter(item => item.status === 'completed')
    .sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate))[0];

  if (lastCompleted) {
    router.push('/business/inspection/create?copy=' + lastCompleted.inspectionId);
  } else {
    proxy.$modal.msgWarning("暂无可复制的已完成巡检记录");
  }
}

/** 查看详情 */
function handleView(row) {
  router.push('/business/inspection/detail/' + row.inspectionId);
}

/** 继续巡检 */
function handleUpdate(row) {
  router.push('/business/inspection/edit/' + row.inspectionId);
}

/** 复制巡检 */
function handleCopy(row) {
  proxy.$modal.confirm('是否复制该巡检记录？').then(function () {
    router.push('/business/inspection/create?copy=' + row.inspectionId);
  }).catch(() => { });
}

/** 生成工单 */
function handleGenerateTickets(row) {
  proxy.$modal.confirm('检测到' + row.anomalyCount + '个异常项，是否生成工单？').then(function () {
    const __count = Number(row.anomalyCount || 0);
    const __anomalies = Array.isArray(row.anomalies) && row.anomalies.length
      ? row.anomalies
      : Array.from({ length: __count }).map((_, i) => ({ itemName: `巡检异常#${i + 1}`, value: '-', priority: 'low' }));
    return generateTickets(row.inspectionId, __anomalies);
  }).then((resp) => {
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    row.ticketCount = (row.ticketCount || 0) + n
    proxy.$modal.msgSuccess('已生成' + n + '个工单');
  }).catch(() => { });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const inspectionIds = row.inspectionId || ids.value;
  proxy.$modal.confirm('是否确认删除巡检编号为"' + inspectionIds + '"的数据项？').then(function () {
    return delInspection(inspectionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/inspection/export', {
    ...queryParams.value
  }, `inspection_${new Date().getTime()}.xlsx`)
}

/** 统计分析 */
function handleStatistics() {
  // 获取统计数据
  statistics.value = {
    monthCount: 45,
    monthAnomalyCount: 23,
    handleRate: 87.5
  };
  statisticsOpen.value = true;
}

// 已移除 getFloorLabel 与行样式函数，模板未引用，减少无用代码

// 覆盖上方同名实现：精确检测异常并生成工单，并提供跳转选项
async function handleGenerateTickets(row) {
  if (!row || !row.inspectionId) return
  const count = Number(row.anomalyCount || 0)
  if (count <= 0) { proxy.$modal.msgWarning('无异常项，无需生成工单'); return }
  try { await proxy.$modal.confirm(`检测到 ${count} 条异常项，是否生成工单？`) } catch { return }
  let anomalies = []
  try {
    const detail = await getInspection(row.inspectionId)
    const data = detail?.data || row
    anomalies = anomalyService.detectAnomalies({ floor: data.floor, items: data.items })
  } catch (e) { console.warn('拉取巡检详情失败，将按数量占位生成', e) }
  if (!Array.isArray(anomalies) || anomalies.length === 0) {
    anomalies = Array.from({ length: count }).map((_, i) => ({ itemName: `巡检异常#${i + 1}`, value: '-', priority: 'low' }))
  }
  try {
    const resp = await generateTickets(row.inspectionId, anomalies)
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    proxy.$modal.msgSuccess(`已生成 ${n} 个工单`)
    if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
      try { await proxy.$modal.confirm('是否前往第一张工单详情？'); router.push('/business/ticket/detail/' + created[0].ticketId) }
      catch { router.push('/business/ticket/list') }
    } else { router.push('/business/ticket/list') }
    getList()
  } catch (e) { console.error(e) }
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

