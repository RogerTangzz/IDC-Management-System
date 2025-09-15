import { describe, it, expect, vi } from 'vitest'
import {
  buildListQuery,
  normalizeQueryFromRoute,
  mapSortChange,
  computeActionDisabled,
  formatPriorityLabel,
  ensureSafeRequest,
  mergeSearchState
} from '@/views/business/ticket/index.util'

describe('ticket list util functions', () => {
  it('buildListQuery merges fields and dateRange', () => {
    const q = buildListQuery({ ticketNo: 'A1', title: 't', status: 'open', pageNum: 2, pageSize: 50 }, ['2025-01-01', '2025-01-31'])
    expect(q).toMatchObject({ ticketNo: 'A1', title: 't', status: 'open', pageNum: 2, pageSize: 50 })
    expect(q.beginTime).toBe('2025-01-01 00:00:00')
    expect(q.endTime).toBe('2025-01-31 23:59:59')
  })

  it('normalizeQueryFromRoute handles aliases, mode and paging', () => {
    const { queryParams, dateRange } = normalizeQueryFromRoute({ q: 'abc', no: 'T-1', stat: 'open', pri: 'high', mode: 'overdue', begin: '2025-02-01', end: '2025-02-02', pageNum: '3', pageSize: '10' })
    expect(queryParams).toMatchObject({ title: 'abc', ticketNo: 'T-1', status: 'open', priority: 'high', pageNum: 3, pageSize: 10 })
    expect(dateRange).toEqual(['2025-02-01', '2025-02-02'])
  })

  it('normalizeQueryFromRoute supports kw/keyword and neardue with startDate/endDate', () => {
    const { queryParams, dateRange } = normalizeQueryFromRoute({ kw: 'k2', keyword: '', no: 'T-2', status: 'open', priority: 'low', mode: 'neardue', startDate: '2025-03-01', endDate: '2025-03-05', pageNum: '2', pageSize: '20' })
    expect(queryParams).toMatchObject({ title: 'k2', ticketNo: 'T-2', status: 'open', priority: 'low', pageNum: 2, pageSize: 20 })
    expect(dateRange).toEqual(['2025-03-01', '2025-03-05'])
  })

  it('mapSortChange maps to asc/desc and limits fields', () => {
    expect(mapSortChange({ prop: 'createTime', order: 'ascending' })).toEqual({ sortBy: 'createTime', sortDir: 'asc' })
    expect(mapSortChange({ prop: 'lastStatusTime', order: 'descending' })).toEqual({ sortBy: 'lastStatusTime', sortDir: 'desc' })
    expect(mapSortChange({ prop: 'unknown', order: 'ascending' })).toEqual({ sortBy: '', sortDir: 'asc' })
    expect(mapSortChange({})).toEqual({ sortBy: '', sortDir: null })
  })

  it('computeActionDisabled covers status and selection rules', () => {
    expect(computeActionDisabled({ status: 'open' }, [])).toEqual({ canEdit: true, canDelete: true, canAssign: false, canReopen: false })
    expect(computeActionDisabled({ status: 'closed' }, [])).toEqual({ canEdit: false, canDelete: false, canAssign: false, canReopen: true })
    expect(computeActionDisabled({ status: 'open' }, [{}])).toEqual({ canEdit: true, canDelete: true, canAssign: true, canReopen: false })
  })

  it('formatPriorityLabel maps labels and types', () => {
    expect(formatPriorityLabel('high')).toEqual({ label: '高', type: 'danger' })
    expect(formatPriorityLabel('medium')).toEqual({ label: '中', type: 'warning' })
    expect(formatPriorityLabel('low')).toEqual({ label: '低', type: 'info' })
    expect(formatPriorityLabel('x')).toEqual({ label: '未知', type: 'info' })
  })

  it('ensureSafeRequest resolves and catches properly', async () => {
    const ok = await ensureSafeRequest(async () => 123)
    expect(ok).toEqual({ ok: true, value: 123 })
    const spy = vi.fn()
    const err = await ensureSafeRequest(async () => { throw new Error('boom') }, spy)
    expect(err.ok).toBe(false)
    expect(String((err as any).error)).toContain('boom')
    expect(spy).toHaveBeenCalled()
  })

  it('mergeSearchState merges shallow and hints fetching', () => {
    const res = mergeSearchState({ a: 1, b: 2 }, { b: 3 })
    expect(res).toEqual({ nextState: { a: 1, b: 3 }, shouldFetch: true })
  })
})
