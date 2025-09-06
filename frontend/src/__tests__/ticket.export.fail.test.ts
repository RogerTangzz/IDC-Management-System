import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

// Force fallback path: no proxy.download, and mock request to reject
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} })
}))
vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))
vi.mock('@/utils/request', () => ({
  __esModule: true,
  default: (_cfg: any) => Promise.reject(new Error('network fail'))
}))

import TicketList from '@/views/business/ticket/index.vue'

describe('ticket list: export failure shows error', () => {
  it('calls $modal.msgError when export fails', async () => {
    const app = createApp(TicketList as any)
    const msgErrorSpy = vi.fn()
    app.config.globalProperties.$modal = { msgError: msgErrorSpy, msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    const st = vm.$.setupState
    st.dateRange.value = ['2025-09-01', '2025-09-06']
    // 无 download → fallback 调用 request（被 mock 为 reject）
    st.handleExport()
    await nextTick()
    await new Promise(r => setTimeout(r, 0))
    expect(msgErrorSpy).toHaveBeenCalled()
  })
})

