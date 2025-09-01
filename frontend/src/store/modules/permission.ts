import auth from '@/plugins/auth'
import { defineStore } from 'pinia'
import router, { constantRoutes, dynamicRoutes } from '@/router'
// 直接引入业务本地路由，防止由于某些构建/循环依赖导致 dynamicRoutes 丢失该节点
import businessRoutes from '@/router/modules/business.ts'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index.vue'
// 显式加 .vue 以兼容 Vitest 在 Node 环境的路径解析（无真实目录同名 index.ts 情况）
import ParentView from '@/components/ParentView/index.vue'
// 显式加 .vue 解决 Vitest 解析（与真实文件 index.vue 对应）
import InnerLink from '@/layout/components/InnerLink/index.vue'
import type { RouteRecordRaw } from 'vue-router'

// 匹配 views 目录下所有 .vue 文件 (动态 import)
// 使用别名形式，避免相对路径层级变动导致 glob 失效
const modules = import.meta.glob('@/views/**/*.vue')

// 后端返回的原始路由结构（部分字段）
export interface BackendRoute {
    path: string
    component?: string
    name?: string
    hidden?: boolean
    redirect?: string
    permissions?: string[]
    roles?: string[]
    meta?: {
        title?: string
        icon?: string
        noCache?: boolean
        breadcrumb?: boolean
        activeMenu?: string
        affix?: boolean
        link?: string
    }
    children?: BackendRoute[]
}

export interface PermissionState {
    routes: RouteRecordRaw[]
    addRoutes: RouteRecordRaw[]
    defaultRoutes: RouteRecordRaw[]
    topbarRouters: RouteRecordRaw[]
    sidebarRouters: RouteRecordRaw[]
}

const usePermissionStore = defineStore('permission', {
    state: (): PermissionState => ({
        routes: [],
        addRoutes: [],
        defaultRoutes: [],
        topbarRouters: [],
        sidebarRouters: []
    }),
    actions: {
        setRoutes(routes: RouteRecordRaw[]) {
            this.addRoutes = routes
            this.routes = constantRoutes.concat(routes)
        },
        setDefaultRoutes(routes: RouteRecordRaw[]) {
            this.defaultRoutes = constantRoutes.concat(routes)
        },
        setTopbarRoutes(routes: RouteRecordRaw[]) {
            this.topbarRouters = routes
        },
        setSidebarRouters(routes: RouteRecordRaw[]) {
            this.sidebarRouters = routes
        },
    /**
     * 生成可访问路由（含后端返回 + 本地 dynamicRoutes）
     * 若后端获取失败使用空数组 fallback，仍然注入 dynamicRoutes 以保证基础功能。
     */
    async generateRoutes(_roles?: string[]): Promise<BackendRoute[]> {
            let backend: any[] = []
            try {
                const res = await getRouters()
                if (process.env.NODE_ENV !== 'production') {
                    console.debug('[permission] raw routers count=', Array.isArray(res.data) ? res.data.length : 'n/a', res.data)
                }
                backend = Array.isArray(res.data) ? res.data : []
            } catch (e) {
                console.error('[permission] 获取路由失败，使用空路由集合', e)
                backend = []
            }
            const sdata: BackendRoute[] = structuredClone(backend)
            const rdata: BackendRoute[] = structuredClone(backend)
            const defaultData: BackendRoute[] = structuredClone(backend)

            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            if (import.meta.env.DEV) {
                console.debug('[permission] imported dynamicRoutes length=', (dynamicRoutes as any)?.length)
            }
            let asyncRoutes = filterDynamicRoutes(dynamicRoutes as any)
            if (import.meta.env.DEV) {
                console.debug('[permission] after filterDynamicRoutes length=', asyncRoutes.length, asyncRoutes.map(r=>r.path))
            }
            if (!asyncRoutes.some((r: any) => r.path === '/business')) {
                if (import.meta.env.DEV) console.warn('[permission] dynamicRoutes 中缺少 /business，执行补充注入')
                asyncRoutes = asyncRoutes.concat(filterDynamicRoutes(businessRoutes as any))
                if (import.meta.env.DEV) {
                    console.debug('[permission] appended businessRoutes, now length=', asyncRoutes.length, asyncRoutes.map(r=>r.path))
                }
            }
            // 运行时注入本地动态路由
            asyncRoutes.forEach((route: RouteRecordRaw) => { router.addRoute(route) })

            // 合并：后端路由 + 本地动态（避免重复 path）
            const dedupe = <T extends { path?: string }>(list: T[]): T[] => {
                const seen = new Set<string>()
                return list.filter(r => {
                    const p = r.path || ''
                    if (seen.has(p)) return false
                    seen.add(p)
                    return true
                })
            }
            const mergedRoutes = dedupe([...(rewriteRoutes as any), ...asyncRoutes])
            const mergedSidebar = dedupe([...(sidebarRoutes as any), ...asyncRoutes])

            // 顶部菜单：需要把本地动态中同级(拥有 Layout 作为根组件)的路由合并，否则顶部无法出现 /business
            const asyncLayoutRoots = asyncRoutes.filter((r: any) => (r as any).component === Layout)
            let mergedTopbar = dedupe([...(defaultRoutes as any), ...asyncLayoutRoots])
            // 若 /business 未被识别为 Layout 根（可能因组件引用不相等），显式补充
            if (!mergedTopbar.some((r: any) => r.path === '/business')) {
                const biz = asyncRoutes.find((r: any) => r.path === '/business')
                if (biz) {
                    mergedTopbar.push(biz as any)
                    mergedTopbar = dedupe(mergedTopbar)
                    if (import.meta.env.DEV) console.debug('[permission] 补充 /business 进入 topbarRouters')
                } else if (import.meta.env.DEV) {
                    console.warn('[permission] 未找到 /business 路由用于顶部菜单')
                }
            }

            this.setRoutes(mergedRoutes as unknown as RouteRecordRaw[])
            this.setSidebarRouters(constantRoutes.concat(mergedSidebar as any))
            this.setDefaultRoutes(sidebarRoutes as any)
            this.setTopbarRoutes(mergedTopbar as any)
            if (typeof window !== 'undefined') {
                ; (window as any).__perm = this
            }
            return rewriteRoutes
        }
    }
})

// 转换后端路由为前端可用的 RouteRecordRaw
function filterAsyncRouter(asyncRouterMap: BackendRoute[], _lastRouter: BackendRoute | false = false, type = false): BackendRoute[] {
    const processed = asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children)
        }
        if (route.component) {
            if (route.component === 'Layout') {
                // Layout 组件特殊处理
                ; (route as any).component = Layout
            } else if (route.component === 'ParentView') {
                ; (route as any).component = ParentView
            } else if (route.component === 'InnerLink') {
                ; (route as any).component = InnerLink
            } else {
                ; (route as any).component = loadView(route.component)
            }
        }
        if (route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children, route, type)
        } else if (!route.component) {
            delete route.children
            delete route.redirect
            if (import.meta.env.DEV) {
                console.warn('[permission] 丢弃无组件叶子路由：', route.path)
            }
            return false
        }
        return true
    })
    if (import.meta.env.DEV) {
        console.debug('[permission] 处理后的异步路由：', processed.map(r => r.path))
    }
    return processed
}

function filterChildren(childrenMap: BackendRoute[], _lastRouter: BackendRoute | false = false): BackendRoute[] {
    const children: BackendRoute[] = []
    childrenMap.forEach(el => {
        if (el.children && el.children.length && el.component === 'ParentView') {
            el.children = filterChildren(el.children, el)
            children.push(el)
        } else {
            children.push(el)
        }
    })
    return children
}

// 动态路由权限过滤
export function filterDynamicRoutes(routes: RouteRecordRaw[]) {
    const res: RouteRecordRaw[] = []
    routes.forEach(route => {
        const anyRoute: any = route
        if (anyRoute.permissions) {
            if (auth.hasPermiOr(anyRoute.permissions)) {
                res.push(route)
            }
        } else if (anyRoute.roles) {
            if (auth.hasRoleOr(anyRoute.roles)) {
                res.push(route)
            }
        } else {
            // 没有权限/角色限制的路由默认保留
            res.push(route)
        }
    })
    return res
}

export const loadView = (view: string) => {
    let res: (() => Promise<any>) | undefined
    for (const path in modules) {
        const dir = path.split('views/')[1].split('.vue')[0]
        if (dir === view) {
            res = () => modules[path]() as Promise<any>
            break
        }
    }
    return res
}

export default usePermissionStore
