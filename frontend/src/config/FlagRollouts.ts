export type EnvPreset = 'dev' | 'stage' | 'prod'

export type RolloutRule = {
  percent?: number // 0-100
  allowRoles?: string[]
  allowTenants?: string[]
  allowOrgs?: string[]
}

export const ROLLOUTS: Record<EnvPreset, Record<string, RolloutRule>> = {
  dev: {
    USE_TICKET_TEMPLATE_V2: { percent: 100 }
  },
  stage: {
    // 建议按角色/组织逐步放量；默认 100%，可按需改为 10/25/50 分级放量
    USE_TICKET_TEMPLATE_V2: { percent: 100, allowRoles: [] }
  },
  prod: {
    // GA 前默认不放量，由 FlagPresets 控制为 false；若需要，设置为小比例并添加 allowRoles/allowTenants
    USE_TICKET_TEMPLATE_V2: { percent: 0 }
  }
}

export default { ROLLOUTS }

