import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: vi.fn() }),
  useRoute: () => ({ params: { planId: 1001 } })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const startSpy = vi.fn()
const completeSpy = vi.fn()

vi.mock('@/api/business/maintenance', () => ({
  getMaintenance: (id: number) => Promise.resolve({ data: { planId: id, title: '测试计划', approvalStatus: 'approved', executionStatus: 'pending', attachments: [] } }),
  getApprovalHistory: (_id: number) => Promise.resolve({ rows: [ { action: 'submit', operatorName: 'A', time: Date.now() - 10000 }, { action: 'approve', operatorName: 'Leader', time: Date.now() } ] }),
  getPlanLogs: (_id: number, _params?: any) => Promise.resolve({ data: [ { action: 'start', operatorName: 'Ops', time: Date.now() } ] }),
  startExecution: (...args: any[]) => { startSpy(...args); return Promise.resolve({}) },
  completeExecution: (...args: any[]) => { completeSpy(...args); return Promise.resolve({}) }
}))

vi.mock('@/components/FileUpload/index.vue', () => ({ default: { name: 'FileUpload', template: '<div />' } }))

import Detail from '@/views/business/maintenance/plan/detail.vue'

describe('maintenance plan detail flow', () => {
  beforeEach(() => { startSpy.mockReset(); completeSpy.mockReset() })

  it('loads plan and triggers start', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    // wait microtasks/render
    await Promise.resolve(); await Promise.resolve()
    const st = vm.$.setupState
    await st.onStart()
    expect(startSpy).toHaveBeenCalledWith(1001)
  })

  it('completes with attachments', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()

    const st = vm.$.setupState
    st.openComplete()
    // setupState unwraps refs; completeForm is exposed as plain object
    st.completeForm.result = '已执行，正常'
    st.completeForm.attachments = 'a.pdf,b.docx'
    await st.onComplete()

    expect(completeSpy).toHaveBeenCalled()
    const args = completeSpy.mock.calls[0]
    expect(args[0]).toBe(1001)
    expect(args[1]).toHaveProperty('result', '已执行，正常')
    expect(args[1]).toHaveProperty('attachments', 'a.pdf,b.docx')
  })
})
