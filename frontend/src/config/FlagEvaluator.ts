import FeatureFlags from '@/config/FeatureFlags'
import { ROLLOUTS, type EnvPreset, type RolloutRule } from '@/config/FlagRollouts'

export type UserContext = {
  userId?: string | number
  tenantId?: string | number
  orgId?: string | number
  roles?: string[]
}

function hashToBucket(input: string = ''): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  // 0..99
  return Math.abs(h >>> 0) % 100
}

function matchesRule(rule: RolloutRule = {}, ctx: UserContext = {}): boolean {
  const roles = ctx.roles || []
  if (Array.isArray(rule.allowRoles) && rule.allowRoles.length) {
    if (!roles.some((r) => rule.allowRoles!.includes(r))) return false
  }
  // 组织/租户白名单（如果提供）
  if (Array.isArray(rule.allowTenants) && rule.allowTenants.length) {
    const t = String(ctx.tenantId ?? '')
    if (!t || !rule.allowTenants.includes(t)) return false
  }
  if (Array.isArray(rule.allowOrgs) && rule.allowOrgs.length) {
    const o = String(ctx.orgId ?? '')
    if (!o || !rule.allowOrgs.includes(o)) return false
  }
  // 百分比放量
  const pct = typeof rule.percent === 'number' ? Math.max(0, Math.min(100, rule.percent)) : 100
  if (pct >= 100) return true
  const basis = String(ctx.userId ?? ctx.tenantId ?? ctx.orgId ?? '0')
  const bkt = hashToBucket(basis)
  return bkt < pct
}

export function isFlagOn(name: string, env: EnvPreset, ctx: UserContext = {}): boolean {
  const base = FeatureFlags.isEnabled(name)
  if (!base) return false
  const rules = (ROLLOUTS[env] || {})[name]
  if (!rules) return base
  return base && matchesRule(rules, ctx)
}

export default { isFlagOn }

