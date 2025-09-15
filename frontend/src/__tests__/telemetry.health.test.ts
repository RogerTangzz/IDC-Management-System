import { describe, it, expect, vi } from 'vitest'
import FeatureFlags from '@/config/FeatureFlags'
import { applyPreset } from '@/config/FlagPresets'
import { setTelemetryProvider, setTelemetryContext, getTelemetryContext, track } from '@/infra/telemetry'

describe('telemetry + flag health smoke', () => {
  it('track does not throw and context is merged', () => {
    const calls: any[] = []
    setTelemetryProvider({ track: (ev, payload) => { calls.push([ev, payload]) } })
    setTelemetryContext({ env: 'test', userId: 'u1' })
    expect(() => track('success', { foo: 1 })).not.toThrow()
    expect(calls.length).toBe(1)
    expect(calls[0][0]).toBe('success')
    const ctx = getTelemetryContext()
    expect(ctx.env).toBe('test')
    expect(ctx.userId).toBe('u1')
    expect(calls[0][1].env).toBe('test')
  })

  it('flag presets apply and snapshot available', () => {
    FeatureFlags.reset()
    applyPreset('dev')
    expect(FeatureFlags.isEnabled('USE_TICKET_TEMPLATE_V2')).toBe(true)
    applyPreset('prod')
    // Stage 8：prod 默认开启模板 V2
    expect(FeatureFlags.isEnabled('USE_TICKET_TEMPLATE_V2')).toBe(true)
    const snap = FeatureFlags.snapshot()
    expect(Object.prototype.hasOwnProperty.call(snap, 'USE_TICKET_TEMPLATE_V2')).toBe(true)
  })
})
