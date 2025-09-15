import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const addSpy = vi.fn().mockResolvedValue({ code: 200 })
const updateSpy = vi.fn().mockResolvedValue({ code: 200 })
const listSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const getSpy = vi.fn().mockResolvedValue({ data: {} })

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: (...a: any[]) => listSpy(...a),
  getTemplate: (...a: any[]) => getSpy(...a),
  addTemplate: (...a: any[]) => addSpy(...a),
  updateTemplate: (...a: any[]) => updateSpy(...a),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template submit add/update', () => {
  it('add path: success shows success and closes dialog', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd()
    await Promise.resolve(); await Promise.resolve()

    // ensure validate exists in $refs for our stub environment
    if (vm.$refs && vm.$refs.templateRef && typeof vm.$refs.templateRef.validate !== 'function') {
      vm.$refs.templateRef.validate = (cb: any) => cb(true)
    }

    // el-form stub validate returns true by default (from setup.ts)
    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(msg.msgSuccess).toHaveBeenCalled()
    expect(st.open).toBe(false)
  })

  it('update path: success shows success and closes dialog', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    // simulate update by setting templateId
    st.handleAdd()
    await Promise.resolve()
    if (vm.$refs && vm.$refs.templateRef && typeof vm.$refs.templateRef.validate !== 'function') {
      vm.$refs.templateRef.validate = (cb: any) => cb(true)
    }
    st.form.templateId = 123
    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(msg.msgSuccess).toHaveBeenCalled()
    expect(st.open).toBe(false)
  })
})
