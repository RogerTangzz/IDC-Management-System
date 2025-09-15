import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketEdit', params: { ticketId: 5 }, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 5, title: 'E' } ], total: 1 })
const overdueSpy = vi.fn().mockResolvedValue({ data: [], total: 0 })
const nearDueSpy = vi.fn().mockResolvedValue({ data: [], total: 0 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => nearDueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list bootstrap via edit route', () => {
  it('auto opens edit dialog when entering via TicketEdit route', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const vm: any = app.mount(document.createElement('div'))
    await nextTick(); await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    expect(st.open).toBe(true)
    expect(st.title).toBe('修改工单')
  })
})

