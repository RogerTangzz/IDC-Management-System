import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import rawBusinessRoutes from '@/router/modules/business.ts'
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
        async generateRoutes(_roles?: string[]) {
            const res = await getRouters()
            if (process.env.NODE_ENV !== 'production') {
                console.debug('[permission] raw routers count=', Array.isArray(res.data) ? res.data.length : 'n/a', res.data)
            }
            // 深拷贝，避免原数据被原地修改
            const sdata: BackendRoute[] = structuredClone(res.data)
            const rdata: BackendRoute[] = structuredClone(res.data)
            const defaultData: BackendRoute[] = structuredClone(res.data)

            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            // 如果后端未提供 /business，则整体注入本地业务路由；否则仅补充隐藏子路由
            const hasBackendBusiness = hasRouteByPath(rewriteRoutes as any, '/business')
            if (!hasBackendBusiness) {
                const asyncRoutes = filterDynamicRoutes(dynamicRoutes as any)
                asyncRoutes.forEach((route: RouteRecordRaw) => { router.addRoute(route) })
            } else {
                try { augmentBusinessHiddenRoutes() } catch (e) { if (import.meta.env.DEV) console.warn('[permission] augmentBusinessHiddenRoutes failed', e) }
            }
            this.setRoutes(rewriteRoutes as unknown as RouteRecordRaw[])
            applyBusinessChinese(sidebarRoutes as any)
            applyBusinessChinese(rewriteRoutes as any)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes as any))
            this.setDefaultRoutes(sidebarRoutes as any)
            this.setTopbarRoutes(defaultRoutes as any)
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

// ----------------------- 辅助：本地化业务菜单标题 -----------------------
function localizeBusinessTitles(routes: BackendRoute[]): BackendRoute[] {
    const dict: Record<string, string> = {
        ticket: '工单管理',
        inspection: '巡检',
        maintenance: '维保计划',
    }
    const walk = (nodes?: BackendRoute[], parentPath = '') => {
        if (!nodes) return
        for (const r of nodes) {
            const seg = (r.path || '').split('/').filter(Boolean).pop() || ''
            if (parentPath === '/business' && dict[seg]) {
                r.meta = r.meta || {}
                r.meta.title = dict[seg]
            }
            if (r.path === '/business') {
                r.meta = r.meta || {}
                r.meta.title = 'IDC运维管理'
            }
            walk(r.children, r.path || '')
        }
    }
    walk(routes)
    return routes
}

// ----------------------- 辅助：补充隐藏业务子路由 -----------------------
function hasRouteByPath(routes: BackendRoute[], path: string): boolean {
    const q: BackendRoute[] = [...routes]
    while (q.length) {
        const r = q.shift()!
        if (r.path === path) return true
        if (r.children) q.push(...r.children)
    }
    return false
}

function augmentBusinessHiddenRoutes() {
    try {
        const raws: any[] = (rawBusinessRoutes as any) || []
        const root = raws.find((r: any) => r?.path === '/business') || raws[0]
        if (!root) return
        const groups: any[] = root.children || []
        const hiddenChildren: { absPath: string; route: any }[] = []
        for (const g of groups) {
            const base = typeof g.path === 'string' ? g.path.replace(/^\//, '') : ''
            const cs = g.children || []
            for (const c of cs) {
                if (c && c.hidden === true) {
                    const childPath = String(c.path || '').replace(/^\//, '')
                    const abs = `/business/${base}/${childPath}`.replace(/\/+/g, '/').replace(/\/+$/, '')
                    hiddenChildren.push({ absPath: abs, route: c })
                }
            }
        }
        for (const { absPath, route } of hiddenChildren) {
            const r: any = { ...route, path: absPath }
            if (r.name) r.name = `X_${r.name}`
            try { router.addRoute(r) } catch (e) { /* ignore duplicate */ }
        }
    } catch (e) {
        if (import.meta.env.DEV) console.warn('[permission] augmentBusinessHiddenRoutes error', e)
    }
}

// 菜单中文本地化（就地修改）
function applyBusinessChinese(routes: BackendRoute[]): void {
    const dict: Record<string, string> = {
        ticket: '工单管理',
        inspection: '巡检',
        maintenance: '维保计划',
    }
    const walk = (nodes?: BackendRoute[], parentPath = ''): void => {
        if (!nodes) return
        for (const r of nodes) {
            const seg = (r.path || '').split('/').filter(Boolean).pop() || ''
            if (parentPath === '/business' && dict[seg]) {
                r.meta = r.meta || {}
                r.meta.title = dict[seg]
            }
            if (r.path === '/business') {
                r.meta = r.meta || {}
                r.meta.title = 'IDC运维管理'
            }
            walk(r.children, r.path || '')
        }
    }
    walk(routes)
}

export default usePermissionStore
