<template>
  <div class="app-container">
    <el-form :inline="true" :model="query" class="mb8">
      <el-form-item label="机房" prop="roomId">
        <el-select v-model="query.roomId" clearable placeholder="请选择机房" style="width:200px">
          <el-option v-for="r in rooms" :key="r.roomId" :label="r.name" :value="r.roomId" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="query.status" clearable placeholder="请选择状态" style="width:160px">
          <el-option label="正常" value="normal" />
          <el-option label="预留" value="reserved" />
          <el-option label="故障" value="fault" />
          <el-option label="下线" value="offline" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">查询</el-button>
        <el-button icon="Refresh" @click="reset">重置</el-button>
        <el-button icon="Download" @click="exportList">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" @row-dblclick="openDetail">
      <el-table-column label="机柜编号" prop="code" width="140"/>
      <el-table-column label="机房" prop="roomId" width="120">
        <template #default="scope">{{ roomName(scope.row.roomId) }}</template>
      </el-table-column>
      <el-table-column label="总U" prop="uTotal" width="80"/>
      <el-table-column label="占用率" prop="occupancyRate" width="120">
        <template #default="scope">
          <el-progress :percentage="Math.round((scope.row.occupancyRate||0)*100)" :text-inside="true" />
        </template>
      </el-table-column>
      <el-table-column label="额定功率(W)" prop="powerRated" width="120"/>
      <el-table-column label="当前功率(W)" prop="powerCurrent" width="120"/>
      <el-table-column label="状态" prop="status" width="100"/>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" link @click="openDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="RackList">
import { ref, onMounted } from 'vue'
import { listRooms, listRacks } from '@/api/business/asset'
import { useRouter } from 'vue-router'
const router = useRouter()
const rooms = ref([])
const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = ref({ pageNum:1, pageSize:10, roomId: undefined, status: undefined })

function roomName(id){ const r = rooms.value.find(x=>x.roomId===id); return r? r.name : id }
function openDetail(row){ router.push(`/business/asset/rack/detail/${row.rackId}`) }

async function loadRooms(){ const r = await listRooms({ pageNum:1, pageSize:999 }); rooms.value = r.rows||r.data||[] }
async function getList(){ loading.value=true; try { const r = await listRacks({ ...query.value }); list.value = r.rows||r.data||[]; total.value = r.total||0 } finally { loading.value=false } }
function reset(){ query.value={ pageNum:1, pageSize:10, roomId: undefined, status: undefined }; getList() }
function exportList(){ window.alert('导出功能待实现') }

onMounted(async ()=>{ await loadRooms(); await getList() })
</script>

<style scoped>
</style>

