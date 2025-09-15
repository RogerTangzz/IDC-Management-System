import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn()
  .mockResolvedValueOnce({ rows: [ { ticketId: 1, title: 'A' } ], total: 1 })
  .mockResolvedValue({ rows: [], total: 0 })
const delSpy = vi.fn().mockResolvedValue({})

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  delTicket: (...args: any[]) => delSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list sort+delete+cancel', () => {
  it('maps sort and deletes a row then refreshes', async () => {
    const app = createApp(Index as any)
    const confirm = vi.fn().mockResolvedValue(true)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // sort
    await st.handleSortChange({ prop: 'createTime', order: 'descending' })
    expect(st.queryParams.isAsc).toBe('desc')
    expect(st.queryParams.orderByColumn).toBe('create_time')

    // delete
    await st.handleDelete({ ticketId: 1 })
    expect(confirm).toHaveBeenCalled()
    expect(delSpy).toHaveBeenCalledWith(1)

    // refresh called -> listSpy should have been called again
    expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty/invalid sort input by clearing sort params', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // empty object
    await st.handleSortChange({} as any)
    expect(st.queryParams.isAsc).toBeUndefined()
    expect(st.queryParams.orderByColumn).toBeUndefined()

    // invalid order value
    await st.handleSortChange({ prop: 'createTime', order: 'random' } as any)
    expect(st.queryParams.isAsc).toBeUndefined()
    // allowed field but invalid order => keep column, clear direction
    expect(st.queryParams.orderByColumn).toBe('create_time')
  })
})
