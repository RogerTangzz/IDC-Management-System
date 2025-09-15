import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import useTicketTemplate from '@/views/business/ticket/useTicketTemplate'

describe('useTicketTemplate debounce and cancel', () => {
  it('debounces concurrent submit calls (busy)', async () => {
    const { submitState, submitting, submit } = useTicketTemplate()
    const deferred: { resolve?: (v?: any) => void } = {}
    const addSpy = vi.fn(() => new Promise((r) => { deferred.resolve = r }))

    const retP = submit({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal: { msgSuccess: vi.fn(), msgError: vi.fn() }
    })
    expect(submitState.value).toBe('loading')
    expect(submitting.value).toBe(true)

    const busy = await submit({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal: { msgSuccess: vi.fn(), msgError: vi.fn() }
    })
    expect(busy.ok).toBe(false)
    expect((busy as any).type).toBe('busy')
    expect(addSpy).toHaveBeenCalledTimes(1)

    deferred.resolve?.({})
    const done = await retP
    expect(done.ok).toBe(true)
    expect(submitState.value).toBe('idle')
  })

  it('cancel closes and resets', () => {
    const { cancel } = useTicketTemplate()
    const open = ref(true)
    const reset = vi.fn()
    cancel(open, reset)
    expect(open.value).toBe(false)
    expect(reset).toHaveBeenCalled()
  })
})

