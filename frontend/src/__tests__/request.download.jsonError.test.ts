import { describe, it, expect, vi } from 'vitest'

// Mock element-plus ElLoading/ElMessage used by download()
const msgErrorSpy = vi.fn()
vi.mock('element-plus', () => ({
  ElLoading: { service: () => ({ close: vi.fn() }) },
  ElMessage: { error: msgErrorSpy },
  ElNotification: { error: vi.fn(), success: vi.fn() },
  ElMessageBox: { confirm: vi.fn() }
}))

// Mock axios instance used inside utils/request.ts
const postSpy = vi.fn()
vi.mock('axios', () => {
  const service = {
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: {} },
    post: postSpy
  }
  const axios: any = { create: () => service, defaults: { headers: {} } }
  return { __esModule: true, default: axios }
})

// Import download after mocks
import { download } from '@/utils/request'

describe('utils/request.download: handle JSON error body (non-blob)', () => {
  it('shows ElMessage.error when server returns JSON text instead of blob', async () => {
    // Arrange server response: return object with text() => JSON string
    postSpy.mockResolvedValueOnce({ text: async () => JSON.stringify({ code: 500, msg: '导出失败' }) })
    await download('/business/ticket/export', { a: 1 }, 't.xlsx')
    // Assert Element Plus error called
    expect(msgErrorSpy).toHaveBeenCalled()
  })
})

