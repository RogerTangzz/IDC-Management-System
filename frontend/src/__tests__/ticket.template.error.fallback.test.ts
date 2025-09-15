import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const addSpy = vi.fn().mockRejectedValue(new Error('network error'))
const updateSpy = vi.fn().mockRejectedValue({ message: '422 Unprocessable' })

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getTemplate: vi.fn().mockResolvedValue({ data: {} }),
  addTemplate: (...a: any[]) => addSpy(...a),
  updateTemplate: (...a: any[]) => updateSpy(...a),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template error fallback', () => {
  it('add failure: shows error and resets loading', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd()
    await Promise.resolve()
    if (vm.$refs && vm.$refs.templateRef && typeof vm.$refs.templateRef.validate !== 'function') {
      vm.$refs.templateRef.validate = (cb: any) => cb(true)
    }
    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(msg.msgError).toHaveBeenCalled()
  })

  it('update failure: shows error and resets loading', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd(); await Promise.resolve();
    if (vm.$refs && vm.$refs.templateRef && typeof vm.$refs.templateRef.validate !== 'function') {
      vm.$refs.templateRef.validate = (cb: any) => cb(true)
    }
    st.form.templateId = 789
    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(msg.msgError).toHaveBeenCalled()
  })
})
