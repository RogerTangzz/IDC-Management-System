<template>
  <div class="app-container home">
    <el-row :gutter="20" class="ticket-summary-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in summaryCards" :key="card.key">
        <el-card shadow="hover" class="ticket-summary-card">
          <div class="meta">
            <div class="value">{{ card.value }}</div>
            <div class="label">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ticketSummary } from '@/api/business/ticket'
import request from '@/utils/request'
import { onMounted, ref } from 'vue'

const summary = ref({ byStatus:{}, byPriority:{}, todayNew:0, todayCompleted:0 })
const summaryCards = ref([
  { key:'todayNew', label:'今日新增工单', value:0 },
  { key:'todayCompleted', label:'今日完成工单', value:0 },
  { key:'open', label:'进行中(非关闭)工单', value:0 },
  { key:'nearDue', label:'即将超时', value:0 },
  { key:'overdue', label:'已逾期待办', value:0 },
  { key:'unread', label:'未读消息', value:0 }
])

async function loadSummary(){
  try {
    const { data } = await ticketSummary()
    summary.value = data || summary.value
  const byStatus = data.byStatus || {}
  const openCount = Object.keys(byStatus).filter(s=> s && s!=='closed').reduce((acc,s)=>acc + (byStatus[s]||0),0)
  const overdue = data.overdue ?? 0
    const unread = await request({ url: '/business/message/countUnread', method:'get' }).then(r=> r.data || 0).catch(()=>0)
    summaryCards.value = [
      { key:'todayNew', label:'今日新增工单', value:data.todayNew||0 },
      { key:'todayCompleted', label:'今日完成工单', value:data.todayCompleted||0 },
      { key:'open', label:'进行中(非关闭)工单', value:openCount },
      { key:'nearDue', label:'即将超时', value:data.nearDue||0 },
      { key:'overdue', label:'已逾期待办', value:overdue },
      { key:'unread', label:'未读消息', value:unread }
    ]
  } catch(e){ /* ignore */ }
}

onMounted(()=>{ loadSummary() })
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  .ticket-summary-row {
    margin-bottom: 16px;
  }

  .ticket-summary-card {
    text-align: center;

    .meta {
      padding: 6px 0;
    }

    .value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
    }

    .label {
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
