// jsdom already provides window & localStorage; ensure silent failures if accessed early
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false
    })
})

// ---- Element Plus 全局桩（最小渲染，避免模板作用域报错） ----
import { vi } from 'vitest'
import * as vue from 'vue'

function registerElStubs(app: any) {
    const h = vue.h
    const passthrough = (tag: string) => ({
        render() { return h(tag as any, this.$attrs as any, (this as any).$slots?.default?.()) }
    })
    // 常用组件直通渲染
    // el-button：处理 disabled 属性的布尔行为（false 时不渲染该属性）
    app.component('el-button', {
        props: ['disabled','size','type','icon','link'],
        setup(props: any, { slots, attrs }: any) {
            return () => {
                const a: Record<string, any> = { ...attrs }
                if (props.size) a.size = props.size
                if (props.disabled === true || props.disabled === 'true' || props.disabled === '') {
                    a.disabled = 'disabled' // 让 getAttribute('disabled') 为 truthy
                } else {
                    // 确保未禁用时不输出 disabled 属性
                    if ('disabled' in a) delete a.disabled
                }
                return h('el-button' as any, a, slots?.default?.())
            }
        }
    })
    const tags = ['el-card','el-tag','el-progress','el-link','el-descriptions','el-descriptions-item','el-radio-group','el-radio-button','el-statistic','el-col','el-row','el-alert','el-checkbox','el-checkbox-group','dict-tag']
    tags.forEach(t => app.component(t, passthrough(t)))
    // 表格/列：列默认调用默认插槽并传入最小 scope，避免 scope.row 为空
    app.component('el-table', passthrough('el-table'))
    app.component('el-table-column', {
        props: ['label','prop','width','type','align'],
        setup(_props: any, { slots }: any) {
            return () => h('el-table-column' as any, {}, slots?.default ? slots.default({ row: {}, column: {} }) : null)
        }
    })
    // loading 指令桩
    app.directive('loading', { mounted() {}, updated() {} })
    return app
}

// 通过 mock vue 的 createApp，在测试中自动注册以上桩件
vi.mock('vue', async () => {
    const actual: any = await vi.importActual('vue')
    const createAppPatched = (...args: any[]) => registerElStubs(actual.createApp(...args))
    return { ...actual, createApp: createAppPatched }
})

// 避免单测中解析到真实布局（目录导入 Sidebar 在 vitest 下可能无法解析）
vi.mock('src/layout/index.vue', () => ({ default: { render() { return null } } }))

// Provide global defineStore/storeToRefs stub if auto-import plugin didn't inject during vitest transform
if (!(globalThis as any).defineStore) {
    (globalThis as any).defineStore = (_id: string, options: any) => () => options
}
if (!(globalThis as any).storeToRefs) {
    (globalThis as any).storeToRefs = (store: any) => store
}
