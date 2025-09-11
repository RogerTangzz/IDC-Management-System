import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

// Mock router (minimal)
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

// Mock user store
vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

// Spy-able API mocks
const approvePlanSpy = vi.fn()
const rejectPlanSpy = vi.fn()
const startExecutionSpy = vi.fn()

vi.mock('@/api/business/maintenance', () => ({
  listMaintenance: () => Promise.resolve({ rows: [], total: 0 }),
  approvePlan: (...args: any[]) => { approvePlanSpy(...args); return Promise.resolve({}) },
  rejectPlan: (...args: any[]) => { rejectPlanSpy(...args); return Promise.resolve({}) },
  startExecution: (...args: any[]) => { startExecutionSpy(...args); return Promise.resolve({}) },
  delMaintenance: vi.fn(),
  copyLastPlan: vi.fn(),
  submitApproval: vi.fn(),
  generateTicket: vi.fn(),
  getApproverList: () => Promise.resolve({ rows: [] }),
  importMaintenance: () => Promise.resolve({ data: {} }),
  downloadMaintenanceTemplate: () => Promise.resolve(new Blob()),
  downloadMaintenanceImportErrors: () => Promise.resolve(new Blob()),
}))

import MaintenancePlan from '@/views/business/maintenance/plan/index.vue'

describe('maintenance plan: approve and execute flows', () => {
  beforeEach(() => {
    approvePlanSpy.mockReset()
    rejectPlanSpy.mockReset()
    startExecutionSpy.mockReset()
  })

  it('opens approve dialog and prepares form state', async () => {
    const app = createApp(MaintenancePlan as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.$auth = { hasPermi: () => true }
    app.config.globalProperties.useDict = () => ({ mop_category: [], approval_status: [], execution_status: [] })
    app.config.globalProperties.addDateRange = (obj: any, range: any[]) => ({ ...(obj||{}) })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    const st = vm.$.setupState
    // open approve dialog for a plan
    st.handleApprove({ planId: 101 })
    // assert approve dialog and form state\n    expect(st.approveOpen.value).toBe(true)\n    expect(st.approveForm.value.planId).toBe(101)\n    expect(st.approveForm.value.result).toBe('approved')\n    expect(typeof st.approveForm.value.comment).toBe('string')
  })

  it('starts execution after confirm()', async () => {
    const app = createApp(MaintenancePlan as any)
    const confirmSpy = vi.fn().mockResolvedValue(true)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: confirmSpy }
    app.config.globalProperties.$auth = { hasPermi: () => true }
    app.config.globalProperties.useDict = () => ({ mop_category: [], approval_status: [], execution_status: [] })
    app.config.globalProperties.addDateRange = (obj: any, range: any[]) => ({ ...(obj||{}) })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    const st = vm.$.setupState
    await st.handleExecute({ planId: 202 })
    expect(confirmSpy).toHaveBeenCalled()
    expect(startExecutionSpy).toHaveBeenCalledTimes(1)
    expect(startExecutionSpy.mock.calls[0][0]).toBe(202)
  })
})
