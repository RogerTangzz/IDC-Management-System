import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 1, title: 'A' }, { ticketId: 2, title: 'B' } ], total: 2 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: vi.fn(),
  getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list actions more', () => {
  it('selection toggles single/multiple flags as expected', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // none selected
    st.handleSelectionChange([])
    expect(st.single).toBe(true)
    expect(st.multiple).toBe(true)

    // one selected => enable single action, disable multiple
    st.handleSelectionChange([{ ticketId: 1 }])
    expect(st.single).toBe(false)
    expect(st.multiple).toBe(false)

    // two selected => disable single actions, enable batch actions
    st.handleSelectionChange([{ ticketId: 1 }, { ticketId: 2 }])
    expect(st.single).toBe(true)
    expect(st.multiple).toBe(false)
  })
})

