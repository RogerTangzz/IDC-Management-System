import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 1, ticketNo: 'T-1', title: 'A' } ], total: 1 })
const overdueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const neardueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => neardueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list basic', () => {
  it('mounts and loads list; sort change maps fields', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()

    const st = vm.$.setupState
    expect(Array.isArray(st.ticketList)).toBe(true)
    expect(st.ticketList.length).toBeGreaterThanOrEqual(1)
    expect(st.total).toBe(1)

    // sort change mapping via util
    await st.handleSortChange({ prop: 'lastStatusTime', order: 'ascending' })
    expect(st.queryParams.isAsc).toBe('asc')
    expect(st.queryParams.orderByColumn).toBe('last_status_time')
    expect(listSpy).toHaveBeenCalled()
  })
})

