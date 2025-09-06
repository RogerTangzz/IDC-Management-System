import { describe, it, expect, vi } from 'vitest'
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
\nvi.mock('@/components/FileUpload/index.vue', () => ({ default: { name: 'FileUpload', template: '<div />' } }))\n
import Detail from '@/views/business/maintenance/plan/detail.vue'

describe('maintenance plan detail', () => {
  it('loads plan, shows start button and triggers start', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)

    // wait microtasks
    await Promise.resolve()
    const st = vm.$.setupState
    expect(st.plan.value.title).toBe('娴嬭瘯璁″垝')
    expect(st.canStart.value).toBe(true)

    await st.onStart()
    expect(startSpy).toHaveBeenCalledWith(1001)
  })

  it('submits completion with attachments', async () => {
    const app = createApp(Detail as any)
    app.config.globalProperties.$modal = { msgError: vi.fn(), msgSuccess: vi.fn(), confirm: vi.fn().mockResolvedValue(true) }
    app.config.globalProperties.useDict = () => ({ approval_status: [], execution_status: [] })
    const el = document.createElement('div')
    const vm: any = app.mount(el)
    await Promise.resolve()

    const st = vm.$.setupState
    st.completeOpen.value = true
    st.completeForm.value.result = '宸叉墽琛岋紝姝ｅ父'
    st.completeForm.value.attachments = 'a.pdf,b.docx'
    await st.onComplete()

    expect(completeSpy).toHaveBeenCalled()
    const args = completeSpy.mock.calls[0]
    expect(args[0]).toBe(1001)
    expect(args[1]).toHaveProperty('result', '宸叉墽琛岋紝姝ｅ父')
    expect(args[1]).toHaveProperty('attachments', 'a.pdf,b.docx')
  })
})








