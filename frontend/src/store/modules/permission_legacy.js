// Legacy fallback permission store (restored)
import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// Glob all view components
const modules = import.meta.glob('@/views/**/*.vue')

const usePermissionStoreLegacy = defineStore('permission_legacy', {
    state: () => ({
        routes: [],
        addRoutes: [],
        defaultRoutes: [],
        topbarRouters: [],
        sidebarRouters: []
    }),
    actions: {
        setRoutes(routes) {
            this.addRoutes = routes
            this.routes = constantRoutes.concat(routes)
        },
        setDefaultRoutes(routes) {
            this.defaultRoutes = constantRoutes.concat(routes)
        },
        setTopbarRoutes(routes) {
            this.topbarRouters = routes
        },
        setSidebarRouters(routes) {
            this.sidebarRouters = routes
        },
        async generateRoutes(_roles) {
            const res = await getRouters()
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => router.addRoute(route))
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            if (typeof window !== 'undefined') window.__perm_legacy = this
            return rewriteRoutes
        }
    }
})

function filterAsyncRouter(asyncRouterMap, _lastRouter = false, type = false) {
    const processed = asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children)
        }
        if (route.component) {
            if (route.component === 'Layout') {
                route.component = Layout
            } else if (route.component === 'ParentView') {
                route.component = ParentView
            } else if (route.component === 'InnerLink') {
                route.component = InnerLink
            } else {
                route.component = loadView(route.component)
            }
        }
        if (route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children, route, type)
        } else if (!route.component) {
            delete route.children
            delete route.redirect
            return false
        }
        return true
    })
    return processed
}

function filterChildren(childrenMap, _lastRouter = false) {
    const children = []
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

export function filterDynamicRoutes(routes) {
    const res = []
    routes.forEach(route => {
        if (route.permissions) {
            if (auth.hasPermiOr(route.permissions)) res.push(route)
        } else if (route.roles) {
            if (auth.hasRoleOr(route.roles)) res.push(route)
        }
    })
    return res
}

export const loadView = (view) => {
    let res
    for (const path in modules) {
        const dir = path.split('views/')[1].split('.vue')[0]
        if (dir === view) {
            res = () => modules[path]()
            break
        }
    }
    return res
}

export default usePermissionStoreLegacy