/**
 * 工单Store模块
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ticket, TicketQuery, TicketSummary, TicketAnalytics, TicketCreateDto, TicketUpdateDto } from '@/types/api/ticket'
import type { PageResult } from '@/types/api/common'
import { 
  listTicket, 
  getTicket, 
  addTicket, 
  updateTicket,
  delTicket,
  assignTickets,
  getTicketSummary,
  getTicketAnalytics,
  getPendingCount
} from '@/api/ticket'
import useUserStore from './user'

export const useTicketStore = defineStore('ticket', () => {
  // 状态
  const tickets = ref<Ticket[]>([])
  const currentTicket = ref<Ticket | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const summary = ref<TicketSummary | null>(null)
  const analytics = ref<TicketAnalytics | null>(null)
  const pendingCount = ref(0)
  
  // 缓存时间戳
  const lastFetchTime = ref(0)
  const CACHE_DURATION = 10 * 1000 // 10秒缓存
  
  // 计算属性
  const pendingTickets = computed(() => 
    tickets.value.filter(t => t.status === 'pending')
  )
  
  const myTickets = computed(() => {
    const userStore = useUserStore()
    return tickets.value.filter(t => t.assigneeId === userStore.id)
  })
  
  const overdueTickets = computed(() => 
    tickets.value.filter(t => {
      if (!t.deadline) return false
      return new Date(t.deadline) < new Date()
    })
  )
  
  // Actions
  async function fetchTickets(query: TicketQuery, force = false): Promise<PageResult<Ticket>> {
    // 缓存策略
    if (!force && Date.now() - lastFetchTime.value < CACHE_DURATION) {
      return { rows: tickets.value, total: total.value }
    }
    
    loading.value = true
    try {
      const res = await listTicket(query)
      tickets.value = res.rows
      total.value = res.total
      lastFetchTime.value = Date.now()
      return res
    } finally {
      loading.value = false
    }
  }
  
  async function fetchTicketDetail(id: string | number): Promise<Ticket> {
    loading.value = true
    try {
      const res = await getTicket(id)
      currentTicket.value = res.data
      return res.data
    } finally {
      loading.value = false
    }
  }
  
  async function createTicket(data: TicketCreateDto): Promise<Ticket> {
    loading.value = true
    try {
      const res = await addTicket(data)
      // 添加到列表
      tickets.value.unshift(res.data)
      total.value++
      return res.data
    } finally {
      loading.value = false
    }
  }
  
  async function modifyTicket(data: TicketUpdateDto): Promise<void> {
    loading.value = true
    try {
      await updateTicket(data)
      // 更新列表中的数据
      const index = tickets.value.findIndex(t => t.id === data.id)
      if (index > -1) {
        tickets.value[index] = { ...tickets.value[index], ...data } as Ticket
      }
      // 更新当前详情
      if (currentTicket.value?.id === data.id) {
        currentTicket.value = { ...currentTicket.value, ...data } as Ticket
      }
    } finally {
      loading.value = false
    }
  }
  
  async function removeTicket(id: string | number): Promise<void> {
    loading.value = true
    try {
      await delTicket(id)
      // 从列表中移除
      const index = tickets.value.findIndex(t => t.id === id)
      if (index > -1) {
        tickets.value.splice(index, 1)
        total.value--
      }
    } finally {
      loading.value = false
    }
  }
  
  async function batchAssign(ids: Array<string | number>, assigneeId: string | number): Promise<void> {
    loading.value = true
    try {
      await assignTickets({ ids, assigneeId, remark: '' })
      // 更新列表中的指派人
      tickets.value.forEach(t => {
        if (ids.includes(t.id)) {
          t.assigneeId = assigneeId
        }
      })
    } finally {
      loading.value = false
    }
  }
  
  async function fetchSummary(force = false): Promise<TicketSummary | null> {
    // 首页10秒软缓存
    if (!force && summary.value && Date.now() - lastFetchTime.value < CACHE_DURATION) {
      return summary.value
    }
    
    try {
      const res = await getTicketSummary()
      summary.value = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch ticket summary:', error)
      return null
    }
  }
  
  async function fetchAnalytics(params?: { beginTime?: string; endTime?: string }): Promise<TicketAnalytics | null> {
    try {
      const res = await getTicketAnalytics(params)
      analytics.value = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch ticket analytics:', error)
      return null
    }
  }
  
  async function fetchPendingCount(): Promise<number> {
    try {
      const res = await getPendingCount()
      pendingCount.value = res.data
      return res.data
    } catch (error) {
      console.error('Failed to fetch pending count:', error)
      return 0
    }
  }
  
  // 清理函数
  function clearCache(): void {
    lastFetchTime.value = 0
    summary.value = null
    analytics.value = null
  }
  
  function reset(): void {
    tickets.value = []
    currentTicket.value = null
    total.value = 0
    summary.value = null
    analytics.value = null
    pendingCount.value = 0
    clearCache()
  }
  
  return {
    // State
    tickets,
    currentTicket,
    loading,
    total,
    summary,
    analytics,
    pendingCount,
    
    // Computed
    pendingTickets,
    myTickets,
    overdueTickets,
    
    // Actions
    fetchTickets,
    fetchTicketDetail,
    createTicket,
    modifyTicket,
    removeTicket,
    batchAssign,
    fetchSummary,
    fetchAnalytics,
    fetchPendingCount,
    clearCache,
    reset
  }
})

// 兼容旧版本的store（已废弃）
export interface LegacyTicket {
  ticketId: number
  ticketNo: string
  title: string
  status: string
  priority: string
  equipment?: string
  reporter?: string
  specialty?: string
  assigneeName?: string
  createTime?: string
  deadline?: string
  description?: string
  emergencyAction?: string
  discoveryTime?: string
  [key: string]: any
}

const LS_KEY = 'IDC_TICKETS'

function loadPersisted(): LegacyTicket[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
  } catch {
    /* ignore */
  }
  return []
}

function persist(list: LegacyTicket[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

// DEPRECATED store（保留运行期避免旧页面引用报错）
export const useLegacyTicketStore = defineStore('ticketStore', {
  state: () => ({
    tickets: loadPersisted() as LegacyTicket[]
  }),
  actions: {
    ensureSeed() {
      if (this.tickets.length === 0) {
        this.tickets = [
          { ticketId: 1, ticketNo: 'TK202501001', title: '空调漏水处理', status: 'pending', priority: 'high', equipment: '空调01', reporter: '张三', specialty: 'hvac', createTime: '2024-01-20 10:00:00', deadline: '2024-01-21 10:00:00' },
          { ticketId: 2, ticketNo: 'TK202501002', title: 'UPS电池更换', status: 'processing', priority: 'medium', equipment: 'UPS-A', reporter: '王五', assigneeName: '赵六', specialty: 'power', createTime: '2024-01-20 11:00:00', deadline: '2024-01-21 11:00:00' },
          { ticketId: 3, ticketNo: 'TK202501003', title: '消防系统检测', status: 'completed', priority: 'low', equipment: '烟感器', reporter: '李四', assigneeName: '钱七', specialty: 'fire', createTime: '2024-01-19 09:00:00', deadline: '2024-01-20 09:00:00' }
        ]
        persist(this.tickets)
      }
    },
    add(ticket: Omit<LegacyTicket, 'ticketId' | 'ticketNo'>) {
      const now = Date.now()
      const newTicket: LegacyTicket = {
        title: ticket.title || '未命名工单',
        status: (ticket as any).status || 'pending',
        priority: ticket.priority || 'medium',
        ticketId: now,
        ticketNo: 'TK' + now,
        equipment: ticket.equipment,
        reporter: ticket.reporter,
        specialty: ticket.specialty,
        assigneeName: (ticket as any).assigneeName,
        createTime: ticket.createTime,
        deadline: ticket.deadline,
        description: ticket.description,
        emergencyAction: ticket.emergencyAction,
        discoveryTime: ticket.discoveryTime
      }
      this.tickets.push(newTicket)
      persist(this.tickets)
      return newTicket
    },
    update(ticket: LegacyTicket) {
      const idx = this.tickets.findIndex(t => t.ticketId === ticket.ticketId)
      if (idx > -1) {
        this.tickets[idx] = { ...this.tickets[idx], ...ticket }
        persist(this.tickets)
      }
    },
    remove(ids: number[]) {
      this.tickets = this.tickets.filter(t => !ids.includes(t.ticketId))
      persist(this.tickets)
    },
    getById(id: number) {
      return this.tickets.find(t => t.ticketId === id)
    }
  }
})
