import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'

// Mock router (minimal)
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

// Mock user store: 非管理员（触发 mineOnly 注入）
vi.mock('@/store/modules/user', () => ({
  default: () => ({ roles: [] })
}))

// Mock maintenance APIs used by the SFC to avoid network calls onMounted
vi.mock('@/api/business/maintenance', () => ({
  listMaintenance: () => Promise.resolve({ rows: [], total: 0 }),
  delMaintenance: vi.fn(),
  copyLastPlan: vi.fn(),
  submitApproval: vi.fn(),
  approvePlan: vi.fn(),
  rejectPlan: vi.fn(),
  generateTicket: vi.fn(),
  startExecution: vi.fn(),
  getApproverList: () => Promise.resolve({ rows: [] }),
  importMaintenance: () => Promise.resolve({ data: {} }),
  downloadMaintenanceTemplate: () => Promise.resolve(new Blob()),
  downloadMaintenanceImportErrors: () => Promise.resolve(new Blob()),
}))

// SFC under test
import MaintenancePlan from '@/views/business/maintenance/plan/index.vue'

describe('maintenance plan: export params & download', () => {
  const downloadSpy = vi.fn()
  const useDictStub = () => ({ mop_category: [], approval_status: [], execution_status: [] })

  beforeEach(() => {
    downloadSpy.mockReset()
  })

  it('assembles params and calls proxy.download with permission and time range', async () => {
    const app = createApp(MaintenancePlan as any)
    // inject global helpers used by the SFC
    app.config.globalProperties.download = downloadSpy
    app.config.globalProperties.useDict = useDictStub
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn() }
    app.config.globalProperties.$auth = { hasPermi: () => false }
    app.config.globalProperties.addDateRange = (obj: any, range: any[]) => {
      const out = { ...(obj || {}) }
      if (Array.isArray(range) && range.length === 2) {
        out.beginTime = `${range[0]} 00:00:00`
        out.endTime = `${range[1]} 23:59:59`
      }
      return out
    }

    const el = document.createElement('div')
    const vm: any = app.mount(el)

    // 准备筛选 + 时间范围
    const st = vm.$.setupState
    st.dateRange.value = ['2025-09-01', '2025-09-06']

    // 触发导出
    await st.handleExport()

    expect(downloadSpy).toHaveBeenCalledTimes(1)
    const [url, params, filename] = downloadSpy.mock.calls[0]
    expect(url).toBe('business/maintenance/export')
    // 权限参数（非管理员）
    expect(params.mineOnly).toBe(true)
    expect(String(filename)).toMatch(/^maintenance_\d+\.xlsx$/)
  })
})
