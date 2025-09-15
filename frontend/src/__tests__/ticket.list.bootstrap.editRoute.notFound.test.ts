import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

const replace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
  useRoute: () => ({ name: 'TicketEdit', params: { ticketId: 999 }, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 5, title: 'E' } ], total: 1 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list bootstrap via edit route (not found)', () => {
  it('redirects to list when ticket not found', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const vm: any = app.mount(document.createElement('div'))
    await nextTick(); await Promise.resolve(); await Promise.resolve()
    expect(replace).toHaveBeenCalledWith('/business/ticket/list')
  })
})

