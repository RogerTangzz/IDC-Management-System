<template>
  <div class="app-container">
    <!-- 鎼滅储琛ㄥ崟 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="妤煎眰" prop="floor">
        <el-select v-model="queryParams.floor" placeholder="璇烽€夋嫨妤煎眰" clearable>
          <el-option v-for="floor in FLOORS" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="宸℃浜哄憳" prop="inspectorName">
        <el-input v-model="queryParams.inspectorName" placeholder="璇疯緭鍏ュ贰妫€浜哄憳" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="宸℃鏃ユ湡">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="异常状态" prop="hasAnomaly">
        <el-select v-model="queryParams.hasAnomaly" placeholder="璇烽€夋嫨" clearable>
          <el-option label="有异常" :value="1" />
          <el-option label="无异常" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">鎼滅储</el-button>
        <el-button icon="Refresh" @click="resetQuery">閲嶇疆</el-button>
      </el-form-item>
    </el-form>

    <!-- 鎿嶄綔宸ュ叿鏍?-->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:inspection:add']">鏂板宸℃</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="DocumentCopy" @click="handleCopyLast"
          v-hasPermi="['business:inspection:add']">澶嶅埗涓婃宸℃</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:inspection:remove']">鎵归噺鍒犻櫎</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:inspection:export']">瀵煎嚭鏁版嵁</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="DataAnalysis" @click="handleStatistics">缁熻鍒嗘瀽</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 鏁版嵁琛ㄦ牸 -->
    <el-table v-loading="loading" :data="inspectionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="宸℃缂栧彿" align="center" prop="inspectionNo" width="120" />
      <el-table-column label="妤煎眰" align="center" prop="floor" width="80" />
      <el-table-column label="宸℃浜哄憳" align="center" prop="inspectorName" width="100" />
      <el-table-column label="浜ゆ帴浜哄憳" align="center" prop="relayPerson" width="100" />
      <el-table-column label="宸℃鏃ユ湡" align="center" prop="inspectionDate" width="110">
        <template #default="scope">
          {{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="宸℃杩涘害" align="center" prop="progress" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :width="70" :stroke-width="6"
            :color="scope.row.progress === 100 ? '#67c23a' : '#409eff'" />
        </template>
      </el-table-column>
      <el-table-column label="寮傚父鏁伴噺" align="center" prop="anomalyCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.anomalyCount > 0" type="danger">
            {{ scope.row.anomalyCount }} 椤?
          </el-tag>
          <el-tag v-else type="success">无异常</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="宸ュ崟鏁伴噺" align="center" prop="ticketCount" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.ticketCount > 0" type="warning">
            {{ scope.row.ticketCount }} 涓?
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="澶嶅埗鏉ユ簮" align="center" prop="isCopied" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.isCopied === 'Y'" type="info">已复制</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="澶囨敞璇存槑" align="left" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="鍒涘缓鏃堕棿" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="鎿嶄綔" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:inspection:query']">鏌ョ湅</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:inspection:edit']" v-if="scope.row.progress < 100">缂栬緫</el-button>
          <el-button link type="success" icon="DocumentCopy" @click="handleCopy(scope.row)"
            v-hasPermi="['business:inspection:add']">澶嶅埗</el-button>
          <el-button link type="warning" icon="Tickets" @click="handleGenerateTickets(scope.row)"
            :loading="generatingInspectionId === scope.row.inspectionId"
            :disabled="generatingInspectionId === scope.row.inspectionId" v-hasPermi="['business:inspection:add']"
            v-if="scope.row.anomalyCount > 0 && scope.row.ticketCount === 0">鐢熸垚宸ュ崟</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 鍒嗛〉缁勪欢 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 缁熻寮圭獥 -->
    <el-dialog title="宸℃缁熻鍒嗘瀽" v-model="statisticsOpen" width="800px" append-to-body>
      <div class="statistics-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="鏈湀宸℃鎬绘暟" :value="statistics.monthCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="鏈湀寮傚父鎬绘暟" :value="statistics.monthAnomalyCount" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="寮傚父澶勭悊鐜? :value="statistics.handleRate" suffix="%" />
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statisticsOpen = false">鍏抽棴</el-button>
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


// 褰撳墠姝ｅ湪鐢熸垚宸ュ崟鐨勫贰妫€ID锛堣鍐呮寜閽甽oading绂佺敤锛?
const generatingInspectionId = ref(null)
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

/** 鏌ヨ宸℃鍒楄〃 */
function getList() {
  loading.value = true;
  let params = proxy.addDateRange(queryParams.value, dateRange.value);
  listInspection(params).then(response => {
    inspectionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 琛ㄥ崟鍙傛暟閲嶇疆
/** 鎼滅储鎸夐挳鎿嶄綔 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 閲嶇疆鎸夐挳鎿嶄綔 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 澶氶€夋閫変腑鏁版嵁 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.inspectionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 鏂板鎸夐挳鎿嶄綔 */
function handleAdd() {
  router.push('/business/inspection/create');
}

/** 澶嶅埗涓婃宸℃鎸夐挳鎿嶄綔 */
function handleCopyLast() {
  // 鏌ユ壘鏈€杩戝畬鎴愮殑宸℃璁板綍
  const lastCompleted = inspectionList.value
    .filter(item => item.status === 'completed')
    .sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate))[0];

  if (lastCompleted) {
    router.push('/business/inspection/create?copy=' + lastCompleted.inspectionId);
  } else {
    proxy.$modal.msgWarning("娌℃湁鎵惧埌宸插畬鎴愮殑宸℃璁板綍");
  }
}

/** 鏌ョ湅璇︽儏鎸夐挳鎿嶄綔 */
function handleView(row) {
  router.push('/business/inspection/detail/' + row.inspectionId);
}

/** 缂栬緫鎸夐挳鎿嶄綔 */
function handleUpdate(row) {
  router.push('/business/inspection/edit/' + row.inspectionId);
}

/** 澶嶅埗鎸夐挳鎿嶄綔 */
function handleCopy(row) {
  proxy.$modal.confirm('鏄惁纭澶嶅埗璇ュ贰妫€璁板綍锛?).then(function () {
    router.push('/business/inspection/create?copy=' + row.inspectionId);
  }).catch(() => { });
}

/** 鐢熸垚宸ュ崟鎸夐挳鎿嶄綔锛堝簾寮冩柟娉曪級 */
function handleGenerateTicketsObsolete(row) {
  proxy.$modal.confirm('纭涓鸿宸℃鐢熸垚 ' + row.anomalyCount + ' 涓紓甯稿伐鍗曞悧锛?).then(function () {
    const __count = Number(row.anomalyCount || 0);
    const __anomalies = Array.isArray(row.anomalies) && row.anomalies.length
      ? row.anomalies
      : Array.from({ length: __count }).map((_, i) => ({ itemName: `宸℃椤圭洰${i + 1}`, value: '-', priority: 'low' }));
    return generateTickets(row.inspectionId, __anomalies);
  }).then((resp) => {
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    row.ticketCount = (row.ticketCount || 0) + n
    proxy.$modal.msgSuccess(`瀹歌尙鏁撻幋?${n} 娑擃亜浼愰崡鏄?
  }).catch(() => { });
}

/** 鍒犻櫎鎸夐挳鎿嶄綔 */
function handleDelete(row) {
  const inspectionIds = row.inspectionId || ids.value;
  proxy.$modal.confirm('鏄惁纭鍒犻櫎宸℃缂栧彿涓?' + inspectionIds + '"鐨勬暟鎹」锛?).then(function () {
    return delInspection(inspectionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("鍒犻櫎鎴愬姛");
  }).catch(() => { });
}

/** 瀵煎嚭鎸夐挳鎿嶄綔 */
function handleExport() {
  proxy.download('business/inspection/export', {
    ...queryParams.value
  }, `inspection_${new Date().getTime()}.xlsx`)
}

/** 缁熻鍒嗘瀽鎸夐挳鎿嶄綔 */
function handleStatistics() {
  // 妯℃嫙缁熻鏁版嵁锛屽疄闄呭簲璇ヤ粠鍚庣鑾峰彇
  statistics.value = {
    monthCount: 45,
    monthAnomalyCount: 23,
    handleRate: 87.5
  };
  statisticsOpen.value = true;
}

// 宸ュ叿鍑芥暟锛氳幏鍙栨ゼ灞傛爣绛?

// 鐢熸垚宸ュ崟
async function handleGenerateTickets(row) {
  if (!row || !row.inspectionId) return
  const count = Number(row.anomalyCount || 0)
  if (count <= 0) { proxy.$modal.msgWarning('娌℃湁寮傚父椤圭洰闇€瑕佺敓鎴愬伐鍗?); return }
  try { await proxy.$modal.confirm(`纭涓鸿宸℃鐢熸垚 ${count} 涓紓甯稿伐鍗曞悧锛焋) } catch { return }
  let anomalies = []
  generatingInspectionId.value = row.inspectionId
  try {
    const detail = await getInspection(row.inspectionId)
    const data = detail?.data || row
    anomalies = anomalyService.detectAnomalies({ floor: data.floor, items: data.items })
  } catch (e) { console.warn('鑾峰彇宸℃璇︽儏澶辫触', e) }
  if (!Array.isArray(anomalies) || anomalies.length === 0) {
    anomalies = Array.from({ length: count }).map((_, i) => ({ itemName: `宸℃椤圭洰${i + 1}`, value: '-', priority: 'low' }))
  }
  try {
    const resp = await generateTickets(row.inspectionId, anomalies)
    const created = (resp && (resp.data || resp.rows)) || []
    const n = Array.isArray(created) ? created.length : (created ? 1 : 0)
    proxy.$modal.msgSuccess(`瀹歌尙鏁撻幋?${n} 娑擃亜浼愰崡鏄?
    if (Array.isArray(created) && created.length > 0 && created[0]?.ticketId) {
      try { await proxy.$modal.confirm('鏄惁鏌ョ湅鐢熸垚鐨勫伐鍗曪紵'); router.push('/business/ticket/detail/' + created[0].ticketId) }
      catch { router.push('/business/ticket/list') }
    } else { router.push('/business/ticket/list') }
  } catch (e) { console.error(e) } finally { generatingInspectionId.value = null }
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


