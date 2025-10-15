import { ref, reactive, type Ref } from 'vue'
import { track } from '@/infra/telemetry'

export interface UseTicketListParams {
  listTicket: (params: any) => Promise<any>
  getOverdueTickets: (params: any) => Promise<any>
  getNearDueTickets: (params: any) => Promise<any>
  withMineOnly: (params: any, isAdmin: any) => any
  isAdmin: Ref<boolean> | { value: boolean }
}

export function useTicketList(params: UseTicketListParams) {
  const { listTicket, getOverdueTickets, getNearDueTickets, withMineOnly, isAdmin } = params

  // 列表数据
  const ticketList = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const dateRange = ref<string[]>([])
  const specialMode = ref<string>('')

  // 查询参数
  const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    keyword: undefined,
    ticketNo: undefined,
    title: undefined,
    status: undefined,
    reporterName: undefined,
    equipment: undefined,
    specialty: undefined,
    assigneeName: undefined,
    orderByColumn: undefined,
    isAsc: undefined
  })

  // 查询去抖定时器
  let fetchTimer = 0

  /** 查询工单列表 */
  async function getList() {
    try {
      loading.value = true
      const t0 = Date.now()

      // 构建查询参数
      let baseParams = { ...queryParams.value }

      // 添加关键词搜索
      if (baseParams.keyword) {
        baseParams['params[keyword]'] = baseParams.keyword
        delete baseParams.keyword
      }

      // 添加日期范围
      if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
        baseParams['params[beginTime]'] = dateRange.value[0]
        baseParams['params[endTime]'] = dateRange.value[1]
      }

      // 应用 mineOnly 权限过滤
      const finalParams = withMineOnly(baseParams, isAdmin)

      // 根据特殊模式选择不同的 API
      let response
      if (specialMode.value === 'overdue') {
        track('request', { scene: 'ticket_list', action: 'fetch_overdue' })
        response = await getOverdueTickets(finalParams)
      } else if (specialMode.value === 'neardue') {
        track('request', { scene: 'ticket_list', action: 'fetch_neardue' })
        response = await getNearDueTickets(finalParams)
      } else {
        track('request', { scene: 'ticket_list', action: 'fetch_list' })
        response = await listTicket(finalParams)
      }

      // 解析响应数据
      const data = response?.data || response
      ticketList.value = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : [])
      total.value = data?.total || ticketList.value.length || 0

      track('success', {
        scene: 'ticket_list',
        action: 'fetch_list',
        mode: specialMode.value || 'normal',
        durationMs: Math.max(0, Date.now() - t0),
        count: ticketList.value.length
      })
    } catch (error) {
      console.error('[useTicketList] fetch failed:', error)
      ticketList.value = []
      total.value = 0
      track('error', {
        scene: 'ticket_list',
        action: 'fetch_list',
        errorMessage: String(error && (error as any).message || error)
      })
    } finally {
      loading.value = false
    }
  }

  /** 查询去抖：避免快速重复点击触发多次请求 */
  function scheduleFetch() {
    if (fetchTimer) clearTimeout(fetchTimer)
    fetchTimer = window.setTimeout(() => {
      fetchTimer = 0
      getList()
    }, 300)
  }

  /** 应用特殊模式（过期/临期） */
  function applySpecialMode(mode: string) {
    specialMode.value = String(mode || '')
    queryParams.value.pageNum = 1
    getList()
  }

  /** 处理排序变化 */
  function handleSortChange({ prop, order }: { prop?: string; order?: string }) {
    if (!prop) {
      queryParams.value.orderByColumn = undefined
      queryParams.value.isAsc = undefined
    } else {
      queryParams.value.orderByColumn = prop
      queryParams.value.isAsc = order === 'ascending' ? 'asc' : 'desc'
    }
    getList()
  }

  return {
    ticketList,
    loading,
    total,
    dateRange,
    specialMode,
    queryParams,
    getList,
    scheduleFetch,
    applySpecialMode,
    handleSortChange
  }
}

export default useTicketList
