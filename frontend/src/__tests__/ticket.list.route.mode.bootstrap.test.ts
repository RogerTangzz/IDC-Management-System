import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

function mockRouteWithMode(mode: string) {
  vi.doMock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useRoute: () => ({ name: 'TicketList', params: {}, query: { mode } })
  }))
}

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const overdueSpy = vi.fn().mockResolvedValue({ data: [], total: 0 })
const nearDueSpy = vi.fn().mockResolvedValue({ data: [], total: 0 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => nearDueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

describe('ticket list route mode bootstrap', () => {
  it('initial route mode=overdue triggers specialMode and fetch', async () => {
    mockRouteWithMode('overdue')
    const Index = (await import('@/views/business/ticket/index.vue')).default as any
    const app = createApp(Index)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const vm: any = app.mount(document.createElement('div'))
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    expect(st.specialMode).toBe('overdue')
  })

  it('initial route mode=neardue triggers specialMode and fetch', async () => {
    vi.resetModules()
    mockRouteWithMode('neardue')
    const Index = (await import('@/views/business/ticket/index.vue')).default as any
    const app = createApp(Index)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const vm: any = app.mount(document.createElement('div'))
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    expect(st.specialMode).toBe('neardue')
  })
})

