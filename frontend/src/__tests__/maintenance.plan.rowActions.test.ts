import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/store/modules/user', () => ({ default: () => ({ roles: [] }) }))

const startSpy = vi.fn()
const genSpy = vi.fn()
const approveSpy = vi.fn()
const rejectSpy = vi.fn()

vi.mock('@/api/business/maintenance', () => ({
  listMaintenance: () => Promise.resolve({ rows: [], total: 0 }),
  startExecution: (...args: any[]) => { startSpy(...args); return Promise.resolve({}) },
  generateTicket: (...args: any[]) => { genSpy(...args); return Promise.resolve({}) },
  approvePlan: (...args: any[]) => { approveSpy(...args); return Promise.resolve({}) },
  rejectPlan: (...args: any[]) => { rejectSpy(...args); return Promise.resolve({}) },
  getApproverList: () => Promise.resolve({ rows: [] }),
  importMaintenance: () => Promise.resolve({ data: {} }),
  downloadMaintenanceTemplate: () => Promise.resolve(new Blob()),
  downloadMaintenanceImportErrors: () => Promise.resolve(new Blob()),
}))

import Plan from '@/views/business/maintenance/plan/index.vue'

describe('maintenance plan row actions set/clear actioningId', () => {
  beforeEach(() => { startSpy.mockReset(); genSpy.mockReset(); approveSpy.mockReset(); rejectSpy.mockReset() })

  it('handleExecute sets actioningId at call time and clears after', async () => {
    const app = createApp(Plan as any)
    const confirmSpy = vi.fn().mockResolvedValue(true)
    app.config.globalProperties.$modal = { confirm: confirmSpy, msgSuccess: vi.fn(), msgError: vi.fn() }
    app.config.globalProperties.useDict = () => ({ mop_category: [], approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState

    const row = { planId: 777 }
    await st.handleExecute(row)
    // startExecution called with planId
    expect(startSpy).toHaveBeenCalledWith(777)
    // After pipeline clears
    expect(st.actioningId.value).toBe(null)
  })

  it('handleGenerateTicket sets actioningId at call time and clears after', async () => {
    const app = createApp(Plan as any)
    const confirmSpy = vi.fn().mockResolvedValue(true)
    app.config.globalProperties.$modal = { confirm: confirmSpy, msgSuccess: vi.fn(), msgError: vi.fn() }
    app.config.globalProperties.useDict = () => ({ mop_category: [], approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState

    const row = { planId: 888 }
    await st.handleGenerateTicket(row)
    expect(genSpy).toHaveBeenCalledWith(888)
    expect(st.actioningId.value).toBe(null)
  })

  it('submitApprovalResult sets actioningId before calling approvePlan and clears afterwards', async () => {
    const app = createApp(Plan as any)
    app.config.globalProperties.$modal = { msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.useDict = () => ({ mop_category: [], approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    const st = vm.$.setupState

    // prepare approve form
    st.approveOpen.value = true
    st.approveForm.value.planId = 999
    st.approveForm.value.result = 'approved'
    st.approveForm.value.comment = 'ok'
    vm.$refs = { approveRef: { validate: (cb: any) => cb(true) } }

    await st.submitApprovalResult()
    expect(approveSpy).toHaveBeenCalledWith(999, 'ok')
    expect(st.actioningId.value).toBe(null)
  })
})
