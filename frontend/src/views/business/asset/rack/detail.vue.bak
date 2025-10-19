<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>{{ $t('business.asset.rack.detail.title') }} - #{{ rackId }}</span>
          <div>
            <el-button type="primary" @click="applyOccupy">{{ $t('business.asset.rack.action.occupy') }}</el-button>
            <el-button @click="applyRelease">{{ $t('business.asset.rack.action.release') }}</el-button>
            <el-button @click="getUnits">{{ $t('business.asset.rack.action.refresh') }}</el-button>
          </div>
        </div>
      </template>
      <div class="rack">
        <div v-for="u in units" :key="u.uIndex" class="urow" :class="{ occ: u.occupied==='Y', sel: selected.has(u.uIndex) }" @click="toggle(u.uIndex)">
          <div class="u-index">{{ $t('business.asset.rack.field.uIndex') }}{{ u.uIndex }}</div>
          <div class="u-body">
            <div class="u-label">{{ u.label || (u.occupied==='Y' ? $t('business.asset.rack.uStatus.occupied') : $t('business.asset.rack.uStatus.free')) }}</div>
            <div class="u-owner" v-if="u.owner">{{ u.owner }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="RackDetail">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getRackUnits, occupyUnits } from '@/api/business/asset'

const { t } = useI18n()
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

