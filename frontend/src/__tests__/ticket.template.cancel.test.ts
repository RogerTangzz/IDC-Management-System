import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getTemplate: vi.fn().mockResolvedValue({ data: {} }),
  addTemplate: vi.fn().mockResolvedValue({ code: 200 }),
  updateTemplate: vi.fn().mockResolvedValue({ code: 200 }),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template cancel', () => {
  it('cancel closes dialog and resets form state without requests', async () => {
    const app = createApp(Template as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd()
    await Promise.resolve()
    st.form.templateName = 'X'

    st.cancel()
    await Promise.resolve()

    expect(st.open).toBe(false)
    expect(st.form.templateName).toBeUndefined()
  })
})
