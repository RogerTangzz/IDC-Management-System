import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/business/mineOnly', () => ({
  withMineOnly: (params: any, isAdmin: boolean) => ({ ...params, __mine__: isAdmin ? 'admin' : 'user' })
}))

import { toUnderScoreCase, buildExportParams, getPriorityLabel } from '@/views/business/ticket/index.util'

describe('ticket list util stage3 helpers', () => {
  it('toUnderScoreCase converts camel to snake', () => {
    expect(toUnderScoreCase('lastStatusTime')).toBe('last_status_time')
    expect(toUnderScoreCase('createTime')).toBe('create_time')
    expect(toUnderScoreCase('simple')).toBe('simple')
    expect(toUnderScoreCase('')).toBe('')
  })

  it('buildExportParams merges range, applies mineOnly and mode', () => {
    const q = { title: 'A', pageNum: 2 }
    const dr = ['2025-04-01', '2025-04-02']
    const out = buildExportParams(q, dr, true, 'overdue')
    expect(out).toMatchObject({ title: 'A', pageNum: 2, beginTime: '2025-04-01 00:00:00', endTime: '2025-04-02 23:59:59', mode: 'overdue', __mine__: 'admin' })
  })

  it('getPriorityLabel returns expected labels', () => {
    expect(getPriorityLabel('high')).toBe('高')
    expect(getPriorityLabel('medium')).toBe('中')
    expect(getPriorityLabel('low')).toBe('低')
    expect(getPriorityLabel('unknown')).toBe('未知')
  })
})
