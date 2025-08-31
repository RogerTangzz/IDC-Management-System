import { describe, it, expect, vi } from 'vitest'

// pinia defineStore stub (avoid bringing real pinia for unit isolation)
vi.mock('pinia', () => ({ defineStore: (_id: string, options: any) => () => options }))

vi.mock('@/router', () => ({
    constantRoutes: [],
    dynamicRoutes: [],
    default: { addRoute: () => { } }
}))
vi.mock('@/layout/index.vue', () => ({}))
vi.mock('@/layout/index', () => ({}))
vi.mock('@/components/ParentView', () => ({}))
vi.mock('@/components/ParentView/index.vue', () => ({}))
vi.mock('@/layout/components/InnerLink', () => ({}))
vi.mock('@/layout/components/InnerLink/index.vue', () => ({}))
vi.mock('@/plugins/auth', () => ({
    default: {
        hasPermiOr: (perms: string[]) => (global as any).__permMock?.hasPermiOr?.(perms) ?? false,
        hasRoleOr: (roles: string[]) => (global as any).__permMock?.hasRoleOr?.(roles) ?? false
    }
}))

import { filterDynamicRoutes } from '@/store/modules/permission.ts'

describe('permission dynamic route filtering', () => {
    it('keeps routes without auth meta', () => {
        const routes: any[] = [{ path: '/open', component: {} }]
        const res = filterDynamicRoutes(routes as any)
        expect(res.length).toBe(1)
    })
    it('filters permission routes when auth plugin denies', () => {
        // mock auth plugin globally
        ; (global as any).__permMock = { hasPermiOr: () => false, hasRoleOr: () => false }
        const routes: any[] = [{ path: '/secure', component: {}, permissions: ['x:y'] }]
        const res = filterDynamicRoutes(routes as any)
        expect(res.length).toBe(0)
            ; (global as any).__permMock = undefined
    })
})