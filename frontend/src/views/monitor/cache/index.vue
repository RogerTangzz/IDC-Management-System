<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header><Monitor style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">{{ t('monitor.cache.title.basicInfo') }}</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.redisVersion') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.redis_version }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.runMode') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.redis_mode == "standalone" ? t('monitor.cache.value.standalone') : t('monitor.cache.value.cluster') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.port') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.tcp_port }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.clientCount') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.connected_clients }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.uptime') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.uptime_in_days }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.usedMemory') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.used_memory_human }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.usedCpu') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.memoryConfig') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.maxmemory_human }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.aofEnabled') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.aof_enabled == "0" ? t('monitor.cache.value.no') : t('monitor.cache.value.yes') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.rdbStatus') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.rdb_last_bgsave_status }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.keyCount') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.dbSize">{{ cache.dbSize }} </div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ t('monitor.cache.field.networkIO') }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="cache.info">{{ cache.info.instantaneous_input_kbps }}kps/{{cache.info.instantaneous_output_kbps}}kps</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><PieChart style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">{{ t('monitor.cache.title.commandStats') }}</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><Odometer style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">{{ t('monitor.cache.title.memoryInfo') }}</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache">
import { getCache } from '@/api/monitor/cache'
import * as echarts from 'echarts'

const cache = ref([])
const commandstats = ref(null)
const usedmemory = ref(null)
const { proxy } = getCurrentInstance()
const { t } = useI18n()

function getList() {
  proxy.$modal.loading(t('monitor.cache.message.loading'))
  getCache().then(response => {
    proxy.$modal.closeLoading()
    cache.value = response.data

    const commandstatsIntance = echarts.init(commandstats.value, "macarons")
    commandstatsIntance.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      series: [
        {
          name: t('monitor.cache.value.command'),
          type: "pie",
          roseType: "radius",
          radius: [15, 95],
          center: ["50%", "38%"],
          data: response.data.commandStats,
          animationEasing: "cubicInOut",
          animationDuration: 1000
        }
      ]
    })
    const usedmemoryInstance = echarts.init(usedmemory.value, "macarons")
    usedmemoryInstance.setOption({
      tooltip: {
        formatter: "{b} <br/>{a} : " + cache.value.info.used_memory_human
      },
      series: [
        {
          name: t('monitor.cache.value.peak'),
          type: "gauge",
          min: 0,
          max: 1000,
          detail: {
            formatter: cache.value.info.used_memory_human
          },
          data: [
            {
              value: parseFloat(cache.value.info.used_memory_human),
              name: t('monitor.cache.value.memoryUsage')
            }
          ]
        }
      ]
    })
    window.addEventListener("resize", () => {
      commandstatsIntance.resize()
      usedmemoryInstance.resize()
    })
  })
}

getList()
</script>
