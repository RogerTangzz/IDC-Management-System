// 全局通用类型定义（渐进式补充）

/// <reference types="vite/client" />
// 若需在类型测试中单独引用，可从 '@/utils/request' 导入 ApiResult/PageResult

// 仅取 data 的语义化 Promise（便于调用端不再层层 .data）
// 用法：const user = await resultData(getUser(id))
type ResultData<T> = Promise<T>

/**
 * 从 ApiResult<T> Promise 中提取 data 的辅助函数（在 utils/request.js 中实现）
 */
declare function resultData<T>(p: Promise<ApiResult<T>>): Promise<T>

// 模块解析（允许图片等资源导入）
declare module '*.jpg' { const src: string; export default src }
declare module '*.png' { const src: string; export default src }
declare module '*.svg' { const src: string; export default src }

// Vite 环境变量类型（最小化）
// 已由 vite/client 提供 ImportMeta / import.meta.env 类型

// 兼容路径别名的类型推断（最小化声明，避免 TS 路径解析报错）
declare module '@/router'
declare module '@/api/login'
declare module '@/utils/auth'
declare module '@/utils/validate'
declare module '@/plugins/auth'
declare module '@/api/menu'
declare module '@/layout/index'
declare module '@/layout/components/InnerLink'
declare module '@/components/ParentView'
declare module 'js-cookie'

// 基于 axios 封装后的统一 Promise 结果（与 request<T>() 返回值保持一致）
type AxiosResult<T = any> = Promise<ApiResult<T>>
// 可读性别名（也可在业务中使用 RequestResult<T>）
type RequestResult<T = any> = AxiosResult<T>

// 可选记录
type Maybe<T> = T | null | undefined

// 深局部可选（简化）
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// 工单/巡检/维护可后续拆分至独立模块
interface TicketBasic {
    id: number | string
    title: string
    priority?: string
    status?: string
    createTime?: string
    [key: string]: any
}

// Window 扩展（若有全局挂载）
interface Window {
    __APP_VERSION__?: string
}

export { }