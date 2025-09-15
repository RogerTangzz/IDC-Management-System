import { describe, it, expect, vi } from 'vitest'
import { submitTemplateForm, isUpdate, buildInitialForm } from '@/views/business/ticket/template.util'

describe('ticket.template.util submit flow', () => {
  it('isUpdate detects templateId', () => {
    expect(isUpdate({})).toBe(false)
    expect(isUpdate({ templateId: 0 })).toBe(true)
    expect(isUpdate({ templateId: 123 })).toBe(true)
  })

  it('buildInitialForm returns defaults', () => {
    const f = buildInitialForm()
    expect(f.priority).toBe('medium')
    expect(f.useCount).toBe(0)
    expect(f.status).toBe('0')
  })

  it('validate false short-circuits and returns validateFalse', async () => {
    const modal = { msgError: vi.fn(), msgSuccess: vi.fn() }
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => false,
      addTemplate: vi.fn(),
      updateTemplate: vi.fn(),
      modal
    })
    expect(ret.ok).toBe(false)
    expect(ret.type).toBe('validateFalse')
    expect(modal.msgError).not.toHaveBeenCalled()
    expect(modal.msgSuccess).not.toHaveBeenCalled()
  })

  it('add success shows success and ok', async () => {
    const modal = { msgError: vi.fn(), msgSuccess: vi.fn() }
    const addSpy = vi.fn().mockResolvedValue({ code: 200 })
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal
    })
    expect(ret.ok).toBe(true)
    expect(modal.msgSuccess).toHaveBeenCalled()
  })

  it('update failure shows error and returns error type', async () => {
    const modal = { msgError: vi.fn(), msgSuccess: vi.fn() }
    const updSpy = vi.fn().mockRejectedValue(new Error('boom'))
    const ret = await submitTemplateForm({
      form: { templateId: 9 },
      validate: async () => true,
      addTemplate: vi.fn(),
      updateTemplate: (...a: any[]) => updSpy(...a),
      modal
    })
    expect(ret.ok).toBe(false)
    expect(ret.type).toBe('error')
    expect(modal.msgError).toHaveBeenCalled()
  })

  it('update success triggers onSuccess without modal', async () => {
    const onSuccess = vi.fn()
    const updSpy = vi.fn().mockResolvedValue({})
    const ret = await submitTemplateForm({
      form: { templateId: 2 },
      validate: async () => true,
      addTemplate: vi.fn(),
      updateTemplate: (...a: any[]) => updSpy(...a),
      onSuccess
    })
    expect(ret.ok).toBe(true)
    expect(onSuccess).toHaveBeenCalled()
  })

  it('add failure triggers onError when provided (no modal)', async () => {
    const onError = vi.fn()
    const addSpy = vi.fn().mockRejectedValue(new Error('x'))
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      onError
    })
    expect(ret.ok).toBe(false)
    expect(onError).toHaveBeenCalled()
  })

  it('invalid response uses isSuccess to fail', async () => {
    const modal = { msgError: vi.fn(), msgSuccess: vi.fn() }
    const addSpy = vi.fn().mockResolvedValue({ ok: false })
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal,
      isSuccess: (resp) => resp && resp.ok === true
    })
    expect(ret.ok).toBe(false)
    expect(modal.msgError).toHaveBeenCalled()
  })

  it('invalid response: calls onError when provided', async () => {
    const onError = vi.fn()
    const updSpy = vi.fn().mockResolvedValue({ ok: false })
    const ret = await submitTemplateForm({
      form: { templateId: 1 },
      validate: async () => true,
      addTemplate: vi.fn(),
      updateTemplate: (...a: any[]) => updSpy(...a),
      isSuccess: (r) => r?.ok === true,
      onError
    })
    expect(ret.ok).toBe(false)
    expect(onError).toHaveBeenCalled()
  })

  it('valid response with isSuccess predicate passes', async () => {
    const updSpy = vi.fn().mockResolvedValue({ ok: true, data: { id: 1 } })
    const ret = await submitTemplateForm({
      form: { templateId: 5 },
      validate: async () => true,
      addTemplate: vi.fn(),
      updateTemplate: (...a: any[]) => updSpy(...a),
      isSuccess: (resp) => resp?.ok === true
    })
    expect(ret.ok).toBe(true)
  })

  it('add failure: modal present but missing msgError is tolerated', async () => {
    const addSpy = vi.fn().mockRejectedValue(new Error('x'))
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal: {} as any // no msgError
    })
    expect(ret.ok).toBe(false)
  })

  it('add success: modal present but missing msgSuccess is tolerated', async () => {
    const addSpy = vi.fn().mockResolvedValue({})
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal: {} as any // no msgSuccess
    })
    expect(ret.ok).toBe(true)
  })

  it('error path: modal.msgError throws but handled; onError still optional', async () => {
    const modal = { msgError: vi.fn(() => { throw new Error('handler error') }) }
    const addSpy = vi.fn().mockRejectedValue(new Error('root'))
    const ret = await submitTemplateForm({
      form: {},
      validate: async () => true,
      addTemplate: (...a: any[]) => addSpy(...a),
      updateTemplate: vi.fn(),
      modal
    })
    expect(ret.ok).toBe(false)
    // the fact we reached here means the throw was caught
  })

  it('success path: modal.msgSuccess throws but handled; onSuccess runs', async () => {
    const modal = { msgSuccess: vi.fn(() => { throw new Error('boom') }) }
    const onSuccess = vi.fn()
    const updSpy = vi.fn().mockResolvedValue({})
    const ret = await submitTemplateForm({
      form: { templateId: 1 },
      validate: async () => true,
      addTemplate: vi.fn(),
      updateTemplate: (...a: any[]) => updSpy(...a),
      modal,
      onSuccess
    })
    expect(ret.ok).toBe(true)
    expect(onSuccess).toHaveBeenCalled()
  })
})
