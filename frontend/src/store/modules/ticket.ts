import { defineStore } from 'pinia'

export interface Ticket {
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

function loadPersisted(): Ticket[] {
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

function persist(list: Ticket[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

export const useTicketStore = defineStore('ticketStore', {
  state: () => ({
    tickets: loadPersisted() as Ticket[]
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
  add(ticket: Omit<Ticket, 'ticketId' | 'ticketNo'>) {
      const now = Date.now()
      const newTicket: Ticket = {
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
    update(ticket: Ticket) {
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
