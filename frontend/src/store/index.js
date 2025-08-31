import { createPinia } from 'pinia'

const store = createPinia()

// 开发模式下暴露 store 实例引用与各 store 访问（便于调试）
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    store.use(({ store }) => {
        const root = window
        const key = `__store_${store.$id}`
        root[key] = store
        if (!root.__piniaStores) root.__piniaStores = {}
        root.__piniaStores[store.$id] = store
    })
    window.__pinia = store
}

export default store