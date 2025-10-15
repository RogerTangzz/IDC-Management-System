<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item :label="t('tool.gen.field.tableName')" prop="tableName">
        <el-input v-model="queryParams.tableName" :placeholder="t('tool.gen.placeholder.tableName')" clearable style="width: 200px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="t('tool.gen.field.tableComment')" prop="tableComment">
        <el-input v-model="queryParams.tableComment" :placeholder="t('tool.gen.placeholder.tableComment')" clearable style="width: 200px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="t('tool.gen.field.createTime')" style="width: 308px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          :start-placeholder="t('tool.gen.placeholder.startDate')" :end-placeholder="t('tool.gen.placeholder.endDate')"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ t('tool.gen.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ t('tool.gen.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Download" :disabled="multiple" @click="handleGenTable"
          v-hasPermi="['tool:gen:code']">{{ t('tool.gen.action.generate') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openCreateTable" v-hasRole="['admin']">{{ t('tool.gen.action.create') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="openImportTable"
          v-hasPermi="['tool:gen:import']">{{ t('tool.gen.action.import') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleEditTable"
          v-hasPermi="['tool:gen:edit']">{{ t('tool.gen.action.edit') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['tool:gen:remove']">{{ t('tool.gen.action.delete') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="genRef" v-loading="loading" :data="tableList" @selection-change="handleSelectionChange"
      :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column :label="t('tool.gen.field.index')" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('tool.gen.field.tableName')" align="center" prop="tableName" :show-overflow-tooltip="true" />
      <el-table-column :label="t('tool.gen.field.tableComment')" align="center" prop="tableComment" :show-overflow-tooltip="true" />
      <el-table-column :label="t('tool.gen.field.className')" align="center" prop="className" :show-overflow-tooltip="true" />
      <el-table-column :label="t('tool.gen.field.createTime')" align="center" prop="createTime" width="160" sortable="custom"
        :sort-orders="['descending', 'ascending']" />
      <el-table-column :label="t('tool.gen.field.updateTime')" align="center" prop="updateTime" width="160" sortable="custom"
        :sort-orders="['descending', 'ascending']" />
      <el-table-column :label="t('common.action.operate')" align="center" width="330" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip :content="t('tool.gen.action.preview')" placement="top">
            <el-button link type="primary" icon="View" @click="handlePreview(scope.row)"
              v-hasPermi="['tool:gen:preview']"></el-button>
          </el-tooltip>
          <el-tooltip :content="t('tool.gen.action.edit')" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEditTable(scope.row)"
              v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="t('tool.gen.action.delete')" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
              v-hasPermi="['tool:gen:remove']"></el-button>
          </el-tooltip>
          <el-tooltip :content="t('tool.gen.action.sync')" placement="top">
            <el-button link type="primary" icon="Refresh" @click="handleSynchDb(scope.row)"
              v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip :content="t('tool.gen.action.generateCode')" placement="top">
            <el-button link type="primary" icon="Download" @click="handleGenTable(scope.row)"
              v-hasPermi="['tool:gen:code']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" v-model="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))" :key="value">
          <el-link :underline="false" icon="DocumentCopy" v-copyText="value" v-copyText:callback="copyTextSuccess"
            style="float:right">&nbsp;{{ t('tool.gen.action.copy') }}</el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>

<script setup name="Gen">
import { listTable, previewTable, delTable, genCode, synchDb } from "@/api/tool/gen"
import importTable from "./importTable"
import createTable from "./createTable"

const route = useRoute()
const { proxy } = getCurrentInstance()
const { t } = useI18n()

const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const tableNames = ref([])
const dateRange = ref([])
const uniqueId = ref("")
const defaultSort = ref({ prop: "createTime", order: "descending" })

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined,
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  preview: {
    open: false,
    title: t('tool.gen.dialog.preview'),
    data: {},
    activeName: "domain.java"
  }
})

const { queryParams, preview } = toRefs(data)

onActivated(() => {
  const time = route.query.t
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time
    queryParams.value.pageNum = Number(route.query.pageNum)
    dateRange.value = []
    proxy.resetForm("queryForm")
    getList()
  }
})

/** 查询表集合 */
function getList() {
  loading.value = true
  listTable(proxy.addDateRange(queryParams.value, dateRange.value)).then(_response => {
    tableList.value = _response.rows
    total.value = _response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 生成代码操作 */
function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value
  if (tbNames == "") {
    proxy.$modal.msgError(t('tool.gen.message.selectData'))
    return
  }
  if (row.genType === "1") {
    genCode(row.tableName).then(_response => {
      proxy.$modal.msgSuccess(t('tool.gen.message.generateSuccess', { path: row.genPath }))
    })
  } else {
    proxy.$download.zip("/tool/gen/batchGenCode?tables=" + tbNames, "ruoyi.zip")
  }
}

/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName
  proxy.$modal.confirm(t('tool.gen.message.syncConfirm', { tableName })).then(function () {
    return synchDb(tableName)
  }).then(() => {
    proxy.$modal.msgSuccess(t('tool.gen.message.syncSuccess'))
  }).catch(() => { })
}

/** 打开导入表弹窗 */
function openImportTable() {
  proxy.$refs["importRef"].show()
}

/** 打开创建表弹窗 */
function openCreateTable() {
  proxy.$refs["createRef"].show()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.pageNum = 1
  proxy.$refs["genRef"].sort(defaultSort.value.prop, defaultSort.value.order)
}

/** 预览按钮 */
function handlePreview(row) {
  previewTable(row.tableId).then(_response => {
    preview.value.data = _response.data
    preview.value.open = true
    preview.value.activeName = "domain.java"
  })
}

/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess(t('tool.gen.message.copySuccess'))
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.tableId)
  tableNames.value = selection.map(item => item.tableName)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 排序触发事件 */
function handleSortChange(column, _prop, _order) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order
  getList()
}

/** 修改按钮操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0]
  const tableName = row.tableName || tableNames.value[0]
  const params = { pageNum: queryParams.value.pageNum }
  proxy.$tab.openPage(t('tool.gen.dialog.editConfig', { tableName }), '/tool/gen-edit/index/' + tableId, params)
}

/** 删除按钮操作 */
function handleDelete(row) {
  const tableIds = row.tableId || ids.value
  proxy.$modal.confirm(t('tool.gen.message.deleteConfirm', { tableIds })).then(function () {
    return delTable(tableIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(t('tool.gen.message.deleteSuccess'))
  }).catch(() => { })
}

getList()
</script>
