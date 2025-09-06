import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: vi.fn() }),
  useRoute: () => ({ params: { planId: 1002 } })
}))

vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

const approveSpy = vi.fn()
const rejectSpy = vi.fn()

vi.mock('@/api/business/maintenance', () => ({
  getMaintenance: (id: number) => Promise.resolve({ data: { planId: id, title: '待审批计划', approvalStatus: 'pending', executionStatus: 'idle', attachments: [] } }),
  getApprovalHistory: (_id: number) => Promise.resolve({ rows: [ { action: 'submit', operatorName: 'A', time: Date.now() - 10000 } ] }),
  getPlanLogs: (_id: number, _params?: any) => Promise.resolve({ data: [] }),
  approvePlan: (...args: any[]) => { approveSpy(...args); return Promise.resolve({}) },
  rejectPlan: (...args: any[]) => { rejectSpy(...args); return Promise.resolve({}) },
}))

vi.mock('@/components/FileUpload/index.vue', () => ({ default: { name: 'FileUpload', template: '<div />' } }))

import Detail from '@/views/business/maintenance/plan/detail.vue'

describe('maintenance plan detail approve/reject', () => {
  beforeEach(() => { approveSpy.mockReset(); rejectSpy.mockReset() })

  it('approves pending plan with comment', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()

    const st = vm.$.setupState
    // open approve dialog
    st.openApprove()
    st.approveForm.result = 'approved'
    st.approveForm.comment = 'OK'
    await st.onSubmitApproval()
    expect(approveSpy).toHaveBeenCalledWith(1002, 'OK')
  })

  it('rejects pending plan with comment', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve(); await Promise.resolve()

    const st = vm.$.setupState
    st.openApprove()
    st.approveForm.result = 'rejected'
    st.approveForm.comment = 'Need fix'
    await st.onSubmitApproval()
    expect(rejectSpy).toHaveBeenCalledWith(1002, 'Need fix')
  })
})

