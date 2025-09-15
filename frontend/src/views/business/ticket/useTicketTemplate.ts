import { ref, computed, type Ref } from 'vue'
import { submitTemplateForm, type SubmitDeps, type SubmitState, isUpdate } from '@/views/business/ticket/template.util'
import { track } from '@/infra/telemetry'

export type SubmitResult = Awaited<ReturnType<typeof submitTemplateForm>> | { ok: false; type: 'busy' }

export function useTicketTemplate() {
  const submitState = ref<SubmitState>('idle')
  const submitting = computed(() => submitState.value === 'loading')
  let currentToken = 0

  async function submit(deps: Omit<SubmitDeps, 'validate'> & { validate: () => Promise<boolean> }): Promise<SubmitResult> {
    const updating = isUpdate((deps as any)?.form)
    if (submitting.value) {
      track('busy', { isReentry: true, type: updating ? 'update' : 'add' })
      return { ok: false, type: 'busy' }
    }
    const myToken = ++currentToken
    submitState.value = 'loading'
    const t0 = (typeof performance !== 'undefined' && performance && performance.now) ? performance.now() : Date.now()
    const ret = await submitTemplateForm(deps)
    if (myToken !== currentToken) {
      track('abort', { reason: 'stale_token', type: updating ? 'update' : 'add' })
      return { ok: false, type: 'busy' }
    }
    const dt = ((typeof performance !== 'undefined' && performance && performance.now) ? performance.now() : Date.now()) - t0
    if (ret.ok) {
      submitState.value = 'idle'
      track('success', { durationMs: Math.max(0, Math.round(dt)), type: updating ? 'update' : 'add' })
    } else if (ret.type === 'validateFalse') {
      submitState.value = 'idle'
      track('validate_false', { type: updating ? 'update' : 'add' })
    } else {
      submitState.value = 'fail'
      setTimeout(() => { if (submitState.value === 'fail') submitState.value = 'idle' }, 0)
      const err = (ret as any)?.error
      track('error', { durationMs: Math.max(0, Math.round(dt)), type: updating ? 'update' : 'add', errorMessage: err?.message, errorCode: (err && (err.code || err.status || err.name)) })
    }
    return ret
  }

  function cancel(openRef: Ref<boolean>, reset: () => void) {
    // 令当前进行中的提交结果失效
    const wasSubmitting = submitting.value
    currentToken++
    openRef.value = false
    try { reset?.() } catch {}
    submitState.value = 'canceled'
    submitState.value = 'idle'
    track('cancel', { isAborted: !!wasSubmitting })
    if (wasSubmitting) track('abort', { reason: 'user_cancel' })
  }

  return { submitState, submitting, submit, cancel }
}

export default useTicketTemplate
