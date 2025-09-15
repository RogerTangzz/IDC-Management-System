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
vi.mock('@/api/business/ticket', () => ({
  listTicket: (...args: any[]) => listSpy(...args),
  getOverdueTickets: vi.fn(), getNearDueTickets: vi.fn(),
  addTicket: vi.fn(), updateTicket: vi.fn(), delTicket: vi.fn(), assignTickets: vi.fn(), reopenTicket: vi.fn()
}))

const requestSpy = vi.fn().mockRejectedValue(new Error('network'))
vi.mock('@/utils/request', () => ({ default: (...args: any[]) => requestSpy(...args) }))

import Index from '@/views/business/ticket/index.vue'

describe('ticket export error fallback', () => {
  it('shows error when fallback request fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createApp(Index as any)
    const msgError = vi.fn()
    app.config.globalProperties.$modal = { msgError, msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    // no download -> fallback path
    vm.$.proxy.download = undefined
    await st.handleExport()
    expect(msgError).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('shows error when download exists but throws', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createApp(Index as any)
    const msgError = vi.fn()
    // download present but throws -> try/catch branch in handleExport
    const download = vi.fn().mockImplementation(() => { throw new Error('boom') })
    app.config.globalProperties.$modal = { msgError, msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    app.config.globalProperties.download = download
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    await st.handleExport()
    expect(download).toHaveBeenCalled()
    expect(msgError).toHaveBeenCalled()
    errSpy.mockRestore()
  })
})
