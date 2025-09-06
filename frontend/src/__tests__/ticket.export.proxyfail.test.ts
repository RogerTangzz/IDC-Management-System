import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} })
}))
vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))

import TicketList from '@/views/business/ticket/index.vue'

describe('ticket list: proxy.download throws -> msgError fallback', () => {
  it('shows error when proxy.download throws synchronously', async () => {
    const app = createApp(TicketList as any)
    const msgErrorSpy = vi.fn()
    // 模拟 proxy.download 抛出异常（同步）
    const throwingDownload = () => { throw new Error('download failed') }
    app.config.globalProperties.download = throwingDownload
    app.config.globalProperties.$modal = { msgError: msgErrorSpy, msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.useDict = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    const st = vm.$.setupState
    st.dateRange.value = ['2025-09-01', '2025-09-06']
    st.handleExport()
    await nextTick()
    expect(msgErrorSpy).toHaveBeenCalled()
  })
})

