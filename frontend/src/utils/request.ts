// 按需引入 mock，避免在关闭 mock 场景仍然注册拦截与污染接口
if (import.meta.env.VITE_USE_MOCK === 'true') {
    import('../mock')
}
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

// --------------------------- 基础响应类型 ----------------------------
export interface ApiResult<T = any> { code: number; msg: string; data: T }
export interface PageResult<T = any> { total: number; rows: T[]; code?: number; msg?: string }

// 与旧全局保持兼容（后续可移除 global.d.ts 中重复声明）
export type AxiosResult<T = any> = Promise<ApiResult<T>>
export type RequestResult<T = any> = AxiosResult<T>

// 是否显示重新登录
// isRelogin 兼容原有逻辑；增加 internalUnauthorizedHandling 防止多次并发 401 重复弹窗
export const isRelogin: { show: boolean } = { show: false }
let internalUnauthorizedHandling = false
let downloadLoadingInstance: ReturnType<typeof ElLoading.service> | undefined

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 10000,
})

// --------------------------- 请求拦截器 ----------------------------
service.interceptors.request.use((config) => {
    const headers = config.headers || {}
    const isTokenDisabled = headers.isToken === false
    const isRepeatSubmitDisabled = headers.repeatSubmit === false
    if (getToken() && !isTokenDisabled) {
        headers['Authorization'] = 'Bearer ' + getToken()
    }
    config.headers = headers

    if (config.method === 'get' && config.params) {
        let url = (config.url || '') + '?' + tansParams(config.params as Record<string, any>)
        url = url.slice(0, -1)
        config.params = {}
        config.url = url
    }

    if (!isRepeatSubmitDisabled && (config.method === 'post' || config.method === 'put')) {
        const requestObj = {
            url: config.url,
            data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
            time: Date.now(),
        }
        const requestSize = Object.keys(JSON.stringify(requestObj)).length
        const limitSize = 5 * 1024 * 1024
        if (requestSize >= limitSize) {
            console.warn(`[${config.url}]: 请求数据大小超出允许的5M限制，无法进行防重复提交验证。`)
            return config
        }
        const sessionObj = cache.session.getJSON('sessionObj') as typeof requestObj | undefined
        if (!sessionObj) {
            cache.session.setJSON('sessionObj', requestObj)
        } else {
            const interval = 1000
            if (
                sessionObj.data === requestObj.data &&
                requestObj.time - sessionObj.time < interval &&
                sessionObj.url === requestObj.url
            ) {
                const message = '数据正在处理，请勿重复提交'
                console.warn(`[${sessionObj.url}]: ${message}`)
                return Promise.reject(new Error(message))
            } else {
                cache.session.setJSON('sessionObj', requestObj)
            }
        }
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

// --------------------------- 响应拦截器 ----------------------------
service.interceptors.response.use((res: AxiosResponse<ApiResult<any>>) => {
    const code = res.data?.code ?? 200
    const msg = (errorCode as any)[code] || res.data?.msg || (errorCode as any)['default']

    if ((res.request as XMLHttpRequest).responseType === 'blob' || (res.request as XMLHttpRequest).responseType === 'arraybuffer') {
        return res.data as any
    }

    if (code === 401) {
        // 并发 401 仅处理一次
        if (!internalUnauthorizedHandling) {
            internalUnauthorizedHandling = true
            isRelogin.show = true
            const userStore = useUserStore()
            // 使用消息框提示；也可根据需要直接静默跳转
            ElMessageBox.confirm('登录状态已过期，请重新登录', '认证提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning',
                closeOnClickModal: false,
                distinguishCancelAndClose: true
            }).then(() => {
                return userStore.logOut()
            }).catch(() => {
                // 用户取消仍然清理本地 token，避免后续请求继续 401 风暴
                return userStore.logOut()
            }).finally(() => {
                isRelogin.show = false
                internalUnauthorizedHandling = false
                // 保留当前路径用于登录后返回（排除已在 /login 时）
                const current = location.pathname + location.search + location.hash
                if (!/\/login$/.test(location.pathname)) {
                    location.replace(`/login?redirect=${encodeURIComponent(current)}`)
                }
            })
        }
        return Promise.reject(new Error(msg || '登录已过期'))
    }
    if (code === 500) {
        ElMessage({ message: msg, type: 'error' })
        return Promise.reject(new Error(msg))
    }
    if (code === 601) {
        ElMessage({ message: msg, type: 'warning' })
        return Promise.reject(new Error(msg))
    }
    if (code !== 200) {
        ElNotification.error({ title: msg })
        return Promise.reject(new Error(msg))
    }
    return res.data
}, (error) => {
    const errObj = error as any
    if (errObj?.response) {
        console.error('[http] error response', {
            url: errObj.config?.url,
            status: errObj.response.status,
            data: errObj.response.data
        })
    } else {
        console.error('[http] network/error', errObj)
    }
    let { message } = error as { message: string }
    if (message === 'Network Error') message = '后端接口连接异常'
    else if (message.includes('timeout')) message = '系统接口请求超时'
    else if (message.includes('Request failed with status code')) message = '系统接口' + message.slice(-3) + '异常'
    ElMessage({ message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
})

// --------------------------- 下载封装 ----------------------------
export function download(url: string, params: Record<string, any>, filename: string, config?: AxiosRequestConfig) {
    downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' })
    return service
        .post(url, params, {
            transformRequest: [p => tansParams(p)],
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            responseType: 'blob',
            ...config,
        })
        .then(async (data: any) => {
            // 此处返回的是原始 AxiosResponse.data（已被拦截器绕过直接返回 blob）
            const isBlob = blobValidate(data)
            if (isBlob) {
                const blob = data instanceof Blob ? data : new Blob([data])
                saveAs(blob, filename)
            } else {
                const resText = await (data as any).text()
                const rspObj = JSON.parse(resText)
                const errMsg = (errorCode as any)[rspObj.code] || rspObj.msg || (errorCode as any)['default']
                ElMessage.error(errMsg)
            }
            downloadLoadingInstance?.close()
        })
        .catch((r) => {
            console.error(r)
            ElMessage.error('下载文件出现错误，请联系管理员！')
            downloadLoadingInstance?.close()
        })
}

// --------------------------- 泛型请求主函数 ----------------------------
export function request<T = any>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
    return service(config) as Promise<ApiResult<T>>
}

export function get<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig) {
    return request<T>({ url, method: 'get', params, ...(config || {}) })
}
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return request<T>({ url, method: 'post', data, ...(config || {}) })
}
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return request<T>({ url, method: 'put', data, ...(config || {}) })
}
export function del<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig) {
    return request<T>({ url, method: 'delete', params, ...(config || {}) })
}

// 语义化提取 data
type UnwrapResult<T> = T extends Promise<ApiResult<infer R>> ? Promise<R> : never
export function resultData<T>(p: Promise<ApiResult<T>>): Promise<T> { return p.then(r => r.data) }

export default service
