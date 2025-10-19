import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildQueryPayload, SORT_FIELD_MAP } from '@/views/business/maintenance/plan/index.helpers'

/**
 * 集成测试：模拟完整的前端交互流程
 * 这些测试验证从用户操作到 API 调用的完整数据流
 */
describe('维保计划 - 集成测试', () => {
  describe('场景1：用户点击列头排序并导出', () => {
    let queryParams: any
    let apiCallParams: any[]

    beforeEach(() => {
      queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        floor: undefined,
        orderByColumn: undefined,
        isAsc: undefined
      }
      apiCallParams = []
    })

    const mockApiCall = (params: any) => {
      apiCallParams.push({ ...params })
    }

    it('完整流程：筛选 → 排序 → 导出，参数应保持一致', () => {
      // 步骤1：用户设置筛选条件
      queryParams.title = '维保计划'
      queryParams.floor = '1'
      queryParams.approvalStatus = 'approved'

      // 步骤2：设置日期范围
      const dateRange = ['2025-10-01', '2025-10-17']

      // 步骤3：用户点击"创建时间"列头降序排序
      queryParams.orderByColumn = SORT_FIELD_MAP.createTime
      queryParams.isAsc = 'desc'

      // 步骤4：模拟列表查询 API 调用
      const listParams = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: false,
        forExport: false
      })
      mockApiCall(listParams)

      // 验证列表查询参数
      expect(listParams.title).toBe('维保计划')
      expect(listParams.floor).toBe('1')
      expect(listParams.approvalStatus).toBe('approved')
      expect(listParams.orderByColumn).toBe('createTime')
      expect(listParams.isAsc).toBe('desc')
      expect(listParams.beginTime).toBe('2025-10-01 00:00:00')
      expect(listParams.endTime).toBe('2025-10-17 23:59:59')
      expect(listParams.mineOnly).toBe(true)
      expect(listParams.pageNum).toBe(1)
      expect(listParams.pageSize).toBe(10)

      // 步骤5：用户点击导出按钮
      const exportParams = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: false,
        forExport: true
      })
      mockApiCall(exportParams)

      // 验证导出参数与列表参数一致（除了分页）
      expect(exportParams.title).toBe(listParams.title)
      expect(exportParams.floor).toBe(listParams.floor)
      expect(exportParams.approvalStatus).toBe(listParams.approvalStatus)
      expect(exportParams.orderByColumn).toBe(listParams.orderByColumn)
      expect(exportParams.isAsc).toBe(listParams.isAsc)
      expect(exportParams.beginTime).toBe(listParams.beginTime)
      expect(exportParams.endTime).toBe(listParams.endTime)
      expect(exportParams.mineOnly).toBe(listParams.mineOnly)

      // 导出时应该移除分页
      expect(exportParams.pageNum).toBeUndefined()
      expect(exportParams.pageSize).toBeUndefined()

      // 验证 API 被调用了两次
      expect(apiCallParams.length).toBe(2)
    })

    it('场景：用户切换排序字段后导出', () => {
      queryParams.title = '测试'
      const dateRange = ['2025-10-01', '2025-10-17']

      // 第一次排序：按计划编号升序
      queryParams.orderByColumn = SORT_FIELD_MAP.planNo
      queryParams.isAsc = 'asc'

      const firstListParams = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: true,
        forExport: false
      })
      mockApiCall(firstListParams)

      expect(firstListParams.orderByColumn).toBe('planId')
      expect(firstListParams.isAsc).toBe('asc')

      // 用户切换排序：按创建时间降序
      queryParams.orderByColumn = SORT_FIELD_MAP.createTime
      queryParams.isAsc = 'desc'

      const secondListParams = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: true,
        forExport: false
      })
      mockApiCall(secondListParams)

      expect(secondListParams.orderByColumn).toBe('createTime')
      expect(secondListParams.isAsc).toBe('desc')

      // 导出应该使用最新的排序
      const exportParams = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: true,
        forExport: true
      })
      mockApiCall(exportParams)

      expect(exportParams.orderByColumn).toBe('createTime')
      expect(exportParams.isAsc).toBe('desc')
      expect(apiCallParams.length).toBe(3)
    })

    it('场景：用户取消排序后导出', () => {
      // 先设置排序
      queryParams.orderByColumn = SORT_FIELD_MAP.createTime
      queryParams.isAsc = 'desc'

      const sortedParams = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: false
      })
      mockApiCall(sortedParams)

      expect(sortedParams.orderByColumn).toBe('createTime')
      expect(sortedParams.isAsc).toBe('desc')

      // 用户点击列头取消排序
      queryParams.orderByColumn = undefined
      queryParams.isAsc = undefined

      const unsortedParams = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: false
      })
      mockApiCall(unsortedParams)

      expect(unsortedParams.orderByColumn).toBeUndefined()
      expect(unsortedParams.isAsc).toBeUndefined()

      // 导出应该没有排序参数
      const exportParams = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: true
      })
      mockApiCall(exportParams)

      expect(exportParams.orderByColumn).toBeUndefined()
      expect(exportParams.isAsc).toBeUndefined()
      expect(apiCallParams.length).toBe(3)
    })
  })

  describe('场景2：管理员 vs 普通用户权限', () => {
    it('管理员查看所有数据，导出不带 mineOnly', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        approvalStatus: 'approved'
      }

      const listParams = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: false
      })

      const exportParams = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: true
      })

      expect(listParams.mineOnly).toBeUndefined()
      expect(exportParams.mineOnly).toBeUndefined()
    })

    it('普通用户仅看本人数据，导出带 mineOnly', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        approvalStatus: 'approved'
      }

      const listParams = buildQueryPayload({
        queryParams,
        isAdmin: false,
        forExport: false
      })

      const exportParams = buildQueryPayload({
        queryParams,
        isAdmin: false,
        forExport: true
      })

      expect(listParams.mineOnly).toBe(true)
      expect(exportParams.mineOnly).toBe(true)
    })
  })

  describe('场景3：分页交互', () => {
    it('用户翻页时保留筛选和排序条件', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '测试',
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }
      const dateRange = ['2025-10-01', '2025-10-17']

      // 第一页
      const page1Params = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: true,
        forExport: false
      })

      expect(page1Params.pageNum).toBe(1)
      expect(page1Params.title).toBe('测试')
      expect(page1Params.orderByColumn).toBe('createTime')

      // 用户翻到第二页
      queryParams.pageNum = 2

      const page2Params = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: true,
        forExport: false
      })

      expect(page2Params.pageNum).toBe(2)
      expect(page2Params.title).toBe('测试')
      expect(page2Params.orderByColumn).toBe('createTime')
      expect(page2Params.isAsc).toBe('desc')
    })

    it('用户修改筛选条件后应该重置到第一页', () => {
      const queryParams = {
        pageNum: 3,
        pageSize: 10,
        title: '旧标题'
      }

      // 用户修改筛选条件，前端代码会重置 pageNum
      queryParams.title = '新标题'
      queryParams.pageNum = 1

      const params = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: false
      })

      expect(params.pageNum).toBe(1)
      expect(params.title).toBe('新标题')
    })
  })

  describe('场景4：所有可排序字段的完整测试', () => {
    const sortableFields = [
      { frontend: 'planNo', backend: 'planId' },
      { frontend: 'title', backend: 'title' },
      { frontend: 'version', backend: 'version' },
      { frontend: 'approvalStatus', backend: 'approvalStatus' },
      { frontend: 'executionStatus', backend: 'executionStatus' },
      { frontend: 'lastExecutionTime', backend: 'lastExecutionTime' },
      { frontend: 'nextExecutionTime', backend: 'nextExecutionTime' },
      { frontend: 'createTime', backend: 'createTime' },
      { frontend: 'updateTime', backend: 'updateTime' }
    ]

    sortableFields.forEach(({ frontend, backend }) => {
      it(`字段 ${frontend} 升序排序并导出`, () => {
        const queryParams = {
          pageNum: 1,
          pageSize: 10,
          orderByColumn: SORT_FIELD_MAP[frontend],
          isAsc: 'asc'
        }

        const exportParams = buildQueryPayload({
          queryParams,
          isAdmin: true,
          forExport: true
        })

        expect(exportParams.orderByColumn).toBe(backend)
        expect(exportParams.isAsc).toBe('asc')
      })

      it(`字段 ${frontend} 降序排序并导出`, () => {
        const queryParams = {
          pageNum: 1,
          pageSize: 10,
          orderByColumn: SORT_FIELD_MAP[frontend],
          isAsc: 'desc'
        }

        const exportParams = buildQueryPayload({
          queryParams,
          isAdmin: true,
          forExport: true
        })

        expect(exportParams.orderByColumn).toBe(backend)
        expect(exportParams.isAsc).toBe('desc')
      })
    })
  })

  describe('场景5：边界情况和错误处理', () => {
    it('queryParams 为空对象', () => {
      const queryParams = {}

      const params = buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: false
      })

      expect(params).toBeDefined()
      expect(typeof params).toBe('object')
    })

    it('dateRange 为 null', () => {
      const queryParams = { pageNum: 1 }

      const params = buildQueryPayload({
        queryParams,
        dateRange: null as any,
        isAdmin: true,
        forExport: false
      })

      expect(params.beginTime).toBeUndefined()
      expect(params.endTime).toBeUndefined()
    })

    it('dateRange 包含无效值', () => {
      const queryParams = { pageNum: 1 }

      const params = buildQueryPayload({
        queryParams,
        dateRange: [undefined, null] as any,
        isAdmin: true,
        forExport: false
      })

      // 应该能正常处理，不抛错
      expect(params).toBeDefined()
    })

    it('多次调用不应该产生副作用', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '测试'
      }
      const originalQueryParams = { ...queryParams }

      buildQueryPayload({
        queryParams,
        isAdmin: true,
        forExport: true
      })

      buildQueryPayload({
        queryParams,
        isAdmin: false,
        forExport: false
      })

      // queryParams 应该保持不变
      expect(queryParams).toEqual(originalQueryParams)
    })
  })
})
