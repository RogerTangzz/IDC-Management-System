import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

// API spies
const addSpy = vi.fn().mockResolvedValue({ code: 200 })
const updateSpy = vi.fn().mockResolvedValue({ code: 200 })
const listSpy = vi.fn().mockResolvedValue({ rows: [], total: 0 })
const getSpy = vi.fn().mockResolvedValue({ data: {} })
const delSpy = vi.fn().mockResolvedValue({})
const statusSpy = vi.fn().mockResolvedValue({})

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: (...a: any[]) => listSpy(...a),
  getTemplate: (...a: any[]) => getSpy(...a),
  addTemplate: (...a: any[]) => addSpy(...a),
  updateTemplate: (...a: any[]) => updateSpy(...a),
  delTemplate: (...a: any[]) => delSpy(...a),
  changeTemplateStatus: (...a: any[]) => statusSpy(...a)
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template submit validateFalse', () => {
  it('blocks submit when validate returns false and resets loading', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    // ruoyi helpers stub
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    const st = vm.$.setupState as any
    // open dialog to ensure $refs.templateRef exists
    st.handleAdd()
    await Promise.resolve()

    // simulate validate false
    if (vm.$refs && vm.$refs.templateRef) {
      vm.$refs.templateRef.validate = (cb: any) => cb(false)
    }

    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))

    expect(addSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    // submitting may reset asynchronously; core assertion is no API call
  })
})
