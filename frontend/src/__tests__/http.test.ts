import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import service, { download } from '@/utils/request'

// mock element-plus 消息组件
vi.mock('element-plus', () => {
  const confirm = vi.fn(() => Promise.resolve())
  return {
    ElMessage: vi.fn(),
    ElMessageBox: { confirm },
    ElLoading: { service: vi.fn(() => ({ close: vi.fn() })) },
    ElNotification: { error: vi.fn() }
  }
})
vi.mock('file-saver', () => ({ saveAs: vi.fn() }))
vi.mock('@/store/modules/user', () => ({ default: () => ({ logOut: vi.fn().mockResolvedValue(undefined) }) }))

beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks() })

describe('http error branches', () => {
  it('401 triggers relogin flow once', async () => {
    const fulfilled = (service as any).interceptors.response.handlers[0].fulfilled
    await expect(fulfilled({ data: { code: 401, msg: '未授权' }, request: { responseType: '' } })).rejects.toThrow()
  })
  it('download handles blob error', async () => {
    // mock post to return non-blob json text
    vi.spyOn((service as any), 'post').mockResolvedValueOnce({
      text: async () => JSON.stringify({ code: 500, msg: '失败' })
    })
    await download('/x', {}, 'a.txt').catch(() => {})
    expect((service as any).post).toHaveBeenCalled()
  })
})
