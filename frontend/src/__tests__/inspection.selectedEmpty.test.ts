import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

const generateTicketsMock = vi.fn()
vi.mock('@/api/business/inspection', () => ({
  generateTickets: (...args: any[]) => generateTicketsMock(...args)
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { inspectionId: 1 } })
}))

import Detail from '@/views/business/inspection/detail.vue'

describe('generateSelectedTickets: empty selection warns and skips API', () => {
  it('shows warning and does not call generateTickets', async () => {
    const msgWarning = vi.fn()
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { confirm: vi.fn(), msgSuccess: vi.fn(), msgWarning }
    app.config.globalProperties.useDict = () => ({ ticket_priority: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    // ensure selection empty
    vm.$.exposed.selectedAnomalyIds.value = []
    await vm.$.exposed.generateSelectedTickets()
    expect(msgWarning).toHaveBeenCalled()
    expect(generateTicketsMock).not.toHaveBeenCalled()
  })
})

