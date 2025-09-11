import { describe, it, expect } from 'vitest'
import { filterByIds } from '@/views/business/inspection/utils'

describe('inspection detail: filterByIds (selected anomalies)', () => {
  it('keeps only anomalies whose itemId is in selected ids (dedup ids)', () => {
    const anomalies = [
      { itemId: 'a1', itemName: '项1' },
      { itemId: 'a2', itemName: '项2' },
      { itemId: 'a3', itemName: '项3' }
    ]
    const ids = ['a3', 'a1', 'a1']
    const out = filterByIds(anomalies, ids)
    expect(out.map(o => o.itemId)).toEqual(['a1', 'a3'])
  })

  it('returns empty when ids empty or no match', () => {
    const anomalies = [ { itemId: 1 }, { itemId: 2 } ] as any
    expect(filterByIds(anomalies, [])).toEqual([])
    expect(filterByIds([], ['1'] as any)).toEqual([])
    expect(filterByIds(anomalies, ['9'] as any)).toEqual([])
  })
})

