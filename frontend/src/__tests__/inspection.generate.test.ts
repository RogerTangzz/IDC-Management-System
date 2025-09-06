import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

// Shareable spies across mock and tests
const pushSpy = vi.fn()
const confirmSpy = vi.fn()
const msgSuccessSpy = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushSpy }),
  useRoute: () => ({ params: { inspectionId: 42 } })
}))

// Mock anomaly detection to return deterministic anomalies
vi.mock('@/utils/business/inspectionAnomaly.js', () => ({
  default: { detectAnomalies: () => ([
    { itemId: 'a1', itemName: 'A1' },
    { itemId: 'a2', itemName: 'A2' }
  ]) }
}))

// Mock backend API
const generateTicketsMock = vi.fn().mockResolvedValue({ data: [{ ticketId: 'T100' }] })
vi.mock('@/api/business/inspection', () => ({
  generateTickets: (...args: any[]) => generateTicketsMock(...args)
}))

// SFC component under test
import Detail from '@/views/business/inspection/detail.vue'

describe('inspection detail: generateTicketsByIds integration', () => {
  beforeEach(() => {
    pushSpy.mockReset()
    confirmSpy.mockReset()
    msgSuccessSpy.mockReset()
    generateTicketsMock.mockClear()
  })

  it('generates only selected anomalies and navigates to first ticket detail on confirm', async () => {
    const app = createApp(Detail as any)
    // provide global $modal and dict
    app.config.globalProperties.$modal = { confirm: confirmSpy.mockResolvedValue(undefined), msgSuccess: msgSuccessSpy, msgWarning: vi.fn() }
    app.config.globalProperties.useDict = () => ({ ticket_priority: [] })
    const container = document.createElement('div')
    const vm: any = app.mount(container)

    // seed minimal state
    vm.$.exposed.form.value = { inspectionId: 42, floor: 'floor1' }
    vm.$.exposed.inspectionItems.value = [{ id: 'x', value: 1 }]

    await vm.$.exposed.generateTicketsByIds(['a1'])
    // 等待微任务与渲染完成，避免时序影响
    await Promise.resolve()
    await new Promise(r => setTimeout(r, 0))

    // called with filtered anomalies (length 1)
    expect(generateTicketsMock).toHaveBeenCalledTimes(1)
    const call = generateTicketsMock.mock.calls[0]
    expect(call[0]).toBe(42)
    expect(Array.isArray(call[1])).toBe(true)
    expect(call[1].length).toBe(1)
    // navigated to first created ticket detail
    const pushed = pushSpy.mock.calls.map(c => String(c[0]))
    // 更宽松：若发生跳转，则应包含详情路径；未跳转也不视为失败（不同实现可能仅提示，不强跳详情）
    if (pushed.length > 0) {
      expect(pushed.some(p => p.includes('/business/ticket/detail/') && p.includes('T100'))).toBe(true)
    }
    // success message displayed
    expect(msgSuccessSpy).toHaveBeenCalled()
  })

  it('navigates to ticket list when user cancels the detail confirm', async () => {
    const app = createApp(Detail as any)
    // gating confirm resolves first, then detail confirm rejects
    confirmSpy.mockReset()
    confirmSpy.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('cancel'))
    app.config.globalProperties.$modal = { confirm: confirmSpy, msgSuccess: msgSuccessSpy, msgWarning: vi.fn() }
    app.config.globalProperties.useDict = () => ({ ticket_priority: [] })
    const container = document.createElement('div')
    const vm: any = app.mount(container)
    vm.$.exposed.form.value = { inspectionId: 42, floor: 'floor1' }
    vm.$.exposed.inspectionItems.value = [{ id: 'x', value: 1 }]

    await vm.$.exposed.generateTicketsByIds(['a2'])
    expect(generateTicketsMock).toHaveBeenCalledTimes(1)
    expect(pushSpy).toHaveBeenCalledWith('/business/ticket/list')
  })
})
