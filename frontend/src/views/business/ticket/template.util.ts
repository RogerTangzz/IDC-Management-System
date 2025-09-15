import { ensureSafeRequest } from '@/views/business/ticket/index.util'

export type SubmitState = 'idle' | 'loading' | 'success' | 'fail' | 'canceled'

export function isUpdate(form: any): boolean {
  return form?.templateId != null && form.templateId !== undefined
}

export function buildSuccessMsg(update: boolean): string {
  return update ? '修改成功' : '新增成功'
}

export function buildInitialForm() {
  return {
    templateId: undefined,
    templateNo: undefined,
    templateName: undefined,
    faultType: undefined,
    priority: 'medium',
    specialty: undefined,
    defaultTitle: undefined,
    defaultDescription: undefined,
    defaultEmergencyAction: undefined,
    defaultSolution: undefined,
    useCount: 0,
    status: '0',
    remark: undefined
  }
}

export type SubmitDeps = {
  form: any
  validate: () => Promise<boolean>
  addTemplate: (data: any) => Promise<any>
  updateTemplate: (data: any) => Promise<any>
  modal?: { msgSuccess?: (s: string) => void; msgError?: (s: string) => void }
  onSuccess?: () => void
  onError?: (e: any) => void
  isSuccess?: (resp: any) => boolean
}

export async function submitTemplateForm({ form, validate, addTemplate, updateTemplate, modal, onSuccess, onError, isSuccess }: SubmitDeps): Promise<{ ok: boolean; type?: 'validateFalse' | 'success' | 'error'; error?: any }> {
  // 1) 校验
  const valid = await validate()
  if (!valid) return { ok: false, type: 'validateFalse' }

  // 2) 决策 add/update
  const updating = isUpdate(form)
  const runner = () => (updating ? updateTemplate(form) : addTemplate(form))

  // 3) 安全执行
  const ret = await ensureSafeRequest(runner, (e) => {
    try { modal?.msgError?.(e?.message || '提交失败') } catch {}
    try { onError?.(e) } catch {}
  })

  if (ret.ok) {
    const pass = typeof isSuccess === 'function' ? !!isSuccess((ret as any).value) : true
    if (!pass) {
      try { modal?.msgError?.('返回结果异常') } catch {}
      try { onError?.(new Error('invalid response')) } catch {}
      return { ok: false, type: 'error', error: new Error('invalid response') }
    }
    try { modal?.msgSuccess?.(buildSuccessMsg(updating)) } catch {}
    try { onSuccess?.() } catch {}
    return { ok: true, type: 'success' }
  } else {
    return { ok: false, type: 'error', error: ret.error }
  }
}
