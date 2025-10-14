<template>
  <div class="app-container">
    <el-form :inline="true" :model="query" class="mb8">
      <el-form-item :label="$t('business.asset.rack.field.roomId')" prop="roomId">
        <el-select v-model="query.roomId" clearable :placeholder="$t('business.asset.rack.placeholder.selectRoom')" style="width:200px">
          <el-option v-for="r in rooms" :key="r.roomId" :label="r.name" :value="r.roomId" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('business.asset.rack.field.status')" prop="status">
        <el-select v-model="query.status" clearable :placeholder="$t('business.asset.rack.placeholder.selectStatus')" style="width:160px">
          <el-option :label="$t('business.asset.rack.status.normal')" value="normal" />
          <el-option :label="$t('business.asset.rack.status.reserved')" value="reserved" />
          <el-option :label="$t('business.asset.rack.status.fault')" value="fault" />
          <el-option :label="$t('business.asset.rack.status.offline')" value="offline" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">{{ $t('business.asset.rack.action.query') }}</el-button>
        <el-button icon="Refresh" @click="reset">{{ $t('business.asset.rack.action.reset') }}</el-button>
        <el-button icon="Download" @click="exportList">{{ $t('business.asset.rack.action.export') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" @row-dblclick="openDetail">
      <el-table-column :label="$t('business.asset.rack.field.code')" prop="code" width="140"/>
      <el-table-column :label="$t('business.asset.rack.field.roomId')" prop="roomId" width="120">
        <template #default="scope">{{ roomName(scope.row.roomId) }}</template>
      </el-table-column>
      <el-table-column :label="$t('business.asset.rack.field.uTotal')" prop="uTotal" width="80"/>
      <el-table-column :label="$t('business.asset.rack.field.occupancyRate')" prop="occupancyRate" width="120">
        <template #default="scope">
          <el-progress :percentage="Math.round((scope.row.occupancyRate||0)*100)" :text-inside="true" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('business.asset.rack.field.powerRated')" prop="powerRated" width="120"/>
      <el-table-column :label="$t('business.asset.rack.field.powerCurrent')" prop="powerCurrent" width="120"/>
      <el-table-column :label="$t('business.asset.rack.field.status')" prop="status" width="100"/>
      <el-table-column :label="$t('common.action')" width="120">
        <template #default="scope">
          <el-button type="primary" link @click="openDetail(scope.row)">{{ $t('business.asset.rack.action.detail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="RackList">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { listRooms, listRacks } from '@/api/business/asset'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const { proxy } = getCurrentInstance()
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
function exportList(){ window.alert(t('business.asset.rack.message.exportNotImplemented')) }

onMounted(async ()=>{ await loadRooms(); await getList() })
</script>

<style scoped>
</style>

