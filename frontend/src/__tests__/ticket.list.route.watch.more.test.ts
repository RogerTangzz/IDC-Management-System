import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

vi.mock('vue-router', async () => {
  const vue = await import('vue')
  const route = vue.reactive({ name: 'TicketList', params: {}, query: {} as any })
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useRoute: () => route,
    setQuery: (q: any) => { (route as any).query = q }
  }
})

import { setQuery as setRouteQuery } from 'vue-router'

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

import Index from '@/views/business/ticket/index.vue'

describe('ticket list route.watch more cases', () => {
  it('changing only pageNum keeps other fields unchanged and refreshes', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // preset an existing field in search state
    st.queryParams.title = 'preset'
    const before = listSpy.mock.calls.length
    // change only pageNum via route
    setRouteQuery?.({ pageNum: '3' })
    await nextTick(); await Promise.resolve()
    expect(st.queryParams.pageNum).toBe(3)
    expect(st.queryParams.title).toBe('preset')
    expect(listSpy.mock.calls.length).toBeGreaterThan(before)
    // cleanup: reset route and unmount to avoid lingering watchers
    setRouteQuery?.({})
    app.unmount()
  })

  it('invalid mode value does not alter specialMode', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // set a valid mode first via route change
    setRouteQuery?.({ mode: 'overdue' })
    await nextTick(); await Promise.resolve()
    expect(st.specialMode).toBe('overdue')

    // now set an invalid mode; should not change specialMode
    setRouteQuery?.({ mode: 'UNKNOWN' as any })
    await nextTick(); await Promise.resolve()
    expect(st.specialMode).toBe('overdue')
    // cleanup: reset route and unmount to avoid lingering watchers
    setRouteQuery?.({})
    app.unmount()
  })
})
