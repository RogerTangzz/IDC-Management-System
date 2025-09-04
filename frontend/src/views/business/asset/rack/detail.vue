<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>机柜 U 位图 - #{{ rackId }}</span>
          <div>
            <el-button type="primary" @click="applyOccupy">占用所选</el-button>
            <el-button @click="applyRelease">释放所选</el-button>
            <el-button @click="getUnits">刷新</el-button>
          </div>
        </div>
      </template>
      <div class="rack">
        <div v-for="u in units" :key="u.uIndex" class="urow" :class="{ occ: u.occupied==='Y', sel: selected.has(u.uIndex) }" @click="toggle(u.uIndex)">
          <div class="u-index">U{{ u.uIndex }}</div>
          <div class="u-body">
            <div class="u-label">{{ u.label || (u.occupied==='Y'?'占用':'空闲') }}</div>
            <div class="u-owner" v-if="u.owner">{{ u.owner }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="RackDetail">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRackUnits, occupyUnits } from '@/api/business/asset'
const route = useRoute()
const rackId = route.params.rackId
const units = ref([])
const selected = ref(new Set())

async function getUnits(){ const r = await getRackUnits(rackId); units.value = (r.data||r)||[] }
function toggle(idx){ if (selected.value.has(idx)) selected.value.delete(idx); else selected.value.add(idx) }
async function applyOccupy(){ await apply('Y') }
async function applyRelease(){ await apply('N') }
async function apply(flag){
  if (selected.value.size===0) return
  const body = Array.from(selected.value).map(u=>({ uIndex: u, occupied: flag }))
  await occupyUnits(rackId, body)
  selected.value.clear()
  await getUnits()
}
onMounted(getUnits)
</script>

<style scoped>
.header { display:flex; justify-content:space-between; align-items:center; }
.rack { display:flex; flex-direction:column; width: 360px; border:1px solid #ddd; padding:4px; }
.urow { display:flex; border:1px solid #eee; margin:2px 0; cursor:pointer; }
.urow.sel { outline:2px solid #409EFF; }
.urow.occ { background:#fde2e2; }
.u-index { width:60px; text-align:center; background:#f5f7fa; padding:6px 0; font-weight:bold; }
.u-body { flex:1; padding:6px; display:flex; justify-content:space-between; }
.u-label { color:#606266; }
.u-owner { color:#909399; }
</style>

