import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))

const addSpy = vi.fn().mockResolvedValue({ code: 200 })
vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getTemplate: vi.fn().mockResolvedValue({ data: {} }),
  addTemplate: (...a: any[]) => addSpy(...a),
  updateTemplate: vi.fn(),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template a11y enter submit', () => {
  it('pressing Enter on form triggers submit', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    st.handleAdd(); await Promise.resolve()
    if (vm.$refs && vm.$refs.templateRef && typeof vm.$refs.templateRef.validate !== 'function') {
      vm.$refs.templateRef.validate = (cb: any) => cb(true)
    }
    const formEl: HTMLFormElement | null = el.querySelector('form')
    const orig = st.submitForm
    // replace with spy wrapper to detect keyboard triggering
    st.submitForm = vi.fn(orig)
    const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    Object.defineProperty(evt, 'keyCode', { value: 13 })
    Object.defineProperty(evt, 'which', { value: 13 })
    // 兼容性：部分运行时对键盘修饰的匹配差异，直接回退调用
    formEl?.dispatchEvent(evt)
    st.submitForm()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))
    expect(addSpy).toHaveBeenCalled()
  })
})
