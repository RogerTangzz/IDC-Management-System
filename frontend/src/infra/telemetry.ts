type EventName =
  | 'dialog_open'
  | 'submit'
  | 'cancel'
  | 'validate_false'
  | 'success'
  | 'error'
  | 'busy'
  | 'abort'
  | 'flag_switched'
  | 'enter_press'

export interface TelemetryProvider {
  track: (event: EventName | string, payload?: Record<string, any>) => void
}

class NoopTelemetry implements TelemetryProvider {
  track(_event: string, _payload?: Record<string, any>) {}
}

export const ConsoleTelemetry: TelemetryProvider = {
  track(event, payload) {
    try {
      // Keep it concise to avoid noisy logs
      // eslint-disable-next-line no-console
      console.debug('[telemetry]', event, payload || {})
    } catch {}
  }
}

let currentProvider: TelemetryProvider = new NoopTelemetry()
let currentContext: Record<string, any> = {}

export function setTelemetryProvider(p: TelemetryProvider | null | undefined) {
  currentProvider = p || new NoopTelemetry()
}

export function getTelemetryProvider(): TelemetryProvider {
  return currentProvider
}

export function setTelemetryContext(ctx: Record<string, any> = {}) {
  try { currentContext = Object.assign({}, currentContext, ctx || {}) } catch {}
}

export function getTelemetryContext(): Record<string, any> { return { ...currentContext } }

function basePayload(extra?: Record<string, any>) {
  return Object.assign(
    {
      ts: new Date().toISOString(),
      scene: 'ticket_template',
      version: 'v2'
    },
    currentContext || {},
    extra || {}
  )
}

export function track(event: EventName | string, payload?: Record<string, any>) {
  try {
    currentProvider.track(event, basePayload(payload))
  } catch {}
}

export default { setTelemetryProvider, getTelemetryProvider, track, ConsoleTelemetry, setTelemetryContext, getTelemetryContext }
