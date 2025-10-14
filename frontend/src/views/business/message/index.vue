<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>{{ $t('business.message.title') }}</span>
          <div class="ops">
            <el-select v-model="filters.readFlag" size="small" style="width:120px;margin-right:8px" @change="reload">
              <el-option :label="$t('business.message.readStatus.unread')" value="N" />
              <el-option :label="$t('business.message.readStatus.all')" value="ALL" />
              <el-option :label="$t('business.message.readStatus.read')" value="Y" />
            </el-select>
            <el-select v-model="filters.type" size="small" clearable :placeholder="$t('business.message.placeholder.type')" style="width:160px;margin-right:8px" @change="reload">
              <el-option :label="$t('business.message.type.slaWarn')" value="sla_warn" />
              <el-option :label="$t('business.message.type.slaOverdue')" value="sla_overdue" />
              <el-option :label="$t('business.message.type.assign')" value="assign" />
              <el-option :label="$t('business.message.type.start')" value="start" />
              <el-option :label="$t('business.message.type.complete')" value="complete" />
              <el-option :label="$t('business.message.type.close')" value="close" />
              <el-option :label="$t('business.message.type.reopen')" value="reopen" />
            </el-select>
            <el-button size="small" @click="getList">{{ $t('business.message.action.refresh') }}</el-button>
            <el-button type="primary" size="small" @click="readAll" v-if="filters.readFlag==='N'" >{{ $t('business.message.action.markAllRead') }}</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column :label="$t('business.message.field.type')" prop="type" width="120" />
        <el-table-column :label="$t('business.message.field.title')" prop="title" />
        <el-table-column :label="$t('business.message.field.content')" prop="content" />
        <el-table-column :label="$t('business.message.field.createTime')" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('common.action')" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="read(scope.row.msgId)">{{ $t('business.message.action.markRead') }}</el-button>
            <el-button v-if="scope.row.bizType==='ticket'" type="primary" link @click="open(scope.row)">{{ $t('business.message.action.view') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="query.pageNum"
        v-model:limit="query.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup name="MessageCenter">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { parseTime } from '@/utils/ruoyi'
import { getUnreadMessages, markRead, getMessages, markAllRead } from '@/api/business/message'

const { t } = useI18n()
const { proxy } = getCurrentInstance()
const router = useRouter()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const query = ref({ pageNum:1, pageSize:10 })
const filters = ref({ readFlag:'N', type:'' })

async function getList(){
  loading.value = true
  try {
    const params = { pageNum: query.value.pageNum, pageSize: query.value.pageSize }
    let res
    if (filters.value.readFlag === 'N') {
      res = await getUnreadMessages(params)
    } else {
      res = await getMessages({ ...params, readFlag: filters.value.readFlag, type: filters.value.type })
    }
    list.value = res.rows || res.data || []
    total.value = res.total || 0
  } finally { loading.value = false }
}
async function read(id){
  await markRead(id)
  proxy.$modal.msgSuccess(t('business.message.message.markedRead'))
  getList()
}
async function readAll(){ await markAllRead(); proxy.$modal.msgSuccess(t('business.message.message.allMarkedRead')); getList() }
function reload(){ query.value.pageNum = 1; getList() }
function open(row){ if (row && row.bizType==='ticket' && row.bizId){ router.push(`/business/ticket/detail/${row.bizId}`) } }
onMounted(getList)
</script>

<style scoped>
</style>
