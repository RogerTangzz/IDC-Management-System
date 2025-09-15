import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 11, title: 'M' } ], total: 1 })
const assignSpy = vi.fn().mockResolvedValue({})

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(),
  assignTickets: (...args: any[]) => assignSpy(...args), reopenTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list more function paths', () => {
  it('handleView/handleUpdate without row uses ids fallback; submitAssign not-found then success', async () => {
    const app = createApp(Index as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), msgWarning: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // after initial list, set ids fallback
    st.ids = [11] as any

    // handleView without row
    expect(() => st.handleView({} as any)).not.toThrow()

    // handleUpdate without row (should find by ids[0])
    await st.handleUpdate(undefined as any)
    expect(st.open).toBe(true)
    expect(st.title).toBe('修改工单')

    // submitAssign: user not found
    st.ids = [11] as any
    st.handleBatchAssign()
    st.assignForm.userId = 999 // not exists
    await st.submitAssign()
    expect(assignSpy).not.toHaveBeenCalled()

    // submitAssign: user found then success
    st.assignForm.userId = 1
    await st.submitAssign()
    expect(assignSpy).toHaveBeenCalled()
  })
})

