<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item :label="$t('business.ticket.template.templateName')" prop="templateName">
        <el-input v-model="queryParams.templateName" :placeholder="$t('business.ticket.template.inputTemplateName')" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('business.ticket.template.faultType')" prop="faultType">
        <el-select v-model="queryParams.faultType" :placeholder="$t('business.ticket.placeholder.selectSpecialty')" clearable>
          <el-option v-for="dict in fault_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.ticket.field.specialty')" prop="specialty">
        <el-select v-model="queryParams.specialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')" clearable>
          <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('business.ticket.action.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('business.ticket.action.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['business:ticket:template:add']">{{ $t('business.ticket.template.addTemplate') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['business:ticket:template:edit']">{{ $t('business.ticket.action.edit') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['business:ticket:template:remove']">{{ $t('business.ticket.action.delete') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['business:ticket:template:export']">{{ $t('business.ticket.action.export') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="$t('business.ticket.template.templateNo')" align="center" prop="templateNo" width="120" />
      <el-table-column :label="$t('business.ticket.template.templateName')" align="center" prop="templateName" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('business.ticket.template.faultType')" align="center" prop="faultType" width="100">
        <template #default="scope">
          <dict-tag :options="fault_type" :value="scope.row.faultType" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.template.defaultPriority')" align="center" prop="priority" width="100">
        <template #default="scope">
          <dict-tag :options="ticket_priority" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.specialty')" align="center" prop="specialty" width="100">
        <template #default="scope">
          <dict-tag :options="equipment_specialty" :value="scope.row.specialty" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.template.useCount')" align="center" prop="useCount" width="90">
        <template #default="scope">
          <el-tag>{{ scope.row.useCount }}{{ $t('business.ticket.template.useCountSuffix') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.template.status')" align="center" prop="status" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.field.createTime')" align="center" prop="createTime" width="160">
        <template #default="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.ticket.action.edit')" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)"
            v-hasPermi="['business:ticket:template:query']">{{ $t('business.ticket.action.view') }}</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['business:ticket:template:edit']">{{ $t('business.ticket.action.edit') }}</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['business:ticket:template:remove']">{{ $t('business.ticket.action.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <div ref="dialogBody" @keydown.enter.prevent="onEnterSubmit">
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px" @keydown.enter.prevent="onEnterSubmit">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.template.templateName')" prop="templateName">
              <el-input v-model="form.templateName" :placeholder="$t('business.ticket.template.inputTemplateName')" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.template.faultType')" prop="faultType">
              <el-select v-model="form.faultType" :placeholder="$t('business.ticket.template.selectFaultType')">
                <el-option v-for="dict in fault_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.template.defaultPriority')" prop="priority">
              <el-radio-group v-model="form.priority">
                <el-radio v-for="dict in ticket_priority" :key="dict.value" :label="dict.value">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.ticket.field.specialty')" prop="specialty">
              <el-select v-model="form.specialty" :placeholder="$t('business.ticket.placeholder.selectSpecialty')">
                <el-option v-for="dict in equipment_specialty" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('business.ticket.template.defaultTitle')" prop="defaultTitle">
          <el-input v-model="form.defaultTitle" :placeholder="$t('business.ticket.template.inputDefaultTitle')" />
        </el-form-item>
        <el-form-item :label="$t('business.ticket.template.defaultDescription')" prop="defaultDescription">
          <el-input v-model="form.defaultDescription" type="textarea" :rows="4" :placeholder="$t('business.ticket.template.inputDefaultDescription')" maxlength="500"
            show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.ticket.template.defaultEmergencyAction')" prop="defaultEmergencyAction">
          <el-input v-model="form.defaultEmergencyAction" type="textarea" :rows="3" :placeholder="$t('business.ticket.template.inputDefaultEmergencyAction')"
            maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.ticket.template.defaultSolution')" prop="defaultSolution">
          <el-input v-model="form.defaultSolution" type="textarea" :rows="4" :placeholder="$t('business.ticket.template.inputDefaultSolution')" maxlength="500"
            show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('business.ticket.field.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('business.ticket.placeholder.inputRemark')" />
        </el-form-item>
      </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="submitting" :disabled="submitting" @click="submitForm">{{ $t('business.ticket.message.confirm') }}</el-button>
          <el-button :disabled="submitting" @click="cancel">{{ $t('business.ticket.message.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog :title="$t('business.ticket.template.detailTitle')" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('business.ticket.template.templateNo')">{{ detail.templateNo }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.templateName')">{{ detail.templateName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.faultType')">
          <dict-tag :options="fault_type" :value="detail.faultType" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.defaultPriority')">
          <dict-tag :options="ticket_priority" :value="detail.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.specialty')">
          <dict-tag :options="equipment_specialty" :value="detail.specialty" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.useCount')">{{ detail.useCount }}{{ $t('business.ticket.template.useCountSuffix') }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.defaultTitle')" :span="2">{{ detail.defaultTitle }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.defaultDescription')" :span="2">{{ detail.defaultDescription }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.defaultEmergencyAction')" :span="2">{{ detail.defaultEmergencyAction }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.template.defaultSolution')" :span="2">{{ detail.defaultSolution }}</el-descriptions-item>
        <el-descriptions-item :label="$t('business.ticket.field.createTime')" :span="2">{{ parseTime(detail.createTime) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">{{ $t('business.ticket.action.close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TicketTemplate">
import { ref, reactive, toRefs, getCurrentInstance, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate, changeTemplateStatus } from "@/api/business/ticketTemplate";
import { parseTime } from '@/utils/ruoyi'
import { ensureSafeRequest } from '@/views/business/ticket/index.util'
import { submitTemplateForm, buildInitialForm } from '@/views/business/ticket/template.util'
import useTicketTemplate from '@/views/business/ticket/useTicketTemplate'
import { nextTick, watch } from 'vue'
import { track } from '@/infra/telemetry'
import FeatureFlags from '@/config/FeatureFlags'
const { t } = useI18n()

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
      { required: true, message: t('business.ticket.template.templateNameRequired'), trigger: "blur" },
      { min: 2, max: 50, message: t('business.ticket.template.templateNameLength'), trigger: "blur" }
    ],
    faultType: [
      { required: true, message: t('business.ticket.template.faultTypeRequired'), trigger: "change" }
    ],
    priority: [
      { required: true, message: t('business.ticket.template.priorityRequired'), trigger: "change" }
    ],
    specialty: [
      { required: true, message: t('business.ticket.template.specialtyRequired'), trigger: "change" }
    ],
    defaultTitle: [
      { required: true, message: t('business.ticket.template.defaultTitleRequired'), trigger: "blur" }
    ],
    defaultDescription: [
      { required: true, message: t('business.ticket.template.defaultDescriptionRequired'), trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 使用 composable 承载状态机与提交
const { submitState, submitting, submit: submitWithMachine, cancel: cancelWithMachine } = useTicketTemplate()

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
function cancel() { cancelWithMachine(open, reset) }

/** 表单重置 */
function reset() {
  form.value = buildInitialForm();
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
  title.value = t('business.ticket.template.addTemplate');
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
    title.value = t('business.ticket.template.updateTemplate');
  });
}

// 打开弹窗后，将焦点移到首个输入（模板名称）以提升可达性
watch(open, async (v) => {
  if (v) {
    try { track('dialog_open', {}) } catch {}
    await nextTick()
    try {
      const host = proxy.$refs?.dialogBody
      const target = host?.querySelector('[data-prop="templateName"] el-input, [data-prop="templateName"] input, [data-prop="templateName"] textarea')
      if (target && typeof target === 'object') {
        const anyTarget = target
        const fn = anyTarget['focus']
        if (typeof fn === 'function') fn.call(target)
      }
    } catch {}
  }
})

/** 提交按钮 */
function submitForm() {
  const formRef = proxy.$refs?.["templateRef"]
  if (!formRef || typeof formRef.validate !== 'function') {
    // 安全兜底：无表单引用时直接提示
    try { proxy.$modal?.msgError?.(t('business.ticket.message.formNotReady')) } catch {}
    return
  }
  formRef.validate(async (valid, fields) => {
    const validate = async () => valid
    const ret = await submitWithMachine({
      form: form.value,
      validate,
      addTemplate,
      updateTemplate,
      modal: proxy.$modal,
      isSuccess: (resp) => !!(resp && (resp.code === 200 || resp.ok === true)),
      onSuccess: () => { open.value = false; getList() }
    })
    // composable 已处理状态机，这里仅兜底
    if (!ret.ok && ret.type === 'busy') { /* no-op */ }
    if (!valid) {
      try {
        try {
          const firstProp = fields && typeof fields === 'object' ? Object.keys(fields)[0] : ''
          if (firstProp) track('validate_false', { firstInvalidField: firstProp })
        } catch {}
        const firstProp = fields && typeof fields === 'object' ? Object.keys(fields)[0] : ''
        const host = proxy.$refs?.dialogBody
        if (host) {
            let target = firstProp ? host.querySelector(`[data-prop="${firstProp}"] el-input, [data-prop="${firstProp}"] input, [data-prop="${firstProp}"] textarea`) : null
          if (!target) target = host.querySelector('el-input, input, textarea')
          if (target) {
            const anyTarget = target
            const fn = anyTarget && anyTarget['focus']
            if (typeof fn === 'function') fn.call(anyTarget)
          }
        }
      } catch {}
    }
  })
}

// Enter 提交路径埋点
function onEnterSubmit() {
  try { track('enter_press', { target: 'submit' }) } catch {}
  submitForm()
}

/** 删除按钮操作 */
function handleDelete(row) {
  const templateIds = row.templateId || ids.value;
  proxy.$modal.confirm(t('business.ticket.template.confirmDelete', { id: templateIds })).then(function () {
    return delTemplate(templateIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(t('business.ticket.message.deleteSuccess'));
  }).catch(() => { });
}

/** 状态修改 */
function handleStatusChange(row) {
  let text = row.status === "0" ? t('business.ticket.template.statusEnable') : t('business.ticket.template.statusDisable');
  proxy.$modal.confirm(t('business.ticket.template.confirmStatusChange', { text, name: row.templateName })).then(function () {
    return changeTemplateStatus(row.templateId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(t('business.ticket.template.statusChangeSuccess', { text }));
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

// 监听 Feature Flag 热切换（非 prod 进行轻量 smoke）
let offFlag = null
onMounted(() => {
  try {
    offFlag = FeatureFlags.onChange?.('USE_TICKET_TEMPLATE_V2', (enabled) => {
      try { track('flag_switched', { to: !!enabled }) } catch {}
      if (import.meta.env && (import.meta.env.PROD === true)) return
      if (open.value) return
      const run = async () => {
        try {
          open.value = true
          await nextTick()
          submitForm()
          await Promise.resolve()
          cancel()
        } catch {}
      }
      run()
    }) || null
  } catch {}
})
onUnmounted(() => { try { offFlag?.() } catch {} })
</script>
