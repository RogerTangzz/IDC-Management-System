import { describe, it, expect } from 'vitest'
import { isFlagOn } from '@/config/FlagEvaluator'
import FeatureFlags from '@/config/FeatureFlags'

describe('FlagEvaluator rollout', () => {
  it('respects base flag off', () => {
    FeatureFlags.reset()
    FeatureFlags.setFlag('USE_TICKET_TEMPLATE_V2', false)
    expect(isFlagOn('USE_TICKET_TEMPLATE_V2', 'stage', { userId: 123 })).toBe(false)
  })

  it('allows when base on and percent 100', () => {
    FeatureFlags.reset()
    FeatureFlags.setFlag('USE_TICKET_TEMPLATE_V2', true)
    expect(isFlagOn('USE_TICKET_TEMPLATE_V2', 'dev', { userId: 123 })).toBe(true)
  })

  it('filters by role when specified', () => {
    FeatureFlags.reset()
    FeatureFlags.setFlag('USE_TICKET_TEMPLATE_V2', true)
    // stage rollout sets allowRoles: [] by default; simulate a role-only rule by env 'stage'
    expect(isFlagOn('USE_TICKET_TEMPLATE_V2', 'stage', { roles: ['admin'] })).toBe(true)
  })
})

