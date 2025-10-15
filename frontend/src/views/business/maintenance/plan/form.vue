<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>{{ title }}</span>
        <el-button v-if="!planId && !isCopy" link type="primary" style="float: right" @click="handleCopyLast">
          {{ $t('business.maintenance.message.copyLastPlan') }}
        </el-button>
      </template>

      <el-form ref="maintenanceRef" :model="form" :rules="rules" label-width="140px" :disabled="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.title')" prop="title">
              <el-input v-model="form.title" :placeholder="$t('business.maintenance.placeholder.inputTitleShort')" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('business.maintenance.field.floorNo')" prop="floor">
              <el-select v-model="form.floor" :placeholder="$t('business.maintenance.placeholder.selectFloor')">
                <el-option :label="$t('business.maintenance.floor.floor1')" value="1" />
                <el-option :label="$t('business.maintenance.floor.floor2')" value="2" />
                <el-option :label="$t('business.maintenance.floor.floor3')" value="3" />
                <el-option :label="$t('business.maintenance.floor.floor4')" value="4" />
                <el-option :label="$t('business.maintenance.floor.allFloors')" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('business.maintenance.field.version')" prop="version">
              <el-input v-model="form.version" :placeholder="$t('business.maintenance.placeholder.versionExample')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">{{ $t('business.maintenance.message.mopInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('business.maintenance.field.mopCategory')" prop="mopCategory">
              <el-select v-model="form.mopCategory" :placeholder="$t('business.maintenance.placeholder.select')">
                <el-option v-for="dict in mop_category" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('business.maintenance.field.executionCycle')" prop="executionCycle">
              <el-input-number v-model="form.executionFrequency" :min="1" :max="365" :placeholder="$t('business.maintenance.placeholder.frequency')"
                style="width: 100px" />
              <el-select v-model="form.executionUnit" :placeholder="$t('business.maintenance.placeholder.unit')" style="width: 100px; margin-left: 10px">
                <el-option :label="$t('business.maintenance.unit.monthly')" value="monthly" />
                <el-option :label="$t('business.maintenance.unit.quarterly')" value="quarterly" />
                <el-option :label="$t('business.maintenance.unit.yearly')" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('business.maintenance.field.approverId')" prop="approverId">
              <el-select v-model="form.approverId" :placeholder="$t('business.maintenance.placeholder.selectApprover')">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.mopName')" prop="mopName">
              <el-input v-model="form.mopName" :placeholder="$t('business.maintenance.placeholder.inputMopName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.notifyUsers')" prop="notifyUsers">
              <el-select v-model="form.notifyUsers" multiple :placeholder="$t('business.maintenance.placeholder.selectNotifyUsers')">
                <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('business.maintenance.field.mopPurpose')" prop="mopPurpose">
          <el-input v-model="form.mopPurpose" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputMopPurpose')" maxlength="500"
            show-word-limit />
        </el-form-item>

        <el-divider content-position="left">{{ $t('business.maintenance.message.executionInfo') }}</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.tools')" prop="tools">
              <el-input v-model="form.tools" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputTools')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.materials')" prop="materials">
              <el-input v-model="form.materials" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputMaterials')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.safety')" prop="safety">
              <el-input v-model="form.safety" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputSafety')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.specialTools')" prop="specialTools">
              <el-input v-model="form.specialTools" type="textarea" :rows="2" :placeholder="$t('business.maintenance.placeholder.inputSpecialTools')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('business.maintenance.field.steps')" prop="steps">
          <editor v-model="form.steps" :min-height="192" />
        </el-form-item>

        <!-- 创建表格功能 -->
        <el-form-item :label="$t('business.maintenance.field.createTable')">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input-number v-model="tableRows" :min="1" :max="20" :placeholder="$t('business.maintenance.placeholder.rows')" />
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="tableCols" :min="1" :max="10" :placeholder="$t('business.maintenance.placeholder.columns')" />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="generateTable">{{ $t('business.maintenance.action.generateTable') }}</el-button>
            </el-col>
          </el-row>
          <div v-if="tableData.length > 0" class="table-editor">
            <el-table :data="tableData" border style="margin-top: 10px">
              <el-table-column v-for="(col, index) in tableCols" :key="index" :prop="`col${index}`"
                :label="`${$t('business.maintenance.message.column')}${index + 1}`">
                <template #default="scope">
                  <el-input v-model="scope.row[`col${index}`]" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.inspectionResult')" prop="inspectionResult">
              <el-input v-model="form.inspectionResult" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputInspectionResult')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('business.maintenance.field.remark')" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('business.maintenance.placeholder.inputRemarkInfo')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('business.maintenance.field.executorId')" prop="executorId">
          <el-select v-model="form.executorId" :placeholder="$t('business.maintenance.placeholder.selectExecutor')">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ $t('business.maintenance.message.confirm') }}
          </el-button>
          <el-button @click="handleCancel">{{ $t('business.maintenance.message.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="MaintenanceForm">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getMaintenance, addMaintenance, updateMaintenance, getLatestPlan, getApproverList } from "@/api/business/maintenance";
import { listUser } from "@/api/system/user";
import Editor from '@/components/Editor';

const { proxy } = getCurrentInstance();
const { t } = useI18n()
const router = useRouter();
const route = useRoute();

// 获取计划ID（编辑模式）
const planId = route.params && route.params.id;
const copyId = route.query && route.query.copy;

const loading = ref(false);
const isCopy = ref(false);
const userList = ref([]);
const approverList = ref([]);
const tableRows = ref(6);
const tableCols = ref(7);
const tableData = ref([]);

// 字典数据
const { mop_category } = proxy.useDict('mop_category');

// 页面标题
const title = computed(() => {
  if (planId) return t('business.maintenance.message.editPlan');
  if (isCopy.value) return t('business.maintenance.message.copyPlan');
  return t('business.maintenance.message.newPlan');
});

// 表单数据
const form = ref({
  planId: undefined,
  title: '',
  floor: '',
  version: 'V1.0',
  mopCategory: '',
  executionFrequency: 1,
  executionUnit: 'monthly',
  executionCycle: '',
  approverId: undefined,
  mopName: '',
  mopPurpose: '',
  notifyUsers: [],
  tools: '',
  materials: '',
  safety: '',
  specialTools: '',
  steps: '',
  inspectionResult: '',
  remark: '',
  executorId: undefined,
  approvalStatus: 'draft',
  executionStatus: 'pending'
});

// 验证规则
const rules = {
  title: [
    { required: true, message: t('business.maintenance.validation.titleRequired'), trigger: 'blur' },
    { min: 5, max: 100, message: t('business.maintenance.validation.titleLength'), trigger: 'blur' }
  ],
  floor: [
    { required: true, message: t('business.maintenance.validation.floorRequired'), trigger: 'change' }
  ],
  version: [
    { required: true, message: t('business.maintenance.validation.versionRequired'), trigger: 'blur' },
    { pattern: /^V\d+\.\d+(\.\d+)?$/, message: t('business.maintenance.validation.versionFormat'), trigger: 'blur' }
  ],
  mopCategory: [
    { required: true, message: t('business.maintenance.validation.categoryRequired'), trigger: 'change' }
  ],
  approverId: [
    { required: true, message: t('business.maintenance.validation.approverRequired'), trigger: 'change' }
  ],
  mopName: [
    { required: true, message: t('business.maintenance.validation.mopNameRequired'), trigger: 'blur' }
  ],
  mopPurpose: [
    { required: true, message: t('business.maintenance.validation.mopPurposeRequired'), trigger: 'blur' }
  ],
  steps: [
    { required: true, message: t('business.maintenance.validation.stepsRequired'), trigger: 'blur' }
  ]
};

/** 获取计划详情 */
function getPlanDetail(id) {
  loading.value = true;
  getMaintenance(id).then(response => {
    form.value = response.data;
    // 处理执行周期
    if (form.value.executionCycle) {
      const match = form.value.executionCycle.match(/(\d+)(.+)/);
      if (match) {
        form.value.executionFrequency = parseInt(match[1]);
        form.value.executionUnit = match[2];
      }
    }
    loading.value = false;
  });
}

/** 复制计划 */
function copyPlan(id) {
  loading.value = true;
  getMaintenance(id).then(response => {
    const data = response.data;
    delete data.planId;
    form.value = {
      ...data,
      title: data.title + '(' + t('business.maintenance.action.copy') + ')',
      version: incrementVersion(data.version),
      approvalStatus: 'draft',
      executionStatus: 'pending',
      remark: `[${t('business.maintenance.message.copyPlan')} #${id}, ${proxy.parseTime(new Date())}]\n${data.remark || ''}`
    };
    isCopy.value = true;
    loading.value = false;
  });
}

/** 复制上次计划 */
function handleCopyLast() {
  getLatestPlan().then(response => {
    if (!response.data) {
      proxy.$modal.msgWarning(t('business.maintenance.message.noPlanToCopyWarning'));
      return;
    }

    proxy.$modal.confirm(t('business.maintenance.message.confirmCopyLastPlan', { title: response.data.title })).then(() => {
      copyPlan(response.data.planId);
      proxy.$modal.msgSuccess(t('business.maintenance.message.copiedLastPlan'));
    }).catch(() => { });
  });
}

/** 版本号递增 */
function incrementVersion(version) {
  const match = version.match(/^V(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (match) {
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);
    const patch = match[3] ? parseInt(match[3]) + 1 : 1;
    return `V${major}.${minor}.${patch}`;
  }
  return 'V1.1';
}

/** 生成表格 */
function generateTable() {
  tableData.value = [];
  for (let i = 0; i < tableRows.value; i++) {
    const row = {};
    for (let j = 0; j < tableCols.value; j++) {
      row[`col${j}`] = '';
    }
    tableData.value.push(row);
  }
  proxy.$modal.msgSuccess(t('business.maintenance.message.tableGenerated'));
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["maintenanceRef"].validate(valid => {
    if (valid) {
      // 组合执行周期
      form.value.executionCycle = `${form.value.executionFrequency}${form.value.executionUnit}`;

      // 处理表格数据
      if (tableData.value.length > 0) {
        form.value.steps += '\n' + JSON.stringify(tableData.value);
      }

      if (form.value.planId != undefined) {
        updateMaintenance(form.value).then(() => {
          proxy.$modal.msgSuccess(t('business.maintenance.message.updateSuccess'));
          router.push('/business/maintenance/plan');
        });
      } else {
        addMaintenance(form.value).then((res) => {
          proxy.$modal.msgSuccess(t('business.maintenance.message.addSuccess'));
          // 重置表单以便继续新建
          const created = res?.data
          const keepFields = ['version','executionFrequency','executionUnit']
          const base = {
            planId: undefined,
            title: '',
            floor: '',
            version: form.value.version || 'V1.0',
            mopCategory: '',
            executionFrequency: form.value.executionFrequency,
            executionUnit: form.value.executionUnit,
            executionCycle: '',
            approverId: undefined,
            mopName: '',
            mopPurpose: '',
            notifyUsers: [],
            tools: '',
            materials: '',
            safety: '',
            specialTools: '',
            steps: '',
            inspectionResult: '',
            remark: '',
            executorId: undefined,
            approvalStatus: 'draft',
            executionStatus: 'pending'
          }
          form.value = base
          router.push('/business/maintenance/plan');
        });
      }
    }
  });
}

/** 取消 */
function handleCancel() {
  proxy.$modal.confirm(t('business.maintenance.message.confirmCancel')).then(() => {
    router.push('/business/maintenance/plan');
  }).catch(() => { });
}

/** 获取用户列表 */
function getUserList() {
  listUser({ status: '0' }).then(response => {
    userList.value = response.rows;
  });
}

/** 获取审核人列表 */
function getApproversList() {
  getApproverList().then(response => {
    approverList.value = response.rows;
  });
}

/** 初始化 */
onMounted(() => {
  getUserList();
  getApproversList();

  if (planId) {
    getPlanDetail(planId);
  } else if (copyId) {
    copyPlan(copyId);
  }
});
</script>

<style lang="scss" scoped>
.table-editor {
  margin-top: 20px;
}
</style>