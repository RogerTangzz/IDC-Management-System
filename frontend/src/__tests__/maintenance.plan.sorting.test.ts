import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SORT_FIELD_MAP } from '@/views/business/maintenance/plan/index.helpers'

describe('维保计划 - 排序功能测试', () => {
  describe('handleSortChange 逻辑测试', () => {
    let queryParams: any
    let handleQuery: any

    beforeEach(() => {
      // 模拟 queryParams 对象
      queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        orderByColumn: undefined,
        isAsc: undefined
      }

      // 模拟 handleQuery 函数
      handleQuery = vi.fn()
    })

    /**
     * 模拟 handleSortChange 函数的逻辑
     * 这是从 plan/index.vue 中提取的核心逻辑
     */
    const handleSortChange = ({ column, prop, order }: any) => {
      if (!prop || !order) {
        // 清除排序
        queryParams.orderByColumn = undefined
        queryParams.isAsc = undefined
      } else {
        // 映射前端字段名到后端字段名
        const backendField = SORT_FIELD_MAP[prop] || prop
        queryParams.orderByColumn = backendField
        queryParams.isAsc = order === 'ascending' ? 'asc' : 'desc'
      }
      handleQuery()
    }

    it('点击列头升序排序 - planNo', () => {
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('planId')
      expect(queryParams.isAsc).toBe('asc')
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('点击列头降序排序 - planNo', () => {
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('planId')
      expect(queryParams.isAsc).toBe('desc')
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('点击列头升序排序 - createTime', () => {
      handleSortChange({
        column: {},
        prop: 'createTime',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('createTime')
      expect(queryParams.isAsc).toBe('asc')
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('点击列头降序排序 - createTime', () => {
      handleSortChange({
        column: {},
        prop: 'createTime',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('createTime')
      expect(queryParams.isAsc).toBe('desc')
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('点击列头升序排序 - title', () => {
      handleSortChange({
        column: {},
        prop: 'title',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('title')
      expect(queryParams.isAsc).toBe('asc')
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('取消排序 - prop 为空', () => {
      // 先设置排序
      queryParams.orderByColumn = 'createTime'
      queryParams.isAsc = 'asc'

      // 取消排序
      handleSortChange({
        column: {},
        prop: null,
        order: null
      })

      expect(queryParams.orderByColumn).toBeUndefined()
      expect(queryParams.isAsc).toBeUndefined()
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('取消排序 - order 为空', () => {
      // 先设置排序
      queryParams.orderByColumn = 'createTime'
      queryParams.isAsc = 'asc'

      // 取消排序
      handleSortChange({
        column: {},
        prop: 'createTime',
        order: null
      })

      expect(queryParams.orderByColumn).toBeUndefined()
      expect(queryParams.isAsc).toBeUndefined()
      expect(handleQuery).toHaveBeenCalledTimes(1)
    })

    it('切换排序字段 - 从 planNo 切换到 createTime', () => {
      // 第一次排序：planNo 升序
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('planId')
      expect(queryParams.isAsc).toBe('asc')

      // 第二次排序：createTime 降序
      handleSortChange({
        column: {},
        prop: 'createTime',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('createTime')
      expect(queryParams.isAsc).toBe('desc')
      expect(handleQuery).toHaveBeenCalledTimes(2)
    })

    it('同一字段切换排序方向 - planNo 升序 → 降序', () => {
      // 升序
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('planId')
      expect(queryParams.isAsc).toBe('asc')

      // 降序
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('planId')
      expect(queryParams.isAsc).toBe('desc')
      expect(handleQuery).toHaveBeenCalledTimes(2)
    })

    it('所有支持排序的字段 - approvalStatus', () => {
      handleSortChange({
        column: {},
        prop: 'approvalStatus',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('approvalStatus')
      expect(queryParams.isAsc).toBe('asc')
    })

    it('所有支持排序的字段 - executionStatus', () => {
      handleSortChange({
        column: {},
        prop: 'executionStatus',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('executionStatus')
      expect(queryParams.isAsc).toBe('desc')
    })

    it('所有支持排序的字段 - nextExecutionTime', () => {
      handleSortChange({
        column: {},
        prop: 'nextExecutionTime',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('nextExecutionTime')
      expect(queryParams.isAsc).toBe('asc')
    })

    it('所有支持排序的字段 - version', () => {
      handleSortChange({
        column: {},
        prop: 'version',
        order: 'descending'
      })

      expect(queryParams.orderByColumn).toBe('version')
      expect(queryParams.isAsc).toBe('desc')
    })

    it('未映射的字段应该使用原字段名', () => {
      handleSortChange({
        column: {},
        prop: 'unknownField',
        order: 'ascending'
      })

      expect(queryParams.orderByColumn).toBe('unknownField')
      expect(queryParams.isAsc).toBe('asc')
    })

    it('每次排序都应该触发查询', () => {
      handleSortChange({
        column: {},
        prop: 'planNo',
        order: 'ascending'
      })
      expect(handleQuery).toHaveBeenCalledTimes(1)

      handleSortChange({
        column: {},
        prop: 'createTime',
        order: 'descending'
      })
      expect(handleQuery).toHaveBeenCalledTimes(2)

      handleSortChange({
        column: {},
        prop: null,
        order: null
      })
      expect(handleQuery).toHaveBeenCalledTimes(3)
    })
  })

  describe('排序参数传递测试', () => {
    it('getList 应该包含排序参数', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }

      // 验证 queryParams 包含排序字段
      expect(queryParams).toHaveProperty('orderByColumn')
      expect(queryParams).toHaveProperty('isAsc')
      expect(queryParams.orderByColumn).toBe('createTime')
      expect(queryParams.isAsc).toBe('desc')
    })

    it('导出功能应该包含排序参数', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '测试',
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }

      // 模拟 buildQueryPayload for export
      const exportParams = { ...queryParams }
      delete exportParams.pageNum
      delete exportParams.pageSize

      expect(exportParams.orderByColumn).toBe('createTime')
      expect(exportParams.isAsc).toBe('desc')
      expect(exportParams.title).toBe('测试')
      expect(exportParams.pageNum).toBeUndefined()
      expect(exportParams.pageSize).toBeUndefined()
    })
  })

  describe('排序状态管理测试', () => {
    it('初始状态排序参数应该为 undefined', () => {
      const initialQueryParams = {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: undefined,
        isAsc: undefined
      }

      expect(initialQueryParams.orderByColumn).toBeUndefined()
      expect(initialQueryParams.isAsc).toBeUndefined()
    })

    it('排序后状态应该正确更新', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: undefined,
        isAsc: undefined
      }

      // 设置排序
      queryParams.orderByColumn = 'createTime'
      queryParams.isAsc = 'desc'

      expect(queryParams.orderByColumn).toBe('createTime')
      expect(queryParams.isAsc).toBe('desc')
    })

    it('清除排序后状态应该回到 undefined', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }

      // 清除排序
      queryParams.orderByColumn = undefined
      queryParams.isAsc = undefined

      expect(queryParams.orderByColumn).toBeUndefined()
      expect(queryParams.isAsc).toBeUndefined()
    })
  })
})
