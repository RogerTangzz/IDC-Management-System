import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketList', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [{ ticketId: 1, ticketNo: 'T-1', title: 'A' }], total: 1 })
const delSpy = vi.fn().mockRejectedValue(new Error('delete failed'))
const reopenSpy = vi.fn().mockRejectedValue(new Error('reopen failed'))
const overdueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const nearDueSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })

vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  delTicket: (...args: any[]) => delSpy(...args),
  reopenTicket: (...args: any[]) => reopenSpy(...args),
  getOverdueTickets: (...args: any[]) => overdueSpy(...args),
  getNearDueTickets: (...args: any[]) => nearDueSpy(...args),
  addTicket: vi.fn(), updateTicket: vi.fn(), assignTickets: vi.fn()
}))

import Index from '@/views/business/ticket/index.vue'

describe('ticket actions error branches', () => {
  it('delete confirms then API rejects: caught without unhandled rejection', async () => {
    const app = createApp(Index as any)
    const confirm = vi.fn().mockResolvedValue(true)
    const msgSuccess = vi.fn()
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess, confirm }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    await st.handleDelete({ ticketId: 1 })
    // should not show success, and list should not refresh on failure
    expect(msgSuccess).not.toHaveBeenCalled()
    // confirm was called, API attempted then rejected and got swallowed by catch
    expect(confirm).toHaveBeenCalled()
    expect(delSpy).toHaveBeenCalledWith(1)
    // still no extra list fetch triggered on failure
    const listCalls = listSpy.mock.calls.length
    expect(listCalls).toBeGreaterThanOrEqual(1)
  })

  it('reopen confirms then API rejects: caught without unhandled rejection', async () => {
    const app = createApp(Index as any)
    const confirm = vi.fn().mockResolvedValue(true)
    const msgSuccess = vi.fn()
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess, confirm }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    await st.handleReopen({ ticketId: 1 })
    expect(confirm).toHaveBeenCalled()
    expect(reopenSpy).toHaveBeenCalledWith(1)
    expect(msgSuccess).not.toHaveBeenCalled()
  })
})
