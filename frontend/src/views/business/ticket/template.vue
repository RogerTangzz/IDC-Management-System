<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="故障类型" prop="faultType">
        <el-select v-model="queryParams.faultType" placeholder="请选择" clearable>
          <el-option v-for="dict in fault_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备专业" prop="specialty">
        <el-select v-model="queryParams.specialty" placeholder="请选择" clearable>
          <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          v-hasPermi="['business:ticket:template:add']">新增模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:ticket:template:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:ticket:template:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:ticket:template:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模板编号" align="center" prop="templateNo" width="120" />
      <el-table-column label="模板名称" align="center" prop="templateName" :show-overflow-tooltip="true" />
      <el-table-column label="故障类型" align="center" prop="faultType" width="100">
        <template #default="scope">
          <dict-tag :options="fault_type" :value="scope.row.faultType" />
        </template>
      </el-table-column>
      <el-table-column label="默认优先级" align="center" prop="priority" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_priority" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="设备专业" align="center" prop="specialty" width="100">
        <template #default="scope">
          <dict-tag :options="equipment_specialty" :value="scope.row.specialty" />
        </template>
      </el-table-column>
      <el-table-column label="使用次数" align="center" prop="useCount" width="90">
        <template #default="scope">
          <el-tag>{{ scope.row.useCount }}次</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:ticket:template:query']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:ticket:template:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:ticket:template:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障类型" prop="faultType">
              <el-select v-model="form.faultType" placeholder="请选择故障类型">
                <el-option v-for="dict in fault_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="默认优先级" prop="priority">
              <el-radio-group v-model="form.priority">
                <el-radio v-for="dict in ticket_priority" :key="dict.value" :label="dict.value">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备专业" prop="specialty">
              <el-select v-model="form.specialty" placeholder="请选择">
                <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认标题" prop="defaultTitle">
          <el-input v-model="form.defaultTitle" placeholder="请输入默认标题" />
        </el-form-item>
        <el-form-item label="故障描述" prop="defaultDescription">
          <el-input v-model="form.defaultDescription" type="textarea" :rows="4" placeholder="请输入默认故障描述" maxlength="500"
            show-word-limit />
        </el-form-item>
        <el-form-item label="应急处置" prop="defaultEmergencyAction">
          <el-input v-model="form.defaultEmergencyAction" type="textarea" :rows="3" placeholder="请输入默认应急处置方法"
            maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="处理方案" prop="defaultSolution">
          <el-input v-model="form.defaultSolution" type="textarea" :rows="4" placeholder="请输入默认处理方案" maxlength="500"
            show-word-limit />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="模板详情" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模板编号">{{ detail.templateNo }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ detail.templateName }}</el-descriptions-item>
        <el-descriptions-item label="故障类型">
          <dict-tag :options="fault_type" :value="detail.faultType" />
        </el-descriptions-item>
        <el-descriptions-item label="默认优先级">
          <dict-tag :options="ticket_priority" :value="detail.priority" />
        </el-descriptions-item>
        <el-descriptions-item label="设备专业">
          <dict-tag :options="equipment_specialty" :value="detail.specialty" />
        </el-descriptions-item>
        <el-descriptions-item label="使用次数">{{ detail.useCount }}次</el-descriptions-item>
        <el-descriptions-item label="默认标题" :span="2">{{ detail.defaultTitle }}</el-descriptions-item>
        <el-descriptions-item label="故障描述" :span="2">{{ detail.defaultDescription }}</el-descriptions-item>
        <el-descriptions-item label="应急处置" :span="2">{{ detail.defaultEmergencyAction }}</el-descriptions-item>
        <el-descriptions-item label="处理方案" :span="2">{{ detail.defaultSolution }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ parseTime(detail.createTime) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TicketTemplate">
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate, changeTemplateStatus } from "@/api/business/ticketTemplate";
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance();

const templateList = ref([]);
const open = ref(false);
const detailOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const detail = ref({});

// 字典数据
const { ticket_priority, equipment_specialty, fault_type } = proxy.useDict('ticket_priority', 'equipment_specialty', 'fault_type');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateName: undefined,
    faultType: undefined,
    specialty: undefined
  },
  rules: {
    templateName: [
      { required: true, message: "模板名称不能为空", trigger: "blur" },
      { min: 2, max: 50, message: "模板名称长度在 2 到 50 个字符", trigger: "blur" }
    ],
    faultType: [
      { required: true, message: "请选择故障类型", trigger: "change" }
    ],
    priority: [
      { required: true, message: "请选择默认优先级", trigger: "change" }
    ],
    specialty: [
      { required: true, message: "请选择设备专业", trigger: "change" }
    ],
    defaultTitle: [
      { required: true, message: "默认标题不能为空", trigger: "blur" }
    ],
    defaultDescription: [
      { required: true, message: "故障描述不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询模板列表 */
function getList() {
  loading.value = true;
  listTemplate(queryParams.value).then(response => {
    templateList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    templateId: undefined,
    templateNo: undefined,
    templateName: undefined,
    faultType: undefined,
    priority: 'medium',
    specialty: undefined,
    defaultTitle: undefined,
    defaultDescription: undefined,
    defaultEmergencyAction: undefined,
    defaultSolution: undefined,
    useCount: 0,
    status: "0",
    remark: undefined
  };
  proxy.resetForm("templateRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.templateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加工单模板";
}

/** 查看详情 */
function handleView(row) {
  getTemplate(row.templateId).then(_response => {
    detail.value = _response.data;
    detailOpen.value = true;
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const templateId = row.templateId || ids.value[0];
  getTemplate(templateId).then(_response => {
    form.value = _response.data;
    open.value = true;
    title.value = "修改工单模板";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["templateRef"].validate(valid => {
    if (valid) {
      if (form.value.templateId != undefined) {
        updateTemplate(form.value).then(_response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTemplate(form.value).then(_response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const templateIds = row.templateId || ids.value;
  proxy.$modal.confirm('是否确认删除工单模板编号为"' + templateIds + '"的数据项？').then(function () {
    return delTemplate(templateIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 状态修改 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.templateName + '"模板吗？').then(function () {
    return changeTemplateStatus(row.templateId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/ticket/template/export', {
    ...queryParams.value
  }, `template_${new Date().getTime()}.xlsx`)
}

getList();
</script>