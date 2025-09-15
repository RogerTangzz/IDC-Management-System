import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/infra/telemetry', () => {
  return { track: vi.fn() }
})

import { track } from '@/infra/telemetry'
import { ref } from 'vue'
import useTicketTemplate from '@/views/business/ticket/useTicketTemplate'

describe('ticket.template telemetry smoke (composable)', () => {
  beforeEach(() => {
    ;(track as any).mockClear?.()
  })

  it('emits busy on reentry', async () => {
    const { submit } = useTicketTemplate()
    const open = ref(true)
    const validate = async () => true
    let resolveFn: any
    const addTemplate = () => new Promise((resolve) => { resolveFn = resolve; setTimeout(() => resolve({ code: 200 }), 5) })
    const p1 = submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate })
    const p2 = submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate })
    const r2 = await p2
    expect(r2.ok).toBe(false)
    expect(r2.type).toBe('busy')
    // track busy once
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('busy')
    await p1
    resolveFn?.({ code: 200 })
  })

  it('emits validate_false when validate returns false', async () => {
    const { submit } = useTicketTemplate()
    const validate = async () => false
    const addTemplate = vi.fn()
    const ret = await submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate })
    expect(ret.ok).toBe(false)
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('validate_false')
  })

  it('emits success on ok flow with add', async () => {
    const { submit } = useTicketTemplate()
    const validate = async () => true
    const addTemplate = async () => ({ code: 200 })
    const ret = await submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate, isSuccess: (r: any) => r?.code === 200 })
    expect(ret.ok).toBe(true)
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('success')
  })

  it('emits error when request fails', async () => {
    const { submit } = useTicketTemplate()
    const validate = async () => true
    const addTemplate = async () => { throw new Error('boom') }
    const ret = await submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate })
    expect(ret.ok).toBe(false)
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('error')
  })

  it('emits cancel and abort when cancel during submit', async () => {
    const { submit, cancel } = useTicketTemplate()
    const open = ref(true)
    const validate = async () => true
    let resolveFn: any
    const addTemplate = () => new Promise((resolve) => { resolveFn = resolve; setTimeout(() => resolve({ code: 200 }), 20) })
    const p1 = submit({ form: {}, validate, addTemplate, updateTemplate: addTemplate })
    cancel(open, () => {})
    await p1
    const events = (track as any).mock.calls.map((c: any[]) => c[0])
    expect(events).toContain('cancel')
    expect(events).toContain('abort')
    resolveFn?.({ code: 200 })
  })
})

