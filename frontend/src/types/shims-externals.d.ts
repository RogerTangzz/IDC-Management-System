// 临时最小声明：待后续将对应 JS 迁移为 .ts 后删除

declare module '@/utils/auth' { export function getToken(): string | undefined; export function setToken(token: string): void; export function removeToken(): void }

declare module '@/utils/errorCode' { const map: Record<string | number, string>; export default map }

declare module '@/utils/ruoyi' {
    export function parseTime(time: any, pattern?: string): string | null
    export function resetForm(refName: string): void
    export function addDateRange(params: any, dateRange: any[], propName?: string): any
    export function selectDictLabel(datas: any[], value: any): string
    export function selectDictLabels(datas: any[], value: any, separator?: string): string
    export function sprintf(str: string, ...args: any[]): string
    export function parseStrEmpty(str: any): string
    export function mergeRecursive<T>(source: T, target: any): T
    export function handleTree(data: any[], id?: string, parentId?: string, children?: string): any[]
    export function tansParams(params: Record<string, any>): string
    export function getNormalPath(p: string): string
    export function blobValidate(data: any): boolean
}

declare module '@/plugins/cache' {
    const cache: {
        session: { getJSON(key: string): any; setJSON(key: string, v: any): void }
    }
    export default cache
}

declare module 'file-saver' { export function saveAs(data: Blob, filename?: string): void }

declare module '@/store/modules/user' { const useUserStore: () => { logOut(): Promise<void> }; export default useUserStore }

// 额外路由与组件占位（尚未 TS 化）
declare module '@/router' {
    import type { RouteRecordRaw } from 'vue-router'
    export const constantRoutes: RouteRecordRaw[]
    export const dynamicRoutes: RouteRecordRaw[]
    const router: any
    export default router
}
declare module '@/api/menu' { import type { ApiResult } from '@/utils/request'; export function getRouters(): Promise<ApiResult<any>> }
declare module '@/layout/index' { const comp: any; export default comp }
declare module '@/layout/index.vue' { const comp: any; export default comp }
declare module '@/layout/components/InnerLink' { const comp: any; export default comp }
declare module '@/layout/components/InnerLink/index.vue' { const comp: any; export default comp }
declare module '@/components/ParentView' { const comp: any; export default comp }
declare module '@/components/ParentView/index.vue' { const comp: any; export default comp }
// 通用 views 下的动态导入简化 (可逐步删除)
declare module '@/views/*' { const comp: any; export default comp }
declare module '@/views/**/*.vue' { const comp: any; export default comp }
declare module '@/plugins/auth' { const auth: any; export default auth }
// 本地相对导入声明（Bundler 解析 TS 源）
declare module '../router/modules/business' {
    import type { RouteRecordRaw } from 'vue-router'
    const routes: RouteRecordRaw[]
    export default routes
}
