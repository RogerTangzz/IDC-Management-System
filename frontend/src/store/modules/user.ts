/// <reference path="../../types/entities.d.ts" />
import router from '@/router'
import { ElMessageBox } from 'element-plus'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from '@/utils/validate'
import defAva from '@/assets/images/profile.jpg'
// 注意：后端 /getInfo 与 /login 返回结构并不统一（/login: {code,msg,token} ； /getInfo: {code,msg,user,roles,...})
// 因此这里不直接使用 resultData，而是兼容 data 包裹与顶层字段两种形式。

interface UserState {
    token: string | undefined
    id: string | number | ''
    name: string
    nickName: string
    avatar: string
    roles: string[]
    permissions: string[]
}

interface LoginParams { username: string; password: string; code?: string; uuid?: string }

interface LoginResponse { token: string }

// 临时 User 类型（后续应与后端接口模型统一）：
interface UserDTO { userId: string | number; userName: string; nickName?: string; avatar?: string }
interface GetInfoResponse {
    user: UserDTO
    roles: string[]
    permissions: string[]
    isDefaultModifyPwd?: boolean
    isPasswordExpired?: boolean
}

const useUserStore = defineStore('user', {
    state: (): UserState => ({
        token: getToken(),
        id: '',
        name: '',
        nickName: '',
        avatar: '',
        roles: [],
        permissions: []
    }),
    actions: {
        async login(userInfo: LoginParams): Promise<void> {
            const { username, password, code, uuid } = userInfo
            console.debug('[userStore.login] payload', { username: username.trim(), hasPassword: !!password, code, uuid })
            let loginResp: any
            try {
                loginResp = await login(username.trim(), password, code, uuid)
            } catch (e: any) {
                console.error('[userStore.login] request failed', e?.response || e)
                const msg = e?.response?.data?.msg || e?.message || '登录请求失败'
                if (typeof window !== 'undefined') {
                    ; (window as any).__lastLoginError = e
                }
                throw new Error(msg)
            }
            console.debug('[userStore.login] raw response', loginResp)
            const token: string | undefined = loginResp?.token ?? loginResp?.data?.token
            if (!token) {
                console.error('[userStore.login] token missing in response, keys=', Object.keys(loginResp || {}))
                if (typeof window !== 'undefined') {
                    ; (window as any).__lastLoginResponse = loginResp
                }
                throw new Error('登录响应缺少 token 字段')
            }
            setToken(token)
            this.token = token
            if (typeof window !== 'undefined') {
                ; (window as any).__lastLoginResponse = loginResp
            }
        },
        async getInfo(): Promise<GetInfoResponse> {
            const res = await getInfo()
            // 兼容：真实/Mock 可能直接返回 {user,roles,...}；也可能是 {data:{user,roles,...}}
            const data: any = (res as any)?.data && typeof (res as any).data === 'object'
                && ((res as any).data.user || (res as any).data.roles)
                ? (res as any).data
                : res

            if (!data || !data.user) {
                console.error('[userStore.getInfo] 响应缺少 user 字段', res)
                throw new Error('获取用户信息失败：响应缺少 user 字段')
            }

            const user = data.user
            let avatar = user.avatar || ''
            if (!isHttp(avatar)) {
                avatar = isEmpty(avatar) ? (defAva as string) : import.meta.env.VITE_APP_BASE_API + avatar
            }
            if (data.roles && data.roles.length > 0) {
                this.roles = data.roles
                this.permissions = data.permissions
            } else {
                this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.nickName = user.nickName || ''
            this.avatar = avatar
            if (data.isDefaultModifyPwd) {
                ElMessageBox.confirm('您的密码还是初始密码，请修改密码！', '安全提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
                    .then(() => { router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } }) }).catch(() => { })
            }
            if (!data.isDefaultModifyPwd && data.isPasswordExpired) {
                ElMessageBox.confirm('您的密码已过期，请尽快修改密码！', '安全提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
                    .then(() => { router.push({ name: 'Profile', params: { activeTab: 'resetPwd' } }) }).catch(() => { })
            }
            return data
        },
        async logOut(): Promise<void> {
            try {
                await logout()
            } finally {
                this.token = ''
                this.roles = []
                this.permissions = []
                removeToken()
            }
        }
    }
})

export default useUserStore
