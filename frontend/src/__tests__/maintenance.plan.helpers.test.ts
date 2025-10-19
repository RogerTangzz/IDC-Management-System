import { describe, it, expect } from 'vitest'
import {
  SORT_FIELD_MAP,
  buildHistoryPayload,
  buildQueryPayload
} from '@/views/business/maintenance/plan/index.helpers'

describe('维保计划 - 辅助函数测试', () => {
  describe('SORT_FIELD_MAP - 字段映射表', () => {
    it('应该包含所有支持排序的字段', () => {
      expect(SORT_FIELD_MAP).toHaveProperty('planNo')
      expect(SORT_FIELD_MAP).toHaveProperty('title')
      expect(SORT_FIELD_MAP).toHaveProperty('version')
      expect(SORT_FIELD_MAP).toHaveProperty('approvalStatus')
      expect(SORT_FIELD_MAP).toHaveProperty('executionStatus')
      expect(SORT_FIELD_MAP).toHaveProperty('lastExecutionTime')
      expect(SORT_FIELD_MAP).toHaveProperty('nextExecutionTime')
      expect(SORT_FIELD_MAP).toHaveProperty('createTime')
      expect(SORT_FIELD_MAP).toHaveProperty('updateTime')
    })

    it('应该正确映射前端字段到后端字段', () => {
      expect(SORT_FIELD_MAP.planNo).toBe('planId')
      expect(SORT_FIELD_MAP.title).toBe('title')
      expect(SORT_FIELD_MAP.createTime).toBe('createTime')
    })

    it('所有映射值都应该是非空字符串', () => {
      Object.values(SORT_FIELD_MAP).forEach(value => {
        expect(value).toBeTruthy()
        expect(typeof value).toBe('string')
      })
    })
  })

  describe('buildHistoryPayload - 历史记录参数构造', () => {
    it('应该使用默认参数', () => {
      const result = buildHistoryPayload({})

      expect(result.pageNum).toBe(1)
      expect(result.pageSize).toBe(100)
      expect(result.orderByColumn).toBe('time')
      expect(result.isAsc).toBe('asc')
      expect(result.type).toBeUndefined()
    })

    it('应该正确设置 approval 类型', () => {
      const result = buildHistoryPayload({ type: 'approval' })

      expect(result.type).toBe('approval')
      expect(result.pageNum).toBe(1)
    })

    it('应该正确设置 execution 类型', () => {
      const result = buildHistoryPayload({ type: 'execution' })

      expect(result.type).toBe('execution')
    })

    it('应该允许自定义分页参数', () => {
      const result = buildHistoryPayload({
        pageNum: 2,
        pageSize: 50
      })

      expect(result.pageNum).toBe(2)
      expect(result.pageSize).toBe(50)
    })

    it('应该允许自定义排序参数', () => {
      const result = buildHistoryPayload({
        orderByColumn: 'action',
        isAsc: 'desc'
      })

      expect(result.orderByColumn).toBe('action')
      expect(result.isAsc).toBe('desc')
    })
  })

  describe('buildQueryPayload - 查询参数构造', () => {
    it('应该复制基本查询参数', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        title: '测试计划',
        floor: '1'
      }

      const result = buildQueryPayload({ queryParams })

      expect(result.pageNum).toBe(1)
      expect(result.pageSize).toBe(10)
      expect(result.title).toBe('测试计划')
      expect(result.floor).toBe('1')
    })

    it('应该添加日期范围参数', () => {
      const queryParams = { pageNum: 1 }
      const dateRange = ['2025-10-01', '2025-10-17']

      const result = buildQueryPayload({ queryParams, dateRange })

      expect(result.beginTime).toBe('2025-10-01 00:00:00')
      expect(result.endTime).toBe('2025-10-17 23:59:59')
    })

    it('日期范围为空时不应该添加时间参数', () => {
      const queryParams = { pageNum: 1 }
      const dateRange = []

      const result = buildQueryPayload({ queryParams, dateRange })

      expect(result.beginTime).toBeUndefined()
      expect(result.endTime).toBeUndefined()
    })

    it('日期范围只有一个值时不应该添加时间参数', () => {
      const queryParams = { pageNum: 1 }
      const dateRange = ['2025-10-01']

      const result = buildQueryPayload({ queryParams, dateRange })

      expect(result.beginTime).toBeUndefined()
      expect(result.endTime).toBeUndefined()
    })

    it('非管理员应该添加 mineOnly 参数', () => {
      const queryParams = { pageNum: 1 }

      const result = buildQueryPayload({
        queryParams,
        isAdmin: false
      })

      expect(result.mineOnly).toBe(true)
    })

    it('管理员不应该添加 mineOnly 参数', () => {
      const queryParams = { pageNum: 1 }

      const result = buildQueryPayload({
        queryParams,
        isAdmin: true
      })

      expect(result.mineOnly).toBeUndefined()
    })

    it('导出模式应该移除分页参数', () => {
      const queryParams = {
        pageNum: 2,
        pageSize: 20,
        title: '测试'
      }

      const result = buildQueryPayload({
        queryParams,
        forExport: true
      })

      expect(result.pageNum).toBeUndefined()
      expect(result.pageSize).toBeUndefined()
      expect(result.title).toBe('测试')
    })

    it('非导出模式应该保留分页参数', () => {
      const queryParams = {
        pageNum: 2,
        pageSize: 20
      }

      const result = buildQueryPayload({
        queryParams,
        forExport: false
      })

      expect(result.pageNum).toBe(2)
      expect(result.pageSize).toBe(20)
    })

    it('应该保留排序参数', () => {
      const queryParams = {
        pageNum: 1,
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }

      const result = buildQueryPayload({ queryParams })

      expect(result.orderByColumn).toBe('createTime')
      expect(result.isAsc).toBe('desc')
    })

    it('应该正确处理完整场景：非管理员导出带筛选和排序', () => {
      const queryParams = {
        pageNum: 2,
        pageSize: 20,
        title: '维保计划',
        floor: '1',
        approvalStatus: 'approved',
        orderByColumn: 'createTime',
        isAsc: 'desc'
      }
      const dateRange = ['2025-10-01', '2025-10-17']

      const result = buildQueryPayload({
        queryParams,
        dateRange,
        isAdmin: false,
        forExport: true
      })

      // 应该移除分页
      expect(result.pageNum).toBeUndefined()
      expect(result.pageSize).toBeUndefined()

      // 应该保留筛选条件
      expect(result.title).toBe('维保计划')
      expect(result.floor).toBe('1')
      expect(result.approvalStatus).toBe('approved')

      // 应该保留排序
      expect(result.orderByColumn).toBe('createTime')
      expect(result.isAsc).toBe('desc')

      // 应该添加日期范围
      expect(result.beginTime).toBe('2025-10-01 00:00:00')
      expect(result.endTime).toBe('2025-10-17 23:59:59')

      // 应该添加数据权限
      expect(result.mineOnly).toBe(true)
    })

    it('不应该修改原始 queryParams 对象', () => {
      const queryParams = {
        pageNum: 1,
        pageSize: 10
      }
      const original = { ...queryParams }

      buildQueryPayload({ queryParams, forExport: true })

      expect(queryParams).toEqual(original)
    })
  })
})
