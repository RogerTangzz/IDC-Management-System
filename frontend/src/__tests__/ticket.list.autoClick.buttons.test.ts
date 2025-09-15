import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.useFakeTimers()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })

const overdueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const neardueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => neardueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list autoClick buttons debounce', () => {
  it('debounces handleQuery rapid clicks', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    const before = listSpy.mock.calls.length

    // rapid clicks
    st.handleQuery(); st.handleQuery(); st.handleQuery()
    // timers not advanced yet
    expect(listSpy.mock.calls.length).toBe(before)

    // advance debounce window
    vi.advanceTimersByTime(60)
    await Promise.resolve(); await Promise.resolve()

    // only one additional fetch
    expect(listSpy.mock.calls.length - before).toBe(1)
  })
})
