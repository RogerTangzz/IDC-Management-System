import type { TelemetryProvider } from './telemetry'

export function createSentryProvider(_dsn?: string): TelemetryProvider {
  return {
    track(event, payload) {
      try {
        const S: any = (globalThis as any).Sentry
        if (S && typeof S.addBreadcrumb === 'function') {
          S.addBreadcrumb({ category: 'telemetry', message: String(event), data: payload, level: 'info' })
        }
        if (S && typeof S.captureMessage === 'function') {
          S.captureMessage(`[telemetry] ${String(event)}`, { level: 'info', extra: payload || {} })
        }
      } catch {
        // swallow
      }
    }
  }
}

export default { createSentryProvider }

