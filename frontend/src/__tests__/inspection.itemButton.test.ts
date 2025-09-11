import { describe, it, expect, vi } from 'vitest'
import { createApp, nextTick } from 'vue'

// spies
const pushSpy = vi.fn()
const confirmSpy = vi.fn().mockResolvedValue(undefined)
const msgSuccessSpy = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushSpy }),
  useRoute: () => ({ params: { inspectionId: 7 } })
}))

// mock anomaly detection so payload doesn't depend on inspectionItems shape
vi.mock('@/utils/business/inspectionAnomaly.js', () => ({
  default: { detectAnomalies: () => ([{ itemId: 'a1', itemName: 'A1' }]) }
}))

let resolveTickets: (v: any) => void
const generateTicketsMock = vi.fn(() => new Promise(res => { resolveTickets = res }))
vi.mock('@/api/business/inspection', () => ({
  generateTickets: (...args: any[]) => generateTicketsMock(...args)
}))

import Detail from '@/views/business/inspection/detail.vue'

describe('detail per-item Generate button loading/disabled', () => {
  it('disables while generating and re-enables after completion', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { confirm: confirmSpy, msgSuccess: msgSuccessSpy, msgWarning: vi.fn() }
    app.config.globalProperties.useDict = () => ({ ticket_priority: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    // seed anomaly list (anomalyItems computed from inspectionItems)
    vm.$.exposed.form.value = { inspectionId: 7, floor: 'floor1' }
    vm.$.exposed.inspectionItems.value = [{ id: 'a1', label: 'X', type: 'boolean', value: false, isAnomaly: true }]
    await nextTick()

    // find per-item "生成工单" button (size="small")
    const buttons = Array.from(el.querySelectorAll('el-button')) as HTMLElement[]
    const btn = buttons.find(b => b.textContent?.includes('生成工单') && b.getAttribute('size') === 'small') as HTMLElement
    expect(btn).toBeTruthy()
    expect(btn.getAttribute('disabled')).toBeFalsy()

    // click to trigger generation; confirm resolves, API pending
    btn.click()
    await Promise.resolve()
    // now generating=true -> button disabled
    expect(btn.getAttribute('disabled')).toBeTruthy()

    // finish API
    resolveTickets?.({ data: [{ ticketId: 'TT-1' }] })
    // 额外等待微任务 + 渲染，确保属性移除
    await Promise.resolve()
    await new Promise(r => setTimeout(r, 0))
    await nextTick()
    expect(btn.getAttribute('disabled')).toBeFalsy()
    expect(generateTicketsMock).toHaveBeenCalledTimes(1)
    expect(msgSuccessSpy).toHaveBeenCalled()
  })
})
