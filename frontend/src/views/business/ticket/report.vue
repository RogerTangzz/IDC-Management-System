<template>
  <div class="app-container">
    <el-row :gutter="20" class="mb8">
      <el-col :span="24" class="mb8">
        <el-form :inline="true">
          <el-form-item label="时间范围">
            <el-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="reload">查询</el-button>
            <el-button icon="Download" @click="exportReport">导出</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>处理时长分布</span></template>
          <div ref="durationRef" style="height:320px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span>SLA 统计</span></template>
          <div ref="slaRef" style="height:320px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span>近7日趋势</span></template>
          <div ref="trendRef" style="height:320px"></div>
        </el-card>
      </el-col>
    </el-row>
    <div class="mt20">
      <el-button type="primary" icon="Refresh" @click="reload">刷新</el-button>
      <el-button icon="Back" @click="goBack">返回</el-button>
    </div>
  </div>
 </template>

<script setup name="TicketReport">
import { ref, onMounted, getCurrentInstance, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ticketAnalytics } from '@/api/business/ticket'
import request from '@/utils/request'
import * as echarts from 'echarts'
const analytics = ref({ duration:{}, sla:{} })
const { proxy } = getCurrentInstance()
const router = useRouter()
const durationRef = ref(null)
const slaRef = ref(null)
const trendRef = ref(null)
const range = ref([])

function formatRate(r){
  const n = Number(r||0)
  return (n*100).toFixed(1) + '%'
}

async function load(){
  try {
    const params = {}
    if (range.value && range.value.length===2){
      params.beginTime = `${range.value[0]} 00:00:00`
      params.endTime = `${range.value[1]} 23:59:59`
    }
    const res = await ticketAnalytics(params)
    analytics.value = res.data || { duration:{}, sla:{} }
    await nextTick()
    renderCharts()
    attachSlaClick()
  } catch(e) {
    proxy.$modal.msgError('加载失败')
  }
}
function reload(){ load() }
function goBack(){ history.back() }

onMounted(load)

function renderCharts(){
  // Duration bar
  if (durationRef.value){
    const d = analytics.value.duration || {}
    const chart = echarts.init(durationRef.value)
    chart.setOption({
      tooltip: {},
      xAxis: { type: 'category', data: ['<1h','1-4h','4-8h','8-24h','>=24h'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [d.lt1h||0, d.bt1to4h||0, d.bt4to8h||0, d.bt8to24h||0, d.ge24h||0] }]
    })
  }
  // SLA pie
  if (slaRef.value){
    const s = analytics.value.sla || {}
    const chart2 = echarts.init(slaRef.value)
    chart2.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        name: 'SLA', type: 'pie', radius: '60%',
        data: [
          { name: '有时限', value: s.withDeadline||0 },
          { name: '超时数量', value: s.timeoutCount||0 },
          { name: '按时完成', value: s.ontimeCompleted||0 }
        ]
      }]
    })
  }
}

// 绑定 SLA 图点击事件（下钻）
function attachSlaClick(){
  if (!slaRef.value) return
  try {
    const chart2 = echarts.getInstanceByDom(slaRef.value)
    if (!chart2) return
    chart2.off('click')
    chart2.on('click', (params)=>{
      const idx = typeof params?.dataIndex === 'number' ? params.dataIndex : -1
      if (idx === 1) {
        router.push({ path: '/business/ticket/list', query: { mode: 'overdue' } })
      } else if (idx === 0) {
        router.push({ path: '/business/ticket/list', query: { mode: 'neardue' } })
      }
    })
  } catch {}
}

// 趋势
onMounted(async ()=>{
  await renderTrend()
})

async function renderTrend(){
  const params = {}
  if (range.value && range.value.length===2){
    params.beginTime = `${range.value[0]} 00:00:00`
    params.endTime = `${range.value[1]} 23:59:59`
  }
  const r = await proxy.$axios?.get?.('/business/ticket/report/trend', { params })
    || await fetchTrend(params) // 兼容 request
  const data = r?.data || r || {}
  const days = []
  const createdMap = new Map((data.created||[]).map(o=>[o.d, o.v]))
  const completedMap = new Map((data.completed||[]).map(o=>[o.d, o.v]))
  const begin = new Date((params.beginTime||data.beginTime||'').replace(/-/g,'/'))
  const end = new Date((params.endTime||data.endTime||'').replace(/-/g,'/'))
  if (!isNaN(begin.getTime()) && !isNaN(end.getTime())){
    for (let d=new Date(begin); d<=end; d.setDate(d.getDate()+1)){
      const s = d.toISOString().slice(0,10)
      days.push(s)
    }
  }
  const created = days.map(d=> Number(createdMap.get(d)||0))
  const completed = days.map(d=> Number(completedMap.get(d)||0))
  await nextTick()
  if (trendRef.value){
    const chart = echarts.init(trendRef.value)
    chart.setOption({
      tooltip: { trigger:'axis' },
      legend: { data:['新增','完成'] },
      xAxis: { type:'category', data: days },
      yAxis: { type:'value' },
      series: [
        { name:'新增', type:'line', data: created },
        { name:'完成', type:'line', data: completed }
      ]
    })
  }
}

async function fetchTrend(params){
  // 使用全局 request 封装
  try { const r = await proxy.$axios?.get('/business/ticket/report/trend',{ params }); return r } catch {}
  try { return await (await import('@/utils/request')).default({ url:'/business/ticket/report/trend', method:'get', params }) } catch {}
}

async function exportReport(){
  const params = {}
  if (range.value && range.value.length===2){
    params.beginTime = `${range.value[0]} 00:00:00`
    params.endTime = `${range.value[1]} 23:59:59`
  }
  // 使用 RuoYi 封装的下载
  if (proxy?.download) proxy.download('/business/ticket/report/export', params, 'ticket_report.xlsx')
  else await request({ url:'/business/ticket/report/export', method:'get', params, responseType:'blob' })
}
</script>

<style scoped>
.mt20 { margin-top: 20px; }
</style>
