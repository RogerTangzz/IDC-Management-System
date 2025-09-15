import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [ { ticketId: 1, title: 'A' } ], total: 1 })
const delSpy = vi.fn().mockResolvedValue({})
const reopenSpy = vi.fn().mockResolvedValue({})
const overdueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const neardueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  delTicket: (...args: any[]) => delSpy(...args),
  reopenTicket: (...args: any[]) => reopenSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => neardueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), assignTickets: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket actions cancel branches', () => {
  it('delete cancel and reopen cancel do not call APIs; submitAssign warns without user', async () => {
    const app = createApp(Index as any)
    const confirmReject = vi.fn().mockRejectedValue(new Error('cancel'))
    const msgWarning = vi.fn()
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: confirmReject }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // delete cancel
    await st.handleDelete({ ticketId: 1 })
    expect(delSpy).not.toHaveBeenCalled()

    // reopen cancel
    await st.handleReopen({ ticketId: 1 })
    expect(reopenSpy).not.toHaveBeenCalled()

    // submitAssign without userId
    vm.$.proxy.$modal.msgWarning = msgWarning
    st.ids = [1,2] as any
    st.handleBatchAssign()
    st.assignForm.userId = undefined
    await st.submitAssign()
    expect(msgWarning).toHaveBeenCalled()
  })
})
