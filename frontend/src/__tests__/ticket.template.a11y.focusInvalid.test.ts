import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getTemplate: vi.fn().mockResolvedValue({ data: {} }),
  addTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template a11y focus invalid', () => {
  it('when validate fails, focuses first invalid field', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd(); await Promise.resolve()

    // patch validate to provide invalidFields object; spy on HTMLElement.focus
    if (vm.$refs && vm.$refs.templateRef) {
      const focusSpy = vi.spyOn(HTMLElement.prototype as any, 'focus')
      vm.$refs.templateRef.validate = (cb: any) => cb(false, { templateName: [{}] })
      st.submitForm()
      await Promise.resolve(); await new Promise(r => setTimeout(r, 0))
      expect(focusSpy).toHaveBeenCalled()
    }
  })
})
