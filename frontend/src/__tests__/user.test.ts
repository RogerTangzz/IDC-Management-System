// mocks MUST be before any imports that use them
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))
vi.mock('element-plus', () => ({ ElMessageBox: { confirm: vi.fn().mockResolvedValue(undefined) } }))
const setTokenSpy = vi.fn()
vi.mock('@/utils/auth', () => ({
  getToken: () => undefined,
  setToken: (t: string) => setTokenSpy(t),
  removeToken: () => void 0
}))
vi.mock('@/api/login', () => { return { login: vi.fn(), logout: vi.fn().mockResolvedValue({ code: 200 }), getInfo: vi.fn() } })

import { createPinia, setActivePinia } from 'pinia'
import { login as loginApi, getInfo as getInfoApi } from '@/api/login'
import useUserStore from '@/store/modules/user'

beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks() })

describe('user store auth flow', () => {
  it('login success (raw token)', async () => {
    ;(loginApi as any).mockResolvedValueOnce({ code: 200, token: 'abc123' })
  const store: any = useUserStore()
    await store.login({ username: 'admin', password: '123456' })
    expect(store.token).toBe('abc123')
    expect(setTokenSpy).toHaveBeenCalledWith('abc123')
  })
  it('login success (wrapped token in data)', async () => {
    ;(loginApi as any).mockResolvedValueOnce({ code: 200, data: { token: 'wrap999' } })
  const store: any = useUserStore()
    await store.login({ username: 'admin', password: '123456' })
    expect(store.token).toBe('wrap999')
  })
  it('login missing token throws', async () => {
    ;(loginApi as any).mockResolvedValueOnce({ code: 200, msg: 'ok' })
  const store: any = useUserStore()
    await expect(store.login({ username: 'a', password: 'b' })).rejects.toThrow('登录响应缺少 token 字段')
  })
  it('getInfo top-level user', async () => {
    ;(getInfoApi as any).mockResolvedValueOnce({ code: 200, user: { userId: 1, userName: 'admin' }, roles: ['admin'], permissions: ['*:*:*'] })
  const store: any = useUserStore()
    const data = await store.getInfo()
    expect(data.user.userName).toBe('admin')
    expect(store.roles).toContain('admin')
  })
  it('getInfo data-wrapped user', async () => {
    ;(getInfoApi as any).mockResolvedValueOnce({ code: 200, data: { user: { userId: 2, userName: 'wrapper' }, roles: ['editor'], permissions: ['biz:read'] } })
  const store: any = useUserStore()
    const data = await store.getInfo()
    expect(data.user.userName).toBe('wrapper')
    expect(store.roles).toContain('editor')
  })
  it('getInfo missing user throws', async () => {
    ;(getInfoApi as any).mockResolvedValueOnce({ code: 200, msg: 'ok' })
  const store: any = useUserStore()
    await expect(store.getInfo()).rejects.toThrow('获取用户信息失败：响应缺少 user 字段')
  })
})
