<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>消息中心</span>
          <div class="ops">
            <el-select v-model="filters.readFlag" size="small" style="width:120px;margin-right:8px" @change="reload">
              <el-option label="未读" value="N" />
              <el-option label="全部" value="ALL" />
              <el-option label="已读" value="Y" />
            </el-select>
            <el-select v-model="filters.type" size="small" clearable placeholder="类型" style="width:160px;margin-right:8px" @change="reload">
              <el-option label="SLA预警" value="sla_warn" />
              <el-option label="已超时" value="sla_overdue" />
              <el-option label="指派" value="assign" />
              <el-option label="开始处理" value="start" />
              <el-option label="完成" value="complete" />
              <el-option label="关闭" value="close" />
              <el-option label="重新打开" value="reopen" />
            </el-select>
            <el-button size="small" @click="getList">刷新</el-button>
            <el-button type="primary" size="small" @click="readAll" v-if="filters.readFlag==='N'" >全部标记已读</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column label="类型" prop="type" width="120" />
        <el-table-column label="标题" prop="title" />
        <el-table-column label="内容" prop="content" />
        <el-table-column label="时间" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="read(scope.row.msgId)">标记已读</el-button>
            <el-button v-if="scope.row.bizType==='ticket'" type="primary" link @click="open(scope.row)">查看</el-button>
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
import { useRouter } from 'vue-router'
import { parseTime } from '@/utils/ruoyi'
import { getUnreadMessages, markRead, getMessages, markAllRead } from '@/api/business/message'
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
  proxy.$modal.msgSuccess('已标记已读')
  getList()
}
async function readAll(){ await markAllRead(); proxy.$modal.msgSuccess('全部已读'); getList() }
function reload(){ query.value.pageNum = 1; getList() }
function open(row){ if (row && row.bizType==='ticket' && row.bizId){ router.push(`/business/ticket/detail/${row.bizId}`) } }
onMounted(getList)
</script>

<style scoped>
</style>
