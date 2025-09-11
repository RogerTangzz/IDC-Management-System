import { describe, it, expect, vi } from 'vitest'

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
        hasPermiOr: () => false,
        hasRoleOr: () => false
    }
}))

import { loadView } from '@/store/modules/permission.ts'

describe('loadView', () => {
    it('returns undefined for non-existing view', () => {
        const r = loadView('non/exist/path')
        expect(r).toBeUndefined()
    })
})