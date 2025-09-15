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
const reopenSpy = vi.fn().mockResolvedValue({})
const assignSpy = vi.fn().mockResolvedValue({})

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  reopenTicket: (...args: any[]) => reopenSpy(...args),
  assignTickets: (...args: any[]) => assignSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket list extra actions', () => {
  it('reopen, batch assign and export are callable', async () => {
    const app = createApp(Index as any)
    const confirm = vi.fn().mockResolvedValue(true)
    const download = vi.fn()
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm }
    app.config.globalProperties.resetForm = () => {}
    app.config.globalProperties.download = download
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })

    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // reopen flow
    await st.handleReopen({ ticketId: 1 })
    expect(confirm).toHaveBeenCalled()
    expect(reopenSpy).toHaveBeenCalledWith(1)

    // batch assign flow
    st.ids = [1,2] as any
    st.handleBatchAssign()
    st.assignForm.userId = 1
    await st.submitAssign()
    expect(assignSpy).toHaveBeenCalled()

    // export flow
    await st.handleExport()
    expect(download).toHaveBeenCalled()

    // update flow (open dialog with row)
    await st.handleUpdate({ ticketId: 1, title: 'A' })
    expect(st.open).toBe(true)
    expect(st.title).toBe('修改工单')
  })
})
