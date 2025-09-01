// 认证 / 用户信息相关类型
export interface LoginParams { username: string; password: string; code?: string; uuid?: string }
export interface LoginResponse { token: string }

export interface UserDTO { userId: string | number; userName: string; nickName?: string; avatar?: string }
export interface GetInfoResponse {
  user: UserDTO
  roles: string[]
  permissions: string[]
  isDefaultModifyPwd?: boolean
  isPasswordExpired?: boolean
}
