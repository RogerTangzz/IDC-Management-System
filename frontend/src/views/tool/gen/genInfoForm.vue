<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>{{ t('tool.gen.field.tplCategory') }}</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option :label="t('tool.gen.template.crud')" value="crud" />
            <el-option :label="t('tool.gen.template.tree')" value="tree" />
            <el-option :label="t('tool.gen.template.sub')" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>{{ t('tool.gen.field.tplWebType') }}</template>
          <el-select v-model="info.tplWebType">
            <el-option :label="t('tool.gen.webType.elementUi')" value="element-ui" />
            <el-option :label="t('tool.gen.webType.elementPlus')" value="element-plus" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            {{ t('tool.gen.field.packageName') }}
            <el-tooltip :content="t('tool.gen.placeholder.packageName')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            {{ t('tool.gen.field.moduleName') }}
            <el-tooltip :content="t('tool.gen.placeholder.moduleName')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            {{ t('tool.gen.field.businessName') }}
            <el-tooltip :content="t('tool.gen.placeholder.businessName')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            {{ t('tool.gen.field.functionName') }}
            <el-tooltip :content="t('tool.gen.placeholder.functionName')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            {{ t('tool.gen.field.genType') }}
            <el-tooltip :content="t('tool.gen.placeholder.genPath')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" value="0">{{ t('tool.gen.genType.zip') }}</el-radio>
          <el-radio v-model="info.genType" value="1">{{ t('tool.gen.genType.custom') }}</el-radio>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            {{ t('tool.gen.field.parentMenuId') }}
            <el-tooltip :content="t('tool.gen.placeholder.parentMenuId')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-tree-select v-model="info.parentMenuId" :data="menuOptions"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' }" value-key="menuId"
            :placeholder="t('tool.gen.placeholder.selectDict')" check-strictly />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            {{ t('tool.gen.field.genPath') }}
            <el-tooltip :content="t('tool.gen.placeholder.genPath')" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  {{ t('tool.gen.genPath.quickSelect') }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">{{ t('tool.gen.genPath.restoreDefault') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">{{ t('tool.gen.section.otherInfo') }}</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ t('tool.gen.field.treeCode') }}
              <el-tooltip :content="t('tool.gen.placeholder.treeCode')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" :placeholder="t('tool.gen.placeholder.selectDict')">
              <el-option v-for="(column, index) in info.columns" :key="index"
                :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ t('tool.gen.field.treeParentCode') }}
              <el-tooltip :content="t('tool.gen.placeholder.treeParentCode')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" :placeholder="t('tool.gen.placeholder.selectDict')">
              <el-option v-for="(column, index) in info.columns" :key="index"
                :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ t('tool.gen.field.treeName') }}
              <el-tooltip :content="t('tool.gen.placeholder.treeName')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" :placeholder="t('tool.gen.placeholder.selectDict')">
              <el-option v-for="(column, index) in info.columns" :key="index"
                :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">{{ t('tool.gen.section.relationInfo') }}</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ t('tool.gen.field.subTableName') }}
              <el-tooltip :content="t('tool.gen.placeholder.subTableName')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" :placeholder="t('tool.gen.placeholder.selectDict')" @change="subSelectChange">
              <el-option v-for="(table, index) in tables" :key="index"
                :label="table.tableName + '：' + table.tableComment" :value="table.tableName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              {{ t('tool.gen.field.subTableFkName') }}
              <el-tooltip :content="t('tool.gen.placeholder.subTableFkName')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" :placeholder="t('tool.gen.placeholder.selectDict')">
              <el-option v-for="(column, index) in subColumns" :key="index"
                :label="column.columnName + '：' + column.columnComment" :value="column.columnName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

  </el-form>
</template>

<script setup>
import { listMenu } from "@/api/system/menu"

const subColumns = ref([])
const menuOptions = ref([])
const { proxy } = getCurrentInstance()
const { t } = useI18n()

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  tables: {
    type: Array,
    default: null
  }
})

// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: t('tool.gen.validation.tplCategory'), trigger: "blur" }],
  packageName: [{ required: true, message: t('tool.gen.validation.packageName'), trigger: "blur" }],
  moduleName: [{ required: true, message: t('tool.gen.validation.moduleName'), trigger: "blur" }],
  businessName: [{ required: true, message: t('tool.gen.validation.businessName'), trigger: "blur" }],
  functionName: [{ required: true, message: t('tool.gen.validation.functionName'), trigger: "blur" }]
})

function subSelectChange() {
  props.info.subTableFkName = ""
}

function tplSelectChange(val) {
  if (val !== "sub") {
    props.info.subTableName = ""
    props.info.subTableFkName = ""
  }
}

function setSubTableColumns(val) {
  for (const item in props.tables) {
    const name = props.tables[item].tableName
    if (val === name) {
      subColumns.value = props.tables[item].columns
      break
    }
  }
}

/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  listMenu().then(response => {
    menuOptions.value = proxy.handleTree(response.data, "menuId")
  })
}

onMounted(() => {
  getMenuTreeselect()
})

watch(() => props.info.subTableName, val => {
  setSubTableColumns(val)
})

watch(() => props.info.tplWebType, val => {
  if (val === '') {
    props.info.tplWebType = "element-plus"
  }
})
</script>
