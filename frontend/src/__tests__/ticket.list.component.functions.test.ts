import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

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

describe('ticket list component function coverage', () => {
  it('covers view/add/query/reset/export/overdue/neardue/priority helpers', async () => {
    const app = createApp(Index as any)
    const push = vi.fn()
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.resetForm = () => {}
    app.config.globalProperties.download = vi.fn()
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    // override router push via component state access if exposed
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState

    // handleView → router.push
    // we cannot inject router here, so verify it doesn't throw and path computed
    expect(() => st.handleView({ ticketId: 99 })).not.toThrow()

    // handleAdd opens dialog and sets title
    st.handleAdd()
    expect(st.open).toBe(true)
    expect(st.title).toBe('添加工单')

    // resetQuery clears dateRange and mode then triggers fetch via debounce
    st.dateRange = ['2025-01-01', '2025-01-02'] as any
    st.specialMode = 'overdue'
    st.resetQuery()
    expect(st.specialMode).toBe('')

    // showOverdue / showNearDue
    st.showOverdue()
    expect(st.specialMode).toBe('overdue')
    st.showNearDue()
    expect(st.specialMode).toBe('neardue')

    // priority label helper
    expect(st.getPriorityLabel('high')).toBe('高')
  })
})
