<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>{{ title }}</span>
        <el-button v-if="!planId && !isCopy" link type="primary" style="float: right" @click="handleCopyLast">
          复制上次计划
        </el-button>
      </template>

      <el-form ref="maintenanceRef" :model="form" :rules="rules" label-width="140px" :disabled="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="楼层编号" prop="floor">
              <el-select v-model="form.floor" placeholder="请选择楼层">
                <el-option label="1楼" value="1" />
                <el-option label="2楼" value="2" />
                <el-option label="3楼" value="3" />
                <el-option label="4楼" value="4" />
                <el-option label="全部楼层" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="版本" prop="version">
              <el-input v-model="form.version" placeholder="如：V1.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">MOP信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="MOP类别" prop="mopCategory">
              <el-select v-model="form.mopCategory" placeholder="请选择">
                <el-option v-for="dict in mop_category" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行周期" prop="executionCycle">
              <el-input-number v-model="form.executionFrequency" :min="1" :max="365" placeholder="频次"
                style="width: 100px" />
              <el-select v-model="form.executionUnit" placeholder="单位" style="width: 100px; margin-left: 10px">
                <el-option label="次/月" value="monthly" />
                <el-option label="次/季" value="quarterly" />
                <el-option label="次/年" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="审核人" prop="approverId">
              <el-select v-model="form.approverId" placeholder="请选择审核人">
                <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName"
                  :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="MOP名称" prop="mopName">
              <el-input v-model="form.mopName" placeholder="请输入MOP名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知相关人员" prop="notifyUsers">
              <el-select v-model="form.notifyUsers" multiple placeholder="请选择通知人员">
                <el-option v-for="user in userList" :key="user.userId" :label="user.nickName" :value="user.userId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="MOP目的" prop="mopPurpose">
          <el-input v-model="form.mopPurpose" type="textarea" :rows="3" placeholder="请说明维保目的" maxlength="500"
            show-word-limit />
        </el-form-item>

        <el-divider content-position="left">执行信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工具仪表" prop="tools">
              <el-input v-model="form.tools" type="textarea" :rows="2" placeholder="列举所需工具" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材料" prop="materials">
              <el-input v-model="form.materials" type="textarea" :rows="2" placeholder="列举所需材料" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安全（PPE）" prop="safety">
              <el-input v-model="form.safety" type="textarea" :rows="2" placeholder="个人防护装备要求" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="特殊工具" prop="specialTools">
              <el-input v-model="form.specialTools" type="textarea" :rows="2" placeholder="所需配件" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="执行步骤" prop="steps">
          <editor v-model="form.steps" :min-height="192" />
        </el-form-item>

        <!-- 创建表格功能 -->
        <el-form-item label="创建表格">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input-number v-model="tableRows" :min="1" :max="20" placeholder="行数" />
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="tableCols" :min="1" :max="10" placeholder="列数" />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="generateTable">生成表格</el-button>
            </el-col>
          </el-row>
          <div v-if="tableData.length > 0" class="table-editor">
            <el-table :data="tableData" border style="margin-top: 10px">
              <el-table-column v-for="(col, index) in tableCols" :key="index" :prop="`col${index}`"
                :label="`列${index + 1}`">
                <template #default="scope">
                  <el-input v-model="scope.row[`col${index}`]" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检结果" prop="inspectionResult">
              <el-input v-model="form.inspectionResult" type="textarea" :rows="3" placeholder="巡检结果记录" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="备注信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="执行审核人" prop="executorId">
          <el-select v-model="form.executorId" placeholder="请选择执行审核人">
            <el-option v-for="user in approverList" :key="user.userId" :label="user.nickName" :value="user.userId" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            确 定
          </el-button>
          <el-button @click="handleCancel">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="MaintenanceForm">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMaintenance, addMaintenance, updateMaintenance, getLatestPlan, getApproverList } from "@/api/business/maintenance";
import { listUser } from "@/api/system/user";
import Editor from '@/components/Editor';

const { proxy } = getCurrentInstance();
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
  if (planId) return "修改维保计划";
  if (isCopy.value) return "复制维保计划";
  return "新建维保计划";
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
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择楼层', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^V\d+\.\d+(\.\d+)?$/, message: '版本号格式应为 V1.0 或 V1.0.1', trigger: 'blur' }
  ],
  mopCategory: [
    { required: true, message: '请选择MOP类别', trigger: 'change' }
  ],
  approverId: [
    { required: true, message: '请选择审核人', trigger: 'change' }
  ],
  mopName: [
    { required: true, message: '请输入MOP名称', trigger: 'blur' }
  ],
  mopPurpose: [
    { required: true, message: '请说明MOP目的', trigger: 'blur' }
  ],
  steps: [
    { required: true, message: '请输入执行步骤', trigger: 'blur' }
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
      title: data.title + '(复制)',
      version: incrementVersion(data.version),
      approvalStatus: 'draft',
      executionStatus: 'pending',
      remark: `[复制自计划#${id}，复制时间：${proxy.parseTime(new Date())}]\n${data.remark || ''}`
    };
    isCopy.value = true;
    loading.value = false;
  });
}

/** 复制上次计划 */
function handleCopyLast() {
  getLatestPlan().then(response => {
    if (!response.data) {
      proxy.$modal.msgWarning('没有可复制的计划');
      return;
    }

    proxy.$modal.confirm(`是否复制计划"${response.data.title}"？`).then(() => {
      copyPlan(response.data.planId);
      proxy.$modal.msgSuccess('已复制上次计划');
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
  proxy.$modal.msgSuccess('表格已生成');
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
          proxy.$modal.msgSuccess("修改成功");
          router.push('/business/maintenance/plan');
        });
      } else {
        addMaintenance(form.value).then((res) => {
          proxy.$modal.msgSuccess("新增成功");
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
  proxy.$modal.confirm('确定要取消吗？未保存的数据将丢失').then(() => {
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