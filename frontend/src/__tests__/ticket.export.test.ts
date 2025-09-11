import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

// Mock router (minimal)
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} })
}))

// Mock user store: 非管理员（触发 mineOnly 注入）
vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

// SFC under test
import TicketList from '@/views/business/ticket/index.vue'

describe('ticket list: export params & download', () => {
  const downloadSpy = vi.fn()
  const msgErrorSpy = vi.fn()
  const useDictStub = () => ({ ticket_status: [], equipment_specialty: [], ticket_action: [] })

  beforeEach(() => {
    downloadSpy.mockReset()
    msgErrorSpy.mockReset()
  })

  it('assembles params and calls proxy.download with permissions, time range, sort and mode', async () => {
    const app = createApp(TicketList as any)
    app.config.globalProperties.download = downloadSpy
    app.config.globalProperties.$modal = { msgError: msgErrorSpy, msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.useDict = useDictStub
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    // 准备最小状态：筛选 + 时间 + 排序 + 下钻模式
    const st = vm.$.setupState
    st.queryParams.value.status = 'pending'
    st.queryParams.value.orderByColumn = 'last_status_time'
    st.queryParams.value.isAsc = 'desc'
    st.dateRange.value = ['2025-09-01', '2025-09-06']
    st.specialMode.value = 'overdue'

    // 触发导出
    await st.handleExport()

    expect(downloadSpy).toHaveBeenCalledTimes(1)
    const [url, params, filename] = downloadSpy.mock.calls[0]
    expect(url).toBe('business/ticket/export')
    // 注入的时间参数
    expect(params.beginTime).toBe('2025-09-01 00:00:00')
    expect(params.endTime).toBe('2025-09-06 23:59:59')
    // 排序与模式
    expect(params.orderByColumn).toBe('last_status_time')
    expect(params.isAsc).toBe('desc')
    expect(params.mode).toBe('overdue')
    // 数据权限参数（默认 mineOnly，非管理员应注入）
    expect(params.mineOnly).toBe(true)
    // 文件名符合 ticket_ 前缀
    expect(String(filename)).toMatch(/^ticket_\d{14}\.xlsx$/)
  })
})

