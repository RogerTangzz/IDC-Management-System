// 通用 API 响应与分页模型
export interface ApiResult<T = any> { code: number; msg: string; data: T }
export interface PageResult<T = any> { total: number; rows: T[]; code?: number; msg?: string }

// 登录历史兼容：可能出现 token 顶层或 data.token
export type LoginRaw = { code: number; msg: string; token?: string; data?: { token?: string } }
export function extractToken(resp: LoginRaw): string | undefined {
  return resp.token ?? resp.data?.token
}
