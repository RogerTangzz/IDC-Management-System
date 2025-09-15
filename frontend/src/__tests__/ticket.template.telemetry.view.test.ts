import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))

vi.mock('@/infra/telemetry', () => ({
  track: vi.fn()
}))

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
  getTemplate: vi.fn().mockResolvedValue({ data: {} }),
  addTemplate: vi.fn().mockResolvedValue({ code: 200 }),
  updateTemplate: vi.fn().mockResolvedValue({ code: 200 }),
  delTemplate: vi.fn(),
  changeTemplateStatus: vi.fn()
}))

import { track } from '@/infra/telemetry'
import Template from '@/views/business/ticket/template.vue'

describe('ticket.template telemetry (view integration)', () => {
  beforeEach(() => {
    ;(track as any).mockClear?.()
  })

  it('tracks dialog_open on open', async () => {
    const app = createApp(Template as any)
    const msg = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = msg
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any
    st.handleAdd(); await Promise.resolve(); await new Promise(r => setTimeout(r, 0))
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('dialog_open')
  })

  it('tracks validate_false with firstInvalidField on invalid submit', async () => {
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
      vm.$refs.templateRef.validate = (cb: any) => cb(false, { templateName: {} })
    } else if (vm.$refs && vm.$refs.templateRef) {
      vm.$refs.templateRef.validate = (cb: any) => cb(false, { templateName: {} })
    }
    await st.submitForm(); await Promise.resolve(); await new Promise(r => setTimeout(r, 0))
    // find event with 'validate_false' and payload has firstInvalidField
    const calls = (track as any).mock.calls
    const hasField = calls.some((c: any[]) => c[0] === 'validate_false' && c[1] && c[1].firstInvalidField === 'templateName')
    expect(hasField).toBe(true)
  })

  it('tracks enter_press on Enter key', async () => {
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
    // 直接调用包装后的回调，避免事件代理在测试桩上差异
    st.onEnterSubmit()
    await Promise.resolve(); await new Promise(r => setTimeout(r, 0))
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('enter_press')
  })
})
