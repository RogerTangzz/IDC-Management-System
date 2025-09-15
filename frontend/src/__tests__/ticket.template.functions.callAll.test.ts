import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ name: 'TicketTemplate', params: {}, query: {} })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const listSpy = vi.fn().mockResolvedValue({ rows: [{ templateId: 1, templateName: 'T1' }], total: 1 })
const getSpy = vi.fn().mockResolvedValue({ data: { templateId: 1, templateName: 'T1' } })
const addSpy = vi.fn().mockResolvedValue({})
const updSpy = vi.fn().mockResolvedValue({})
const delSpy = vi.fn().mockResolvedValue({})
const statusSpy = vi.fn().mockResolvedValue({})

vi.mock('@/api/business/ticketTemplate', () => ({
  listTemplate: (...a: any[]) => listSpy(...a),
  getTemplate: (...a: any[]) => getSpy(...a),
  addTemplate: (...a: any[]) => addSpy(...a),
  updateTemplate: (...a: any[]) => updSpy(...a),
  delTemplate: (...a: any[]) => delSpy(...a),
  changeTemplateStatus: (...a: any[]) => statusSpy(...a)
}))

import Template from '@/views/business/ticket/template.vue'

describe('ticket.template functions callAll', () => {
  it('invokes core functions and underlying API stubs', async () => {
    const app = createApp(Template as any)
    const modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.$modal = modal
    app.config.globalProperties.useDict = () => ({ ticket_priority: [], equipment_specialty: [], fault_type: [] })
    app.config.globalProperties.resetForm = () => {}
    app.config.globalProperties.download = vi.fn()
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState as any

    // list load
    await Promise.resolve(); await Promise.resolve()
    expect(listSpy).toHaveBeenCalled()

    // search & reset
    st.handleQuery(); await Promise.resolve()
    st.resetQuery(); await Promise.resolve()

    // selection change
    st.handleSelectionChange([{ templateId: 1 }])
    expect(st.single).toBe(false)
    expect(st.multiple).toBe(false)

    // view
    st.handleView({ templateId: 1 }); await Promise.resolve()
    expect(getSpy).toHaveBeenCalled()

    // update path fetch
    st.handleUpdate({ templateId: 1 }); await Promise.resolve()
    expect(getSpy).toHaveBeenCalledTimes(2)

    // delete
    st.handleDelete({ templateId: 1 }); await Promise.resolve()
    expect(delSpy).toHaveBeenCalled()

    // status change
    st.handleStatusChange({ templateId: 1, status: '0', templateName: 'T1' }); await Promise.resolve()
    expect(statusSpy).toHaveBeenCalled()

    // export
    st.handleExport()
    expect(app.config.globalProperties.download).toHaveBeenCalled()
  })
})

