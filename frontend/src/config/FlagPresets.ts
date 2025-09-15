import FeatureFlags from '@/config/FeatureFlags'

export type EnvPreset = 'dev' | 'stage' | 'prod'

export const PRESETS: Record<EnvPreset, Record<string, boolean>> = {
  dev: { USE_NEW_TICKET: true, USE_TICKET_TEMPLATE_V2: true },
  stage: { USE_NEW_TICKET: true, USE_TICKET_TEMPLATE_V2: true },
  // Stage 8（GA）：prod 默认开启模板 V2，仍保留软回滚能力
  prod: { USE_NEW_TICKET: false, USE_TICKET_TEMPLATE_V2: true }
}

export const SAFE_ROLLBACK: Record<string, boolean> = {
  USE_NEW_TICKET: false,
  USE_TICKET_TEMPLATE_V2: false
}

export function applyPreset(env: EnvPreset) {
  FeatureFlags.bulkSet(PRESETS[env] || PRESETS.dev)
}

export function applySafeRollback() {
  FeatureFlags.bulkSet(SAFE_ROLLBACK)
}

export default { PRESETS, applyPreset, applySafeRollback }
