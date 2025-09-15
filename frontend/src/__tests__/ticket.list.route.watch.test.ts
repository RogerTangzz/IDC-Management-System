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

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list route.watch', () => {
  it('merges route.query into search state and refreshes', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    const before = listSpy.mock.calls.length

    // simulate route.query change
    setRouteQuery?.({ kw: 'w1', pageNum: '2', pageSize: '10' })
    await nextTick(); await Promise.resolve()

    expect(st.queryParams.title).toBe('w1')
    expect(st.queryParams.pageNum).toBe(2)
    expect(st.queryParams.pageSize).toBe(10)
    expect(listSpy.mock.calls.length).toBeGreaterThan(before)
  })
})
