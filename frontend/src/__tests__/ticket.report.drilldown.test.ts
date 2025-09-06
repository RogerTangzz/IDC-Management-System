import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

// Router mock
const pushSpy = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushSpy })
}))

// ECharts mock: capture last registered click handler
vi.mock('echarts', () => {
  const instances = new Map<any, any>()
  let lastClickHandler: ((p: any) => void) | null = null
  return {
    init: (dom: any) => {
      const inst = {
        setOption: vi.fn(),
        on: vi.fn((event: string, cb: (p: any) => void) => {
          if (event === 'click') lastClickHandler = cb
        }),
        off: vi.fn()
      }
      instances.set(dom, inst)
      return inst
    },
    getInstanceByDom: (dom: any) => instances.get(dom),
    __getLastHandler: () => lastClickHandler
  } as any
})

// Backend API mock
vi.mock('@/api/business/ticket', () => ({
  ticketAnalytics: vi.fn().mockResolvedValue({ data: { sla: { withDeadline: 3, timeoutCount: 2, ontimeCompleted: 5 }, duration: {} } })
}))

import Report from '@/views/business/ticket/report.vue'

describe('ticket report: SLA pie drilldown', () => {
  beforeEach(() => {
    pushSpy.mockReset()
  })

  it('click index 1 -> overdue; index 0 -> neardue', async () => {
    const app = createApp(Report as any)
    // minimal globals
    app.config.globalProperties.$modal = { msgError: vi.fn() }
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    // wait mounted -> analytics loaded -> charts rendered -> click bound
    await Promise.resolve()
    await new Promise((r) => setTimeout(r, 0))

    const echarts: any = await import('echarts')
    const handler = echarts.__getLastHandler?.()
    expect(typeof handler).toBe('function')

    handler({ dataIndex: 1 }) // overdue
    handler({ dataIndex: 0 }) // neardue

    const calls = pushSpy.mock.calls.map((c) => c[0])
    const hasOverdue = calls.some((arg: any) => arg?.path === '/business/ticket/list' && arg?.query?.mode === 'overdue')
    const hasNearDue = calls.some((arg: any) => arg?.path === '/business/ticket/list' && arg?.query?.mode === 'neardue')
    expect(hasOverdue).toBe(true)
    expect(hasNearDue).toBe(true)
  })
})

